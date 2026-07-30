'use client';

import { useState, useMemo, useEffect } from 'react';
import {
  Search,
  X,
  CheckCircle,
  XCircle,
  Eye,
} from 'lucide-react';
import GlassCard from '@/components/ui/glass-card';
import GradientButton from '@/components/ui/gradient-button';
import { formatFCFA } from '@/lib/currency';
import apiClient from '@/lib/api-client';
import { API_URLS } from '@/lib/constants';
import { useI18nStore } from '@/stores/i18n-store';

interface Retrait {
  id: number;
  user: { first_name: string; last_name: string; email: string };
  amount: number;
  payment_method: string;
  status: string;
  created_at: string;
  updated_at: string | null;
}

const statusStyles: Record<string, string> = {
  success: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400',
  rejected: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400',
  pending: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400',
  processing: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400',
};

const statusIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  success: CheckCircle,
  rejected: XCircle,
  pending: Eye,
  processing: Eye,
};

const methodLabels: Record<string, string> = {
  orange_money: 'Orange Money',
  mtn_money: 'MTN Money',
  wave: 'Wave',
  bank_transfer: 'Virement bancaire',
  crypto: 'Crypto',
};

const ITEMS_PER_PAGE = 8;

export default function AdminRetraitsPage() {
  const { t } = useI18nStore();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('tous');
  const [currentPage, setCurrentPage] = useState(1);
  const [retraits, setRetraits] = useState<Retrait[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const statusLabels: Record<string, string> = {
    success: t('admin.approve'),
    rejected: t('admin.reject'),
    pending: t('admin.status_pending'),
    processing: 'En cours',
  };

  const fetchRetraits = () => {
    apiClient.get(API_URLS.admin.withdrawals).then((res) => {
      setRetraits(res.data.data?.data ?? []);
    }).catch(() => setError(t('common.error'))).finally(() => setLoading(false));
  };

  useEffect(() => { fetchRetraits(); }, []);

  const filtered = useMemo(() => {
    let result = retraits;
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (r) =>
          (r.user.first_name + ' ' + r.user.last_name).toLowerCase().includes(q) ||
          r.id.toString().includes(q)
      );
    }
    if (statusFilter !== 'tous') {
      result = result.filter((r) => r.status === statusFilter);
    }
    return result;
  }, [search, statusFilter, retraits]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const handleApprove = (id: number) => {
    apiClient.put(API_URLS.admin.approveWithdrawal(id)).then(() => fetchRetraits()).catch(() => setError(t('common.error')));
  };

  const handleReject = (id: number) => {
    apiClient.put(API_URLS.admin.rejectWithdrawal(id)).then(() => fetchRetraits()).catch(() => setError(t('common.error')));
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{t('admin.withdrawal_requests')}</h1>
        {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          {loading ? t('common.loading') : t('admin.withdrawal_requests_found', { count: filtered.length })}
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder={t('common.search_user')}
            value={search}
            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
            className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 pl-10 pr-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
          />
          {search && <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"><X className="h-4 w-4" /></button>}
        </div>

        <div className="flex gap-2 flex-wrap">
          {(['tous', 'pending', 'processing', 'success', 'rejected'] as const).map((status) => (
            <button
              key={status}
              onClick={() => { setStatusFilter(status); setCurrentPage(1); }}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                statusFilter === status
                  ? 'bg-emerald-500 text-white shadow-md'
                  : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'
              }`}
            >
              {status === 'tous' ? t('common.all') : statusLabels[status]}
            </button>
          ))}
        </div>
      </div>

      <GlassCard variant="default" padding="sm" className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50">
                <th className="text-left py-3.5 px-4 font-semibold text-slate-600 dark:text-slate-400 text-xs uppercase tracking-wider">ID</th>
                <th className="text-left py-3.5 px-4 font-semibold text-slate-600 dark:text-slate-400 text-xs uppercase tracking-wider">{t('admin.user')}</th>
                <th className="text-right py-3.5 px-4 font-semibold text-slate-600 dark:text-slate-400 text-xs uppercase tracking-wider">{t('invest.amount')}</th>
                <th className="text-left py-3.5 px-4 font-semibold text-slate-600 dark:text-slate-400 text-xs uppercase tracking-wider">{t('admin.method')}</th>
                <th className="text-left py-3.5 px-4 font-semibold text-slate-600 dark:text-slate-400 text-xs uppercase tracking-wider">{t('admin.status')}</th>
                <th className="text-left py-3.5 px-4 font-semibold text-slate-600 dark:text-slate-400 text-xs uppercase tracking-wider hidden md:table-cell">{t('admin.user_date')}</th>
                <th className="text-center py-3.5 px-4 font-semibold text-slate-600 dark:text-slate-400 text-xs uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((retrait, index) => {
                const StatusIcon = statusIcons[retrait.status] || Eye;
                return (
                  <tr key={retrait.id} className={`border-b border-slate-100 dark:border-slate-800 transition-colors ${index % 2 === 0 ? 'bg-white dark:bg-slate-900' : 'bg-slate-50/50 dark:bg-slate-800/30'} hover:bg-slate-100 dark:hover:bg-slate-800`}>
                    <td className="py-3.5 px-4 font-mono text-xs text-slate-500 dark:text-slate-400">#{retrait.id}</td>
                    <td className="py-3.5 px-4 font-medium text-slate-900 dark:text-white">{retrait.user.first_name} {retrait.user.last_name}</td>
                    <td className="py-3.5 px-4 text-right font-semibold text-slate-900 dark:text-white tabular-nums">{formatFCFA(retrait.amount)}</td>
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400 text-xs">{methodLabels[retrait.payment_method] || retrait.payment_method}</td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${statusStyles[retrait.status] || statusStyles.pending}`}>
                        <StatusIcon className="h-3 w-3" />{statusLabels[retrait.status] || retrait.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400 text-xs hidden md:table-cell">
                      {new Date(retrait.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center justify-center gap-2">
                        {(retrait.status === 'pending') ? (
                          <>
                            <button onClick={() => handleApprove(retrait.id)} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-medium transition-colors">
                              <CheckCircle className="h-3.5 w-3.5" />{t('admin.approve')}
                            </button>
                            <button onClick={() => handleReject(retrait.id)} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-500 hover:bg-red-600 text-white text-xs font-medium transition-colors">
                              <XCircle className="h-3.5 w-3.5" />{t('admin.reject')}
                            </button>
                          </>
                        ) : (
                          <span className="text-xs text-slate-400 italic">{t('admin.already_processed')}</span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {paginated.length === 0 && !loading && (
          <div className="text-center py-12 text-slate-500 dark:text-slate-400">{t('admin.no_withdrawals_found')}</div>
        )}
      </GlassCard>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-500 dark:text-slate-400">{t('admin.page_info', { current: currentPage, total: totalPages })}</p>
          <div className="flex gap-2">
            <GradientButton variant="secondary" size="sm" disabled={currentPage <= 1} onClick={() => setCurrentPage(p => Math.max(1, p - 1))}>{t('admin.previous')}</GradientButton>
            <GradientButton variant="secondary" size="sm" disabled={currentPage >= totalPages} onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}>{t('admin.next')}</GradientButton>
          </div>
        </div>
      )}
    </div>
  );
}
