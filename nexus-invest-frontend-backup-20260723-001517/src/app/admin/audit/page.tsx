'use client';

import { useState, useEffect } from 'react';
import { ScrollText, RefreshCw, AlertCircle } from 'lucide-react';
import apiClient from '@/lib/api-client';
import { API_URLS } from '@/lib/constants';

interface LogEntry {
  raw: string;
  parsed: {
    timestamp: string | null;
    channel: string | null;
    level: string | null;
    message: string | null;
  };
}

export default function AdminAuditPage() {
  const [entries, setEntries] = useState<LogEntry[]>([]);
  const [date, setDate] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchLogs = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await apiClient.get('/admin/audit-logs');
      setEntries(res.data.data.lines ?? []);
      setDate(res.data.data.date ?? '');
    } catch {
      setError('Erreur lors du chargement des logs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const levelColor = (level: string | null) => {
    switch (level) {
      case 'ERROR': return 'text-red-600 dark:text-red-400';
      case 'WARNING': return 'text-amber-600 dark:text-amber-400';
      case 'INFO': return 'text-emerald-600 dark:text-emerald-400';
      default: return 'text-slate-500 dark:text-slate-400';
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-900/40">
            <ScrollText className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">Journal d&apos;audit</h1>
            {date && <p className="text-xs text-slate-500 dark:text-slate-400">Logs du {date}</p>}
          </div>
        </div>
        <button
          onClick={fetchLogs}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-600 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Actualiser
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4 mb-6 text-sm text-red-700 dark:text-red-400">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-200 border-t-emerald-600" />
        </div>
      ) : entries.length === 0 ? (
        <div className="rounded-2xl bg-white/70 dark:bg-slate-900/70 border border-white/20 dark:border-slate-700/30 backdrop-blur-xl p-8 text-center">
          <p className="text-sm text-slate-500 dark:text-slate-400">Aucune entrée d&apos;audit pour aujourd&apos;hui.</p>
        </div>
      ) : (
        <div className="rounded-2xl bg-white/70 dark:bg-slate-900/70 border border-white/20 dark:border-slate-700/30 backdrop-blur-xl shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                  <th className="text-left px-4 py-3 font-semibold text-slate-600 dark:text-slate-400">Horodatage</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600 dark:text-slate-400">Niveau</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600 dark:text-slate-400">Message</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {entries.map((entry, i) => (
                  <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="px-4 py-2.5 text-xs font-mono text-slate-500 dark:text-slate-400 whitespace-nowrap">
                      {entry.parsed.timestamp ?? '—'}
                    </td>
                    <td className="px-4 py-2.5">
                      <span className={`text-xs font-semibold uppercase ${levelColor(entry.parsed.level)}`}>
                        {entry.parsed.level ?? '—'}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-xs font-mono text-slate-700 dark:text-slate-300 break-all">
                      {entry.parsed.message ?? entry.raw}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
