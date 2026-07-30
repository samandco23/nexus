'use client';

import { useState, useMemo, useEffect } from 'react';
import {
  Search,
  ChevronDown,
  ChevronUp,
  X,
  Mail,
  Phone,
  Shield,
  Calendar,
  CheckCircle,
  Clock,
  Ban,
} from 'lucide-react';
import GlassCard from '@/components/ui/glass-card';
import GradientButton from '@/components/ui/gradient-button';
import { formatFCFA } from '@/lib/currency';
import apiClient from '@/lib/api-client';
import { API_URLS } from '@/lib/constants';
import { useI18nStore } from '@/stores/i18n-store';

interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  status: string;
  created_at: string;
  referral_code: string | null;
  wallet?: {
    fiat_balance: number;
    withdrawable_balance: number;
    token_balance: number;
  };
  investments?: Array<{
    id: number;
    amount_invested: number;
    pack: { name: string };
  }>;
}

const statusStyles: Record<string, string> = {
  active: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400',
  suspended: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400',
  inactive: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
};

const ITEMS_PER_PAGE = 8;

export default function AdminUtilisateursPage() {
  const { t } = useI18nStore();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('tous');
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = () => {
    apiClient.get(API_URLS.admin.users).then((res) => {
      setUsers(res.data.data?.data ?? []);
    }).catch(() => setError(t('common.error'))).finally(() => setLoading(false));
  };

  useEffect(() => { fetchUsers(); }, []);

  const filtered = useMemo(() => {
    let result = users;
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (u) =>
          u.first_name.toLowerCase().includes(q) ||
          u.last_name.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q) ||
          (u.phone && u.phone.includes(q))
      );
    }
    if (statusFilter !== 'tous') {
      result = result.filter((u) => u.status === statusFilter);
    }
    return result;
  }, [search, statusFilter, users]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const toggleExpand = (id: number) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const toggleStatus = (id: number) => {
    apiClient.put(API_URLS.admin.toggleUserStatus(id)).then(() => {
      fetchUsers();
    }).catch(() => setError(t('common.error')));
  };

  const statusLabels: Record<string, string> = {
    active: t('admin.status_active'),
    suspended: t('admin.status_suspended'),
    inactive: t('admin.status_inactive'),
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          {t('admin.user_management')}
        </h1>
        {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          {loading ? t('common.loading') : t('admin.users_found', { count: filtered.length })}
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder={t('common.search')}
            value={search}
            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
            className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 pl-10 pr-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <div className="flex gap-2">
          {(['tous', 'active', 'suspended', 'inactive'] as const).map((status) => (
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
                <th className="text-left py-3.5 px-4 font-semibold text-slate-600 dark:text-slate-400 text-xs uppercase tracking-wider">{t('admin.user_name')}</th>
                <th className="text-left py-3.5 px-4 font-semibold text-slate-600 dark:text-slate-400 text-xs uppercase tracking-wider">Email</th>
                <th className="text-left py-3.5 px-4 font-semibold text-slate-600 dark:text-slate-400 text-xs uppercase tracking-wider">{t('admin.user_phone')}</th>
                <th className="text-left py-3.5 px-4 font-semibold text-slate-600 dark:text-slate-400 text-xs uppercase tracking-wider">{t('admin.status')}</th>
                <th className="text-left py-3.5 px-4 font-semibold text-slate-600 dark:text-slate-400 text-xs uppercase tracking-wider hidden md:table-cell">{t('admin.user_date')}</th>
                <th className="text-center py-3.5 px-4 font-semibold text-slate-600 dark:text-slate-400 text-xs uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((user, index) => (
                <tr
                  key={user.id}
                  className={`border-b border-slate-100 dark:border-slate-800 transition-colors cursor-pointer ${
                    index % 2 === 0 ? 'bg-white dark:bg-slate-900' : 'bg-slate-50/50 dark:bg-slate-800/30'
                  } hover:bg-slate-100 dark:hover:bg-slate-800`}
                >
                  <td className="py-3.5 px-4 font-mono text-xs text-slate-500 dark:text-slate-400">#{user.id}</td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 text-xs font-bold">
                        {user.first_name.charAt(0)}{user.last_name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-slate-900 dark:text-white">{user.first_name} {user.last_name}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400">{user.email}</td>
                  <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400 font-mono text-xs">{user.phone}</td>
                  <td className="py-3.5 px-4">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${statusStyles[user.status] || statusStyles.inactive}`}>
                      {user.status === 'active' && <CheckCircle className="h-3 w-3" />}
                      {user.status === 'suspended' && <Ban className="h-3 w-3" />}
                      {user.status === 'inactive' && <Clock className="h-3 w-3" />}
                      {statusLabels[user.status]}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400 text-xs hidden md:table-cell">
                    {new Date(user.created_at).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <button
                      onClick={() => toggleExpand(user.id)}
                      className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors"
                    >
                      {t('admin.details')} {expandedId === user.id ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {paginated.map((user) =>
          expandedId === user.id && (
            <div key={`detail-${user.id}`} className="border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 px-4 py-4 animate-in fade-in slide-in-from-top">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Email</p>
                  <p className="text-sm text-slate-900 dark:text-white flex items-center gap-1.5"><Mail className="h-3.5 w-3.5 text-slate-400" />{user.email}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">{t('admin.user_phone')}</p>
                  <p className="text-sm text-slate-900 dark:text-white flex items-center gap-1.5"><Phone className="h-3.5 w-3.5 text-slate-400" />{user.phone}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">{t('admin.user_date')}</p>
                  <p className="text-sm text-slate-900 dark:text-white flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5 text-slate-400" />{new Date(user.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">{t('admin.referral_code')}</p>
                  <p className="text-sm text-slate-900 dark:text-white">{user.referral_code || t('admin.none')}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">{t('admin.wallet_balance')}</p>
                  <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">{formatFCFA(user.wallet?.fiat_balance ?? 0)}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Actions</p>
                  <button
                    onClick={() => toggleStatus(user.id)}
                    className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      user.status === 'suspended'
                        ? 'bg-emerald-500 hover:bg-emerald-600 text-white'
                        : 'bg-red-500 hover:bg-red-600 text-white'
                    }`}
                  >
                    {user.status === 'suspended' ? t('admin.reactivate') : t('admin.suspend')}
                  </button>
                </div>
              </div>
            </div>
          )
        )}

        {paginated.length === 0 && !loading && (
          <div className="text-center py-12 text-slate-500 dark:text-slate-400">{t('admin.no_users_found')}</div>
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
