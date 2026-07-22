import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { usePricing } from '../context/PricingContext';
import { useAuth } from '../context/AuthContext';
import countriesList from '../data/countries.json';
import CountrySelector from './CountrySelector';

const NavLink = ({ to, children, onClick }) => {
  const location = useLocation();
  const isActive = location.pathname === to || (to !== '/' && location.pathname.startsWith(to));

  return (
    <Link
      to={to}
      onClick={onClick}
      className="relative group"
    >
      <span
        style={{
          fontFamily: 'var(--font-body)',
          fontSize: '0.8125rem',
          fontWeight: isActive ? 600 : 500,
          letterSpacing: '0.01em',
          color: isActive ? 'var(--clr-forest-700)' : 'var(--clr-ink-muted)',
          transition: 'color 200ms ease',
        }}
      >
        {children}
      </span>
      <span
        style={{
          position: 'absolute',
          bottom: '-4px',
          left: 0,
          right: 0,
          height: '1.5px',
          background: 'var(--clr-forest-700)',
          borderRadius: '99px',
          transformOrigin: 'left',
          transform: isActive ? 'scaleX(1)' : 'scaleX(0)',
          opacity: isActive ? 1 : 0,
          transition: 'transform 280ms var(--ease-out-expo), opacity 280ms ease',
        }}
      />
      {/* Hover underline */}
      <span
        style={{
          position: 'absolute',
          bottom: '-4px',
          left: 0,
          right: 0,
          height: '1.5px',
          background: 'var(--clr-forest-400)',
          borderRadius: '99px',
          transformOrigin: 'left',
          transform: 'scaleX(0)',
          opacity: 0,
          transition: 'transform 280ms var(--ease-out-expo), opacity 280ms ease',
        }}
        className="group-hover:!scale-x-100 group-hover:!opacity-100"
      />
    </Link>
  );
};

