'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/shell/PageHeader';
import { StatusPill } from '@/components/ui/StatusPill';
import { UnderlineTabs, TabItem } from '@/components/ui/UnderlineTabs';
import { Sheet } from '@/components/ui/Sheet';
import { Toast } from '@/components/ui/Toast';
import { useActivitiesStore } from '@/store/activities';
import { useEventsStore } from '@/store/events';
import { useAuditStore } from '@/store/audit';
import { useAuthStore } from '@/store/auth';
import {
  Calendar,
  Layers,
  ArrowRight,
  TrendingUp,
  History as HistoryIcon,
  Mic,
  Sliders,
  CheckCircle2,
  ChevronRight,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react';
import { Activity } from '@/services/types';

type ActivityTab = 'overview' | 'progress' | 'logic' | 'history';

export default function ActivityDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { user } = useAuthStore();
  const isPlanner = user?.role === 'planner';
  const isSupervisor = user?.role === 'supervisor';

  const activity = useActivitiesStore((s) => s.activities.find((a) => a.id === params.id));
  const updateActivityProgress = useActivitiesStore((s) => s.updateActivityProgress);
  const events = useEventsStore((s) => s.events);
  const auditEntries = useAuditStore((s) => s.chain.filter((e) => e.activityId === params.id));
  const appendEntry = useAuditStore((s) => s.appendEntry);

  const [activeTab, setActiveTab] = useState<ActivityTab>('overview');
  const [adjustSheetOpen, setAdjustSheetOpen] = useState(false);
  const [newPercent, setNewPercent] = useState<number>(activity?.physicalPercent || 40);
  const [adjustReason, setAdjustReason] = useState<string>('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Contributing field events
  const contributingEvents = useMemo(() => {
    return events.filter(
      (e) => e.suggestedActivityId === params.id && (e.status === 'Verified' || e.status === 'Review')
    );
  }, [events, params.id]);

  const tabs: TabItem[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'progress', label: 'Progress', count: contributingEvents.length },
    { id: 'logic', label: 'Logic' },
    { id: 'history', label: 'History', count: auditEntries.length },
  ];

  if (!activity) {
    return (
      <div className="flex flex-col min-h-full bg-sb-bg p-4 space-y-4">
        <PageHeader variant="back" title="Activity Not Found" />
        <div className="p-8 bg-sb-white rounded-2xl border border-sb-border text-center">
          <p className="text-caption text-sb-ink-3">No activity found with ID {params.id}</p>
          <button
            type="button"
            onClick={() => router.push('/schedule')}
            className="mt-3 px-4 py-2 bg-sb-navy text-sb-white rounded-full text-caption font-semibold"
          >
            Back to Schedule
          </button>
        </div>
      </div>
    );
  }

  const handleSaveAdjustment = async () => {
    if (!adjustReason) return;
    const oldVal = activity.physicalPercent;
    updateActivityProgress(activity.id, newPercent);
    await appendEntry({
      actor: user?.name || 'Meera Nair',
      action: 'adjust_progress',
      activityId: activity.id,
      oldValue: `${oldVal}%`,
      newValue: `${newPercent}%`,
      details: adjustReason,
    });
    setAdjustSheetOpen(false);
    setToastMessage(`Adjusted progress from ${oldVal}% to ${newPercent}%. Audit entry recorded.`);
  };

  return (
    <div className="flex flex-col min-h-full bg-sb-bg pb-28" data-testid="activity-detail-screen-s4">
      {/* 1. Header with Activity ID & Status */}
      <PageHeader
        variant="back"
        title={activity.id}
        subtitle={activity.name}
        rightAction={
          <div className="mr-1">
            <StatusPill status={activity.status === 'Complete' ? 'Verified' : activity.status === 'In progress' ? 'Review' : 'Delay'} />
          </div>
        }
      />

      {/* 2. Tabs */}
      <div className="px-4 pt-2 bg-sb-bg">
        <UnderlineTabs
          tabs={tabs}
          activeId={activeTab}
          onChange={(id) => setActiveTab(id as ActivityTab)}
          data-testid="activity-tabs"
        />
      </div>

      {/* 3. Tab Body Content */}
      <div className="p-4 space-y-4">
        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="space-y-3" data-testid="activity-overview-tab">
            <div className="bg-sb-white rounded-2xl p-4 border border-sb-border shadow-sm space-y-3">
              <div className="text-caption font-bold text-sb-navy">Execution Parameters</div>
              <div className="divide-y divide-sb-border/60 text-[12px] font-mono">
                <div className="py-2 flex justify-between">
                  <span className="font-sans text-sb-ink-3">WBS Phase</span>
                  <span className="font-bold text-sb-navy">{activity.phaseName}</span>
                </div>
                <div className="py-2 flex justify-between">
                  <span className="font-sans text-sb-ink-3">Physical %</span>
                  <span className="font-bold text-sb-navy">{activity.physicalPercent}%</span>
                </div>
                <div className="py-2 flex justify-between">
                  <span className="font-sans text-sb-ink-3">Planned Dates</span>
                  <span className="text-sb-ink-2">{activity.plannedStart} → {activity.plannedFinish}</span>
                </div>
                <div className="py-2 flex justify-between">
                  <span className="font-sans text-sb-ink-3">Actual Start</span>
                  <span className="text-sb-ink-2">{activity.actualStart || '12 Sep 2026'}</span>
                </div>
                <div className="py-2 flex justify-between">
                  <span className="font-sans text-sb-ink-3">Actual Finish</span>
                  <span className="text-sb-ink-3">{activity.actualFinish || 'Not set'}</span>
                </div>
                <div className="py-2 flex justify-between">
                  <span className="font-sans text-sb-ink-3">Quantity</span>
                  <span className="text-sb-navy">
                    {activity.quantityCompleted || 17} of {activity.quantityTotal || 42} {activity.unit || 'spools'}
                  </span>
                </div>
                <div className="py-2 flex justify-between">
                  <span className="font-sans text-sb-ink-3">Critical Path</span>
                  <span className={activity.isCritical ? 'text-sb-critical font-bold' : 'text-sb-ink-3'}>
                    {activity.isCritical ? 'Yes (Critical)' : 'No'}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons depending on role */}
            <div className="pt-2">
              {isPlanner && (
                <button
                  type="button"
                  data-testid="adjust-percent-btn"
                  onClick={() => {
                    setNewPercent(activity.physicalPercent);
                    setAdjustReason('');
                    setAdjustSheetOpen(true);
                  }}
                  className="w-full py-3 rounded-full bg-sb-navy text-sb-white font-bold text-callout shadow-sm flex items-center justify-center gap-2"
                >
                  <Sliders className="w-4 h-4" />
                  <span>Adjust % Complete</span>
                </button>
              )}

              {isSupervisor && (
                <button
                  type="button"
                  data-testid="report-progress-btn"
                  onClick={() => router.push(`/capture?activity=${activity.id}`)}
                  className="w-full py-3 rounded-full bg-sb-navy text-sb-white font-bold text-callout shadow-sm flex items-center justify-center gap-2"
                >
                  <Mic className="w-4 h-4" />
                  <span>Report Progress</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* PROGRESS TAB (Accumulator Meter) */}
        {activeTab === 'progress' && (
          <div className="space-y-3" data-testid="activity-progress-tab">
            {/* Accumulator Meter */}
            <div data-testid="accumulator-meter" className="bg-sb-white rounded-2xl p-4 border border-sb-border shadow-sm space-y-2.5">
              <div className="flex justify-between items-center">
                <span className="text-caption font-bold text-sb-navy">Progress Accumulator</span>
                <span className="font-mono text-[11px] font-bold text-sb-navy bg-sb-bg px-2 py-0.5 rounded">
                  {activity.physicalPercent}%
                </span>
              </div>

              <div className="text-[13px] font-semibold text-sb-ink">
                {activity.quantityCompleted || 17} of {activity.quantityTotal || 42} {activity.unit || 'spools'}
              </div>

              <div className="w-full h-3 bg-sb-bg rounded-full overflow-hidden border border-sb-border">
                <div
                  className="h-full bg-sb-navy rounded-full transition-all"
                  style={{ width: `${activity.physicalPercent}%` }}
                />
              </div>
              <div className="text-[11px] text-sb-ink-3">
                Parent activity remains active. Each verified field update advances this progress meter.
              </div>
            </div>

            {/* Contributing Events List */}
            <div className="space-y-2">
              <div className="text-caption font-bold text-sb-navy px-1">Contributing Field Events</div>
              {contributingEvents.length === 0 ? (
                <div className="p-4 bg-sb-white rounded-xl border border-sb-border text-center text-caption text-sb-ink-3">
                  No verified events attached to this activity yet.
                </div>
              ) : (
                contributingEvents.map((evt) => (
                  <div
                    key={evt.id}
                    data-testid={`contributing-event-${evt.id}`}
                    onClick={() => router.push(`/event/${evt.id}`)}
                    className="p-3 bg-sb-white rounded-xl border border-sb-border hover:border-sb-navy cursor-pointer transition-colors flex items-center justify-between shadow-sm"
                  >
                    <div>
                      <div className="flex items-center gap-2 font-mono text-[11px]">
                        <span className="font-bold text-sb-navy">{evt.id}</span>
                        <span className="text-sb-ink-3">· {evt.timestamp}</span>
                        <StatusPill status={evt.status} />
                      </div>
                      <div className="text-caption text-sb-ink font-medium truncate mt-0.5">
                        &ldquo;{evt.rawText}&rdquo;
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-sb-ink-3 shrink-0" />
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* LOGIC TAB (Predecessors & Successors) */}
        {activeTab === 'logic' && (
          <div className="space-y-4" data-testid="activity-logic-tab">
            {/* Predecessors */}
            <div className="space-y-2">
              <div className="text-caption font-bold text-sb-navy px-1">Predecessors (Must finish first)</div>
              {activity.predecessors.length === 0 ? (
                <div className="p-3.5 bg-sb-white rounded-xl border border-sb-border text-caption text-sb-ink-3">
                  No predecessors (Project start milestone).
                </div>
              ) : (
                activity.predecessors.map((pred) => (
                  <div
                    key={pred.id}
                    data-testid={`logic-node-${pred.id}`}
                    onClick={() => router.push(`/activity/${pred.id}`)}
                    className="p-3 bg-sb-white rounded-xl border border-sb-border hover:border-sb-navy cursor-pointer transition-colors flex items-center justify-between shadow-sm"
                  >
                    <div>
                      <div className="font-mono font-bold text-sb-navy text-caption">{pred.id}</div>
                      <div className="text-[11px] text-sb-ink-3">Relationship: {pred.type} · Lag {pred.lag}d</div>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-sb-verified-tint text-sb-verified-ink text-[11px] font-semibold">
                      Complete
                    </span>
                  </div>
                ))
              )}
            </div>

            {/* Successors */}
            <div className="space-y-2">
              <div className="text-caption font-bold text-sb-navy px-1">Successors (Depends on this activity)</div>
              {activity.successors.length === 0 ? (
                <div className="p-3.5 bg-sb-white rounded-xl border border-sb-border text-caption text-sb-ink-3">
                  No successors (Project finish milestone).
                </div>
              ) : (
                activity.successors.map((succ) => (
                  <div
                    key={succ.id}
                    data-testid={`logic-node-${succ.id}`}
                    onClick={() => router.push(`/activity/${succ.id}`)}
                    className="p-3 bg-sb-white rounded-xl border border-sb-border hover:border-sb-navy cursor-pointer transition-colors flex items-center justify-between shadow-sm"
                  >
                    <div>
                      <div className="font-mono font-bold text-sb-navy text-caption">{succ.id}</div>
                      <div className="text-[11px] text-sb-ink-3">Relationship: {succ.type} · Lag {succ.lag}d</div>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-sb-bg text-sb-ink-3 text-[11px] font-semibold">
                      Not Started
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* HISTORY TAB (Audit Trail) */}
        {activeTab === 'history' && (
          <div className="space-y-2.5" data-testid="activity-history-tab">
            {auditEntries.length === 0 ? (
              <div className="p-8 bg-sb-white rounded-2xl border border-sb-border text-center space-y-2">
                <HistoryIcon className="w-8 h-8 text-sb-ink-3 mx-auto" />
                <div className="text-caption text-sb-ink-3">No manual overrides recorded for this activity.</div>
              </div>
            ) : (
              auditEntries.map((entry) => (
                <div
                  key={entry.id}
                  className="p-3.5 bg-sb-white rounded-xl border border-sb-border shadow-sm space-y-1 text-[12px]"
                >
                  <div className="flex items-center justify-between font-mono text-[11px]">
                    <span className="font-bold text-sb-navy">{entry.action}</span>
                    <span className="text-sb-ink-3">{entry.ts}</span>
                  </div>
                  <div className="text-sb-ink font-medium">
                    Changed from <span className="font-mono font-bold">{entry.oldValue}</span> to{' '}
                    <span className="font-mono font-bold text-sb-verified-ink">{entry.newValue}</span>
                  </div>
                  <div className="text-sb-ink-3 text-[11px]">Actor: {entry.actor}</div>
                  <div className="font-mono text-[10px] text-sb-ink-3 pt-1 border-t border-sb-border/60">
                    Hash: {entry.hash.slice(0, 16)}...
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Adjust % Complete Sheet (Planner only) */}
      <Sheet
        open={adjustSheetOpen}
        onOpenChange={setAdjustSheetOpen}
        title="Adjust Physical % Complete"
        description="Write a manual progress override to the immutable audit ledger."
        data-testid="adjust-percent-sheet"
      >
        <div className="p-4 space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-caption font-bold text-sb-navy">
              <span>New Physical %</span>
              <span className="font-mono text-base">{newPercent}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              value={newPercent}
              onChange={(e) => setNewPercent(Number(e.target.value))}
              className="w-full h-2 bg-sb-bg rounded-lg cursor-pointer accent-sb-navy"
            />
          </div>

          <div className="space-y-1.5">
            <div className="text-caption font-bold text-sb-navy">
              Required Reason:
            </div>
            <div className="flex flex-wrap gap-1.5">
              {['Field recount', 'Engineering recalculation', 'Executive override'].map((reason) => (
                <button
                  key={reason}
                  type="button"
                  data-testid={`adjust-reason-${reason.toLowerCase().replace(/\s+/g, '-')}`}
                  onClick={() => setAdjustReason(reason)}
                  className={`px-3 py-1 rounded-full text-caption font-semibold transition-colors ${
                    adjustReason === reason
                      ? 'bg-sb-navy text-sb-white'
                      : 'bg-sb-bg text-sb-ink-2 hover:bg-sb-border'
                  }`}
                >
                  {reason}
                </button>
              ))}
            </div>
            <input
              type="text"
              data-testid="adjust-reason-input"
              value={adjustReason}
              onChange={(e) => setAdjustReason(e.target.value)}
              placeholder="Or enter custom reason..."
              className="w-full px-3 py-2 rounded-xl border border-sb-border text-[13px] bg-sb-white text-sb-navy placeholder:text-sb-ink-3 focus:outline-none focus:border-sb-navy"
            />
          </div>

          <div className="pt-2">
            <button
              type="button"
              data-testid="save-adjustment-btn"
              disabled={!adjustReason}
              onClick={handleSaveAdjustment}
              className={`w-full py-3 rounded-full font-bold text-callout shadow-sm active:scale-95 transition-all ${
                adjustReason
                  ? 'bg-sb-navy text-sb-white hover:bg-sb-navy-pressed'
                  : 'bg-sb-border text-sb-ink-3 cursor-not-allowed'
              }`}
            >
              Save Adjustment & Sign Ledger
            </button>
          </div>
        </div>
      </Sheet>

      {/* Toast Notification */}
      {toastMessage && (
        <Toast
          open={Boolean(toastMessage)}
          message={toastMessage}
          onClose={() => setToastMessage(null)}
        />
      )}
    </div>
  );
}
