'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { WifiOff, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';
import { useOfflineStore } from '@/store/offline';
import { useUiStore } from '@/store/ui';

export function OfflineBanner() {
  const router = useRouter();
  const queuedReports = useOfflineStore((s) => s.queuedReports);
  const isSimulatingOffline = useUiStore((s) => s.isSimulatingOffline);
  const showToast = useUiStore((s) => s.showToast);
  const [isClientOnline, setIsClientOnline] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    setIsClientOnline(navigator.onLine);

    const handleOnline = () => {
      setIsClientOnline(true);
      // Auto-flush queue on reconnect per SPEC §7
      const pendingCount = useOfflineStore.getState().queuedReports.length;
      if (pendingCount > 0) {
        setIsSyncing(true);
        setTimeout(() => {
          useOfflineStore.getState().flushAllQueued().then((count) => {
            setIsSyncing(false);
            showToast(`Connection restored. ${count} offline reports synced.`);
          });
        }, 600);
      }
    };

    const handleOffline = () => {
      setIsClientOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [showToast]);

  // Auto-flush on simulated reconnect
  const prevSimulatingRef = React.useRef(isSimulatingOffline);
  useEffect(() => {
    if (prevSimulatingRef.current && !isSimulatingOffline) {
      const pendingCount = useOfflineStore.getState().queuedReports.length;
      if (pendingCount > 0) {
        setIsSyncing(true);
        setTimeout(() => {
          useOfflineStore.getState().flushAllQueued().then((count) => {
            setIsSyncing(false);
            showToast(`Connection restored. ${count} offline reports synced.`);
          });
        }, 400);
      }
    }
    prevSimulatingRef.current = isSimulatingOffline;
  }, [isSimulatingOffline, showToast]);

  const isOffline = !isClientOnline || isSimulatingOffline;
  const hasQueue = queuedReports.length > 0;

  if (!isOffline && !hasQueue) {
    return null;
  }

  const handleManualSync = async () => {
    if (isOffline) {
      router.push('/reports?tab=queued');
      return;
    }
    setIsSyncing(true);
    const count = await useOfflineStore.getState().flushAllQueued();
    setIsSyncing(false);
    showToast(`${count} offline reports synced.`);
  };

  return (
    <aside
      role="status"
      aria-live="polite"
      data-testid="offline-persistent-banner"
      className={`w-full px-3 py-2 flex items-center justify-between text-caption font-medium border-b transition-colors z-40 ${
        isOffline
          ? 'bg-amber-50 text-amber-900 border-amber-200'
          : 'bg-sb-bg-subtle text-sb-ink border-sb-border'
      }`}
    >
      <div className="flex items-center gap-2 min-w-0">
        {isOffline ? (
          <WifiOff className="w-4 h-4 text-amber-700 shrink-0" aria-hidden="true" />
        ) : (
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" aria-hidden="true" />
        )}
        <span className="truncate">
          {isOffline
            ? isSimulatingOffline
              ? 'Simulating offline mode'
              : 'Network offline · Changes saved locally'
            : 'Online · Sync ready'}
          {hasQueue && ` (${queuedReports.length} queued)`}
        </span>
      </div>

      <div className="flex items-center gap-2 shrink-0 ml-2">
        <button
          type="button"
          data-testid="offline-banner-action-btn"
          onClick={handleManualSync}
          disabled={isSyncing}
          className="px-2.5 py-1 text-[11px] font-semibold rounded border transition-colors bg-white hover:bg-slate-50 text-sb-ink border-sb-border"
        >
          {isSyncing ? (
            <span className="inline-flex items-center gap-1">
              <RefreshCw className="w-3 h-3 animate-spin" /> Syncing...
            </span>
          ) : isOffline ? (
            'View Queue'
          ) : (
            'Sync Now'
          )}
        </button>
      </div>
    </aside>
  );
}
