const axios = require('axios');
const NodeCache = require('node-cache');

// Cache exchange rates for 12 hours (43200 seconds)
const rateCache = new NodeCache({ stdTTL: 43200 });

/**
 * Gets the live exchange rate for INR to the target currency.
 * Caches the results to prevent hitting API limits.
 */
const getExchangeRate = async (targetCurrency) => {
  if (targetCurrency === 'INR') return 1;

  // Check cache first
  const cacheKey = `rates_INR`;
  let rates = rateCache.get(cacheKey);

  if (!rates) {
    try {
      // Use open.er-api.com for free daily rates against INR
      const response = await axios.get('https://open.er-api.com/v6/latest/INR', { timeout: 5000 });
      if (response.data && response.data.rates) {
        rates = response.data.rates;
        rateCache.set(cacheKey, rates);
      } else {
        throw new Error('Invalid response from exchange API');
      }
    } catch (error) {
      console.error('Exchange rate error:', error.message);
      // Try to serve stale data if possible (node-cache doesn't do this automatically, but we might have a global fallback if needed)
      // If no rates available, return 0 or throw
      return null;
    }
  }

  return rates ? rates[targetCurrency] || null : null;
};

/**
 * Converts INR amount to target currency with business-friendly rounding.
 */
const convertPrice = (baseInrAmount, targetCurrency, rate) => {
  if (targetCurrency === 'INR') return baseInrAmount;
  if (!rate) return baseInrAmount; // Fallback

  const converted = baseInrAmount * rate;

  // Clean rounding logic
  if (targetCurrency === 'JPY' || targetCurrency === 'KRW') {
    // Round to nearest 100
    return Math.round(converted / 100) * 100;
  } else if (['IDR', 'VND'].includes(targetCurrency)) {
    // Round to nearest 1000
    return Math.round(converted / 1000) * 1000;
  } else {
    // Round to nearest whole number for USD, EUR, GBP, CAD, etc.
    return Math.round(converted);
  }
};

module.exports = { getExchangeRate, convertPrice };
