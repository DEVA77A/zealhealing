import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useLocationPrompt } from '../context/LocationPromptContext';
import { usePricing } from '../context/PricingContext';
import CountryPickerField from '../components/CountryPickerField';

const Register = () => {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  // Tracks whether the visitor picked a country by hand. An explicit choice
  // must win over device geolocation, which a VPN cannot influence.
  const [countryChosen, setCountryChosen] = useState(false);
  const navigate = useNavigate();
  const { register } = useAuth();
  const { promptForLocation } = useLocationPrompt();
  const { country, currency, symbol, changeCountry, formatPrice, prices, loading: pricingLoading } = usePricing();

  const handleChange = (e) => setFormData(p => ({ ...p, [e.target.name]: e.target.value }));

  /** Apply the chosen country immediately so the preview updates as you pick. */
  const handleCountryChange = (c) => {
    setCountryChosen(true);
    changeCountry(c.country, c.currency, c.symbol, c.code);
  };

  // Live preview of the cheapest session in the selected currency.
  const previewPrice = (() => {
    if (pricingLoading || !prices?.voice) return null;
    const tiers = Object.values(prices.voice).map(Number).filter(Number.isFinite);
    return tiers.length ? formatPrice(Math.min(...tiers)) : null;
  })();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) return toast.error('Passwords do not match');
    if (formData.password.length < 6) return toast.error('Password must be at least 6 characters');
    setLoading(true);
    try {
      await register(formData.name, formData.email, formData.phone, formData.password);
      toast.success('Welcome to Zeal Healing!');

      // Only auto-detect when the visitor did not choose a country themselves.
      // Registration signs the user in, so this still runs after auth succeeds.
      if (!countryChosen) await promptForLocation();

      navigate('/');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100svh', background: 'var(--clr-parchment)', display: 'flex', alignItems: 'stretch' }}>
      {/* ── Left Panel ── */}
      <div className="hidden lg:flex" style={{ width: '45%', flexShrink: 0, position: 'relative', background: 'var(--clr-forest-900)', flexDirection: 'column', justifyContent: 'space-between', padding: '60px', overflow: 'hidden' }}>
        <img src="/hero-bg.png" alt="" aria-hidden="true" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.2 }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(13,26,14,0.5) 0%, rgba(13,26,14,0.88) 100%)' }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', overflow: 'hidden', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)', flexShrink: 0 }}>
              <img src="/logo.png" alt="Zeal Healing" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            </div>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.125rem', fontWeight: 600, color: '#fff', letterSpacing: '-0.01em' }}>
              Zeal Healing
            </span>
          </Link>
        </div>

        <div style={{ position: 'relative', zIndex: 1 }}>
          {/* Steps preview */}
          <p style={{ fontSize: '0.625rem', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(129,199,132,0.8)', marginBottom: '24px' }}>
            How It Works
          </p>
          {[
            { num: '01', title: 'Create your account', desc: 'Free & takes under a minute' },
            { num: '02', title: 'Choose your session', desc: 'Voice or video, any duration' },
            { num: '03', title: 'Book & pay securely', desc: 'Multiple payment options' },
            { num: '04', title: 'Begin your healing', desc: 'Connect with Baghya directly' },
          ].map(({ num, title, desc }) => (
            <div key={num} style={{ display: 'flex', gap: '16px', marginBottom: '24px', alignItems: 'flex-start' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', fontWeight: 500, color: 'rgba(129,199,132,0.6)', flexShrink: 0, paddingTop: '2px', letterSpacing: '0.05em' }}>
                {num}
              </span>
              <div>
                <div style={{ fontSize: '0.9375rem', fontWeight: 600, color: '#fff', marginBottom: '2px' }}>{title}</div>
                <div style={{ fontSize: '0.8125rem', color: 'rgba(255,255,255,0.45)' }}>{desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right: Form ── */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px', minHeight: '100svh' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          style={{ width: '100%', maxWidth: '420px' }}
        >
          {/* Mobile logo */}
          <div className="lg:hidden" style={{ textAlign: 'center', marginBottom: '36px' }}>
            <img src="/logo.png" alt="Zeal Healing" style={{ width: 52, height: 52, objectFit: 'contain', margin: '0 auto' }} />
          </div>

          <div style={{ marginBottom: '36px' }}>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.25rem', fontWeight: 500, letterSpacing: '-0.025em', color: 'var(--clr-ink)', marginBottom: '6px', lineHeight: 1.1 }}>
              Join Zeal Healing
            </h1>
            <p style={{ fontSize: '1rem', color: 'var(--clr-warm-gray)', lineHeight: 1.6 }}>
              Create your account and begin your spiritual journey.
            </p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {[
              { label: 'Full Name', name: 'name', type: 'text', placeholder: 'Your full name' },
              { label: 'Email Address', name: 'email', type: 'email', placeholder: 'you@example.com' },
              { label: 'Phone Number', name: 'phone', type: 'tel', placeholder: '+91 9876543210' },
            ].map(field => (
              <div key={field.name} className="field-group">
                <label className="field-label">{field.label}</label>
                <input
                  type={field.type}
                  name={field.name}
                  className="input-field"
                  placeholder={field.placeholder}
                  value={formData[field.name]}
                  onChange={handleChange}
                  required
                />
              </div>
            ))}

            {/* Password */}
            <div className="field-group">
              <label className="field-label">Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  className="input-field"
                  placeholder="Choose a strong password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  style={{ paddingRight: '60px' }}
                />
                <button type="button" onClick={() => setShowPassword(s => !s)} style={{ position: 'absolute', right: 0, top: 0, bottom: 0, padding: '0 16px', background: 'none', border: 'none', fontFamily: 'var(--font-mono)', fontSize: '0.625rem', fontWeight: 500, color: 'var(--clr-warm-gray)', cursor: 'pointer', letterSpacing: '0.06em' }}>
                  {showPassword ? 'HIDE' : 'SHOW'}
                </button>
              </div>
            </div>

            {/* Country -> drives the currency prices are shown in */}
            <CountryPickerField
              label="Country"
              value={country}
              onChange={handleCountryChange}
              hint={
                previewPrice
                  ? `Prices will be shown in ${currency} (${symbol}) — sessions from ${previewPrice}.`
                  : 'Choose your country to see prices in your local currency.'
              }
            />

            {/* Confirm Password */}
            <div className="field-group">
              <label className="field-label">Confirm Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showConfirm ? 'text' : 'password'}
                  name="confirmPassword"
                  className="input-field"
                  placeholder="Repeat your password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  style={{ paddingRight: '60px' }}
                />
                <button type="button" onClick={() => setShowConfirm(s => !s)} style={{ position: 'absolute', right: 0, top: 0, bottom: 0, padding: '0 16px', background: 'none', border: 'none', fontFamily: 'var(--font-mono)', fontSize: '0.625rem', fontWeight: 500, color: 'var(--clr-warm-gray)', cursor: 'pointer', letterSpacing: '0.06em' }}>
                  {showConfirm ? 'HIDE' : 'SHOW'}
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
                    Creating account…
                  </span>
                : 'Create Account'
              }
            </button>
          </form>

          <p style={{ textAlign: 'center', fontSize: '0.9375rem', color: 'var(--clr-warm-gray)', marginTop: '24px' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ fontWeight: 600, color: 'var(--clr-forest-700)', transition: 'opacity 180ms ease' }}
              onMouseEnter={e => e.currentTarget.style.opacity = '0.7'}
              onMouseLeave={e => e.currentTarget.style.opacity = '1'}
            >
              Sign In
            </Link>
          </p>

          <p style={{ textAlign: 'center', fontSize: '0.75rem', color: 'rgba(140,136,128,0.5)', marginTop: '40px' }}>
            By registering, you agree to our{' '}
            <Link to="/terms" style={{ opacity: 0.7, textDecoration: 'underline' }}>Terms</Link>{' '}
            and{' '}
            <Link to="/privacy" style={{ opacity: 0.7, textDecoration: 'underline' }}>Privacy Policy</Link>.
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Register;
