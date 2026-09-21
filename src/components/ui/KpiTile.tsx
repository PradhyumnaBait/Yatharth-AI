'use client';

import React from 'react';

export interface KpiTileProps {
  number: string | number;
  label: string;
  statusColor?: 'verified' | 'review' | 'critical' | 'navy';
  icon?: React.ReactNode;
  onClick?: () => void;
  className?: string;
  'data-testid'?: string;
}

export const KpiTile: React.FC<KpiTileProps> = ({
  number,
  label,
  statusColor = 'verified',
  icon,
  onClick,
  className = '',
  'data-testid': testId = 'kpi-tile',
}) => {
  let dotColorClass = 'bg-sb-verified';
  if (statusColor === 'review') dotColorClass = 'bg-sb-review';
  if (statusColor === 'critical') dotColorClass = 'bg-sb-critical';
  if (statusColor === 'navy') dotColorClass = 'bg-sb-navy';

  return (
    <button
      type="button"
      onClick={onClick}
      data-testid={testId}
      aria-label={`${number} ${label}`}
      className={`relative w-full p-4 rounded-[16px] bg-sb-white border border-sb-border shadow-e1 text-left flex flex-col justify-between transition-transform active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-sb-navy focus-visible:outline-offset-2 ${className}`}
    >
      <div className="flex items-start justify-between w-full">
        <div className="text-num-l font-semibold text-sb-navy tracking-tight">
          {number}
        </div>
        {icon && (
          <div className="text-sb-ink-3 w-4 h-4 flex-shrink-0 mt-1">
            {icon}
          </div>
        )}
      </div>
      <div className="flex items-center gap-2 mt-2">
        <span className={`w-2 h-2 rounded-full flex-shrink-0 ${dotColorClass}`} />
        <span className="text-caption font-medium text-sb-ink-2 truncate">{label}</span>
      </div>
    </button>
  );
};
