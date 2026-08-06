const { detectLocation, reverseGeocode } = require('../services/locationService');
const { getRateInfo, convertPrice } = require('../services/currencyService');
const { basePrices, GST_RATE } = require('../config/pricingConfig');
const { getCountryByCode, isDomestic } = require('../config/countryCurrency');
const ClassModel = require('../models/Class');

/**
 * Pricing endpoints.
 *
 * Contract: MongoDB stores prices in INR only. Every foreign figure returned
 * here is computed on the fly from those INR values at the current live rate,
 * and is never written back to the database.
 */

const clientIp = (req) =>
  (req.headers['x-forwarded-for'] || '').split(',')[0].trim() ||
  req.socket.remoteAddress;

/**
 * Build the {voice:{15..60}, video:{15..60}} INR matrix from the Class
 * collection so admin price edits propagate globally with no code change.
 * Falls back to config/pricingConfig.js when no classes exist yet.
 */
const getBaseInrMatrix = async () => {
  try {
    const classes = await ClassModel.find({ status: 'Active' })
      .select('type duration price')
      .lean();

    if (classes && classes.length) {
      const matrix = { voice: {}, video: {} };
      for (const cls of classes) {
        if (!matrix[cls.type]) continue;
        const existing = matrix[cls.type][cls.duration];
        // Lowest active price per tier wins, so the "from" price is truthful.
        if (existing === undefined || cls.price < existing) {
          matrix[cls.type][cls.duration] = cls.price;
        }
      }
      if (Object.keys(matrix.voice).length || Object.keys(matrix.video).length) {
        return { matrix, source: 'database' };
      }
    }
  } catch (error) {
    console.error('Failed to read class prices, using config fallback:', error.message);
  }

  return { matrix: basePrices.india, source: 'config' };
};

/**
 * Resolve the caller's target currency from explicit query params, falling
 * back to IP detection when none were supplied.
 */
const resolveTarget = async (req) => {
  const { currency, country, symbol, countryCode } = req.query;

  if (currency) {
    const resolved = countryCode ? getCountryByCode(countryCode) : null;
    return {
      country: country || (resolved && resolved.country) || 'Unknown',
      countryCode: (resolved && resolved.countryCode) || countryCode || null,
      currency: String(currency).toUpperCase(),
      symbol: symbol || (resolved && resolved.currencySymbol) || String(currency).toUpperCase(),
    };
  }

  const detected = await detectLocation(clientIp(req));
  return {
    country: detected.country,
    countryCode: detected.countryCode,
    currency: detected.currency,
    symbol: detected.currencySymbol,
  };
};

// ---------------------------------------------------------------------------
// GET /api/pricing/detect  (public)
// ---------------------------------------------------------------------------

/**
 * @desc    Detect location from the caller's IP
 * @route   GET /api/pricing/detect
 * @access  Public
 */
const detectUserLocation = async (req, res) => {
  try {
    res.json(await detectLocation(clientIp(req)));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ---------------------------------------------------------------------------
// GET /api/pricing/reverse-geocode  (public)
// ---------------------------------------------------------------------------

/**
 * @desc    Resolve browser Geolocation coordinates to country + currency
 * @route   GET /api/pricing/reverse-geocode?lat=&lon=&timezone=
 * @access  Public
 */
const reverseGeocodeLocation = async (req, res) => {
  try {
    const { lat, lon, latitude, longitude, timezone } = req.query;
    const location = await reverseGeocode(
      lat !== undefined ? lat : latitude,
      lon !== undefined ? lon : longitude,
      timezone
    );

    const { rate, stale } = await getRateInfo(location.currency);
    res.json({
      ...location,
      exchangeRate: rate || 1,
      rateStale: Boolean(stale),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ---------------------------------------------------------------------------
// GET /api/pricing/convert  (public)
// ---------------------------------------------------------------------------

/**
 * @desc    Session price matrix converted into the caller's currency
 * @route   GET /api/pricing/convert?currency=&country=&symbol=&countryCode=
 * @access  Public
 *
 * Response shape is unchanged from the previous implementation so existing
 * frontend consumers keep working:
 *   { country, currency, symbol, countryCategory, gstRate, exchangeRate,
 *     prices: { voice: {...}, video: {...} } }
 */
const convertPrices = async (req, res) => {
  try {
    const target = await resolveTarget(req);
    const { matrix: baseMatrix, source } = await getBaseInrMatrix();

    const domestic = isDomestic(target.countryCode, target.currency);
    const countryCategory = domestic ? 'india' : 'abroad';

    // Domestic: serve the stored INR figures untouched, GST applies.
    if (domestic) {
      return res.json({
        country: target.country === 'Unknown' ? 'India' : target.country,
        countryCode: target.countryCode || 'IN',
        currency: 'INR',
        symbol: '\u20B9',
        countryCategory,
        gstRate: GST_RATE,
        exchangeRate: 1,
        prices: baseMatrix,
        baseCurrency: 'INR',
        basePrices: baseMatrix,
        priceSource: source,
      });
    }

    // Foreign: convert the SAME base INR figures at the live rate.
    const { rate, stale, fetchedAt } = await getRateInfo(target.currency);

    if (!rate) {
      // No rate and no cached rate: fail safe by quoting INR explicitly
      // rather than showing a foreign symbol against unconverted numbers.
      return res.json({
        country: target.country,
        countryCode: target.countryCode,
        currency: 'INR',
        symbol: '\u20B9',
        countryCategory,
        gstRate: GST_RATE,
        exchangeRate: 1,
        prices: baseMatrix,
        baseCurrency: 'INR',
        basePrices: baseMatrix,
        priceSource: source,
        fallback: true,
      });
    }

    const converted = { voice: {}, video: {} };
    for (const type of ['voice', 'video']) {
      for (const [duration, price] of Object.entries(baseMatrix[type] || {})) {
        converted[type][duration] = convertPrice(price, target.currency, rate);
      }
    }

    res.json({
      country: target.country,
      countryCode: target.countryCode,
      currency: target.currency,
      symbol: target.symbol,
      countryCategory,
      // GST applies internationally too, at the same rate.
      gstRate: GST_RATE,
      exchangeRate: rate,
      prices: converted,
      baseCurrency: 'INR',
      basePrices: baseMatrix,
      priceSource: source,
      rateStale: Boolean(stale),
      rateFetchedAt: fetchedAt || null,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ---------------------------------------------------------------------------
// GET /api/pricing/quote  (public)
// ---------------------------------------------------------------------------

/**
 * @desc    Convert an arbitrary base INR amount (for custom class prices)
 * @route   GET /api/pricing/quote?amount=&currency=
 * @access  Public
 */
const quoteAmount = async (req, res) => {
  try {
    const amount = Number(req.query.amount);
    if (!Number.isFinite(amount) || amount < 0) {
      return res.status(400).json({ message: 'A valid non-negative amount is required' });
    }

    const target = await resolveTarget(req);
    if (isDomestic(target.countryCode, target.currency)) {
      return res.json({
        baseINRAmount: amount,
        currency: 'INR',
        symbol: '\u20B9',
        exchangeRate: 1,
        convertedAmount: amount,
      });
    }

    const { rate, stale } = await getRateInfo(target.currency);
    res.json({
      baseINRAmount: amount,
      currency: rate ? target.currency : 'INR',
      symbol: rate ? target.symbol : '\u20B9',
      exchangeRate: rate || 1,
      convertedAmount: rate ? convertPrice(amount, target.currency, rate) : amount,
      rateStale: Boolean(stale),
      fallback: !rate,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  detectUserLocation,
  reverseGeocodeLocation,
  convertPrices,
  quoteAmount,
};
