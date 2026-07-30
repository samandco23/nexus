'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Wallet, TrendingUp, Pickaxe, ArrowRight, Zap, PiggyBank } from 'lucide-react';
import { useI18nStore } from '@/stores/i18n-store';
import StatCard from '@/components/ui/stat-card';
import GlassCard from '@/components/ui/glass-card';
import GradientButton from '@/components/ui/gradient-button';
import CountdownTimer from '@/components/ui/countdown-timer';
import { StaggerContainer, StaggerItem, FadeIn, SlideUp } from '@/components/shared/animations';
import dynamic from 'next/dynamic';

const WalletChart = dynamic(() => import('@/components/ui/wallet-chart'), {
  ssr: false,
  loading: () => <div className="h-[250px] rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />,
});
import LoadingSpinner from '@/components/shared/loading-spinner';
import ErrorState from '@/components/shared/error-state';
import { useUser } from '@/hooks/use-user';
import { useWallet } from '@/hooks/use-wallet';
import { useInvestments } from '@/hooks/use-investments';
import { formatFCFA } from '@/lib/currency';

export default function DashboardPage() {
  const { user, loading: userLoading, error: userError } = useUser();
  const { balance, loading: walletLoading, error: walletError } = useWallet();
  const { investments, loading: invLoading, error: invError } = useInvestments();

  const { t } = useI18nStore();
  const loading = userLoading || walletLoading || invLoading;
  const error = userError || walletError || invError;

  const chartData = useMemo(() => {
    if (!balance) return [];
    const today = new Date();
    return Array.from({ length: 30 }, (_, i) => {
      const date = new Date(today);
      date.setDate(date.getDate() - (29 - i));
      const day = date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
      const base = balance.fiat_balance / 2;
      const variance = Math.sin(i * 0.3) * base * 0.2;
      return { date: day, value: Math.round(base + variance + i * (base / 60)) };
    });
  }, [balance]);

  const activeInvestments = useMemo(
    () => investments.filter((inv) => inv.status === 'active'),
    [investments]
  );

  const nextPayout = useMemo(() => {
    if (activeInvestments.length === 0) return null;
    const nearest = activeInvestments.reduce((a, b) =>
      new Date(a.end_date) < new Date(b.end_date) ? a : b
    );
    return {
      targetDate: new Date(nearest.end_date),
      estimatedAmount: nearest.expected_return - nearest.amount_invested,
    };
  }, [activeInvestments]);

  if (loading) {
    return <LoadingSpinner centered size="lg" label={t('common.loading')} />;
  }

  if (error) {
    return <ErrorState message={error} />;
  }

  return (
    <div className="flex flex-col gap-6">
      <FadeIn>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              {t('app.welcome')}{user ? `, ${user.first_name} ${user.last_name}` : ''}
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {t('dashboard.subtitle')}
            </p>
          </div>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.4 }}
            className="flex gap-3"
          >
            <Link href="/dashboard/investir">
              <GradientButton variant="primary" size="md" iconComponent={Zap}>
                {t('dashboard.invest')}
              </GradientButton>
            </Link>
            <Link href="/dashboard/minage">
              <GradientButton variant="secondary" size="md" iconComponent={Pickaxe}>
                {t('dashboard.mining')}
              </GradientButton>
            </Link>
          </motion.div>
        </div>
      </FadeIn>

      {nextPayout && (
        <SlideUp delay={0.15}>
          <GlassCard variant="highlight" padding="md">
            <CountdownTimer
              targetDate={nextPayout.targetDate}
              label={t('dashboard.next_payment')}
              estimatedAmount={nextPayout.estimatedAmount}
            />
          </GlassCard>
        </SlideUp>
      )}

      <StaggerContainer>
        <div className="grid sm:grid-cols-3 gap-4">
          <StaggerItem>
            <StatCard
              label={t('dashboard.total_balance')}
              value={balance?.fiat_balance ?? 0}
              icon={Wallet}
              trend={null}
            />
          </StaggerItem>
          <StaggerItem>
            <StatCard
              label={t('dashboard.lifetime_earnings')}
              value={balance?.lifetime_earnings ?? 0}
              icon={TrendingUp}
              trend={null}
            />
          </StaggerItem>
          <StaggerItem>
            <StatCard
              label={t('dashboard.token_balance')}
              value={balance?.token_balance ?? 0}
              icon={PiggyBank}
              isCurrency={false}
              suffix={t('wallet.token_suffix')}
              trend={null}
            />
          </StaggerItem>
        </div>
      </StaggerContainer>

      <SlideUp delay={0.25}>
        <GlassCard variant="default" padding="md">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">{t('dashboard.balance_evolution')}</h3>
            <span className="text-xs text-slate-400">{t('dashboard.last_30_days')}</span>
          </div>
          <WalletChart data={chartData} height={250} />
        </GlassCard>
      </SlideUp>

      <SlideUp delay={0.35}>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Link href="/dashboard/investir">
            <GradientButton variant="primary" size="lg" fullWidth iconComponent={TrendingUp} iconPosition="left">
              {t('dashboard.invest')}
            </GradientButton>
          </Link>
          <Link href="/dashboard/minage">
            <GradientButton variant="secondary" size="lg" fullWidth iconComponent={Pickaxe} iconPosition="left">
              {t('dashboard.mining')}
            </GradientButton>
          </Link>
          <Link href="/dashboard/portefeuille/retrait">
            <GradientButton variant="danger" size="lg" fullWidth iconComponent={Wallet} iconPosition="left">
              {t('dashboard.withdraw')}
            </GradientButton>
          </Link>
        </div>
      </SlideUp>

      <SlideUp delay={0.45}>
        <GlassCard variant="default" padding="md">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">{t('dashboard.active_investments')}</h3>
            <Link href="/dashboard/investir" className="text-sm text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 font-medium inline-flex items-center gap-1">
              {t('common.view_all')} <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          {activeInvestments.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-slate-500 dark:text-slate-400 mb-3">{t('dashboard.no_active_investments')}</p>
              <Link href="/dashboard/investir">
                <GradientButton variant="primary" size="md">{t('dashboard.start_investing')}</GradientButton>
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {activeInvestments.map((inv, i) => (
                <motion.div
                  key={inv.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + i * 0.08, duration: 0.4 }}
                  className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full" style={{ backgroundColor: inv.pack?.color_code ?? '#10b981' }} />
                      <span className="font-semibold text-slate-900 dark:text-white">{inv.pack?.name ?? 'Pack'}</span>
                    </div>
                    <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                      +{formatFCFA(inv.expected_return - inv.amount_invested)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-400 mb-2">
                    <span>{formatFCFA(inv.amount_invested)}</span>
                    <span>{t('dashboard.end_date', { date: new Date(inv.end_date).toLocaleDateString('fr-FR') })}</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                    <motion.div
                      className="h-2 rounded-full"
                      initial={{ width: 0 }}
                      animate={{
                        width: `${Math.min(100, Math.round(
                          ((Date.now() - new Date(inv.start_date).getTime()) /
                            (new Date(inv.end_date).getTime() - new Date(inv.start_date).getTime())) * 100
                        ))}%`,
                      }}
                      transition={{ duration: 1, ease: [0.25, 0.46, 0.45, 0.94] }}
                      style={{ backgroundColor: inv.pack?.color_code ?? '#10b981' }}
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </GlassCard>
      </SlideUp>
    </div>
  );
}
