import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaLeaf } from 'react-icons/fa';
import { usePricing } from '../context/PricingContext';
import { useAuth } from '../context/AuthContext';
import countriesList from '../data/countries.json';
import CountrySelector from './CountrySelector';

const Navbar = () => {
  const { country, currency, changeCountry, loading } = usePricing();
  const { user, logout } = useAuth();

  const handleCountrySelect = (selectedCountry) => {
    changeCountry(selectedCountry.country, selectedCountry.currency, selectedCountry.symbol);
  };

  return (
    <nav className="fixed w-full z-50 transition-all duration-300 bg-sage-50/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          
          {/* Logo Section */}
          <Link to="/" className="flex items-center gap-2 z-50 relative group">
            <img src="/logo.png" alt="Zeal Healing Logo" className="h-14 w-14 object-contain mix-blend-multiply" />
            <span className="font-serif text-2xl font-semibold text-darkGreen tracking-tight">
              Zeal Healing
            </span>
          </Link>

          {/* Center Links (Desktop) */}
          <div className="hidden md:flex space-x-8">
            <Link to="/" className="text-sage-800 hover:text-darkGreen transition-colors font-medium border-b-2 border-transparent hover:border-darkGreen">Home</Link>
            <Link to="/classes" className="text-sage-800 hover:text-darkGreen transition-colors font-medium border-b-2 border-transparent hover:border-darkGreen">Classes</Link>
            <Link to="/sessions" className="text-sage-800 hover:text-darkGreen transition-colors font-medium border-b-2 border-transparent hover:border-darkGreen">Sessions</Link>
            <Link to="/about" className="text-sage-800 hover:text-darkGreen transition-colors font-medium border-b-2 border-transparent hover:border-darkGreen">About</Link>
          </div>

          {/* Right Section */}
          <div className="hidden md:flex items-center space-x-4">
            {!loading && (
              <CountrySelector
                countriesList={countriesList}
                country={country}
                currency={currency}
                onCountryChange={handleCountrySelect}
              />
            )}

            {user ? (
              <div className="flex items-center space-x-4">
                <Link to={user.role === 'admin' ? "/admin" : "/"} className="text-sage-800 font-medium hover:text-darkGreen transition-colors">
                  {user.name}
                </Link>
                <button onClick={logout} className="text-sage-800 font-medium hover:text-darkGreen transition-colors">
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link to="/login" className="text-sage-800 font-medium hover:text-darkGreen transition-colors">Login</Link>
                <Link to="/register" className="text-sage-800 font-medium hover:text-darkGreen transition-colors">Register</Link>
              </div>
            )}

            <Link to="/sessions">
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="btn-primary"
              >
                Book a Session
              </motion.button>
            </Link>
          </div>

          {/* Mobile Menu Button - simplified for now */}
          <div className="md:hidden flex items-center">
            <button className="text-sage-800 hover:text-darkGreen focus:outline-none">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"/>
              </svg>
            </button>
          </div>
          
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
