import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMapPin, FiSearch, FiRefreshCw, FiGlobe, FiX } from 'react-icons/fi';
import { countriesList, DEFAULT_LOCATION } from '../utils/countryCurrency';
import { GEO_ERROR } from '../utils/geoLocation';

/**
 * Shown when browser location could not be used, so prices would otherwise be
 * stuck on the default currency.
 *
 * Offers the two documented recovery paths - retry the permission prompt, or
 * pick a country by hand from the full worldwide list - and falls back to
 * India / INR if the user skips.
 *
 * Rendered in a portal so it can never disturb page layout, and scroll-locks
 * the body to avoid the horizontal-scroll artefacts a fixed overlay can cause.
 */

const REASON_COPY = {
  [GEO_ERROR.PERMISSION_DENIED]: {
    title: 'Show prices in your local currency?',
    body: 'Location access helps us display prices in your local currency. You can allow access, or simply pick your country below.',
  },
  [GEO_ERROR.TIMEOUT]: {
    title: 'Location is taking too long',
    body: "We couldn't confirm your location in time. Try again, or pick your country below and we'll convert prices instantly.",
  },
  [GEO_ERROR.POSITION_UNAVAILABLE]: {
    title: "We couldn't pinpoint your location",
    body: 'Your device did not return a position. Try again, or pick your country below to see prices in your local currency.',
  },
  [GEO_ERROR.UNSUPPORTED]: {
    title: 'Choose your country',
    body: "This browser doesn't support location detection. Pick your country below and we'll show prices in your local currency.",
  },
  [GEO_ERROR.UNKNOWN]: {
    title: 'Show prices in your local currency?',
    body: 'Location access helps us display prices in your local currency. You can try again, or pick your country below.',
  },
};

