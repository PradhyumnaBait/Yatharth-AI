'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useActiveProject, useProjectStore } from '@/store/project';
import { FreshnessClock } from '@/components/domain/FreshnessClock';
import { Sheet } from '@/components/ui/Sheet';
import {
  Calendar,
  Clock,
  TrendingDown,
  AlertTriangle,
  ChevronRight,
  ShieldAlert,
  ArrowRight,
} from 'lucide-react';
import { DelayCause } from '@/services/types';

export interface ProjectOverviewTabProps {
  onSelectPhase: (phaseName: string) => void;
}

export const ProjectOverviewTab: React.FC<ProjectOverviewTabProps> = ({ onSelectPhase }) => {
  const router = useRouter();
  const project = useActiveProject();
  const phases = useProjectStore((s) => s.phases);
  const delayCauses = useProjectStore((s) => s.delayCauses);

  const [selectedDelay, setSelectedDelay] = useState<DelayCause | null>(null);

  const physicalProgress = project?.physicalProgress ?? 68;
  const plannedProgress = project?.plannedProgress ?? 74;
  const variance = physicalProgress - plannedProgress; // -6%
  const latestDelays = delayCauses.slice(0, 3);

  return (
    <div className="space-y-4" data-testid="project-overview-tab">
      {/* 1. S-Curve / Physical Progress Card */}
      <div className="bg-sb-white rounded-2xl p-4 border border-sb-border shadow-e1 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-caption font-semibold uppercase tracking-wider text-sb-ink-3">
              Physical Progress
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-[32px] font-bold text-sb-navy tabular-nums" data-testid="overview-physical-percent">
                {physicalProgress}%
              </span>
              <span className="text-caption font-medium text-sb-critical" data-testid="overview-variance">
                {variance}% vs planned
              </span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-caption text-sb-ink-3">Planned</div>
            <div className="text-callout font-bold text-sb-ink-2 tabular-nums" data-testid="overview-planned-percent">
              {plannedProgress}%
            </div>
          </div>
        </div>

        {/* Dual Progress Bar with Planned Marker */}
        <div className="relative pt-1 pb-4">
          <div className="relative w-full h-3 bg-sb-bg rounded-full overflow-hidden border border-sb-border">
            <div
              className="h-full bg-sb-navy rounded-full transition-all duration-500"
              style={{ width: `${physicalProgress}%` }}
              data-testid="overview-progress-fill"
            />
          </div>

          {/* Planned Marker Notch */}
          <div
            className="absolute top-0 bottom-3 w-0.5 bg-sb-critical pointer-events-none"
            style={{ left: `${plannedProgress}%` }}
            title={`Planned: ${plannedProgress}%`}
            data-testid="overview-planned-marker"
          >
            <div className="absolute -top-1 -left-1 w-2.5 h-2.5 rounded-full bg-sb-critical ring-2 ring-sb-white" />
            <span className="absolute top-4 -left-6 text-[10px] font-mono text-sb-critical whitespace-nowrap font-medium">
              Plan {plannedProgress}%
            </span>
          </div>
        </div>

        {/* Metric strip: Data Date, Freshness, Forecast vs Planned Finish */}
        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-sb-border/70 text-center">
          <div className="p-2 rounded-xl bg-sb-bg/80 border border-sb-border/60">
            <div className="text-[11px] text-sb-ink-3 flex items-center justify-center gap-1">
              <Calendar className="w-3 h-3" />
              <span>Data Date</span>
            </div>
            <div className="text-caption font-bold text-sb-navy font-mono mt-0.5" data-testid="overview-data-date">
              {project?.dataDate || '20 Sep 2026'}
            </div>
          </div>

          <div className="p-2 rounded-xl bg-sb-bg/80 border border-sb-border/60">
            <div className="text-[11px] text-sb-ink-3 flex items-center justify-center gap-1">
              <Clock className="w-3 h-3" />
              <span>Freshness</span>
            </div>
            <div className="text-caption font-bold text-sb-navy mt-0.5" data-testid="overview-freshness">
              <FreshnessClock showIcon={false} prefix="" className="font-mono text-caption font-bold text-sb-navy" />
            </div>
          </div>

          <div className="p-2 rounded-xl bg-sb-bg/80 border border-sb-border/60">
            <div className="text-[11px] text-sb-ink-3 flex items-center justify-center gap-1">
              <TrendingDown className="w-3 h-3 text-sb-critical" />
              <span>Finish Slip</span>
            </div>
            <div className="text-caption font-bold text-sb-critical font-mono mt-0.5" data-testid="overview-finish-variance">
              +9d (24 Nov)
            </div>
          </div>
        </div>
      </div>

      {/* 2. Phase Progress Breakdown */}
      <div className="bg-sb-white rounded-2xl p-4 border border-sb-border shadow-e1 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-callout font-bold text-sb-navy">
            Execution Phases
          </h2>
          <span className="text-[11px] text-sb-ink-3">Tap to filter activities</span>
        </div>

        <div className="divide-y divide-sb-border/60" data-testid="phase-list">
          {phases.map((phase) => {
            const isBehind = phase.verified < phase.planned;
            return (
              <button
                key={phase.id}
                type="button"
                data-testid={`phase-item-${phase.id}`}
                onClick={() => onSelectPhase(phase.name)}
                className="w-full py-2.5 flex items-center justify-between gap-3 text-left hover:bg-sb-bg/60 active:bg-sb-navy-tint rounded-lg px-2 -mx-2 transition-colors group"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between text-caption">
                    <span className="font-semibold text-sb-navy group-hover:text-sb-navy truncate">
                      {phase.name}
                    </span>
                    <span className="font-mono text-sb-ink-2 font-medium">
                      {phase.verified}% <span className="text-sb-ink-3 font-normal">/ {phase.planned}%</span>
                    </span>
                  </div>

                  <div className="w-full h-1.5 bg-sb-bg rounded-full overflow-hidden mt-1.5 border border-sb-border/40">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        phase.verified === 100
                          ? 'bg-sb-verified'
                          : isBehind
                          ? 'bg-sb-navy'
                          : 'bg-sb-navy'
                      }`}
                      style={{ width: `${phase.verified}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-1 text-sb-ink-3 group-hover:text-sb-navy flex-shrink-0">
                  <span className="text-[11px] font-mono opacity-80">{phase.weight}% wt</span>
                  <ChevronRight className="w-4 h-4" />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Latest 3 Delay Alerts */}
      <div className="bg-sb-white rounded-2xl p-4 border border-sb-border shadow-e1 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-sb-critical" />
            <h2 className="text-callout font-bold text-sb-navy">
              Latest Delay Alerts
            </h2>
          </div>
          <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-sb-critical-tint text-sb-critical-ink font-semibold">
            3 Active
          </span>
        </div>

        <div className="space-y-2.5" data-testid="delay-alerts-list">
          {latestDelays.map((cause, idx) => (
            <button
              key={cause.category}
              type="button"
              data-testid={`delay-alert-${idx}`}
              onClick={() => setSelectedDelay(cause)}
              className="w-full p-3 rounded-xl border border-sb-border bg-sb-bg/50 hover:bg-sb-bg active:bg-sb-navy-tint text-left transition-colors flex items-start justify-between gap-3 group"
            >
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-caption font-bold text-sb-navy truncate">
                    {cause.category}
                  </span>
                  {cause.isCriticalPath && (
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-sb-critical text-sb-white font-medium">
                      CRITICAL PATH
                    </span>
                  )}
                </div>
                <div className="text-[12px] text-sb-ink-2 truncate">
                  Impact: <strong className="text-sb-critical font-mono">+{cause.daysLost} days lost</strong> across {cause.eventsCount} events
                </div>
                {cause.criticalActivityId && (
                  <div className="text-[11px] font-mono text-sb-ink-3 truncate">
                    Activity: {cause.criticalActivityId} · {cause.criticalActivityName}
                  </div>
                )}
              </div>
              <ChevronRight className="w-4 h-4 text-sb-ink-3 group-hover:text-sb-navy mt-1 flex-shrink-0" />
            </button>
          ))}
        </div>
      </div>

      {/* Delay Detail Sheet */}
      <Sheet
        open={Boolean(selectedDelay)}
        onOpenChange={(open) => !open && setSelectedDelay(null)}
        title={selectedDelay ? `Delay Impact: ${selectedDelay.category}` : 'Delay Detail'}
        description={selectedDelay?.isCriticalPath ? 'Critical path variance alert' : 'Sub-critical variance'}
        data-testid="delay-detail-sheet"
      >
        {selectedDelay && (
          <div className="p-4 space-y-4">
            <div className="bg-sb-bg p-3.5 rounded-xl border border-sb-border space-y-2.5">
              <div className="flex justify-between items-center text-caption py-1 border-b border-sb-border/60">
                <span className="text-sb-ink-3">Category</span>
                <span className="font-semibold text-sb-navy">{selectedDelay.category}</span>
              </div>
              <div className="flex justify-between items-center text-caption py-1 border-b border-sb-border/60">
                <span className="text-sb-ink-3">Days Lost</span>
                <span className="font-mono font-bold text-sb-critical">+{selectedDelay.daysLost} days</span>
              </div>
              <div className="flex justify-between items-center text-caption py-1 border-b border-sb-border/60">
                <span className="text-sb-ink-3">Reported Events</span>
                <span className="font-mono text-sb-ink">{selectedDelay.eventsCount} field reports</span>
              </div>
              <div className="flex justify-between items-center text-caption py-1">
                <span className="text-sb-ink-3">Critical Path Impact</span>
                <span className={`font-semibold ${selectedDelay.isCriticalPath ? 'text-sb-critical' : 'text-sb-ink-2'}`}>
                  {selectedDelay.isCriticalPath ? 'Yes (Float consumed)' : 'No (Buffer available)'}
                </span>
              </div>
            </div>

            {selectedDelay.criticalActivityId && (
              <div className="p-3 bg-sb-white rounded-xl border border-sb-border space-y-2">
                <div className="text-[11px] uppercase tracking-wider text-sb-ink-3 font-semibold">
                  Affected Schedule Node
                </div>
                <div className="font-mono text-caption font-bold text-sb-navy">
                  {selectedDelay.criticalActivityId}
                </div>
                <div className="text-caption text-sb-ink-2">
                  {selectedDelay.criticalActivityName}
                </div>
                <button
                  type="button"
                  data-testid="delay-view-activity-btn"
                  onClick={() => {
                    const id = selectedDelay.criticalActivityId;
                    setSelectedDelay(null);
                    router.push(`/activity/${id}`);
                  }}
                  className="w-full mt-2 py-2 px-3 rounded-lg bg-sb-navy text-sb-white text-caption font-semibold flex items-center justify-center gap-1.5 active:bg-sb-navy-pressed"
                >
                  <span>View Activity in S4</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        )}
      </Sheet>
    </div>
  );
};
