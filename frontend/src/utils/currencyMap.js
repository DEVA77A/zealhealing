export const countryCurrencyMap = {
  US: { currency: 'USD', symbol: '$' },
  GB: { currency: 'GBP', symbol: '£' },
  IN: { currency: 'INR', symbol: '₹' },
  AE: { currency: 'AED', symbol: 'د.إ' },
  JP: { currency: 'JPY', symbol: '¥' },
  AU: { currency: 'AUD', symbol: 'A$' },
  CA: { currency: 'CAD', symbol: 'C$' },
  SG: { currency: 'SGD', symbol: 'S$' },
  NZ: { currency: 'NZD', symbol: 'NZ$' },
  CH: { currency: 'CHF', symbol: 'CHF' },
  CN: { currency: 'CNY', symbol: '¥' },
  ZA: { currency: 'ZAR', symbol: 'R' },
  // Eurozone countries
  AT: { currency: 'EUR', symbol: '€' },
  BE: { currency: 'EUR', symbol: '€' },
  CY: { currency: 'EUR', symbol: '€' },
  EE: { currency: 'EUR', symbol: '€' },
  FI: { currency: 'EUR', symbol: '€' },
  FR: { currency: 'EUR', symbol: '€' },
  DE: { currency: 'EUR', symbol: '€' },
  GR: { currency: 'EUR', symbol: '€' },
  IE: { currency: 'EUR', symbol: '€' },
  IT: { currency: 'EUR', symbol: '€' },
  LV: { currency: 'EUR', symbol: '€' },
  LT: { currency: 'EUR', symbol: '€' },
  LU: { currency: 'EUR', symbol: '€' },
  MT: { currency: 'EUR', symbol: '€' },
  NL: { currency: 'EUR', symbol: '€' },
  PT: { currency: 'EUR', symbol: '€' },
  SK: { currency: 'EUR', symbol: '€' },
  SI: { currency: 'EUR', symbol: '€' },
  ES: { currency: 'EUR', symbol: '€' },
};

/**
 * Returns the currency and symbol for a given 2-letter ISO country code.
 * Falls back to local formatting if not hardcoded.
 */
export const getCurrencyByCountryCode = (countryCode) => {
  if (!countryCode) return { currency: 'INR', symbol: '₹' };
  
  const upperCode = countryCode.toUpperCase();
  if (countryCurrencyMap[upperCode]) {
    return countryCurrencyMap[upperCode];
  }

  // Fallback: This is not perfect for every country, but works for many ISO codes.
  // In a full production app, you might use a complete library like 'country-to-currency'
  return { currency: 'USD', symbol: '$' }; // Defaulting to USD for unknown countries
};
