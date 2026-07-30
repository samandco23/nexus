'use client';

import { useState, useEffect, useCallback } from 'react';
import apiClient from '@/lib/api-client';
import { API_URLS } from '@/lib/constants';

export interface MiningStatus {
  can_start: boolean;
  can_claim: boolean;
  reason: string | null;
  next_available: string | null;
  expires_at: string | null;
  today_tokens: number;
  session_active: boolean;
  token_balance: number;
  fiat_balance: number;
  token_value_xaf: number;
  rate_per_hour: number;
}

export interface MiningLog {
  id: number;
  tokens_mined: number;
  base_rate: number;
  total_rate: number;
  mined_date: string;
  validated_at: string;
  created_at: string;
}

interface UseMiningReturn {
  status: MiningStatus | null;
  history: MiningLog[];
  loading: boolean;
  error: string | null;
  start: () => Promise<void>;
  claim: () => Promise<void>;
  convert: (amount: number) => Promise<void>;
  refresh: () => Promise<void>;
}

export function useMining(): UseMiningReturn {
  const [status, setStatus] = useState<MiningStatus | null>(null);
  const [history, setHistory] = useState<MiningLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [statusRes, historyRes] = await Promise.all([
        apiClient.get(API_URLS.mining.status),
        apiClient.get(API_URLS.mining.history),
      ]);
      setStatus(statusRes.data.data);
      setHistory(historyRes.data.data ?? []);
    } catch {
      setError('Erreur lors du chargement du minage');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const start = useCallback(async () => {
    await apiClient.post(API_URLS.mining.start);
    await fetchData();
  }, [fetchData]);

  const claim = useCallback(async () => {
    await apiClient.post(API_URLS.mining.claim);
    await fetchData();
  }, [fetchData]);

  const convert = useCallback(async (amount: number) => {
    await apiClient.post(API_URLS.mining.convert, { token_amount: amount });
    await fetchData();
  }, [fetchData]);

  return { status, history, loading, error, start, claim, convert, refresh: fetchData };
}
