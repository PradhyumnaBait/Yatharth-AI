'use client';

import React from 'react';
import { ArrowRight, ExternalLink } from 'lucide-react';

export interface ScheduleNode {
  id: string; // e.g. "PIP-24-016"
  name: string; // e.g. "Install Pipe"
  status: 'complete' | 'active' | 'not-started';
  selected?: boolean;
}

export interface ScheduleContextProps {
  nodes?: ScheduleNode[];
  onNodeClick?: (node: ScheduleNode) => void;
  onViewInP6Click?: () => void;
  className?: string;
  'data-testid'?: string;
}

export const ScheduleContext: React.FC<ScheduleContextProps> = ({
  nodes = [
    { id: 'PIP-24-016', name: 'Install Pipe', status: 'complete' },
    { id: 'PIP-24-017', name: 'Weld Piping System 24-XX', status: 'active', selected: true },
    { id: 'PIP-24-018', name: 'NDT & Coating', status: 'not-started' },
  ],
  onNodeClick,
  onViewInP6Click,
  className = '',
  'data-testid': testId = 'schedule-context',
}) => {
  return (
    <div
      data-testid={testId}
      className={`w-full p-4 rounded-[16px] bg-sb-white border border-sb-border shadow-e1 ${className}`}
    >
      {/* Header with "View in P6" */}
      <div className="flex items-center justify-between mb-3">
        <div className="text-caption font-semibold text-sb-navy">
          Schedule Context
        </div>
        <button
          type="button"
          data-testid={`${testId}-view-p6`}
          onClick={onViewInP6Click}
          className="inline-flex items-center gap-1 text-caption text-sb-navy font-semibold hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-sb-navy"
        >
          <span>View in P6</span>
          <ExternalLink className="w-3 h-3 text-sb-ink-3" strokeWidth={1.5} />
        </button>
      </div>

      {/* Baseline Sub-label */}
      <div className="font-mono text-[11px] text-sb-ink-3 mb-3">
        Baseline: P6 XER v3, imported 12 Sep 2026
      </div>

      {/* Nodes Container */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
        {nodes.map((node, idx) => {
          const isSelected = node.selected;
          const isLast = idx === nodes.length - 1;

          let dotClass = 'bg-sb-verified';
          if (node.status === 'active') dotClass = 'bg-sb-review';
          if (node.status === 'not-started') dotClass = 'bg-sb-border';

          return (
            <React.Fragment key={node.id}>
              <div
                onClick={() => onNodeClick?.(node)}
                role="button"
                tabIndex={0}
                data-testid={`${testId}-node-${node.id}`}
                className={`flex-1 p-2.5 rounded-[12px] border text-left cursor-pointer transition-all active:scale-[0.98] ${
                  isSelected
                    ? 'bg-sb-navy text-sb-white border-sb-navy shadow-e2'
                    : 'bg-sb-bg text-sb-ink border-sb-border hover:border-sb-navy/30'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span
                    className={`font-mono text-mono-s font-semibold ${
                      isSelected ? 'text-sb-white' : 'text-sb-navy'
                    }`}
                  >
                    {node.id}
                  </span>
                  <span className={`w-2 h-2 rounded-full ${dotClass}`} />
                </div>
                <div
                  className={`text-caption line-clamp-1 ${
                    isSelected ? 'text-sb-white/90' : 'text-sb-ink-2'
                  }`}
                >
                  {node.name}
                </div>
              </div>

              {!isLast && (
                <div className="hidden sm:flex items-center justify-center text-sb-ink-3 px-1">
                  <ArrowRight className="w-3.5 h-3.5" strokeWidth={1.5} />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
