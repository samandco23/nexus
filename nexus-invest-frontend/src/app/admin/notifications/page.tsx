'use client';

import { useState, useEffect } from 'react';
import { Send, Users, Package } from 'lucide-react';
import GlassCard from '@/components/ui/glass-card';
import GradientButton from '@/components/ui/gradient-button';
import LoadingSpinner from '@/components/shared/loading-spinner';
import { toast } from 'sonner';
import apiClient from '@/lib/api-client';
import { API_URLS } from '@/lib/constants';
import type { InvestmentPack } from '@/lib/constants';

export default function AdminNotificationsPage() {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [target, setTarget] = useState<'all' | 'pack'>('all');
  const [packId, setPackId] = useState<number | ''>('');
  const [packs, setPacks] = useState<InvestmentPack[]>([]);
  const [sending, setSending] = useState(false);
  const [packsLoading, setPacksLoading] = useState(true);

  useEffect(() => {
    apiClient.get(API_URLS.investments.packs)
      .then((res) => setPacks(res.data.data ?? []))
      .catch(() => {})
      .finally(() => setPacksLoading(false));
  }, []);

  const handleSend = async () => {
    if (!title.trim() || !body.trim()) {
      toast.error('Veuillez remplir tous les champs.');
      return;
    }
    if (target === 'pack' && !packId) {
      toast.error('Veuillez sélectionner un pack.');
      return;
    }
    setSending(true);
    try {
      const res = await apiClient.post('/admin/notifications/send', {
        title: title.trim(),
        body: body.trim(),
        target,
        pack_id: target === 'pack' ? packId : undefined,
      });
      toast.success(res.data.message || 'Notification envoyée !');
      setTitle('');
      setBody('');
    } catch {
      toast.error('Erreur lors de l\'envoi.');
    } finally {
      setSending(false);
    }
  };

  if (packsLoading) return <LoadingSpinner centered size="lg" />;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Envoyer une notification
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Envoyez une notification à tous les utilisateurs ou à un groupe spécifique.
        </p>
      </div>

      <GlassCard variant="default" padding="lg">
        <div className="flex flex-col gap-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Titre
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Nouveau pack disponible"
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              maxLength={255}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Message
            </label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Contenu de la notification..."
              rows={4}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
              maxLength={5000}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Cible
            </label>
            <div className="flex gap-3">
              <button
                onClick={() => { setTarget('all'); setPackId(''); }}
                className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition-all ${
                  target === 'all'
                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <Users className="h-4 w-4" />
                Tous les utilisateurs
              </button>
              <button
                onClick={() => setTarget('pack')}
                className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition-all ${
                  target === 'pack'
                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <Package className="h-4 w-4" />
                Par pack d&apos;investissement
              </button>
            </div>
          </div>

          {target === 'pack' && (
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Pack d&apos;investissement
              </label>
              <select
                value={packId}
                onChange={(e) => setPackId(e.target.value ? Number(e.target.value) : '')}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">Sélectionner un pack</option>
                {packs.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} — {p.min_amount.toLocaleString('fr-FR')} FCFA
                  </option>
                ))}
              </select>
            </div>
          )}

          <GradientButton
            variant="primary"
            size="lg"
            fullWidth
            iconComponent={Send}
            onClick={handleSend}
            disabled={sending}
          >
            {sending ? 'Envoi en cours...' : 'Envoyer la notification'}
          </GradientButton>
        </div>
      </GlassCard>
    </div>
  );
}
