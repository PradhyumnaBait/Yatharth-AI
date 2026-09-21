'use client';

import React from 'react';
import {
  LucideIcon,
  CheckCircle,
  Clock,
  HelpCircle,
  AlertTriangle,
  XCircle,
  CloudOff,
  MessageCircle,
} from 'lucide-react';

export type EventStatus =
  | 'Verified'
  | 'Review'
  | 'Unmatched'
  | 'Delay'
  | 'Rejected'
  | 'Saved offline'
  | 'Reply needed';

export interface StatusPillProps {
  status: EventStatus;
  className?: string;
  'data-testid'?: string;
}

export const StatusPill: React.FC<StatusPillProps> = ({
  status,
  className = '',
  'data-testid': testId = 'status-pill',
}) => {
  let bgClass = '';
  let textClass = '';
  let IconComponent: LucideIcon = CheckCircle;

  switch (status) {
    case 'Verified':
      bgClass = 'bg-sb-verified-tint';
      textClass = 'text-sb-verified-ink';
      IconComponent = CheckCircle;
      break;
    case 'Review':
      bgClass = 'bg-sb-review-tint';
      textClass = 'text-sb-review-ink';
      IconComponent = Clock;
      break;
    case 'Unmatched':
      bgClass = 'bg-sb-critical-tint';
      textClass = 'text-sb-critical-ink';
      IconComponent = HelpCircle;
      break;
    case 'Delay':
      bgClass = 'bg-sb-critical-tint';
      textClass = 'text-sb-critical-ink';
      IconComponent = AlertTriangle;
      break;
    case 'Rejected':
      bgClass = 'bg-[#ECEFF3]';
      textClass = 'text-[#5A6474]';
      IconComponent = XCircle;
      break;
    case 'Saved offline':
      bgClass = 'bg-[#ECEFF3]';
      textClass = 'text-[#5A6474]';
      IconComponent = CloudOff;
      break;
    case 'Reply needed':
      bgClass = 'bg-sb-navy-tint';
      textClass = 'text-sb-navy';
      IconComponent = MessageCircle;
      break;
  }

  return (
    <span
      data-testid={`${testId}-${status.toLowerCase().replace(/\s+/g, '-')}`}
      className={`h-7 px-2.5 rounded-full inline-flex items-center gap-1.5 text-caption font-semibold select-none ${bgClass} ${textClass} ${className}`}
    >
      <IconComponent className="w-3.5 h-3.5 flex-shrink-0" strokeWidth={1.5} />
      <span>{status}</span>
    </span>
  );
};
