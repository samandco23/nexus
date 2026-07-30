'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { Bell, CheckCheck, Loader2 } from 'lucide-react';
import { useNotificationStore } from '@/stores/notification-store';
import apiClient from '@/lib/api-client';
import { API_URLS } from '@/lib/constants';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function NotificationDropdown() {
  const {
    unreadCount,
    notifications,
    dropdownOpen,
    setUnreadCount,
    setNotifications,
    setDropdownOpen,
    decrementUnread,
  } = useNotificationStore();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [setDropdownOpen]);

  function fetchUnreadCount() {
    apiClient.get('/notifications/unread-count')
      .then((res) => setUnreadCount(res.data.data?.count ?? 0))
      .catch(() => {});
  }

  function openDropdown() {
    setDropdownOpen(true);
    apiClient.get('/notifications')
      .then((res) => setNotifications(res.data.data?.notifications?.data ?? []))
      .catch(() => {});
  }

  function markAsRead(id: string) {
    apiClient.post(`/notifications/${id}/read`).catch(() => {});
    decrementUnread();
    setNotifications(notifications.filter((n) => n.id !== id));
  }

  function markAllRead() {
    apiClient.post('/notifications/read-all').catch(() => {});
    setUnreadCount(0);
    setNotifications(
      notifications.map((n) => ({ ...n, read_at: new Date().toISOString() }))
    );
  }

  return (
    <div ref={dropdownRef} className="relative">
      <button
        onClick={dropdownOpen ? () => setDropdownOpen(false) : openDropdown}
        className="relative flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute top-2 right-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white dark:ring-slate-900 px-1">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {dropdownOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-xl animate-in fade-in slide-in-from-top-2 max-h-[80vh] flex flex-col">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-700">
            <span className="text-sm font-semibold text-slate-900 dark:text-white">
              Notifications
            </span>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:underline"
              >
                <CheckCheck className="h-3.5 w-3.5" />
                Tout lire
              </button>
            )}
          </div>

          <div className="overflow-y-auto flex-1">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-slate-400 dark:text-slate-500">
                <Bell className="h-8 w-8 mb-2" />
                <span className="text-sm">Aucune notification</span>
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className={`px-4 py-3 border-b border-slate-50 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors ${
                    !n.read_at ? 'bg-emerald-50/50 dark:bg-emerald-900/10' : ''
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                        {n.title}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">
                        {n.body}
                      </p>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">
                        {formatDistanceToNow(new Date(n.created_at), {
                          addSuffix: true,
                          locale: fr,
                        })}
                      </p>
                    </div>
                    {!n.read_at && (
                      <button
                        onClick={() => markAsRead(n.id)}
                        className="shrink-0 h-6 w-6 flex items-center justify-center rounded-full text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors"
                        aria-label="Marquer comme lu"
                      >
                        <CheckCheck className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          <Link
            href="/dashboard/notifications"
            className="block text-center text-xs font-medium text-emerald-600 dark:text-emerald-400 py-2.5 border-t border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors rounded-b-xl"
            onClick={() => setDropdownOpen(false)}
          >
            Voir toutes les notifications
          </Link>
        </div>
      )}
    </div>
  );
}
