import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from 'react';
import axios from 'axios';
import {
  DEFAULT_LOCATION,
  formatMoney,
  getCurrencyDecimals,
  isDomestic,
} from '../utils/countryCurrency';
import { DETECTION_METHOD } from '../utils/geoLocation';

/**
 * Global pricing state.
 *
 * Contract:
 *   - MongoDB stores session prices in INR only.
 *   - Everything foreign shown to the user is derived here at display time
 *     from those INR values and the current live exchange rate.
 *   - Changing country updates context state, so every consumer re-renders
 *     immediately. No page reload, no re-login.
 *
 * The public value shape is additive-only; all keys the app already consumed
 * (country, currency, symbol, countryCategory, gstRate, exchangeRate, prices,
 * loading, changeCountry, getPrice) behave exactly as before.
 */

const PricingContext = createContext();

export const usePricing = () => useContext(PricingContext);

const API_URL = import.meta.env.VITE_API_URL || '';

/** Existing key, kept for backward compatibility with previously saved prefs. */
const COUNTRY_KEY = 'selectedCountry';
/** Cached /convert payload so navigation does not refetch on every render. */
const CACHE_KEY = 'pricingCache';
/** Spec: refresh cached rates every 12-24h. */
const CACHE_TTL_MS = 12 * 60 * 60 * 1000;

const FALLBACK_PRICES = {
  voice: { 15: 2000, 30: 4000, 45: 6000, 60: 8000 },
  video: { 15: 4000, 30: 8000, 45: 12000, 60: 16000 },
};

const INITIAL_STATE = {
  country: DEFAULT_LOCATION.country,
  countryCode: DEFAULT_LOCATION.code,
  currency: DEFAULT_LOCATION.currency,
  symbol: DEFAULT_LOCATION.symbol,
  countryCategory: 'india',
  gstRate: 18,
  exchangeRate: 1,
  prices: FALLBACK_PRICES,
  basePrices: FALLBACK_PRICES,
  timezone: null,
  rateStale: false,
  detectionMethod: null,
  loading: true,
};

// ---------------------------------------------------------------------------
// localStorage helpers (defensive: private mode / disabled storage must not crash)
// ---------------------------------------------------------------------------

const readStore = (key) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const writeStore = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage unavailable - in-memory state still works */
  }
};

const cacheIdentity = (pref) =>
  pref ? `${pref.currency || ''}|${pref.country || ''}` : 'auto';

/**
 * A saved country is only authoritative when the user picked it themselves.
 *
 * Auto-detected values are re-checked on later visits, otherwise one bad first
 * guess (or a since-changed VPN/network) would be frozen in forever. Preferences
 * saved before this field existed count as auto-detected.
 */
const isManualPreference = (pref) => Boolean(pref) && pref.source === 'manual';

