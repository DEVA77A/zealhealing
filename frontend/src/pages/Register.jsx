import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const navigate = useNavigate();
  const { register } = useAuth();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      return toast.error('Passwords do not match');
    }
    
    try {
      await register(formData.name, formData.email, formData.phone, formData.password);
      toast.success('Registration successful!');
      navigate('/');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
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
        <h2 className="text-3xl font-serif font-bold text-center text-darkGreen mb-8">Create an Account</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sage-800 font-medium mb-1">Full Name</label>
            <input 
              type="text" 
              name="name"
              className="input-field" 
              value={formData.name}
              onChange={handleChange}
              required 
            />
          </div>
          <div>
            <label className="block text-sage-800 font-medium mb-1">Email Address</label>
            <input 
              type="email" 
              name="email"
              className="input-field" 
              value={formData.email}
              onChange={handleChange}
              required 
            />
          </div>
          <div>
            <label className="block text-sage-800 font-medium mb-1">Phone Number</label>
            <input 
              type="tel" 
              name="phone"
              className="input-field" 
              value={formData.phone}
              onChange={handleChange}
              required 
            />
          </div>
          <div>
            <label className="block text-sage-800 font-medium mb-1">Password</label>
            <div className="relative">
              <input 
                type={showPassword ? 'text' : 'password'} 
                name="password"
                className="input-field w-full pr-10" 
                value={formData.password}
                onChange={handleChange}
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
            <label className="block text-sage-800 font-medium mb-1">Confirm Password</label>
            <div className="relative">
              <input 
                type={showConfirmPassword ? 'text' : 'password'} 
                name="confirmPassword"
                className="input-field w-full pr-10" 
                value={formData.confirmPassword}
                onChange={handleChange}
                required 
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm text-sage-600 hover:text-darkGreen"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>
          
          <button type="submit" className="btn-primary w-full py-3 text-lg mt-4">
            Register
          </button>
        </form>

        <p className="mt-6 text-center text-sage-700">
          Already have an account? <Link to="/login" className="text-darkGreen font-semibold hover:underline">Sign In</Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Register;
