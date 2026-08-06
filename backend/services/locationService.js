const axios = require('axios');
const NodeCache = require('node-cache');
const {
  DEFAULT_LOCATION,
  lookupCountry,
  getCurrencySymbol,
} = require('../config/countryCurrency');

/**
 * User location detection, two independent strategies:
 *
 *   detectLocation(ip)              - IP based (ipapi.co). Coarse, no consent.
 *   reverseGeocode(lat, lon)        - precise, from browser Geolocation coords.
 *
 * Both normalise to the same shape so callers are interchangeable:
 *   { country, countryCode, currency, currencySymbol, timezone }
 *
 * Country -> currency always resolves through config/countryCurrency.js so all
 * 250 countries are supported rather than a hardcoded subset.
 */

const REQUEST_TIMEOUT = 5000;
// Nominatim's usage policy requires an identifying User-Agent.
const USER_AGENT = 'ZealHealing/1.0 (appointment booking platform)';

// Reverse geocode results are stable for a given coarse coordinate, so cache
// them for 24h to stay well inside upstream rate limits.
const geoCache = new NodeCache({ stdTTL: 24 * 60 * 60 });

/**
 * Attach a timezone without inventing one. We only fall back to the default
 * zone when the location itself is the default (India); claiming Asia/Kolkata
 * for a resolved foreign country would be wrong.
 */
const withTimezone = (base, timezone) => {
  const resolved =
    timezone ||
    (base.countryCode === DEFAULT_LOCATION.countryCode ? DEFAULT_LOCATION.timezone : null);
  return { ...base, timezone: resolved };
};

const isPrivateAddress = (ip) =>
  !ip ||
  ip === '::1' ||
  ip === '127.0.0.1' ||
  ip.startsWith('192.168.') ||
  ip.startsWith('10.') ||
  ip.startsWith('::ffff:127.') ||
  /^172\.(1[6-9]|2\d|3[01])\./.test(ip);

/**
 * Geolocate this server's own outbound address.
 *
 * Used only in development. When you browse localhost the request never leaves
 * the machine, so the server sees ::1 and has no client IP to work with - which
 * makes a locally running VPN look invisible. Asking the provider to locate our
 * own egress address surfaces the VPN's exit country instead.
 *
 * Never used in production: there the client IP arrives via X-Forwarded-For, and
 * geolocating the server would mislabel every user with the datacentre's country.
 */
const detectOwnEgress = async () => {
  const cached = geoCache.get('egress');
  if (cached) return cached;

  const { data } = await axios.get('https://ipapi.co/json/', {
    timeout: REQUEST_TIMEOUT,
    headers: { 'User-Agent': USER_AGENT },
  });
  if (!data || data.error || !data.country_code) {
    throw new Error((data && data.reason) || 'Egress lookup failed');
  }

  const code = String(data.country_code).toUpperCase();
  const resolved = lookupCountry(code);
  const currency = String(
    data.currency || (resolved && resolved.currency) || DEFAULT_LOCATION.currency
  ).toUpperCase();

  const payload = withTimezone(
    {
      country: (resolved && resolved.country) || data.country_name || code,
      countryCode: code,
      currency,
      currencySymbol: getCurrencySymbol(currency, resolved && resolved.currencySymbol),
    },
    data.timezone
  );

  // Short TTL so toggling a VPN is picked up quickly during development.
  geoCache.set('egress', payload, 600);
  return payload;
};

// ---------------------------------------------------------------------------
// IP based detection (pre-existing behaviour, preserved)
// ---------------------------------------------------------------------------

/**
 * Detect location from an IP address.
 * Falls back to India on private addresses or any upstream failure.
 *
 * @param {string} ip
 * @returns {Promise<{country,countryCode,currency,currencySymbol,timezone}>}
 */
