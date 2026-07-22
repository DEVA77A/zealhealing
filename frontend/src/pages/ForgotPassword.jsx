import { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await axios.post('/api/auth/forgot-password', { email });
      toast.success(data.message || 'Reset link sent to your email');
      if (data.resetToken) {
        toast.info(`Dev Notice: Your token is ${data.resetToken}`, { autoClose: false });
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to process request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100svh', background: 'var(--clr-parchment)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        style={{ width: '100%', maxWidth: '400px' }}
      >
        <div style={{
          background: '#fff',
          border: '1px solid var(--clr-border)',
          borderRadius: 'var(--r-xl)',
          padding: '40px',
          boxShadow: 'var(--shadow-sm)',
        }}>
          {/* Logo */}
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <img src="/logo.png" alt="Zeal Healing" style={{ width: 52, height: 52, objectFit: 'contain' }} />
          </div>

          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.875rem', fontWeight: 500, color: 'var(--clr-ink)', textAlign: 'center', marginBottom: '8px' }}>
            Restore Password
          </h2>
          <p style={{ fontSize: '0.9375rem', color: 'var(--clr-warm-gray)', textAlign: 'center', lineHeight: 1.6, marginBottom: '28px' }}>
            Enter your email and we'll send you instructions to reset your password.
          </p>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="field-group">
              <label className="field-label">Email Address</label>
              <input
                type="email"
                className="input-field"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="btn-primary"
              style={{ width: '100%', marginTop: '8px', borderRadius: 'var(--r-md)' }}
              disabled={loading}
            >
              {loading ? 'Sending link…' : 'Send Instructions'}
            </button>
          </form>

          <p style={{ textAlign: 'center', fontSize: '0.9375rem', color: 'var(--clr-warm-gray)', marginTop: '28px' }}>
            Remember your credentials?{' '}
            <Link to="/login" style={{ fontWeight: 600, color: 'var(--clr-forest-700)', transition: 'opacity 180ms ease' }}
              onMouseEnter={e => e.currentTarget.style.opacity = '0.7'}
              onMouseLeave={e => e.currentTarget.style.opacity = '1'}
            >
              Sign In
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;
