'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, ArrowLeft, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import AuthLayout from '@/components/layout/auth-layout';
import GradientButton from '@/components/ui/gradient-button';
import apiClient from '@/lib/api-client';
import { API_URLS } from '@/lib/constants';
import { useI18nStore } from '@/stores/i18n-store';

export default function VerificationEmailPage() {
  const { t } = useI18nStore();
  const router = useRouter();
  const [code, setCode] = useState<string[]>(Array(6).fill(''));
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [userEmail, setUserEmail] = useState('');

  useEffect(() => {
    const user = sessionStorage.getItem('user');
    if (!user) {
      router.push('/connexion');
      return;
    }
    const parsed = JSON.parse(user);
    setUserEmail(parsed.email || '');

    if (parsed.email_verified_at) {
      router.push('/dashboard');
    }

    const pending = sessionStorage.getItem('pending_verification');
    if (pending === 'true') {
      sessionStorage.removeItem('pending_verification');
      const doResend = async () => {
        try {
          await apiClient.post(API_URLS.auth.resendOtp);
          setCountdown(60);
          toast.success(t('verification.code_sent_toast'));
        } catch {
        }
      };
      doResend();
    }
  }, [router, t]);

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
      toast.error(t('verification.enter_code'));
      return;
    }

    setLoading(true);
    try {
      const res = await apiClient.post(API_URLS.auth.verifyEmail, {
        code: fullCode,
      });

      if (res.data.data) {
        sessionStorage.setItem('user', JSON.stringify(res.data.data));
      }

      toast.success(t('verification.success'));
      router.push('/dashboard');
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosErr = err as { response?: { data?: { message?: string } } };
        toast.error(axiosErr.response?.data?.message || t('auth.invalid_code'));
      } else {
        toast.error(t('common.error'));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    try {
      await apiClient.post(API_URLS.auth.resendOtp);
      toast.success(t('auth.code_resend_success'));
      setCountdown(60);
      setCode(Array(6).fill(''));
      inputRefs.current[0]?.focus();
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosErr = err as { response?: { data?: { message?: string } } };
        toast.error(axiosErr.response?.data?.message || t('auth.code_resend_error'));
      } else {
        toast.error(t('common.error'));
      }
    } finally {
      setResending(false);
    }
  };

  return (
    <AuthLayout title={t('verification.title')} subtitle={t('verification.code_sent_to', { email: userEmail || t('verification.your_email') })}>
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
        {loading ? t('verification.verify_loading') : t('verification.verify_btn')}
      </GradientButton>

      <div className="mt-4 text-center">
        <button
          onClick={handleResend}
          disabled={resending || countdown > 0}
          className="inline-flex items-center gap-1.5 text-sm text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 disabled:text-slate-400 dark:disabled:text-slate-500 transition-colors"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${resending ? 'animate-spin' : ''}`} />
          {countdown > 0
            ? t('verification.resend_in', { seconds: countdown })
            : resending ? t('verification.resending') : t('verification.resend')}
        </button>
      </div>

      <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-700 text-center">
        <button
          onClick={() => router.push('/dashboard')}
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          {t('verification.verify_later')}
        </button>
      </div>
    </AuthLayout>
  );
}
