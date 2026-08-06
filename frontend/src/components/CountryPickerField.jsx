import { useState, useMemo, useRef, useEffect } from 'react';
import { FiSearch, FiChevronDown, FiCheck } from 'react-icons/fi';
import { countriesList } from '../utils/countryCurrency';

/**
 * Searchable country field for auth forms, styled to match `.input-field`.
 *
 * Covers all 250 ISO-3166 countries. Selecting one determines the currency the
 * whole site displays prices in, so users on a VPN (or anyone whose device
 * location is wrong) can set it explicitly instead of relying on detection.
 */
const CountryPickerField = ({
  label = 'Country',
  value,
  onChange,
  hint,
  disabled = false,
  required = false,
}) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const wrapRef = useRef(null);
  const searchRef = useRef(null);
  const listboxId = 'country-picker-listbox';

  const selected = useMemo(
    () => countriesList.find((c) => c.country === value) || null,
    [value]
  );

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

  // Close on outside click.
  useEffect(() => {
    if (!open) return undefined;
    const onDown = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setOpen(false);
        setSearch('');
      }
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [open]);

  // Close on Escape.
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setOpen(false);
        setSearch('');
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  useEffect(() => {
    if (open && searchRef.current) searchRef.current.focus();
  }, [open]);

  const pick = (country) => {
    onChange?.(country);
    setOpen(false);
    setSearch('');
  };

  return (
    <div className="field-group">
      <label className="field-label" htmlFor="country-picker-button">
        {label}
        {required && <span style={{ color: 'var(--clr-forest-700)' }}> *</span>}
      </label>

      <div ref={wrapRef} style={{ position: 'relative' }}>
        <button
          id="country-picker-button"
          type="button"
          disabled={disabled}
          onClick={() => setOpen((o) => !o)}
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={open ? listboxId : undefined}
          className="input-field"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            textAlign: 'left',
            cursor: disabled ? 'not-allowed' : 'pointer',
            borderColor: open ? 'var(--clr-forest-700)' : undefined,
            boxShadow: open ? '0 0 0 3px rgba(32,138,116,0.10)' : undefined,
          }}
        >
          <span
            style={{
              flex: 1,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              color: selected ? 'var(--clr-ink)' : 'var(--clr-warm-gray)',
            }}
          >
            {selected ? selected.country : 'Select your country'}
          </span>

          {selected && (
            <span
              style={{
                flexShrink: 0,
                fontSize: '0.8125rem',
                fontWeight: 700,
                color: 'var(--clr-forest-700)',
              }}
            >
              {selected.symbol} {selected.currency}
            </span>
          )}

          <FiChevronDown
            size={15}
            style={{
              flexShrink: 0,
              color: 'var(--clr-warm-gray)',
              transition: 'transform 200ms ease',
              transform: open ? 'rotate(180deg)' : 'none',
            }}
          />
        </button>

        {open && (
          <div
            style={{
              position: 'absolute',
              top: 'calc(100% + 6px)',
              left: 0,
              right: 0,
              zIndex: 50,
              background: '#fff',
              border: '1.5px solid var(--clr-border-strong)',
              borderRadius: 'var(--r-md)',
              boxShadow: 'var(--shadow-lg)',
              overflow: 'hidden',
            }}
          >
            <div style={{ padding: '10px', borderBottom: '1px solid var(--clr-border)' }}>
              <div style={{ position: 'relative' }}>
                <FiSearch
                  size={14}
                  style={{
                    position: 'absolute',
                    left: '11px',
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
                  aria-label="Search countries"
                  style={{
                    width: '100%',
                    padding: '9px 12px 9px 32px',
                    fontFamily: 'var(--font-body)',
                    fontSize: '0.875rem',
                    color: 'var(--clr-ink)',
                    background: 'var(--clr-linen)',
                    border: '1px solid var(--clr-border-strong)',
                    borderRadius: 'var(--r-sm)',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
            </div>

            <ul
              id={listboxId}
              role="listbox"
              style={{
                listStyle: 'none',
                margin: 0,
                padding: '4px',
                maxHeight: '240px',
                overflowY: 'auto',
              }}
            >
              {filtered.length === 0 && (
                <li
                  style={{
                    padding: '20px 12px',
                    textAlign: 'center',
                    fontSize: '0.8125rem',
                    color: 'var(--clr-warm-gray)',
                  }}
                >
                  No match for “{search}”.
                </li>
              )}
              {filtered.map((c) => {
                const isSelected = selected && c.code === selected.code;
                return (
                  <li key={c.code} role="option" aria-selected={isSelected}>
                    <button
                      type="button"
                      onClick={() => pick(c)}
                      style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '9px 12px',
                        fontFamily: 'var(--font-body)',
                        fontSize: '0.875rem',
                        textAlign: 'left',
                        background: isSelected ? 'var(--clr-forest-50)' : 'none',
                        border: 'none',
                        borderRadius: 'var(--r-sm)',
                        cursor: 'pointer',
                        color: isSelected ? 'var(--clr-forest-700)' : 'var(--clr-ink-muted)',
                        fontWeight: isSelected ? 600 : 400,
                      }}
                      onMouseEnter={(e) => {
                        if (!isSelected) e.currentTarget.style.background = 'var(--clr-linen)';
                      }}
                      onMouseLeave={(e) => {
                        if (!isSelected) e.currentTarget.style.background = 'none';
                      }}
                    >
                      <span
                        style={{
                          flex: 1,
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
                      {isSelected && <FiCheck size={14} style={{ flexShrink: 0 }} />}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>

      {hint && (
        <p style={{ fontSize: '0.75rem', color: 'var(--clr-warm-gray)', lineHeight: 1.5 }}>
          {hint}
        </p>
      )}
    </div>
  );
};

export default CountryPickerField;
