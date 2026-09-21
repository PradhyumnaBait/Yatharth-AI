'use client';

import React from 'react';

export interface ConfidenceBadgeProps {
  confidence: number; // e.g. 94
  autoAcceptThreshold?: number; // default 95
  reviewThreshold?: number; // default 60
  className?: string;
  'data-testid'?: string;
}

export const ConfidenceBadge: React.FC<ConfidenceBadgeProps> = ({
  confidence,
  autoAcceptThreshold = 95,
  reviewThreshold = 60,
  className = '',
  'data-testid': testId = 'confidence-badge',
}) => {
  let tierColor = 'bg-sb-verified';
  if (confidence < reviewThreshold) {
    tierColor = 'bg-sb-critical';
  } else if (confidence < autoAcceptThreshold) {
    tierColor = 'bg-sb-review';
  }

  return (
    <div
      data-testid={testId}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-sb-bg border border-sb-border ${className}`}
    >
      <span className={`w-2 h-2 rounded-full flex-shrink-0 ${tierColor}`} />
      <span className="font-mono text-mono-m font-semibold text-sb-navy">
        {confidence}%
      </span>
    </div>
  );
};
