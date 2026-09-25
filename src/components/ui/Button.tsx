'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline' | 'destructive-outline' | 'ghost';
  size?: 'default' | 'field' | 'sm';
  loading?: boolean;
  'data-testid'?: string;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = 'primary',
      size = 'default',
      loading = false,
      disabled = false,
      className = '',
      'data-testid': testId = 'button',
      ...props
    },
    ref
  ) => {
    const isField = size === 'field';
    const isSm = size === 'sm';
    const heightClass = isSm ? 'h-9 px-3.5 text-xs' : isField ? 'h-14' : 'h-[52px]';

    let variantStyles = '';
    if (variant === 'primary') {
      variantStyles = 'bg-sb-navy text-sb-white hover:bg-sb-navy-pressed active:bg-sb-navy-pressed border-transparent';
    } else if (variant === 'outline') {
      variantStyles = 'bg-sb-white text-sb-navy border border-sb-navy hover:bg-sb-navy-tint active:bg-sb-navy-tint';
    } else if (variant === 'destructive-outline') {
      variantStyles = 'bg-sb-white text-sb-critical-ink border border-sb-critical hover:bg-sb-critical-tint active:bg-sb-critical-tint';
    } else if (variant === 'ghost') {
      variantStyles = 'bg-transparent text-sb-navy hover:bg-sb-navy-tint active:bg-sb-navy-tint border-transparent';
    }

    const disabledStyles = disabled || loading
      ? 'opacity-40 cursor-not-allowed pointer-events-none'
      : 'sb-press-spring cursor-pointer';

    return (
      <button
        ref={ref}
        data-testid={testId}
        disabled={disabled || loading}
        className={`relative inline-flex items-center justify-center rounded-full px-6 text-callout font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-sb-navy focus-visible:outline-offset-2 ${heightClass} ${variantStyles} ${disabledStyles} ${className}`}
        {...props}
      >
        {loading && (
          <Loader2
            className="w-5 h-5 animate-spin mr-2 flex-shrink-0"
            data-testid={`${testId}-spinner`}
          />
        )}
        <span>{children}</span>
      </button>
    );
  }
);

Button.displayName = 'Button';
