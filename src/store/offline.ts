'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { FieldEvent } from '@/services/types';

export interface QueuedReport {
  id: string;
  rawText: string;
  timestamp: string;
  audioBlob?: string; // base64
  status: 'queued' | 'syncing' | 'failed';
}

interface OfflineState {
  queuedReports: QueuedReport[];
  isOnline: boolean;
  addQueuedReport: (report: Omit<QueuedReport, 'id' | 'status'>) => void;
  removeQueuedReport: (id: string) => void;
  syncQueuedReports: (onSyncItem: (report: QueuedReport) => Promise<FieldEvent>) => Promise<number>;
  setIsOnline: (online: boolean) => void;
}

export const useOfflineStore = create<OfflineState>()(
  persist(
    (set, get) => ({
      queuedReports: [
        {
          id: 'queue-1',
          rawText: 'Spool 19 trench lowering alignment check done.',
          timestamp: '07:40 AM',
          status: 'queued',
        },
        {
          id: 'queue-2',
          rawText: 'Sand padding 50 m completed at KP 183.1',
          timestamp: '08:15 AM',
          status: 'queued',
        },
        {
          id: 'queue-3',
          rawText: 'Holiday testing cleared for joint 16.',
          timestamp: '08:50 AM',
          status: 'queued',
        },
      ],
      isOnline: true,

      addQueuedReport: (report) => {
        const id = `queue-${Date.now()}`;
        set((state) => ({
          queuedReports: [...state.queuedReports, { ...report, id, status: 'queued' }],
        }));
      },

      removeQueuedReport: (id) => {
        set((state) => ({
          queuedReports: state.queuedReports.filter((r) => r.id !== id),
        }));
      },

      syncQueuedReports: async (onSyncItem) => {
        const state = get();
        let syncedCount = 0;
        for (const report of state.queuedReports) {
          try {
            await onSyncItem(report);
            syncedCount++;
          } catch {
            // keep in queue
          }
        }
        set({ queuedReports: [] });
        return syncedCount;
      },

      setIsOnline: (online) => set({ isOnline: online }),
    }),
    {
      name: 'schedbridge-offline-store',
    }
  )
);

if (typeof window !== 'undefined') {
  (window as unknown as { useOfflineStore?: typeof useOfflineStore }).useOfflineStore = useOfflineStore;
}
