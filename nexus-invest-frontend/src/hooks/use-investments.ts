'use client';

import { useState, useEffect, useCallback } from 'react';
import apiClient from '@/lib/api-client';
import { API_URLS } from '@/lib/constants';

export interface InvestmentPack {
  id: number;
  name: string;
  min_amount: number;
  duration_days: number;
  roi_percentage: number;
  loyalty_bonus_percentage: number;
  color_code: string;
  icon_name: string;
  display_order: number;
  is_active: boolean;
}

export interface Investment {
  id: number;
  user_id: number;
  pack: InvestmentPack | null;
  transaction_id: number | null;
  amount_invested: number;
  expected_return: number;
  weekly_payout: number;
  total_paid: number;
  remaining_payouts: number;
  start_date: string;
  end_date: string;
  status: string;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

interface UseInvestmentsReturn {
  investments: Investment[];
  packs: InvestmentPack[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  createInvestment: (packId: number, amount: number, paymentProvider: string) => Promise<unknown>;
}

export function useInvestments(): UseInvestmentsReturn {
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [packs, setPacks] = useState<InvestmentPack[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInvestments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [invRes, packsRes] = await Promise.all([
        apiClient.get(API_URLS.investments.list),
        apiClient.get(API_URLS.investments.packs),
      ]);
      setInvestments(invRes.data.data ?? []);
      setPacks(packsRes.data.data ?? []);
    } catch {
      setError('Erreur lors du chargement des investissements');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInvestments();
  }, [fetchInvestments]);

  const createInvestment = useCallback(
    async (packId: number, amount: number, paymentProvider: string) => {
      const response = await apiClient.post(API_URLS.investments.create, {
        pack_id: packId,
        amount,
        payment_provider: paymentProvider,
      });
      return response.data.data;
    },
    []
  );

  return { investments, packs, loading, error, refetch: fetchInvestments, createInvestment };
}
