'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/shell/PageHeader';
import { PageContainer } from '@/components/shell/PageContainer';
import { StatusPill } from '@/components/ui/StatusPill';
import { useActivitiesStore } from '@/store/activities';
import { useAuthStore } from '@/store/auth';
import {
  Search,
  ChevronRight,
  ChevronDown,
  Layers,
  Calendar,
  AlertCircle,
  Clock,
  Filter,
} from 'lucide-react';
import { Activity } from '@/services/types';

function SchedulePageContent() {
  const router = useRouter();
  const { user } = useAuthStore();
  const activities = useActivitiesStore((s) => s.activities);

  // View modes
  const [viewMode, setViewMode] = useState<'list' | 'gantt'>('list');
  const [zoomLevel, setZoomLevel] = useState<'week' | 'month'>('week');

  // Filter toggles
  const [filterCritical, setFilterCritical] = useState(false);
  const [filterLate, setFilterLate] = useState(false);
  const [filterMyPackages, setFilterMyPackages] = useState(false);

  // Collapsed WBS nodes
  const [collapsedPhases, setCollapsedPhases] = useState<Record<string, boolean>>({});

  const togglePhase = (phaseId: string) => {
    setCollapsedPhases((prev) => ({ ...prev, [phaseId]: !prev[phaseId] }));
  };

  // Filtered activities
  const filteredActivities = useMemo(() => {
    return activities.filter((act) => {
      if (filterCritical && !act.isCritical) return false;
      if (filterLate && (act.physicalPercent >= 100 || act.plannedFinish >= '2026-09-20')) return false;
      if (filterMyPackages && !act.name.toLowerCase().includes('weld') && !act.name.toLowerCase().includes('pipe')) {
        return false;
      }
      return true;
    });
  }, [activities, filterCritical, filterLate, filterMyPackages]);

  // Group by WBS / Phase
  const groupedPhases = useMemo(() => {
    const map = new Map<string, { name: string; items: Activity[] }>();
    filteredActivities.forEach((act) => {
      const pid = act.phaseId || 'general';
      const pname = act.phaseName || 'General Execution';
      if (!map.has(pid)) {
        map.set(pid, { name: pname, items: [] });
      }
      map.get(pid)!.items.push(act);
    });
    return Array.from(map.entries()).map(([id, data]) => ({
      id,
      name: data.name,
      items: data.items,
    }));
  }, [filteredActivities]);

  return (
    <PageContainer
      maxWidth="container"
      withGutter={false}
      withVerticalRhythm={false}
      className="flex flex-col min-h-full bg-sb-bg pb-28"
      data-testid="schedule-screen-s6"
    >
      <span data-testid="stub-s6" className="sr-only">S6</span>
      {/* 1. Header with Data Date & Search icon */}
      <PageHeader
        variant="back"
        title="Schedule"
        subtitle={
          <div className="flex items-center gap-1.5 text-caption text-sb-ink-2 font-mono">
            <span>Data Date:</span>
            <span className="font-bold text-sb-navy px-1.5 py-0.2 rounded bg-sb-navy-tint text-[11px]">
              20 Sep 2026
            </span>
          </div>
        }
        rightAction={
          <button
            type="button"
            data-testid="schedule-search-btn"
            onClick={() => router.push('/search')}
            aria-label="Search schedule"
            className="w-9 h-9 rounded-full flex items-center justify-center text-sb-ink hover:bg-sb-navy-tint transition-colors"
          >
            <Search className="w-4 h-4" />
          </button>
        }
      />

      {/* 2. Controls Toolbar: Segmented (List / Gantt), Zoom, Filter Toggles */}
      <div className="px-4 py-2 space-y-2.5">
        <div className="flex items-center justify-between gap-2">
          {/* Segmented control: List / Gantt */}
          <div className="flex items-center bg-sb-white border border-sb-border rounded-xl p-1 shadow-sm">
            <button
              type="button"
              data-testid="schedule-view-list-btn"
              onClick={() => setViewMode('list')}
              className={`px-3 py-1 rounded-lg text-caption font-semibold transition-colors ${
                viewMode === 'list'
                  ? 'bg-sb-navy text-sb-white'
                  : 'text-sb-ink-3 hover:text-sb-ink'
              }`}
            >
              List (WBS)
            </button>
            <button
              type="button"
              data-testid="schedule-view-gantt-btn"
              onClick={() => setViewMode('gantt')}
              className={`px-3 py-1 rounded-lg text-caption font-semibold transition-colors ${
                viewMode === 'gantt'
                  ? 'bg-sb-navy text-sb-white'
                  : 'text-sb-ink-3 hover:text-sb-ink'
              }`}
            >
              Gantt-lite
            </button>
          </div>

          {/* Zoom Switcher if Gantt */}
          {viewMode === 'gantt' && (
            <div className="flex items-center gap-1 text-[11px] font-mono bg-sb-white border border-sb-border rounded-lg p-0.5">
              <button
                type="button"
                data-testid="zoom-week-btn"
                onClick={() => setZoomLevel('week')}
                className={`px-2 py-0.5 rounded ${
                  zoomLevel === 'week' ? 'bg-sb-navy text-sb-white font-bold' : 'text-sb-ink-3'
                }`}
              >
                Week
              </button>
              <button
                type="button"
                data-testid="zoom-month-btn"
                onClick={() => setZoomLevel('month')}
                className={`px-2 py-0.5 rounded ${
                  zoomLevel === 'month' ? 'bg-sb-navy text-sb-white font-bold' : 'text-sb-ink-3'
                }`}
              >
                Month
              </button>
            </div>
          )}
        </div>

        {/* Filter Toggles Row */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none" data-testid="schedule-filter-toggles">
          <button
            type="button"
            data-testid="toggle-critical-btn"
            onClick={() => setFilterCritical(!filterCritical)}
            className={`px-2.5 py-1 rounded-full text-caption font-semibold flex items-center gap-1 border transition-colors shrink-0 ${
              filterCritical
                ? 'bg-sb-critical text-sb-white border-sb-critical'
                : 'bg-sb-white text-sb-ink-2 border-sb-border hover:bg-sb-bg'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${filterCritical ? 'bg-sb-white' : 'bg-sb-critical'}`} />
            <span>Critical Path</span>
          </button>

          <button
            type="button"
            data-testid="toggle-late-btn"
            onClick={() => setFilterLate(!filterLate)}
            className={`px-2.5 py-1 rounded-full text-caption font-semibold flex items-center gap-1 border transition-colors shrink-0 ${
              filterLate
                ? 'bg-sb-review-ink text-sb-white border-sb-review-ink'
                : 'bg-sb-white text-sb-ink-2 border-sb-border hover:bg-sb-bg'
            }`}
          >
            <span>Late / Delayed</span>
          </button>

          <button
            type="button"
            data-testid="toggle-my-packages-btn"
            onClick={() => setFilterMyPackages(!filterMyPackages)}
            className={`px-2.5 py-1 rounded-full text-caption font-semibold flex items-center gap-1 border transition-colors shrink-0 ${
              filterMyPackages
                ? 'bg-sb-navy text-sb-white border-sb-navy'
                : 'bg-sb-white text-sb-ink-2 border-sb-border hover:bg-sb-bg'
            }`}
          >
            <span>My Work Packages</span>
          </button>
        </div>
      </div>

      {/* 3. Main Schedule Display */}
      {viewMode === 'list' ? (
        /* WBS Collapsible Tree List */
        <div className="px-4 space-y-3" data-testid="schedule-list-view">
          {groupedPhases.map((phase) => {
            const isCollapsed = collapsedPhases[phase.id];

            return (
              <div
                key={phase.id}
                className="bg-sb-white rounded-2xl border border-sb-border shadow-sm overflow-hidden"
              >
                {/* WBS Phase Header */}
                <button
                  type="button"
                  data-testid={`wbs-phase-header-${phase.id}`}
                  onClick={() => togglePhase(phase.id)}
                  className="w-full px-3.5 py-3 bg-sb-bg/60 hover:bg-sb-bg flex items-center justify-between border-b border-sb-border/60 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    {isCollapsed ? (
                      <ChevronRight className="w-4 h-4 text-sb-ink-3" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-sb-ink-3" />
                    )}
                    <span className="text-caption font-bold text-sb-navy font-mono">
                      {phase.name}
                    </span>
                  </div>

                  <span className="text-[11px] font-mono text-sb-ink-3 bg-sb-white px-2 py-0.5 rounded border border-sb-border/60">
                    {phase.items.length} tasks
                  </span>
                </button>

                {/* Activity Rows */}
                {!isCollapsed && (
                  <div className="divide-y divide-sb-border/60">
                    {phase.items.map((act) => (
                      <div
                        key={act.id}
                        data-testid={`activity-row-${act.id}`}
                        onClick={() => router.push(`/activity/${act.id}`)}
                        className={`p-3 px-3.5 hover:bg-sb-navy-tint/20 cursor-pointer transition-colors flex items-center justify-between gap-3 ${
                          act.isCritical ? 'border-l-4 border-l-sb-critical' : ''
                        }`}
                      >
                        <div className="space-y-1 min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-[11px] font-bold text-sb-navy">
                              {act.id}
                            </span>
                            {act.isCritical && (
                              <span className="text-[9px] font-bold text-sb-critical bg-sb-critical-tint px-1.5 py-0.2 rounded uppercase">
                                Critical
                              </span>
                            )}
                            <span className="text-[10px] text-sb-ink-3 font-mono">
                              {act.plannedStart} → {act.plannedFinish}
                            </span>
                          </div>

                          <div className="text-caption text-sb-ink font-semibold truncate">
                            {act.name}
                          </div>

                          {/* Mini Progress Bar */}
                          <div className="flex items-center gap-2 pt-0.5">
                            <div className="w-24 h-1.5 bg-sb-bg rounded-full overflow-hidden border border-sb-border/60">
                              <div
                                className={`h-full rounded-full ${
                                  act.physicalPercent >= 100 ? 'bg-sb-verified' : 'bg-sb-navy'
                                }`}
                                style={{ width: `${act.physicalPercent}%` }}
                              />
                            </div>
                            <span className="font-mono text-[10px] text-sb-navy font-bold">
                              {act.physicalPercent}%
                            </span>
                          </div>
                        </div>

                        <ChevronRight className="w-4 h-4 text-sb-ink-3 shrink-0" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        /* Gantt-Lite Timeline View */
        <div
          className="mx-4 bg-sb-white rounded-2xl border border-sb-border shadow-sm overflow-hidden"
          data-testid="schedule-gantt-view"
        >
          {/* Gantt Header with Date Range */}
          <div className="flex border-b border-sb-border bg-sb-bg/80 text-[11px] font-mono text-sb-ink-3">
            <div className="w-32 min-w-[128px] p-2.5 font-bold border-r border-sb-border">
              Activity
            </div>
            <div className="flex-1 flex overflow-x-auto relative">
              {['Sep 01', 'Sep 08', 'Sep 15', 'Sep 22 (DD)', 'Sep 29', 'Oct 06', 'Oct 13'].map(
                (week, idx) => (
                  <div
                    key={idx}
                    className={`flex-1 min-w-[64px] p-2 text-center border-r border-sb-border/60 ${
                      week.includes('DD') ? 'bg-sb-critical-tint font-bold text-sb-critical' : ''
                    }`}
                  >
                    {week}
                  </div>
                )
              )}
            </div>
          </div>

          {/* Gantt Rows */}
          <div className="divide-y divide-sb-border/60 max-h-[500px] overflow-y-auto">
            {filteredActivities.slice(0, 16).map((act, idx) => {
              // Simulated Gantt bar positions
              const startOffset = Math.min(60, (idx % 5) * 12 + 5);
              const barWidth = Math.max(25, 45 - (idx % 3) * 8);

              return (
                <div
                  key={act.id}
                  data-testid={`gantt-row-${act.id}`}
                  onClick={() => router.push(`/activity/${act.id}`)}
                  className="flex items-center hover:bg-sb-navy-tint/20 cursor-pointer transition-colors text-[11px]"
                >
                  {/* Sticky Activity Column (132px) */}
                  <div className="w-32 min-w-[128px] p-2.5 font-mono border-r border-sb-border truncate shrink-0">
                    <div className="font-bold text-sb-navy truncate">{act.id}</div>
                    <div className="text-[10px] text-sb-ink-3 truncate">{act.name}</div>
                  </div>

                  {/* Horizontal Timeline Track */}
                  <div className="flex-1 h-12 relative flex items-center overflow-hidden px-1">
                    {/* Data Date Vertical Line */}
                    <div
                      data-testid="gantt-data-date-line"
                      className="absolute top-0 bottom-0 left-[48%] w-0.5 bg-sb-critical z-20 pointer-events-none"
                      title="Data Date: 20 Sep 2026"
                    />

                    {/* Planned Grey Bar */}
                    <div
                      style={{
                        left: `${startOffset}%`,
                        width: `${barWidth}%`,
                      }}
                      className={`absolute h-4 rounded bg-sb-border/80 ${
                        act.isCritical ? 'border border-sb-critical' : ''
                      }`}
                    />

                    {/* Actual Navy Bar on top */}
                    <div
                      style={{
                        left: `${startOffset}%`,
                        width: `${(barWidth * act.physicalPercent) / 100}%`,
                      }}
                      className="absolute h-4 rounded bg-sb-navy z-10"
                    />

                    {/* Label */}
                    <span
                      style={{ left: `${startOffset + barWidth + 2}%` }}
                      className="absolute font-mono text-[9px] text-sb-navy font-bold z-10"
                    >
                      {act.physicalPercent}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </PageContainer>
  );
}

import { Skeleton } from '@/components/ui/Skeleton';

function ScheduleSkeleton() {
  return (
    <div className="flex flex-col min-h-full bg-sb-bg pb-28 space-y-3" data-testid="schedule-skeleton">
      <div className="h-14 bg-sb-white border-b border-sb-border px-4 flex items-center justify-between">
        <Skeleton variant="text" width={140} height={20} />
        <Skeleton variant="avatar" width={32} height={32} />
      </div>
      <div className="px-4 space-y-3">
        <div className="flex gap-2">
          <Skeleton variant="pill" width={90} height={32} />
          <Skeleton variant="pill" width={90} height={32} />
        </div>
        <div className="flex gap-2">
          <Skeleton variant="pill" width={100} height={28} />
          <Skeleton variant="pill" width={100} height={28} />
          <Skeleton variant="pill" width={120} height={28} />
        </div>
        <div className="space-y-3 pt-2">
          <Skeleton variant="rect" height={160} className="rounded-2xl w-full" />
          <Skeleton variant="rect" height={160} className="rounded-2xl w-full" />
        </div>
      </div>
    </div>
  );
}

export default function SchedulePage() {
  return (
    <React.Suspense fallback={<ScheduleSkeleton />}>
      <SchedulePageContent />
    </React.Suspense>
  );
}
