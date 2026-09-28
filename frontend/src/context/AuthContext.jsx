import React, { createContext, useContext, useState, useEffect } from 'react';
import API from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('rozer_access_token') || localStorage.getItem('rozer_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      fetchProfile();
    } else {
      setUser(null);
      setLoading(false);
    }
  }, [token]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await API.get('/auth/me', { timeout: 6000 });
      const payload = res.data?.data || res.data;
      if (payload && payload.user) {
        setUser(payload.user);
        setStats(payload.stats || null);
      } else {
        setUser(payload || null);
      }
    } catch (err) {
      console.error('Auth verify error:', err);
      localStorage.removeItem('rozer_access_token');
      localStorage.removeItem('rozer_token');
      localStorage.removeItem('rozer_refresh_token');
      setToken(null);
      setUser(null);
      setStats(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const res = await API.post('/auth/login', { email, password });
    const payload = res.data?.data || res.data;
    const { accessToken, refreshToken, user: userData } = payload;
    
    if (accessToken) {
      localStorage.setItem('rozer_access_token', accessToken);
      localStorage.setItem('rozer_token', accessToken);
    }
    if (refreshToken) {
      localStorage.setItem('rozer_refresh_token', refreshToken);
    }

    setToken(accessToken || 'authenticated');
    setUser(userData);
    await fetchProfile();
    return res.data;
  };

  const register = async (registrationData) => {
    const res = await API.post('/auth/register', registrationData);
    const payload = res.data?.data || res.data;
    const { accessToken, refreshToken, user: userData } = payload;
    
    if (accessToken) {
      localStorage.setItem('rozer_access_token', accessToken);
      localStorage.setItem('rozer_token', accessToken);
    }
    if (refreshToken) {
      localStorage.setItem('rozer_refresh_token', refreshToken);
    }

    setToken(accessToken || 'authenticated');
    setUser(userData);
    await fetchProfile();
    return res.data;
  };

  const logout = async () => {
    try {
      await API.post('/auth/logout').catch(() => {});
    } catch (err) {
      // Ignore logout errors
    } finally {
      localStorage.removeItem('rozer_access_token');
      localStorage.removeItem('rozer_token');
      localStorage.removeItem('rozer_refresh_token');
      setToken(null);
      setUser(null);
      setStats(null);
      setLoading(false);
    }
  };

  const updateUserProfile = (updatedUser) => {
    setUser(prev => ({ ...prev, ...updatedUser }));
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
        updateUserProfile,
        refreshProfile: fetchProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
