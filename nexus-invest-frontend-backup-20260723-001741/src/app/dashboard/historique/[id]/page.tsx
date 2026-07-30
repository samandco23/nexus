'use client';

import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft, TrendingUp, ArrowUpRight, Users, Pickaxe, Wallet,
  Clock, CheckCircle, XCircle, Copy
} from 'lucide-react';
import { useI18nStore } from '@/stores/i18n-store';
import { toast } from 'sonner';
import GlassCard from '@/components/ui/glass-card';
import GradientButton from '@/components/ui/gradient-button';
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

export default function TransactionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { t } = useI18nStore();
  const { transactions } = useWallet();
  const tx = transactions.find((t) => String(t.id) === params.id);

  if (!tx) {
    return (
      <EmptyState
        icon={Wallet}
        title={t('transaction.not_found')}
        description={t('transaction.not_found_desc')}
        actionLabel={t('transaction.back')}
        onAction={() => router.push('/dashboard/historique')}
      />
    );
  }

  const TypeIcon = typeIcons[tx.type] || Wallet;
  const typeColor = typeColors[tx.type] || 'text-slate-600 bg-slate-100';
  const status = statusConfig[tx.status] || statusConfig.pending;
  const StatusIcon = status.icon;

  const detailRows = [
    { label: t('transaction.id'), value: String(tx.id), copyable: true },
    { label: t('transaction.created_at'), value: new Date(tx.created_at).toLocaleDateString('fr-FR', {
      day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
    })},
    { label: t('transaction.updated_at'), value: new Date(tx.updated_at).toLocaleDateString('fr-FR', {
      day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
    })},
    { label: t('transaction.description'), value: tx.description || t('transaction.no_description') },
  ];

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast.success(t('common.copied'));
    }).catch(() => {
      toast.error(t('Erreur lors de la copie'));
    });
  };

  return (
    <div className="flex flex-col gap-6 max-w-2xl mx-auto">
      <button
        onClick={() => router.back()}
        className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors w-fit"
      >
        <ArrowLeft className="h-4 w-4" /> {t('common.back')}
      </button>

      <GlassCard variant="default" padding="lg">
        <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-200 dark:border-slate-700">
          <div className={`flex h-14 w-14 items-center justify-center rounded-xl ${typeColor}`}>
            <TypeIcon className="h-7 w-7" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">
              {t(typeLabels[tx.type] || tx.type)}
            </h1>
            <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${status.color} ${status.bg}`}>
              <StatusIcon className="h-3 w-3" />
              {t(status.labelKey)}
            </span>
          </div>
          <div className="ml-auto text-right">
            <p className={`text-2xl font-bold ${tx.type === 'withdrawal' ? 'text-red-600' : 'text-emerald-600'}`}>
              {tx.type === 'withdrawal' ? '-' : '+'}{formatFCFA(tx.amount)}
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          {detailRows.map((row) => (
            <div key={row.label} className="flex items-start justify-between py-2 border-b border-slate-100 dark:border-slate-700/50 last:border-0">
              <span className="text-sm text-slate-500 dark:text-slate-400">{row.label}</span>
              <div className="flex items-center gap-2 text-right">
                <span className="text-sm font-medium text-slate-900 dark:text-white break-all max-w-xs">
                  {row.value}
                </span>
                {row.copyable && (
                  <button
                    onClick={() => handleCopy(row.value)}
                    className="text-slate-400 hover:text-emerald-600 transition-colors shrink-0"
                    aria-label={t('common.copy')}
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </GlassCard>

    </div>
  );
}
