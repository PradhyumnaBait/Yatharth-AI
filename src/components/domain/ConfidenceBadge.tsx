'use client';

import React from 'react';

import { useUiStore } from '@/store/ui';

export interface ConfidenceBadgeProps {
  confidence: number; // e.g. 94
  autoAcceptThreshold?: number; // default 95
  reviewThreshold?: number; // default 60
  showLabel?: boolean;
  className?: string;
  'data-testid'?: string;
}

export const ConfidenceBadge: React.FC<ConfidenceBadgeProps> = ({
  confidence,
  autoAcceptThreshold: customAutoAccept,
  reviewThreshold: customReview,
  showLabel = false,
  className = '',
  'data-testid': testId = 'confidence-badge',
}) => {
  const storeAutoAccept = useUiStore((s) => s.autoAcceptThreshold);
  const storeReview = useUiStore((s) => s.reviewThreshold);

  const autoAcceptThreshold = customAutoAccept ?? storeAutoAccept;
  const reviewThreshold = customReview ?? storeReview;

  let tierColor = 'bg-sb-verified';
  let tierName: 'unmatched' | 'review' | 'auto-accept' = 'auto-accept';

  if (confidence < reviewThreshold) {
    tierColor = 'bg-sb-critical';
    tierName = 'unmatched';
  } else if (confidence < autoAcceptThreshold) {
    tierColor = 'bg-sb-review';
    tierName = 'review';
  }

  return (
    <div
      data-testid={testId}
      data-tier={tierName}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-sb-bg border border-sb-border ${className}`}
      title={`Tier: ${tierName} (Threshold ≥ ${autoAcceptThreshold}%)`}
    >
      <span className={`w-2 h-2 rounded-full flex-shrink-0 ${tierColor}`} />
      <span className="font-mono text-mono-m font-semibold text-sb-navy">
        {confidence}%
      </span>
      {showLabel && (
        <span className="text-[10px] uppercase font-bold text-sb-text-subtle tracking-wider capitalize ml-0.5">
          {tierName === 'auto-accept' ? 'Auto-accept' : tierName}
        </span>
      )}
    </div>
  );
};
