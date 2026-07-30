'use client';

import { useState, useEffect } from 'react';
import { User, Mail, Phone, MapPin, Shield, CheckCircle, XCircle, Save, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useI18nStore } from '@/stores/i18n-store';
import { toast } from 'sonner';
import { z } from 'zod';
import GlassCard from '@/components/ui/glass-card';
import GradientButton from '@/components/ui/gradient-button';
import LoadingSpinner from '@/components/shared/loading-spinner';
import ErrorState from '@/components/shared/error-state';
import { useUser } from '@/hooks/use-user';
import apiClient from '@/lib/api-client';
import { API_URLS } from '@/lib/constants';

const getProfileSchema = (t: (key: string) => string) => z.object({
  first_name: z.string().min(2, t('Prénom trop court')),
  last_name: z.string().min(2, t('Nom trop court')),
  phone: z.string().min(8, t('Téléphone invalide')),
});

const countries = [
  'Côte d\'Ivoire', 'Sénégal', 'Mali', 'Burkina Faso', 'Bénin', 'Togo', 'Niger',
  'Guinée', 'Cameroun', 'Congo', 'RDC', 'France', 'Belgique',
];

export default function ProfilePage() {
  const { t } = useI18nStore();
  const { user, loading, error, updateUser } = useUser();
  const [form, setForm] = useState({ first_name: '', last_name: '', email: '', phone: '', country: '' });
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setForm({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
        phone: user.phone || '',
        country: user.country || '',
      });
    }
  }, [user]);

  const handleSave = async () => {
    const result = getProfileSchema(t).safeParse(form);
    if (!result.success) { toast.error(t('profile.invalid_data')); return; }
    setSaving(true);
    try {
      await updateUser(form);
      toast.success(t('profile.updated'));
      setIsEditing(false);
    } catch {
      toast.error(t('profile.update_error'));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingSpinner centered size="lg" label={t('common.loading')} />;
  }

  if (error) {
    return <ErrorState message={error} />;
  }

  const kycLevel = user?.kyc_level || 0;
  const kycLabels = [t('profile.not_verified'), t('profile.level', { n: 1 }), t('profile.level', { n: 2 }), t('profile.level', { n: 3 })];
  const kycColors = ['text-red-600', 'text-amber-600', 'text-blue-600', 'text-emerald-600'];

  const inputClass = (disabled = false) =>
    `w-full rounded-xl border border-slate-300 dark:border-slate-600 py-2.5 px-4 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 ${
      disabled ? 'opacity-60 cursor-not-allowed' : ''
    }`;

  return (
    <div className="flex flex-col gap-6 max-w-2xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{t('profile.title')}</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {t('profile.subtitle')}
        </p>
      </div>

      <GlassCard variant="default" padding="md">
        <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-200 dark:border-slate-700">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500 text-white text-2xl font-bold">
            {user ? `${user.first_name.charAt(0)}${user.last_name.charAt(0)}`.toUpperCase() : 'U'}
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              {user ? `${user.first_name} ${user.last_name}` : t('profile.user_fallback')}
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">{user?.email}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              <User className="h-4 w-4 inline mr-1" /> {t('common.first_name')}
            </label>
            <input
              type="text"
              value={form.first_name}
              onChange={(e) => setForm((f) => ({ ...f, first_name: e.target.value }))}
              disabled={!isEditing}
              className={inputClass(!isEditing)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              <User className="h-4 w-4 inline mr-1" /> {t('common.last_name')}
            </label>
            <input
              type="text"
              value={form.last_name}
              onChange={(e) => setForm((f) => ({ ...f, last_name: e.target.value }))}
              disabled={!isEditing}
              className={inputClass(!isEditing)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              <Mail className="h-4 w-4 inline mr-1" /> {t('auth.email')}
            </label>
            <input type="email" value={form.email} disabled className={inputClass(true)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              <Phone className="h-4 w-4 inline mr-1" /> {t('common.phone')}
            </label>
            <div className="flex gap-2">
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                disabled={!isEditing}
                className={`flex-1 ${inputClass(!isEditing)}`}
              />
              {!isEditing && (
                user?.phone_verified_at ? (
                  <span className="inline-flex items-center gap-1 shrink-0 rounded-xl border border-emerald-200 dark:border-emerald-800 px-3 py-2.5 text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20">
                    <CheckCircle className="h-3.5 w-3.5" />
                    Vérifié
                  </span>
                ) : (
                  <PhoneVerifyButton phone={form.phone} onVerified={() => window.location.reload()} />
                )
              )}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              <MapPin className="h-4 w-4 inline mr-1" /> {t('common.country')}
            </label>
            <select
              value={form.country}
              onChange={(e) => setForm((f) => ({ ...f, country: e.target.value }))}
              disabled={!isEditing}
              className={inputClass(!isEditing)}
            >
              {countries.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              <Shield className="h-4 w-4 inline mr-1" /> {t('profile.kyc')}
            </label>
            <Link
              href="/dashboard/kyc"
              className="flex items-center justify-between rounded-xl border border-slate-300 dark:border-slate-600 py-2.5 px-4 text-sm bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors group"
            >
              <div className="flex items-center gap-2">
                <span className={`font-bold ${kycColors[kycLevel]}`}>{kycLabels[kycLevel]}</span>
                {kycLevel >= 2 ? (
                  <CheckCircle className={`h-4 w-4 ${kycColors[kycLevel]}`} />
                ) : (
                  <XCircle className={`h-4 w-4 ${kycColors[kycLevel]}`} />
                )}
              </div>
              <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors" />
            </Link>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
          {isEditing ? (
            <>
              <GradientButton variant="ghost" size="md" onClick={() => setIsEditing(false)}>
                {t('common.cancel')}
              </GradientButton>
              <GradientButton variant="primary" size="md" iconComponent={Save} onClick={handleSave} loading={saving}>
                {t('profile.save')}
              </GradientButton>
            </>
          ) : (
            <GradientButton variant="primary" size="md" onClick={() => setIsEditing(true)}>
              {t('profile.edit')}
            </GradientButton>
          )}
        </div>
      </GlassCard>

      <GlassCard variant="default" padding="md">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">{t('profile.account_status')}</h3>
        <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-700/50">
          <span className="text-sm text-slate-600 dark:text-slate-400">{t('profile.active')}</span>
          {user?.status === 'active' ? (
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 rounded-full px-2.5 py-1">
              <CheckCircle className="h-3 w-3" /> {t('profile.status_active')}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-600 bg-red-50 dark:bg-red-900/20 rounded-full px-2.5 py-1">
              <XCircle className="h-3 w-3" /> {t('profile.status_inactive')}
            </span>
          )}
        </div>

      </GlassCard>
    </div>
  );
}

function PhoneVerifyButton({ phone, onVerified }: { phone: string; onVerified: () => void }) {
  const [step, setStep] = useState<'idle' | 'otp_sent' | 'verifying'>('idle');
  const [code, setCode] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  async function sendOtp() {
    if (!phone || phone.length < 8) { setError('Numéro invalide'); return; }
    setSending(true);
    setError('');
    try {
      await apiClient.post(API_URLS.auth.resendPhoneOtp || '/auth/resend-phone-otp');
      setStep('otp_sent');
    } catch {
      setError('Erreur lors de l\'envoi');
    } finally {
      setSending(false);
    }
  }

  async function verifyCode() {
    if (code.length !== 6) { setError('Code à 6 chiffres'); return; }
    setStep('verifying');
    setError('');
    try {
      await apiClient.post(API_URLS.auth.verifyPhone || '/auth/verify-phone', { code });
      onVerified();
    } catch {
      setError('Code invalide ou expiré');
      setStep('otp_sent');
    }
  }

  if (step === 'idle') {
    return (
      <GradientButton variant="primary" size="sm" iconComponent={Shield} onClick={sendOtp} loading={sending}>
        Vérifier
      </GradientButton>
    );
  }

  return (
    <div className="flex items-center gap-1 shrink-0">
      <input
        type="text"
        value={code}
        onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
        placeholder="Code"
        maxLength={6}
        className="w-16 rounded-xl border border-slate-300 dark:border-slate-600 py-2.5 px-2 text-sm text-center font-mono bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
      />
      <GradientButton variant="primary" size="sm" onClick={verifyCode} loading={step === 'verifying'}>
        OK
      </GradientButton>
      {error && <span className="text-[10px] text-red-500 max-w-[80px]">{error}</span>}
    </div>
  );
}
