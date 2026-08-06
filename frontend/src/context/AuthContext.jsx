import React, { createContext, useContext, useState, useEffect } from 'react';
import API from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('rozer_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      fetchProfile();
    } else {
      setLoading(false);
    }
  }, [token]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await API.get('/auth/me');
      setUser(res.data.user);
      setStats(res.data.stats);
    } catch (err) {
      console.error('Auth verify error:', err);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const res = await API.post('/auth/login', { email, password });
    const { token: authToken, user: userData } = res.data;
    localStorage.setItem('rozer_token', authToken);
    setToken(authToken);
    setUser(userData);
    await fetchProfile();
    return res.data;
  };

  const register = async (username, email, password) => {
    const res = await API.post('/auth/register', { username, email, password });
    const { token: authToken, user: userData } = res.data;
    localStorage.setItem('rozer_token', authToken);
    setToken(authToken);
    setUser(userData);
    await fetchProfile();
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem('rozer_token');
    setToken(null);
    setUser(null);
    setStats(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        stats,
        token,
        loading,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
        login,
        register,
        logout,
        refreshProfile: fetchProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
