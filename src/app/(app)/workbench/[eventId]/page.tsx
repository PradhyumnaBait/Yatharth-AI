'use client';

import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ProjectShell } from '@/components/shell/ProjectShell';
import { ScheduleContext, ScheduleNode } from '@/components/domain/ScheduleContext';
import { EvidenceChain } from '@/components/domain/EvidenceChain';
import { FreshnessClock } from '@/components/domain/FreshnessClock';
import { Sheet } from '@/components/ui/Sheet';
import { Toast } from '@/components/ui/Toast';
import { useEventsStore } from '@/store/events';
import { useActivitiesStore } from '@/store/activities';
import { useAuthStore } from '@/store/auth';
import { matchEventText } from '@/mocks/matcher';
import {
  Play,
  Pause,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  Clock,
  Phone,
  Edit2,
  Check,
  X,
  ExternalLink,
  Split,
  Search,
  Layers,
  ArrowRight,
  Share2,
} from 'lucide-react';
import { FieldEvent, Activity } from '@/services/types';

export default function MatchReviewPage({ params }: { params: { eventId: string } }) {
  const router = useRouter();
  const { user } = useAuthStore();
  const events = useEventsStore((s) => s.events);
  const approveEvent = useEventsStore((s) => s.approveEvent);
  const rejectEvent = useEventsStore((s) => s.rejectEvent);
  const rematchEvent = useEventsStore((s) => s.rematchEvent);
  const askQuestion = useEventsStore((s) => s.askQuestion);
  const undoApproval = useEventsStore((s) => s.undoApproval);
  const activities = useActivitiesStore((s) => s.activities);

  // Review queue list for pager
  const queueEvents = useMemo(() => {
    return events.filter(
      (e) => e.status === 'Review' || e.queueTier === 'Review' || e.queueTier === 'Warning' || e.status === 'Unmatched'
    );
  }, [events]);

  const rawIndex = queueEvents.findIndex((e) => e.id === params.eventId);
  const currentEventIndex = rawIndex >= 0 ? rawIndex : 0;
  const event = events.find((e) => e.id === params.eventId) || queueEvents[currentEventIndex] || queueEvents[0];

  // Shell Tabs
  const [shellTab, setShellTab] = useState('activities');

  // Dynamic editable chips & Live Matching
  const [extractedChips, setExtractedChips] = useState(event?.extractedInfo || {});
  const [activeConfidence, setActiveConfidence] = useState(event?.confidence || 94);
  const [activeActivityId, setActiveActivityId] = useState(event?.suggestedActivityId || 'PIP-24-017');
  const [activeActivityName, setActiveActivityName] = useState(event?.suggestedActivityName || 'Weld Piping System 24-XX');
  const [activeReasons, setActiveReasons] = useState(event?.reasons || []);

  useEffect(() => {
    if (event) {
      setExtractedChips(event.extractedInfo || {});
      setActiveConfidence(event.confidence || 94);
      setActiveActivityId(event.suggestedActivityId || 'PIP-24-017');
      setActiveActivityName(event.suggestedActivityName || 'Weld Piping System 24-XX');
      setActiveReasons(event.reasons || []);
    }
  }, [event]);

  // Audio Player state
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0.35);

  const togglePlay = () => {
    if (isPlaying) {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      setIsPlaying(false);
    } else {
      if (typeof window !== 'undefined' && window.speechSynthesis && event?.rawText) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(event.rawText);
        utterance.rate = 1.0;
        utterance.onend = () => setIsPlaying(false);
        utterance.onerror = () => setIsPlaying(false);
        window.speechSynthesis.speak(utterance);
      }
      setIsPlaying(true);
      let p = audioProgress;
      const timer = setInterval(() => {
        p += 0.05;
        if (p >= 1) {
          clearInterval(timer);
          setIsPlaying(false);
          setAudioProgress(1);
        } else {
          setAudioProgress(p);
        }
      }, 250);
    }
  };

  // Sheets state
  const [diffSheetOpen, setDiffSheetOpen] = useState(false);
  const [whyConfidenceOpen, setWhyConfidenceOpen] = useState(false);
  const [logicCheckOpen, setLogicCheckOpen] = useState(false);
  const [evidenceChainOpen, setEvidenceChainOpen] = useState(false);
  const [transcriptSheetOpen, setTranscriptSheetOpen] = useState(false);
  const [chooseAnotherOpen, setChooseAnotherOpen] = useState(false);
  const [unmatchedSheetOpen, setUnmatchedSheetOpen] = useState(false);
  const [chipEditField, setChipEditField] = useState<string | null>(null);
  const [chipEditValue, setChipEditValue] = useState('');
  const [viewInP6Open, setViewInP6Open] = useState(false);
  const [overrideReason, setOverrideReason] = useState<string>('');
  const [supervisorContactOpen, setSupervisorContactOpen] = useState(false);

  // Toast & Undo
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [undoId, setUndoId] = useState<string | null>(null);

  // Search in Choose Another
  const [candidateSearch, setCandidateSearch] = useState('');
  const [selectedWbsNode, setSelectedWbsNode] = useState<string | null>(null);

  // Distribute variant state
  const [distributeChecked, setDistributeChecked] = useState<string[]>([
    'PIP-30-005',
    'PIP-30-006',
    'PIP-30-007',
  ]);

  // Navigate pager
  const goToNext = useCallback(() => {
    if (currentEventIndex < queueEvents.length - 1) {
      router.push(`/workbench/${queueEvents[currentEventIndex + 1].id}`);
    }
  }, [currentEventIndex, queueEvents, router]);

  const goToPrev = useCallback(() => {
    if (currentEventIndex > 0) {
      router.push(`/workbench/${queueEvents[currentEventIndex - 1].id}`);
    }
  }, [currentEventIndex, queueEvents, router]);

  // Desktop Keyboard Shortcuts: A, C, U, J, K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Avoid firing if typing in inputs
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;

      if (e.key === 'a' || e.key === 'A') {
        e.preventDefault();
        setDiffSheetOpen(true);
      } else if (e.key === 'c' || e.key === 'C') {
        e.preventDefault();
        setChooseAnotherOpen(true);
      } else if (e.key === 'u' || e.key === 'U') {
        e.preventDefault();
        setUnmatchedSheetOpen(true);
      } else if (e.key === 'j' || e.key === 'J') {
        e.preventDefault();
        goToNext();
      } else if (e.key === 'k' || e.key === 'K') {
        e.preventDefault();
        goToPrev();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goToNext, goToPrev]);

  // Live chip edit handler with re-matching
  const handleSaveChipEdit = () => {
    if (!chipEditField || !event) return;
    const updated = { ...extractedChips, [chipEditField]: chipEditValue };
    setExtractedChips(updated);
    setChipEditField(null);

    // Live re-run matching
    const syntheticText = `${updated.action || ''} ${updated.object || ''} ${updated.location || ''} ${updated.status || ''}`;
    const result = matchEventText(syntheticText);
    setActiveConfidence(result.confidence);
    if (result.activityId) {
      setActiveActivityId(result.activityId);
      setActiveActivityName(result.activityName || '');
      setActiveReasons(result.reasons);
    }
    setToastMessage(`Updated ${chipEditField}. Re-evaluated match.`);
  };

  // Approve action
  const handleConfirmApproval = async () => {
    if (!event) return;
    const eventId = event.id;
    await approveEvent(eventId, activeActivityId, user?.name || 'Meera Nair');
    setDiffSheetOpen(false);
    setUndoId(eventId);
    setToastMessage('Approved match');
  };

  // Choose Another action
  const handleSelectAlternative = async (actId: string, actName: string) => {
    if (!event) return;
    await rematchEvent(event.id, actId, 'Manual match override', user?.name || 'Meera Nair');
    setActiveActivityId(actId);
    setActiveActivityName(actName);
    setActiveConfidence(95);
    setChooseAnotherOpen(false);
    setToastMessage(`Rematched to ${actId}`);
  };

  // Unmatched actions
  const handleHoldAndAsk = async () => {
    if (!event) return;
    await askQuestion(event.id, 'Which activity was this work performed against?', user?.name || 'Meera Nair');
    setToastMessage('Clarification request sent to supervisor');
  };

  const handleMarkUnmatched = async (actionType: 'out-of-scope' | 'duplicate' | 'ask') => {
    if (!event) return;
    if (actionType === 'ask') {
      await askQuestion(event.id, 'Which activity was this work performed against?', user?.name || 'Meera Nair');
      setToastMessage('Clarification request sent to supervisor');
    } else {
      await rejectEvent(event.id, actionType === 'out-of-scope' ? 'Out of scope' : 'Duplicate report', user?.name || 'Meera Nair');
      setToastMessage(`Event marked as ${actionType}`);
    }
    setUnmatchedSheetOpen(false);
    goToNext();
  };

  if (!event) {
    return (
      <ProjectShell
        tabs={[
          { id: 'overview', label: 'Overview' },
          { id: 'activities', label: 'Activities', count: 0 },
          { id: 'evidence', label: 'Evidence' },
          { id: 'teams', label: 'Teams' },
        ]}
        activeTabId="activities"
        onTabChange={(t) => router.push(`/project/kandla-panipat-p3?tab=${t}`)}
      >
        <div className="p-8 text-center bg-sb-white rounded-2xl border border-sb-border shadow-sm space-y-3 mt-4" data-testid="all-caught-up-card">
          <CheckCircle2 className="w-12 h-12 text-sb-verified mx-auto" />
          <h2 className="text-title-2 font-bold text-sb-navy">All caught up!</h2>
          <p className="text-caption text-sb-ink-3">
            All events have been reviewed. Data date 20 Sep 2026.
          </p>
          <button
            type="button"
            data-testid="back-to-queue-btn"
            onClick={() => router.push('/workbench')}
            className="px-5 py-2.5 bg-sb-navy text-sb-white rounded-full text-caption font-bold shadow-sm"
          >
            Back to Queue
          </button>
        </div>
      </ProjectShell>
    );
  }

  const isOutOfSequence = event.id === 'E-2093' || event.logicCheckStatus === 'Warning';
  const isAccumulator = event.isAccumulator || event.id === 'E-2091' || event.id === 'E-2092';
  const isDistribute = event.isDistribute || event.id === 'E-2094';
  const isConflict = event.isConflict || event.id === 'E-2097';
  const isUnmatchedVariant = event.id === 'E-2095' || activeConfidence < 60;

  return (
    <ProjectShell
      tabs={[
        { id: 'overview', label: 'Overview' },
        { id: 'activities', label: 'Activities', count: queueEvents.length },
        { id: 'evidence', label: 'Evidence' },
        { id: 'teams', label: 'Teams' },
      ]}
      activeTabId={shellTab}
      onTabChange={(t) => {
        if (t !== 'activities') {
          router.push(`/project/kandla-panipat-p3?tab=${t}`);
        } else {
          setShellTab(t);
        }
      }}
    >
      <div className="space-y-4 pb-28" data-testid="match-review-screen-pl3">
        {/* 1. Header Line with Red Review Count Line & Pager */}
        <div className="flex items-center justify-between pt-1">
          <div>
            <h1 className="text-title-2 font-bold text-sb-navy tracking-tight">
              Activity Matching
            </h1>
            <div className="text-caption font-semibold text-sb-critical" data-testid="review-count-line">
              {queueEvents.length} events require review
            </div>
          </div>

          {/* Pager */}
          <div className="flex items-center gap-1.5 bg-sb-white border border-sb-border rounded-full px-3 py-1 shadow-sm text-caption font-mono">
            <button
              type="button"
              data-testid="pager-prev-btn"
              disabled={currentEventIndex <= 0}
              onClick={goToPrev}
              className="p-0.5 text-sb-ink-3 hover:text-sb-navy disabled:opacity-30 disabled:cursor-not-allowed"
              aria-label="Previous event"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sb-navy font-bold px-1" data-testid="pager-text">
              {currentEventIndex + 1} of {queueEvents.length}
            </span>
            <button
              type="button"
              data-testid="pager-next-btn"
              disabled={currentEventIndex >= queueEvents.length - 1}
              onClick={goToNext}
              className="p-0.5 text-sb-ink-3 hover:text-sb-navy disabled:opacity-30 disabled:cursor-not-allowed"
              aria-label="Next event"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Conflict Variant Banner */}
        {isConflict && (
          <div className="p-3.5 bg-sb-critical-tint rounded-xl border border-sb-critical text-sb-critical space-y-2" data-testid="conflict-banner">
            <div className="flex items-center gap-1.5 text-caption font-bold">
              <AlertTriangle className="w-4 h-4" />
              <span>Conflicting Report Detected</span>
            </div>
            <p className="text-[12px] leading-relaxed">
              Two contractors reported 100% on PIP-24-010 on different dates. Review both reports before verifying.
            </p>
          </div>
        )}

        {/* Out-of-sequence Variant Warning Banner */}
        {isOutOfSequence && (
          <div className="p-3.5 bg-sb-review-tint rounded-xl border border-sb-review text-sb-review-ink space-y-2.5" data-testid="out-of-sequence-banner">
            <div className="flex items-center gap-1.5 text-caption font-bold">
              <AlertTriangle className="w-4 h-4" />
              <span>Out-of-Sequence Warning (Retained Logic)</span>
            </div>
            <p className="text-[12px] leading-relaxed">
              PIP-24-017 is not complete. Approving starts PIP-24-018 out of sequence (Retained Logic). An override reason is required to proceed, or hold and request supervisor confirmation.
            </p>
            <div className="pt-1">
              <button
                type="button"
                data-testid="hold-ask-supervisor-btn"
                onClick={handleHoldAndAsk}
                className="px-3 py-1.5 rounded-full bg-sb-review text-sb-white font-bold text-caption shadow-sm hover:opacity-95 active:scale-95 transition-all"
              >
                Hold & ask supervisor
              </button>
            </div>
          </div>
        )}

        {/* 2. FIELD EVIDENCE Card */}
        <div
          data-testid="field-evidence-card"
          className="bg-sb-white rounded-2xl p-4 border border-sb-border shadow-e1 space-y-3.5 relative"
        >
          <div className="flex items-center justify-between border-b border-sb-border/60 pb-2">
            <span className="text-[11px] font-mono uppercase tracking-wider text-sb-ink-3 font-semibold">
              FIELD EVIDENCE
            </span>
            <span className="text-caption font-mono text-sb-ink-3">
              {event.timestamp} · {event.authorCrew || 'Welding Crew B'}
            </span>
          </div>

          {/* Audio Player Bar */}
          <div className="p-3 bg-sb-bg rounded-xl flex items-center gap-3">
            <button
              type="button"
              data-testid="play-pause-btn"
              onClick={togglePlay}
              className="w-10 h-10 rounded-full bg-sb-navy text-sb-white flex items-center justify-center shrink-0 shadow-sm active:scale-95 transition-all"
              aria-label={isPlaying ? 'Pause evidence' : 'Play evidence'}
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
            </button>

            {/* Scrubbable Waveform */}
            <div className="flex-1 space-y-1">
              <div
                data-testid="audio-waveform"
                className="h-6 flex items-center gap-0.5 cursor-pointer"
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const clickX = e.clientX - rect.left;
                  setAudioProgress(Math.min(1, Math.max(0, clickX / rect.width)));
                }}
              >
                {[4, 12, 18, 10, 22, 14, 8, 16, 24, 20, 15, 9, 14, 20, 16, 12, 6].map((h, i) => {
                  const played = i / 17 <= audioProgress;
                  return (
                    <div
                      key={i}
                      style={{ height: `${h}px` }}
                      className={`flex-1 rounded-full transition-colors ${
                        played ? 'bg-sb-navy' : 'bg-sb-border'
                      }`}
                    />
                  );
                })}
              </div>
              <div className="flex justify-between text-[10px] font-mono text-sb-ink-3">
                <span>00:04</span>
                <span>00:12</span>
              </div>
            </div>
          </div>

          {/* Transcript Snippet */}
          <div
            data-testid="evidence-transcript"
            onClick={() => setTranscriptSheetOpen(true)}
            className="p-3 bg-sb-bg/50 rounded-xl border border-sb-border/60 hover:bg-sb-bg cursor-pointer transition-colors space-y-1"
          >
            <div className="flex items-center justify-between text-[11px] font-mono text-sb-ink-3">
              <span>Transcript</span>
              <span className="text-sb-navy font-semibold">View Details ›</span>
            </div>
            <p className="text-caption text-sb-ink font-medium italic">
              &ldquo;{event.rawText}&rdquo;
            </p>
          </div>

          {/* Extracted Chips (Tappable with live inline edit) */}
          <div className="space-y-1.5">
            <div className="text-[10px] font-mono uppercase tracking-wider text-sb-ink-3 font-semibold">
              Extracted Parameters (Tap to edit)
            </div>
            <div className="flex flex-wrap gap-1.5" data-testid="extracted-chips-container">
              {Object.entries(extractedChips).map(([key, val]) => (
                <button
                  key={key}
                  type="button"
                  data-testid={`chip-${key}`}
                  onClick={() => {
                    setChipEditField(key);
                    setChipEditValue(String(val || ''));
                  }}
                  className="px-3 py-1 rounded-full bg-sb-bg border border-sb-border text-caption font-semibold text-sb-navy hover:border-sb-navy/50 flex items-center gap-1.5 transition-colors"
                >
                  <span className="capitalize">{key}:</span>
                  <span className="font-bold">{String(val)}</span>
                  <span data-testid={`chip-edit-${key}`} className="inline-flex items-center">
                    <Edit2 className="w-2.5 h-2.5 text-sb-ink-3" />
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Supervisor Information Row */}
          <div className="flex items-center justify-between pt-2 border-t border-sb-border/60 text-caption">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-sb-navy text-sb-white text-[11px] font-bold flex items-center justify-center">
                RP
              </div>
              <div>
                <div className="font-bold text-sb-navy">{event.authorName || 'Rahul Patil'}</div>
                <div className="text-[11px] text-sb-ink-3">{event.authorRole || 'Field Supervisor'}</div>
              </div>
            </div>

            <button
              type="button"
              data-testid="call-supervisor-btn"
              onClick={() => setSupervisorContactOpen(true)}
              className="px-3 py-1 rounded-full border border-sb-border text-sb-navy text-caption font-semibold flex items-center gap-1.5 hover:bg-sb-bg"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Call</span>
            </button>
          </div>
        </div>

        {/* 3. AI MATCH Card */}
        <div
          data-testid="ai-match-card"
          className="bg-sb-white rounded-2xl p-4 border border-sb-border shadow-e1 space-y-3.5 relative"
        >
          <div className="flex items-center justify-between border-b border-sb-border/60 pb-2">
            <span className="text-[11px] font-mono uppercase tracking-wider text-sb-ink-3 font-semibold">
              AI MATCH
            </span>

            {/* Logic Check Pill */}
            <button
              type="button"
              data-testid="logic-check-pill"
              onClick={() => setLogicCheckOpen(true)}
              className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold flex items-center gap-1 transition-colors ${
                isOutOfSequence
                  ? 'bg-sb-review-tint text-sb-review-ink'
                  : 'bg-sb-verified-tint text-sb-verified-ink'
              }`}
            >
              {isOutOfSequence ? (
                <AlertTriangle className="w-3 h-3" />
              ) : (
                <CheckCircle2 className="w-3 h-3" />
              )}
              <span>Logic Check: {isOutOfSequence ? 'Warning' : 'Passed'}</span>
            </button>
          </div>

          {/* Activity ID & Confidence */}
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <button
                type="button"
                data-testid="match-activity-id-link"
                onClick={() => router.push(`/activity/${activeActivityId}`)}
                className="text-callout font-bold text-sb-navy hover:underline flex items-center gap-1 text-left"
              >
                <span>{activeActivityId}</span>
                <ExternalLink className="w-3 h-3 text-sb-ink-3" />
              </button>
              <div className="text-caption text-sb-ink-2 font-medium truncate mt-0.5">
                {activeActivityName}
              </div>
            </div>

            {/* 94% num-xl confidence badge */}
            <button
              type="button"
              data-testid="confidence-xl-btn"
              onClick={() => setWhyConfidenceOpen(true)}
              className="text-right shrink-0 hover:opacity-80 transition-opacity"
            >
              <div
                className={`text-[44px] leading-none font-bold tracking-tight ${
                  isUnmatchedVariant
                    ? 'text-sb-ink-3'
                    : activeConfidence >= 90
                    ? 'text-sb-verified-ink'
                    : 'text-sb-review-ink'
                }`}
              >
                {activeConfidence}%
              </div>
              <div className="text-[10px] font-mono text-sb-navy font-semibold underline mt-0.5">
                Why {activeConfidence}%?
              </div>
            </button>
          </div>

          {/* Accumulator Meter Variant */}
          {isAccumulator && (
            <div className="p-3 bg-sb-bg rounded-xl space-y-1.5" data-testid="accumulator-meter-block">
              <div className="flex justify-between text-caption font-semibold">
                <span className="text-sb-navy">
                  17 of 42 spools · 40%
                </span>
                <span className="text-sb-ink-3 font-mono">38% → 40%</span>
              </div>
              <div className="w-full h-2 bg-sb-border rounded-full overflow-hidden">
                <div className="h-full bg-sb-navy rounded-full transition-all" style={{ width: '40%' }} />
              </div>
              <div className="text-[11px] text-sb-ink-3">
                Parent activity remains open. Progress incremented by this event.
              </div>
            </div>
          )}

          {/* Distribute Variant */}
          {isDistribute && (
            <div className="p-3 bg-sb-bg rounded-xl space-y-2" data-testid="distribute-block">
              <div className="text-caption font-bold text-sb-navy flex items-center gap-1.5">
                <Split className="w-4 h-4" />
                <span>This report covers 3 activities:</span>
              </div>
              <div className="space-y-1.5">
                {[
                  { id: 'PIP-30-005', name: 'Weld Joint M-01-J1', conf: 88 },
                  { id: 'PIP-30-006', name: 'Weld Joint M-01-J2', conf: 88 },
                  { id: 'PIP-30-007', name: 'Weld Joint M-01-J3', conf: 88 },
                ].map((item) => (
                  <label key={item.id} className="flex items-center justify-between text-caption p-2 bg-sb-white rounded-lg border border-sb-border">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={distributeChecked.includes(item.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setDistributeChecked([...distributeChecked, item.id]);
                          } else {
                            setDistributeChecked(distributeChecked.filter((id) => id !== item.id));
                          }
                        }}
                        className="w-4 h-4 rounded text-sb-navy focus:ring-sb-navy"
                      />
                      <span className="font-mono font-bold text-sb-navy">{item.id}</span>
                      <span className="text-sb-ink-2">{item.name}</span>
                    </div>
                    <span className="font-mono text-[11px] text-sb-navy font-semibold">{item.conf}%</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Reason Chips */}
          <div className="space-y-1.5">
            <div className="text-[10px] font-mono uppercase tracking-wider text-sb-ink-3 font-semibold">
              Match Reasons (Tap to inspect)
            </div>
            <div className="flex flex-wrap gap-1.5">
              {activeReasons.map((reason, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setTranscriptSheetOpen(true)}
                  className="px-2.5 py-0.5 rounded-full bg-sb-navy-tint text-sb-navy text-[11px] font-semibold border border-sb-navy/20 hover:bg-sb-navy hover:text-sb-white transition-colors"
                >
                  {reason.label}
                </button>
              ))}
            </div>
          </div>

          {/* Evidence Chain Link Chip */}
          <div className="pt-2 border-t border-sb-border/60 flex items-center justify-between text-caption">
            <button
              type="button"
              data-testid="evidence-chain-link"
              onClick={() => setEvidenceChainOpen(true)}
              className="text-caption font-semibold text-sb-navy hover:underline flex items-center gap-1.5"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Evidence Linked (4-step audit chain)</span>
            </button>
            <span className="text-[11px] font-mono text-sb-ink-3">Hash intact</span>
          </div>
        </div>

        {/* 4. Action Buttons (Approve Match · Choose Another · Unmatched) */}
        <div className="space-y-2 pt-1" data-testid="pl3-actions-container">
          {/* Out of Sequence Override Reason Required */}
          {isOutOfSequence && (
            <div data-testid="out-of-sequence-override-box" className="space-y-1.5 bg-sb-white p-3 rounded-xl border border-sb-review">
              <div className="text-[11px] font-bold text-sb-review-ink">
                Select Override Reason (Required to approve):
              </div>
              <div className="flex flex-wrap gap-1.5">
                {[
                  'Work front available',
                  'Contractor demobilisation risk',
                  'PM verbal instruction',
                ].map((reason) => (
                  <button
                    key={reason}
                    type="button"
                    data-testid={`override-reason-${reason.toLowerCase().replace(/\s+/g, '-')}`}
                    onClick={() => setOverrideReason(reason)}
                    className={`px-2.5 py-1 rounded-full text-caption font-semibold transition-colors ${
                      overrideReason === reason
                        ? 'bg-sb-review text-sb-white'
                        : 'bg-sb-bg text-sb-ink-2 hover:bg-sb-border'
                    }`}
                  >
                    {reason}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Approve Match Button */}
          {!isUnmatchedVariant ? (
            <button
              type="button"
              data-testid="approve-match-btn"
              disabled={isOutOfSequence && !overrideReason}
              onClick={() => setDiffSheetOpen(true)}
              className={`w-full h-12 rounded-full font-bold text-callout flex items-center justify-center gap-2 shadow-sm transition-all active:scale-98 ${
                isOutOfSequence && !overrideReason
                  ? 'bg-sb-border text-sb-ink-3 cursor-not-allowed'
                  : 'bg-sb-navy text-sb-white hover:bg-sb-navy-pressed'
              }`}
            >
              <Check className="w-4 h-4" />
              <span>{isOutOfSequence ? 'Approve with Override' : isDistribute ? `Approve ${distributeChecked.length} Activities` : 'Approve Match'}</span>
            </button>
          ) : null}

          {/* Secondary Buttons Row: Choose Another & Unmatched */}
          <div className="flex gap-2">
            <button
              type="button"
              data-testid="choose-another-btn"
              onClick={() => setChooseAnotherOpen(true)}
              className={`flex-1 h-12 rounded-full border text-callout font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                isUnmatchedVariant
                  ? 'bg-sb-navy text-sb-white border-sb-navy'
                  : 'bg-sb-white border-sb-navy text-sb-navy hover:bg-sb-navy-tint/40'
              }`}
            >
              <Search className="w-4 h-4" />
              <span>Choose Another</span>
            </button>

            <button
              type="button"
              data-testid="unmatched-btn"
              onClick={() => setUnmatchedSheetOpen(true)}
              className="flex-1 h-12 rounded-full border border-sb-critical text-sb-critical bg-sb-white text-callout font-semibold flex items-center justify-center gap-1.5 hover:bg-sb-critical-tint/40 transition-colors"
            >
              <X className="w-4 h-4" />
              <span>Unmatched</span>
            </button>
          </div>
        </div>

        {/* 5. Stat Strip (Live Freshness · Verified Today · Pending Review) */}
        <div
          data-testid="pl3-stat-strip"
          className="grid grid-cols-3 gap-2 py-2 border-y border-sb-border"
        >
          <div
            onClick={() => router.push('/workbench?tab=review')}
            className="text-center p-2 rounded-xl bg-sb-white border border-sb-border/60 hover:border-sb-navy cursor-pointer transition-colors"
          >
            <div className="text-[10px] uppercase font-bold text-sb-ink-3">Freshness</div>
            <div className="text-caption font-bold text-sb-navy font-mono mt-0.5">
              <FreshnessClock />
            </div>
          </div>

          <div
            onClick={() => router.push('/workbench?tab=done')}
            className="text-center p-2 rounded-xl bg-sb-white border border-sb-border/60 hover:border-sb-navy cursor-pointer transition-colors"
          >
            <div className="text-[10px] uppercase font-bold text-sb-ink-3">Verified Today</div>
            <div className="text-caption font-bold text-sb-verified-ink font-mono mt-0.5">
              47
            </div>
          </div>

          <div
            onClick={() => router.push('/workbench?tab=review')}
            className="text-center p-2 rounded-xl bg-sb-white border border-sb-border/60 hover:border-sb-navy cursor-pointer transition-colors"
          >
            <div className="text-[10px] uppercase font-bold text-sb-ink-3">Pending Review</div>
            <div className="text-caption font-bold text-sb-review-ink font-mono mt-0.5">
              {queueEvents.length}
            </div>
          </div>
        </div>

        {/* 6. Schedule Context (3-node diagram & View in P6) */}
        <ScheduleContext
          nodes={[
            { id: 'PIP-24-016', name: 'Install Pipe Line 24-XX', status: 'complete' },
            { id: activeActivityId, name: activeActivityName, status: 'active', selected: true },
            { id: 'PIP-24-018', name: 'NDT & Coating Line 24-XX', status: 'not-started' },
          ]}
          onNodeClick={(node) => router.push(`/activity/${node.id}`)}
          onViewInP6Click={() => setViewInP6Open(true)}
        />
      </div>

      {/* --- MODAL SHEETS --- */}

      {/* Diff Preview Approval Sheet */}
      <Sheet
        open={diffSheetOpen}
        onOpenChange={setDiffSheetOpen}
        title="What will change"
        description="P6 activity updates and ledger audit record."
        data-testid="diff-preview-sheet"
      >
        <div className="p-4 space-y-4">
          <div className="bg-sb-bg rounded-xl p-3.5 border border-sb-border space-y-3 font-mono text-[12px]">
            <div className="flex justify-between py-1 border-b border-sb-border/60">
              <span className="text-sb-ink-3 font-sans font-medium">Activity ID</span>
              <span className="font-bold text-sb-navy">{activeActivityId}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-sb-border/60">
              <span className="text-sb-ink-3 font-sans font-medium">Physical %</span>
              <span className="font-bold text-sb-verified-ink">38% → 40%</span>
            </div>
            <div className="flex justify-between py-1 border-b border-sb-border/60">
              <span className="text-sb-ink-3 font-sans font-medium">Actual Start</span>
              <span className="text-sb-ink-2">Unchanged (12 Sep 2026)</span>
            </div>
            <div className="flex justify-between py-1 border-b border-sb-border/60">
              <span className="text-sb-ink-3 font-sans font-medium">Actual Finish</span>
              <span className="text-sb-ink-3">Not set</span>
            </div>
            <div className="flex justify-between py-1 border-b border-sb-border/60">
              <span className="text-sb-ink-3 font-sans font-medium">Evidence</span>
              <span className="text-sb-navy">17 of 42 spools</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-sb-ink-3 font-sans font-medium">Data Date</span>
              <span className="text-sb-navy">20 Sep 2026</span>
            </div>
          </div>

          {overrideReason && (
            <div className="p-2.5 bg-sb-review-tint text-sb-review-ink rounded-lg text-caption font-semibold">
              Override reason recorded: {overrideReason}
            </div>
          )}

          <div className="space-y-2 pt-2">
            <button
              type="button"
              data-testid="confirm-approval-btn"
              onClick={handleConfirmApproval}
              className="w-full py-3 rounded-full bg-sb-navy text-sb-white font-bold text-callout active:scale-95 transition-all shadow-sm"
            >
              Confirm approval
            </button>
            <button
              type="button"
              onClick={() => setDiffSheetOpen(false)}
              className="w-full py-2.5 rounded-full border border-sb-border text-sb-ink text-caption font-semibold hover:bg-sb-bg"
            >
              Cancel
            </button>
          </div>
        </div>
      </Sheet>

      {/* Why 94% Breakdown Sheet */}
      <Sheet
        open={whyConfidenceOpen}
        onOpenChange={setWhyConfidenceOpen}
        title={`Why ${activeConfidence}%?`}
        description="Weighted semantic and structural matching factors."
        data-testid="why-confidence-sheet"
      >
        <div className="p-4 space-y-4">
          <div className="space-y-2.5">
            {[
              { factor: 'Semantic similarity', weight: '0.88' },
              { factor: 'Discipline match (Piping)', weight: '1.00' },
              { factor: 'Location match (Line 24-XX)', weight: '1.00' },
              { factor: 'Action match (Welding)', weight: '1.00' },
              { factor: 'Baseline status active', weight: '1.00' },
            ].map((row, idx) => (
              <div key={idx} className="flex justify-between p-2.5 bg-sb-bg rounded-lg text-caption">
                <span className="text-sb-ink font-medium">{row.factor}</span>
                <span className="font-mono font-bold text-sb-navy">{row.weight}</span>
              </div>
            ))}
          </div>

          <div className="space-y-2 pt-2">
            <div className="text-caption font-bold text-sb-navy">Top Candidate Matches</div>
            {[
              { id: 'PIP-24-017', name: 'Weld Piping System 24-XX', score: 94 },
              { id: 'PIP-24-016', name: 'Install Pipe Line 24-XX', score: 62 },
              { id: 'PIP-24-018', name: 'NDT & Coating Line 24-XX', score: 58 },
            ].map((c) => (
              <div key={c.id} className="flex justify-between items-center p-2.5 bg-sb-white rounded-lg border border-sb-border text-caption">
                <div>
                  <div className="font-bold font-mono text-sb-navy">{c.id}</div>
                  <div className="text-[11px] text-sb-ink-3">{c.name}</div>
                </div>
                <span className="font-mono font-bold text-sb-navy">{c.score}%</span>
              </div>
            ))}
          </div>
        </div>
      </Sheet>

      {/* Logic Check Detail Sheet */}
      <Sheet
        open={logicCheckOpen}
        onOpenChange={setLogicCheckOpen}
        title="Logic Validation Check"
        description="Verification against P6 CPM network and Retained Logic rules."
        data-testid="logic-check-sheet"
      >
        <div className="p-4 space-y-3">
          {[
            { label: 'Predecessors complete', status: isOutOfSequence ? 'Warning' : 'Passed', detail: isOutOfSequence ? 'PIP-24-016 not 100%' : 'All predecessors finished' },
            { label: 'Discipline filter', status: 'Passed', detail: 'Piping matches schedule code' },
            { label: 'Not already 100%', status: 'Passed', detail: 'Current progress 38%' },
            { label: 'Date sanity check', status: 'Passed', detail: 'Update within active window' },
            { label: 'Duplicate report check', status: 'Passed', detail: 'Zero duplicate entries today' },
          ].map((chk, idx) => (
            <div key={idx} className="p-3 bg-sb-bg rounded-xl flex items-center justify-between">
              <div>
                <div className="text-caption font-bold text-sb-navy">{chk.label}</div>
                <div className="text-[11px] text-sb-ink-3">{chk.detail}</div>
              </div>
              <span
                className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                  chk.status === 'Passed'
                    ? 'bg-sb-verified-tint text-sb-verified-ink'
                    : 'bg-sb-review-tint text-sb-review-ink'
                }`}
              >
                {chk.status}
              </span>
            </div>
          ))}
        </div>
      </Sheet>

      {/* Evidence Chain Sheet */}
      <Sheet
        open={evidenceChainOpen}
        onOpenChange={setEvidenceChainOpen}
        title="Evidence Chain"
        description="Immutable 4-step sequence recorded in hash ledger."
        data-testid="evidence-chain-sheet"
      >
        <div className="p-4 space-y-4">
          <EvidenceChain currentStep={3} />
          <div className="p-3 bg-sb-bg rounded-xl font-mono text-[11px] text-sb-ink-3 space-y-1">
            <div>Ledger block: #1,284</div>
            <div>Hash: 8a4f91b3...</div>
            <div>Actor: Rahul Patil (SUP-0412)</div>
          </div>
        </div>
      </Sheet>

      {/* Transcript Detail Sheet */}
      <Sheet
        open={transcriptSheetOpen}
        onOpenChange={setTranscriptSheetOpen}
        title="Transcript Details"
        data-testid="transcript-detail-sheet"
      >
        <div className="p-4 space-y-3">
          <div className="p-3 bg-sb-bg rounded-xl space-y-1">
            <div className="text-[10px] font-mono text-sb-ink-3 uppercase font-semibold">Original Hindi-English</div>
            <div className="text-caption font-medium text-sb-ink">&ldquo;{event.rawText}&rdquo;</div>
          </div>
          <div className="p-3 bg-sb-bg rounded-xl space-y-1">
            <div className="text-[10px] font-mono text-sb-ink-3 uppercase font-semibold">English Normalisation</div>
            <div className="text-caption font-medium text-sb-navy">
              &ldquo;Welding of spool 17 on Line 24-XX is completed.&rdquo;
            </div>
          </div>
          <div className="flex justify-between text-[11px] font-mono text-sb-ink-3 px-1">
            <span>Detected: Hinglish (hi-Latn)</span>
            <span>Device: Android (Mic)</span>
          </div>
        </div>
      </Sheet>

      {/* Inline Chip Edit Sheet */}
      <Sheet
        open={Boolean(chipEditField)}
        onOpenChange={() => setChipEditField(null)}
        title={`Edit ${chipEditField || 'Field'}`}
        description="Re-runs AI matching immediately upon saving."
        data-testid="chip-edit-sheet"
      >
        <div className="p-4 space-y-3">
          <input
            type="text"
            data-testid="chip-edit-input"
            value={chipEditValue}
            onChange={(e) => setChipEditValue(e.target.value)}
            className="w-full p-3 bg-sb-bg rounded-xl border border-sb-border text-callout font-semibold text-sb-navy focus:outline-none focus:border-sb-navy"
            autoFocus
          />
          <button
            type="button"
            data-testid="chip-edit-save-btn"
            onClick={handleSaveChipEdit}
            className="w-full py-3 rounded-full bg-sb-navy text-sb-white font-bold text-caption active:scale-95 transition-all shadow-sm"
          >
            Save & Re-run Matching
          </button>
        </div>
      </Sheet>

      {/* Choose Another Activity Sheet */}
      <Sheet
        open={chooseAnotherOpen}
        onOpenChange={setChooseAnotherOpen}
        title="Choose Another Activity"
        description="Select from schedule candidates or browse WBS tree."
        data-testid="choose-another-sheet"
      >
        <div className="p-4 space-y-3">
          <div className="relative">
            <input
              type="text"
              data-testid="candidate-search-input"
              value={candidateSearch}
              onChange={(e) => setCandidateSearch(e.target.value)}
              placeholder="Search activity by code or name..."
              className="w-full p-2.5 pl-9 bg-sb-bg rounded-xl border border-sb-border text-caption font-medium"
            />
            <Search className="w-4 h-4 text-sb-ink-3 absolute left-3 top-3" />
          </div>

          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
            {activities
              .filter((a) =>
                candidateSearch
                  ? a.id.toLowerCase().includes(candidateSearch.toLowerCase()) ||
                    a.name.toLowerCase().includes(candidateSearch.toLowerCase())
                  : true
              )
              .slice(0, 5)
              .map((act) => (
                <div
                  key={act.id}
                  data-testid={`candidate-option-${act.id}`}
                  onClick={() => handleSelectAlternative(act.id, act.name)}
                  className="p-3 bg-sb-white rounded-xl border border-sb-border hover:border-sb-navy cursor-pointer transition-all flex items-center justify-between"
                >
                  <div>
                    <div className="font-mono font-bold text-sb-navy text-caption">{act.id}</div>
                    <div className="text-[11px] text-sb-ink-2">{act.name}</div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-sb-ink-3" />
                </div>
              ))}
          </div>
        </div>
      </Sheet>

      {/* Unmatched Sheet */}
      <Sheet
        open={unmatchedSheetOpen}
        onOpenChange={setUnmatchedSheetOpen}
        title="Why doesn't this match?"
        description="Select a resolution action for this unverified event."
        data-testid="unmatched-sheet"
      >
        <div className="p-4 space-y-2.5">
          <button
            type="button"
            data-testid="unmatched-ask-supervisor-btn"
            onClick={() => handleMarkUnmatched('ask')}
            className="w-full p-3 rounded-xl border border-sb-border hover:bg-sb-bg text-left transition-colors flex items-center justify-between"
          >
            <div>
              <div className="text-caption font-bold text-sb-navy">Ask supervisor for clarification</div>
              <div className="text-[11px] text-sb-ink-3">Sets status to Reply Needed</div>
            </div>
            <ArrowRight className="w-4 h-4 text-sb-navy" />
          </button>

          <button
            type="button"
            data-testid="unmatched-out-of-scope-btn"
            onClick={() => handleMarkUnmatched('out-of-scope')}
            className="w-full p-3 rounded-xl border border-sb-border hover:bg-sb-bg text-left transition-colors flex items-center justify-between"
          >
            <div>
              <div className="text-caption font-bold text-sb-navy">Mark out-of-scope work</div>
              <div className="text-[11px] text-sb-ink-3">Not part of current baseline package</div>
            </div>
            <ArrowRight className="w-4 h-4 text-sb-navy" />
          </button>

          <button
            type="button"
            data-testid="unmatched-duplicate-btn"
            onClick={() => handleMarkUnmatched('duplicate')}
            className="w-full p-3 rounded-xl border border-sb-border hover:bg-sb-bg text-left transition-colors flex items-center justify-between"
          >
            <div>
              <div className="text-caption font-bold text-sb-navy">Reject as duplicate report</div>
              <div className="text-[11px] text-sb-ink-3">Already captured in earlier submission</div>
            </div>
            <ArrowRight className="w-4 h-4 text-sb-navy" />
          </button>
        </div>
      </Sheet>

      {/* View in P6 In-App Network Modal */}
      <Sheet
        open={viewInP6Open}
        onOpenChange={setViewInP6Open}
        title="P6 CPM Network View"
        description="Baseline: P6 XER v3, imported 12 Sep 2026."
        data-testid="view-p6-sheet"
      >
        <div className="p-4 space-y-4">
          <div className="p-4 bg-sb-bg rounded-xl border border-sb-border space-y-3">
            <div className="text-caption font-bold text-sb-navy">
              Activity Logic Chain (2 levels)
            </div>

            <div className="space-y-2">
              <div className="p-2.5 bg-sb-white rounded-lg border border-sb-border flex items-center justify-between text-[11px]">
                <span className="font-mono font-bold text-sb-navy">PIP-24-016 (FS Lag 0)</span>
                <span className="px-2 py-0.5 rounded bg-sb-verified-tint text-sb-verified-ink font-semibold">100% Finished</span>
              </div>
              <div className="p-2.5 bg-sb-navy text-sb-white rounded-lg flex items-center justify-between text-[11px] font-bold">
                <span className="font-mono">{activeActivityId} (Current)</span>
                <span className="font-mono">38% In Progress</span>
              </div>
              <div className="p-2.5 bg-sb-white rounded-lg border border-sb-border flex items-center justify-between text-[11px]">
                <span className="font-mono font-bold text-sb-navy">PIP-24-018 (FS Lag 0)</span>
                <span className="px-2 py-0.5 rounded bg-sb-bg text-sb-ink-3 font-semibold">0% Not Started</span>
              </div>
            </div>
          </div>
        </div>
      </Sheet>

      {/* Supervisor Contact Sheet */}
      <Sheet
        open={supervisorContactOpen}
        onOpenChange={setSupervisorContactOpen}
        title="Contact Supervisor"
        description="Connect with field supervisor regarding this event."
        data-testid="supervisor-contact-sheet"
      >
        <div className="p-4 space-y-4">
          <div className="flex items-center gap-3 p-3 bg-sb-bg rounded-xl border border-sb-border">
            <div className="w-10 h-10 rounded-full bg-sb-navy text-sb-white font-bold flex items-center justify-center">
              RP
            </div>
            <div>
              <div className="font-bold text-sb-navy">{event.authorName || 'Rahul Patil'}</div>
              <div className="text-[12px] text-sb-ink-2">
                {event.authorRole || 'Field Supervisor'} · {event.authorCrew || 'Welding Crew B'}
              </div>
              <div className="text-[12px] font-mono text-sb-ink-3">+91 98201 23456</div>
            </div>
          </div>

          <a
            href="tel:+919820123456"
            data-testid="supervisor-tel-link"
            className="w-full py-3 rounded-full bg-sb-navy text-sb-white font-bold text-callout shadow-sm flex items-center justify-center gap-2"
          >
            <Phone className="w-4 h-4" />
            <span>Call Rahul Patil (+91 98201 23456)</span>
          </a>
        </div>
      </Sheet>

      {/* 8s Undo Toast */}
      {toastMessage && (
        <Toast
          open={Boolean(toastMessage)}
          message={toastMessage}
          onClose={() => setToastMessage(null)}
          onUndo={
            undoId
              ? async () => {
                  await undoApproval(undoId);
                  setToastMessage('Approval undone. Changes reverted.');
                  setUndoId(null);
                }
              : undefined
          }
          undoLabel="Undo"
          duration={8000}
        />
      )}
    </ProjectShell>
  );
}
