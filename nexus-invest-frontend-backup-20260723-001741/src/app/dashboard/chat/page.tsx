'use client';

import { useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { ArrowLeft, Send, MessageCircle } from 'lucide-react';
import { useI18nStore } from '@/stores/i18n-store';
import GlassCard from '@/components/ui/glass-card';
import GradientButton from '@/components/ui/gradient-button';
import LoadingSpinner from '@/components/shared/loading-spinner';
import EmptyState from '@/components/shared/empty-state';
import ErrorState from '@/components/shared/error-state';
import { useChat } from '@/hooks/use-chat';
import type { ChatMessage } from '@/hooks/use-chat';

interface StoredUser {
  id: number;
  first_name: string;
  last_name: string;
}

const gradientBg = 'bg-gradient-to-br from-emerald-500 to-emerald-600';

function getStoredUser(): StoredUser | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem('user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
}

function isSameDay(a: string, b: string): boolean {
  const da = new Date(a);
  const db = new Date(b);
  return da.getFullYear() === db.getFullYear() && da.getMonth() === db.getMonth() && da.getDate() === db.getDate();
}

function getDateLabel(iso: string): string {
  const d = new Date(iso);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (isSameDay(iso, today.toISOString())) return "Aujourd'hui";
  if (isSameDay(iso, yesterday.toISOString())) return 'Hier';

  return d.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function AutoResizeTextarea({
  value,
  onChange,
  onKeyDown,
  maxLength,
  disabled,
  placeholder,
}: {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  maxLength: number;
  disabled: boolean;
  placeholder: string;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (el) {
      el.style.height = 'auto';
      el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
    }
  }, [value]);

  return (
    <textarea
      ref={ref}
      value={value}
      onChange={onChange}
      onKeyDown={onKeyDown}
      maxLength={maxLength}
      disabled={disabled}
      placeholder={placeholder}
      rows={1}
      className="flex-1 resize-none rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 py-2.5 px-4 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
      aria-label="Message"
    />
  );
}

export default function ChatPage() {
  const { t } = useI18nStore();
  const {
    rooms,
    activeRoom,
    setActiveRoom,
    messages,
    newMessage,
    setNewMessage,
    loading,
    sending,
    error,
    handleSend,
  } = useChat();

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend]
  );

  if (loading) {
    return <LoadingSpinner centered size="lg" label={t('common.loading')} />;
  }

  if (error) {
    return (
      <div className="flex flex-col gap-4">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
          aria-label={t('common.back')}
        >
          <ArrowLeft className="h-4 w-4" />
          {t('common.back')}
        </Link>
        <ErrorState message={error} />
      </div>
    );
  }

  if (rooms.length === 0) {
    return (
      <div className="flex flex-col gap-4">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
          aria-label={t('common.back')}
        >
          <ArrowLeft className="h-4 w-4" />
          {t('common.back')}
        </Link>
        <EmptyState
          icon={MessageCircle}
          title={t('Aucune discussion')}
          description={t('Aucun salon de discussion disponible pour le moment.')}
        />
      </div>
    );
  }

  const showTabs = rooms.length > 1;
  const currentUser = getStoredUser();
  const currentUserId = currentUser?.id;

  function renderMessages(msgs: ChatMessage[]) {
    const elements: React.ReactNode[] = [];
    let lastDateLabel = '';
    let lastTimeLabel = '';

    msgs.forEach((msg) => {
      const dateLabel = getDateLabel(msg.created_at);
      const timeLabel = formatTime(msg.created_at);
      const isOwn = msg.user_id === currentUserId;

      if (dateLabel !== lastDateLabel) {
        elements.push(
          <div key={`date-${msg.id}`} className="flex items-center gap-3 my-4">
            <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
            <span className="text-xs font-medium text-slate-400 dark:text-slate-500 shrink-0">
              {dateLabel}
            </span>
            <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
          </div>
        );
        lastDateLabel = dateLabel;
        lastTimeLabel = '';
      }

      const showTimeGroup = timeLabel !== lastTimeLabel;

      elements.push(
        <div
          key={msg.id}
          className={`flex items-start gap-3 mb-3 ${isOwn ? 'flex-row-reverse' : ''}`}
        >
          <div
            className={`flex h-8 w-8 items-center justify-center rounded-full text-white text-xs font-bold shrink-0 ${gradientBg}`}
            aria-hidden="true"
          >
            {msg.user_name?.charAt(0).toUpperCase() || '?'}
          </div>
          <div
            className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
              isOwn
                ? 'bg-emerald-50 dark:bg-emerald-900/40 rounded-tr-md'
                : 'bg-white dark:bg-slate-800 rounded-tl-md border border-slate-100 dark:border-slate-700'
            }`}
          >
            <div className={`flex items-baseline gap-2 mb-1 ${isOwn ? 'flex-row-reverse' : ''}`}>
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                {msg.user_name}
              </span>
              {showTimeGroup && (
                <span className="text-[10px] text-slate-400 dark:text-slate-500">
                  {timeLabel}
                </span>
              )}
            </div>
            <p className={`text-sm whitespace-pre-wrap break-words ${
              isOwn ? 'text-slate-800 dark:text-slate-200' : 'text-slate-700 dark:text-slate-300'
            }`}>
              {msg.message}
            </p>
          </div>
        </div>
      );

      lastTimeLabel = showTimeGroup ? timeLabel : lastTimeLabel;
    });

    return elements;
  }

  return (
    <div className="flex flex-col gap-4 h-[calc(100vh-12rem)]">
      <div className="flex items-center justify-between">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
          aria-label={t('common.back')}
        >
          <ArrowLeft className="h-4 w-4" />
          {t('common.back')}
        </Link>
        <h1 className="text-lg font-bold text-slate-900 dark:text-white">{t('chat.title')}</h1>
        <div className="w-16" />
      </div>

      {showTabs && (
        <div className="flex gap-1 border-b border-slate-200 dark:border-slate-700" role="tablist">
          {rooms.map((room) => (
            <button
              key={room.id}
              onClick={() => setActiveRoom(room)}
              className={`relative px-4 py-2.5 text-sm font-medium transition-colors ${
                activeRoom?.id === room.id
                  ? 'text-emerald-600 dark:text-emerald-400 border-b-2 border-emerald-500'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
              aria-label={t('Onglet {name}', { name: room.name })}
              aria-selected={activeRoom?.id === room.id}
              role="tab"
            >
              {room.name}
            </button>
          ))}
        </div>
      )}

      {!showTabs && activeRoom && (
        <p className="text-xs text-slate-400">
          {t('chat.room_label', { name: activeRoom.name })}
        </p>
      )}

      {activeRoom?.type === 'referral' && (
        <p className="text-xs text-slate-500 dark:text-slate-400 italic">
          {t('Chat réservé à vous et vos filleuls directs')}
        </p>
      )}

      <GlassCard
        variant="default"
        padding="sm"
        className="flex-1 flex flex-col overflow-hidden"
      >
        <div className="flex-1 overflow-y-auto px-2 py-3 space-y-1 styled-scrollbar">
          {messages.length === 0 ? (
            <EmptyState
              icon={MessageCircle}
              title={t('Aucun message')}
              description={t("Aucun message pour l'instant. Soyez le premier à écrire !")}
              className="py-8"
            />
          ) : (
            renderMessages(messages)
          )}
          <div ref={messagesEndRef} />
        </div>
      </GlassCard>

      <GlassCard variant="default" padding="sm">
        <div className="flex items-end gap-2">
          <AutoResizeTextarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            maxLength={2000}
            disabled={sending}
            placeholder={t('chat.placeholder')}
          />
          <div className="flex flex-col items-end gap-1 shrink-0">
            <GradientButton
              variant="primary"
              size="md"
              iconComponent={Send}
              iconPosition="right"
              onClick={handleSend}
              disabled={!newMessage.trim() || sending}
              loading={sending}
              ariaLabel={t('chat.send')}
            >
              {t('chat.send')}
            </GradientButton>
            {newMessage.length > 0 && (
              <span className={`text-[10px] ${
                newMessage.length > 1900 ? 'text-amber-500' : 'text-slate-400'
              }`}>
                {newMessage.length}/2000
              </span>
            )}
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