const LocationPermissionDialog = ({
  open,
  reason = GEO_ERROR.PERMISSION_DENIED,
  detectedCountry,
  fallbackCurrency = DEFAULT_LOCATION.currency,
  onRetry,
  onSelectCountry,
  onSkip,
  busy = false,
}) => {
  const [search, setSearch] = useState('');
  const [retrying, setRetrying] = useState(false);
  const searchRef = useRef(null);
  const titleId = 'location-dialog-title';
  const descId = 'location-dialog-desc';

  const copy = REASON_COPY[reason] || REASON_COPY[GEO_ERROR.UNKNOWN];
  // Retry is pointless when the browser has no geolocation at all.
  const canRetry = reason !== GEO_ERROR.UNSUPPORTED;

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return countriesList;
    return countriesList.filter(
      (c) =>
        c.country.toLowerCase().includes(term) ||
        c.currency.toLowerCase().includes(term) ||
        c.code.toLowerCase() === term
    );
  }, [search]);

  // Lock body scroll while open, and restore the exact previous value.
  useEffect(() => {
    if (!open) return undefined;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  useEffect(() => {
    if (open) setSearch('');
  }, [open]);

  const handleSkip = useCallback(() => {
    setSearch('');
    onSkip?.();
  }, [onSkip]);

  // Escape closes with the documented India/INR default.
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') handleSkip();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, handleSkip]);

  const handleRetry = async () => {
    setRetrying(true);
    try {
      await onRetry?.();
    } finally {
      setRetrying(false);
    }
  };

  if (typeof document === 'undefined') return null;

  const disabled = busy || retrying;

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          aria-describedby={descId}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1000,
            background: 'rgba(8, 18, 16, 0.55)',
            backdropFilter: 'blur(4px)',
            WebkitBackdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
            overflowY: 'auto',
          }}
          onClick={handleSkip}
        >
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: '440px',
              maxHeight: 'calc(100svh - 32px)',
              display: 'flex',
              flexDirection: 'column',
              background: 'var(--clr-parchment)',
              border: '1px solid var(--clr-border-strong)',
              borderRadius: 'var(--r-xl)',
              boxShadow: 'var(--shadow-xl)',
              overflow: 'hidden',
            }}
          >
            {/* Header */}
            <div style={{ padding: '28px 28px 20px', position: 'relative', flexShrink: 0 }}>
              <button
                type="button"
                onClick={handleSkip}
                aria-label="Close and keep default currency"
                style={{
                  position: 'absolute',
                  top: '16px',
                  right: '16px',
                  width: 32,
                  height: 32,
                  display: 'grid',
                  placeItems: 'center',
                  background: 'none',
                  border: 'none',
                  borderRadius: 'var(--r-full)',
                  cursor: 'pointer',
                  color: 'var(--clr-warm-gray)',
                  transition: 'background 200ms ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'var(--clr-forest-50)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'none';
                }}
              >
                <FiX size={16} />
              </button>

              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 'var(--r-md)',
                  background: 'var(--clr-forest-50)',
                  border: '1px solid var(--clr-border-strong)',
                  display: 'grid',
                  placeItems: 'center',
                  color: 'var(--clr-forest-700)',
                  marginBottom: '16px',
                }}
              >
                <FiMapPin size={20} />
              </div>

              <h2
                id={titleId}
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '1.25rem',
                  fontWeight: 600,
                  color: 'var(--clr-ink)',
                  letterSpacing: '-0.01em',
                  marginBottom: '8px',
                  paddingRight: '32px',
                }}
              >
                {copy.title}
              </h2>
              <p
                id={descId}
                style={{
                  fontSize: '0.875rem',
                  lineHeight: 1.6,
                  color: 'var(--clr-ink-muted)',
                }}
              >
                {copy.body}
              </p>

              {detectedCountry && (
                <p
                  style={{
                    fontSize: '0.75rem',
                    color: 'var(--clr-warm-gray)',
                    marginTop: '10px',
                  }}
                >
                  Currently showing prices for{' '}
                  <strong style={{ color: 'var(--clr-forest-700)' }}>{detectedCountry}</strong>.
                </p>
              )}
            </div>

            {/* Actions */}
            <div
              style={{
                padding: '0 28px 20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
                flexShrink: 0,
              }}
              className="sm:flex-row"
            >
              {canRetry && (
                <button
                  type="button"
                  onClick={handleRetry}
                  disabled={disabled}
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    padding: '12px 16px',
                    fontFamily: 'var(--font-body)',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    color: '#fff',
                    background: 'var(--clr-forest-700)',
                    border: 'none',
                    borderRadius: 'var(--r-md)',
                    cursor: disabled ? 'not-allowed' : 'pointer',
                    opacity: disabled ? 0.65 : 1,
                    transition: 'opacity 200ms ease',
                  }}
                >
                  <FiRefreshCw
                    size={15}
                    style={{
                      animation: retrying ? 'spin 900ms linear infinite' : 'none',
                    }}
                  />
                  {retrying ? 'Requesting…' : 'Retry Location Access'}
                </button>
              )}
              <button
                type="button"
                onClick={handleSkip}
                disabled={disabled}
                style={{
                  flex: 1,
                  padding: '12px 16px',
                  fontFamily: 'var(--font-body)',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  color: 'var(--clr-ink-muted)',
                  background: 'transparent',
                  border: '1px solid var(--clr-border-strong)',
                  borderRadius: 'var(--r-md)',
                  cursor: disabled ? 'not-allowed' : 'pointer',
                }}
              >
                Continue in {fallbackCurrency || DEFAULT_LOCATION.currency}
              </button>
            </div>

            {/* Manual country picker */}
            <div
              style={{
                borderTop: '1px solid var(--clr-border)',
                padding: '18px 28px 12px',
                flexShrink: 0,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '12px',
                  fontSize: '0.6875rem',
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: 'var(--clr-warm-gray)',
                }}
              >
                <FiGlobe size={13} />
                Select Country Manually
              </div>

              <div style={{ position: 'relative' }}>
                <FiSearch
                  size={14}
                  style={{
                    position: 'absolute',
                    left: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--clr-warm-gray)',
                    pointerEvents: 'none',
                  }}
                />
                <input
                  ref={searchRef}
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search country or currency…"
                  aria-label="Search for your country"
                  style={{
                    width: '100%',
                    padding: '10px 12px 10px 34px',
                    fontFamily: 'var(--font-body)',
                    fontSize: '0.875rem',
                    color: 'var(--clr-ink)',
                    background: 'var(--clr-linen)',
                    border: '1px solid var(--clr-border-strong)',
                    borderRadius: 'var(--r-md)',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
            </div>

            {/* Country list - the only scrolling region */}
            <ul
              style={{
                listStyle: 'none',
                margin: 0,
                padding: '0 12px 16px',
                overflowY: 'auto',
                flex: 1,
                minHeight: '96px',
              }}
            >
              {filtered.length === 0 && (
                <li
                  style={{
                    padding: '24px 16px',
                    textAlign: 'center',
                    fontSize: '0.8125rem',
                    color: 'var(--clr-warm-gray)',
                  }}
                >
                  No countries match “{search}”.
                </li>
              )}
              {filtered.map((c) => (
                <li key={c.code}>
                  <button
                    type="button"
                    disabled={disabled}
                    onClick={() => onSelectCountry?.(c)}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '12px',
                      padding: '10px 16px',
                      fontFamily: 'var(--font-body)',
                      fontSize: '0.875rem',
                      color: 'var(--clr-ink-muted)',
                      background: 'none',
                      border: 'none',
                      borderRadius: 'var(--r-sm)',
                      textAlign: 'left',
                      cursor: disabled ? 'not-allowed' : 'pointer',
                      transition: 'background 150ms ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'var(--clr-forest-50)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'none';
                    }}
                  >
                    <span
                      style={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {c.country}
                    </span>
                    <span
                      style={{
                        flexShrink: 0,
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        color: 'var(--clr-forest-700)',
                      }}
                    >
                      {c.symbol} {c.currency}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default LocationPermissionDialog;
