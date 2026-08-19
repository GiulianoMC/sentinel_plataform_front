import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { loginApi, logoutApi, meApi, refreshApi, registerApi } from '../api/auth';
import { setTokens } from '../api/client';
import type { AuthState, User } from '../types/auth';

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkAuth = useCallback(async () => {
    const rt = localStorage.getItem('refreshToken');
    if (!rt) {
      setIsLoading(false);
      return;
    }
    try {
      const data = await refreshApi(rt);
      setTokens(data.access_token, data.refresh_token);
      const u = await meApi();
      setUser(u);
      setAccessToken(data.access_token);
    } catch {
      setTokens(null, null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = async (email: string, password: string) => {
    const data = await loginApi(email, password);
    setTokens(data.access_token, data.refresh_token);
    const u = await meApi();
    setUser(u);
    setAccessToken(data.access_token);
  };

  const register = async (email: string, password: string) => {
    const data = await registerApi(email, password);
    setTokens(data.access_token, data.refresh_token);
    setUser({
      id: data.id,
      email: data.email,
      role: data.role,
      is_active: data.is_active,
      created_at: data.created_at,
    });
    setAccessToken(data.access_token);
  };

  const logout = async () => {
    const rt = localStorage.getItem('refreshToken');
    if (rt) {
      try {
        await logoutApi(rt);
      } catch {
        // ignore — session is cleared locally regardless
      }
    }
    setTokens(null, null);
    setUser(null);
    setAccessToken(null);
  };

  const value: AuthState = { user, accessToken, isLoading, login, register, logout, checkAuth };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth deve ser usado dentro de AuthProvider');
  return ctx;
}