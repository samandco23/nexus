import { create } from 'zustand';

export interface Notification {
  id: string;
  title: string;
  body: string;
  read_at: string | null;
  created_at: string;
}

interface NotificationState {
  unreadCount: number;
  notifications: Notification[];
  dropdownOpen: boolean;
  setUnreadCount: (count: number) => void;
  setNotifications: (notifications: Notification[]) => void;
  setDropdownOpen: (open: boolean) => void;
  decrementUnread: () => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  unreadCount: 0,
  notifications: [],
  dropdownOpen: false,
  setUnreadCount: (count) => set({ unreadCount: count }),
  setNotifications: (notifications) => set({ notifications }),
  setDropdownOpen: (open) => set({ dropdownOpen: open }),
  decrementUnread: () =>
    set((state) => ({ unreadCount: Math.max(0, state.unreadCount - 1) })),
}));
