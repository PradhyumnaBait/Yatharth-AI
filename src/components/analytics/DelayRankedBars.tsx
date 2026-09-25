'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useProjectStore } from '@/store/project';
import { DelayCause } from '@/services/types';
import { ChevronRight, AlertTriangle, ArrowUpRight, ChevronDown, Info } from 'lucide-react';

export const DelayRankedBars: React.FC = () => {
  const router = useRouter();
  const delayCauses = useProjectStore((s) => s.delayCauses);
  const [period, setPeriod] = useState<'7d' | '30d' | 'all'>('30d');
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  // Filter or scale based on period
  const multiplier = period === '7d' ? 0.35 : period === '30d' ? 1 : 1.4;
  const maxDays = Math.max(...delayCauses.map((d) => Math.round(d.daysLost * multiplier)), 1);

  const handleRowClick = (cause: DelayCause) => {
    const slug = encodeURIComponent(cause.category);
    router.push(`/delays/${slug}`);
  };

  const handleToggleExpand = (category: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedCategory(expandedCategory === category ? null : category);
  };

  return (
    <div className="bg-white rounded-2xl border border-sb-border p-4 shadow-e1 animate-in fade-in duration-300">
      <div className="flex items-center justify-between mb-4 pb-2 border-b border-sb-border/60">
        <div>
          <h3 className="text-callout font-bold text-sb-navy">Ranked Delay Drivers</h3>
          <p className="text-[11px] text-sb-ink-3 font-mono">Pareto distribution of schedule slip</p>
        </div>

        {/* Period Toggle */}
        <div className="inline-flex rounded-full border border-sb-border p-0.5 bg-sb-bg-subtle text-caption font-medium">
          {(['7d', '30d', 'all'] as const).map((p) => (
            <button
              key={p}
              type="button"
              data-testid={`delay-period-${p}`}
              onClick={() => setPeriod(p)}
              className={`px-2.5 py-1 rounded-full uppercase text-[11px] font-mono font-bold transition-all ${
                period === p
                  ? 'bg-sb-navy text-white shadow-2xs'
                  : 'text-sb-ink-3 hover:text-sb-navy'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      <div className="text-[11px] text-sb-ink-3 font-mono mb-3 px-1 flex items-center justify-between">
        <span>Simple horizontal bars · Tap detail for breakdown</span>
        <span>{delayCauses.length} categories</span>
      </div>

      <div className="space-y-2.5">
        {delayCauses.map((cause) => {
          const days = Math.max(1, Math.round(cause.daysLost * multiplier));
          const eventsCount = Math.max(1, Math.round(cause.eventsCount * multiplier));
          const barPercent = Math.min(100, Math.round((days / maxDays) * 100));
          const isExpanded = expandedCategory === cause.category;

          return (
            <div
              key={cause.category}
              data-testid={`delay-row-${cause.category.replace(/[^a-zA-Z0-9]/g, '-')}`}
              onClick={() => handleRowClick(cause)}
              className="p-3 rounded-xl cursor-pointer transition-all border bg-white hover:bg-slate-50/80 border-sb-border/50 hover:border-sb-navy/30 group"
            >
              {/* Clean Pareto Horizontal Bar Item */}
              <div className="flex items-center justify-between text-caption mb-2">
                <span className="font-semibold text-sb-navy flex items-center gap-1.5 group-hover:underline">
                  {cause.category}
                  {cause.isCriticalPath && (
                    <span className="inline-block w-2 h-2 rounded-full bg-red-600" title="On critical path" />
                  )}
                </span>

                {/* Minimalist summary indicator + tap-to-reveal toggle */}
                <div className="flex items-center gap-2">
                  <span className="text-mono-s font-bold text-sb-navy">
                    {days}d
                  </span>

                  {/* Tap-to-reveal detail toggle button */}
                  <button
                    type="button"
                    title="Tap to reveal detail"
                    onClick={(e) => handleToggleExpand(cause.category, e)}
                    className="p-1 rounded-md text-sb-ink-3 hover:text-sb-navy hover:bg-sb-bg transition-colors"
                  >
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4 text-sb-navy" />
                    ) : (
                      <Info className="w-3.5 h-3.5" />
                    )}
                  </button>

                  <ChevronRight className="w-3.5 h-3.5 text-sb-ink-3 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>

              {/* Horizontal Bar */}
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ease-out ${
                    cause.isCriticalPath ? 'bg-red-600' : 'bg-sb-navy'
                  }`}
                  style={{ width: `${barPercent}%` }}
                />
              </div>

              {/* Tap-to-Reveal Forensic Detail */}
              {isExpanded && (
                <div
                  className="mt-3 pt-3 border-t border-sb-border/70 space-y-2 animate-in fade-in slide-in-from-top-1 duration-200"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center justify-between text-[11px] font-mono">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sb-navy bg-sb-navy-tint/60 px-2 py-0.5 rounded-full border border-sb-navy/15">
                        {days} {days === 1 ? 'day' : 'days'} schedule loss
                      </span>
                      <span className="text-sb-ink-3">
                        {eventsCount} {eventsCount === 1 ? 'field report' : 'field reports'}
                      </span>
                    </div>

                    {cause.isCriticalPath && (
                      <span className="inline-flex items-center gap-1 font-bold text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full">
                        <AlertTriangle className="w-3 h-3" />
                        Critical Path Driver
                      </span>
                    )}
                  </div>

                  <p className="text-caption text-sb-ink-2 bg-slate-50 p-2 rounded-lg border border-sb-border/60 leading-relaxed">
                    Recurring delay caused by {cause.category.toLowerCase()} impacting critical path progress across sector activities.
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
