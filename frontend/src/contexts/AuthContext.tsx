import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api } from '../lib/api';
import type { User } from '../types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

interface RegisterData {
  email: string;
  password: string;
  role?: string;
  professionalId?: string;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      refreshUser().finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  async function refreshUser() {
    try {
      const userData = await api.getMe();
      setUser(userData);
      setError(null);
    } catch (err) {
      localStorage.removeItem('token');
      setUser(null);
    }
  }

  async function login(email: string, password: string) {
    setError(null);
    try {
      const { user, token } = await api.login(email, password);
      localStorage.setItem('token', token);
      setUser(user);
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  }

  async function register(data: RegisterData) {
    setError(null);
    try {
      const { user, token } = await api.register(data);
      localStorage.setItem('token', token);
      setUser(user);
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  }

  function logout() {
    localStorage.removeItem('token');
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, error, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
