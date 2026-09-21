'use client';

import React from 'react';

export interface ChipProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'confirmed';
  onTap?: () => void;
  'data-testid'?: string;
}

export const Chip: React.FC<ChipProps> = ({
  children,
  variant = 'default',
  onTap,
  className = '',
  'data-testid': testId = 'chip',
  ...props
}) => {
  const isConfirmed = variant === 'confirmed';
  const isClickable = !!onTap || !!props.onClick;

  return (
    <button
      type="button"
      onClick={onTap || props.onClick}
      data-testid={testId}
      disabled={!isClickable}
      className={`h-7 px-3 rounded-full inline-flex items-center justify-center text-caption font-medium transition-all ${
        isConfirmed
          ? 'bg-sb-verified-tint text-sb-verified-ink border border-sb-verified-ink/20'
          : 'bg-sb-bg text-sb-navy border border-transparent'
      } ${
        isClickable
          ? 'cursor-pointer hover:border-sb-border active:border-sb-navy active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-sb-navy'
          : 'cursor-default'
      } ${className}`}
      {...props}
    >
      <span>{children}</span>
    </button>
  );
};
