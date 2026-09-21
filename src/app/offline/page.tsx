'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { WifiOff, RefreshCw, Clock, ArrowRight } from 'lucide-react';
import { useOfflineStore } from '@/store/offline';

export default function OfflinePage() {
  const router = useRouter();
  const queuedReports = useOfflineStore((s) => s.queuedReports);
  const [isRetrying, setIsRetrying] = React.useState(false);

  const handleRetry = () => {
    setIsRetrying(true);
    setTimeout(() => {
      if (typeof window !== 'undefined' && navigator.onLine) {
        router.push('/home');
      } else {
        setIsRetrying(false);
      }
    }, 800);
  };

  return (
    <div className="min-h-screen bg-sb-bg flex flex-col items-center justify-center p-6 text-center" data-testid="offline-fallback-page">
      <div className="w-16 h-16 rounded-full bg-sb-bg-subtle border border-sb-border flex items-center justify-center text-amber-600 mb-5 shadow-e1">
        <WifiOff className="w-8 h-8" />
      </div>

      <h1 className="text-h2 font-bold text-sb-ink tracking-tight mb-2">You are currently offline</h1>
      <p className="text-body text-sb-text-muted max-w-sm mb-6">
        SchedBridge is designed to work seamlessly offline. Your field captures and voice notes are stored safely in local memory.
      </p>

      {/* Offline Queue Status Card */}
      <div className="w-full max-w-sm bg-white rounded-card border border-sb-border p-4 mb-6 shadow-e1 text-left">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-600" />
            <span className="text-caption font-semibold text-sb-ink">Offline Queue Status</span>
          </div>
          <span className="text-caption font-mono font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
            {queuedReports.length} {queuedReports.length === 1 ? 'item' : 'items'}
          </span>
        </div>
        <p className="text-[11px] text-sb-text-subtle mt-2">
          {queuedReports.length > 0
            ? 'Stored locally in IndexedDB. Will auto-sync to Primavera P6 bridge when connection returns.'
            : 'No pending items waiting in queue.'}
        </p>
      </div>

      {/* Actions */}
      <div className="w-full max-w-sm space-y-3">
        <button
          type="button"
          data-testid="offline-retry-btn"
          onClick={handleRetry}
          disabled={isRetrying}
          className="w-full py-3 px-4 bg-sb-navy text-white text-caption font-semibold rounded-pill hover:bg-slate-800 transition-colors inline-flex items-center justify-center gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${isRetrying ? 'animate-spin' : ''}`} />
          {isRetrying ? 'Checking connection...' : 'Retry connection'}
        </button>

        <button
          type="button"
          data-testid="offline-go-reports-btn"
          onClick={() => router.push('/reports?tab=queued')}
          className="w-full py-3 px-4 bg-white border border-sb-border text-sb-ink text-caption font-semibold rounded-pill hover:bg-sb-bg-subtle transition-colors inline-flex items-center justify-center gap-1.5"
        >
          <span>View queued reports</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
