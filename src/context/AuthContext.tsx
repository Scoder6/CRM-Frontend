import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from '@/hooks/use-toast';

export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'Admin' | 'User';
  createdAt: string;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Resolve API base URL from env (supports Vite and Next.js)
const API_URL =
  (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_API_URL) ||
  (typeof process !== 'undefined' && (process as any).env?.NEXT_PUBLIC_API_URL)
function persist(remember: boolean, key: string, value: string) {
  (remember ? localStorage : sessionStorage).setItem(key, value);
}

function readPersistedAuth() {
  const token = localStorage.getItem('crm_token') || sessionStorage.getItem('crm_token');
  const userStr = localStorage.getItem('crm_user') || sessionStorage.getItem('crm_user');
  return { token, user: userStr ? (JSON.parse(userStr) as User) : null };
}

async function apiFetch(path: string, options: RequestInit = {}) {
  const token = localStorage.getItem('crm_token') || sessionStorage.getItem('crm_token');
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
  const res = await fetch(`${API_URL}${path}`, { ...options, headers });
  if (!res.ok) {
    let message = `Request failed: ${res.status}`;
    try {
      const body = await res.json();
      if (body?.error) message = body.error;
    } catch {}
    throw new Error(message);
  }
  return res.json();
}

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { token: t, user: u } = readPersistedAuth();
    if (t && u) {
      setToken(t);
      setUser(u);
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string, rememberMe = false) => {
    setLoading(true);
    try {
      const data = await apiFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      const userData: User = {
        _id: data.user.id, // backend returns { id, name, email, role }
        name: data.user.name,
        email: data.user.email,
        role: data.user.role,
        createdAt: new Date().toISOString(),
      };

      setUser(userData);
      setToken(data.token);

      persist(rememberMe, 'crm_token', data.token);
      persist(rememberMe, 'crm_user', JSON.stringify(userData));

      toast({ title: 'Welcome back!', description: `Logged in as ${userData.name}` });
    } catch (error) {
      toast({
        title: 'Login failed',
        description: error instanceof Error ? error.message : 'Invalid credentials',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string) => {
    setLoading(true);
    try {
      const reg = await apiFetch('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name, email, password }),
      });

      // Auto-login after successful registration
      const data = await apiFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      const userData: User = {
        _id: data.user.id,
        name: data.user.name,
        email: data.user.email,
        role: data.user.role,
        createdAt: new Date().toISOString(),
      };

      setUser(userData);
      setToken(data.token);

      localStorage.setItem('crm_token', data.token);
      localStorage.setItem('crm_user', JSON.stringify(userData));

      toast({ title: 'Account created!', description: `Welcome ${name}!` });
    } catch (error) {
      toast({
        title: 'Registration failed',
        description: error instanceof Error ? error.message : 'Failed to create account',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('crm_token');
    localStorage.removeItem('crm_user');
    sessionStorage.removeItem('crm_token');
    sessionStorage.removeItem('crm_user');
    toast({ title: 'Logged out', description: 'You have been successfully logged out.' });
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};