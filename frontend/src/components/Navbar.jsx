import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaLeaf, FaBars, FaTimes } from 'react-icons/fa';
import { usePricing } from '../context/PricingContext';
import { useAuth } from '../context/AuthContext';
import countriesList from '../data/countries.json';
import CountrySelector from './CountrySelector';

const Navbar = () => {
  const { country, currency, changeCountry, loading } = usePricing();
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleCountrySelect = (selectedCountry) => {
    changeCountry(selectedCountry.country, selectedCountry.currency, selectedCountry.symbol);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className="fixed w-full z-50 transition-all duration-300 bg-sage-50/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          
          {/* Logo Section */}
          <Link to="/" className="flex items-center gap-2 z-50 relative group" onClick={closeMobileMenu}>
            <img src="/logo.png" alt="Zeal Healing Logo" className="h-14 w-14 object-contain shadow-sm rounded-full" />
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

          {/* Right Section (Desktop) */}
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
                <Link to={user.role === 'admin' ? "/admin" : "/profile"} className="text-sage-800 font-medium hover:text-darkGreen transition-colors flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-sage-200 flex items-center justify-center text-sm text-darkGreen font-bold">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
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

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center z-50">
            <button 
              onClick={toggleMobileMenu}
              className="text-sage-800 hover:text-darkGreen focus:outline-none p-2"
            >
              {isMobileMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
            </button>
          </div>
          
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="md:hidden absolute top-20 left-0 w-full bg-sage-50 border-t border-sage-200 shadow-xl"
          >
            <div className="px-4 pt-2 pb-6 space-y-4 flex flex-col max-h-[80vh] overflow-y-auto">
              
              <Link to="/" onClick={closeMobileMenu} className="block px-3 py-2 rounded-md text-base font-medium text-sage-800 hover:text-darkGreen hover:bg-sage-100">Home</Link>
              <Link to="/classes" onClick={closeMobileMenu} className="block px-3 py-2 rounded-md text-base font-medium text-sage-800 hover:text-darkGreen hover:bg-sage-100">Classes</Link>
              <Link to="/sessions" onClick={closeMobileMenu} className="block px-3 py-2 rounded-md text-base font-medium text-sage-800 hover:text-darkGreen hover:bg-sage-100">Sessions</Link>
              <Link to="/about" onClick={closeMobileMenu} className="block px-3 py-2 rounded-md text-base font-medium text-sage-800 hover:text-darkGreen hover:bg-sage-100">About</Link>
              
              <div className="px-3 py-2">
                {!loading && (
                  <CountrySelector
                    countriesList={countriesList}
                    country={country}
                    currency={currency}
                    onCountryChange={(c) => { handleCountrySelect(c); closeMobileMenu(); }}
                  />
                )}
              </div>
              
              <div className="border-t border-sage-200 pt-4 pb-2">
                {user ? (
                  <div className="space-y-2">
                    <Link to={user.role === 'admin' ? "/admin" : "/profile"} onClick={closeMobileMenu} className="flex items-center gap-3 px-3 py-2 rounded-md text-base font-medium text-sage-800 hover:text-darkGreen hover:bg-sage-100">
                      <div className="w-8 h-8 rounded-full bg-sage-200 flex items-center justify-center text-sm text-darkGreen font-bold">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      {user.name}
                    </Link>
                    <button 
                      onClick={() => { logout(); closeMobileMenu(); }} 
                      className="w-full text-left px-3 py-2 rounded-md text-base font-medium text-sage-800 hover:text-darkGreen hover:bg-sage-100"
                    >
                      Logout
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Link to="/login" onClick={closeMobileMenu} className="block px-3 py-2 rounded-md text-base font-medium text-sage-800 hover:text-darkGreen hover:bg-sage-100">Login</Link>
                    <Link to="/register" onClick={closeMobileMenu} className="block px-3 py-2 rounded-md text-base font-medium text-sage-800 hover:text-darkGreen hover:bg-sage-100">Register</Link>
                  </div>
                )}
              </div>
              
              <div className="px-3 mt-4">
                <Link to="/sessions" onClick={closeMobileMenu}>
                  <button className="btn-primary w-full py-3 text-center">
                    Book a Session
                  </button>
                </Link>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </nav>
  );
};

export default Navbar;
