'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UiState {
  autoAcceptThreshold: number; // default 95 (SPEC §2)
  reviewThreshold: number; // default 60 (SPEC §2)
  isSimulatingOffline: boolean;
  toast: {
    open: boolean;
    message: string;
    undoCallback?: () => void;
  } | null;

  language: 'en' | 'hi' | 'mr' | 'gu';
  setAutoAcceptThreshold: (val: number) => void;
  setReviewThreshold: (val: number) => void;
  setSimulateOffline: (val: boolean) => void;
  setLanguage: (lang: 'en' | 'hi' | 'mr' | 'gu') => void;
  showToast: (message: string, undoCallback?: () => void) => void;
  hideToast: () => void;
}

export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      autoAcceptThreshold: 95,
      reviewThreshold: 60,
      isSimulatingOffline: false,
      language: 'en',
      toast: null,

      setAutoAcceptThreshold: (val) => set({ autoAcceptThreshold: val }),
      setReviewThreshold: (val) => set({ reviewThreshold: val }),
      setSimulateOffline: (val) => set({ isSimulatingOffline: val }),
      setLanguage: (lang) => set({ language: lang }),
      showToast: (message, undoCallback) =>
        set({ toast: { open: true, message, undoCallback } }),
      hideToast: () => set({ toast: null }),
    }),
    {
      name: 'schedbridge-ui-store',
    }
  )
);
