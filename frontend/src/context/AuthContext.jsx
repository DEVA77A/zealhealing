import { createContext, useCallback, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const [sessionError, setSessionError] = useState(false);
  const [restoredSession, setRestoredSession] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    let token;
    try {
      token = JSON.parse(localStorage.getItem('userInfo'))?.token;
    } catch {
      // A malformed legacy cache cannot be used to restore a session.
    }
    axios.post('/api/auth/session', {}, {
      headers: token ? { Authorization: 'Bearer ' + token } : undefined,
      signal: controller.signal,
      timeout: 10000,
    }).then(({ data }) => {
      localStorage.removeItem('userInfo');
      setUser(data);
      setRestoredSession(true);
    }).catch(error => {
      if (axios.isCancel(error)) return;
      if (error.response?.status === 401) localStorage.removeItem('userInfo');
      else setSessionError(true);
    }).finally(() => {
      if (!controller.signal.aborted) setLoading(false);
    });
    return () => controller.abort();
  }, [attempt]);

  const retrySession = () => {
    setSessionError(false);
    setLoading(true);
    setAttempt(value => value + 1);
  };

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
    localStorage.removeItem('userInfo');
    return data;
  };

  const register = async (name, email, phone, password) => {
    const { data } = await axios.post('/api/auth/register', { name, email, phone, password });
    setUser(data);
    localStorage.removeItem('userInfo');
    return data;
  };

  const logout = async () => {
    try {
      await axios.post('/api/auth/logout', {}, {
        headers: user?.token ? { Authorization: 'Bearer ' + user.token } : undefined,
        timeout: 10000,
      });
      setUser(null);
      setRestoredSession(false);
      localStorage.removeItem('userInfo');
      return true;
    } catch {
      toast.error('Could not sign out. Please try again.');
      return false;
    }
  };

  const getToken = useCallback(() => user?.token || null, [user?.token]);

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading, getToken, restoredSession, sessionError, retrySession }}>
      {children}
    </AuthContext.Provider>
  );
};
