import React, { createContext, useContext, useState, useCallback } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const persist = (data) => {
    const { token, ...userData } = data;
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  const register = useCallback(async ({ name, email, password }) => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.post('/auth/register', { name, email, password });
      persist(data);
      return true;
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async ({ email, password }) => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.post('/auth/login', { email, password });
      persist(data);
      return true;
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  }, []);

  const updateBudget = useCallback(async (monthlyBudget) => {
    const { data } = await api.put('/auth/me', { monthlyBudget });
    setUser(data);
    localStorage.setItem('user', JSON.stringify(data));
    return data;
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, loading, error, register, login, logout, updateBudget }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};
