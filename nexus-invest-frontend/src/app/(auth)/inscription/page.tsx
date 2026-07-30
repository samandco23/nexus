'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';
import AuthLayout from '@/components/layout/auth-layout';
import GradientButton from '@/components/ui/gradient-button';
import ReCaptcha from '@/components/ui/recaptcha';
import apiClient, { fetchCsrfCookie } from '@/lib/api-client';
import { API_URLS } from '@/lib/constants';
import { useI18nStore } from '@/stores/i18n-store';
import { registerSchema, type RegisterForm } from '@/lib/schemas/auth';
import { useAuth } from '@/contexts/auth-context';

const countries = [
  { code: '+225', name: 'Côte d\'Ivoire' },
  { code: '+221', name: 'Sénégal' },
  { code: '+223', name: 'Mali' },
  { code: '+226', name: 'Burkina Faso' },
  { code: '+229', name: 'Bénin' },
  { code: '+228', name: 'Togo' },
  { code: '+227', name: 'Niger' },
  { code: '+224', name: 'Guinée' },
  { code: '+237', name: 'Cameroun' },
  { code: '+242', name: 'Congo' },
  { code: '+243', name: 'RDC' },
  { code: '+33', name: 'France' },
  { code: '+1', name: 'États-Unis/Canada' },
];

export default function RegisterPage() {
  const { t } = useI18nStore();
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.replace('/dashboard');
    }
  }, [isAuthenticated, authLoading, router]);

  const [form, setForm] = useState<RegisterForm>({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    country: 'Côte d\'Ivoire',
    country_code: '+225',
    password: '',
    confirm_password: '',
    referral_code: '',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof RegisterForm, string>>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [captchaError, setCaptchaError] = useState(false);
  const [captchaKey, setCaptchaKey] = useState(0);

  const handleChange = (field: keyof RegisterForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = registerSchema.safeParse(form);
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof RegisterForm, string>> = {};
      result.error.issues.forEach((err) => {
        const field = err.path[0] as keyof RegisterForm;
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
      const response = await apiClient.post(API_URLS.auth.register, {
        first_name: form.first_name,
        last_name: form.last_name,
        email: form.email,
        phone: form.phone,
        country: form.country,
        country_code: form.country_code,
        password: form.password,
        password_confirmation: form.confirm_password,
        referral_code: form.referral_code || undefined,
        captcha_token: captchaToken,
      });
      const { user, token } = response.data.data;
      sessionStorage.setItem('access_token', token);
      sessionStorage.setItem('user', JSON.stringify({ id: user.id, first_name: user.first_name, last_name: user.last_name, email: user.email }));
      toast.success(t('auth.register_success'));
      router.push('/verification-email');
    } catch (err: unknown) {
      setCaptchaKey((k) => k + 1);
      setCaptchaToken(null);
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosErr = err as { response?: { data?: { message?: string } } };
        toast.error(axiosErr.response?.data?.message || t('auth.register_error'));
      } else {
        toast.error(t('common.error'));
      }
    } finally {
      setLoading(false);
    }
  };

  const inputClass = (field: keyof RegisterForm) =>
    `w-full rounded-xl border py-2.5 px-4 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 ${
      errors[field] ? 'border-red-500' : 'border-slate-300 dark:border-slate-600'
    }`;

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 py-8">
        <p className="text-sm text-slate-500">{t('common.loading')}</p>
      </div>
    );
  }

  if (isAuthenticated) return null;

  return (
    <AuthLayout title={t('auth.register')} subtitle={t('app.tagline')}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="first_name" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">{t('common.first_name')}</label>
            <input id="first_name" type="text" value={form.first_name} onChange={(e) => handleChange('first_name', e.target.value)} placeholder="Jean" className={inputClass('first_name')} />
            {errors.first_name && <p className="text-xs text-red-500 mt-1">{errors.first_name}</p>}
          </div>
          <div>
            <label htmlFor="last_name" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">{t('common.last_name')}</label>
            <input id="last_name" type="text" value={form.last_name} onChange={(e) => handleChange('last_name', e.target.value)} placeholder="Kouamé" className={inputClass('last_name')} />
            {errors.last_name && <p className="text-xs text-red-500 mt-1">{errors.last_name}</p>}
          </div>
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">{t('auth.email')}</label>
          <input id="email" type="email" value={form.email} onChange={(e) => handleChange('email', e.target.value)} placeholder="vous@exemple.com" className={inputClass('email')} autoComplete="email" />
          {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
        </div>

        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">{t('common.phone')}</label>
          <div className="flex gap-2">
            <div className="relative w-28">
              <select
                value={form.country_code}
                onChange={(e) => handleChange('country_code', e.target.value)}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-600 py-2.5 pl-3 pr-8 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 appearance-none"
              >
                {countries.map((c) => (
                  <option key={c.code} value={c.code}>{c.code}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
            </div>
            <input id="phone" type="tel" value={form.phone} onChange={(e) => handleChange('phone', e.target.value)} placeholder="01 02 03 04 05" className={`flex-1 ${inputClass('phone')}`} autoComplete="tel" />
          </div>
          {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
        </div>

        <div>
          <label htmlFor="country" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">{t('common.country')}</label>
          <div className="relative">
            <select id="country" value={form.country} onChange={(e) => handleChange('country', e.target.value)} className={`${inputClass('country')} appearance-none pr-8`}>
              {countries.map((c) => (
                <option key={c.name} value={c.name}>{c.name}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
          </div>
          {errors.country && <p className="text-xs text-red-500 mt-1">{errors.country}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">{t('auth.password')}</label>
            <div className="relative">
              <input id="password" type={showPassword ? 'text' : 'password'} value={form.password} onChange={(e) => handleChange('password', e.target.value)} placeholder="********" className={`w-full ${inputClass('password')} pr-10`} autoComplete="new-password" />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600" aria-label={showPassword ? 'Masquer' : 'Afficher'}>
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
          </div>
          <div>
            <label htmlFor="confirm_password" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">{t('auth.confirm_password')}</label>
            <div className="relative">
              <input id="confirm_password" type={showConfirm ? 'text' : 'password'} value={form.confirm_password} onChange={(e) => handleChange('confirm_password', e.target.value)} placeholder="********" className={`w-full ${inputClass('confirm_password')} pr-10`} autoComplete="new-password" />
              <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600" aria-label={showConfirm ? 'Masquer' : 'Afficher'}>
                {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.confirm_password && <p className="text-xs text-red-500 mt-1">{errors.confirm_password}</p>}
          </div>
        </div>

        <div>
          <label htmlFor="referral_code" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">{t('referral.code')}</label>
          <input id="referral_code" type="text" value={form.referral_code || ''} onChange={(e) => handleChange('referral_code', e.target.value)} placeholder="Ex: NEXUS123" className={inputClass('referral_code')} />
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
          {t('auth.register_btn')}
        </GradientButton>
      </form>

      <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-6">
        {t('auth.has_account')}{' '}
        <Link href="/connexion" className="text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 font-medium">
          {t('auth.login_btn')}
        </Link>
      </p>
    </AuthLayout>
  );
}
