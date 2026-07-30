'use client';

import { useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Shield, CreditCard, Smartphone, Building2, Check, ArrowLeft, Lock } from 'lucide-react';
import { useI18nStore } from '@/stores/i18n-store';
import confetti from 'canvas-confetti';
import { toast } from 'sonner';
import GlassCard from '@/components/ui/glass-card';
import GradientButton from '@/components/ui/gradient-button';
import LoadingSpinner from '@/components/shared/loading-spinner';
import ErrorState from '@/components/shared/error-state';
import EmptyState from '@/components/shared/empty-state';
import { useInvestments } from '@/hooks/use-investments';
import { formatFCFA } from '@/lib/currency';


type PaymentMethod = 'carte' | 'mobile_money' | 'virement';

const paymentMethods: { id: PaymentMethod; labelKey: string; descKey: string; icon: typeof CreditCard }[] = [
  { id: 'carte', labelKey: 'Carte Bancaire', descKey: 'invest.card_visa', icon: CreditCard },
  { id: 'mobile_money', labelKey: 'Mobile Money', descKey: 'invest.mobile_money', icon: Smartphone },
  { id: 'virement', labelKey: 'Virement Bancaire', descKey: 'invest.bank_transfer', icon: Building2 },
];

export default function CheckoutPage() {
  const params = useParams();
  const router = useRouter();
  const packId = params.packId as string;

  const { t } = useI18nStore();
  const { packs, loading: packsLoading } = useInvestments();
  const pack = useMemo(() => packs.find((p) => p.id === Number(packId)), [packId, packs]);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [loading, setLoading] = useState(false);

  if (packsLoading) {
    return <LoadingSpinner />;
  }

  if (!pack) {
    return (
      <EmptyState
        icon={Shield}
        title={t('invest.pack_not_found')}
        description={t('invest.pack_not_found_desc')}
        actionLabel={t('invest.view_packs')}
        onAction={() => router.push('/dashboard/investir')}
      />
    );
  }

  const gain = pack.min_amount * (pack.roi_percentage / 100);
  const totalReturn = pack.min_amount + gain;

  const { createInvestment } = useInvestments();

  const handlePayment = async () => {
    if (!selectedMethod) {
      toast.error(t('invest.select_payment_method'));
      return;
    }
    setLoading(true);
    try {
      const providerMap: Record<string, string> = {
        carte: 'stripe',
        mobile_money: 'flutterwave',
      };
      const provider = providerMap[selectedMethod];
      if (!provider) {
        toast.error(t('invest.unsupported_method'));
        return;
      }
      await createInvestment(pack.id, pack.min_amount, provider);
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#10b981', '#34d399', '#f59e0b'],
      });
      toast.success(t('invest.created_success'));
      router.push('/dashboard');
    } catch {
      toast.error(t('invest.payment_error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-2xl mx-auto">
      <button
        onClick={() => router.back()}
        className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors w-fit"
      >
        <ArrowLeft className="h-4 w-4" /> {t('common.back')}
      </button>

      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{t("Finaliser l'investissement")}</h1>

      <GlassCard variant="default" padding="lg">
        <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-200 dark:border-slate-700">
          <div
            className="flex h-16 w-16 items-center justify-center rounded-2xl"
            style={{ backgroundColor: `${pack.color_code}20` }}
          >
            <Shield className="h-8 w-8" style={{ color: pack.color_code }} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">{pack.name}</h2>
            <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400">
              {t('invest.roi_percent', { percent: pack.roi_percentage })}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="rounded-xl bg-slate-50 dark:bg-slate-800 p-4">
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">{t('invest.amount')}</p>
            <p className="text-xl font-bold text-slate-900 dark:text-white">{formatFCFA(pack.min_amount)}</p>
          </div>
          <div className="rounded-xl bg-slate-50 dark:bg-slate-800 p-4">
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">{t('invest.duration')}</p>
            <p className="text-xl font-bold text-slate-900 dark:text-white">{t('invest.duration_days', { days: pack.duration_days })}</p>
          </div>
          <div className="rounded-xl bg-emerald-50 dark:bg-emerald-900/30 p-4">
            <p className="text-xs text-emerald-600 dark:text-emerald-400 mb-1">{t('invest.estimated_gain')}</p>
            <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">+{formatFCFA(gain)}</p>
          </div>
          <div className="rounded-xl bg-emerald-50 dark:bg-emerald-900/30 p-4">
            <p className="text-xs text-emerald-600 dark:text-emerald-400 mb-1">{t('invest.total_return')}</p>
            <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">{formatFCFA(totalReturn)}</p>
          </div>
        </div>

        <div className="border-t border-slate-200 dark:border-slate-700 pt-6">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">{t('invest.payment_method')}</h3>
          <div className="flex flex-col gap-2">
            {paymentMethods.map((method) => {
              const Icon = method.icon;
              const isSelected = selectedMethod === method.id;
              return (
                <button
                  key={method.id}
                  onClick={() => setSelectedMethod(method.id)}
                  className={`flex items-center gap-4 rounded-xl border p-4 text-left transition-all ${
                    isSelected
                      ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/30 dark:border-emerald-700'
                      : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                  }`}
                >
                  <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                    isSelected ? 'bg-emerald-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                  }`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-slate-900 dark:text-white">{t(method.labelKey)}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{t(method.descKey)}</p>
                  </div>
                  {isSelected && <Check className="h-5 w-5 text-emerald-500" />}
                </button>
              );
            })}
          </div>
        </div>
      </GlassCard>

      <GlassCard variant="default" padding="md">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-semibold text-slate-900 dark:text-white">{t('invest.total_to_pay')}</span>
          <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{formatFCFA(pack.min_amount)}</span>
        </div>
        <GradientButton
          variant="primary"
          size="lg"
          fullWidth
          loading={loading}
          onClick={handlePayment}
        >
          {t('invest.proceed')}
        </GradientButton>
        <div className="flex items-center justify-center gap-2 mt-3">
          <Lock className="h-4 w-4 text-slate-400" />
          <span className="text-xs text-slate-400">{t('invest.secure')}</span>
        </div>
      </GlassCard>
    </div>
  );
}
