'use client';

import { useState, useEffect } from 'react';
import { Bell, CheckCheck, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import GlassCard from '@/components/ui/glass-card';
import GradientButton from '@/components/ui/gradient-button';
import LoadingSpinner from '@/components/shared/loading-spinner';
import EmptyState from '@/components/shared/empty-state';
import { useNotificationStore, type Notification } from '@/stores/notification-store';
import apiClient from '@/lib/api-client';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function NotificationsPage() {
  const { unreadCount, setUnreadCount, decrementUnread } = useNotificationStore();
  const [allNotifs, setAllNotifs] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  useEffect(() => {
    fetchNotifications();
  }, []);

  async function fetchNotifications() {
    setLoading(true);
    try {
      const res = await apiClient.get('/notifications');
      setAllNotifs(res.data.data?.notifications?.data ?? []);
      setUnreadCount(res.data.data?.unread_count ?? 0);
      setHasMore(res.data.data?.notifications?.next_page_url != null);
    } catch {}
    setLoading(false);
  }

  function markAsRead(id: string) {
    apiClient.post(`/notifications/${id}/read`).catch(() => {});
    decrementUnread();
    setAllNotifs((prev) => prev.filter((n) => n.id !== id));
  }

  function markAllRead() {
    apiClient.post('/notifications/read-all').catch(() => {});
    setUnreadCount(0);
    setAllNotifs((prev) =>
      prev.map((n) => ({ ...n, read_at: new Date().toISOString() }))
    );
  }

  if (loading) return <LoadingSpinner centered size="lg" />;

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Notifications
            </h1>
            {unreadCount > 0 && (
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {unreadCount} non lue{unreadCount > 1 ? 's' : ''}
              </p>
            )}
          </div>
        </div>
        {unreadCount > 0 && (
          <GradientButton variant="primary" size="sm" iconComponent={CheckCheck} onClick={markAllRead}>
            Tout lire
          </GradientButton>
        )}
      </div>

      <div className="flex flex-col gap-2">
        {allNotifs.length === 0 ? (
          <EmptyState
            icon={Bell}
            title="Aucune notification"
            description="Vous n'avez pas encore de notifications."
          />
        ) : (
          allNotifs.map((n) => (
            <GlassCard
              key={n.id}
              variant={!n.read_at ? 'highlight' : 'default'}
              padding="md"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    {!n.read_at && (
                      <span className="h-2 w-2 rounded-full bg-emerald-500 shrink-0" />
                    )}
                    <h3 className={`text-sm ${!n.read_at ? 'font-bold' : 'font-semibold'} text-slate-900 dark:text-white`}>
                      {n.title}
                    </h3>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 whitespace-pre-wrap">
                    {n.body}
                  </p>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">
                    {formatDistanceToNow(new Date(n.created_at), {
                      addSuffix: true,
                      locale: fr,
                    })}
                  </p>
                </div>
                {!n.read_at && (
                  <button
                    onClick={() => markAsRead(n.id)}
                    className="shrink-0 h-8 w-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors"
                    aria-label="Marquer comme lu"
                  >
                    <CheckCheck className="h-4 w-4" />
                  </button>
                )}
              </div>
            </GlassCard>
          ))
        )}
      </div>
    </div>
  );
}