const Navbar = () => {
  const { country, currency, changeCountry, loading } = usePricing();
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close mobile menu on route change
  const location = useLocation();
  useEffect(() => { setMobileOpen(false); setUserMenuOpen(false); }, [location]);

  const handleCountrySelect = (c) => changeCountry(c.country, c.currency, c.symbol);

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/classes', label: 'Classes' },
    { to: '/sessions', label: 'Sessions' },
    ...(user ? [{ to: '/my-bookings', label: 'My Bookings' }] : []),
    { to: '/about', label: 'About' },
  ];

  const navStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    height: 'var(--nav-h)',
    transition: 'background 350ms ease, border-color 350ms ease, backdrop-filter 350ms ease',
    background: scrolled ? 'rgba(250, 248, 244, 0.96)' : 'rgba(250, 248, 244, 0.7)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    borderBottom: scrolled ? '1px solid var(--clr-border)' : '1px solid transparent',
  };

  return (
    <>
      <nav style={navStyle}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>

          {/* ── Logo ── */}
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', flexShrink: 0 }}>
            <div style={{
              width: 36, height: 36, borderRadius: '50%', overflow: 'hidden',
              border: '1.5px solid var(--clr-border-strong)',
              flexShrink: 0,
              background: '#fff',
            }}>
              <img src="/logo.png" alt="Zeal Healing" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            </div>
            <span style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1.125rem',
              fontWeight: 600,
              color: 'var(--clr-forest-900)',
              letterSpacing: '-0.01em',
              lineHeight: 1,
            }}>
              Zeal Healing
            </span>
          </Link>

          {/* ── Desktop Navigation ── */}
          <div className="hidden md:flex" style={{ alignItems: 'center', gap: '36px' }}>
            {navLinks.map(link => (
              <NavLink key={link.to} to={link.to}>{link.label}</NavLink>
            ))}
          </div>

          {/* ── Desktop Right ── */}
          <div className="hidden md:flex" style={{ alignItems: 'center', gap: '16px' }}>
            {!loading && (
              <CountrySelector
                countriesList={countriesList}
                country={country}
                currency={currency}
                onCountryChange={handleCountrySelect}
              />
            )}

            {user ? (
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <button
                  onClick={() => setUserMenuOpen(o => !o)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '4px 8px',
                    borderRadius: 'var(--r-md)',
                    transition: 'background 200ms ease',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--clr-forest-50)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'none'}
                >
                  <div style={{
                    width: 32, height: 32, borderRadius: '50%',
                    background: 'var(--clr-forest-100)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: 'var(--font-body)',
                    fontSize: '0.8125rem',
                    fontWeight: 700,
                    color: 'var(--clr-forest-700)',
                    border: '1.5px solid var(--clr-border-strong)',
                    flexShrink: 0,
                  }}>
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--clr-ink-muted)' }} className="hidden lg:block">
                    {user.name.split(' ')[0]}
                  </span>
                </button>

                {/* Dropdown */}
                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.96 }}
                      transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                      style={{
                        position: 'absolute',
                        top: 'calc(100% + 8px)',
                        right: 0,
                        minWidth: '180px',
                        background: '#fff',
                        border: '1px solid var(--clr-border)',
                        borderRadius: 'var(--r-lg)',
                        boxShadow: 'var(--shadow-lg)',
                        overflow: 'hidden',
                        zIndex: 200,
                        padding: '6px',
                      }}
                    >
                      <Link
                        to={user.role === 'admin' ? '/admin' : '/profile'}
                        style={{
                          display: 'block',
                          padding: '10px 14px',
                          borderRadius: 'var(--r-md)',
                          fontSize: '0.875rem',
                          fontWeight: 500,
                          color: 'var(--clr-ink)',
                          transition: 'background 150ms ease',
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = 'var(--clr-forest-50)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'none'}
                      >
                        {user.role === 'admin' ? 'Admin Dashboard' : 'My Profile'}
                      </Link>
                      <Link
                        to="/my-bookings"
                        style={{
                          display: 'block',
                          padding: '10px 14px',
                          borderRadius: 'var(--r-md)',
                          fontSize: '0.875rem',
                          fontWeight: 500,
                          color: 'var(--clr-ink)',
                          transition: 'background 150ms ease',
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = 'var(--clr-forest-50)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'none'}
                      >
                        My Bookings
                      </Link>
                      <div style={{ height: '1px', background: 'var(--clr-border)', margin: '4px 0' }} />
                      <button
                        onClick={() => { logout(); setUserMenuOpen(false); }}
                        style={{
                          width: '100%',
                          textAlign: 'left',
                          display: 'block',
                          padding: '10px 14px',
                          borderRadius: 'var(--r-md)',
                          fontSize: '0.875rem',
                          fontWeight: 500,
                          color: '#dc2626',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          transition: 'background 150ms ease',
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = '#fee2e2'}
                        onMouseLeave={e => e.currentTarget.style.background = 'none'}
                      >
                        Sign Out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Link
                  to="/login"
                  style={{
                    fontSize: '0.8125rem',
                    fontWeight: 500,
                    color: 'var(--clr-ink-muted)',
                    transition: 'color 200ms ease',
                    padding: '8px 12px',
                  }}
                  onMouseEnter={e => e.currentTarget.style.color = 'var(--clr-ink)'}
                  onMouseLeave={e => e.currentTarget.style.color = 'var(--clr-ink-muted)'}
                >
                  Sign in
                </Link>
                <Link to="/register">
                  <button className="btn-ghost" style={{ height: 36, padding: '0 16px', fontSize: '0.8125rem' }}>
                    Register
                  </button>
                </Link>
              </div>
            )}

            <Link to="/sessions">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                className="btn-primary"
                style={{ height: 40, fontSize: '0.8125rem', padding: '0 20px', borderRadius: 'var(--r-md)' }}
              >
                Book a Session
              </motion.button>
            </Link>
          </div>

          {/* ── Mobile Hamburger ── */}
          <button
            onClick={() => setMobileOpen(o => !o)}
            className="md:hidden"
            style={{
              width: 40, height: 40,
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              gap: '5px',
              background: 'none', border: 'none', cursor: 'pointer',
              padding: '8px',
              borderRadius: 'var(--r-md)',
              transition: 'background 200ms ease',
            }}
            aria-label="Toggle menu"
          >
            <motion.span
              animate={mobileOpen ? { rotate: 45, y: 6 } : { rotate: 0, y: 0 }}
              transition={{ duration: 0.22 }}
              style={{
                width: 20, height: 1.5,
                background: 'var(--clr-ink)',
                borderRadius: 99, display: 'block',
              }}
            />
            <motion.span
              animate={mobileOpen ? { opacity: 0, scaleX: 0 } : { opacity: 1, scaleX: 1 }}
              transition={{ duration: 0.22 }}
              style={{
                width: 20, height: 1.5,
                background: 'var(--clr-ink)',
                borderRadius: 99, display: 'block',
              }}
            />
            <motion.span
              animate={mobileOpen ? { rotate: -45, y: -6 } : { rotate: 0, y: 0 }}
              transition={{ duration: 0.22 }}
              style={{
                width: 20, height: 1.5,
                background: 'var(--clr-ink)',
                borderRadius: 99, display: 'block',
              }}
            />
          </button>
        </div>

        {/* ── Mobile Menu ── */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
              style={{
                overflow: 'hidden',
                background: 'rgba(250, 248, 244, 0.98)',
                backdropFilter: 'blur(20px)',
                borderTop: '1px solid var(--clr-border)',
              }}
            >
              <div style={{ padding: '20px 24px 28px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginBottom: '20px' }}>
                  {navLinks.map((link, i) => (
                    <motion.div
                      key={link.to}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.04, duration: 0.22 }}
                    >
                      <Link
                        to={link.to}
                        onClick={() => setMobileOpen(false)}
                        style={{
                          display: 'block',
                          padding: '12px 16px',
                          borderRadius: 'var(--r-md)',
                          fontSize: '1rem',
                          fontWeight: 500,
                          color: 'var(--clr-ink)',
                          transition: 'background 150ms ease, color 150ms ease',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'var(--clr-forest-50)'; e.currentTarget.style.color = 'var(--clr-forest-700)'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'var(--clr-ink)'; }}
                      >
                        {link.label}
                      </Link>
                    </motion.div>
                  ))}
                </div>

                {!loading && (
                  <div style={{ marginBottom: '16px', padding: '0 16px' }}>
                    <CountrySelector
                      countriesList={countriesList}
                      country={country}
                      currency={currency}
                      onCountryChange={(c) => { handleCountrySelect(c); setMobileOpen(false); }}
                    />
                  </div>
                )}

                <div style={{ borderTop: '1px solid var(--clr-border)', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {user ? (
                    <>
                      <Link
                        to={user.role === 'admin' ? '/admin' : '/profile'}
                        onClick={() => setMobileOpen(false)}
                        style={{
                          display: 'flex', alignItems: 'center', gap: '12px',
                          padding: '12px 16px', borderRadius: 'var(--r-md)',
                          fontSize: '1rem', fontWeight: 500, color: 'var(--clr-ink)',
                        }}
                      >
                        <div style={{
                          width: 32, height: 32, borderRadius: '50%',
                          background: 'var(--clr-forest-100)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '0.875rem', fontWeight: 700,
                          color: 'var(--clr-forest-700)',
                          flexShrink: 0,
                        }}>
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        {user.name}
                      </Link>
                      <button
                        onClick={() => { logout(); setMobileOpen(false); }}
                        style={{
                          textAlign: 'left', padding: '12px 16px',
                          borderRadius: 'var(--r-md)',
                          fontSize: '1rem', fontWeight: 500,
                          color: '#dc2626', background: 'none',
                          border: 'none', cursor: 'pointer', width: '100%',
                        }}
                      >
                        Sign Out
                      </button>
                    </>
                  ) : (
                    <>
                      <Link to="/login" onClick={() => setMobileOpen(false)}>
                        <button style={{
                          width: '100%', height: 48, borderRadius: 'var(--r-md)',
                          border: '1.5px solid var(--clr-border-strong)',
                          background: 'none', fontSize: '0.9375rem', fontWeight: 500,
                          color: 'var(--clr-ink)', cursor: 'pointer',
                        }}>
                          Sign In
                        </button>
                      </Link>
                      <Link to="/register" onClick={() => setMobileOpen(false)}>
                        <button className="btn-primary" style={{ width: '100%', borderRadius: 'var(--r-md)' }}>
                          Create Account
                        </button>
                      </Link>
                    </>
                  )}
                  <Link to="/sessions" onClick={() => setMobileOpen(false)}>
                    <button className="btn-primary" style={{ width: '100%', borderRadius: 'var(--r-md)' }}>
                      Book a Session
                    </button>
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Backdrop for user dropdown */}
      {userMenuOpen && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 99 }}
          onClick={() => setUserMenuOpen(false)}
        />
      )}
    </>
  );
};

export default Navbar;
