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
  textSize: 'default' | 'large';
  setAutoAcceptThreshold: (val: number) => void;
  setReviewThreshold: (val: number) => void;
  setSimulateOffline: (val: boolean) => void;
  setLanguage: (lang: 'en' | 'hi' | 'mr' | 'gu') => void;
  setTextSize: (size: 'default' | 'large') => void;
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
      textSize: 'default',
      toast: null,

      setAutoAcceptThreshold: (val) => set({ autoAcceptThreshold: val }),
      setReviewThreshold: (val) => set({ reviewThreshold: val }),
      setSimulateOffline: (val) => set({ isSimulatingOffline: val }),
      setLanguage: (lang) => {
        if (typeof document !== 'undefined') {
          document.documentElement.lang = lang;
        }
        set({ language: lang });
      },
      setTextSize: (size) => {
        if (typeof document !== 'undefined') {
          document.documentElement.setAttribute('data-text-size', size);
        }
        set({ textSize: size });
      },
      showToast: (message, undoCallback) =>
        set({ toast: { open: true, message, undoCallback } }),
      hideToast: () => set({ toast: null }),
    }),
    {
      name: 'schedbridge-ui-store',
      onRehydrateStorage: () => (state) => {
        if (typeof document !== 'undefined' && state) {
          if (state.language) document.documentElement.lang = state.language;
          if (state.textSize) document.documentElement.setAttribute('data-text-size', state.textSize);
        }
      },
    }
  )
);

