'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Eye, EyeOff, Lock, Wallet } from 'lucide-react';
import { toast } from 'sonner';
import { z } from 'zod';
import GlassCard from '@/components/ui/glass-card';
import GradientButton from '@/components/ui/gradient-button';
import apiClient from '@/lib/api-client';
import { API_URLS } from '@/lib/constants';
import { useI18nStore } from '@/stores/i18n-store';

const resetSchema = z
  .object({
    email: z.string().min(1, "L'email est requis").email('Email invalide'),
    password: z
      .string()
      .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Le mot de passe doit contenir une majuscule, une minuscule et un chiffre'),
    confirm_password: z.string().min(1, 'La confirmation est requise'),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: 'Les mots de passe ne correspondent pas',
    path: ['confirm_password'],
  });

type ResetForm = z.infer<typeof resetSchema>;

function ResetFormContent() {
  const { t } = useI18nStore();
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';
  const emailParam = searchParams.get('email') || '';

  const [form, setForm] = useState<ResetForm>({
    email: emailParam,
    password: '',
    confirm_password: '',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof ResetForm, string>>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (field: keyof ResetForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = resetSchema.safeParse(form);
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof ResetForm, string>> = {};
      result.error.issues.forEach((err) => {
        const field = err.path[0] as keyof ResetForm;
        if (!fieldErrors[field]) fieldErrors[field] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }
    if (!token) {
      toast.error(t('auth.reset_token_missing'));
      return;
    }
    setErrors({});
    setLoading(true);
    try {
      await apiClient.post(API_URLS.auth.resetPassword, {
        token,
        email: form.email,
        password: form.password,
        password_confirmation: form.confirm_password,
      });
      toast.success(t('auth.password_reset_success'));
      router.push('/connexion');
    } catch {
      toast.error(t('auth.reset_error'));
    } finally {
      setLoading(false);
    }
  };

  const inputClass = (field: keyof ResetForm) =>
    `w-full rounded-xl border py-2.5 px-4 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 ${
      errors[field] ? 'border-red-500' : 'border-slate-300 dark:border-slate-600'
    }`;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-emerald-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-emerald-500 shadow-lg shadow-emerald-500/30 mb-4">
            <Wallet className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{t('auth.reset_password_title')}</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {t('auth.reset_password_subtitle')}
          </p>
        </div>

        <GlassCard variant="default" padding="lg">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={form.email}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="votre@email.com"
                className={inputClass('email')}
                readOnly={!!emailParam}
              />
              {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Nouveau mot de passe
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  placeholder="••••••••"
                  className={inputClass('password') + ' pr-10'}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
            </div>

            <div>
              <label htmlFor="confirm_password" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Confirmer le mot de passe
              </label>
              <div className="relative">
                <input
                  id="confirm_password"
                  type={showConfirm ? 'text' : 'password'}
                  value={form.confirm_password}
                  onChange={(e) => handleChange('confirm_password', e.target.value)}
                  placeholder="••••••••"
                  className={inputClass('confirm_password') + ' pr-10'}
                />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.confirm_password && <p className="text-xs text-red-500 mt-1">{errors.confirm_password}</p>}
            </div>

            <GradientButton variant="primary" size="lg" fullWidth type="submit" loading={loading}>
              Réinitialiser le mot de passe
            </GradientButton>
          </form>
        </GlassCard>

        <p className="text-center mt-6 text-sm text-slate-500 dark:text-slate-400">
          <Link href="/connexion" className="text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 font-medium">
            Retour à la connexion
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetFormContent />
    </Suspense>
  );
}
