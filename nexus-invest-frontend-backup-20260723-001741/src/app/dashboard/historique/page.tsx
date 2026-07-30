'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  TrendingUp, ArrowUpRight, Users, Pickaxe, Wallet,
  Clock, CheckCircle, XCircle, Filter, ChevronLeft, ChevronRight, Search
} from 'lucide-react';
import { useI18nStore } from '@/stores/i18n-store';
import GlassCard from '@/components/ui/glass-card';
import GradientButton from '@/components/ui/gradient-button';
import LoadingSpinner from '@/components/shared/loading-spinner';
import ErrorState from '@/components/shared/error-state';
import EmptyState from '@/components/shared/empty-state';
import { useWallet } from '@/hooks/use-wallet';
import { formatFCFA } from '@/lib/currency';

const typeIcons: Record<string, typeof TrendingUp> = {
  deposit: Wallet,
  withdrawal: ArrowUpRight,
  referral_bonus: Users,
  loyalty_bonus: TrendingUp,
  weekly_profit: TrendingUp,
  capital_release: TrendingUp,
  token_conversion: Pickaxe,
};

const typeLabels: Record<string, string> = {
  deposit: 'type.deposit',
  withdrawal: 'type.withdrawal',
  referral_bonus: 'type.referral_bonus',
  loyalty_bonus: 'type.loyalty_bonus',
  weekly_profit: 'type.weekly_profit',
  capital_release: 'type.capital_release',
  token_conversion: 'type.token_conversion',
};

const typeColors: Record<string, string> = {
  deposit: 'text-amber-600 bg-amber-100 dark:bg-amber-900/30',
  withdrawal: 'text-red-600 bg-red-100 dark:bg-red-900/30',
  referral_bonus: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30',
  loyalty_bonus: 'text-purple-600 bg-purple-100 dark:bg-purple-900/30',
  weekly_profit: 'text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30',
  capital_release: 'text-cyan-600 bg-cyan-100 dark:bg-cyan-900/30',
  token_conversion: 'text-violet-600 bg-violet-100 dark:bg-violet-900/30',
};

const statusConfig: Record<string, { icon: typeof Clock; color: string; bg: string; labelKey: string }> = {
  pending: { icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/20', labelKey: 'status.pending' },
  processing: { icon: Clock, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20', labelKey: 'status.processing' },
  success: { icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20', labelKey: 'status.confirmed' },
  failed: { icon: XCircle, color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-900/20', labelKey: 'status.failed' },
  reversed: { icon: XCircle, color: 'text-slate-600', bg: 'bg-slate-50 dark:bg-slate-800', labelKey: 'status.reversed' },
};

const ITEMS_PER_PAGE = 10;

export default function HistoryPage() {
  const { t } = useI18nStore();
  const { transactions, loading, error } = useWallet();
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [page, setPage] = useState(1);

  const filtered = (transactions || []).filter((tx) => {
    if (typeFilter !== 'all' && tx.type !== typeFilter) return false;
    if (statusFilter !== 'all' && tx.status !== statusFilter) return false;
    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  if (loading) {
    return <LoadingSpinner centered size="lg" label={t('common.loading')} />;
  }

  if (error) {
    return <ErrorState message={error} />;
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{t('history.title')}</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {t('history.subtitle')}
        </p>
      </div>

      <GlassCard variant="default" padding="sm">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <select
              value={typeFilter}
              onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
              className="w-full rounded-xl border border-slate-300 dark:border-slate-600 py-2.5 pl-10 pr-4 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 appearance-none"
              aria-label={t('history.filter_type')}
            >
              <option value="all">{t('history.all_types')}</option>
              <option value="deposit">{t('type.deposit')}</option>
              <option value="withdrawal">{t('type.withdrawal')}</option>
              <option value="referral_bonus">{t('type.referral_bonus')}</option>
              <option value="weekly_profit">{t('type.weekly_profit')}</option>
              <option value="token_conversion">{t('type.token_conversion')}</option>
            </select>
          </div>
          <div className="flex-1 relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              className="w-full rounded-xl border border-slate-300 dark:border-slate-600 py-2.5 pl-10 pr-4 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 appearance-none"
              aria-label={t('history.filter_status')}
            >
              <option value="all">{t('history.all_statuses')}</option>
              <option value="pending">{t('status.pending')}</option>
              <option value="processing">{t('status.processing')}</option>
              <option value="success">{t('status.confirmed')}</option>
              <option value="failed">{t('status.failed')}</option>
              <option value="reversed">{t('status.reversed')}</option>
            </select>
          </div>
        </div>
      </GlassCard>

      <GlassCard variant="default" padding="md">
        {filtered.length === 0 ? (
          <EmptyState
            icon={Wallet}
            title={t('history.no_transactions')}
            description={t('history.no_transactions_filter')}
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700">
                    <th className="text-left py-3 px-2 font-medium text-slate-500 dark:text-slate-400">{t('wallet.table_date')}</th>
                    <th className="text-left py-3 px-2 font-medium text-slate-500 dark:text-slate-400">{t('wallet.table_type')}</th>
                    <th className="text-right py-3 px-2 font-medium text-slate-500 dark:text-slate-400">{t('wallet.table_amount')}</th>
                    <th className="text-center py-3 px-2 font-medium text-slate-500 dark:text-slate-400">{t('wallet.table_status')}</th>
                    <th className="text-center py-3 px-2 font-medium text-slate-500 dark:text-slate-400">{t('history.view')}</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((tx) => {
                    const TypeIcon = typeIcons[tx.type] || Wallet;
                    const typeColor = typeColors[tx.type] || 'text-slate-600 bg-slate-100';
                    const status = statusConfig[tx.status] || statusConfig.pending;
                    const StatusIcon = status.icon;

                    return (
                      <tr key={tx.id} className="border-b border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="py-3 px-2 text-slate-700 dark:text-slate-300 whitespace-nowrap">
                          {new Date(tx.created_at).toLocaleDateString('fr-FR', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </td>
                        <td className="py-3 px-2">
                          <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${typeColor}`}>
                            <TypeIcon className="h-3 w-3" />
                            {t(typeLabels[tx.type] || tx.type)}
                          </span>
                        </td>
                        <td className={`py-3 px-2 text-right font-bold whitespace-nowrap ${
                          tx.type === 'withdrawal' ? 'text-red-600' : 'text-emerald-600'
                        }`}>
                          {tx.type === 'withdrawal' ? '-' : '+'}{formatFCFA(tx.amount)}
                        </td>
                        <td className="py-3 px-2 text-center">
                          <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${status.color} ${status.bg}`}>
                            <StatusIcon className="h-3 w-3" />
                            {t(status.labelKey)}
                          </span>
                        </td>
                        <td className="py-3 px-2 text-center">
                          <Link
                            href={`/dashboard/historique/${tx.id}`}
                            className="text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 text-xs font-medium"
                          >
                            {t('history.view')}
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  aria-label={t('history.previous')}
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="text-sm text-slate-600 dark:text-slate-400">
                  {t('history.page', { current: page, total: totalPages })}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  aria-label={t('history.next')}
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </>
        )}
      </GlassCard>
    </div>
  );
}
