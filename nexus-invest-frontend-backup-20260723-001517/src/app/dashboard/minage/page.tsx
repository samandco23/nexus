'use client';

import { useCallback, useMemo } from 'react';
import { useState } from 'react';
import { Pickaxe, Zap, Users, Timer, Coins, TrendingUp } from 'lucide-react';
import { useI18nStore } from '@/stores/i18n-store';
import confetti from 'canvas-confetti';
import { toast } from 'sonner';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import GlassCard from '@/components/ui/glass-card';
import GradientButton from '@/components/ui/gradient-button';
import StatCard from '@/components/ui/stat-card';
import LoadingSpinner from '@/components/shared/loading-spinner';
import ErrorState from '@/components/shared/error-state';
import { useMining } from '@/hooks/use-mining';
import { formatFCFA } from '@/lib/currency';
import apiClient from '@/lib/api-client';
import { API_URLS } from '@/lib/constants';

export default function MiningPage() {
  const { t } = useI18nStore();
  const { status, history, loading, error, validate } = useMining();
  const [converting, setConverting] = useState(false);

  const canMine = status?.can_mine ?? true;

  const handleValidate = useCallback(async () => {
    if (!canMine) {
      toast.error(t('mining.no_earnings'));
      return;
    }
    try {
      await validate();
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.5 },
        colors: ['#10b981', '#34d399', '#f59e0b', '#6366f1'],
      });
      toast.success(t('mining.validated'));
    } catch {
      toast.error(t('mining.validation_error'));
    }
  }, [canMine, validate]);

  const lastValidationLabel = useMemo(() => {
    if (history.length === 0) return t('mining.no_validation');
    const d = new Date(history[0].created_at);
    return d.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  }, [history]);

  const todayEarnings = history.length > 0 ? history[0].amount_mined : 0;

  const chartData = useMemo(() => {
    return history.map((log) => ({
      day: new Date(log.mined_date).toLocaleDateString('fr-FR', { weekday: 'short' }),
      value: log.amount_mined,
    })).reverse();
  }, [history]);

  if (loading) {
    return <LoadingSpinner centered size="lg" label={t('common.loading')} />;
  }

  if (error) {
    return <ErrorState message={error} />;
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{t('mining.virtual_title')}</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {t('mining.subtitle')}
        </p>
      </div>

      <GlassCard variant={canMine ? 'highlight' : 'default'} padding="lg" className="text-center">
        <div className="flex flex-col items-center gap-4">
          <div className={`flex h-20 w-20 items-center justify-center rounded-full ${
            canMine ? 'pulse-mining bg-emerald-100 dark:bg-emerald-900/40' : 'bg-slate-100 dark:bg-slate-800'
          }`}>
            <Pickaxe className={`h-10 w-10 ${
              canMine ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'
            }`} />
          </div>
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">
              {canMine ? t('mining.earnings_available') : t('mining.last_validation')}
            </p>
            <p className="text-3xl font-bold text-slate-900 dark:text-white">
              {formatFCFA(todayEarnings)}
            </p>
          </div>
          <GradientButton
            variant={canMine ? 'gold' : 'secondary'}
            size="lg"
            iconComponent={Zap}
            loading={false}
            onClick={handleValidate}
            disabled={!canMine}
            className={canMine ? 'pulse-mining' : ''}
          >
            {t('mining.validate')}
          </GradientButton>
        </div>
      </GlassCard>

      <div className="grid sm:grid-cols-3 gap-4">
        <StatCard
          label={t('mining.current_rate')}
          value={status?.current_rate || 0}
          icon={TrendingUp}
          isCurrency
        />
        <StatCard
          label={t('mining.streak_days')}
          value={status?.streak_days || 0}
          icon={Users}
          isCurrency={false}
          suffix={t('common.days')}
          trend={null}
        />
        <StatCard
          label={t('mining.days_missed')}
          value={status?.days_missed || 0}
          icon={Timer}
          isCurrency={false}
          suffix={t('common.days')}
          trend={null}
        />
      </div>

      <GlassCard variant="default" padding="md">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">{t('mining.token_conversion')}</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {t('mining.convert_subtitle')}
            </p>
          </div>
          <GradientButton
            variant="secondary"
            size="md"
            iconComponent={Coins}
            loading={converting}
            onClick={async () => {
              setConverting(true);
              try {
                await apiClient.post(API_URLS.mining.convert);
                toast.success(t('mining.converted'));
              } catch {
                toast.error(t('mining.conversion_error'));
              } finally {
                setConverting(false);
              }
            }}
          >
            {t('mining.convert_btn')}
          </GradientButton>
        </div>
      </GlassCard>

      <GlassCard variant="default" padding="md">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">{t('mining.history_title')}</h3>
          <span className="text-xs text-slate-400">{t('mining.last_validation_label', { label: lastValidationLabel })}</span>
        </div>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="day" tick={{ fontSize: 12 }} stroke="#94a3b8" />
            <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" />
            <Tooltip
              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
              formatter={(value) => [formatFCFA(Number(value)), t('invest.amount')]}
            />
            <Bar dataKey="value" fill="#10b981" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </GlassCard>
    </div>
  );
}
