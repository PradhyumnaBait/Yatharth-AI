'use client';

import React, { useState, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { PageHeader } from '@/components/shell/PageHeader';
import { UnderlineTabs, TabItem } from '@/components/ui/UnderlineTabs';
import { StatusPill } from '@/components/ui/StatusPill';
import { Sheet } from '@/components/ui/Sheet';
import { Toast } from '@/components/ui/Toast';
import { useEventsStore } from '@/store/events';
import { useOfflineStore, QueuedReport } from '@/store/offline';
import { useAuthStore } from '@/store/auth';
import { demoNow } from '@/mocks/clock';
import {
  Filter,
  RefreshCw,
  MessageSquare,
  ChevronRight,
  RotateCw,
  Trash2,
  CloudUpload,
  Mic,
  Camera,
  FileSpreadsheet,
  FileText,
  AlertCircle,
  Clock,
} from 'lucide-react';
import { FieldEvent } from '@/services/types';
import { useTranslation } from '@/i18n/useTranslation';

type ReportTab = 'today' | 'drafts' | 'queued' | 'history';

function ReportsPageContent() {
  const router = useRouter();
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const tabParam = (searchParams.get('tab') || 'today').toLowerCase() as ReportTab;
  const initialTab = ['today', 'drafts', 'queued', 'history'].includes(tabParam) ? tabParam : 'today';

  const { user } = useAuthStore();
  const events = useEventsStore((s) => s.events);
  const queuedReports = useOfflineStore((s) => s.queuedReports);
  const removeQueuedReport = useOfflineStore((s) => s.removeQueuedReport);
  const addEvent = useEventsStore((s) => s.addEvent);

  const [activeTab, setActiveTab] = useState<string>(initialTab);
  const [crewFilter, setCrewFilter] = useState<'mine' | 'all'>('mine');
  const [lastRefreshed, setLastRefreshed] = useState<string>('Just now');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Events requiring supervisor reply
  const replyNeededEvents = useMemo(() => {
    return events.filter((e) => e.status === 'Reply needed');
  }, [events]);

  // Tab items with dynamic counts
  const reportTabs: TabItem[] = [
    { id: 'today', label: t('reports.today'), count: events.filter((e) => e.status === 'Verified' || e.status === 'Review').length },
    { id: 'drafts', label: t('reports.drafts') },
    { id: 'queued', label: t('reports.queued'), count: queuedReports.length > 0 ? queuedReports.length : undefined },
    { id: 'history', label: t('reports.history') },
  ];

  // Filtered events
  const displayedEvents = useMemo(() => {
    return events.filter((e) => {
      if (crewFilter === 'mine' && e.authorName !== (user?.name || 'Rahul Patil')) {
        return false;
      }
      if (selectedStatus !== 'All' && e.status !== selectedStatus) {
        return false;
      }
      return true;
    });
  }, [events, crewFilter, user?.name, selectedStatus]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      const now = demoNow();
      setLastRefreshed(`${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`);
      setToastMessage('Reports refreshed');
    }, 400);
  };

  const handleSyncQueued = () => {
    const count = queuedReports.length;
    if (count === 0) return;

    queuedReports.forEach((q) => {
      addEvent({
        rawText: q.rawText,
        source: 'voice',
        timestamp: q.timestamp,
        authorName: user?.name || 'Rahul Patil',
        status: 'Review',
      });
      removeQueuedReport(q.id);
    });

    setToastMessage(`${count} offline reports synced to schedule.`);
  };

  const handleRetryReport = (report: QueuedReport) => {
    addEvent({
      rawText: report.rawText,
      source: 'voice',
      timestamp: report.timestamp,
      authorName: user?.name || 'Rahul Patil',
      status: 'Review',
    });
    removeQueuedReport(report.id);
    setToastMessage('Report sent successfully.');
  };

  return (
    <div className="flex flex-col min-h-full bg-sb-bg pb-24" data-testid="reports-screen-su3">
      {/* 1. Header */}
      <PageHeader
        variant="back"
        title={t('reports.title')}
        subtitle="Supervisor Execution Log"
        rightAction={
          <button
            type="button"
            data-testid="reports-filter-btn"
            onClick={() => setFilterSheetOpen(true)}
            aria-label={t('reports.filter')}
            className="w-10 h-10 rounded-full flex items-center justify-center text-sb-ink hover:bg-sb-navy-tint transition-colors"
          >
            <Filter className="w-5 h-5" />
          </button>
        }
      />

      {/* 2. Priority Reply Needed Banner if planner asked a question */}
      {replyNeededEvents.length > 0 && (
        <div className="px-4 pt-3">
          <div
            data-testid="planner-reply-banner"
            onClick={() => router.push(`/event/${replyNeededEvents[0].id}`)}
            className="w-full p-3.5 rounded-xl bg-sb-navy-tint border border-sb-navy/30 flex items-center justify-between cursor-pointer hover:bg-sb-navy-tint/80 transition-colors shadow-sm"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-sb-navy text-sb-white flex items-center justify-center shrink-0">
                <MessageSquare className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="text-caption font-bold text-sb-navy flex items-center gap-1.5">
                  <span>{replyNeededEvents.length} questions from your planner</span>
                  <span className="w-2 h-2 rounded-full bg-sb-critical" />
                </div>
                <div className="text-[11px] text-sb-ink-2 truncate">
                  &ldquo;{replyNeededEvents[0].questions?.[0]?.text || 'Which spool or line was this for?'}&rdquo;
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1 text-caption font-semibold text-sb-navy shrink-0 ml-2">
              <span>Reply</span>
              <ChevronRight className="w-4 h-4" />
            </div>
          </div>
        </div>
      )}

      {/* 3. Mine | All Crews Segmented Switcher & Refresh Bar */}
      <div className="px-4 pt-3 flex items-center justify-between gap-3">
        <div className="flex items-center bg-sb-white border border-sb-border rounded-xl p-1 shadow-sm">
          <button
            type="button"
            data-testid="reports-segment-mine"
            onClick={() => setCrewFilter('mine')}
            className={`px-3 py-1 rounded-lg text-caption font-semibold transition-colors ${
              crewFilter === 'mine' ? 'bg-sb-navy text-sb-white' : 'text-sb-ink-3 hover:text-sb-ink'
            }`}
          >
            Mine
          </button>
          <button
            type="button"
            data-testid="reports-segment-all"
            onClick={() => setCrewFilter('all')}
            className={`px-3 py-1 rounded-lg text-caption font-semibold transition-colors ${
              crewFilter === 'all' ? 'bg-sb-navy text-sb-white' : 'text-sb-ink-3 hover:text-sb-ink'
            }`}
          >
            All Crews
          </button>
        </div>

        <button
          type="button"
          data-testid="reports-refresh-btn"
          onClick={handleRefresh}
          className="flex items-center gap-1 text-[11px] font-mono text-sb-ink-3 hover:text-sb-navy transition-colors py-1 px-2 rounded-lg bg-sb-white border border-sb-border"
        >
          <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span>{lastRefreshed}</span>
        </button>
      </div>

      {/* 4. Underline Tabs (Today · Drafts · Queued · History) */}
      <div className="px-4 pt-2 bg-sb-bg">
        <UnderlineTabs
          tabs={reportTabs}
          activeId={activeTab}
          onChange={setActiveTab}
        />
      </div>

      {/* 5. Tab Body Content */}
      <div className="p-4 space-y-3">
        {/* TODAY TAB */}
        {activeTab.toLowerCase() === 'today' && (
          <div className="space-y-2.5" data-testid="reports-today-list">
            {displayedEvents.length === 0 ? (
              <div className="p-8 bg-sb-white rounded-2xl border border-sb-border text-center space-y-3">
                <AlertCircle className="w-8 h-8 text-sb-ink-3 mx-auto" />
                <div className="text-caption text-sb-ink-3">
                  Nothing reported yet. Tap the mic to send your first update.
                </div>
                <button
                  type="button"
                  onClick={() => router.push('/capture')}
                  className="px-4 py-2 bg-sb-navy text-sb-white rounded-full text-caption font-semibold inline-flex items-center gap-1.5"
                >
                  <Mic className="w-4 h-4" />
                  <span>Open Capture</span>
                </button>
              </div>
            ) : (
              displayedEvents.map((evt) => (
                <div
                  key={evt.id}
                  data-testid={`report-row-${evt.id}`}
                  onClick={() => router.push(`/event/${evt.id}`)}
                  className="bg-sb-white rounded-xl p-3.5 border border-sb-border shadow-sm hover:border-sb-navy/50 cursor-pointer transition-colors flex items-start justify-between gap-3 group"
                >
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[11px] font-bold text-sb-navy">{evt.id}</span>
                      <span className="text-[11px] text-sb-ink-3 font-mono">· {evt.timestamp}</span>
                      <StatusPill status={evt.status} />
                    </div>

                    <div className="text-caption text-sb-ink font-medium line-clamp-1 group-hover:text-sb-navy">
                      &ldquo;{evt.rawText}&rdquo;
                    </div>

                    <div className="flex items-center gap-3 text-[11px] text-sb-ink-3">
                      <span>{evt.authorName}</span>
                      {evt.confidence && (
                        <span className="text-sb-navy font-semibold font-mono">
                          {evt.confidence}% match
                        </span>
                      )}
                    </div>
                  </div>

                  <ChevronRight className="w-5 h-5 text-sb-ink-3 group-hover:text-sb-navy group-hover:translate-x-0.5 transition-all mt-1" />
                </div>
              ))
            )}
          </div>
        )}

        {/* DRAFTS TAB */}
        {activeTab.toLowerCase() === 'drafts' && (
          <div className="p-8 bg-sb-white rounded-2xl border border-sb-border text-center space-y-2" data-testid="reports-drafts-list">
            <FileText className="w-8 h-8 text-sb-ink-3 mx-auto" />
            <div className="text-caption text-sb-ink-3">No drafts.</div>
          </div>
        )}

        {/* QUEUED TAB */}
        {activeTab.toLowerCase() === 'queued' && (
          <div className="space-y-3" data-testid="reports-queued-list">
            {queuedReports.length > 0 && (
              <div className="flex items-center justify-between p-3 bg-sb-white rounded-xl border border-sb-border">
                <span className="text-caption text-sb-ink-2 font-medium">
                  {queuedReports.length} pending offline uploads
                </span>
                <button
                  type="button"
                  data-testid="sync-queued-now-btn"
                  onClick={handleSyncQueued}
                  className="px-3 py-1.5 bg-sb-navy text-sb-white rounded-full text-caption font-semibold flex items-center gap-1.5 shadow-sm active:scale-95 transition-all"
                >
                  <CloudUpload className="w-3.5 h-3.5" />
                  <span>Sync now</span>
                </button>
              </div>
            )}

            {queuedReports.length === 0 ? (
              <div className="p-8 bg-sb-white rounded-2xl border border-sb-border text-center space-y-2">
                <CloudUpload className="w-8 h-8 text-sb-verified mx-auto" />
                <div className="text-caption text-sb-ink-3 font-medium">Everything is sent.</div>
              </div>
            ) : (
              queuedReports.map((q) => (
                <div
                  key={q.id}
                  data-testid={`queued-row-${q.id}`}
                  className="bg-sb-white rounded-xl p-3.5 border border-sb-border shadow-sm space-y-2"
                >
                  <div className="flex items-center justify-between text-[11px] font-mono text-sb-ink-3">
                    <span className="font-bold text-sb-navy">{q.id}</span>
                    <span>{q.timestamp}</span>
                  </div>

                  <div className="text-caption text-sb-ink font-medium">
                    &ldquo;{q.rawText}&rdquo;
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-sb-border/60">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sb-review-tint text-sb-review-ink font-semibold">
                      Stored Offline
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        data-testid={`retry-queued-${q.id}`}
                        onClick={() => handleRetryReport(q)}
                        className="px-2.5 py-1 text-[11px] font-semibold text-sb-navy border border-sb-border rounded-lg hover:bg-sb-bg flex items-center gap-1"
                      >
                        <RotateCw className="w-3 h-3" />
                        <span>Retry</span>
                      </button>

                      <button
                        type="button"
                        data-testid={`delete-queued-${q.id}`}
                        onClick={() => removeQueuedReport(q.id)}
                        className="p-1.5 text-sb-critical hover:bg-sb-critical-tint rounded-lg"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* HISTORY TAB */}
        {activeTab.toLowerCase() === 'history' && (
          <div className="p-8 bg-sb-white rounded-2xl border border-sb-border text-center space-y-2" data-testid="reports-history-list">
            <Clock className="w-8 h-8 text-sb-ink-3 mx-auto" />
            <div className="text-caption text-sb-ink-3">No earlier reports.</div>
          </div>
        )}
      </div>

      {/* Filter Bottom Sheet */}
      <Sheet
        open={filterSheetOpen}
        onOpenChange={setFilterSheetOpen}
        title="Filter Field Reports"
        description="Filter by verification status and reporting crew."
      >
        <div className="p-4 space-y-4">
          <div>
            <div className="text-caption font-semibold text-sb-navy mb-2">Status</div>
            <div className="flex flex-wrap gap-2">
              {['All', 'Verified', 'Review', 'Delay', 'Reply needed'].map((st) => (
                <button
                  key={st}
                  type="button"
                  data-testid={`filter-status-${st.toLowerCase().replace(/\s+/g, '-')}`}
                  onClick={() => setSelectedStatus(st)}
                  className={`px-3 py-1.5 rounded-full text-caption font-medium border ${
                    selectedStatus === st
                      ? 'bg-sb-navy text-sb-white border-sb-navy font-semibold'
                      : 'bg-sb-white text-sb-ink-2 border-sb-border hover:bg-sb-bg'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={() => setFilterSheetOpen(false)}
            className="w-full py-2.5 bg-sb-navy text-sb-white rounded-full text-caption font-semibold"
          >
            Apply Filters
          </button>
        </div>
      </Sheet>

      {/* Feedback Toast */}
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

export default function ReportsPage() {
  return (
    <React.Suspense fallback={<div className="min-h-full bg-sb-bg" />}>
      <ReportsPageContent />
    </React.Suspense>
  );
}
