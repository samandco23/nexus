'use client';

import { useState, useEffect, useCallback } from 'react';
import apiClient from '@/lib/api-client';
import { API_URLS } from '@/lib/constants';

interface WalletBalance {
  user_id: number;
  fiat_balance: number;
  withdrawable_balance: number;
  token_balance: number;
  lifetime_earnings: number;
  created_at: string;
  updated_at: string;
}

interface Transaction {
  id: number;
  type: string;
  amount: number;
  currency: string;
  status: string;
  payment_provider: string;
  provider_reference: string | null;
  description: string;
  metadata: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

interface UseWalletReturn {
  balance: WalletBalance | null;
  transactions: Transaction[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useWallet(): UseWalletReturn {
  const [balance, setBalance] = useState<WalletBalance | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWallet = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [balanceRes, txRes] = await Promise.all([
        apiClient.get(API_URLS.wallet.show),
        apiClient.get(API_URLS.wallet.transactions),
      ]);
      setBalance(balanceRes.data.data);
      setTransactions(txRes.data.data ?? []);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Erreur lors du chargement du portefeuille');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWallet();
  }, [fetchWallet]);

  return { balance, transactions, loading, error, refetch: fetchWallet };
}
