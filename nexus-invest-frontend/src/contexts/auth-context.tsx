'use client';

import { createContext, useContext, useCallback, useEffect, useState } from 'react';
import apiClient from '@/lib/api-client';
import { API_URLS } from '@/lib/constants';

export interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  country: string;
  referral_code: string;
  kyc_level: number;
  status: string;
  is_admin: boolean;
  email_verified_at: string | null;
  phone_verified_at: string | null;
  created_at: string;
  wallet?: {
    fiat_balance: number;
    withdrawable_balance: number;
    token_balance: number;
    lifetime_earnings: number;
  };
}

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  loading: boolean;
  refetch: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  isAuthenticated: false,
  isAdmin: false,
  loading: true,
  refetch: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    try {
      setLoading(true);
      const token = sessionStorage.getItem('access_token');
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }
      const response = await apiClient.get(API_URLS.auth.me);
      const userData = response.data.data;
      setUser(userData);
      sessionStorage.setItem('user', JSON.stringify({
        id: userData.id,
        first_name: userData.first_name,
        last_name: userData.last_name,
        email: userData.email,
      }));
    } catch {
      sessionStorage.removeItem('access_token');
      sessionStorage.removeItem('user');
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isAdmin: !!user?.is_admin,
        loading,
        refetch: fetchUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
