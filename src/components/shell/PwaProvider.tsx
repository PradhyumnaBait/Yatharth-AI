'use client';

import React, { useEffect, useState } from 'react';
import { Download, X } from 'lucide-react';
import { OfflineBanner } from './OfflineBanner';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function PwaProvider({ children }: { children: React.ReactNode }) {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);

  useEffect(() => {
    // 1. Register service worker
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      navigator.serviceWorker
        .register('/sw.js')
        .then((reg) => {
          // Worker registered successfully
        })
        .catch(() => {
          // Silently handle
        });
    }

    // 2. Handle PWA install prompt
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowInstallBanner(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    if (choice.outcome === 'accepted') {
      setShowInstallBanner(false);
    }
    setDeferredPrompt(null);
  };

  return (
    <>
      <OfflineBanner />

      {/* PWA Install Banner */}
      {showInstallBanner && (
        <div
          data-testid="pwa-install-banner"
          className="bg-sb-navy text-white px-3 py-2 flex items-center justify-between text-caption border-b border-slate-700 z-50 animate-in slide-in-from-top-1"
        >
          <div className="flex items-center gap-2 min-w-0">
            <Download className="w-4 h-4 text-sky-400 shrink-0" />
            <span className="truncate">Install SchedBridge AI on your device</span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              data-testid="pwa-install-btn"
              onClick={handleInstall}
              className="px-2.5 py-1 text-[11px] font-semibold bg-white text-sb-navy rounded hover:bg-slate-100 transition-colors"
            >
              Install
            </button>
            <button
              type="button"
              aria-label="Dismiss install prompt"
              onClick={() => setShowInstallBanner(false)}
              className="p-1 hover:bg-slate-800 rounded transition-colors"
            >
              <X className="w-3.5 h-3.5 text-slate-300" />
            </button>
          </div>
        </div>
      )}

      {children}
    </>
  );
}
