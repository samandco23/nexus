'use client';

import { useCallback, useEffect, useState, useMemo, useRef } from 'react';
import { Pickaxe, Zap, Timer, Coins, TrendingUp, Loader2, Clock, Wallet } from 'lucide-react';
import { useI18nStore } from '@/stores/i18n-store';
import { toast } from 'sonner';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import GlassCard from '@/components/ui/glass-card';
import GradientButton from '@/components/ui/gradient-button';
import StatCard from '@/components/ui/stat-card';
import LoadingSpinner from '@/components/shared/loading-spinner';
import ErrorState from '@/components/shared/error-state';
import { useMining } from '@/hooks/use-mining';
import { formatFCFA } from '@/lib/currency';
import { formatCurrency } from '@/lib/i18n';

export default function MiningPage() {
  const { t } = useI18nStore();
  const { status, history, loading, error, start, claim, convert, refresh } = useMining();
  const [starting, setStarting] = useState(false);
  const [claiming, setClaiming] = useState(false);
  const [converting, setConverting] = useState(false);
  const [convertAmount, setConvertAmount] = useState('');
  const [countdown, setCountdown] = useState('');
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const expires = status?.expires_at;
    if (!expires) {
      setCountdown('');
      return;
    }
    const update = () => {
      const remaining = new Date(expires).getTime() - Date.now();
      if (remaining <= 0) {
        setCountdown('Expiré');
        refresh();
        return;
      }
      const h = Math.floor(remaining / 3600000);
      const m = Math.floor((remaining % 3600000) / 60000);
      const s = Math.floor((remaining % 60000) / 1000);
      setCountdown(`${h}h ${m}m ${s}s`);
    };
    update();
    intervalRef.current = setInterval(update, 1000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [status?.expires_at, refresh]);

  const handleStart = useCallback(async () => {
    setStarting(true);
    try {
      await start();
      toast.success('Minage démarré !');
    } catch {
      toast.error('Erreur au démarrage');
    } finally {
      setStarting(false);
    }
  }, [start]);

  const handleClaim = useCallback(async () => {
    setClaiming(true);
    try {
      await claim();
      (await import('canvas-confetti')).default({ particleCount: 120, spread: 80, origin: { y: 0.5 }, colors: ['#10b981', '#34d399', '#f59e0b', '#6366f1'] });
      toast.success('Gains récupérés !');
    } catch {
      toast.error('Erreur lors de la récupération');
    } finally {
      setClaiming(false);
    }
  }, [claim]);

  const handleConvert = useCallback(async () => {
    const amount = parseFloat(convertAmount);
    if (!amount || amount <= 0) {
      toast.error('Montant invalide');
      return;
    }
    if (amount > (status?.token_balance ?? 0)) {
      toast.error('Solde insuffisant');
      return;
    }
    setConverting(true);
    try {
      await convert(amount);
      setConvertAmount('');
      toast.success('Conversion réussie !');
    } catch {
      toast.error('Erreur de conversion');
    } finally {
      setConverting(false);
    }
  }, [convertAmount, status?.token_balance, convert]);

  const chartData = useMemo(() => {
    return history.map((log) => ({
      day: new Date(log.mined_date).toLocaleDateString('fr-FR', { weekday: 'short' }),
      value: log.tokens_mined,
    })).reverse();
  }, [history]);

  if (loading) return <LoadingSpinner centered size="lg" label={t('common.loading')} />;
  if (error) return <ErrorState message={error} />;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Minage Nexus Coin</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">{t('mining.subtitle')}</p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <StatCard label="Tokens NEX" value={status?.token_balance ?? 0} icon={Coins} isCurrency={false} trend={null} />
        <StatCard label="Taux / heure" value={status?.rate_per_hour ?? 0} icon={TrendingUp} isCurrency={false} suffix="NEX" trend={null} />
      </div>

      <GlassCard variant={status?.can_claim ? 'highlight' : status?.can_start ? 'default' : 'default'} padding="lg" className="text-center">
        {status?.session_active && status?.can_claim ? (
          <div className="flex flex-col items-center gap-4">
            <div className="flex h-20 w-20 items-center justify-center rounded-full pulse-mining bg-emerald-100 dark:bg-emerald-900/40">
              <Pickaxe className="h-10 w-10 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Gains en cours</p>
              <p className="text-4xl font-extrabold text-emerald-600 dark:text-emerald-400">
                {status.today_tokens.toFixed(4)} NEX
              </p>
            </div>
            {countdown && (
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <Clock className="h-4 w-4" />
                {countdown}
              </div>
            )}
            <GradientButton variant="gold" size="lg" iconComponent={Zap} onClick={handleClaim} loading={claiming} className="pulse-mining">
              Récupérer mes gains
            </GradientButton>
          </div>
        ) : status?.can_start ? (
          <div className="flex flex-col items-center gap-4">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
              <Pickaxe className="h-10 w-10 text-slate-400" />
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Prêt à miner</p>
              <p className="text-xl font-bold text-slate-900 dark:text-white">
                {status.rate_per_hour} NEX / heure
              </p>
            </div>
            <GradientButton variant="primary" size="lg" iconComponent={Zap} onClick={handleStart} loading={starting}>
              Démarrer le minage
            </GradientButton>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30">
              <Timer className="h-10 w-10 text-amber-500" />
            </div>
            <div>
              <p className="text-sm text-amber-600 dark:text-amber-400 font-medium">{status?.reason ?? 'En attente'}</p>
            </div>
          </div>
        )}
      </GlassCard>

      <GlassCard variant="default" padding="md">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex-1 w-full">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Convertir des NEX en FCFA</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              1 NEX = {formatFCFA(status?.token_value_xaf ?? 10)}
            </p>
            <div className="flex gap-2 mt-3 w-full">
              <input
                type="number"
                value={convertAmount}
                onChange={(e) => setConvertAmount(e.target.value)}
                placeholder="0.00"
                max={status?.token_balance ?? 0}
                step="0.01"
                min="0.01"
                className="flex-1 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 py-2.5 px-4 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              />
              <GradientButton variant="secondary" size="md" iconComponent={Coins} onClick={handleConvert} loading={converting}>
                Convertir
              </GradientButton>
            </div>
            {convertAmount && parseFloat(convertAmount) > 0 && status?.token_value_xaf && (
              <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-2">
                ≈ {formatFCFA(parseFloat(convertAmount) * status.token_value_xaf)}
              </p>
            )}
          </div>
        </div>
      </GlassCard>

      <GlassCard variant="default" padding="md">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">{t('mining.history_title')}</h3>
        </div>
        {history.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-8">Aucun minage pour le moment</p>
        ) : (
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="day" tick={{ fontSize: 12 }} stroke="#94a3b8" />
              <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" />
              <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} formatter={(value) => [Number(value).toFixed(4) + ' NEX', 'Miné']} />
              <Bar dataKey="value" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </GlassCard>
    </div>
  );
}
