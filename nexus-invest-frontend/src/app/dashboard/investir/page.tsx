'use client';

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Info, TrendingUp } from 'lucide-react';
import { useI18nStore } from '@/stores/i18n-store';
import GlassCard from '@/components/ui/glass-card';
import GradientButton from '@/components/ui/gradient-button';
import InvestmentPackCard from '@/components/ui/investment-pack-card';
import { useInvestments } from '@/hooks/use-investments';
import type { InvestmentPack } from '@/hooks/use-investments';

export default function InvestPage() {
  const router = useRouter();
  const { t } = useI18nStore();
  const { packs } = useInvestments();

  const handleSelect = useCallback(
    (pack: InvestmentPack) => {
      router.push(`/dashboard/investir/${pack.id}`);
    },
    [router]
  );

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{t('invest.title')}</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {t('invest.choose_pack')}
        </p>
      </div>

      <GlassCard variant="highlight" padding="sm" className="flex items-start gap-3">
        <Info className="h-5 w-5 text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0" />
        <p className="text-sm text-slate-700 dark:text-slate-300">
          <strong>{t('invest.advice')} :</strong> {t('invest.advice_text')}
        </p>
      </GlassCard>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {packs.map((pack) => (
          <InvestmentPackCard key={pack.id} pack={pack} onSelect={handleSelect} />
        ))}
      </div>
    </div>
  );
}
