'use client';

import type { LucideIcon } from 'lucide-react';
import * as Icons from 'lucide-react';
import type { InvestmentPack } from '@/hooks/use-investments';
import { formatFCFA } from '@/lib/currency';
import GradientButton from './gradient-button';
import { useI18nStore } from '@/stores/i18n-store';

interface InvestmentPackCardProps {
  pack: InvestmentPack;
  onSelect: (pack: InvestmentPack) => void;
  selected?: boolean;
  className?: string;
}

function resolveIcon(iconName: string): LucideIcon {
  const iconKey = iconName as keyof typeof Icons;
  return (Icons[iconKey] as LucideIcon) || Icons.Package;
}

const levelBorderColors: Record<string, string> = {
  '1': 'border-t-emerald-500',
  '2': 'border-t-emerald-400',
  '3': 'border-t-slate-400',
  '4': 'border-t-amber-500',
  '5': 'border-t-indigo-400',
  '6': 'border-t-cyan-400',
  '7': 'border-t-pink-400',
  '8': 'border-t-violet-500',
  '9': 'border-t-rose-500',
};

export default function InvestmentPackCard({
  pack,
  onSelect,
  selected = false,
  className = '',
}: InvestmentPackCardProps) {
  const { t } = useI18nStore();
  const IconComponent = resolveIcon(pack.icon_name);
  const roiMultiplier = pack.roi_percentage / 100;
  const gain = pack.min_amount * roiMultiplier;
  const totalReturn = pack.min_amount + gain;

  const borderColor =
    levelBorderColors[pack.display_order.toString()] || 'border-t-emerald-500';

  return (
    <div
      className={`relative rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 border-t-4 ${borderColor} shadow-md hover:shadow-xl transition-all duration-300 hover:scale-[1.02] cursor-pointer ${
        selected ? 'ring-2 ring-emerald-500 shadow-lg' : ''
      } ${className}`}
      role="article"
      aria-label={`Pack ${pack.name}`}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect(pack);
        }
      }}
    >
      <div className="p-5 flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <div
            className="flex h-12 w-12 items-center justify-center rounded-full"
            style={{ backgroundColor: `${pack.color_code}20` }}
          >
            <IconComponent
              className="h-6 w-6"
              style={{ color: pack.color_code }}
            />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              {pack.name}
            </h3>
            <div
              className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold"
              style={{
                backgroundColor: `${pack.color_code}15`,
                color: pack.color_code,
              }}
            >
              +{pack.roi_percentage}% de rendement
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-lg bg-slate-50 dark:bg-slate-700/50 p-2.5">
            <span className="block text-xs text-slate-500 dark:text-slate-400 mb-0.5">
              {t('invest.capital')}
            </span>
            <span className="font-bold text-slate-900 dark:text-white">
              {formatFCFA(pack.min_amount)}
            </span>
          </div>
          <div className="rounded-lg bg-slate-50 dark:bg-slate-700/50 p-2.5">
            <span className="block text-xs text-slate-500 dark:text-slate-400 mb-0.5">
              {t('invest.duration')}
            </span>
            <span className="font-bold text-slate-900 dark:text-white">
              {pack.duration_days} {t('common.days')}
            </span>
          </div>
          <div className="rounded-lg bg-slate-50 dark:bg-slate-700/50 p-2.5">
            <span className="block text-xs text-slate-500 dark:text-slate-400 mb-0.5">
              {t('invest.estimated_gain')}
            </span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400">
              +{formatFCFA(gain)}
            </span>
          </div>
          <div className="rounded-lg bg-slate-50 dark:bg-slate-700/50 p-2.5">
            <span className="block text-xs text-slate-500 dark:text-slate-400 mb-0.5">
              {t('invest.total_return')}
            </span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400">
              {formatFCFA(totalReturn)}
            </span>
          </div>
        </div>

        <GradientButton
          variant="primary"
          size="md"
          fullWidth
          onClick={() => onSelect(pack)}
          ariaLabel={`Choisir le pack ${pack.name}`}
        >
          {t('invest.choose_pack')}
        </GradientButton>
      </div>
    </div>
  );
}
