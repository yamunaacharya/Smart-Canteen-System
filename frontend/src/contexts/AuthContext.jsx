import { createContext, useContext, useEffect, useState } from 'react';
import * as authService from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('user')) || null;
    } catch (e) {
      return null;
    }
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function init() {
      const token = localStorage.getItem('token');
      if (!token) return;
      setLoading(true);
      try {
        const me = await authService.me();
        setUser(me);
        localStorage.setItem('user', JSON.stringify(me));
      } catch (e) {
        console.error('Failed to refresh user', e);
        authService.logout();
        setUser(null);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, []);

  async function login(data) {
    setLoading(true);
    try {
      const { user } = await authService.login(data);
      setUser(user);
      return user;
    } finally {
      setLoading(false);
    }
  }

  async function register(data) {
    setLoading(true);
    try {
      const { user } = await authService.register(data);
      setUser(user);
      return user;
    } finally {
      setLoading(false);
    }
  }

  function logout() {
    authService.logout();
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
