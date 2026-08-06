/**
 * DEPRECATED shim - kept so existing imports keep working.
 *
 * This module used to hold a hand-maintained 32-country table that defaulted
 * every unknown country to USD. It now delegates to utils/countryCurrency.js,
 * which is backed by all 250 ISO-3166 countries in src/data/countries.json.
 *
 * Prefer importing from './countryCurrency' in new code.
 */
import countries from '../data/countries.json';
import {
  getCurrencyByCountryCode as resolveCurrency,
  getCurrencySymbol,
} from './countryCurrency';

/**
 * Legacy export: code -> { currency, symbol } for every country, not just 32.
 */
export const countryCurrencyMap = countries.reduce((acc, entry) => {
  if (!entry || !entry.code) return acc;
  const currency = String(entry.currency || 'INR').toUpperCase();
  acc[String(entry.code).toUpperCase()] = {
    currency,
    symbol: getCurrencySymbol(currency, entry.symbol),
  };
  return acc;
}, {});

/**
 * Returns the currency and symbol for a 2-letter ISO country code.
 * Unknown codes now fall back to INR (the base currency) rather than USD.
 */
export const getCurrencyByCountryCode = resolveCurrency;

export default { countryCurrencyMap, getCurrencyByCountryCode };
