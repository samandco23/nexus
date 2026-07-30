'use client';

import { useState, useEffect, useCallback } from 'react';
import apiClient from '@/lib/api-client';
import { API_URLS } from '@/lib/constants';

interface MiningStatus {
  can_mine: boolean;
  current_rate: number;
  streak_days: number;
  days_missed: number;
  penalty: number;
  penalty_reason: string;
}

interface MiningLog {
  id: number;
  mined_date: string;
  amount_mined: number;
  streak_bonus: number;
  penalty_applied: boolean;
  created_at: string;
}

interface UseMiningReturn {
  status: MiningStatus | null;
  history: MiningLog[];
  loading: boolean;
  error: string | null;
  validate: () => Promise<void>;
}

export function useMining(): UseMiningReturn {
  const [status, setStatus] = useState<MiningStatus | null>(null);
  const [history, setHistory] = useState<MiningLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = useCallback(async () => {
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
    fetchStatus();
  }, [fetchStatus]);

  const validate = useCallback(async () => {
    try {
      await apiClient.post(API_URLS.mining.validate);
      await fetchStatus();
    } catch {
      setError('Erreur lors de la validation du minage');
    }
  }, [fetchStatus]);

  return { status, history, loading, error, validate };
}
