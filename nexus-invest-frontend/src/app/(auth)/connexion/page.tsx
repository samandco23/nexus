'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';
import { toast } from 'sonner';
import AuthLayout from '@/components/layout/auth-layout';
import GradientButton from '@/components/ui/gradient-button';
import ReCaptcha from '@/components/ui/recaptcha';
import apiClient, { fetchCsrfCookie } from '@/lib/api-client';
import { API_URLS } from '@/lib/constants';
import { useI18nStore } from '@/stores/i18n-store';
import { loginSchema, type LoginForm } from '@/lib/schemas/auth';
import { useAuth } from '@/contexts/auth-context';

function LoginFormContent() {
  const { t } = useI18nStore();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.replace('/dashboard');
    }
  }, [isAuthenticated, authLoading, router]);

  const [form, setForm] = useState<LoginForm>({ email: '', password: '' });
  const [errors, setErrors] = useState<Partial<Record<keyof LoginForm, string>>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [captchaError, setCaptchaError] = useState(false);
  const [captchaKey, setCaptchaKey] = useState(0);

  const handleChange = (field: keyof LoginForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = loginSchema.safeParse(form);
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof LoginForm, string>> = {};
      result.error.issues.forEach((err) => {
        const field = err.path[0] as keyof LoginForm;
        if (!fieldErrors[field]) fieldErrors[field] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }
    if (!captchaToken) {
      setCaptchaError(true);
      toast.error('Veuillez cocher le CAPTCHA');
      return;
    }
    setCaptchaError(false);
    setErrors({});
    setLoading(true);
    try {
      await fetchCsrfCookie();
      const response = await apiClient.post(API_URLS.auth.login, { ...form, captcha_token: captchaToken });
      const { user, token } = response.data.data;
      sessionStorage.setItem('access_token', token);
      sessionStorage.setItem('user', JSON.stringify({ id: user.id, first_name: user.first_name, last_name: user.last_name, email: user.email }));
      toast.success(t('auth.login_success'));
      const ALLOWED_REDIRECTS = ['/dashboard', '/admin', '/portefeuille', '/investir', '/minage', '/parrainage', '/chat'];
      const redirectParam = searchParams.get('redirect') || '/dashboard';
      const redirect = ALLOWED_REDIRECTS.includes(redirectParam) ? redirectParam : '/dashboard';
      router.push(redirect);
    } catch (err: unknown) {
      setCaptchaKey((k) => k + 1);
      setCaptchaToken(null);
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosErr = err as { response: { status: number; data?: { message?: string; data?: { user?: unknown } } } };
        if (axiosErr.response?.status === 403) {
          const userData = axiosErr.response.data?.data?.user;
          if (userData) {
            sessionStorage.setItem('user', JSON.stringify(userData));
          }
          sessionStorage.setItem('pending_verification', 'true');
          router.push('/verification-email');
          return;
        }
        toast.error(axiosErr.response?.data?.message || t('auth.invalid_credentials'));
      } else {
        toast.error(t('common.error'));
      }
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <p className="text-sm text-slate-500">{t('common.loading')}</p>
      </div>
    );
  }

  if (isAuthenticated) return null;

  return (
    <AuthLayout title={t('auth.login')} subtitle={t('auth.login_title')}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
            {t('auth.email')}
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              id="email"
              type="email"
              value={form.email}
              onChange={(e) => handleChange('email', e.target.value)}
              placeholder="vous@exemple.com"
              className={`w-full rounded-xl border py-2.5 pl-10 pr-4 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 ${
                errors.email ? 'border-red-500' : 'border-slate-300 dark:border-slate-600'
              }`}
              autoComplete="email"
            />
          </div>
          {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
            {t('auth.password')}
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={form.password}
              onChange={(e) => handleChange('password', e.target.value)}
              placeholder="Votre mot de passe"
              className={`w-full rounded-xl border py-2.5 pl-10 pr-10 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 ${
                errors.password ? 'border-red-500' : 'border-slate-300 dark:border-slate-600'
              }`}
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
        </div>

        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center gap-2 text-slate-600 dark:text-slate-400 cursor-pointer">
            <input type="checkbox" className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500" />
            {t('auth.remember_me')}
          </label>
          <Link href="/mot-de-passe-oublie" className="text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 font-medium">
            {t('auth.forgot_password')}
          </Link>
        </div>

        <div className={captchaError ? 'ring-2 ring-red-500 rounded-lg p-1' : ''}>
          <ReCaptcha
            key={captchaKey}
            sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY!}
            onChange={(token) => { setCaptchaToken(token); setCaptchaError(false); }}
          />
        </div>
        {captchaError && <p className="text-xs text-red-500 text-center -mt-2">Veuillez valider le CAPTCHA</p>}

        <GradientButton type="submit" variant="primary" size="lg" fullWidth loading={loading}>
          {t('auth.login_btn')}
        </GradientButton>
      </form>

      <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-6">
        {t('auth.no_account')}{' '}
        <Link href="/inscription" className="text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 font-medium">
          {t('auth.register_btn')}
        </Link>
      </p>
    </AuthLayout>
  );
}

export default function LoginPage() {
  const { t } = useI18nStore();
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><p className="text-sm text-slate-500">{t('common.loading')}</p></div>}>
      <LoginFormContent />
    </Suspense>
  );
}
