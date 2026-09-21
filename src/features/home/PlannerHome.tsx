'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { AlertTriangle, FileSpreadsheet, FileText, ArrowRight, Upload, Clock } from 'lucide-react';
import { ProjectCard } from '@/components/domain/ProjectCard';
import { FreshnessClock } from '@/components/domain/FreshnessClock';
import { ConfidenceBadge } from '@/components/domain/ConfidenceBadge';
import { StatusPill } from '@/components/ui/StatusPill';
import { Button } from '@/components/ui/Button';
import { useEventsStore } from '@/store/events';
import { useProjectStore, useActiveProject } from '@/store/project';

export type PlannerPill = 'all' | 'queue' | 'alerts' | 'imports';

interface PlannerHomeProps {
  activePill: PlannerPill;
}

export const PlannerHome: React.FC<PlannerHomeProps> = ({ activePill }) => {
  const router = useRouter();
  const project = useActiveProject();
  const events = useEventsStore((state) => state.events);

  // Review queue: all pending items (Review + Unmatched)
  const queueEvents = events.filter((e) => e.status === 'Review' || e.status === 'Unmatched');

  // Top 3 priority items: warnings first, then lowest confidence
  const priorityItems = [...queueEvents].sort((a, b) => {
    if (a.queueTier === 'Warning' && b.queueTier !== 'Warning') return -1;
    if (b.queueTier === 'Warning' && a.queueTier !== 'Warning') return 1;
    return a.confidence - b.confidence;
  }).slice(0, 3);

  // Warning / alert events
  const alertEvents = events.filter(
    (e) => e.queueTier === 'Warning' || e.id === 'E-2093' || e.id === 'E-2097' || e.id === 'E-2098'
  );

  if (activePill === 'queue') {
    return (
      <div data-testid="planner-queue-body" className="px-4 py-2 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-title-3 font-bold text-sb-navy">
            Workbench Queue ({queueEvents.length})
          </h2>
          <span className="text-caption text-sb-ink-3">Triage Priority</span>
        </div>

        <div className="space-y-2.5">
          {queueEvents.slice(0, 8).map((evt) => (
            <div
              key={evt.id}
              data-testid={`queue-item-${evt.id}`}
              onClick={() => router.push(`/workbench/${evt.id}`)}
              className="bg-sb-white rounded-[16px] p-4 border border-sb-border shadow-e1 hover:border-sb-navy/30 cursor-pointer transition-colors"
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-mono-s font-semibold text-sb-navy bg-sb-navy-tint px-2 py-0.5 rounded">
                      {evt.suggestedActivityId}
                    </span>
                    <span className="text-caption font-medium text-sb-ink-2 truncate">
                      {evt.suggestedActivityName}
                    </span>
                  </div>
                  <div className="text-caption text-sb-ink-3 mt-1 line-clamp-1">
                    &ldquo;{evt.rawText}&rdquo;
                  </div>
                </div>
                <ConfidenceBadge confidence={evt.confidence} />
              </div>

              <div className="flex items-center justify-between text-caption text-sb-ink-3 pt-2 border-t border-sb-border">
                <div className="flex items-center gap-2">
                  <span>{evt.timestamp}</span>
                  <span>•</span>
                  <span>{evt.authorName}</span>
                </div>
                <StatusPill status={evt.status} />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (activePill === 'alerts') {
    return (
      <div data-testid="planner-alerts-body" className="px-4 py-2 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-title-3 font-bold text-sb-navy">Schedule Logic Alerts</h2>
          <span className="text-caption text-sb-critical font-medium">Action Required</span>
        </div>

        <div className="space-y-3">
          {/* Out of sequence alert (E-2093) */}
          <div
            data-testid="alert-card-oos"
            className="bg-sb-white rounded-[16px] p-4 border border-sb-review/40 shadow-e1 bg-sb-review/5"
          >
            <div className="flex items-center gap-2 text-sb-review text-callout font-bold mb-1">
              <AlertTriangle className="w-5 h-5 text-sb-review flex-shrink-0" />
              <span>Out-of-Sequence Warning</span>
            </div>
            <p className="text-callout text-sb-ink font-medium mb-1">
              PIP-24-017 is not complete. Approving starts PIP-24-018 out of sequence (Retained Logic).
            </p>
            <div className="text-caption text-sb-ink-3 mb-3">
              Event E-2093 • 24XX-SP-012 Coating 100% • Contractor B
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push('/workbench/E-2093')}
            >
              Open in Workbench
            </Button>
          </div>

          {/* Conflict alert (E-2097 vs E-2098) */}
          <div
            data-testid="alert-card-conflict"
            className="bg-sb-white rounded-[16px] p-4 border border-sb-critical/40 shadow-e1 bg-sb-critical/5"
          >
            <div className="flex items-center gap-2 text-sb-critical text-callout font-bold mb-1">
              <AlertTriangle className="w-5 h-5 text-sb-critical flex-shrink-0" />
              <span>Conflicting Reports Conflict</span>
            </div>
            <p className="text-callout text-sb-ink font-medium mb-1">
              Two contractors report 100% on PIP-24-010 on different dates.
            </p>
            <div className="text-caption text-sb-ink-3 mb-3">
              E-2097 (Sterling) vs E-2098 (Punj Lloyd) • Joint Stringing
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push('/workbench/E-2097')}
            >
              Resolve Conflict
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (activePill === 'imports') {
    return (
      <div data-testid="planner-imports-body" className="px-4 py-2 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-title-3 font-bold text-sb-navy">Recent Ingest & Imports</h2>
          <Button
            variant="primary"
            size="sm"
            onClick={() => router.push('/ingest/excel')}
            className="gap-1"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>New Import</span>
          </Button>
        </div>

        <div className="space-y-2.5">
          <div className="bg-sb-white rounded-[16px] p-4 border border-sb-border shadow-e1">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-[12px] bg-sb-navy text-sb-white flex items-center justify-center font-bold text-xs">
                XER
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-callout font-semibold text-sb-navy truncate">
                  P6 Baseline v3 (.xer)
                </div>
                <div className="text-caption text-sb-ink-3">
                  198 activities • 284 relationships • Retained Logic
                </div>
              </div>
              <span className="text-caption text-sb-ink-3">12 Sep</span>
            </div>
          </div>

          <div className="bg-sb-white rounded-[16px] p-4 border border-sb-border shadow-e1">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-[12px] bg-sb-navy-tint text-sb-navy flex items-center justify-center">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-callout font-semibold text-sb-navy truncate">
                  DPR_Contractor_B_20Sep.xlsx
                </div>
                <div className="text-caption text-sb-ink-3">
                  42 rows: 31 auto-matched • 9 review • 2 unmatched
                </div>
              </div>
              <span className="text-caption text-sb-ink-3">Today 07:30</span>
            </div>
          </div>

          <div className="bg-sb-white rounded-[16px] p-4 border border-sb-border shadow-e1">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-[12px] bg-sb-navy-tint text-sb-navy flex items-center justify-center">
                <FileText className="w-5 h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-callout font-semibold text-sb-navy truncate">
                  Daily_Progress_Package3.pdf
                </div>
                <div className="text-caption text-sb-ink-3">
                  14 statements extracted • 2 check tags
                </div>
              </div>
              <span className="text-caption text-sb-ink-3">Today 06:45</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Default: 'all' pill
  return (
    <div data-testid="planner-all-body" className="space-y-4 pb-2">
      {/* Active Project Card with Freshness Clock replacing Activities count */}
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
          progress={project?.physicalProgress ?? 68}
          plannedProgress={project?.plannedProgress ?? 74}
          dataDate={project?.dataDate || '20 Sep 2026'}
          metaRightContent={
            <div className="flex items-center gap-1.5">
              <FreshnessClock prefix="Freshness:" />
            </div>
          }
          imageSrc="/images/refinery-pipes.jpg"
          onClick={() => router.push('/schedule')}
        />
      </section>

      {/* Needs Your Review Priority List */}
      <section className="px-4">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-title-3 font-bold text-sb-navy">Needs Your Review</h2>
          <button
            type="button"
            data-testid="see-all-review-btn"
            onClick={() => router.push('/workbench')}
            className="text-caption font-semibold text-sb-navy hover:underline"
          >
            See All
          </button>
        </div>

        <div className="space-y-2.5">
          {priorityItems.map((item) => {
            const isWarning = item.queueTier === 'Warning';
            return (
              <div
                key={item.id}
                data-testid={`review-card-${item.id}`}
                className={`bg-sb-white rounded-[16px] p-4 border shadow-e1 transition-all ${
                  isWarning ? 'border-sb-review/50 bg-sb-review/5' : 'border-sb-border'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-mono-s font-semibold text-sb-navy bg-sb-navy-tint px-2 py-0.5 rounded">
                        {item.suggestedActivityId}
                      </span>
                      {isWarning && (
                        <span className="text-[11px] font-semibold text-sb-review flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" /> Logic Warning
                        </span>
                      )}
                    </div>
                    <div className="text-callout font-semibold text-sb-navy truncate">
                      {item.suggestedActivityName}
                    </div>
                  </div>
                  <ConfidenceBadge confidence={item.confidence} />
                </div>

                <p className="text-caption text-sb-ink-2 line-clamp-1 mb-3">
                  &ldquo;{item.rawText}&rdquo;
                </p>

                <div className="flex items-center justify-between pt-2 border-t border-sb-border/70">
                  <div className="text-caption text-sb-ink-3">
                    {item.authorName} • {item.timestamp}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    data-testid={`review-match-btn-${item.id}`}
                    onClick={() => router.push(`/workbench/${item.id}`)}
                    className="h-8 py-0 px-3 text-xs"
                  >
                    Review Match ›
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
