'use client';

import React from 'react';

export interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showWordmark?: boolean;
  layout?: 'row' | 'col';
  inverted?: boolean;
  className?: string;
  'data-testid'?: string;
}

export const Logo: React.FC<LogoProps> = ({
  size = 'md',
  showWordmark = true,
  layout = 'row',
  inverted = false,
  className = '',
  'data-testid': testId = 'schedbridge-logo',
}) => {
  const iconSizes = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10',
  };

  const textSizes = {
    sm: 'text-[12px] tracking-[0.06em]',
    md: 'text-[14px] tracking-[0.08em]',
    lg: 'text-[17px] tracking-[0.1em]',
  };

  const colorClass = inverted ? 'text-sb-white' : 'text-sb-navy';

  return (
    <div
      data-testid={testId}
      className={`inline-flex items-center ${
        layout === 'col' ? 'flex-col gap-2' : 'flex-row gap-2.5'
      } select-none ${colorClass} ${className}`}
    >
      {/* Upward arrow over bridge span mark */}
      <svg
        className={`${iconSizes[size]} shrink-0`}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        {/* Upward arrow / peak */}
        <path
          d="M16 3L23 11H18V16H14V11H9L16 3Z"
          fill="currentColor"
        />
        {/* Bridge horizontal deck */}
        <path
          d="M4 19H28V21H4V19Z"
          fill="currentColor"
        />
        {/* Bridge arch span */}
        <path
          d="M7 28V22C7 22 10.5 24 16 24C21.5 24 25 22 25 22V28H23V24.5C20.5 25.8 17.5 26 16 26C14.5 26 11.5 25.8 9 24.5V28H7Z"
          fill="currentColor"
        />
        {/* Foundation pillars */}
        <rect x="5" y="22" width="2" height="6" fill="currentColor" />
        <rect x="25" y="22" width="2" height="6" fill="currentColor" />
      </svg>

      {showWordmark && (
        <span
          className={`font-semibold uppercase font-sans ${textSizes[size]} leading-none flex items-center gap-1`}
        >
          <span>SchedBridge</span>
          <span className="font-bold opacity-80">AI</span>
        </span>
      )}
    </div>
  );
};
