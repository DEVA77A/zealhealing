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
      const { data } = await axios.post('http://localhost:5000/api/auth/forgot-password', { email });
      toast.success(data.message || 'Reset link sent to your email');
      // For development/demo purposes, alert the token so it can be copied easily
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
    <div className="min-h-screen pt-24 pb-12 flex items-center justify-center bg-sage-50 px-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="card w-full max-w-md"
      >
        <div className="flex justify-center mb-6">
          <img src="/logo.png" alt="Zeal Healing Logo" className="h-20 w-20 object-contain mix-blend-multiply" />
        </div>
        <h2 className="text-3xl font-serif font-bold text-center text-darkGreen mb-4">Forgot Password</h2>
        <p className="text-center text-sage-600 mb-8">
          Enter your email address and we'll send you a link or token to reset your password.
        </p>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sage-800 font-medium mb-2">Email Address</label>
            <input 
              type="email" 
              className="input-field" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
            />
          </div>
          
          <button type="submit" className="btn-primary w-full py-3 text-lg" disabled={loading}>
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>

        <p className="mt-8 text-center text-sage-700">
          Remember your password? <Link to="/login" className="text-darkGreen font-semibold hover:underline">Sign In</Link>
        </p>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;
