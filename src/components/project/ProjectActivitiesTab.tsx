'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import { useActivitiesStore } from '@/store/activities';
import { useEventsStore } from '@/store/events';
import {
  Search,
  Filter,
  X,
  Radio,
  ExternalLink,
  ChevronRight,
  Flame,
  PlusCircle,
  Cpu,
} from 'lucide-react';
import { Activity } from '@/services/types';

export interface ProjectActivitiesTabProps {
  selectedPhase: string | null;
  onClearPhase: () => void;
}

export const ProjectActivitiesTab: React.FC<ProjectActivitiesTabProps> = ({
  selectedPhase,
  onClearPhase,
}) => {
  const router = useRouter();
  const { user } = useAuthStore();
  const activities = useActivitiesStore((s) => s.activities);
  const events = useEventsStore((s) => s.events);

  const isPlanner = user?.role === 'planner';
  const isSupervisor = user?.role === 'supervisor';
  const isPM = user?.role === 'pm';

  // State
  const [plannerViewMode, setPlannerViewMode] = useState<'match_placeholder' | 'activity_list'>(
    'match_placeholder'
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'In progress' | 'Complete' | 'Not started'>('all');
  const [criticalOnly, setCriticalOnly] = useState(false);

  // Review count for planner
  const reviewCount = useMemo(() => {
    return events.filter((e) => e.status === 'Review' || e.queueTier === 'Review').length;
  }, [events]);

  // Filtered activities
  const filteredActivities = useMemo(() => {
    return activities.filter((act) => {
      // Phase filter
      if (selectedPhase) {
        const matchesPhase =
          act.phaseId.toLowerCase().includes(selectedPhase.toLowerCase()) ||
          act.name.toLowerCase().includes(selectedPhase.toLowerCase());
        if (!matchesPhase) return false;
      }

      // Status filter
      if (statusFilter !== 'all' && act.status !== statusFilter) {
        return false;
      }

      // Critical filter for PM
      if (criticalOnly && !act.isCritical) {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return act.id.toLowerCase().includes(q) || act.name.toLowerCase().includes(q);
      }

      return true;
    });
  }, [activities, selectedPhase, statusFilter, criticalOnly, searchQuery]);

  // 1. Planner Mode: PL3 Match Review Mount Placeholder
  if (isPlanner && plannerViewMode === 'match_placeholder') {
    return (
      <div className="space-y-4" data-testid="planner-match-placeholder">
        {/* Header summary matching reference screen 3 */}
        <div className="bg-sb-white rounded-2xl p-4 border border-sb-border shadow-e1 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-title-3 font-bold text-sb-navy">
                Activity Matching
              </h2>
              <div className="text-caption font-semibold text-sb-critical mt-0.5" data-testid="planner-review-count">
                {reviewCount} events require review
              </div>
            </div>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-sb-navy-tint text-sb-navy font-semibold">
              PL3 Workbench
            </span>
          </div>

          <p className="text-caption text-sb-ink-2">
            AI has extracted field speech logs and matched them against schedule activities. Match Review mounts here in P10.
          </p>

          {/* Reference Screen 3 Mocked Preview Cards (Field Evidence & AI Match) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {/* Field Evidence Card */}
            <div className="p-3.5 rounded-xl border border-sb-border bg-sb-bg/60 space-y-2">
              <div className="text-[11px] font-bold tracking-wider uppercase text-sb-navy flex items-center justify-between">
                <span>Field Evidence</span>
                <span className="text-sb-ink-3 font-mono">08:42 AM</span>
              </div>
              <div className="text-caption text-sb-ink italic bg-sb-white p-2 rounded-lg border border-sb-border/60">
                &ldquo;Line 24-XX ki spool 18 welding complete ho gayi hai...&rdquo;
              </div>
              <div className="text-[11px] text-sb-ink-3">
                Supervisor: <span className="font-semibold text-sb-navy">Rahul Patil</span>
              </div>
              <div className="flex flex-wrap gap-1 pt-1">
                <span className="px-2 py-0.5 rounded bg-sb-navy-tint text-sb-navy text-[10px] font-medium">Welding</span>
                <span className="px-2 py-0.5 rounded bg-sb-navy-tint text-sb-navy text-[10px] font-medium">Spool 18</span>
                <span className="px-2 py-0.5 rounded bg-sb-verified-tint text-sb-verified-ink text-[10px] font-semibold">Completed</span>
              </div>
            </div>

            {/* AI Match Card */}
            <div className="p-3.5 rounded-xl border border-sb-border bg-sb-bg/60 space-y-2">
              <div className="text-[11px] font-bold tracking-wider uppercase text-sb-navy flex items-center justify-between">
                <span>AI Recommendation</span>
                <span className="font-mono text-sb-verified-ink bg-sb-verified-tint px-1.5 py-0.5 rounded text-[11px] font-bold">
                  94% Match
                </span>
              </div>
              <div className="bg-sb-white p-2 rounded-lg border border-sb-border/60">
                <div className="font-mono text-caption font-bold text-sb-navy">PIP-24-017</div>
                <div className="text-caption text-sb-ink-2 truncate">Weld Piping System 24-XX</div>
              </div>
              <div className="text-[11px] text-sb-ink-3">
                Logic check: <span className="font-semibold text-sb-verified">Passed</span>
              </div>
              <div className="text-[10px] font-mono text-sb-ink-3">
                Evidence: Voice → Event → Match
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="pt-2 space-y-2">
            <button
              type="button"
              data-testid="open-workbench-btn"
              onClick={() => router.push('/workbench/E-2091')}
              className="w-full py-3 px-4 rounded-full bg-sb-navy text-sb-white font-semibold text-callout flex items-center justify-center gap-2 hover:bg-sb-navy-pressed active:scale-[0.99] transition-all shadow-e1"
            >
              <Cpu className="w-4 h-4" />
              <span>Open Planner Workbench (P10)</span>
              <ExternalLink className="w-4 h-4 ml-1" />
            </button>

            <button
              type="button"
              data-testid="toggle-full-schedule-btn"
              onClick={() => setPlannerViewMode('activity_list')}
              className="w-full py-2.5 px-4 rounded-full border border-sb-border text-sb-navy font-semibold text-caption hover:bg-sb-bg active:bg-sb-navy-tint transition-colors"
            >
              Browse Full Schedule Activity List ({activities.length} activities)
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 2. Read-only Activity List View (for Supervisors, PM, Admin, or Planner toggle)
  return (
    <div className="space-y-3" data-testid="project-activities-list-container">
      {/* Planner back to match review switch */}
      {isPlanner && (
        <button
          type="button"
          data-testid="back-to-match-btn"
          onClick={() => setPlannerViewMode('match_placeholder')}
          className="w-full py-2 px-3 rounded-xl bg-sb-navy-tint text-sb-navy text-caption font-semibold flex items-center justify-between hover:bg-sb-navy/10 transition-colors"
        >
          <span>← Back to PL3 Match Review Mount</span>
          <span className="font-mono text-[11px] bg-sb-white px-2 py-0.5 rounded-full">{reviewCount} Pending</span>
        </button>
      )}

      {/* Active Phase Filter Badge if coming from Overview */}
      {selectedPhase && (
        <div
          data-testid="active-phase-banner"
          className="flex items-center justify-between bg-sb-navy text-sb-white px-3.5 py-2 rounded-xl text-caption shadow-sm"
        >
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5" />
            <span>
              Filtered by phase: <strong>{selectedPhase}</strong>
            </span>
          </div>
          <button
            type="button"
            data-testid="clear-phase-filter-btn"
            onClick={onClearPhase}
            className="flex items-center gap-1 text-[11px] font-semibold bg-sb-white/20 hover:bg-sb-white/30 px-2 py-0.5 rounded-full transition-colors"
          >
            <span>Clear</span>
            <X className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* Search Field */}
      <div className="relative">
        <input
          type="text"
          data-testid="activity-search-input"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search activity ID (e.g. PIP-24-017) or name..."
          className="w-full h-10 pl-9 pr-8 bg-sb-white border border-sb-border rounded-xl text-caption text-sb-ink placeholder:text-sb-ink-3 focus:outline-none focus:border-sb-navy"
        />
        <Search className="w-4 h-4 text-sb-ink-3 absolute left-3 top-3 pointer-events-none" />
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            className="absolute right-2.5 top-2.5 text-sb-ink-3 hover:text-sb-ink p-0.5"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Filter Chips & PM Critical Toggle */}
      <div className="flex items-center justify-between gap-2 overflow-x-auto scrollbar-none pb-0.5">
        <div className="flex items-center gap-1.5 min-w-max">
          {(['all', 'In progress', 'Complete', 'Not started'] as const).map((status) => (
            <button
              key={status}
              type="button"
              data-testid={`activity-status-filter-${status.replace(/\s+/g, '-').toLowerCase()}`}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1 rounded-full text-caption font-medium transition-colors ${
                statusFilter === status
                  ? 'bg-sb-navy text-sb-white font-semibold'
                  : 'bg-sb-white border border-sb-border text-sb-ink-2 hover:bg-sb-bg'
              }`}
            >
              {status === 'all' ? 'All Activities' : status}
            </button>
          ))}
        </div>

        {/* PM Critical Path Toggle */}
        {isPM && (
          <button
            type="button"
            data-testid="pm-critical-toggle"
            onClick={() => setCriticalOnly(!criticalOnly)}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-caption font-medium flex-shrink-0 transition-colors ${
              criticalOnly
                ? 'bg-sb-critical text-sb-white font-semibold'
                : 'bg-sb-white border border-sb-border text-sb-critical'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>Critical</span>
          </button>
        )}
      </div>

      {/* Results Count */}
      <div className="text-[12px] text-sb-ink-3 px-1 flex justify-between">
        <span>Showing {filteredActivities.length} activities</span>
        <span>Data Date: 20 Sep 2026</span>
      </div>

      {/* Activities List */}
      <div className="space-y-2.5" data-testid="activities-list">
        {filteredActivities.length === 0 ? (
          <div className="bg-sb-white rounded-xl p-8 text-center border border-sb-border space-y-2">
            <p className="text-caption text-sb-ink-3">No activities matched your search criteria.</p>
            {(selectedPhase || searchQuery || statusFilter !== 'all' || criticalOnly) && (
              <button
                type="button"
                onClick={() => {
                  onClearPhase();
                  setSearchQuery('');
                  setStatusFilter('all');
                  setCriticalOnly(false);
                }}
                className="text-caption font-semibold text-sb-navy hover:underline"
              >
                Reset all filters
              </button>
            )}
          </div>
        ) : (
          filteredActivities.map((act) => {
            const isCompleted = act.status === 'Complete';
            const isInProgress = act.status === 'In progress';

            return (
              <div
                key={act.id}
                data-testid={`activity-row-${act.id}`}
                className="bg-sb-white rounded-xl p-3.5 border border-sb-border shadow-sm hover:border-sb-navy/40 transition-colors space-y-2.5"
              >
                {/* Header row: ID, Phase tag, Status badge */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="font-mono text-caption font-bold text-sb-navy">
                      {act.id}
                    </span>
                    <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-sb-bg text-sb-ink-3 border border-sb-border/60">
                      {act.phaseId.replace('phase-', '')}
                    </span>
                    {act.isCritical && (
                      <span className="text-[10px] font-mono px-1 py-0.2 rounded bg-sb-critical-tint text-sb-critical font-bold">
                        CP
                      </span>
                    )}
                  </div>

                  <span
                    className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${
                      isCompleted
                        ? 'bg-sb-verified-tint text-sb-verified-ink'
                        : isInProgress
                        ? 'bg-sb-review-tint text-sb-review-ink'
                        : 'bg-sb-bg text-sb-ink-3'
                    }`}
                  >
                    {act.status}
                  </span>
                </div>

                {/* Name */}
                <div
                  className="text-callout font-semibold text-sb-ink hover:text-sb-navy cursor-pointer"
                  onClick={() => router.push(`/activity/${act.id}`)}
                >
                  {act.name}
                </div>

                {/* Progress bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] text-sb-ink-3">
                    <span>Physical Progress</span>
                    <span className="font-mono font-bold text-sb-navy">{act.physicalPercent}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-sb-bg rounded-full overflow-hidden border border-sb-border/40">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        isCompleted ? 'bg-sb-verified' : 'bg-sb-navy'
                      }`}
                      style={{ width: `${act.physicalPercent}%` }}
                    />
                  </div>
                </div>

                {/* Actions row */}
                <div className="flex items-center justify-between pt-1 border-t border-sb-border/60 text-caption">
                  <button
                    type="button"
                    data-testid={`activity-detail-btn-${act.id}`}
                    onClick={() => router.push(`/activity/${act.id}`)}
                    className="text-sb-ink-3 hover:text-sb-navy flex items-center gap-1 font-medium text-[12px]"
                  >
                    <span>View S4 Details</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>

                  {/* Supervisor "Report" button prefilled for SU2 */}
                  {isSupervisor && (
                    <button
                      type="button"
                      data-testid={`activity-report-btn-${act.id}`}
                      onClick={() => router.push(`/capture?activity=${act.id}`)}
                      className="px-2.5 py-1 rounded-full bg-sb-navy text-sb-white text-[12px] font-semibold flex items-center gap-1 hover:bg-sb-navy-pressed active:scale-95 transition-all shadow-sm"
                    >
                      <PlusCircle className="w-3.5 h-3.5" />
                      <span>Report</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
