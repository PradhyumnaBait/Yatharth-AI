'use client';

import React, { useState } from 'react';

export interface WaveformProps {
  bars?: number[]; // Array of bar heights (0 to 1)
  progress?: number; // 0 to 1
  onSeek?: (progress: number) => void;
  isLive?: boolean;
  className?: string;
  'data-testid'?: string;
}

export const Waveform: React.FC<WaveformProps> = ({
  bars = [0.2, 0.4, 0.6, 0.9, 0.7, 0.5, 0.8, 1.0, 0.6, 0.4, 0.7, 0.5, 0.3, 0.6, 0.8, 0.9, 0.5, 0.3, 0.6, 0.4],
  progress = 0.45,
  onSeek,
  isLive = false,
  className = '',
  'data-testid': testId = 'waveform',
}) => {
  const [internalProgress, setInternalProgress] = useState(progress);

  const currentProgress = onSeek ? progress : internalProgress;

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isLive) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const newProg = Math.max(0, Math.min(1, clickX / rect.width));
    if (onSeek) {
      onSeek(newProg);
    } else {
      setInternalProgress(newProg);
    }
  };

  return (
    <div
      data-testid={testId}
      onClick={handleClick}
      role={isLive ? undefined : 'slider'}
      aria-valuenow={Math.round(currentProgress * 100)}
      tabIndex={isLive ? undefined : 0}
      className={`h-8 flex items-center gap-[2px] cursor-pointer select-none py-1 ${className}`}
    >
      {bars.map((barHeight, idx) => {
        const barProg = idx / bars.length;
        const isPlayed = barProg <= currentProgress;
        const heightPercent = Math.max(15, Math.round(barHeight * 100));

        return (
          <div
            key={idx}
            data-testid={`${testId}-bar-${idx}`}
            className={`w-[3px] rounded-full transition-colors duration-150 ${
              isPlayed ? 'bg-sb-navy' : 'bg-sb-border'
            } ${isLive ? 'animate-pulse' : ''}`}
            style={{
              height: `${heightPercent}%`,
            }}
          />
        );
      })}
    </div>
  );
};
