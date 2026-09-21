'use client';

import React, { useState, useMemo, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { PageHeader } from '@/components/shell/PageHeader';
import { UnderlineTabs, TabItem } from '@/components/ui/UnderlineTabs';
import { ConfidenceBadge } from '@/components/domain/ConfidenceBadge';
import { Sheet } from '@/components/ui/Sheet';
import { Toast } from '@/components/ui/Toast';
import { useEventsStore } from '@/store/events';
import { useAuthStore } from '@/store/auth';
import { FreshnessClock } from '@/components/domain/FreshnessClock';
import {
  Filter,
  ArrowUpDown,
  CheckSquare,
  Square,
  Mic,
  FileSpreadsheet,
  FileText,
  CheckCircle2,
  ChevronRight,
  X,
} from 'lucide-react';
import { FieldEvent } from '@/services/types';

type QueueTab = 'review' | 'unmatched' | 'warnings' | 'done';
type SortOption = 'priority' | 'confidence-asc' | 'newest' | 'discipline';

function WorkbenchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuthStore();
  const events = useEventsStore((s) => s.events);
  const approveEvent = useEventsStore((s) => s.approveEvent);
  const undoApproval = useEventsStore((s) => s.undoApproval);

  const initialTab = (searchParams.get('tab') || 'review').toLowerCase() as QueueTab;
  const [activeTab, setActiveTab] = useState<QueueTab>(
    ['review', 'unmatched', 'warnings', 'done'].includes(initialTab) ? initialTab : 'review'
  );

  // Sheets & controls
  const [sortSheetOpen, setSortSheetOpen] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>('priority');
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [contractorFilter, setContractorFilter] = useState<string>('all');

  // Multi-select mode
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [batchDiffSheetOpen, setBatchDiffSheetOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [undoEventId, setUndoEventId] = useState<string | null>(null);

  // Group events by tab
  const reviewEvents = useMemo(() => {
    return events.filter(
      (e) => (e.status === 'Review' || e.queueTier === 'Review') && e.logicCheckStatus !== 'Warning' && e.status !== 'Verified' && e.status !== 'Rejected'
    );
  }, [events]);

  const unmatchedEvents = useMemo(() => {
    return events.filter(
      (e) => (e.status === 'Unmatched' || e.queueTier === 'Unmatched' || (e.confidence && e.confidence < 60)) && e.status !== 'Verified' && e.status !== 'Rejected'
    );
  }, [events]);

  const warningEvents = useMemo(() => {
    return events.filter(
      (e) => (e.logicCheckStatus === 'Warning' || e.isConflict || e.queueTier === 'Warning') && e.status !== 'Verified' && e.status !== 'Rejected'
    );
  }, [events]);

  const doneEvents = useMemo(() => {
    return events.filter((e) => e.status === 'Verified' || e.status === 'Rejected');
  }, [events]);

  const tabCounts = {
    review: reviewEvents.length,
    unmatched: unmatchedEvents.length,
    warnings: warningEvents.length,
    done: doneEvents.length,
  };

  const tabs: TabItem[] = [
    { id: 'review', label: 'Review', count: tabCounts.review },
    { id: 'unmatched', label: 'Unmatched', count: tabCounts.unmatched },
    { id: 'warnings', label: 'Warnings', count: tabCounts.warnings },
    { id: 'done', label: 'Done', count: tabCounts.done },
  ];

  // Active list filtered and sorted
  const currentEvents = useMemo(() => {
    let list: FieldEvent[] = [];
    if (activeTab === 'review') list = reviewEvents;
    else if (activeTab === 'unmatched') list = unmatchedEvents;
    else if (activeTab === 'warnings') list = warningEvents;
    else if (activeTab === 'done') list = doneEvents;

    // Filters
    if (sourceFilter !== 'all') {
      list = list.filter((e) => e.source === sourceFilter);
    }
    if (contractorFilter !== 'all') {
      list = list.filter((e) => e.authorName === contractorFilter || e.authorCrew?.includes(contractorFilter));
    }

    // Sorts
    const sorted = [...list];
    if (sortBy === 'confidence-asc') {
      sorted.sort((a, b) => (a.confidence || 0) - (b.confidence || 0));
    } else if (sortBy === 'newest') {
      sorted.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
    } else if (sortBy === 'discipline') {
      sorted.sort((a, b) => (a.extractedInfo?.action || '').localeCompare(b.extractedInfo?.action || ''));
    } else {
      // Priority: Warnings first, then lowest confidence
      sorted.sort((a, b) => {
        if (a.logicCheckStatus === 'Warning' && b.logicCheckStatus !== 'Warning') return -1;
        if (b.logicCheckStatus === 'Warning' && a.logicCheckStatus !== 'Warning') return 1;
        return (a.confidence || 0) - (b.confidence || 0);
      });
    }

    return sorted;
  }, [activeTab, reviewEvents, unmatchedEvents, warningEvents, doneEvents, sourceFilter, contractorFilter, sortBy]);

  const toggleSelect = (id: string, canSelect: boolean) => {
    if (!canSelect) return;
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAllSelectable = () => {
    const selectableIds = currentEvents
      .filter((e) => e.logicCheckStatus === 'Passed')
      .map((e) => e.id);
    if (selectedIds.length === selectableIds.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(selectableIds);
    }
  };

  const handleBatchApprove = async () => {
    if (selectedIds.length === 0) return;
    const count = selectedIds.length;
    for (const id of selectedIds) {
      await approveEvent(id, undefined, user?.name || 'Meera Nair');
    }
    setBatchDiffSheetOpen(false);
    setSelectedIds([]);
    setIsSelectMode(false);
    setToastMessage(`${count} events approved`);
  };

  const renderSourceGlyph = (source?: string) => {
    switch (source) {
      case 'excel':
        return (
          <div className="w-8 h-8 rounded-full bg-sb-verified-tint text-sb-verified-ink flex items-center justify-center shrink-0">
            <FileSpreadsheet className="w-4 h-4" />
          </div>
        );
      case 'dpr':
      case 'pdf':
        return (
          <div className="w-8 h-8 rounded-full bg-sb-navy-tint text-sb-navy flex items-center justify-center shrink-0">
            <FileText className="w-4 h-4" />
          </div>
        );
      default:
        return (
          <div className="w-8 h-8 rounded-full bg-sb-navy-tint text-sb-navy flex items-center justify-center shrink-0">
            <Mic className="w-4 h-4" />
          </div>
        );
    }
  };

  return (
    <div className="flex flex-col min-h-full bg-sb-bg pb-28" data-testid="workbench-queue-pl2">
      {/* 1. Header with Freshness */}
      <PageHeader
        variant="back"
        title="Workbench"
        subtitle={
          <div className="flex items-center gap-1.5 text-caption text-sb-ink-2 font-mono">
            <span>Data Freshness</span>
            <FreshnessClock />
          </div>
        }
        rightAction={
          <div className="flex items-center gap-1">
            <button
              type="button"
              data-testid="queue-sort-btn"
              onClick={() => setSortSheetOpen(true)}
              aria-label="Sort queue"
              className="w-9 h-9 rounded-full flex items-center justify-center text-sb-ink hover:bg-sb-navy-tint transition-colors"
            >
              <ArrowUpDown className="w-4 h-4" />
            </button>
            <button
              type="button"
              data-testid="queue-filter-btn"
              onClick={() => setFilterSheetOpen(true)}
              aria-label="Filter queue"
              className="w-9 h-9 rounded-full flex items-center justify-center text-sb-ink hover:bg-sb-navy-tint transition-colors"
            >
              <Filter className="w-4 h-4" />
            </button>
          </div>
        }
      />

      {/* 2. Underline Tabs (Review · Unmatched · Warnings · Done) */}
      <div className="px-4 pt-2 bg-sb-bg">
        <UnderlineTabs
          tabs={tabs}
          activeId={activeTab}
          onChange={(id) => {
            setActiveTab(id as QueueTab);
            setSelectedIds([]);
          }}
          data-testid="workbench-tabs"
        />
      </div>

      {/* 3. Sub-header Toolbar: Count & Select mode toggle */}
      <div className="px-4 py-2.5 flex items-center justify-between">
        <span className="text-caption font-medium text-sb-ink-2">
          {currentEvents.length} items awaiting review
        </span>

        {activeTab === 'review' && (
          <button
            type="button"
            data-testid="toggle-select-mode-btn"
            onClick={() => {
              setIsSelectMode(!isSelectMode);
              setSelectedIds([]);
            }}
            className={`text-caption font-semibold px-3 py-1 rounded-full border transition-colors ${
              isSelectMode
                ? 'bg-sb-navy text-sb-white border-sb-navy'
                : 'bg-sb-white text-sb-navy border-sb-border hover:bg-sb-bg'
            }`}
          >
            {isSelectMode ? 'Cancel' : 'Select'}
          </button>
        )}
      </div>

      {/* Multi-Select Select-All Bar */}
      {isSelectMode && activeTab === 'review' && (
        <div className="mx-4 mb-2 p-2.5 bg-sb-white rounded-xl border border-sb-border flex items-center justify-between shadow-sm">
          <button
            type="button"
            data-testid="select-all-btn"
            onClick={handleSelectAllSelectable}
            className="flex items-center gap-2 text-caption font-semibold text-sb-navy"
          >
            {selectedIds.length > 0 ? (
              <CheckSquare className="w-4 h-4 text-sb-navy" />
            ) : (
              <Square className="w-4 h-4 text-sb-ink-3" />
            )}
            <span>Select All Eligible</span>
          </button>
          <span className="text-caption font-mono text-sb-ink-3">
            {selectedIds.length} selected
          </span>
        </div>
      )}

      {/* 4. Queue List */}
      <div className="px-4 space-y-2.5">
        {currentEvents.length === 0 ? (
          <div className="p-8 bg-sb-white rounded-2xl border border-sb-border text-center space-y-3 shadow-sm" data-testid="queue-empty-state">
            <CheckCircle2 className="w-10 h-10 text-sb-verified mx-auto" />
            <div className="text-callout font-bold text-sb-navy">Queue is clear</div>
            <div className="text-caption text-sb-ink-3">
              Last approval 3 minutes ago · Data date 20 Sep 2026.
            </div>
            <button
              type="button"
              onClick={() => router.push('/home')}
              className="px-4 py-2 rounded-full bg-sb-navy text-sb-white text-caption font-semibold inline-flex items-center gap-1.5 shadow-sm"
            >
              <span>Go to Home</span>
            </button>
          </div>
        ) : (
          currentEvents.map((evt) => {
            const isEligible = evt.logicCheckStatus === 'Passed';
            const isSelected = selectedIds.includes(evt.id);

            return (
              <div
                key={evt.id}
                data-testid={`event-item-${evt.id}`}
                onClick={() => {
                  if (isSelectMode) {
                    toggleSelect(evt.id, isEligible);
                  } else {
                    router.push(`/workbench/${evt.id}`);
                  }
                }}
                className={`bg-sb-white rounded-xl p-3.5 border transition-all cursor-pointer shadow-sm relative group ${
                  isSelected
                    ? 'border-sb-navy bg-sb-navy-tint/20'
                    : 'border-sb-border hover:border-sb-navy/40'
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* Checkbox (in select mode) or Source Icon */}
                  {isSelectMode ? (
                    <div data-testid={`checkbox-${evt.id}`} className="pt-0.5 shrink-0">
                      {isEligible ? (
                        isSelected ? (
                          <CheckSquare className="w-5 h-5 text-sb-navy" />
                        ) : (
                          <Square className="w-5 h-5 text-sb-ink-3" />
                        )
                      ) : (
                        <div
                          title="Predecessor incomplete"
                          className="w-5 h-5 rounded flex items-center justify-center bg-sb-bg text-sb-ink-3 cursor-not-allowed"
                        >
                          <X className="w-3.5 h-3.5" />
                        </div>
                      )}
                    </div>
                  ) : (
                    renderSourceGlyph(evt.source)
                  )}

                  {/* Content */}
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="font-mono text-[11px] font-bold text-sb-navy">
                          {evt.id}
                        </span>
                        <span className="text-[11px] font-mono text-sb-ink-3">
                          · {evt.timestamp}
                        </span>
                        {evt.authorName && (
                          <span className="text-[11px] text-sb-ink-3 truncate">
                            · {evt.authorName}
                          </span>
                        )}
                      </div>

                      {/* Confidence Badge */}
                      {evt.confidence && (
                        <ConfidenceBadge
                          confidence={evt.confidence}
                          data-testid={`confidence-${evt.id}`}
                        />
                      )}
                    </div>

                    {/* Raw Text */}
                    <div className="text-caption text-sb-ink font-medium line-clamp-2 leading-relaxed">
                      &ldquo;{evt.rawText}&rdquo;
                    </div>

                    {/* Suggested Activity */}
                    <div className="flex items-center justify-between pt-1">
                      {evt.suggestedActivityId ? (
                        <div className="flex items-center gap-1.5 text-[11px] text-sb-ink-2 truncate">
                          <span className="font-mono font-bold text-sb-navy bg-sb-bg px-1.5 py-0.2 rounded">
                            {evt.suggestedActivityId}
                          </span>
                          <span className="truncate">{evt.suggestedActivityName}</span>
                        </div>
                      ) : (
                        <span className="text-[11px] text-sb-critical font-medium">
                          No confident schedule match
                        </span>
                      )}

                      {!isEligible && (
                        <span
                          data-testid={`ineligible-badge-${evt.id}`}
                          className="text-[10px] font-semibold text-sb-critical bg-sb-critical-tint px-2 py-0.5 rounded-full shrink-0"
                        >
                          Predecessor incomplete
                        </span>
                      )}
                    </div>
                  </div>

                  {!isSelectMode && (
                    <ChevronRight className="w-5 h-5 text-sb-ink-3 group-hover:text-sb-navy group-hover:translate-x-0.5 transition-all mt-2 shrink-0" />
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Floating Multi-Select Action Bar */}
      {isSelectMode && activeTab === 'review' && (
        <div
          data-testid="batch-approve-bar"
          className="fixed bottom-20 left-4 right-4 z-40 max-w-sm mx-auto bg-sb-navy text-sb-white rounded-2xl p-3 px-4 shadow-e3 flex items-center justify-between gap-3 animate-in slide-in-from-bottom-4"
        >
          <span className="text-caption font-semibold">
            {selectedIds.length === 0 ? 'Select items to approve' : `${selectedIds.length} items ready`}
          </span>

          <button
            type="button"
            data-testid="batch-approve-btn"
            disabled={selectedIds.length === 0}
            onClick={() => setBatchDiffSheetOpen(true)}
            className={`px-4 py-2 rounded-full text-caption font-bold active:scale-95 transition-all shadow-sm ${
              selectedIds.length > 0
                ? 'bg-sb-white text-sb-navy hover:bg-sb-white/90 cursor-pointer'
                : 'bg-sb-white/30 text-sb-white/60 cursor-not-allowed'
            }`}
          >
            {selectedIds.length > 0
              ? `Approve selected (${selectedIds.length})`
              : 'Approve selected'}
          </button>
        </div>
      )}

      {/* Batch Approval Diff Preview Sheet */}
      <Sheet
        open={batchDiffSheetOpen}
        onOpenChange={setBatchDiffSheetOpen}
        title="Batch Approval Diff Preview"
        description="Verify changes to P6 activities before recording to audit ledger."
        data-testid="batch-diff-sheet"
      >
        <div className="p-4 space-y-4">
          <div className="bg-sb-bg p-3 rounded-xl border border-sb-border space-y-2">
            <div className="text-caption font-bold text-sb-navy">
              Selected Events ({selectedIds.length})
            </div>
            <div className="divide-y divide-sb-border text-[12px]">
              {selectedIds.map((id) => {
                const e = events.find((item) => item.id === id);
                return (
                  <div key={id} className="py-2 flex items-center justify-between">
                    <div>
                      <span className="font-mono font-bold text-sb-navy">{id}</span>
                      <span className="text-sb-ink-2 ml-2">{e?.suggestedActivityId}</span>
                    </div>
                    <span className="text-sb-verified-ink font-semibold">Verified + Progress</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <button
              type="button"
              data-testid="confirm-batch-approve-btn"
              onClick={handleBatchApprove}
              className="w-full py-3 rounded-full bg-sb-navy text-sb-white font-bold text-callout shadow-sm active:scale-95 transition-all"
            >
              Confirm Batch Approval
            </button>
            <button
              type="button"
              onClick={() => setBatchDiffSheetOpen(false)}
              className="w-full py-2.5 rounded-full border border-sb-border text-sb-ink text-caption font-semibold hover:bg-sb-bg"
            >
              Cancel
            </button>
          </div>
        </div>
      </Sheet>

      {/* Sort Sheet */}
      <Sheet
        open={sortSheetOpen}
        onOpenChange={setSortSheetOpen}
        title="Sort Queue"
        data-testid="queue-sort-sheet"
      >
        <div className="p-4 space-y-2">
          {[
            { id: 'priority', label: 'Priority (Default: Warnings then Low Conf)' },
            { id: 'confidence-asc', label: 'Confidence: Low → High' },
            { id: 'newest', label: 'Newest First' },
            { id: 'discipline', label: 'Discipline / Action' },
          ].map((opt) => (
            <button
              key={opt.id}
              type="button"
              data-testid={`sort-option-${opt.id}`}
              onClick={() => {
                setSortBy(opt.id as SortOption);
                setSortSheetOpen(false);
              }}
              className={`w-full p-3 rounded-xl text-left text-callout font-medium flex items-center justify-between transition-colors ${
                sortBy === opt.id
                  ? 'bg-sb-navy text-sb-white font-semibold'
                  : 'hover:bg-sb-bg text-sb-ink'
              }`}
            >
              <span>{opt.label}</span>
              {sortBy === opt.id && <CheckCircle2 className="w-4 h-4" />}
            </button>
          ))}
        </div>
      </Sheet>

      {/* Filter Sheet */}
      <Sheet
        open={filterSheetOpen}
        onOpenChange={setFilterSheetOpen}
        title="Filter Queue"
        data-testid="queue-filter-sheet"
      >
        <div className="p-4 space-y-4">
          <div>
            <div className="text-caption font-bold text-sb-navy mb-2">Source</div>
            <div className="flex flex-wrap gap-2">
              {['all', 'voice', 'excel', 'dpr'].map((src) => (
                <button
                  key={src}
                  type="button"
                  onClick={() => setSourceFilter(src)}
                  className={`px-3 py-1.5 rounded-full text-caption font-semibold capitalize transition-colors ${
                    sourceFilter === src
                      ? 'bg-sb-navy text-sb-white'
                      : 'bg-sb-white border border-sb-border text-sb-ink-2 hover:bg-sb-bg'
                  }`}
                >
                  {src}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2">
            <button
              type="button"
              onClick={() => {
                setSourceFilter('all');
                setContractorFilter('all');
                setFilterSheetOpen(false);
              }}
              className="w-full py-2.5 rounded-full bg-sb-navy text-sb-white text-caption font-semibold"
            >
              Apply Filters
            </button>
          </div>
        </div>
      </Sheet>

      {/* Undo Toast */}
      {toastMessage && (
        <Toast
          open={Boolean(toastMessage)}
          message={toastMessage}
          onClose={() => setToastMessage(null)}
          onUndo={
            undoEventId
              ? async () => {
                  await undoApproval(undoEventId);
                  setToastMessage('Approval undone. Event returned to Review.');
                  setUndoEventId(null);
                }
              : undefined
          }
          undoLabel="Undo"
          duration={8000}
        />
      )}
    </div>
  );
}

export default function WorkbenchPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-sb-bg" />}>
      <WorkbenchContent />
    </Suspense>
  );
}
