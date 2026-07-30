import type { Metadata } from 'next';
import { SITE_CONFIG } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'Hors ligne',
};

export default function OfflinePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-4">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center">
          <span className="text-white text-4xl font-bold">N</span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">
          Vous êtes hors ligne
        </h1>
        <p className="text-slate-500 mb-6">
          {SITE_CONFIG.name} nécessite une connexion internet pour fonctionner.
          Revenez dès que vous serez reconnecté.
        </p>
        <div className="w-16 h-16 mx-auto">
          <svg className="w-16 h-16 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18.364 5.636a9 9 0 010 12.728m-2.829-2.829a5 5 0 000-7.07m-4.243 4.243a1 1 0 010-1.414" />
          </svg>
        </div>
      </div>
    </div>
  );
}