const detectLocation = async (ip) => {
  try {
    if (isPrivateAddress(ip)) {
      // Local development: fall back to our own egress address so a VPN running
      // on the dev machine is reflected. Production keeps the India default.
      if (process.env.NODE_ENV !== 'production') {
        try {
          return await detectOwnEgress();
        } catch (error) {
          console.error('Egress detection failed, using default:', error.message);
        }
      }
      return { ...DEFAULT_LOCATION };
    }

    const response = await axios.get(`https://ipapi.co/${ip}/json/`, {
      timeout: REQUEST_TIMEOUT,
      headers: { 'User-Agent': USER_AGENT },
    });
    const data = response.data;

    if (!data || data.error || !data.country_code) {
      throw new Error((data && data.reason) || 'Failed to detect location');
    }

    const code = String(data.country_code).toUpperCase();
    const resolved = lookupCountry(code);
    // Prefer the provider's currency when it disagrees, but keep our symbol table.
    const currency = String(
      data.currency || (resolved && resolved.currency) || DEFAULT_LOCATION.currency
    ).toUpperCase();

    return withTimezone(
      {
        country: (resolved && resolved.country) || data.country_name || code,
        countryCode: code,
        currency,
        currencySymbol: getCurrencySymbol(currency, resolved && resolved.currencySymbol),
      },
      data.timezone
    );
  } catch (error) {
    console.error('IP location detection failed:', error.message);
    return { ...DEFAULT_LOCATION };
  }
};

// ---------------------------------------------------------------------------
// Coordinate based detection (browser Geolocation API)
// ---------------------------------------------------------------------------

const parseCoordinate = (value, limit) => {
  const num = Number(value);
  if (!Number.isFinite(num) || Math.abs(num) > limit) return null;
  return num;
};

/** Primary provider: OpenStreetMap Nominatim. */
const viaNominatim = async (lat, lon) => {
  const { data } = await axios.get('https://nominatim.openstreetmap.org/reverse', {
    params: { format: 'jsonv2', lat, lon, zoom: 3, addressdetails: 1 },
    timeout: REQUEST_TIMEOUT,
    headers: { 'User-Agent': USER_AGENT, 'Accept-Language': 'en' },
  });
  const code = data && data.address && data.address.country_code;
  if (!code) return null;
  return {
    countryCode: String(code).toUpperCase(),
    countryName: data.address.country,
  };
};

/** Secondary provider: BigDataCloud, keyless and generous on free usage. */
const viaBigDataCloud = async (lat, lon) => {
  const { data } = await axios.get(
    'https://api.bigdatacloud.net/data/reverse-geocode-client',
    {
      params: { latitude: lat, longitude: lon, localityLanguage: 'en' },
      timeout: REQUEST_TIMEOUT,
      headers: { 'User-Agent': USER_AGENT },
    }
  );
  if (!data || !data.countryCode) return null;
  return {
    countryCode: String(data.countryCode).toUpperCase(),
    countryName: data.countryName,
  };
};

/**
 * Resolve latitude/longitude to a country and its official currency.
 *
 * Tries Nominatim, then BigDataCloud, then falls back to India. Never throws:
 * callers always receive a usable location object.
 *
 * @param {number|string} latitude
 * @param {number|string} longitude
 * @param {string} [timezone] IANA zone reported by the client, used as-is
 * @returns {Promise<{country,countryCode,currency,currencySymbol,timezone,source}>}
 */
const reverseGeocode = async (latitude, longitude, timezone) => {
  const lat = parseCoordinate(latitude, 90);
  const lon = parseCoordinate(longitude, 180);

  if (lat === null || lon === null) {
    return { ...withTimezone(DEFAULT_LOCATION, timezone), source: 'default' };
  }

  // ~11km precision is plenty for country resolution and maximises cache hits.
  const cacheKey = `geo:${lat.toFixed(1)},${lon.toFixed(1)}`;
  const cached = geoCache.get(cacheKey);
  if (cached) return { ...withTimezone(cached, timezone), source: 'cache' };

  for (const [name, provider] of [
    ['nominatim', viaNominatim],
    ['bigdatacloud', viaBigDataCloud],
  ]) {
    try {
      const hit = await provider(lat, lon);
      if (!hit) continue;

      const resolved = lookupCountry(hit.countryCode);
      const payload = {
        // Prefer our canonical name so it matches the country selector list
        // exactly. Providers return verbose ISO forms such as
        // "United States of America (the)" which would not match.
        country: (resolved && resolved.country) || hit.countryName || hit.countryCode,
        countryCode: hit.countryCode,
        currency: (resolved && resolved.currency) || DEFAULT_LOCATION.currency,
        currencySymbol:
          (resolved && resolved.currencySymbol) || DEFAULT_LOCATION.currencySymbol,
      };
      geoCache.set(cacheKey, payload);
      return { ...withTimezone(payload, timezone), source: name };
    } catch (error) {
      console.error(`Reverse geocode via ${name} failed:`, error.message);
    }
  }

  return { ...withTimezone(DEFAULT_LOCATION, timezone), source: 'default' };
};

module.exports = { detectLocation, reverseGeocode, detectOwnEgress };
