const axios = require('axios');
const fs = require('fs');
const path = require('path');
const NodeCache = require('node-cache');

/**
 * Live INR -> * exchange rates with a two-tier cache.
 *
 *  Tier 1 (fresh):  NodeCache, 12h TTL. Normal serving path.
 *  Tier 2 (stale):  last-known-good snapshot that NEVER expires, mirrored to
 *                   disk so it survives a server restart.
 *
 * The spec requires that a failing exchange API falls back to a cached rate
 * rather than silently reverting prices to INR, so tier 2 is the safety net.
 *
 * Base currency is always INR - the single source of truth for stored prices.
 */

const RATES_URL = 'https://open.er-api.com/v6/latest/INR';
const CACHE_KEY = 'rates_INR';
const FRESH_TTL_SECONDS = 12 * 60 * 60; // 12 hours
const CACHE_DIR = path.join(__dirname, '..', '.cache');
const CACHE_FILE = path.join(CACHE_DIR, 'exchange-rates.json');

const rateCache = new NodeCache({ stdTTL: FRESH_TTL_SECONDS });

/** Tier 2: never-expiring last known good snapshot. */
let lastGood = { rates: null, fetchedAt: null };

/** De-dupes concurrent refreshes so a burst of requests makes one API call. */
let inFlight = null;

/**
 * ISO-4217 currencies with no minor unit - these never display decimals.
 * Mirrors ZERO_DECIMAL_CURRENCIES in frontend/src/utils/countryCurrency.js.
 */
const ZERO_DECIMAL_CURRENCIES = new Set([
  'BIF', 'CLP', 'DJF', 'GNF', 'ISK', 'JPY', 'KMF', 'KRW', 'PYG',
  'RWF', 'UGX', 'UYI', 'VND', 'VUV', 'XAF', 'XOF', 'XPF',
]);

// ---------------------------------------------------------------------------
// Disk persistence for the stale tier
// ---------------------------------------------------------------------------

const loadFromDisk = () => {
  try {
    if (!fs.existsSync(CACHE_FILE)) return;
    const parsed = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf8'));
    if (parsed && parsed.rates && typeof parsed.rates === 'object') {
      lastGood = { rates: parsed.rates, fetchedAt: parsed.fetchedAt || null };
    }
  } catch (error) {
    console.error('Rate cache read failed:', error.message);
  }
};

const saveToDisk = (snapshot) => {
  try {
    if (!fs.existsSync(CACHE_DIR)) fs.mkdirSync(CACHE_DIR, { recursive: true });
    fs.writeFileSync(CACHE_FILE, JSON.stringify(snapshot), 'utf8');
  } catch (error) {
    // Non-fatal: we still have the in-memory copy.
    console.error('Rate cache write failed:', error.message);
  }
};

// Warm the stale tier at boot so a cold start with a dead API still converts.
loadFromDisk();

// ---------------------------------------------------------------------------
// Fetching
// ---------------------------------------------------------------------------

const fetchRates = async () => {
  const response = await axios.get(RATES_URL, { timeout: 5000 });
  const rates = response.data && response.data.rates;
  if (!rates || typeof rates !== 'object') {
    throw new Error('Invalid response from exchange rate API');
  }
  return rates;
};

/**
 * Resolve the full rates map, preferring fresh -> stale.
 * @returns {Promise<{rates: object|null, stale: boolean, fetchedAt: string|null}>}
 */
const getRates = async () => {
  const cached = rateCache.get(CACHE_KEY);
  if (cached) {
    return { rates: cached, stale: false, fetchedAt: lastGood.fetchedAt };
  }

  if (!inFlight) {
    inFlight = fetchRates()
      .then((rates) => {
        const fetchedAt = new Date().toISOString();
        rateCache.set(CACHE_KEY, rates);
        lastGood = { rates, fetchedAt };
        saveToDisk(lastGood);
        return rates;
      })
      .catch((error) => {
        console.error('Exchange rate fetch failed:', error.message);
        return null;
      })
      .finally(() => {
        inFlight = null;
      });
  }

  const fresh = await inFlight;
  if (fresh) return { rates: fresh, stale: false, fetchedAt: lastGood.fetchedAt };

  // API is down - serve the last known good snapshot rather than dropping to INR.
  if (lastGood.rates) {
    console.warn('Serving stale exchange rates from', lastGood.fetchedAt);
    return { rates: lastGood.rates, stale: true, fetchedAt: lastGood.fetchedAt };
  }

  return { rates: null, stale: false, fetchedAt: null };
};

/**
 * Live rate for INR -> targetCurrency.
 * Signature preserved from the original implementation: resolves to a Number,
 * or null when the currency is unknown and no cache is available.
 *
 * @param {string} targetCurrency ISO-4217 code
 * @returns {Promise<number|null>}
 */
const getExchangeRate = async (targetCurrency) => {
  if (!targetCurrency) return null;
  const code = String(targetCurrency).toUpperCase();
  if (code === 'INR') return 1;

  const { rates } = await getRates();
  if (!rates) return null;

  const rate = rates[code];
  return typeof rate === 'number' && Number.isFinite(rate) && rate > 0 ? rate : null;
};

/**
 * Rate plus provenance metadata, for callers that want to surface staleness.
 *
 * @returns {Promise<{rate: number|null, stale: boolean, fetchedAt: string|null}>}
 */
const getRateInfo = async (targetCurrency) => {
  if (!targetCurrency) return { rate: null, stale: false, fetchedAt: null };
  const code = String(targetCurrency).toUpperCase();
  if (code === 'INR') return { rate: 1, stale: false, fetchedAt: null };

  const { rates, stale, fetchedAt } = await getRates();
  if (!rates) return { rate: null, stale: false, fetchedAt: null };

  const rate = rates[code];
  const valid = typeof rate === 'number' && Number.isFinite(rate) && rate > 0;
  return { rate: valid ? rate : null, stale, fetchedAt };
};

// ---------------------------------------------------------------------------
// Conversion
// ---------------------------------------------------------------------------

/** Decimal places used when presenting a currency. */
const getCurrencyDecimals = (currency) =>
  ZERO_DECIMAL_CURRENCIES.has(String(currency || '').toUpperCase()) ? 0 : 2;

/**
 * Convert a base INR amount into the target currency at natural precision.
 *
 * Precision follows ISO-4217: two decimals for most currencies, zero for
 * currencies without a minor unit. This matches the documented expectations
 * (Rs4000 -> $46.83, -> GBP34.52, -> JPY6800).
 *
 * Display-only: the INR figure remains the stored source of truth.
 *
 * @param {number} baseInrAmount amount in INR
 * @param {string} targetCurrency ISO-4217 code
 * @param {number} rate           INR -> target rate
 * @returns {number} converted amount, or the INR amount if no rate is usable
 */
const convertPrice = (baseInrAmount, targetCurrency, rate) => {
  const amount = Number(baseInrAmount);
  if (!Number.isFinite(amount)) return 0;

  const code = String(targetCurrency || 'INR').toUpperCase();
  if (code === 'INR') return amount;
  if (!rate || !Number.isFinite(Number(rate)) || Number(rate) <= 0) return amount;

  const converted = amount * Number(rate);
  const places = getCurrencyDecimals(code);
  const factor = 10 ** places;
  return Math.round(converted * factor) / factor;
};

module.exports = {
  getExchangeRate,
  getRateInfo,
  convertPrice,
  getCurrencyDecimals,
  ZERO_DECIMAL_CURRENCIES,
};
