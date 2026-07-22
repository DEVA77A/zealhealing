import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';

const ResetPassword = () => {
  const [token, setToken] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      return toast.error('Passwords do not match');
    }

    setLoading(true);
    try {
      const { data } = await axios.post('/api/auth/reset-password', {
        resetToken: token,
        newPassword: password,
      });
      toast.success(data.message || 'Password reset successfully');
      navigate('/login');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to reset password');
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
            Reset Password
          </h2>
          <p style={{ fontSize: '0.9375rem', color: 'var(--clr-warm-gray)', textAlign: 'center', lineHeight: 1.6, marginBottom: '28px' }}>
            Enter your reset token and your new password details below.
          </p>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="field-group">
              <label className="field-label">Reset Token</label>
              <input
                type="text"
                className="input-field"
                placeholder="Enter reset token"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                required
              />
            </div>

            <div className="field-group">
              <label className="field-label">New Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="input-field"
                  placeholder="New password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  style={{ paddingRight: '60px' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(s => !s)}
                  style={{ position: 'absolute', right: 0, top: 0, bottom: 0, padding: '0 16px', background: 'none', border: 'none', fontFamily: 'var(--font-mono)', fontSize: '0.625rem', fontWeight: 500, color: 'var(--clr-warm-gray)', cursor: 'pointer', letterSpacing: '0.06em' }}
                >
                  {showPassword ? 'HIDE' : 'SHOW'}
                </button>
              </div>
            </div>

            <div className="field-group">
              <label className="field-label">Confirm Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  className="input-field"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  style={{ paddingRight: '60px' }}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(s => !s)}
                  style={{ position: 'absolute', right: 0, top: 0, bottom: 0, padding: '0 16px', background: 'none', border: 'none', fontFamily: 'var(--font-mono)', fontSize: '0.625rem', fontWeight: 500, color: 'var(--clr-warm-gray)', cursor: 'pointer', letterSpacing: '0.06em' }}
                >
                  {showConfirmPassword ? 'HIDE' : 'SHOW'}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="btn-primary"
              style={{ width: '100%', marginTop: '8px', borderRadius: 'var(--r-md)' }}
              disabled={loading}
            >
              {loading ? 'Resetting password…' : 'Reset Password'}
            </button>
          </form>

          <p style={{ textAlign: 'center', fontSize: '0.9375rem', color: 'var(--clr-warm-gray)', marginTop: '28px' }}>
            Go back to{' '}
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

export default ResetPassword;
