'use client';

import React from 'react';

export interface SegmentedOption {
  value: string;
  label: string;
}

export interface SegmentedProps {
  options: SegmentedOption[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
  'data-testid'?: string;
}

export const Segmented: React.FC<SegmentedProps> = ({
  options,
  value,
  onChange,
  className = '',
  'data-testid': testId = 'segmented-control',
}) => {
  return (
    <div
      data-testid={testId}
      className={`h-9 p-1 bg-sb-bg rounded-full inline-flex items-center gap-1 border border-sb-border ${className}`}
      role="radiogroup"
    >
      {options.map((opt) => {
        const isSelected = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={isSelected}
            data-testid={`${testId}-${opt.value}`}
            onClick={() => onChange(opt.value)}
            className={`h-7 px-3.5 rounded-full text-caption font-medium transition-[background-color,box-shadow,color] focus-visible:outline focus-visible:outline-2 focus-visible:outline-sb-navy focus-visible:outline-offset-1 ${
              isSelected
                ? 'bg-sb-white text-sb-navy font-semibold shadow-e1'
                : 'text-sb-ink-2 hover:text-sb-ink'
            }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
};
