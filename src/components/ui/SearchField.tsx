'use client';

import React from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';

export interface SearchFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onFilterClick?: () => void;
  showFilter?: boolean;
  'data-testid'?: string;
}

export const SearchField = React.forwardRef<HTMLInputElement, SearchFieldProps>(
  (
    {
      value,
      onChange,
      placeholder = 'Search activities, events...',
      onFilterClick,
      showFilter = true,
      className = '',
      'data-testid': testId = 'search-field',
      ...props
    },
    ref
  ) => {
    return (
      <div
        data-testid={`${testId}-wrapper`}
        className={`relative h-12 w-full bg-sb-white rounded-full border border-sb-border flex items-center px-4 shadow-e1 focus-within:border-sb-navy transition-colors ${className}`}
      >
        <Search className="w-5 h-5 text-sb-ink-3 flex-shrink-0 mr-3" strokeWidth={1.5} />
        <input
          ref={ref}
          type="text"
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          data-testid={testId}
          className="w-full bg-transparent text-callout text-sb-ink placeholder:text-sb-ink-3 focus:outline-none"
          {...props}
        />
        {showFilter && (
          <button
            type="button"
            data-testid={`${testId}-filter-button`}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onFilterClick?.();
            }}
            aria-label="Filter"
            className="w-11 h-11 -mr-2 rounded-full flex items-center justify-center text-sb-ink-2 hover:text-sb-navy hover:bg-sb-navy-tint transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-sb-navy"
          >
            <SlidersHorizontal className="w-5 h-5" strokeWidth={1.5} />
          </button>
        )}
      </div>
    );
  }
);

SearchField.displayName = 'SearchField';
