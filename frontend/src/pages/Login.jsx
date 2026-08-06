import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useLocationPrompt } from '../context/LocationPromptContext';

const FormField = ({ label, type, placeholder, value, onChange, required, children }) => (
  <div className="field-group">
    <label className="field-label">{label}</label>
    <div style={{ position: 'relative' }}>
      <input
        type={type}
        className="input-field"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
      />
      {children}
    </div>
  </div>
);

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isAdminMode, setIsAdminMode] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const { promptForLocation } = useLocationPrompt();

  const from = location.state?.from || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const userData = await login(email, password);

      if (isAdminMode) {
        if (userData.role !== 'admin') {
          toast.error('Access denied. This account does not have admin privileges.');
          setLoading(false);
          return;
        }
        toast.success('Welcome back, Admin!');
        navigate('/admin', { replace: true });
        return;
      }

      const userRedirect = from.startsWith('/admin') ? '/' : from;

      toast.success('Welcome back!');

      // Authentication has succeeded - only now do we ask for location, so the
      // native permission prompt never appears before the user is signed in.
      // Prices update in place through PricingContext, so navigating away while
      // this resolves is safe.
      await promptForLocation();

      navigate(userRedirect, { replace: true });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed. Please check your credentials.');
      setLoading(false);
    }
  };

  const toggleMode = () => { setIsAdminMode(p => !p); setEmail(''); setPassword(''); };

  return (
    <div style={{
      minHeight: '100svh',
      background: 'var(--clr-parchment)',
      display: 'flex',
      alignItems: 'stretch',
    }}>
      {/* ── Left: Decorative Panel ── */}
      <div
        className="hidden lg:flex"
        style={{
          width: '45%',
          flexShrink: 0,
          position: 'relative',
          background: 'var(--clr-forest-900)',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          padding: '60px',
          overflow: 'hidden',
        }}
      >
        <img
          src="/hero-bg.png"
          alt=""
          aria-hidden="true"
          style={{
            position: 'absolute', inset: 0,
            width: '100%', height: '100%',
            objectFit: 'cover',
            opacity: 0.25,
          }}
        />
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(180deg, rgba(13,26,14,0.4) 0%, rgba(13,26,14,0.92) 100%)',
        }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '60px' }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', overflow: 'hidden', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)', flexShrink: 0 }}>
              <img src="/logo.png" alt="Zeal Healing" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            </div>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.125rem', fontWeight: 600, color: '#fff', letterSpacing: '-0.01em' }}>
              Zeal Healing
            </span>
          </Link>

          <blockquote style={{ marginBottom: '32px' }}>
            <p style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(1.75rem, 2.5vw, 2.5rem)',
              fontWeight: 400,
              lineHeight: 1.15,
              letterSpacing: '-0.02em',
              color: '#fff',
              fontStyle: 'italic',
              marginBottom: '20px',
            }}>
              "The soul always knows the way — we only need to quiet the mind to hear its wisdom."
            </p>
            <footer style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.5)', fontStyle: 'normal' }}>
              — Baghya Ashok, Founder
            </footer>
          </blockquote>

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            {['Reiki Grand Master', 'Tarot Expert', 'Bach Flower Certified'].map(badge => (
              <span key={badge} style={{
                padding: '6px 14px',
                borderRadius: '99px',
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.12)',
                fontSize: '0.75rem',
                fontWeight: 600,
                color: 'rgba(255,255,255,0.7)',
                letterSpacing: '0.04em',
              }}>
                {badge}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right: Form Panel ── */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 24px',
        minHeight: '100svh',
      }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          style={{ width: '100%', maxWidth: '400px' }}
        >
          {/* Mobile logo */}
          <div className="lg:hidden" style={{ textAlign: 'center', marginBottom: '36px' }}>
            <img src="/logo.png" alt="Zeal Healing" style={{ width: 52, height: 52, objectFit: 'contain', margin: '0 auto' }} />
          </div>

          {/* Mode Toggle */}
          <div style={{
            display: 'flex',
            background: 'var(--clr-forest-50)',
            borderRadius: 'var(--r-lg)',
            padding: '4px',
            gap: '4px',
            marginBottom: '32px',
            border: '1px solid var(--clr-border)',
          }}>
            {[
              { label: 'User Login', value: false },
              { label: 'Admin Portal', value: true },
            ].map(({ label, value }) => (
              <button
                key={label}
                type="button"
                id={`${label.toLowerCase().replace(' ', '-')}-toggle`}
                onClick={() => { if (isAdminMode !== value) toggleMode(); }}
                style={{
                  flex: 1,
                  height: 38,
                  borderRadius: 'var(--r-md)',
                  border: 'none',
                  fontFamily: 'var(--font-body)',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 200ms ease',
                  background: isAdminMode === value ? '#fff' : 'transparent',
                  color: isAdminMode === value ? 'var(--clr-forest-700)' : 'var(--clr-warm-gray)',
                  boxShadow: isAdminMode === value ? 'var(--shadow-xs)' : 'none',
                }}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Heading */}
          <motion.div
            key={isAdminMode ? 'admin' : 'user'}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            style={{ marginBottom: '32px' }}
          >
            <h1 style={{
              fontFamily: 'var(--font-display)',
              fontSize: '2.25rem',
              fontWeight: 500,
              letterSpacing: '-0.025em',
              color: 'var(--clr-ink)',
              marginBottom: '6px',
              lineHeight: 1.1,
            }}>
              {isAdminMode ? 'Admin Access' : 'Welcome back'}
            </h1>
            <p style={{ fontSize: '1rem', color: 'var(--clr-warm-gray)', lineHeight: 1.6 }}>
              {isAdminMode ? 'Restricted to authorized personnel only.' : 'Sign in to continue your journey.'}
            </p>
          </motion.div>

          {/* Form */}
          <form id="loginForm" onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <FormField
              label={isAdminMode ? 'Admin Email' : 'Email Address'}
              type="email"
              placeholder={isAdminMode ? 'admin@zealhealing.com' : 'you@example.com'}
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />

            <div className="field-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label className="field-label">Password</label>
                {!isAdminMode && (
                  <Link
                    to="/forgot-password"
                    style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--clr-forest-700)', transition: 'opacity 180ms ease' }}
                    onMouseEnter={e => e.currentTarget.style.opacity = '0.7'}
                    onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                  >
                    Forgot?
                  </Link>
                )}
              </div>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="input-field"
                  placeholder="Your password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  style={{ paddingRight: '60px' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(s => !s)}
                  style={{
                    position: 'absolute',
                    right: 0, top: 0, bottom: 0,
                    padding: '0 16px',
                    background: 'none', border: 'none',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.625rem',
                    fontWeight: 500,
                    color: 'var(--clr-warm-gray)',
                    cursor: 'pointer',
                    letterSpacing: '0.06em',
                    transition: 'color 150ms ease',
                  }}
                  onMouseEnter={e => e.currentTarget.style.color = 'var(--clr-forest-700)'}
                  onMouseLeave={e => e.currentTarget.style.color = 'var(--clr-warm-gray)'}
                >
                  {showPassword ? 'HIDE' : 'SHOW'}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="btn-primary"
              style={{ width: '100%', marginTop: '8px', fontSize: '1rem', borderRadius: 'var(--r-md)', opacity: loading ? 0.7 : 1 }}
              disabled={loading}
            >
              {loading
                ? <span style={{ display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'center' }}>
                    <span className="spinner" style={{ width: 18, height: 18, borderWidth: 1.5 }} />
                    Authenticating…
                  </span>
                : isAdminMode ? 'Sign in as Admin' : 'Sign In'
              }
            </button>
          </form>

          {/* Footer Links */}
          <div style={{ marginTop: '28px', textAlign: 'center' }}>
            {!isAdminMode ? (
              <p style={{ fontSize: '0.9375rem', color: 'var(--clr-warm-gray)' }}>
                Don't have an account?{' '}
                <Link
                  to="/register"
                  style={{ fontWeight: 600, color: 'var(--clr-forest-700)', transition: 'opacity 180ms ease' }}
                  onMouseEnter={e => e.currentTarget.style.opacity = '0.7'}
                  onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                >
                  Register free
                </Link>
              </p>
            ) : (
              <p style={{ fontSize: '0.8125rem', color: 'var(--clr-warm-gray)', lineHeight: 1.6 }}>
                Admin access is monitored and restricted to Zeal Healing staff only.
              </p>
            )}
          </div>

          <p style={{ textAlign: 'center', fontSize: '0.75rem', color: 'rgba(140,136,128,0.5)', marginTop: '40px' }}>
            © {new Date().getFullYear()} Zeal Healing
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
