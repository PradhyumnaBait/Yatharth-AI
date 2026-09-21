'use client';

import React from 'react';
import { Button } from './Button';

export interface EmptyStateProps {
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
  className?: string;
  'data-testid'?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  message,
  actionLabel,
  onAction,
  icon,
  className = '',
  'data-testid': testId = 'empty-state',
}) => {
  return (
    <div
      data-testid={testId}
      className={`p-8 text-center flex flex-col items-center justify-center ${className}`}
    >
      {icon && <div className="text-sb-ink-3 mb-3 w-8 h-8 flex items-center justify-center">{icon}</div>}
      <p className="text-body text-sb-ink-2 max-w-xs">{message}</p>
      {actionLabel && onAction && (
        <Button
          variant="outline"
          onClick={onAction}
          className="mt-4 h-10 px-4 text-callout"
          data-testid={`${testId}-action`}
        >
          {actionLabel}
        </Button>
      )}
    </div>
  );
};
