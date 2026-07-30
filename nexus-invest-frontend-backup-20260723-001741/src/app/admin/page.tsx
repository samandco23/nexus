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
} from 'lucide-react';
import StatCard from '@/components/ui/stat-card';
import GlassCard from '@/components/ui/glass-card';
import GradientButton from '@/components/ui/gradient-button';
import { formatFCFA } from '@/lib/currency';
import { useState, useEffect } from 'react';
import apiClient from '@/lib/api-client';
import { useI18nStore } from '@/stores/i18n-store';

export default function AdminDashboardPage() {
  const { t } = useI18nStore();
  const [stats, setStats] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
    inscription: t('admin.activity_new_user'),
    invest: t('admin.activity_investment'),
    withdraw: t('admin.activity_withdrawal'),
    deposit: t('admin.activity_deposit'),
  };

  useEffect(() => {
    apiClient.get('/admin/stats').then((res) => {
      setStats(res.data.data ?? {});
    }).catch(() => setError(t('common.error'))).finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex flex-col gap-6">
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
                  {formatFCFA(485000)}
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20">
                <FileText className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="mt-3 flex items-center gap-1 text-xs text-emerald-100">
              <ArrowUpRight className="h-3 w-3" />
              <span>{t('admin.compared_to_yesterday', { percent: '12' })}</span>
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
            href="/admin/utilisateurs"
            className="text-sm text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 font-medium inline-flex items-center gap-1"
          >
            {t('common.view_all')} <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="space-y-3">
          {[
            {
              action: 'inscription',
              detail: 'Marie Koné a rejoint la plateforme',
              type: 'inscription',
            },
            {
              action: 'invest',
              detail: 'Amadou Diallo a investi dans le pack Gold',
              type: 'invest',
            },
            {
              action: 'withdraw',
              detail: 'Fatou Ndiaye a reçu 150 000 FCFA',
              type: 'withdraw',
            },
            {
              action: 'inscription',
              detail: 'Koffi Amoin a rejoint la plateforme',
              type: 'inscription',
            },
            {
              action: 'deposit',
              detail: 'Olivier Tano a déposé 500 000 FCFA',
              type: 'deposit',
            },
          ].map((activity, i) => {
            const typeColors: Record<string, string> = {
              inscription: 'bg-blue-500',
              invest: 'bg-emerald-500',
              withdraw: 'bg-red-500',
              deposit: 'bg-amber-500',
            };
            return (
              <div
                key={i}
                className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50"
              >
                <div
                  className={`mt-1 h-2.5 w-2.5 rounded-full shrink-0 ${typeColors[activity.type] || 'bg-slate-400'}`}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 dark:text-white">
                    {activityLabels[activity.action] || activity.action}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                    {activity.detail}
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
