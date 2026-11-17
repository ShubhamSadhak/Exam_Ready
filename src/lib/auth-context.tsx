import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import type { AttemptHistoryItem, AuthUser, SessionInfo } from '../../shared/types.ts';
import {
  fetchSession,
  signIn as apiSignIn,
  signOut as apiSignOut,
  signUp as apiSignUp,
} from './api.ts';

interface AuthContextValue {
  user: AuthUser | null;
  attempts: AttemptHistoryItem[];
  loading: boolean;
  refreshSession: () => Promise<void>;
  signUp: (input: { name: string; email: string; password: string }) => Promise<SessionInfo>;
  signIn: (input: { email: string; password: string }) => Promise<SessionInfo>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [attempts, setAttempts] = useState<AttemptHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  const applySession = useCallback((info: SessionInfo) => {
    setUser(info.user);
    setAttempts(info.attempts);
  }, []);

  const refreshSession = useCallback(async () => {
    try {
      const info = await fetchSession();
      applySession(info);
    } catch {
      // Non-fatal
    } finally {
      setLoading(false);
    }
  }, [applySession]);

  useEffect(() => {
    refreshSession();
  }, [refreshSession]);

  const signUp = useCallback(
    async (input: { name: string; email: string; password: string }) => {
      const info = await apiSignUp(input);
      applySession(info);
      return info;
    },
    [applySession]
  );

  const signIn = useCallback(
    async (input: { email: string; password: string }) => {
      const info = await apiSignIn(input);
      applySession(info);
      return info;
    },
    [applySession]
  );

  const signOut = useCallback(async () => {
    const info = await apiSignOut();
    applySession(info);
  }, [applySession]);

  return (
    <AuthContext.Provider
      value={{
        user,
        attempts,
        loading,
        refreshSession,
        signUp,
        signIn,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return ctx;
}
