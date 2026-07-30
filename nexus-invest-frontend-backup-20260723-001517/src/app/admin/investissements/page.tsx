'use client';

import { useState, useMemo, useEffect } from 'react';
import {
  Search,
  X,
  TrendingUp,
} from 'lucide-react';
import GlassCard from '@/components/ui/glass-card';
import GradientButton from '@/components/ui/gradient-button';
import { formatFCFA } from '@/lib/currency';
import apiClient from '@/lib/api-client';
import { API_URLS } from '@/lib/constants';
import { useI18nStore } from '@/stores/i18n-store';

interface Investment {
  id: number;
  user: { first_name: string; last_name: string; email: string };
  amount_invested: number;
  pack: { name: string };
  status: string;
  start_date: string;
  end_date: string | null;
  expected_return: number;
}

const statusStyles: Record<string, string> = {
  active: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400',
  completed: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400',
  pending: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400',
  failed: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400',
};

const ITEMS_PER_PAGE = 8;

export default function AdminInvestissementsPage() {
  const { t } = useI18nStore();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('tous');
  const [currentPage, setCurrentPage] = useState(1);
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const statusLabels: Record<string, string> = {
    active: t('admin.status_active'),
    completed: t('admin.status_completed'),
    pending: t('admin.status_pending'),
    failed: t('admin.status_failed'),
  };

  useEffect(() => {
    apiClient.get(API_URLS.admin.investments).then((res) => {
      setInvestments(res.data.data?.data ?? []);
    }).catch(() => setError(t('common.error'))).finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    let result = investments;
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (inv) =>
          (inv.user.first_name + ' ' + inv.user.last_name).toLowerCase().includes(q) ||
          inv.id.toString().includes(q)
      );
    }
    if (statusFilter !== 'tous') {
      result = result.filter((inv) => inv.status === statusFilter);
    }
    return result;
  }, [search, statusFilter, investments]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const getPackLabel = (pack: { name: string } | null) => pack?.name ?? 'N/A';

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{t('admin.investment_management')}</h1>
        {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          {loading ? t('common.loading') : t('admin.investments_found', { count: filtered.length })}
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

        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
          className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 appearance-none cursor-pointer"
        >
          <option value="tous">{t('common.all')}</option>
          <option value="active">{t('admin.status_active')}</option>
          <option value="completed">{t('admin.status_completed')}</option>
          <option value="pending">{t('admin.status_pending')}</option>
          <option value="failed">{t('admin.status_failed')}</option>
        </select>
      </div>

      <GlassCard variant="default" padding="sm" className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50">
                <th className="text-left py-3.5 px-4 font-semibold text-slate-600 dark:text-slate-400 text-xs uppercase tracking-wider">ID</th>
                <th className="text-left py-3.5 px-4 font-semibold text-slate-600 dark:text-slate-400 text-xs uppercase tracking-wider">{t('admin.user')}</th>
                <th className="text-left py-3.5 px-4 font-semibold text-slate-600 dark:text-slate-400 text-xs uppercase tracking-wider">{t('admin.pack')}</th>
                <th className="text-right py-3.5 px-4 font-semibold text-slate-600 dark:text-slate-400 text-xs uppercase tracking-wider">{t('invest.amount')}</th>
                <th className="text-left py-3.5 px-4 font-semibold text-slate-600 dark:text-slate-400 text-xs uppercase tracking-wider">{t('admin.status')}</th>
                <th className="text-left py-3.5 px-4 font-semibold text-slate-600 dark:text-slate-400 text-xs uppercase tracking-wider hidden md:table-cell">{t('admin.start_date')}</th>
                <th className="text-left py-3.5 px-4 font-semibold text-slate-600 dark:text-slate-400 text-xs uppercase tracking-wider hidden md:table-cell">{t('admin.end_date')}</th>
                <th className="text-right py-3.5 px-4 font-semibold text-slate-600 dark:text-slate-400 text-xs uppercase tracking-wider">{t('admin.expected_gain')}</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((inv, index) => (
                <tr key={inv.id} className={`border-b border-slate-100 dark:border-slate-800 transition-colors ${index % 2 === 0 ? 'bg-white dark:bg-slate-900' : 'bg-slate-50/50 dark:bg-slate-800/30'} hover:bg-slate-100 dark:hover:bg-slate-800`}>
                  <td className="py-3.5 px-4 font-mono text-xs text-slate-500 dark:text-slate-400">#{inv.id}</td>
                  <td className="py-3.5 px-4 font-medium text-slate-900 dark:text-white">{inv.user.first_name} {inv.user.last_name}</td>
                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center gap-1 text-slate-700 dark:text-slate-300">
                      <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
                      {getPackLabel(inv.pack)}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right font-medium text-slate-900 dark:text-white tabular-nums">{formatFCFA(inv.amount_invested)}</td>
                  <td className="py-3.5 px-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${statusStyles[inv.status] || statusStyles.pending}`}>{statusLabels[inv.status] || inv.status}</span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400 text-xs hidden md:table-cell">{new Date(inv.start_date).toLocaleDateString('fr-FR')}</td>
                  <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400 text-xs hidden md:table-cell">{inv.end_date ? new Date(inv.end_date).toLocaleDateString('fr-FR') : '—'}</td>
                  <td className="py-3.5 px-4 text-right font-semibold text-emerald-600 dark:text-emerald-400 tabular-nums">{formatFCFA(inv.expected_return)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {paginated.length === 0 && !loading && (
          <div className="text-center py-12 text-slate-500 dark:text-slate-400">{t('admin.no_investments')}</div>
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
