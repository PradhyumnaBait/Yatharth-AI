'use client';

import React from 'react';
import Image from 'next/image';
import { Mic, FileSpreadsheet, FileText } from 'lucide-react';
import { StatusPill, EventStatus } from '../ui/StatusPill';

export interface EventRowProps {
  id: string;
  title: string;
  timestamp: string; // e.g. "08:42 AM"
  status: EventStatus;
  source?: 'voice' | 'excel' | 'pdf';
  thumbnailSrc?: string;
  onClick?: () => void;
  showDivider?: boolean;
  className?: string;
  'data-testid'?: string;
}

export const EventRow: React.FC<EventRowProps> = ({
  id,
  title,
  timestamp,
  status,
  source = 'voice',
  thumbnailSrc,
  onClick,
  showDivider = true,
  className = '',
  'data-testid': testId = 'event-row',
}) => {
  return (
    <div
      data-testid={`${testId}-${id}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      className={`w-full flex items-center justify-between py-3 px-1 transition-colors hover:bg-sb-white/60 active:bg-sb-navy-tint/50 rounded-[12px] cursor-pointer sb-press-spring focus-visible:outline focus-visible:outline-2 focus-visible:outline-sb-navy ${className}`}
    >
      <div className="flex items-center gap-3 min-w-0 pr-3">
        {/* 48px Thumbnail or Source Glyph on Navy Tint */}
        <div className="relative w-12 h-12 rounded-[12px] overflow-hidden bg-sb-navy-tint flex-shrink-0 flex items-center justify-center border border-sb-border">
          {thumbnailSrc ? (
            <Image
              src={thumbnailSrc}
              alt={title}
              fill
              sizes="48px"
              className="object-cover"
            />
          ) : source === 'excel' ? (
            <FileSpreadsheet className="w-5 h-5 text-sb-navy" strokeWidth={1.5} />
          ) : source === 'pdf' ? (
            <FileText className="w-5 h-5 text-sb-navy" strokeWidth={1.5} />
          ) : (
            <Mic className="w-5 h-5 text-sb-navy" strokeWidth={1.5} />
          )}
        </div>

        {/* Title & Timestamp */}
        <div className="min-w-0">
          <div className="text-callout font-semibold text-sb-navy truncate">
            {title}
          </div>
          <div className="font-mono text-mono-s text-sb-ink-3 mt-0.5">
            {timestamp}
          </div>
        </div>
      </div>

      {/* Status Pill */}
      <div className="flex-shrink-0">
        <StatusPill status={status} />
      </div>
    </div>
  );
};
