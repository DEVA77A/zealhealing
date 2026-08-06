/**
 * Worldwide country -> currency mapping and shared money formatting.
 *
 * Source of truth is src/data/countries.json (250 ISO-3166-1 alpha-2 entries,
 * 154 distinct ISO-4217 currencies) so every country on earth is supported
 * without hardcoding a short list.
 *
 * IMPORTANT: display-only. Base prices always remain INR in MongoDB.
 */
import countries from '../data/countries.json';

/** Default used whenever a country cannot be resolved. Base currency is INR. */
export const DEFAULT_LOCATION = {
  country: 'India',
  code: 'IN',
  currency: 'INR',
  symbol: '\u20B9',
};

/** ISO-4217 currencies that have no minor unit, so they never show decimals. */
export const ZERO_DECIMAL_CURRENCIES = new Set([
  'BIF', 'CLP', 'DJF', 'GNF', 'ISK', 'JPY', 'KMF', 'KRW', 'PYG',
  'RWF', 'UGX', 'UYI', 'VND', 'VUV', 'XAF', 'XOF', 'XPF',
]);

/**
 * Currencies where the raw symbol is ambiguous (many countries share "$").
 * Showing a disambiguated token avoids implying US dollars.
 */
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

// ---------------------------------------------------------------------------
// Lookup indexes (built once at module load)
// ---------------------------------------------------------------------------

const byCode = new Map();
const byName = new Map();
const byCurrency = new Map();

for (const entry of countries) {
  if (!entry || !entry.code) continue;
  const record = {
    country: entry.country,
    code: String(entry.code).toUpperCase(),
    currency: String(entry.currency || DEFAULT_LOCATION.currency).toUpperCase(),
    symbol: entry.symbol || entry.currency,
  };
  byCode.set(record.code, record);
  byName.set(String(record.country).trim().toLowerCase(), record);
  // First country wins as the representative for a shared currency (e.g. EUR).
  if (!byCurrency.has(record.currency)) byCurrency.set(record.currency, record);
}

/** Full country list, alphabetical. Safe to feed straight into CountrySelector. */
export const countriesList = countries;

/** Total supported countries. Exposed mainly for diagnostics/tests. */
export const SUPPORTED_COUNTRY_COUNT = byCode.size;

// ---------------------------------------------------------------------------
// Resolvers
// ---------------------------------------------------------------------------

/**
 * Preferred display symbol for a currency.
 * Uses Intl narrowSymbol when available, then our override table, then the
 * raw symbol from countries.json, then the currency code itself.
 */
export const getCurrencySymbol = (currency, fallbackSymbol) => {
  if (!currency) return fallbackSymbol || DEFAULT_LOCATION.symbol;
  const code = String(currency).toUpperCase();

  if (AMBIGUOUS_SYMBOL_OVERRIDES[code]) return AMBIGUOUS_SYMBOL_OVERRIDES[code];
  if (fallbackSymbol) return fallbackSymbol;

  const record = byCurrency.get(code);
  if (record && record.symbol) return record.symbol;

  try {
    const parts = new Intl.NumberFormat('en', {
      style: 'currency',
      currency: code,
      currencyDisplay: 'narrowSymbol',
    }).formatToParts(0);
    const symbolPart = parts.find((p) => p.type === 'currency');
    if (symbolPart && symbolPart.value) return symbolPart.value;
  } catch {
    /* unknown currency code - fall through */
  }

  return code;
};

/**
 * Resolve an ISO-3166-1 alpha-2 country code to its country + currency.
 * Covers all 250 entries; falls back to India/INR (never USD) so behaviour
 * matches the documented default.
 */
export const getCountryByCode = (countryCode) => {
  if (!countryCode) return { ...DEFAULT_LOCATION };
  const record = byCode.get(String(countryCode).trim().toUpperCase());
  if (!record) return { ...DEFAULT_LOCATION };
  return {
    country: record.country,
    code: record.code,
    currency: record.currency,
    symbol: getCurrencySymbol(record.currency, record.symbol),
  };
};

/** Resolve a country by display name (used for reverse-geocode results). */
export const getCountryByName = (countryName) => {
  if (!countryName) return { ...DEFAULT_LOCATION };
  const record = byName.get(String(countryName).trim().toLowerCase());
  if (!record) return { ...DEFAULT_LOCATION };
  return {
    country: record.country,
    code: record.code,
    currency: record.currency,
    symbol: getCurrencySymbol(record.currency, record.symbol),
  };
};

/**
 * Backward-compatible shim for the original utils/currencyMap.js helper.
 * Same signature and return shape, but now backed by all 250 countries
 * instead of the previous 32-entry table.
 */
export const getCurrencyByCountryCode = (countryCode) => {
  const { currency, symbol } = getCountryByCode(countryCode);
  return { currency, symbol };
};

/** True when the country should be treated as domestic (GST applies). */
export const isDomestic = (countryCode, currency) =>
  String(countryCode || '').toUpperCase() === 'IN' ||
  String(currency || '').toUpperCase() === 'INR';

// ---------------------------------------------------------------------------
// Money formatting
// ---------------------------------------------------------------------------

/** Decimal places to show for a given currency. */
export const getCurrencyDecimals = (currency) =>
  ZERO_DECIMAL_CURRENCIES.has(String(currency || '').toUpperCase()) ? 0 : 2;

/**
 * Round an amount to a currency's own precision.
 *
 * Keeps derived figures (tax, totals) internally consistent: no decimals for
 * JPY/KRW/VND, two for USD/EUR, whole units for INR. Without this a total can
 * disagree with the sum of the lines shown above it.
 */
export const roundToCurrency = (amount, currency) => {
  const value = Number(amount);
  if (!Number.isFinite(value)) return 0;
  const code = String(currency || 'INR').toUpperCase();
  const places = code === 'INR' ? 0 : getCurrencyDecimals(code);
  const factor = 10 ** places;
  return Math.round(value * factor) / factor;
};

/**
 * Format an already-converted amount for display.
 *
 * INR renders with no decimals (matching the existing UI, e.g. "₹4,000"),
 * foreign currencies render with their natural precision (e.g. "$46.83",
 * "¥6,800"). Grouping separators are always applied.
 *
 * @param {number} amount    value already in `currency`
 * @param {object} options
 * @param {string} options.currency  ISO-4217 code
 * @param {string} options.symbol    preferred symbol (falls back to lookup)
 * @param {number} options.decimals  override decimal places
 */
export const formatMoney = (amount, { currency = 'INR', symbol, decimals } = {}) => {
  const value = Number(amount);
  if (!Number.isFinite(value)) return '';

  const code = String(currency).toUpperCase();
  const display = symbol || getCurrencySymbol(code);

  // INR keeps the existing whole-rupee presentation used across the app.
  const places =
    typeof decimals === 'number'
      ? decimals
      : code === 'INR'
        ? 0
        : getCurrencyDecimals(code);

  const formatted = value.toLocaleString(undefined, {
    minimumFractionDigits: places,
    maximumFractionDigits: places,
  });

  // Separate multi-character/alphabetic tokens (AED, CHF) from the number.
  const needsSpace = /[A-Za-z]$/.test(display);
  return `${display}${needsSpace ? '\u00A0' : ''}${formatted}`;
};

export default {
  countriesList,
  DEFAULT_LOCATION,
  SUPPORTED_COUNTRY_COUNT,
  getCountryByCode,
  getCountryByName,
  getCurrencyByCountryCode,
  getCurrencySymbol,
  getCurrencyDecimals,
  roundToCurrency,
  isDomestic,
  formatMoney,
};
