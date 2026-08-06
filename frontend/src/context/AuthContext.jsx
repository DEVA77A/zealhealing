import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
      setUser(JSON.parse(userInfo));
    }
    setLoading(false);
  }, []);

  /**
   * Authenticate and persist the session.
   *
   * Note: this deliberately does NOT set the pricing country. Location is
   * resolved after login by useLocationPrompt(), which prefers precise browser
   * geolocation and only falls back to the coarse IP result. Applying the IP
   * location here as well caused two competing updates and a visible price
   * flip. The IP-derived `data.location` is still returned for callers.
   */
  const login = async (email, password) => {
    const { data } = await axios.post('/api/auth/login', { email, password });
    setUser(data);
    localStorage.setItem('userInfo', JSON.stringify(data));
    return data;
  };

  const register = async (name, email, phone, password) => {
    const { data } = await axios.post('/api/auth/register', { name, email, phone, password });
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
