"use client";

import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';

import { authService } from './services/authService';
import { ApiClientError } from './services/httpClient';
import type { AuthUser } from './types';

interface AuthContextType {
  user: AuthUser | null;
  authLoading: boolean;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({
  children,
  initialUser,
}: {
  children: ReactNode;
  initialUser: AuthUser | null;
}) {
  const [user, setUser] = useState<AuthUser | null>(initialUser);
  const [authLoading, setAuthLoading] = useState(false);

  useEffect(() => {
    setUser(initialUser);
    setAuthLoading(false);
  }, [initialUser]);

  const refreshAuth = useCallback(async () => {
    setAuthLoading(true);
    try {
      const session = await authService.getSession();
      setUser(session.user);
    } catch (err) {
      if (err instanceof ApiClientError && err.status === 401) {
        setUser(null);
      }
    } finally {
      setAuthLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    await authService.logout();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, authLoading, logout, refreshAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
