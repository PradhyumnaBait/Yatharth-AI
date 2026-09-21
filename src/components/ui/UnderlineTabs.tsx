'use client';

import React from 'react';

export interface TabItem {
  id: string;
  label: string;
  count?: number;
}

export interface UnderlineTabsProps {
  tabs: TabItem[];
  activeId?: string;
  activeTab?: string;
  onChange: (id: string) => void;
  className?: string;
  'data-testid'?: string;
}

export const UnderlineTabs: React.FC<UnderlineTabsProps> = ({
  tabs,
  activeId,
  activeTab,
  onChange,
  className = '',
  'data-testid': testId = 'underline-tabs',
}) => {
  const currentActiveId = activeId ?? activeTab ?? tabs[0]?.id;

  return (
    <div
      data-testid={testId}
      className={`relative w-full border-b border-sb-border overflow-x-auto scrollbar-none ${className}`}
      role="tablist"
    >
      <div className="flex gap-6 min-w-max px-1">
        {tabs.map((tab) => {
          const isActive = tab.id === currentActiveId;
          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              data-testid={`${testId}-${tab.id}`}
              onClick={() => onChange(tab.id)}
              className={`relative py-3 text-callout font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-sb-navy focus-visible:outline-offset-2 ${
                isActive ? 'text-sb-navy font-semibold' : 'text-sb-ink-3 hover:text-sb-ink'
              }`}
            >
              <span className="inline-flex items-center gap-1.5">
                {tab.label}
                {typeof tab.count === 'number' && (
                  <span className={`text-caption px-1.5 py-0.2 rounded-full ${isActive ? 'bg-sb-navy-tint text-sb-navy' : 'bg-sb-bg text-sb-ink-3'}`}>
                    {tab.count}
                  </span>
                )}
              </span>
              {isActive && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-sb-navy rounded-t-full" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
