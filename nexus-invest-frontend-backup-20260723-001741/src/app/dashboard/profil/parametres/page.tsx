'use client';

import { useState } from 'react';
import { Eye, EyeOff, Bell, Globe, Moon, Sun, Save, ChevronDown, Wallet } from 'lucide-react';
import { toast } from 'sonner';
import GlassCard from '@/components/ui/glass-card';
import GradientButton from '@/components/ui/gradient-button';
import { useUIStore } from '@/stores/ui-store';
import { useI18nStore } from '@/stores/i18n-store';
import { CURRENCIES, formatCurrency } from '@/lib/i18n';
import type { Locale, CurrencyCode } from '@/lib/i18n';
import apiClient from '@/lib/api-client';
import { API_URLS } from '@/lib/constants';

const LANGUAGES: { code: Locale; label: string; flag: string }[] = [
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'es', label: 'Español', flag: '🇪🇸' },
];

export default function SettingsPage() {
  const { theme, toggleTheme } = useUIStore();
  const { locale, setLocale, currency, setCurrency, t } = useI18nStore();
  const [langOpen, setLangOpen] = useState(false);
  const [currencyOpen, setCurrencyOpen] = useState(false);

  const [passwordForm, setPasswordForm] = useState({
    current: '',
    new: '',
    confirm: '',
  });
  const [showFields, setShowFields] = useState({ current: false, new: false, confirm: false });
  const [notifications, setNotifications] = useState({
    email: true,
    sms: false,
    push: true,
  });
  const [savingPassword, setSavingPassword] = useState(false);
  const [savingNotifs, setSavingNotifs] = useState(false);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.new !== passwordForm.confirm) {
      toast.error('Les mots de passe ne correspondent pas');
      return;
    }
    if (passwordForm.new.length < 8) {
      toast.error('Le mot de passe doit contenir au moins 8 caractères');
      return;
    }
    setSavingPassword(true);
    try {
      await apiClient.put(API_URLS.auth.password, {
        current_password: passwordForm.current,
        password: passwordForm.new,
        password_confirmation: passwordForm.confirm,
      });
      toast.success('Mot de passe modifié avec succès !');
      setPasswordForm({ current: '', new: '', confirm: '' });
    } catch {
      toast.error('Erreur lors de la modification');
    } finally {
      setSavingPassword(false);
    }
  };

  const handleSaveNotifications = async () => {
    setSavingNotifs(true);
    try {
      await new Promise((r) => setTimeout(r, 300));
      toast.success('Préférences mises à jour');
    } catch {
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setSavingNotifs(false);
    }
  };

  const toggleField = (field: keyof typeof showFields) => {
    setShowFields((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const pwInputClass = (field: keyof typeof showFields) =>
    `w-full rounded-xl border border-slate-300 dark:border-slate-600 py-2.5 pl-4 pr-10 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50`;

  return (
    <div className="flex flex-col gap-6 max-w-2xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Paramètres</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Gérez vos préférences et votre sécurité
        </p>
      </div>

      <GlassCard variant="default" padding="md">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Changer le mot de passe</h3>
        <form onSubmit={handlePasswordChange} className="flex flex-col gap-4">
          {(['current', 'new', 'confirm'] as const).map((field) => (
            <div key={field}>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                {field === 'current' ? 'Mot de passe actuel' : field === 'new' ? 'Nouveau mot de passe' : 'Confirmer le mot de passe'}
              </label>
              <div className="relative">
                <input
                  type={showFields[field] ? 'text' : 'password'}
                  value={passwordForm[field]}
                  onChange={(e) => setPasswordForm((f) => ({ ...f, [field]: e.target.value }))}
                  placeholder="********"
                  className={pwInputClass(field)}
                  autoComplete={field === 'current' ? 'current-password' : 'new-password'}
                />
                <button
                  type="button"
                  onClick={() => toggleField(field)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  aria-label={showFields[field] ? 'Masquer' : 'Afficher'}
                >
                  {showFields[field] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
          ))}
          <GradientButton type="submit" variant="primary" size="md" iconComponent={Save} loading={savingPassword}>
            Modifier le mot de passe
          </GradientButton>
        </form>
      </GlassCard>

      <GlassCard variant="default" padding="md">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
          <Bell className="h-5 w-5 inline mr-2" />
          Préférences de notification
        </h3>
        <div className="flex flex-col gap-3 mb-4">
          {([
            { key: 'email' as const, label: 'Notifications par email' },
            { key: 'sms' as const, label: 'Notifications par SMS' },
            { key: 'push' as const, label: 'Notifications push' },
          ]).map(({ key, label }) => (
            <label key={key} className="flex items-center justify-between rounded-xl border border-slate-200 dark:border-slate-700 p-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
              <span className="text-sm font-medium text-slate-900 dark:text-white">{label}</span>
              <div
                className={`relative w-11 h-6 rounded-full transition-colors ${
                  notifications[key] ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'
                }`}
                onClick={() => setNotifications((prev) => ({ ...prev, [key]: !prev[key] }))}
              >
                <div
                  className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                    notifications[key] ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </div>
            </label>
          ))}
        </div>
        <GradientButton variant="primary" size="md" iconComponent={Save} onClick={handleSaveNotifications} loading={savingNotifs}>
          Enregistrer les préférences
        </GradientButton>
      </GlassCard>

      <GlassCard variant="default" padding="md">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
          <Globe className="h-5 w-5 inline mr-2" />
          {t('settings.language')}
        </h3>
        <div className="relative">
          <button
            onClick={() => setLangOpen(!langOpen)}
            className="flex items-center justify-between w-full rounded-xl border border-slate-200 dark:border-slate-700 p-3 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <span className="text-lg">{LANGUAGES.find((l) => l.code === locale)?.flag}</span>
              <span className="text-sm font-medium text-slate-900 dark:text-white">
                {LANGUAGES.find((l) => l.code === locale)?.label}
              </span>
            </div>
            <ChevronDown className="h-4 w-4 text-slate-400" />
          </button>
          {langOpen && (
            <div className="absolute top-full left-0 right-0 mt-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-xl z-10 overflow-hidden">
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => { setLocale(lang.code); setLangOpen(false); }}
                  className={`flex items-center gap-3 w-full px-3 py-2.5 text-sm transition-colors hover:bg-slate-50 dark:hover:bg-slate-700/50 ${
                    locale === lang.code
                      ? 'text-emerald-600 dark:text-emerald-400 font-medium'
                      : 'text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <span className="text-lg">{lang.flag}</span>
                  {lang.label}
                  {locale === lang.code && <span className="ml-auto text-xs">✓</span>}
                </button>
              ))}
            </div>
          )}
        </div>
      </GlassCard>

      <GlassCard variant="default" padding="md">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
          <Wallet className="h-5 w-5 inline mr-2" />
          {t('settings.currency')}
        </h3>
        <div className="relative">
          <button
            onClick={() => setCurrencyOpen(!currencyOpen)}
            className="flex items-center justify-between w-full rounded-xl border border-slate-200 dark:border-slate-700 p-3 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-slate-900 dark:text-white">
                {CURRENCIES.find((c) => c.code === currency)?.symbol} {currency}
              </span>
              <span className="text-xs text-slate-500">
                {CURRENCIES.find((c) => c.code === currency)?.labelKey
                  ? t(CURRENCIES.find((c) => c.code === currency)!.labelKey)
                  : currency}
              </span>
            </div>
            <ChevronDown className="h-4 w-4 text-slate-400" />
          </button>
          {currencyOpen && (
            <div className="absolute top-full left-0 right-0 mt-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-xl z-10 overflow-hidden">
              {CURRENCIES.map((curr) => (
                <button
                  key={curr.code}
                  onClick={() => { setCurrency(curr.code); setCurrencyOpen(false); }}
                  className={`flex items-center justify-between w-full px-3 py-2.5 text-sm transition-colors hover:bg-slate-50 dark:hover:bg-slate-700/50 ${
                    currency === curr.code
                      ? 'text-emerald-600 dark:text-emerald-400 font-medium'
                      : 'text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{curr.symbol}</span>
                    <span>{curr.code}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400">
                      {formatCurrency(100000, curr.code)}
                    </span>
                    {currency === curr.code && <span className="text-xs">✓</span>}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </GlassCard>

      <GlassCard variant="default" padding="md">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
          {theme === 'light' ? <Sun className="h-5 w-5 inline mr-2" /> : <Moon className="h-5 w-5 inline mr-2" />}
          Thème
        </h3>
        <div className="flex items-center justify-between rounded-xl border border-slate-200 dark:border-slate-700 p-3">
          <span className="text-sm font-medium text-slate-900 dark:text-white">Thème de l&rsquo;interface</span>
          <GradientButton
            variant="secondary"
            size="sm"
            iconComponent={theme === 'light' ? Moon : Sun}
            onClick={toggleTheme}
          >
            {theme === 'light' ? 'Mode sombre' : 'Mode clair'}
          </GradientButton>
        </div>
      </GlassCard>
    </div>
  );
}
