'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, Wallet, ArrowLeft, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import GlassCard from '@/components/ui/glass-card';
import GradientButton from '@/components/ui/gradient-button';
import apiClient from '@/lib/api-client';
import { API_URLS } from '@/lib/constants';

export default function VerificationEmailPage() {
  const router = useRouter();
  const [code, setCode] = useState<string[]>(Array(6).fill(''));
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [userEmail, setUserEmail] = useState('');

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (!user) {
      router.push('/connexion');
      return;
    }
    const parsed = JSON.parse(user);
    setUserEmail(parsed.email || '');

    if (parsed.email_verified_at) {
      router.push('/dashboard');
    }
  }, [router]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value.slice(-1);
    setCode(newCode);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const fullCode = code.join('');
    if (fullCode.length !== 6) {
      toast.error('Veuillez entrer le code à 6 chiffres');
      return;
    }

    setLoading(true);
    try {
      const res = await apiClient.post(API_URLS.auth.verifyEmail, {
        code: fullCode,
      });

      if (res.data.data) {
        localStorage.setItem('user', JSON.stringify(res.data.data));
      }

      toast.success('Email vérifié avec succès !');
      router.push('/dashboard');
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosErr = err as { response?: { data?: { message?: string } } };
        toast.error(axiosErr.response?.data?.message || 'Code invalide');
      } else {
        toast.error('Une erreur est survenue');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    try {
      await apiClient.post(API_URLS.auth.resendOtp);
      toast.success('Un nouveau code vous a été envoyé');
      setCountdown(60);
      setCode(Array(6).fill(''));
      inputRefs.current[0]?.focus();
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosErr = err as { response?: { data?: { message?: string } } };
        toast.error(axiosErr.response?.data?.message || 'Erreur lors de l\'envoi');
      } else {
        toast.error('Une erreur est survenue');
      }
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-emerald-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 p-4">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600">
            <Wallet className="h-5 w-5 text-white" />
          </div>
          <span className="text-2xl font-bold text-slate-900 dark:text-white">NexusCoin</span>
        </div>

        <GlassCard variant="default" padding="lg">
          <div className="text-center mb-6">
            <div className="flex justify-center mb-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/40">
                <Mail className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Vérification email</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
              Un code à 6 chiffres vous a été envoyé à
            </p>
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mt-1">
              {userEmail || 'votre adresse email'}
            </p>
          </div>

          <div className="flex justify-center gap-3 mb-6">
            {code.map((digit, index) => (
              <input
                key={index}
                ref={(el) => { inputRefs.current[index] = el; }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className={`w-12 h-14 text-center text-xl font-bold rounded-xl border-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all ${
                  digit ? 'border-emerald-500 dark:border-emerald-400' : 'border-slate-300 dark:border-slate-600'
                }`}
              />
            ))}
          </div>

          <GradientButton
            variant="primary"
            size="lg"
            className="w-full"
            disabled={loading || code.join('').length !== 6}
            onClick={handleVerify}
          >
            {loading ? 'Vérification...' : 'Vérifier mon email'}
          </GradientButton>

          <div className="mt-4 text-center">
            <button
              onClick={handleResend}
              disabled={resending || countdown > 0}
              className="inline-flex items-center gap-1.5 text-sm text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 disabled:text-slate-400 dark:disabled:text-slate-500 transition-colors"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${resending ? 'animate-spin' : ''}`} />
              {countdown > 0
                ? `Renvoyer dans ${countdown}s`
                : resending ? 'Envoi...' : 'Renvoyer le code'}
            </button>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-700 text-center">
            <button
              onClick={() => router.push('/dashboard')}
              className="inline-flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Vérifier plus tard
            </button>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
