import axios from 'axios';
import { DEFAULT_LOCATION, getCurrencySymbol } from './countryCurrency';

/**
 * Browser location detection and country/currency resolution.
 *
 * Detection chain, most precise first:
 *   1. navigator.geolocation  -> server reverse geocode  (needs user consent)
 *   2. server IP lookup                                   (no consent needed)
 *   3. India / INR default                                (never fails)
 *
 * Nothing here writes prices. It only resolves *which* currency to display.
 */

const API_URL = import.meta.env.VITE_API_URL || '';

/** Geolocation options are fixed by the integration spec. */
export const GEO_OPTIONS = Object.freeze({
  enableHighAccuracy: true,
  timeout: 10000,
  maximumAge: 0,
});

/** Reasons a browser location request can fail. */
export const GEO_ERROR = Object.freeze({
  UNSUPPORTED: 'UNSUPPORTED',
  PERMISSION_DENIED: 'PERMISSION_DENIED',
  POSITION_UNAVAILABLE: 'POSITION_UNAVAILABLE',
  TIMEOUT: 'TIMEOUT',
  UNKNOWN: 'UNKNOWN',
});

/** How the active location was determined. */
export const DETECTION_METHOD = Object.freeze({
  GEOLOCATION: 'geolocation',
  IP: 'ip',
  MANUAL: 'manual',
  DEFAULT: 'default',
  CACHE: 'cache',
});

export const isGeolocationSupported = () =>
  typeof navigator !== 'undefined' && 'geolocation' in navigator;

/** IANA timezone reported by the browser, e.g. "America/New_York". */
export const getBrowserTimezone = () => {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || null;
  } catch {
    return null;
  }
};

/**
 * Current geolocation permission state without triggering a prompt.
 * @returns {Promise<'granted'|'denied'|'prompt'|'unsupported'>}
 */
export const getPermissionState = async () => {
  if (!isGeolocationSupported()) return 'unsupported';
  if (typeof navigator.permissions?.query !== 'function') return 'prompt';
  try {
    const status = await navigator.permissions.query({ name: 'geolocation' });
    return status.state;
  } catch {
    return 'prompt';
  }
};

const mapPositionError = (error) => {
  if (!error || typeof error.code !== 'number') return GEO_ERROR.UNKNOWN;
  switch (error.code) {
    case 1:
      return GEO_ERROR.PERMISSION_DENIED;
    case 2:
      return GEO_ERROR.POSITION_UNAVAILABLE;
    case 3:
      return GEO_ERROR.TIMEOUT;
    default:
      return GEO_ERROR.UNKNOWN;
  }
};

/**
 * Trigger the native "Allow this website to access your location?" prompt.
 *
 * @returns {Promise<{latitude:number, longitude:number, accuracy:number}>}
 * @throws  {Error & {reason: keyof GEO_ERROR}}
 */
export const requestBrowserPosition = () =>
  new Promise((resolve, reject) => {
    if (!isGeolocationSupported()) {
      const err = new Error('Geolocation is not supported by this browser');
      err.reason = GEO_ERROR.UNSUPPORTED;
      reject(err);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) =>
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        }),
      (error) => {
        const err = new Error(error?.message || 'Unable to determine location');
        err.reason = mapPositionError(error);
        reject(err);
      },
      GEO_OPTIONS
    );
  });

/** Normalise a server location payload into the shape PricingContext uses. */
const normalise = (data, method) => {
  const currency = String(data?.currency || DEFAULT_LOCATION.currency).toUpperCase();
  return {
    country: data?.country || DEFAULT_LOCATION.country,
    countryCode: data?.countryCode || DEFAULT_LOCATION.code,
    currency,
    symbol: data?.currencySymbol || getCurrencySymbol(currency),
    timezone: data?.timezone || getBrowserTimezone(),
    exchangeRate: Number(data?.exchangeRate) || 1,
    rateStale: Boolean(data?.rateStale),
    method,
  };
};

/** The guaranteed-safe fallback location. */
export const getDefaultLocation = () => ({
  country: DEFAULT_LOCATION.country,
  countryCode: DEFAULT_LOCATION.code,
  currency: DEFAULT_LOCATION.currency,
  symbol: DEFAULT_LOCATION.symbol,
  timezone: getBrowserTimezone(),
  exchangeRate: 1,
  rateStale: false,
  method: DETECTION_METHOD.DEFAULT,
});

/**
 * Resolve coordinates to a country + currency via the backend.
 * Server-side so we can honour the geocoder's User-Agent policy and cache.
 */
export const resolveByCoords = async (latitude, longitude) => {
  const { data } = await axios.get(`${API_URL}/api/pricing/reverse-geocode`, {
    params: {
      lat: latitude,
      lon: longitude,
      timezone: getBrowserTimezone() || undefined,
    },
    timeout: 15000,
  });
  return normalise(data, DETECTION_METHOD.GEOLOCATION);
};

/** Resolve the caller's country from their IP, no consent required. */
export const resolveByIp = async () => {
  const { data } = await axios.get(`${API_URL}/api/pricing/detect`, { timeout: 12000 });
  return normalise(data, DETECTION_METHOD.IP);
};

/**
 * Run the full detection chain.
 *
 * Never throws. On total failure it resolves to India/INR so pricing always
 * renders. The `reason` field explains why geolocation was not used, which the
 * caller needs in order to show the permission fallback dialog.
 *
 * @param {object}  [options]
 * @param {boolean} [options.useBrowserLocation=true] set false to skip the prompt
 * @returns {Promise<{location: object, reason: string|null}>}
 */
export const detectLocation = async ({ useBrowserLocation = true } = {}) => {
  let reason = null;

  if (useBrowserLocation && isGeolocationSupported()) {
    try {
      const { latitude, longitude } = await requestBrowserPosition();
      return { location: await resolveByCoords(latitude, longitude), reason: null };
    } catch (error) {
      reason = error?.reason || GEO_ERROR.UNKNOWN;
    }
  } else if (useBrowserLocation) {
    reason = GEO_ERROR.UNSUPPORTED;
  }

  // Consent refused or coordinates unusable: fall back to a coarse IP lookup.
  try {
    return { location: await resolveByIp(), reason };
  } catch {
    return { location: getDefaultLocation(), reason };
  }
};

export default {
  GEO_OPTIONS,
  GEO_ERROR,
  DETECTION_METHOD,
  isGeolocationSupported,
  getPermissionState,
  getBrowserTimezone,
  requestBrowserPosition,
  resolveByCoords,
  resolveByIp,
  getDefaultLocation,
  detectLocation,
};
