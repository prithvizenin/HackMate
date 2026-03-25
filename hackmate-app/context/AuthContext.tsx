'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import api from '@/lib/api';

const AuthContext = createContext<any>(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('hackmate_user');
      return stored ? JSON.parse(stored) : null;
    }
    return null;
  });
  
  const [token, setToken] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('hackmate_token');
    }
    return null;
  });
  
  const [loading, setLoading] = useState(false);

  const login = async (email: string, password: string) => {
    const res = await api.post('/api/auth/login', { email, password });
    const { token: newToken, user: newUser } = res.data;
    
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('hackmate_token', newToken);
    localStorage.setItem('hackmate_user', JSON.stringify(newUser));
    return res.data;
  };

  const register = async (name: string, email: string, password: string) => {
    await api.post('/api/auth/register', { name, email, password });
    return login(email, password);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('hackmate_token');
    localStorage.removeItem('hackmate_user');
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};
