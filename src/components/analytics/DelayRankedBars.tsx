'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useProjectStore } from '@/store/project';
import { DelayCause } from '@/services/types';
import { ChevronRight, AlertTriangle } from 'lucide-react';

export const DelayRankedBars: React.FC = () => {
  const router = useRouter();
  const delayCauses = useProjectStore((s) => s.delayCauses);
  const [period, setPeriod] = useState<'7d' | '30d' | 'all'>('30d');

  // Filter or scale based on period
  const multiplier = period === '7d' ? 0.35 : period === '30d' ? 1 : 1.4;

  const maxDays = Math.max(...delayCauses.map((d) => Math.round(d.daysLost * multiplier)), 1);

  const handleRowClick = (cause: DelayCause) => {
    const slug = encodeURIComponent(cause.category);
    router.push(`/delays/${slug}`);
  };

  return (
    <div className="bg-white rounded-card border border-sb-border p-4 shadow-e1">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-body font-semibold text-sb-ink">Ranked Delay Drivers</h3>
          <p className="text-caption text-sb-text-muted">Impact on schedule execution</p>
        </div>

        {/* Period Toggle */}
        <div className="inline-flex rounded-lg border border-sb-border p-0.5 bg-sb-bg-subtle text-caption font-medium">
          {(['7d', '30d', 'all'] as const).map((p) => (
            <button
              key={p}
              type="button"
              data-testid={`delay-period-${p}`}
              onClick={() => setPeriod(p)}
              className={`px-2 py-1 rounded-md uppercase transition-colors ${
                period === p
                  ? 'bg-sb-navy text-white shadow-sm'
                  : 'text-sb-text-subtle hover:text-sb-ink'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {delayCauses.map((cause) => {
          const days = Math.max(1, Math.round(cause.daysLost * multiplier));
          const eventsCount = Math.max(1, Math.round(cause.eventsCount * multiplier));
          const barPercent = Math.min(100, Math.round((days / maxDays) * 100));

          return (
            <div
              key={cause.category}
              data-testid={`delay-row-${cause.category.replace(/[^a-zA-Z0-9]/g, '-')}`}
              onClick={() => handleRowClick(cause)}
              className="group p-2.5 -mx-2 rounded-lg hover:bg-sb-bg cursor-pointer transition-colors border border-transparent hover:border-sb-border"
            >
              <div className="flex items-center justify-between text-caption mb-1.5">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sb-ink group-hover:text-sb-navy">
                    {cause.category}
                  </span>
                  {cause.isCriticalPath && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-red-700 bg-red-50 border border-red-200 px-1.5 py-0.5 rounded">
                      <AlertTriangle className="w-2.5 h-2.5" />
                      Critical path
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-mono-s font-semibold text-sb-ink">
                    {days} {days === 1 ? 'day' : 'days'} lost
                  </span>
                  <span className="text-mono-s text-sb-text-subtle">
                    ({eventsCount} {eventsCount === 1 ? 'event' : 'events'})
                  </span>
                  <ChevronRight className="w-4 h-4 text-sb-text-subtle group-hover:text-sb-navy" />
                </div>
              </div>

              {/* Progress bar */}
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    cause.isCriticalPath ? 'bg-red-600' : 'bg-sb-navy'
                  }`}
                  style={{ width: `${barPercent}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
