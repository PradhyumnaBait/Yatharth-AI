'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  AuditEntry,
  AuditEntryData,
  createAuditEntry,
  verifyAuditChain,
} from '@/lib/hash';
import { demoNowISO } from '@/mocks/clock';

interface AuditState {
  chain: AuditEntry[];
  lastHash: string;
  isVerifying: boolean;
  verifyResult: { valid: boolean; brokenAtIndex?: number } | null;
  appendEntry: (data: Omit<AuditEntryData, 'id' | 'ts'>) => Promise<AuditEntry>;
  verifyChain: () => Promise<{ valid: boolean; brokenAtIndex?: number }>;
  tamperEntry: (index: number) => void;
  resetAudit: (initialChain: AuditEntry[]) => void;
}

const GENESIS_HASH = '0000000000000000000000000000000000000000000000000000000000000000';

export const useAuditStore = create<AuditState>()(
  persist(
    (set, get) => ({
      chain: [],
      lastHash: GENESIS_HASH,
      isVerifying: false,
      verifyResult: null,

      appendEntry: async (data) => {
        const state = get();
        const prevHash = state.chain.length > 0 ? state.chain[state.chain.length - 1].hash : GENESIS_HASH;
        const entryId = `AUD-${String(state.chain.length + 1).padStart(5, '0')}`;
        const newEntry = await createAuditEntry(prevHash, {
          ...data,
          id: entryId,
          ts: demoNowISO(),
        });

        set({
          chain: [...state.chain, newEntry],
          lastHash: newEntry.hash,
        });

        return newEntry;
      },

      verifyChain: async () => {
        set({ isVerifying: true });
        const result = await verifyAuditChain(get().chain);
        set({ isVerifying: false, verifyResult: result });
        return result;
      },

      tamperEntry: (index: number) => {
        const state = get();
        if (index < 0 || index >= state.chain.length) return;
        const copy = [...state.chain];
        copy[index] = {
          ...copy[index],
          newValue: 'TAMPERED_VALUE',
        };
        set({ chain: copy, verifyResult: null });
      },

      resetAudit: (initialChain: AuditEntry[]) => {
        const lastHash = initialChain.length > 0 ? initialChain[initialChain.length - 1].hash : GENESIS_HASH;
        set({ chain: initialChain, lastHash, verifyResult: null });
      },
    }),
    {
      name: 'schedbridge-audit-store',
    }
  )
);
