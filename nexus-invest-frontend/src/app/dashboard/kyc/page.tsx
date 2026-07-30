'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Shield, Upload, CheckCircle, XCircle, Clock,
  ArrowLeft, FileText, Camera, MapPin, IdCard,
} from 'lucide-react';
import Link from 'next/link';
import GlassCard from '@/components/ui/glass-card';
import GradientButton from '@/components/ui/gradient-button';
import LoadingSpinner from '@/components/shared/loading-spinner';
import { useI18nStore } from '@/stores/i18n-store';
import { toast } from 'sonner';
import apiClient from '@/lib/api-client';

interface KycDoc {
  id: number;
  type: string;
  status: string;
  admin_notes: string | null;
  created_at: string;
  reviewed_at: string | null;
}

const docTypes = [
  { id: 'identity_card' as const, label: "Carte d'identité", icon: IdCard },
  { id: 'passport' as const, label: 'Passeport', icon: FileText },
  { id: 'proof_of_address' as const, label: 'Justificatif de domicile', icon: MapPin },
  { id: 'selfie' as const, label: 'Selfie', icon: Camera },
];

const statusConfig: Record<string, { color: string; icon: typeof Clock; label: string }> = {
  pending: { color: 'text-amber-600 bg-amber-50 dark:bg-amber-900/20', icon: Clock, label: 'En attente' },
  approved: { color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20', icon: CheckCircle, label: 'Approuvé' },
  rejected: { color: 'text-red-600 bg-red-50 dark:bg-red-900/20', icon: XCircle, label: 'Refusé' },
};

export default function KycPage() {
  const { t } = useI18nStore();
  const [kycLevel, setKycLevel] = useState(0);
  const [documents, setDocuments] = useState<KycDoc[]>([]);
  const [summary, setSummary] = useState({ total: 0, pending: 0, approved: 0, rejected: 0 });
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedType, setSelectedType] = useState<string>('identity_card');
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchStatus();
  }, []);

  async function fetchStatus() {
    try {
      const res = await apiClient.get('/kyc/status');
      const d = res.data.data;
      setKycLevel(d.kyc_level);
      setDocuments(d.documents ?? []);
      setSummary(d.summary ?? { total: 0, pending: 0, approved: 0, rejected: 0 });
    } catch {
      toast.error('Erreur chargement KYC');
    } finally {
      setLoading(false);
    }
  }

  function getDocStatus(type: string): KycDoc | undefined {
    return documents.find((d) => d.type === type);
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('type', selectedType);
    formData.append('file', file);

    try {
      await apiClient.post('/kyc/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('Document envoyé pour vérification.');
      fetchStatus();
      if (fileRef.current) fileRef.current.value = '';
    } catch {
      toast.error("Erreur lors de l'upload.");
    } finally {
      setUploading(false);
    }
  }

  if (loading) return <LoadingSpinner centered size="lg" />;

  const levelLabels = ['Non vérifié', 'Niveau 1', 'Niveau 2', 'Niveau 3'];
  const levelColors = ['text-red-600', 'text-amber-600', 'text-blue-600', 'text-emerald-600'];

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/dashboard/profil"
          className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Vérification KYC
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Vérifiez votre identité pour débloquer toutes les fonctionnalités
          </p>
        </div>
      </div>

      <GlassCard variant="highlight" padding="md" className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="h-8 w-8 text-emerald-500" />
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Niveau KYC actuel</p>
              <p className={`text-xl font-bold ${levelColors[kycLevel]}`}>
                {levelLabels[kycLevel]}
              </p>
            </div>
          </div>
          <div className="flex gap-1">
            {[0, 1, 2, 3].map((l) => (
              <div
                key={l}
                className={`h-2 w-8 rounded-full ${
                  l <= kycLevel ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-700'
                }`}
              />
            ))}
          </div>
        </div>
      </GlassCard>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <GlassCard variant="default" padding="sm">
          <p className="text-xs text-slate-500 dark:text-slate-400">Documents</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">{summary.total}</p>
        </GlassCard>
        <GlassCard variant="default" padding="sm">
          <p className="text-xs text-slate-500 dark:text-slate-400">En attente</p>
          <p className="text-2xl font-bold text-amber-600">{summary.pending}</p>
        </GlassCard>
        <GlassCard variant="default" padding="sm">
          <p className="text-xs text-slate-500 dark:text-slate-400">Approuvés</p>
          <p className="text-2xl font-bold text-emerald-600">{summary.approved}</p>
        </GlassCard>
      </div>

      <div className="flex flex-col gap-3 mb-6">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">
          Documents requis
        </h2>
        {docTypes.map((dt) => {
          const doc = getDocStatus(dt.id);
          const Icon = dt.icon;
          return (
            <GlassCard key={dt.id} variant={doc?.status === 'rejected' ? 'dark' : 'default'} padding="md">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Icon className="h-5 w-5 text-slate-400" />
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">{dt.label}</p>
                    {doc ? (
                      <span className={`inline-flex items-center gap-1 text-xs font-medium mt-0.5 px-2 py-0.5 rounded-full ${statusConfig[doc.status].color}`}>
                        {statusConfig[doc.status].label}
                        {doc.admin_notes && (
                          <span title={doc.admin_notes} className="ml-1 text-slate-400">(i)</span>
                        )}
                      </span>
                    ) : (
                      <span className="text-xs text-slate-400">Non soumis</span>
                    )}
                  </div>
                </div>
                {(!doc || doc.status === 'rejected') && (
                  <div className="flex items-center gap-2">
                    <select
                      value={selectedType}
                      onChange={(e) => setSelectedType(e.target.value)}
                      className="text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2 py-1.5 text-slate-900 dark:text-white"
                    >
                      {docTypes.map((t) => (
                        <option key={t.id} value={t.id}>{t.label}</option>
                      ))}
                    </select>
                    <input
                      ref={fileRef}
                      type="file"
                      accept=".jpg,.jpeg,.png,.pdf"
                      className="hidden"
                      onChange={handleUpload}
                    />
                    <GradientButton
                      variant="primary"
                      size="sm"
                      iconComponent={Upload}
                      onClick={() => {
                        setSelectedType(dt.id);
                        fileRef.current?.click();
                      }}
                      loading={uploading && selectedType === dt.id}
                    >
                      {doc?.status === 'rejected' ? 'Renvoyer' : 'Uploader'}
                    </GradientButton>
                  </div>
                )}
              </div>
              {doc?.admin_notes && doc.status === 'rejected' && (
                <p className="text-xs text-red-600 dark:text-red-400 mt-2 ml-8">
                  Motif : {doc.admin_notes}
                </p>
              )}
            </GlassCard>
          );
        })}
      </div>

      {kycLevel < 3 && (
        <GlassCard variant="default" padding="md">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-2">
            Avantages par niveau
          </h3>
          <ul className="space-y-1.5 text-sm text-slate-600 dark:text-slate-400">
            <li className="flex items-center gap-2">
              <span className={`h-1.5 w-1.5 rounded-full ${kycLevel >= 1 ? 'bg-emerald-500' : 'bg-slate-300'}`} />
              Niveau 1 : Pièce d&apos;identité — Débloque les retraits
            </li>
            <li className="flex items-center gap-2">
              <span className={`h-1.5 w-1.5 rounded-full ${kycLevel >= 2 ? 'bg-emerald-500' : 'bg-slate-300'}`} />
              Niveau 2 : Passeport + Justificatif de domicile — Plafonds augmentés
            </li>
            <li className="flex items-center gap-2">
              <span className={`h-1.5 w-1.5 rounded-full ${kycLevel >= 3 ? 'bg-emerald-500' : 'bg-slate-300'}`} />
              Niveau 3 : Selfie — Accès à tous les packs premium
            </li>
          </ul>
        </GlassCard>
      )}
    </div>
  );
}
