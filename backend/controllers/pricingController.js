const { detectLocation } = require('../services/locationService');
const { getExchangeRate, convertPrice } = require('../services/currencyService');
const { basePrices, GST_RATE_INDIA } = require('../config/pricingConfig');

// @desc    Detect user location based on IP
// @route   GET /api/pricing/detect
// @access  Public
const detectUserLocation = async (req, res) => {
  try {
    const ip = req.headers['x-forwarded-for']?.split(',')[0] || req.socket.remoteAddress;
    const locationData = await detectLocation(ip);
    res.json(locationData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get prices with India/Abroad distinction
// @route   GET /api/pricing/convert
// @access  Public
const convertPrices = async (req, res) => {
  try {
    let { currency, country, symbol } = req.query;

    if (!currency) {
      const ip = req.headers['x-forwarded-for']?.split(',')[0] || req.socket.remoteAddress;
      const locationData = await detectLocation(ip);
      currency = locationData.currency;
      country = locationData.country;
      symbol = locationData.currencySymbol;
    }

    const isIndia = currency === 'INR' || (country && country.toLowerCase() === 'india');
    const countryCategory = isIndia ? 'india' : 'abroad';
    const priceSet = basePrices[countryCategory];

    if (isIndia) {
      return res.json({
        country: country || 'India',
        currency: 'INR',
        symbol: '₹',
        countryCategory,
        gstRate: GST_RATE_INDIA,
        prices: priceSet,
        exchangeRate: 1
      });
    }

    // For abroad, prices are already in INR (flat rate, no GST)
    const rate = await getExchangeRate(currency);

    if (!rate) {
      return res.json({
        country: country || 'Unknown',
        currency: 'INR',
        symbol: '₹',
        countryCategory,
        gstRate: 0,
        prices: priceSet,
        exchangeRate: 1,
        fallback: true
      });
    }

    // Convert abroad prices to local currency
    const convertedPrices = { voice: {}, video: {} };
    for (const type of ['voice', 'video']) {
      for (const [duration, price] of Object.entries(priceSet[type])) {
        convertedPrices[type][duration] = convertPrice(price, currency, rate);
      }
    }

    res.json({
      country: country || 'Unknown',
      currency: currency,
      symbol: symbol || currency,
      countryCategory,
      gstRate: 0,
      exchangeRate: rate,
      prices: convertedPrices,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { detectUserLocation, convertPrices };
