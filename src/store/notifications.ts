'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  needsAction: boolean;
  category: 'question' | 'alert' | 'warning' | 'access' | 'system';
  targetRoute?: string;
}

export const SEED_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif-1',
    title: 'Meera asked: which spool range on Line 24-XX?',
    message: 'Planner question regarding event E-2091 weld joints.',
    time: '12 min ago',
    read: false,
    needsAction: true,
    category: 'question',
    targetRoute: '/event/E-2091',
  },
  {
    id: 'notif-2',
    title: '12 events need review',
    message: 'Field logs waiting in the planner triage queue.',
    time: '25 min ago',
    read: false,
    needsAction: true,
    category: 'alert',
    targetRoute: '/workbench',
  },
  {
    id: 'notif-3',
    title: 'Out-of-sequence warning on PIP-24-018',
    message: 'Coating report received before pipe welding completed.',
    time: '1 hour ago',
    read: false,
    needsAction: false,
    category: 'warning',
    targetRoute: '/event/E-2093',
  },
  {
    id: 'notif-4',
    title: 'New access request REQ-0087',
    message: 'Pooja Sharma requested Planner access to Package 3.',
    time: '2 hours ago',
    read: true,
    needsAction: false,
    category: 'access',
    targetRoute: '/home?role=admin',
  },
];

interface NotificationsState {
  notifications: AppNotification[];
  addNotification: (notif: Omit<AppNotification, 'id' | 'read' | 'time'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  resetNotifications: () => void;
}

export const useNotificationsStore = create<NotificationsState>()(
  persist(
    (set) => ({
      notifications: SEED_NOTIFICATIONS,

      addNotification: (notif) => {
        const id = `notif-${Date.now()}`;
        set((state) => ({
          notifications: [
            {
              ...notif,
              id,
              read: false,
              time: 'Just now',
            },
            ...state.notifications,
          ],
        }));
      },

      markAsRead: (id: string) => {
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.id === id ? { ...n, read: true } : n
          ),
        }));
      },

      markAllAsRead: () => {
        set((state) => ({
          notifications: state.notifications.map((n) => ({ ...n, read: true })),
        }));
      },

      resetNotifications: () => {
        set({ notifications: SEED_NOTIFICATIONS });
      },
    }),
    {
      name: 'schedbridge-notifications-store',
    }
  )
);

export function useUnreadNotificationsCount(): number {
  const notifications = useNotificationsStore((s) => s.notifications);
  return notifications.filter((n) => !n.read).length;
}
