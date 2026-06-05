import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';

const ResetPassword = () => {
  const [token, setToken] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      return toast.error('Passwords do not match');
    }

    setLoading(true);
    try {
      const { data } = await axios.post('http://localhost:5000/api/auth/reset-password', {
        resetToken: token,
        newPassword: password
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
    <div className="min-h-screen pt-24 pb-12 flex items-center justify-center bg-sage-50 px-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="card w-full max-w-md"
      >
        <div className="flex justify-center mb-6">
          <img src="/logo.png" alt="Zeal Healing Logo" className="h-20 w-20 object-contain mix-blend-multiply" />
        </div>
        <h2 className="text-3xl font-serif font-bold text-center text-darkGreen mb-4">Reset Password</h2>
        <p className="text-center text-sage-600 mb-8">
          Enter your reset token and your new password below.
        </p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sage-800 font-medium mb-1">Reset Token</label>
            <input 
              type="text" 
              className="input-field" 
              value={token}
              onChange={(e) => setToken(e.target.value)}
              required 
            />
          </div>
          <div>
            <label className="block text-sage-800 font-medium mb-1">New Password</label>
            <div className="relative">
              <input 
                type={showPassword ? 'text' : 'password'} 
                className="input-field w-full pr-10" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required 
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm text-sage-600 hover:text-darkGreen"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sage-800 font-medium mb-1">Confirm New Password</label>
            <input 
              type={showPassword ? 'text' : 'password'} 
              className="input-field" 
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required 
            />
          </div>
          
          <button type="submit" className="btn-primary w-full py-3 text-lg mt-4" disabled={loading}>
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default ResetPassword;
