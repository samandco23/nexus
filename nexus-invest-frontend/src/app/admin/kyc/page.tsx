'use client';

import { useState, useEffect } from 'react';
import {
  Shield, CheckCircle, XCircle, Clock, Search,
  ExternalLink,
} from 'lucide-react';
import GlassCard from '@/components/ui/glass-card';
import GradientButton from '@/components/ui/gradient-button';
import LoadingSpinner from '@/components/shared/loading-spinner';
import { toast } from 'sonner';
import apiClient from '@/lib/api-client';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

interface KycDoc {
  id: number;
  type: string;
  status: string;
  file_path: string;
  admin_notes: string | null;
  created_at: string;
  reviewed_at: string | null;
  user: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    kyc_level: number;
  };
}

const docTypeLabels: Record<string, string> = {
  identity_card: "Carte d'identité",
  passport: 'Passeport',
  proof_of_address: 'Justificatif de domicile',
  selfie: 'Selfie',
};

const statusConfig: Record<string, { color: string; icon: typeof Clock; label: string }> = {
  pending: { color: 'text-amber-600 bg-amber-50 dark:bg-amber-900/20', icon: Clock, label: 'En attente' },
  approved: { color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20', icon: CheckCircle, label: 'Approuvé' },
  rejected: { color: 'text-red-600 bg-red-50 dark:bg-red-900/20', icon: XCircle, label: 'Refusé' },
};

export default function AdminKycPage() {
  const [documents, setDocuments] = useState<KycDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');
  const [rejecting, setRejecting] = useState<number | null>(null);
  const [rejectNote, setRejectNote] = useState('');

  useEffect(() => {
    fetchDocuments();
  }, [filter]);

  async function fetchDocuments() {
    setLoading(true);
    try {
      const res = await apiClient.get(`/admin/kyc?status=${filter}`);
      setDocuments(res.data.data?.data ?? []);
    } catch {
      toast.error('Erreur de chargement');
    } finally {
      setLoading(false);
    }
  }

  async function approve(id: number) {
    try {
      await apiClient.post(`/admin/kyc/${id}/approve`);
      toast.success('Document approuvé');
      fetchDocuments();
    } catch {
      toast.error("Erreur lors de l'approbation");
    }
  }

  async function reject(id: number) {
    if (!rejectNote.trim()) {
      toast.error('Veuillez entrer un motif de refus');
      return;
    }
    try {
      await apiClient.post(`/admin/kyc/${id}/reject`, { admin_notes: rejectNote });
      toast.success('Document refusé');
      setRejecting(null);
      setRejectNote('');
      fetchDocuments();
    } catch {
      toast.error('Erreur lors du refus');
    }
  }

  const filters = ['pending', 'approved', 'rejected'];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Vérifications KYC
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Gérez les demandes de vérification d&apos;identité
          </p>
        </div>
      </div>

      <div className="flex gap-2 mb-6">
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              filter === f
                ? 'bg-emerald-500 text-white shadow-md'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
            }`}
          >
            {f === 'pending' ? 'En attente' : f === 'approved' ? 'Approuvés' : 'Refusés'}
          </button>
        ))}
      </div>

      {loading ? (
        <LoadingSpinner centered size="lg" />
      ) : documents.length === 0 ? (
        <GlassCard variant="default" padding="lg">
          <div className="flex flex-col items-center py-10 text-slate-400">
            <Shield className="h-12 w-12 mb-3" />
            <p className="text-sm font-medium">Aucun document {filter === 'pending' ? 'en attente' : filter}</p>
          </div>
        </GlassCard>
      ) : (
        <div className="flex flex-col gap-4">
          {documents.map((doc) => {
            const StatusIcon = statusConfig[doc.status].icon;
            return (
              <GlassCard key={doc.id} variant="default" padding="md">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${statusConfig[doc.status].color}`}>
                        <StatusIcon className="h-3 w-3" />
                        {statusConfig[doc.status].label}
                      </span>
                      <span className="text-xs font-medium text-slate-400">
                        {docTypeLabels[doc.type] || doc.type}
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">
                      {doc.user.first_name} {doc.user.last_name}
                    </p>
                    <p className="text-xs text-slate-500">{doc.user.email}</p>
                    <p className="text-xs text-slate-400 mt-1">
                      KYC Niveau {doc.user.kyc_level} — reçu {formatDistanceToNow(new Date(doc.created_at), { addSuffix: true, locale: fr })}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {doc.status === 'pending' && (
                      <>
                        <GradientButton
                          variant="primary"
                          size="sm"
                          iconComponent={CheckCircle}
                          onClick={() => approve(doc.id)}
                        >
                          Approuver
                        </GradientButton>
                        <GradientButton
                          variant="danger"
                          size="sm"
                          iconComponent={XCircle}
                          onClick={() => setRejecting(rejecting === doc.id ? null : doc.id)}
                        >
                          Refuser
                        </GradientButton>
                      </>
                    )}
                  </div>
                </div>

                {rejecting === doc.id && (
                  <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700 flex gap-2">
                    <input
                      type="text"
                      value={rejectNote}
                      onChange={(e) => setRejectNote(e.target.value)}
                      placeholder="Motif du refus..."
                      className="flex-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                    <GradientButton
                      variant="danger"
                      size="sm"
                      onClick={() => reject(doc.id)}
                    >
                      Confirmer
                    </GradientButton>
                    <GradientButton
                      variant="ghost"
                      size="sm"
                      onClick={() => { setRejecting(null); setRejectNote(''); }}
                    >
                      Annuler
                    </GradientButton>
                  </div>
                )}

                {doc.admin_notes && doc.status === 'rejected' && (
                  <p className="text-xs text-red-500 mt-2">
                    Motif : {doc.admin_notes}
                  </p>
                )}
              </GlassCard>
            );
          })}
        </div>
      )}
    </div>
  );
}
