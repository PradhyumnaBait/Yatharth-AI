'use client';

import React from 'react';
import { CloudOff, RefreshCw } from 'lucide-react';

export interface OfflineBannerProps {
  queuedCount?: number;
  onSyncNow?: () => void;
  isSyncing?: boolean;
  className?: string;
  'data-testid'?: string;
}

export const OfflineBanner: React.FC<OfflineBannerProps> = ({
  queuedCount = 3,
  onSyncNow,
  isSyncing = false,
  className = '',
  'data-testid': testId = 'offline-banner',
}) => {
  return (
    <div
      data-testid={testId}
      className={`w-full bg-sb-review-tint border-y border-sb-review-ink/20 px-4 py-2 flex items-center justify-between gap-3 text-caption text-sb-review-ink ${className}`}
      role="alert"
    >
      <div className="flex items-center gap-2 min-w-0">
        <CloudOff className="w-4 h-4 flex-shrink-0 text-sb-review-ink" strokeWidth={1.5} />
        <span className="truncate font-medium">
          Offline · {queuedCount} report{queuedCount === 1 ? '' : 's'} saved on device
        </span>
      </div>
      {onSyncNow && (
        <button
          type="button"
          data-testid={`${testId}-sync-btn`}
          onClick={onSyncNow}
          disabled={isSyncing}
          className="inline-flex items-center gap-1.5 font-semibold text-sb-review-ink hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-sb-review-ink text-caption flex-shrink-0 disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} strokeWidth={1.5} />
          <span>Sync now</span>
        </button>
      )}
    </div>
  );
};
