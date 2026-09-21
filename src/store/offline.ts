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
  retryReport: (id: string, onSyncItem?: (report: QueuedReport) => Promise<FieldEvent>) => Promise<void>;
  flushAllQueued: () => Promise<number>;
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
        const remaining: QueuedReport[] = [];
        for (const report of state.queuedReports) {
          try {
            await onSyncItem(report);
            syncedCount++;
          } catch {
            remaining.push({ ...report, status: 'failed' });
          }
        }
        set({ queuedReports: remaining });
        return syncedCount;
      },

      retryReport: async (id: string, onSyncItem?: (report: QueuedReport) => Promise<FieldEvent>) => {
        const state = get();
        const report = state.queuedReports.find((r) => r.id === id);
        if (!report) return;
        set((s) => ({
          queuedReports: s.queuedReports.map((r) => (r.id === id ? { ...r, status: 'syncing' } : r)),
        }));
        try {
          if (onSyncItem) {
            await onSyncItem(report);
          } else {
            // Simulated latency then success
            await new Promise((res) => setTimeout(res, 500));
          }
          set((s) => ({
            queuedReports: s.queuedReports.filter((r) => r.id !== id),
          }));
        } catch {
          set((s) => ({
            queuedReports: s.queuedReports.map((r) => (r.id === id ? { ...r, status: 'failed' } : r)),
          }));
        }
      },

      flushAllQueued: async () => {
        const state = get();
        const count = state.queuedReports.length;
        if (count === 0) return 0;
        set({ queuedReports: [] });
        return count;
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
