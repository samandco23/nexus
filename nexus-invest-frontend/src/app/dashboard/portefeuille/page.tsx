'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Wallet, Coins, ArrowUpRight, Clock, CheckCircle, XCircle, TrendingUp, ArrowRight, X } from 'lucide-react';
import { useI18nStore } from '@/stores/i18n-store';
import { toast } from 'sonner';
import GlassCard from '@/components/ui/glass-card';
import GradientButton from '@/components/ui/gradient-button';
import StatCard from '@/components/ui/stat-card';
import LoadingSpinner from '@/components/shared/loading-spinner';
import ErrorState from '@/components/shared/error-state';
import EmptyState from '@/components/shared/empty-state';
import { useWallet } from '@/hooks/use-wallet';
import { formatFCFA } from '@/lib/currency';
import apiClient from '@/lib/api-client';
import { API_URLS } from '@/lib/constants';

const statusConfig: Record<string, { icon: typeof Clock; color: string; bg: string; labelKey: string }> = {
  pending: { icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/20', labelKey: 'status.pending' },
  processing: { icon: Clock, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20', labelKey: 'status.processing' },
  success: { icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20', labelKey: 'status.confirmed' },
  failed: { icon: XCircle, color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-900/20', labelKey: 'status.failed' },
  reversed: { icon: ArrowUpRight, color: 'text-slate-600', bg: 'bg-slate-50 dark:bg-slate-800', labelKey: 'status.reversed' },
};

function StatusBadge({ status, t }: { status: string; t: (key: string) => string }) {
  const config = statusConfig[status] || statusConfig.pending;
  const Icon = config.icon;
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${config.color} ${config.bg}`}>
      <Icon className="h-3 w-3" />
      {t(config.labelKey)}
    </span>
  );
}

interface WithdrawalRequest {
  id: number;
  amount: number;
  method: string;
  status: string;
  created_at: string;
}

export default function WalletPage() {
  const { t } = useI18nStore();
  const { balance, transactions, loading, error, refetch } = useWallet();
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);
  const [wdLoading, setWdLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<number | null>(null);

  const fetchWithdrawals = async () => {
    try {
      const res = await apiClient.get(API_URLS.withdrawals.list);
      setWithdrawals(res.data.data ?? []);
    } catch {
      // silent
    } finally {
      setWdLoading(false);
    }
  };

  useEffect(() => {
    fetchWithdrawals();
  }, []);

  const handleCancel = async (id: number) => {
    setCancellingId(id);
    try {
      await apiClient.put(API_URLS.withdrawals.cancel(id));
      toast.success(t('wallet.withdrawal_cancelled'));
      fetchWithdrawals();
      refetch();
    } catch {
      toast.error(t('wallet.cancel_error'));
    } finally {
      setCancellingId(null);
    }
  };

  const pendingWithdrawals = withdrawals.filter((w) => w.status === 'pending');

  if (loading) {
    return <LoadingSpinner centered size="lg" label={t('common.loading')} />;
  }

  if (error) {
    return <ErrorState message={error} />;
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{t('wallet.title')}</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {t('wallet.subtitle')}
          </p>
        </div>
        <Link href="/dashboard/portefeuille/retrait">
          <GradientButton variant="primary" size="md" iconComponent={ArrowUpRight}>
            {t('wallet.make_withdrawal')}
          </GradientButton>
        </Link>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label={t('wallet.fiat_balance')} value={balance?.fiat_balance || 0} icon={Wallet} trend={null} />
        <StatCard label={t('wallet.token_balance')} value={balance?.token_balance || 0} icon={Coins} isCurrency={false} suffix={t('wallet.token_suffix')} trend={null} />
        <StatCard label={t('wallet.withdrawable')} value={balance?.withdrawable_balance || 0} icon={ArrowUpRight} isCurrency trend={null} />
        <StatCard label={t('wallet.lifetime_earnings')} value={balance?.lifetime_earnings || 0} icon={TrendingUp} isCurrency trend={null} />
      </div>

      {!wdLoading && pendingWithdrawals.length > 0 && (
        <GlassCard variant="default" padding="md">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">{t('wallet.pending_withdrawals')}</h3>
          <div className="flex flex-col gap-3">
            {pendingWithdrawals.map((wd) => (
              <div key={wd.id} className="flex items-center justify-between rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4">
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white">{formatFCFA(wd.amount)}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {new Date(wd.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    {' — '}{wd.method.replace(/_/g, ' ')}
                  </p>
                </div>
                <button
                  onClick={() => handleCancel(wd.id)}
                  disabled={cancellingId === wd.id}
                  className="inline-flex items-center gap-1 text-sm font-medium text-red-600 hover:text-red-700 disabled:opacity-50"
                >
                  <X className="h-4 w-4" />
                  {cancellingId === wd.id ? t('wallet.cancelling') : t('wallet.cancel')}
                </button>
              </div>
            ))}
          </div>
        </GlassCard>
      )}

      <GlassCard variant="default" padding="md">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">{t('wallet.recent')}</h3>
          <Link href="/dashboard/historique" className="text-sm text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 font-medium inline-flex items-center gap-1">
            {t('common.view_all')} <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        {!transactions || transactions.length === 0 ? (
          <EmptyState
            title={t('wallet.no_transactions')}
            description={t('wallet.no_transactions_desc')}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700">
                  <th className="text-left py-3 px-2 font-medium text-slate-500 dark:text-slate-400">{t('wallet.table_date')}</th>
                  <th className="text-left py-3 px-2 font-medium text-slate-500 dark:text-slate-400">{t('wallet.table_type')}</th>
                  <th className="text-right py-3 px-2 font-medium text-slate-500 dark:text-slate-400">{t('wallet.table_amount')}</th>
                  <th className="text-center py-3 px-2 font-medium text-slate-500 dark:text-slate-400">{t('wallet.table_status')}</th>
                </tr>
              </thead>
              <tbody>
                {transactions.slice(0, 10).map((tx) => (
                  <tr key={tx.id} className="border-b border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="py-3 px-2 text-slate-700 dark:text-slate-300">
                      {new Date(tx.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="py-3 px-2">
                      <span className="text-slate-900 dark:text-white font-medium capitalize">{tx.type.replace(/_/g, ' ')}</span>
                    </td>
                    <td className={`py-3 px-2 text-right font-bold ${
                      tx.type === 'withdrawal' ? 'text-red-600' : 'text-emerald-600'
                    }`}>
                      {tx.type === 'withdrawal' ? '-' : '+'}{formatFCFA(tx.amount)}
                    </td>
                    <td className="py-3 px-2 text-center">
                      <StatusBadge status={tx.status} t={t} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </GlassCard>
    </div>
  );
}
