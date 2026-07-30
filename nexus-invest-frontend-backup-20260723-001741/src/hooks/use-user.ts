'use client';

import { useState, useEffect, useCallback } from 'react';
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
  created_at: string;
  wallet?: {
    fiat_balance: number;
    withdrawable_balance: number;
    token_balance: number;
    lifetime_earnings: number;
  };
}

interface UseUserReturn {
  user: User | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  updateUser: (data: Partial<User>) => Promise<void>;
}

export function useUser(): UseUserReturn {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUser = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const stored = localStorage.getItem('user');
      if (stored) {
        setUser(JSON.parse(stored));
      }
      const response = await apiClient.get(API_URLS.auth.me);
      const userData = response.data.data;
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
    } catch {
      setError('Erreur lors du chargement du profil');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const updateUser = useCallback(async (data: Partial<User>) => {
    const response = await apiClient.put(API_URLS.auth.me, data);
    const updated = response.data.data;
    setUser(updated);
    localStorage.setItem('user', JSON.stringify(updated));
  }, []);

  return { user, loading, error, refetch: fetchUser, updateUser };
}
