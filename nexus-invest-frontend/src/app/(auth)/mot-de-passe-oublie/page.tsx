'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import AuthLayout from '@/components/layout/auth-layout';
import GradientButton from '@/components/ui/gradient-button';
import apiClient from '@/lib/api-client';
import { API_URLS } from '@/lib/constants';
import { useI18nStore } from '@/stores/i18n-store';

export default function ForgotPasswordPage() {
  const { t } = useI18nStore();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error(t('auth.forgot_email_invalid'));
      return;
    }
    setLoading(true);
    try {
      await apiClient.post(API_URLS.auth.forgotPassword, { email });
      setSent(true);
      toast.success(t('auth.forgot_email_success'));
    } catch {
      toast.error(t('auth.forgot_email_error'));
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <AuthLayout title={t('auth.email_sent')} subtitle="">
        <div className="flex flex-col items-center text-center gap-4 py-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/40">
            <CheckCircle className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {t('auth.forgot_email_subtitle', { email })}
          </p>
          <Link href="/connexion">
            <GradientButton variant="primary" size="md" iconComponent={ArrowLeft}>
              {t('auth.back_to_login')}
            </GradientButton>
          </Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title={t('auth.forgot_password')} subtitle={t('auth.forgot_password_subtitle')}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">{t('auth.email')}</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="vous@exemple.com"
              className="w-full rounded-xl border border-slate-300 dark:border-slate-600 py-2.5 pl-10 pr-4 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              autoComplete="email"
            />
          </div>
        </div>

        <GradientButton type="submit" variant="primary" size="lg" fullWidth loading={loading}>
          {t('auth.send_link')}
        </GradientButton>
      </form>

      <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-6">
        <Link href="/connexion" className="text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 font-medium inline-flex items-center gap-1">
          <ArrowLeft className="h-4 w-4" /> {t('auth.back_to_login')}
        </Link>
      </p>
    </AuthLayout>
  );
}
