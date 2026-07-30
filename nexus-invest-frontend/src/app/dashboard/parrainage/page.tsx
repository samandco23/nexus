'use client';

import { useState, useCallback } from 'react';
import { Users, Copy, Check, Gift, TrendingUp, UserPlus, ChevronDown, ChevronRight, Edit3, Save, X } from 'lucide-react';
import { useI18nStore } from '@/stores/i18n-store';
import { toast } from 'sonner';
import GlassCard from '@/components/ui/glass-card';
import GradientButton from '@/components/ui/gradient-button';
import StatCard from '@/components/ui/stat-card';
import LoadingSpinner from '@/components/shared/loading-spinner';
import ErrorState from '@/components/shared/error-state';
import { useReferrals } from '@/hooks/use-referrals';
import type { ReferralNode } from '@/hooks/use-referrals';
import { useUser } from '@/hooks/use-user';
import { formatFCFA } from '@/lib/currency';
import apiClient from '@/lib/api-client';
import { API_URLS } from '@/lib/constants';

function ReferralTreeItem({ node, depth = 0, t }: { node: ReferralNode; depth?: number; t: (key: string, params?: Record<string, string | number>) => string }) {
  const [expanded, setExpanded] = useState(depth < 1);
  const hasChildren = node.children && node.children.length > 0;

  const levelColors = ['#10b981', '#3b82f6', '#8b5cf6'];
  const levelLabels = [t('referral.level', { level: 1 }), t('referral.level', { level: 2 }), t('referral.level', { level: 3 })];

  return (
    <div className="select-none">
      <div
        className={`flex items-center gap-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-3 transition-all hover:border-slate-300 dark:hover:border-slate-600 ${
          depth > 0 ? 'ml-6 sm:ml-10' : ''
        }`}
        style={{ borderLeftColor: levelColors[depth] || '#94a3b8', borderLeftWidth: 3 }}
      >
        {hasChildren ? (
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
            aria-label={expanded ? t('history.hide') : t('history.expand')}
          >
            {expanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
          </button>
        ) : (
          <div className="h-6 w-6" />
        )}
        <div className="flex h-8 w-8 items-center justify-center rounded-full text-white text-xs font-bold"
          style={{ backgroundColor: levelColors[depth] || '#94a3b8' }}
        >
          {node.name.charAt(0)}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{node.name}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">{levelLabels[depth] || `Niveau ${depth + 1}`}</p>
        </div>
        <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{formatFCFA(node.total_invested)}</span>
      </div>
      {expanded && hasChildren && (
        <div className="flex flex-col gap-2 mt-2">
          {node.children!.map((child) => (
            <ReferralTreeItem key={child.id} node={child} depth={depth + 1} t={t} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function ReferralPage() {
  const { t } = useI18nStore();
  const { stats, tree, loading, error, refetch } = useReferrals();
  const [copied, setCopied] = useState(false);
  const [editingCode, setEditingCode] = useState(false);
  const [newCode, setNewCode] = useState('');
  const [savingCode, setSavingCode] = useState(false);

  const { user, refetch: refetchUser } = useUser();
  const referralLink = `https://nexusinvest.com/inscription?ref=${user?.referral_code ?? 'PARRAIN'}`;

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(referralLink).then(() => {
      setCopied(true);
      toast.success(t('referral.link_copied'));
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => {
      toast.error(t('referral.copy_error'));
    });
  }, [referralLink, t]);

  const handleEditCode = () => {
    setNewCode(user?.referral_code || '');
    setEditingCode(true);
  };

  const handleCancelEdit = () => {
    setEditingCode(false);
    setNewCode('');
  };

  const handleSaveCode = async () => {
    if (!newCode || newCode.length < 4 || !/^[a-zA-Z0-9]+$/.test(newCode)) {
      toast.error('Le code doit contenir au moins 4 caractères alphanumériques.');
      return;
    }
    setSavingCode(true);
    try {
      await apiClient.put(API_URLS.referrals.code, { referral_code: newCode });
      toast.success('Code de parrainage mis à jour avec succès !');
      setEditingCode(false);
      refetchUser();
      refetch();
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosErr = err as { response: { data?: { message?: string } } };
        toast.error(axiosErr.response?.data?.message || 'Erreur lors de la mise à jour.');
      } else {
        toast.error('Erreur lors de la mise à jour du code.');
      }
    } finally {
      setSavingCode(false);
    }
  };

  if (loading) {
    return <LoadingSpinner centered size="lg" label={t('common.loading')} />;
  }

  if (error) {
    return <ErrorState message={error} />;
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{t('referral.title')}</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {t('referral.subtitle')}
        </p>
      </div>

      <GlassCard variant="highlight" padding="md">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Code de parrainage
            </label>
            {!editingCode && (
              <button
                onClick={handleEditCode}
                className="inline-flex items-center gap-1 text-sm text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300"
              >
                <Edit3 className="h-3.5 w-3.5" />
                Personnaliser
              </button>
            )}
          </div>

          {editingCode ? (
            <div className="flex gap-2">
              <input
                type="text"
                value={newCode}
                onChange={(e) => setNewCode(e.target.value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase())}
                placeholder="MONCODE2026"
                maxLength={20}
                className="flex-1 rounded-xl border border-emerald-300 dark:border-emerald-600 py-2.5 px-4 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                autoFocus
              />
              <GradientButton
                variant="primary"
                size="md"
                iconComponent={Save}
                iconPosition="only"
                onClick={handleSaveCode}
                loading={savingCode}
                ariaLabel="Enregistrer"
              >
                <span className="sr-only">Enregistrer</span>
              </GradientButton>
              <GradientButton
                variant="secondary"
                size="md"
                iconComponent={X}
                iconPosition="only"
                onClick={handleCancelEdit}
                ariaLabel="Annuler"
              >
                <span className="sr-only">Annuler</span>
              </GradientButton>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <span className="text-lg font-bold font-mono text-emerald-600 dark:text-emerald-400">
                {user?.referral_code || '—'}
              </span>
              <span className="text-xs text-slate-400">(4-20 caractères, lettres et chiffres uniquement)</span>
            </div>
          )}

          <div className="border-t border-slate-200 dark:border-slate-600 pt-3">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              {t('referral.your_link')}
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={referralLink}
                readOnly
                className="flex-1 rounded-xl border border-slate-300 dark:border-slate-600 py-2.5 px-4 text-sm bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none"
              />
              <GradientButton
                variant="primary"
                size="md"
                iconComponent={copied ? Check : Copy}
                iconPosition="only"
                onClick={handleCopy}
                ariaLabel="Copier le lien"
              >
                <span className="sr-only">{t('common.copy')}</span>
              </GradientButton>
            </div>
          </div>
        </div>
      </GlassCard>

      <GlassCard variant="default" padding="md">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">{t('referral.bonus_structure')}</h3>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="rounded-xl bg-emerald-50 dark:bg-emerald-900/30 p-4">
            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">10%</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">{t('referral.level', { level: 1 })}</p>
          </div>
          <div className="rounded-xl bg-blue-50 dark:bg-blue-900/30 p-4">
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">5%</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">{t('referral.level', { level: 2 })}</p>
          </div>
          <div className="rounded-xl bg-purple-50 dark:bg-purple-900/30 p-4">
            <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">2%</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">{t('referral.level', { level: 3 })}</p>
          </div>
        </div>
      </GlassCard>

      <div className="grid sm:grid-cols-3 gap-4">
        <StatCard
          label={t('referral.level_1_count')}
          value={stats?.counts?.level_1 ?? 0}
          icon={Users}
          isCurrency={false}
          suffix={t('referral.people')}
          trend={null}
        />
        <StatCard
          label={t('referral.total_bonus')}
          value={stats?.total_earned || 0}
          icon={Gift}
          isCurrency
          trend={null}
        />
        <StatCard
          label={t('referral.this_month')}
          value={stats?.by_level?.level_1 ?? 0}
          icon={TrendingUp}
          isCurrency
          trend={15}
          trendLabel={t('referral.vs_last_month')}
        />
      </div>

      <GlassCard variant="default" padding="md">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">{t('referral.tree_title')}</h3>
          <span className="text-xs text-slate-400">{t('referral.direct_referrals', { count: tree.length })}</span>
        </div>
        {tree.length === 0 ? (
          <div className="text-center py-8">
            <UserPlus className="h-12 w-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 dark:text-slate-400">{t('referral.no_referrals')}</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {tree.map((root) => (
              <ReferralTreeItem key={root.id} node={root} depth={0} t={t} />
            ))}
          </div>
        )}
      </GlassCard>
    </div>
  );
}
