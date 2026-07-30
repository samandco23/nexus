'use client';

import { useState, useEffect, useCallback } from 'react';
import apiClient from '@/lib/api-client';
import { API_URLS } from '@/lib/constants';

export interface ReferralNode {
  id: number;
  name: string;
  email: string;
  level: number;
  total_invested: number;
  joined_at: string;
  children?: ReferralNode[];
}

interface ReferralStats {
  total_referrals: number;
  total_earned: number;
  by_level: Record<string, number>;
  counts: Record<string, number>;
}

interface UseReferralsReturn {
  stats: ReferralStats | null;
  tree: ReferralNode[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useReferrals(): UseReferralsReturn {
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [tree, setTree] = useState<ReferralNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [statsRes, treeRes] = await Promise.all([
        apiClient.get(API_URLS.referrals.list),
        apiClient.get(API_URLS.referrals.tree),
      ]);
      setStats(statsRes.data.data);
      setTree(treeRes.data.data ?? []);
    } catch {
      setError('Erreur lors du chargement du parrainage');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { stats, tree, loading, error, refetch: fetchStats };
}
