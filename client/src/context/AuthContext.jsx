import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('hi_user')); } catch { return null; }
  });
  const [loading, setLoading] = useState(() => {
    return !!localStorage.getItem('hi_token');
  });

  useEffect(() => {
    const token = localStorage.getItem('hi_token');
    if (token) {
      api.get('/auth/me')
        .then(r => { setUser(r.data.user); localStorage.setItem('hi_user', JSON.stringify(r.data.user)); })
        .catch(() => { localStorage.removeItem('hi_token'); localStorage.removeItem('hi_user'); setUser(null); })
        .finally(() => setLoading(false));
    } else { setLoading(false); }
  }, []);

  // Inactivity Auto-Logout (30 minutes)
  useEffect(() => {
    if (!user) return; // Only track when logged in
    
    let timeoutId;
    const INACTIVITY_LIMIT = 30 * 60 * 1000; // 30 minutes
    
    const resetTimer = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        logout();
        // Optional: you could use a toast here if imported, but context can't easily trigger toast without breaking pureness, 
        // relying on the redirect from AuthGuards to send them to login.
        alert('Session expired due to inactivity. Please log in again.');
      }, INACTIVITY_LIMIT);
    };

    // Listeners for activity
    const events = ['mousemove', 'keydown', 'scroll', 'click'];
    events.forEach(e => window.addEventListener(e, resetTimer));
    resetTimer(); // Start the timer

    return () => {
      clearTimeout(timeoutId);
      events.forEach(e => window.removeEventListener(e, resetTimer));
    };
  }, [user]);

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem('hi_token', data.token);
    localStorage.setItem('hi_user', JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  };

  const register = async (nameOrPayload, email, password) => {
    // Supports both: register('name','email','pass') and register({ name, email, password, role, ... })
    const payload = typeof nameOrPayload === 'object'
      ? nameOrPayload
      : { name: nameOrPayload, email, password };
    const { data } = await api.post('/auth/register', payload);
    localStorage.setItem('hi_token', data.token);
    localStorage.setItem('hi_user', JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  };

  const logout = () => {
    localStorage.removeItem('hi_token');
    localStorage.removeItem('hi_user');
    setUser(null);
  };

  const updateUser = (updated) => {
    setUser(updated);
    localStorage.setItem('hi_user', JSON.stringify(updated));
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
