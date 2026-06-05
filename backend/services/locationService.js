const axios = require('axios');

/**
 * Detects user location and currency based on IP address
 * Uses ipapi.co (Free tier: 30k requests/month, no key required for basic)
 */
const detectLocation = async (ip) => {
  try {
    // If localhost or local network, default to India
    if (!ip || ip === '::1' || ip === '127.0.0.1' || ip.startsWith('192.168.')) {
      return {
        country: 'India',
        countryCode: 'IN',
        currency: 'INR',
        currencySymbol: '₹',
        timezone: 'Asia/Kolkata',
      };
    }

    const response = await axios.get(`https://ipapi.co/${ip}/json/`, { timeout: 5000 });
    const data = response.data;

    // Handle API errors or unknown IPs
    if (data.error || !data.country_name) {
      throw new Error(data.reason || 'Failed to detect location');
    }

    // Determine a fallback symbol if the API doesn't provide one (ipapi does provide currency, but we should safely default symbol)
    // Actually, ipapi.co doesn't provide currency_symbol directly by default, so we might need a small mapping or Intl API
    const currency = data.currency || 'INR';
    
    // Using Intl to get symbol
    const getSymbol = (curr) => {
      try {
        return (0).toLocaleString('en-US', { style: 'currency', currency: curr, maximumFractionDigits: 0 }).replace(/\d/g, '').trim();
      } catch (e) {
        return curr;
      }
    };

    return {
      country: data.country_name,
      countryCode: data.country_code,
      currency: currency,
      currencySymbol: getSymbol(currency),
      timezone: data.timezone,
    };
  } catch (error) {
    console.error('Location detection error:', error.message);
    // Fallback to India if any error occurs
    return {
      country: 'India',
      countryCode: 'IN',
      currency: 'INR',
      currencySymbol: '₹',
      timezone: 'Asia/Kolkata',
    };
  }
};

module.exports = { detectLocation };
