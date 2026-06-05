import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { usePricing } from './PricingContext';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const { changeCountry } = usePricing();

  useEffect(() => {
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
      setUser(JSON.parse(userInfo));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const { data } = await axios.post('http://localhost:5000/api/auth/login', { email, password });
    
    // Auto-detect and set pricing context based on login location
    if (data.location) {
      changeCountry(data.location.country, data.location.currency, data.location.currencySymbol);
    }
    
    setUser(data);
    localStorage.setItem('userInfo', JSON.stringify(data));
    return data;
  };

  const register = async (name, email, phone, password) => {
    const { data } = await axios.post('http://localhost:5000/api/auth/register', { name, email, phone, password });
    setUser(data);
    localStorage.setItem('userInfo', JSON.stringify(data));
    return data;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('userInfo');
  };

  const getToken = () => {
    return user ? user.token : null;
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading, getToken }}>
      {children}
    </AuthContext.Provider>
  );
};
