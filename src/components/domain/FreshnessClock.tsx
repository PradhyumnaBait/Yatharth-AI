'use client';

import React, { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';

export interface FreshnessClockProps {
  initialSeconds?: number;
  prefix?: string;
  showIcon?: boolean;
  className?: string;
  'data-testid'?: string;
}

export const FreshnessClock: React.FC<FreshnessClockProps> = ({
  initialSeconds = 3, // Reference starts at 00:03
  prefix = 'Data Freshness:',
  showIcon = true,
  className = '',
  'data-testid': testId = 'freshness-clock',
}) => {
  const [seconds, setSeconds] = useState(initialSeconds);

  useEffect(() => {
    const interval = setInterval(() => {
      setSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (totalSeconds: number): string => {
    if (totalSeconds < 3600) {
      const m = Math.floor(totalSeconds / 60);
      const s = totalSeconds % 60;
      return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    } else if (totalSeconds < 86400) {
      const h = Math.floor(totalSeconds / 3600);
      const m = Math.floor((totalSeconds % 3600) / 60);
      return `${h}h ${m}m`;
    } else {
      const d = Math.floor(totalSeconds / 86400);
      const h = Math.floor((totalSeconds % 86400) / 3600);
      return `${d}d ${h}h`;
    }
  };

  return (
    <div
      data-testid={testId}
      className={`inline-flex items-center gap-1.5 text-caption text-sb-ink-2 select-none ${className}`}
    >
      {showIcon && <Clock className="w-3.5 h-3.5 text-sb-ink-3" strokeWidth={1.5} />}
      {prefix && <span>{prefix}</span>}
      <span className="font-mono text-mono-m font-semibold text-sb-navy" aria-live="polite">
        {formatTime(seconds)}
      </span>
    </div>
  );
};
