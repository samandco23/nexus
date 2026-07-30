'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Wallet } from 'lucide-react';
import { toast } from 'sonner';
import { z } from 'zod';
import GlassCard from '@/components/ui/glass-card';
import GradientButton from '@/components/ui/gradient-button';
import apiClient from '@/lib/api-client';
import { API_URLS } from '@/lib/constants';
import { useI18nStore } from '@/stores/i18n-store';

const registerSchema = z
  .object({
    first_name: z.string().min(2, 'Le prénom doit contenir au moins 2 caractères').max(50),
    last_name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères').max(50),
    email: z.string().min(1, "L'email est requis").email('Email invalide'),
    phone: z.string().min(8, 'Le téléphone doit contenir au moins 8 chiffres'),
    country: z.string().min(1, 'Le pays est requis'),
    country_code: z.string().min(1, 'L\'indicatif est requis'),
    password: z
      .string()
      .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Le mot de passe doit contenir une majuscule, une minuscule et un chiffre'),
    confirm_password: z.string().min(1, 'La confirmation est requise'),
    referral_code: z.string().optional(),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: 'Les mots de passe ne correspondent pas',
    path: ['confirm_password'],
  });

type RegisterForm = z.infer<typeof registerSchema>;

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
    setErrors({});
    setLoading(true);
    try {
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
      });
      const { user, token } = response.data.data;
      localStorage.setItem('access_token', token);
      localStorage.setItem('user', JSON.stringify(user));
      toast.success(t('auth.register_success'));
      router.push('/verification-email');
    } catch (err: unknown) {
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-emerald-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 p-4 py-8">
      <div className="w-full max-w-lg">
        <Link href="/" className="flex items-center justify-center gap-2 mb-8">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600">
            <Wallet className="h-5 w-5 text-white" />
          </div>
          <span className="text-2xl font-bold text-slate-900 dark:text-white">{t('app.name')}</span>
        </Link>

        <GlassCard variant="default" padding="lg">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{t('auth.register')}</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              {t('app.tagline')}
            </p>
          </div>

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
                <select
                  value={form.country_code}
                  onChange={(e) => handleChange('country_code', e.target.value)}
                  className="w-28 rounded-xl border border-slate-300 dark:border-slate-600 py-2.5 px-2 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                >
                  {countries.map((c) => (
                    <option key={c.code} value={c.code}>{c.code}</option>
                  ))}
                </select>
                <input id="phone" type="tel" value={form.phone} onChange={(e) => handleChange('phone', e.target.value)} placeholder="01 02 03 04 05" className={`flex-1 ${inputClass('phone')}`} autoComplete="tel" />
              </div>
              {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
            </div>

            <div>
              <label htmlFor="country" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">{t('common.country')}</label>
              <select id="country" value={form.country} onChange={(e) => handleChange('country', e.target.value)} className={inputClass('country')}>
                {countries.map((c) => (
                  <option key={c.name} value={c.name}>{c.name}</option>
                ))}
              </select>
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
        </GlassCard>
      </div>
    </div>
  );
}
