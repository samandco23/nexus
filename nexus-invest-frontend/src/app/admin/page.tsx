'use client';

import Link from 'next/link';
import {
  Users,
  TrendingUp,
  Wallet,
  Clock,
  ArrowRight,
  UserPlus,
  Settings,
  FileText,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
} from 'lucide-react';
import StatCard from '@/components/ui/stat-card';
import GlassCard from '@/components/ui/glass-card';
import GradientButton from '@/components/ui/gradient-button';
import { formatFCFA } from '@/lib/currency';
import { useState, useEffect, useCallback } from 'react';
import apiClient from '@/lib/api-client';
import { useI18nStore } from '@/stores/i18n-store';

export default function AdminDashboardPage() {
  const { t } = useI18nStore();
  const [stats, setStats] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dailyInvested, setDailyInvested] = useState(0);
  const [dailyDeposited, setDailyDeposited] = useState(0);
  const [dailyWithdrawn, setDailyWithdrawn] = useState(0);
  const [recentActivities, setRecentActivities] = useState<Array<{id: number; type: string; detail: string; timestamp: string; user: string | null}>>([]);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const quickActions = [
    {
      label: t('admin.add_user'),
      icon: UserPlus,
      href: '/admin/utilisateurs',
      color: 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30',
    },
    {
      label: t('admin.manage_investments'),
      icon: TrendingUp,
      href: '/admin/investissements',
      color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/30',
    },
    {
      label: t('admin.view_withdrawals'),
      icon: Clock,
      href: '/admin/retraits',
      color: 'text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/30',
    },
    {
      label: t('admin.configuration'),
      icon: Settings,
      href: '/admin',
      color: 'text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800',
    },
  ];

  const activityLabels: Record<string, string> = {
    registration: t('admin.activity_new_user'),
    login: 'Connexion',
    logout: 'Déconnexion',
    investment: t('admin.activity_investment'),
    deposit: t('admin.activity_deposit'),
    withdrawal_request: 'Demande de retrait',
    withdrawal_approved: 'Retrait approuvé',
    withdrawal_rejected: 'Retrait rejeté',
    kyc_submitted: 'Document KYC soumis',
    kyc_approved: 'KYC approuvé',
    kyc_rejected: 'KYC rejeté',
    admin_action: 'Action admin',
    settings_update: 'Paramètres modifiés',
  };

  const fetchStats = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    try {
      const res = await apiClient.get('/admin/stats');
      const data = res.data.data ?? {};
      setStats(data);
      setDailyInvested(data.daily_invested ?? 0);
      setDailyDeposited(data.daily_deposited ?? 0);
      setDailyWithdrawn(data.daily_withdrawn ?? 0);
      setRecentActivities(data.recent_activities ?? []);
      setLastUpdated(new Date());
      setError(null);
    } catch {
      setError(t('common.error'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [t]);

  useEffect(() => {
    fetchStats();
    const interval = setInterval(() => fetchStats(), 60000);
    return () => clearInterval(interval);
  }, [fetchStats]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            {t('admin.admin_dashboard')}
          </h1>
          {error && (
            <p className="text-sm text-red-500 mt-1">{error}</p>
          )}
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {t('admin.overview')}
          </p>
          {lastUpdated && (
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
              {t('admin.last_updated', { time: lastUpdated.toLocaleTimeString('fr-FR') })}
            </p>
          )}
        </div>
        <button
          onClick={() => fetchStats(true)}
          disabled={refreshing}
          className="flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          {refreshing ? t('common.loading') : t('admin.refresh')}
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label={t('admin.total_users')}
          value={loading ? '...' : (stats.total_users ?? 0)}
          icon={Users}
          isCurrency={false}
          suffix=""
        />
        <StatCard
          label={t('admin.active_investments')}
          value={loading ? '...' : (stats.active_investments ?? 0)}
          icon={TrendingUp}
          isCurrency={false}
          suffix=""
        />
        <StatCard
          label={t('admin.total_volume')}
          value={loading ? '...' : (stats.total_invested ?? 0)}
          icon={Wallet}
          isCurrency
        />
        <StatCard
          label={t('admin.pending_withdrawals')}
          value={loading ? '...' : (stats.pending_withdrawals ?? 0)}
          icon={Clock}
          isCurrency={false}
          suffix=""
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GlassCard variant="default" padding="md">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              {t('admin.monthly_accounting')}
            </h3>
            <span className="text-xs text-slate-400">
              {new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700">
                  <th className="text-left py-3 px-2 font-semibold text-slate-600 dark:text-slate-400">
                    {t('admin.operation')}
                  </th>
                  <th className="text-right py-3 px-2 font-semibold text-emerald-600 dark:text-emerald-400">
                    <div className="flex items-center justify-end gap-1">
                      <ArrowUpRight className="h-3.5 w-3.5" />
                      {t('admin.incomes')}
                    </div>
                  </th>
                  <th className="text-right py-3 px-2 font-semibold text-red-600 dark:text-red-400">
                    <div className="flex items-center justify-end gap-1">
                      <ArrowDownRight className="h-3.5 w-3.5" />
                      {t('admin.expenses')}
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {[
                  { label: t('admin.total_invested'), entree: stats.total_invested ?? 0, sortie: 0 },
                  { label: t('admin.total_withdrawn'), entree: 0, sortie: stats.total_withdrawn ?? 0 },
                ].map((row) => (
                  <tr
                    key={row.label}
                    className="border-b border-slate-100 dark:border-slate-800 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    <td className="py-3 px-2 text-slate-700 dark:text-slate-300">
                      {row.label}
                    </td>
                    <td className="py-3 px-2 text-right font-medium text-emerald-600 dark:text-emerald-400 tabular-nums">
                      {row.entree > 0 ? formatFCFA(row.entree) : '-'}
                    </td>
                    <td className="py-3 px-2 text-right font-medium text-red-600 dark:text-red-400 tabular-nums">
                      {row.sortie > 0 ? formatFCFA(row.sortie) : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-slate-200 dark:border-slate-700">
                  <td className="py-3 px-2 font-bold text-slate-900 dark:text-white">
                    {t('common.total')}
                  </td>
                  <td className="py-3 px-2 text-right font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                    {formatFCFA(
                      stats.total_invested ?? 0
                    )}
                  </td>
                  <td className="py-3 px-2 text-right font-bold text-red-600 dark:text-red-400 tabular-nums">
                    {formatFCFA(
                      stats.total_withdrawn ?? 0
                    )}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </GlassCard>

        <GlassCard variant="default" padding="md">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              {t('admin.quick_actions')}
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {quickActions.map((action) => (
              <Link
                key={action.href}
                href={action.href}
                className="flex items-center gap-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 hover:shadow-md hover:border-emerald-300 dark:hover:border-emerald-700 transition-all duration-200 group"
              >
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-lg ${action.color}`}
                >
                  <action.icon className="h-5 w-5" />
                </div>
                <span className="flex-1 text-sm font-medium text-slate-700 dark:text-slate-300 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                  {action.label}
                </span>
                <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-emerald-500 transition-colors" />
              </Link>
            ))}
          </div>

          <div className="mt-4 p-4 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-emerald-100 mb-0.5">
                  {t('admin.daily_revenue')}
                </p>
                <p className="text-xl font-bold text-white">
                  {formatFCFA(dailyDeposited)}
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20">
                <FileText className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="mt-3 flex items-center gap-1 text-xs text-emerald-100">
              <ArrowUpRight className="h-3 w-3" />
              <span>{t('admin.compared_to_yesterday', { percent: '0' })}</span>
            </div>
          </div>
        </GlassCard>
      </div>

      <GlassCard variant="default" padding="md">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            {t('admin.latest_activities')}
          </h3>
          <Link
            href="/admin/activites"
            className="text-sm text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 font-medium inline-flex items-center gap-1"
          >
            {t('common.view_all')} <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="space-y-3">
          {recentActivities.map((activity) => {
            const typeColors: Record<string, string> = {
              registration: 'bg-blue-500',
              login: 'bg-green-500',
              logout: 'bg-slate-500',
              investment: 'bg-emerald-500',
              deposit: 'bg-amber-500',
              withdrawal_request: 'bg-purple-500',
              withdrawal_approved: 'bg-emerald-500',
              withdrawal_rejected: 'bg-red-500',
              kyc_submitted: 'bg-cyan-500',
              kyc_approved: 'bg-emerald-500',
              kyc_rejected: 'bg-red-500',
              admin_action: 'bg-orange-500',
              settings_update: 'bg-yellow-500',
            };
            return (
              <div
                key={activity.id}
                className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50"
              >
                <div
                  className={`mt-1 h-2.5 w-2.5 rounded-full shrink-0 ${typeColors[activity.type] || 'bg-slate-400'}`}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 dark:text-white">
                    {activityLabels[activity.type] || activity.type}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                    {activity.detail}
                  </p>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                    {activity.timestamp ? new Date(activity.timestamp).toLocaleString('fr-FR') : ''}
                    {activity.user ? ` — ${activity.user}` : ''}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </GlassCard>
    </div>
  );
}