export const PricingProvider = ({ children }) => {
  const [state, setState] = useState(INITIAL_STATE);
  const [detecting, setDetecting] = useState(false);
  // Guards against overlapping fetches clobbering each other out of order.
  const requestSeq = useRef(0);

  /**
   * Fetch the converted price matrix.
   *
   * @param {object|null} pref        { country, currency, symbol, countryCode }
   * @param {object}      [options]
   * @param {boolean}     [options.useCache=true] hydrate from cache when fresh
   */
  const fetchPricing = useCallback(async (pref = null, { useCache = true } = {}) => {
    // With no explicit preference, only reuse a saved country the user chose by
    // hand. Anything auto-detected gets re-resolved server-side.
    let target = pref;
    if (!target) {
      const saved = readStore(COUNTRY_KEY);
      target = isManualPreference(saved) ? saved : null;
    }
    const identity = cacheIdentity(target);
    const seq = ++requestSeq.current;

    // Serve a fresh cache hit without touching the network.
    if (useCache) {
      const cached = readStore(CACHE_KEY);
      if (
        cached &&
        cached.identity === identity &&
        cached.data &&
        Date.now() - new Date(cached.cachedAt).getTime() < CACHE_TTL_MS
      ) {
        setState((prev) => ({ ...prev, ...cached.data, loading: false }));
        return cached.data;
      }
    }

    setState((prev) => ({ ...prev, loading: true }));

    try {
      const params = {};
      if (target?.currency) {
        params.currency = target.currency;
        if (target.country) params.country = target.country;
        if (target.symbol) params.symbol = target.symbol;
        if (target.countryCode) params.countryCode = target.countryCode;
      }

      const { data } = await axios.get(`${API_URL}/api/pricing/convert`, {
        params,
        timeout: 15000,
      });

      // A newer request superseded this one.
      if (seq !== requestSeq.current) return null;

      const next = {
        country: data.country,
        countryCode: data.countryCode || target?.countryCode || null,
        currency: data.currency,
        symbol: data.symbol,
        countryCategory: data.countryCategory,
        gstRate: data.gstRate,
        exchangeRate: data.exchangeRate,
        prices: data.prices || FALLBACK_PRICES,
        basePrices: data.basePrices || data.prices || FALLBACK_PRICES,
        rateStale: Boolean(data.rateStale),
      };

      setState((prev) => ({ ...prev, ...next, loading: false }));
      writeStore(CACHE_KEY, {
        identity,
        data: next,
        cachedAt: new Date().toISOString(),
      });

      // Record an auto-detected result, but never overwrite a manual choice.
      if (!isManualPreference(readStore(COUNTRY_KEY))) {
        writeStore(COUNTRY_KEY, {
          country: next.country,
          countryCode: next.countryCode,
          currency: next.currency,
          symbol: next.symbol,
          countryCategory: next.countryCategory,
          gstRate: next.gstRate,
          source: 'auto',
          savedAt: new Date().toISOString(),
        });
      }

      return next;
    } catch (error) {
      if (seq !== requestSeq.current) return null;
      console.error('Pricing fetch failed:', error.message);

      // Last resort: any cached payload, however old, beats a blank price.
      const cached = readStore(CACHE_KEY);
      if (cached?.data) {
        setState((prev) => ({ ...prev, ...cached.data, rateStale: true, loading: false }));
        return cached.data;
      }
      setState((prev) => ({ ...prev, loading: false }));
      return null;
    }
  }, []);

  useEffect(() => {
    fetchPricing();
  }, [fetchPricing]);

  /**
   * Switch country manually (country selector, or the fallback dialog).
   * Signature preserved: changeCountry(country, currency, symbol).
   */
  const changeCountry = useCallback(
    (country, currency, symbol, countryCode = null) => {
      // Marked manual so it survives future auto-detection.
      const pref = {
        country,
        currency,
        symbol,
        countryCode,
        source: 'manual',
        savedAt: new Date().toISOString(),
      };
      writeStore(COUNTRY_KEY, pref);
      setState((prev) => ({ ...prev, detectionMethod: DETECTION_METHOD.MANUAL }));
      // Skip the cache so an explicit choice always re-reads live rates.
      return fetchPricing(pref, { useCache: false });
    },
    [fetchPricing]
  );

  /**
   * Apply a location resolved by the detection chain (post-login geolocation).
   * @param {object} location { country, countryCode, currency, symbol, timezone, method }
   */
  const applyLocation = useCallback(
    async (location) => {
      if (!location?.currency) return null;
      const pref = {
        country: location.country,
        currency: location.currency,
        symbol: location.symbol,
        countryCode: location.countryCode,
        source: location.method === DETECTION_METHOD.MANUAL ? 'manual' : 'auto',
        savedAt: new Date().toISOString(),
      };
      writeStore(COUNTRY_KEY, pref);
      setState((prev) => ({
        ...prev,
        timezone: location.timezone || prev.timezone,
        detectionMethod: location.method || DETECTION_METHOD.GEOLOCATION,
      }));
      return fetchPricing(pref, { useCache: false });
    },
    [fetchPricing]
  );

  /** Revert to the documented default (India / INR). */
  const resetToDefault = useCallback(
    () =>
      changeCountry(
        DEFAULT_LOCATION.country,
        DEFAULT_LOCATION.currency,
        DEFAULT_LOCATION.symbol,
        DEFAULT_LOCATION.code
      ),
    [changeCountry]
  );

  /** Run detection and apply the result. Used immediately after login. */
  const detectAndApply = useCallback(
    async (location) => {
      setDetecting(true);
      try {
        return await applyLocation(location);
      } finally {
        setDetecting(false);
      }
    },
    [applyLocation]
  );

  /**
   * Convert a base INR amount into the active currency.
   * Display-only; the INR figure remains the stored source of truth.
   */
  const convert = useCallback(
    (baseInrAmount) => {
      const amount = Number(baseInrAmount);
      if (!Number.isFinite(amount)) return 0;
      if (state.currency === 'INR') return amount;

      const rate = Number(state.exchangeRate) || 1;
      const places = getCurrencyDecimals(state.currency);
      const factor = 10 ** places;
      return Math.round(amount * rate * factor) / factor;
    },
    [state.currency, state.exchangeRate]
  );

  /**
   * Price for a session tier, in the active currency.
   * Signature preserved: getPrice(type, duration, fallbackPrice).
   *
   * Prefers the server-converted tier when the class price matches the base
   * INR matrix (avoids re-rounding), otherwise converts the INR price directly
   * so custom//admin-edited class prices still work.
   */
  const getPrice = useCallback(
    (type, duration, fallbackPrice) => {
      const base = state.basePrices?.[type]?.[duration];
      const converted = state.prices?.[type]?.[duration];

      if (
        converted !== undefined &&
        base !== undefined &&
        Number(base) === Number(fallbackPrice)
      ) {
        return converted;
      }
      return convert(fallbackPrice);
    },
    [state.basePrices, state.prices, convert]
  );

  /**
   * Format an amount that is ALREADY in the active currency.
   * e.g. formatPrice(46.83) -> "$46.83"   formatPrice(4000) -> "₹4,000"
   */
  const formatPrice = useCallback(
    (amount, options = {}) =>
      formatMoney(amount, {
        currency: state.currency,
        symbol: state.symbol,
        ...options,
      }),
    [state.currency, state.symbol]
  );

  /** Convert a base INR amount and format it in one step. */
  const formatFromINR = useCallback(
    (baseInrAmount, options = {}) => formatPrice(convert(baseInrAmount), options),
    [formatPrice, convert]
  );

  const value = useMemo(
    () => ({
      ...state,
      detecting,
      isDomestic: isDomestic(state.countryCode, state.currency),
      changeCountry,
      applyLocation,
      detectAndApply,
      resetToDefault,
      refresh: () => fetchPricing(null, { useCache: false }),
      getPrice,
      convert,
      formatPrice,
      formatFromINR,
    }),
    [
      state,
      detecting,
      changeCountry,
      applyLocation,
      detectAndApply,
      resetToDefault,
      fetchPricing,
      getPrice,
      convert,
      formatPrice,
      formatFromINR,
    ]
  );

  return <PricingContext.Provider value={value}>{children}</PricingContext.Provider>;
};
