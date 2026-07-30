'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'sonner';
import apiClient from '@/lib/api-client';
import { API_URLS } from '@/lib/constants';

export interface ChatRoom {
  id: number;
  name: string;
  type: string;
}

export interface ChatMessage {
  id: number | string;
  user_id: number;
  user_name: string;
  message: string;
  created_at: string;
}

interface UseChatReturn {
  rooms: ChatRoom[];
  activeRoom: ChatRoom | null;
  setActiveRoom: (room: ChatRoom) => void;
  messages: ChatMessage[];
  newMessage: string;
  setNewMessage: (val: string) => void;
  loading: boolean;
  sending: boolean;
  error: string | null;
  handleSend: () => Promise<void>;
}

export function useChat(): UseChatReturn {
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [activeRoom, setActiveRoom] = useState<ChatRoom | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const controllerRef = useRef<AbortController | null>(null);

  const fetchRooms = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await apiClient.get(API_URLS.chat.rooms);
      const data: ChatRoom[] = res.data.data;
      setRooms(data);
      if (data.length > 0) {
        setActiveRoom((prev) => prev ?? data[0]);
      }
    } catch {
      setError('Impossible de charger les salons de discussion.');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchMessages = useCallback(async (roomId: number, signal?: AbortSignal) => {
    try {
      const res = await apiClient.get(API_URLS.chat.messages(roomId), { signal });
      const msgs = res.data.data?.data ?? res.data.data ?? [];
      setMessages(msgs);
    } catch {
      toast.error('Erreur lors du chargement des messages');
    }
  }, []);

  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);

  useEffect(() => {
    if (!activeRoom?.id) return;

    controllerRef.current?.abort();
    controllerRef.current = new AbortController();
    fetchMessages(activeRoom.id, controllerRef.current.signal);

    intervalRef.current = setInterval(() => {
      controllerRef.current?.abort();
      controllerRef.current = new AbortController();
      fetchMessages(activeRoom.id, controllerRef.current.signal);
    }, 3000);

    return () => {
      controllerRef.current?.abort();
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [activeRoom?.id, fetchMessages]);

  const handleSend = useCallback(async () => {
    const trimmed = newMessage.trim();
    if (!trimmed || !activeRoom || sending) return;

    setSending(true);
    try {
      await apiClient.post(API_URLS.chat.send(activeRoom.id), { message: trimmed });
      setNewMessage('');
      await fetchMessages(activeRoom.id);
    } catch {
      toast.error("Erreur lors de l'envoi du message");
    } finally {
      setSending(false);
    }
  }, [newMessage, activeRoom, sending, fetchMessages]);

  return {
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
  };
}
