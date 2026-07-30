'use client';

import { useState, useEffect, useCallback } from 'react';
import { Settings as SettingsIcon, Save } from 'lucide-react';
import GlassCard from '@/components/ui/glass-card';
import GradientButton from '@/components/ui/gradient-button';
import LoadingSpinner from '@/components/shared/loading-spinner';
import apiClient from '@/lib/api-client';
import { toast } from 'sonner';
import { formatFCFA } from '@/lib/currency';

interface Settings {
  token_value_xaf: string;
  mining_base_rate: string;
  min_withdrawal: string;
  referral_bonus_percent: string;
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);

  const fetchSettings = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/admin/settings');
      setSettings(res.data.data);
    } catch {
      toast.error('Erreur chargement paramètres');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchSettings(); }, [fetchSettings]);

  const handleSave = async (key: string, value: string) => {
    setSaving(key);
    try {
      await apiClient.put(`/admin/settings/${key}`, { value });
      toast.success('Paramètre mis à jour');
      setSettings((prev) => prev ? { ...prev, [key]: value } : prev);
    } catch {
      toast.error('Erreur mise à jour');
    } finally {
      setSaving(null);
    }
  };

  if (loading) return <LoadingSpinner centered size="lg" />;

  const fields = [
    { key: 'token_value_xaf' as const, label: 'Valeur 1 NEX (FCFA)', desc: 'Prix de conversion d\'un token Nexus Coin en FCFA', type: 'number', step: '0.01' },
    { key: 'mining_base_rate' as const, label: 'Taux minage / heure', desc: 'Nombre de NEX minés par heure', type: 'number', step: '0.1' },
    { key: 'min_withdrawal' as const, label: 'Retrait minimum (FCFA)', desc: 'Montant minimum pour un retrait', type: 'number', step: '100' },
    { key: 'referral_bonus_percent' as const, label: 'Bonus parrainage (%)', desc: 'Pourcentage de bonus pour les filleuls directs', type: 'number', step: '0.1' },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600">
          <SettingsIcon className="h-5 w-5 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Paramètres</h1>
      </div>

      <GlassCard variant="default" padding="lg">
        <div className="space-y-6">
          {fields.map((field) => (
            <div key={field.key} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-6 border-b border-slate-100 dark:border-slate-700 last:border-0 last:pb-0">
              <div className="flex-1">
                <label className="text-sm font-semibold text-slate-900 dark:text-white">{field.label}</label>
                <p className="text-xs text-slate-500 dark:text-slate-400">{field.desc}</p>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type={field.type}
                  value={settings?.[field.key] ?? ''}
                  step={field.step}
                  onChange={(e) => setSettings((prev) => prev ? { ...prev, [field.key]: e.target.value } : prev)}
                  className="w-32 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 py-2 px-3 text-sm text-slate-900 dark:text-white text-right focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                />
                <GradientButton
                  variant="primary"
                  size="sm"
                  iconComponent={Save}
                  iconPosition="only"
                  onClick={() => handleSave(field.key, settings?.[field.key] ?? '')}
                  loading={saving === field.key}
                >
                  <span className="sr-only">Enregistrer</span>
                </GradientButton>
              </div>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}
