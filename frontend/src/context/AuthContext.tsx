import React, { createContext, useContext, useEffect, useState } from 'react';
import type { User } from '../types';
import { getCurrentUser, login, logout, signup } from '../api/auth';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  loginUser: (email: string, password: string) => Promise<string | null>;
  signupUser: (
    firstName: string,
    lastName: string,
    email: string,
    password: string
  ) => Promise<string | null>;
  logoutUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCurrentUser()
      .then(u => setUser(u))
      .finally(() => setLoading(false));
  }, []);

  const loginUser = async (email: string, password: string) => {
    const data = await login(email, password);
    if (!data.success) return data.error || 'Login failed.';
    setUser(data.user);
    return null;
  };

  const signupUser = async (
    firstName: string,
    lastName: string,
    email: string,
    password: string
  ) => {
    const data = await signup(firstName, lastName, email, password);
    if (!data.success) return data.error || 'Signup failed.';
    const u = await getCurrentUser();
    setUser(u);
    return null;
  };

  const logoutUser = async () => {
    await logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, loginUser, signupUser, logoutUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuthContext() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuthContext must be used within AuthProvider');
  return ctx;
}
