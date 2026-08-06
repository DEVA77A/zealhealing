const countries = require('../data/countries.json');

/**
 * Server-side country -> currency resolution.
 *
 * Backed by data/countries.json (250 ISO-3166-1 alpha-2 entries), which is a
 * byte-identical copy of frontend/src/data/countries.json so both tiers agree
 * on every country, currency code and symbol.
 *
 * If you update one file, update the other.
 */

/** Fallback whenever a country cannot be resolved. INR is the base currency. */
const DEFAULT_LOCATION = Object.freeze({
  country: 'India',
  countryCode: 'IN',
  currency: 'INR',
  currencySymbol: '\u20B9',
  timezone: 'Asia/Kolkata',
});

/** Disambiguated symbols for currencies that otherwise collide on "$". */
const AMBIGUOUS_SYMBOL_OVERRIDES = {
  AUD: 'A$',
  CAD: 'C$',
  SGD: 'S$',
  NZD: 'NZ$',
  HKD: 'HK$',
  TWD: 'NT$',
  BRL: 'R$',
  CNY: 'CN\u00A5',
  MXN: 'MX$',
  ARS: 'AR$',
  COP: 'CO$',
  CLP: 'CL$',
  UYU: '$U',
};

const byCode = new Map();
const byName = new Map();
const byCurrency = new Map();

for (const entry of countries) {
  if (!entry || !entry.code) continue;
  const record = {
    country: entry.country,
    countryCode: String(entry.code).toUpperCase(),
    currency: String(entry.currency || DEFAULT_LOCATION.currency).toUpperCase(),
    currencySymbol: entry.symbol || entry.currency,
  };
  byCode.set(record.countryCode, record);
  byName.set(String(record.country).trim().toLowerCase(), record);
  if (!byCurrency.has(record.currency)) byCurrency.set(record.currency, record);
}

/** Preferred display symbol for a currency code. */
const getCurrencySymbol = (currency, fallbackSymbol) => {
  if (!currency) return fallbackSymbol || DEFAULT_LOCATION.currencySymbol;
  const code = String(currency).toUpperCase();

  if (AMBIGUOUS_SYMBOL_OVERRIDES[code]) return AMBIGUOUS_SYMBOL_OVERRIDES[code];
  if (fallbackSymbol) return fallbackSymbol;

  const record = byCurrency.get(code);
  if (record && record.currencySymbol) return record.currencySymbol;

  try {
    const parts = new Intl.NumberFormat('en', {
      style: 'currency',
      currency: code,
      currencyDisplay: 'narrowSymbol',
    }).formatToParts(0);
    const symbolPart = parts.find((p) => p.type === 'currency');
    if (symbolPart && symbolPart.value) return symbolPart.value;
  } catch (error) {
    /* unknown code - fall through to the code itself */
  }

  return code;
};

/**
 * Strict lookup of an ISO-3166-1 alpha-2 code.
 * @returns {{country, countryCode, currency, currencySymbol}|null} null on miss
 */
const lookupCountry = (countryCode) => {
  const record = countryCode && byCode.get(String(countryCode).trim().toUpperCase());
  if (!record) return null;
  return {
    country: record.country,
    countryCode: record.countryCode,
    currency: record.currency,
    currencySymbol: getCurrencySymbol(record.currency, record.currencySymbol),
  };
};

/**
 * Resolve an ISO-3166-1 alpha-2 code, defaulting to India on a miss.
 * Use lookupCountry() when you need to distinguish a miss from a real result.
 *
 * @returns {{country, countryCode, currency, currencySymbol}} never null
 */
const getCountryByCode = (countryCode) => {
  const record = lookupCountry(countryCode);
  if (record) return record;
  const { timezone, ...rest } = DEFAULT_LOCATION;
  return { ...rest };
};

/** Resolve by display name (used for reverse-geocode payloads). */
const getCountryByName = (countryName) => {
  const record = countryName && byName.get(String(countryName).trim().toLowerCase());
  if (!record) {
    const { timezone, ...rest } = DEFAULT_LOCATION;
    return { ...rest };
  }
  return {
    country: record.country,
    countryCode: record.countryCode,
    currency: record.currency,
    currencySymbol: getCurrencySymbol(record.currency, record.currencySymbol),
  };
};

/** True when the location is domestic (India), where GST applies. */
const isDomestic = (countryCode, currency) =>
  String(countryCode || '').toUpperCase() === 'IN' ||
  String(currency || '').toUpperCase() === 'INR';

module.exports = {
  DEFAULT_LOCATION,
  SUPPORTED_COUNTRY_COUNT: byCode.size,
  lookupCountry,
  getCountryByCode,
  getCountryByName,
  getCurrencySymbol,
  isDomestic,
};
