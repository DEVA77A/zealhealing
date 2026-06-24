import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { usePricing } from '../context/PricingContext';
import { getCurrencyByCountryCode } from '../utils/currencyMap';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isAdminMode, setIsAdminMode] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const { changeCountry } = usePricing();

  const from = location.state?.from || '/';

  const getLocation = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Not supported"));
      } else {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          timeout: 15000,
          enableHighAccuracy: true,
          maximumAge: 0
        });
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    let locationPromise = null;
    if (navigator.geolocation) {
      locationPromise = getLocation();
    }

    try {
      const userData = await login(email, password);

      // If admin mode is selected, verify the user is actually an admin
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
      
      // For regular users, never redirect to admin routes
      const userRedirect = from.startsWith('/admin') ? '/' : from;

      // Normal user login with location detection
      if (locationPromise) {
        toast.info('Please select an option on the location popup...', { autoClose: false, toastId: 'geo-toast' });
        try {
          const position = await locationPromise;
          const { latitude, longitude } = position.coords;
          
          toast.info('Location received! Fetching local pricing...', { toastId: 'geo-toast' });
          const res = await axios.get(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
          
          if (res.data && res.data.address && res.data.address.country_code) {
            const countryCode = res.data.address.country_code.toUpperCase();
            const countryName = res.data.address.country;
            const { currency, symbol } = getCurrencyByCountryCode(countryCode);
            
            changeCountry(countryName, currency, symbol);
            toast.success(`Pricing updated to ${currency}!`);
          } else {
            throw new Error("Invalid geocode data");
          }
        } catch (err) {
          console.error('Location denied/failed, attempting Frontend IP Fallback', err);
          try {
            const ipRes = await axios.get('https://ipapi.co/json/');
            if (ipRes.data && ipRes.data.country_code) {
              const countryCode = ipRes.data.country_code.toUpperCase();
              const countryName = ipRes.data.country_name;
              const { currency, symbol } = getCurrencyByCountryCode(countryCode);
              changeCountry(countryName, currency, symbol);
              toast.success(`Pricing updated to ${currency} (via VPN/IP detection)!`);
            }
          } catch (ipErr) {
            toast.success('Logged in! (Default location used)');
          }
        } finally {
          toast.dismiss('geo-toast');
          navigate(userRedirect, { replace: true });
        }
      } else {
        toast.success('Logged in successfully!');
        navigate(userRedirect, { replace: true });
      }
      
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed');
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsAdminMode(!isAdminMode);
    setEmail('');
    setPassword('');
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

        {/* Login Mode Toggle */}
        <div className="flex rounded-xl overflow-hidden mb-6 border-2 border-sage-200">
          <button
            type="button"
            id="userModeToggle"
            onClick={() => { if (isAdminMode) toggleMode(); }}
            className={`flex-1 py-2.5 text-sm font-semibold transition-all duration-300 ${
              !isAdminMode
                ? 'bg-darkGreen text-white shadow-md'
                : 'bg-white text-sage-600 hover:bg-sage-50'
            }`}
          >
            👤 User Login
          </button>
          <button
            type="button"
            id="adminModeToggle"
            onClick={() => { if (!isAdminMode) toggleMode(); }}
            className={`flex-1 py-2.5 text-sm font-semibold transition-all duration-300 ${
              isAdminMode
                ? 'bg-darkGreen text-white shadow-md'
                : 'bg-white text-sage-600 hover:bg-sage-50'
            }`}
          >
            🛡️ Admin Login
          </button>
        </div>

        <motion.h2
          key={isAdminMode ? 'admin' : 'user'}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-serif font-bold text-center text-darkGreen mb-8"
        >
          {isAdminMode ? 'Admin Portal' : 'Welcome Back'}
        </motion.h2>
        
        <form id="loginForm" onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sage-800 font-medium mb-2">
              {isAdminMode ? 'Admin Email' : 'Email Address'}
            </label>
            <input 
              type="email" 
              className="input-field" 
              placeholder={isAdminMode ? 'Enter admin email' : 'Enter your email'}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
            />
          </div>
          <div>
            <label className="block text-sage-800 font-medium mb-2">Password</label>
            <div className="relative">
              <input 
                type={showPassword ? 'text' : 'password'} 
                className="input-field w-full pr-10" 
                placeholder="Enter your password"
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
          
          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center text-sage-700">
              <input type="checkbox" className="mr-2 rounded text-darkGreen focus:ring-darkGreen" />
              Remember Me
            </label>
            {!isAdminMode && (
              <Link to="/forgot-password" className="text-darkGreen hover:underline">Forgot Password?</Link>
            )}
          </div>

          <button type="submit" className="btn-primary w-full py-3 text-lg" disabled={loading}>
            {loading ? 'Authenticating...' : (isAdminMode ? '🛡️ Sign In as Admin' : 'Sign In')}
          </button>
        </form>

        {!isAdminMode && (
          <p className="mt-8 text-center text-sage-700">
            Don't have an account? <Link to="/register" className="text-darkGreen font-semibold hover:underline">Register</Link>
          </p>
        )}
        {isAdminMode && (
          <p className="mt-8 text-center text-sage-500 text-sm">
            Admin access is restricted to authorized personnel only.
          </p>
        )}
      </motion.div>
    </div>
  );
};

export default Login;
