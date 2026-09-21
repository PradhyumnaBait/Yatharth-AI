'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertTriangle, TrendingUp, Brain, ArrowRight, ShieldAlert } from 'lucide-react';
import { ProjectCard } from '@/components/domain/ProjectCard';
import { Button } from '@/components/ui/Button';
import { useProjectStore, useActiveProject, useSPI, useTruthGap } from '@/store/project';

export type PmPill = 'all' | 'progress' | 'delays' | 'memory';

interface PmHomeProps {
  activePill: PmPill;
}

export const PmHome: React.FC<PmHomeProps> = ({ activePill }) => {
  const router = useRouter();
  const project = useActiveProject();
  const phases = useProjectStore((state) => state.phases);
  const delayCauses = useProjectStore((state) => state.delayCauses);
  const memoryInsights = useProjectStore((state) => state.memoryInsights);
  const { spi, verified, planned } = useSPI();
  const { reported, gap } = useTruthGap();

  const [delayPeriod, setDelayPeriod] = useState<'7d' | '30d'>('30d');

  if (activePill === 'progress') {
    return (
      <div data-testid="pm-progress-body" className="px-4 py-2 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-title-3 font-bold text-sb-navy">Executive S-Curve & Variance</h2>
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push('/analytics?tab=progress')}
          >
            Full Analytics ›
          </Button>
        </div>

        {/* Mini S-Curve summary card */}
        <div className="bg-sb-white rounded-[16px] p-4 border border-sb-border shadow-e1">
          <div className="grid grid-cols-3 gap-2 text-center pb-3 border-b border-sb-border">
            <div>
              <div className="text-caption text-sb-ink-3">Verified</div>
              <div className="text-num-m font-bold text-sb-navy">{verified}%</div>
            </div>
            <div>
              <div className="text-caption text-sb-ink-3">Planned</div>
              <div className="text-num-m font-bold text-sb-navy">{planned}%</div>
            </div>
            <div>
              <div className="text-caption text-sb-ink-3">SPI</div>
              <div className="text-num-m font-bold text-sb-review">{spi}</div>
            </div>
          </div>

          <div className="pt-3 text-caption text-sb-ink-2">
            Schedule is trailing baseline by <span className="font-bold text-sb-critical">6 percentage points</span>. Primary drag: Trenching & Welding permits.
          </div>
        </div>

        {/* Phase progress table */}
        <div className="bg-sb-white rounded-[16px] p-4 border border-sb-border shadow-e1">
          <div className="text-callout font-semibold text-sb-navy mb-3">Phase Status</div>
          <div className="space-y-3">
            {phases.slice(0, 5).map((ph) => (
              <div key={ph.id} className="text-caption">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-sb-navy">{ph.name}</span>
                  <span>{ph.verified}% / {ph.planned}%</span>
                </div>
                <div className="relative w-full h-1.5 bg-sb-border rounded-full overflow-hidden">
                  <div
                    className="h-full bg-sb-navy rounded-full"
                    style={{ width: `${ph.verified}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (activePill === 'delays') {
    return (
      <div data-testid="pm-delays-body" className="px-4 py-2 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-title-3 font-bold text-sb-navy">Ranked Delay Causes</h2>
          <div className="flex bg-sb-navy-tint rounded-full p-0.5 text-caption">
            <button
              type="button"
              onClick={() => setDelayPeriod('7d')}
              className={`px-3 py-1 rounded-full ${delayPeriod === '7d' ? 'bg-sb-navy text-sb-white font-semibold' : 'text-sb-ink-2'}`}
            >
              7d
            </button>
            <button
              type="button"
              onClick={() => setDelayPeriod('30d')}
              className={`px-3 py-1 rounded-full ${delayPeriod === '30d' ? 'bg-sb-navy text-sb-white font-semibold' : 'text-sb-ink-2'}`}
            >
              30d
            </button>
          </div>
        </div>

        <div className="space-y-2.5">
          {delayCauses.map((cause, idx) => {
            const causeKey = cause.id || cause.category.toLowerCase().replace(/\s+/g, '-');
            return (
              <div
                key={causeKey}
                data-testid={`delay-cause-${causeKey}`}
                onClick={() => router.push('/delays')}
                className="bg-sb-white rounded-[16px] p-4 border border-sb-border shadow-e1 hover:border-sb-navy/30 cursor-pointer transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-num-s font-bold text-sb-navy">
                      #{idx + 1}
                    </span>
                    <div className="text-callout font-semibold text-sb-navy">
                      {cause.category}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-mono text-num-m font-bold text-sb-critical">
                      {cause.daysLost}d
                    </span>
                    <div className="text-[11px] text-sb-ink-3">days lost</div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-caption text-sb-ink-2 pt-2 border-t border-sb-border">
                  <span>{cause.eventsCount} reported events</span>
                  {cause.isCriticalPath && (
                    <span className="text-[11px] font-semibold text-sb-critical bg-sb-critical/10 px-2 py-0.5 rounded">
                      On Critical Path
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  if (activePill === 'memory') {
    return (
      <div data-testid="pm-memory-body" className="px-4 py-2 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-title-3 font-bold text-sb-navy">Project Memory Insights</h2>
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push('/analytics?tab=memory')}
          >
            All Insights ›
          </Button>
        </div>

        <div className="space-y-3">
          {memoryInsights.map((insight) => (
            <div
              key={insight.id}
              data-testid={`memory-card-${insight.id}`}
              onClick={() => router.push('/analytics?tab=memory')}
              className="bg-sb-white rounded-[16px] p-4 border border-sb-border shadow-e1 hover:border-sb-navy/30 cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-2 text-sb-navy font-semibold text-caption mb-1">
                <Brain className="w-4 h-4 text-sb-navy" />
                <span>Historical Benchmarking</span>
              </div>
              <div className="text-callout font-bold text-sb-navy mb-2">
                {insight.title}
              </div>
              <p className="text-caption text-sb-ink-2 mb-3">
                {insight.insight || insight.recommendation}
              </p>
              <div className="text-[11px] text-sb-ink-3 pt-2 border-t border-sb-border">
                Based on {insight.sampleSize} activities
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Default: 'all' pill
  return (
    <div data-testid="pm-all-body" className="space-y-4 pb-2">
      {/* Active Project Card with planned marker at 74% */}
      <section className="px-4">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-title-3 font-bold text-sb-navy">Active Project</h2>
          <button
            type="button"
            onClick={() => router.push('/select-project')}
            className="text-caption font-semibold text-sb-navy hover:underline"
          >
            See All
          </button>
        </div>

        <ProjectCard
          title={project?.name || 'Kandla–Panipat Pipeline — Package 3'}
          progress={verified}
          plannedProgress={planned}
          dataDate={project?.dataDate || '20 Sep 2026'}
          activeActivitiesCount={14}
          imageSrc="/images/refinery-pipes.jpg"
          onClick={() => router.push('/analytics')}
        />
      </section>

      {/* Truth Gap Alert Card */}
      <section className="px-4">
        <div
          data-testid="truth-gap-card"
          onClick={() => router.push('/analytics?tab=truth-gap')}
          className="bg-sb-white rounded-[20px] p-4 border border-sb-review/40 shadow-e1 cursor-pointer hover:border-sb-navy/30 transition-colors"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-sb-review font-bold text-callout">
              <ShieldAlert className="w-5 h-5 text-sb-review flex-shrink-0" />
              <span>Truth Gap Alert</span>
            </div>
            <span className="font-mono text-mono-s font-semibold bg-sb-review/15 text-sb-ink px-2.5 py-1 rounded-full">
              {gap} pts gap
            </span>
          </div>

          <div className="text-callout font-bold text-sb-navy mb-1">
            DPR-reported {reported}% vs Verified {verified}%
          </div>
          <p className="text-caption text-sb-ink-2 mb-3">
            Contractor DPR progress runs {gap} points ahead of verified field evidence. Tap to see unverified claims.
          </p>

          <div className="flex items-center justify-end text-caption font-semibold text-sb-navy gap-1">
            <span>Inspect Truth Gap</span>
            <ArrowRight className="w-4 h-4" />
          </div>
        </div>
      </section>

      {/* Top Delay Causes */}
      <section className="px-4">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-title-3 font-bold text-sb-navy">Top Delay Causes</h2>
          <button
            type="button"
            data-testid="see-all-delays-btn"
            onClick={() => router.push('/delays')}
            className="text-caption font-semibold text-sb-navy hover:underline"
          >
            See All
          </button>
        </div>

        <div className="bg-sb-white rounded-[20px] p-2 border border-sb-border shadow-e1 divide-y divide-sb-border">
          {delayCauses.slice(0, 3).map((cause, idx) => {
            const causeKey = cause.id || cause.category.toLowerCase().replace(/\s+/g, '-');
            return (
              <div
                key={causeKey}
                data-testid={`top-delay-${causeKey}`}
                onClick={() => router.push('/delays')}
                className="p-3 flex items-center justify-between hover:bg-sb-navy-tint/40 cursor-pointer rounded-[12px] transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="w-6 h-6 rounded-full bg-sb-critical/10 text-sb-critical font-bold font-mono text-caption flex items-center justify-center flex-shrink-0">
                    {idx + 1}
                  </span>
                <div className="min-w-0">
                  <div className="text-callout font-semibold text-sb-navy truncate">
                    {cause.category}
                  </div>
                  <div className="text-caption text-sb-ink-3">
                    {cause.eventsCount} reports • {cause.isCriticalPath ? 'Critical path' : 'Near critical'}
                  </div>
                </div>
              </div>

              <div className="text-right flex-shrink-0">
                <span className="font-mono text-num-s font-bold text-sb-critical">
                  -{cause.daysLost}d
                </span>
              </div>
            </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
