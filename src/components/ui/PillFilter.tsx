'use client';

import React from 'react';

export interface PillFilterProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
  icon?: React.ReactNode;
  'data-testid'?: string;
}

export const PillFilter: React.FC<PillFilterProps> = ({
  children,
  active = false,
  icon,
  className = '',
  'data-testid': testId = 'pill-filter',
  ...props
}) => {
  return (
    <button
      type="button"
      data-testid={testId}
      aria-pressed={active}
      className={`h-9 px-3.5 rounded-full inline-flex items-center gap-2 text-callout font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-sb-navy focus-visible:outline-offset-2 ${
        active
          ? 'bg-sb-navy text-sb-white hover:bg-sb-navy-pressed'
          : 'bg-sb-white text-sb-navy border border-sb-border hover:bg-sb-navy-tint'
      } ${className}`}
      {...props}
    >
      {icon && <span className="w-4 h-4 flex-shrink-0 flex items-center justify-center">{icon}</span>}
      <span>{children}</span>
    </button>
  );
};
