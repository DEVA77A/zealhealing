const { detectLocation } = require('../services/locationService');
const { getExchangeRate, convertPrice } = require('../services/currencyService');
const { basePrices } = require('../config/pricingConfig');

// @desc    Detect user location based on IP
// @route   GET /api/pricing/detect
// @access  Public
const detectUserLocation = async (req, res) => {
  try {
    // Read IP from headers (behind proxy) or connection
    const ip = req.headers['x-forwarded-for']?.split(',')[0] || req.socket.remoteAddress;
    const locationData = await detectLocation(ip);
    res.json(locationData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Convert prices to target currency
// @route   GET /api/pricing/convert
// @access  Public
const convertPrices = async (req, res) => {
  try {
    // If currency is passed in query, use it. Otherwise, detect from IP.
    let { currency, country, symbol } = req.query;

    if (!currency) {
      const ip = req.headers['x-forwarded-for']?.split(',')[0] || req.socket.remoteAddress;
      const locationData = await detectLocation(ip);
      currency = locationData.currency;
      country = locationData.country;
      symbol = locationData.currencySymbol;
    }

    if (currency === 'INR') {
      return res.json({
        country: country || 'India',
        currency: 'INR',
        symbol: '₹',
        prices: basePrices,
        exchangeRate: 1
      });
    }

    const rate = await getExchangeRate(currency);

    if (!rate) {
      // Fallback to INR if exchange API fails
      return res.json({
        country: country || 'India',
        currency: 'INR',
        symbol: '₹',
        prices: basePrices,
        exchangeRate: 1,
        fallback: true
      });
    }

    // Convert prices
    const convertedPrices = {
      voice: {},
      video: {},
    };

    for (const type of ['voice', 'video']) {
      for (const [duration, price] of Object.entries(basePrices[type])) {
        convertedPrices[type][duration] = convertPrice(price, currency, rate);
      }
    }

    res.json({
      country: country || 'Unknown',
      currency: currency,
      symbol: symbol || currency,
      exchangeRate: rate,
      prices: convertedPrices,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { detectUserLocation, convertPrices };
