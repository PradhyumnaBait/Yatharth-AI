'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ProjectShell } from '@/components/shell/ProjectShell';
import { ScheduleContext, ScheduleNode } from '@/components/domain/ScheduleContext';
import { EvidenceChain } from '@/components/domain/EvidenceChain';
import { FreshnessClock } from '@/components/domain/FreshnessClock';
import { ConfidenceBadge } from '@/components/domain/ConfidenceBadge';
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
  Phone,
  Edit2,
  Check,
  X,
  ExternalLink,
  Split,
  Search,
  Layers,
  ArrowRight,
  Sparkles,
  Volume2,
  GitCommit,
  Clock,
  ShieldCheck,
  CornerDownRight,
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
      setActiveReasons(
        event.reasons && event.reasons.length > 0
          ? event.reasons
          : [
              { label: 'Discipline Match: Piping WBS KP3.PIPING.RACK4', matchedText: 'Spool 17' },
              { label: 'Location Alignment: Rack 4 (KP 182.4)', matchedText: 'Rack 4' },
              { label: 'Precedence Check: Predecessor PIP-24-016 complete', matchedText: '100% complete' },
            ]
      );
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
  const targetActivity = activities.find((a) => a.id === activeActivityId);

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
        {/* Top Header Bar & Queue Pager */}
        <div className="flex items-center justify-between pt-1 pb-1">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-title-2 font-bold text-sb-navy tracking-tight">
                Review Workbench
              </h1>
              <span className="font-mono text-caption px-2 py-0.5 rounded-full bg-sb-navy-tint text-sb-navy font-bold">
                {event.id}
              </span>
            </div>
            <div className="text-caption font-semibold text-sb-critical mt-0.5" data-testid="review-count-line">
              {queueEvents.length} events require planner review
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

        {/* Conflict Warning Banner */}
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

        {/* Out-of-sequence Warning Banner */}
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

        {/* ========================================================================= */}
        {/* ZONE 1: FIELD EVIDENCE                                                    */}
        {/* ========================================================================= */}
        <div
          data-testid="field-evidence-card"
          className="bg-sb-white rounded-2xl p-5 border border-sb-border shadow-e2 space-y-4 relative"
        >
          {/* Zone 1 Header */}
          <div className="flex items-center justify-between border-b border-sb-border/60 pb-2.5">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-600" />
              <span className="text-[11px] font-mono uppercase tracking-wider text-sb-ink-3 font-bold">
                ZONE 1 · FIELD EVIDENCE
              </span>
            </div>
            <span className="text-caption font-mono text-sb-ink-3">
              {event.timestamp} · {event.authorCrew || 'Welding Crew B'}
            </span>
          </div>

          {/* Audio Player Bar */}
          <div className="p-3.5 bg-sb-bg rounded-xl border border-sb-border flex items-center gap-3.5 shadow-2xs">
            <button
              type="button"
              data-testid="play-pause-btn"
              onClick={togglePlay}
              className="w-11 h-11 rounded-full bg-sb-navy text-sb-white flex items-center justify-center shrink-0 shadow-sm active:scale-95 hover:bg-sb-navy-pressed transition-all"
              aria-label={isPlaying ? 'Pause evidence' : 'Play evidence'}
            >
              {isPlaying ? <Pause className="w-4.5 h-4.5" /> : <Play className="w-4.5 h-4.5 ml-0.5" />}
            </button>

            {/* Scrubbable Waveform */}
            <div className="flex-1 space-y-1.5">
              <div
                data-testid="audio-waveform"
                className="h-7 flex items-center gap-1 cursor-pointer"
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
                        played ? 'bg-sb-navy' : 'bg-sb-border hover:bg-sb-navy/40'
                      }`}
                    />
                  );
                })}
              </div>
              <div className="flex justify-between text-[10px] font-mono text-sb-ink-3">
                <span>00:04</span>
                <span className="font-semibold text-sb-navy">Original Voice Recording</span>
                <span>00:12</span>
              </div>
            </div>
          </div>

          {/* Spoken Transcript Quote */}
          <div
            data-testid="evidence-transcript"
            onClick={() => setTranscriptSheetOpen(true)}
            className="p-3.5 bg-sb-bg/80 rounded-xl border border-sb-border hover:border-sb-navy/40 cursor-pointer transition-all space-y-1"
          >
            <div className="flex items-center justify-between text-[11px] font-mono text-sb-ink-3">
              <span className="flex items-center gap-1 text-sb-navy font-semibold">
                <Volume2 className="w-3.5 h-3.5" />
                <span>ASR Spoken Transcript</span>
              </span>
              <span className="text-sb-navy font-bold hover:underline">View Full Details ›</span>
            </div>
            <p className="text-caption text-sb-ink font-medium italic leading-relaxed">
              &ldquo;{event.rawText}&rdquo;
            </p>
          </div>

          {/* Extracted Parameter Chips with Live Inline Edit */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-wider text-sb-ink-3 font-semibold px-0.5">
              <span>Extracted Engineering Parameters</span>
              <span className="text-[9px] text-sb-ink-3">Tap chip to edit</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2" data-testid="extracted-chips-container">
              {Object.entries(extractedChips).map(([key, val]) => (
                <button
                  key={key}
                  type="button"
                  data-testid={`chip-${key}`}
                  onClick={() => {
                    setChipEditField(key);
                    setChipEditValue(String(val || ''));
                  }}
                  className="p-2.5 rounded-xl bg-sb-bg border border-sb-border hover:border-sb-navy text-left transition-all group shadow-2xs"
                >
                  <div className="flex items-center justify-between text-[10px] uppercase font-bold text-sb-ink-3">
                    <span className="capitalize">{key}</span>
                    <Edit2 className="w-2.5 h-2.5 text-sb-ink-3 opacity-40 group-hover:opacity-100" />
                  </div>
                  <div className="font-bold text-caption text-sb-navy truncate mt-0.5">
                    {String(val)}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Supervisor Attribution Row */}
          <div className="flex items-center justify-between pt-2 border-t border-sb-border/60 text-caption">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-sb-navy text-sb-white text-[11px] font-bold flex items-center justify-center shadow-2xs">
                {event.authorName ? event.authorName.split(' ').map((n) => n[0]).join('').slice(0, 2) : 'RP'}
              </div>
              <div>
                <div className="font-bold text-sb-navy">{event.authorName || 'Rahul Patil'}</div>
                <div className="text-[11px] text-sb-ink-3">{event.authorRole || 'Field Supervisor'} · {event.authorCrew || 'Welding Crew B'}</div>
              </div>
            </div>

            <button
              type="button"
              data-testid="call-supervisor-btn"
              onClick={() => setSupervisorContactOpen(true)}
              className="px-3.5 py-1.5 rounded-full border border-sb-border text-sb-navy text-caption font-bold flex items-center gap-1.5 hover:bg-sb-bg shadow-2xs active:scale-95 transition-all"
            >
              <Phone className="w-3.5 h-3.5 text-sb-navy" />
              <span>Contact Supervisor</span>
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* ZONE 2: AI MATCH + CONFIDENCE + REASONING CHIPS                           */}
        {/* ========================================================================= */}
        <div
          data-testid="ai-match-card"
          className="bg-sb-white rounded-2xl p-5 border border-sb-border shadow-e2 space-y-4 relative"
        >
          {/* Zone 2 Header */}
          <div className="flex items-center justify-between border-b border-sb-border/60 pb-2.5">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-600" />
              <span className="text-[11px] font-mono uppercase tracking-wider text-sb-ink-3 font-bold">
                ZONE 2 · AI MATCH & REASONING
              </span>
            </div>

            {/* Logic Check Pill */}
            <button
              type="button"
              data-testid="logic-check-pill"
              onClick={() => setLogicCheckOpen(true)}
              className={`px-3 py-1 rounded-full text-[11px] font-bold flex items-center gap-1.5 transition-colors shadow-2xs ${
                isOutOfSequence
                  ? 'bg-sb-review-tint text-sb-review-ink border border-sb-review/30'
                  : 'bg-sb-verified-tint text-sb-verified-ink border border-sb-verified/30'
              }`}
            >
              {isOutOfSequence ? (
                <AlertTriangle className="w-3.5 h-3.5" />
              ) : (
                <CheckCircle2 className="w-3.5 h-3.5 text-sb-verified" />
              )}
              <span>Logic Check: {isOutOfSequence ? 'Warning' : 'Passed'}</span>
            </button>
          </div>

          {/* Matched Activity Hero Box & Large Confidence Display */}
          <div className="p-4 rounded-xl bg-sb-bg border border-sb-border flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1 space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-sb-navy bg-sb-navy-tint px-2 py-0.5 rounded">
                  P6 Match
                </span>
                <span className="text-[11px] font-mono text-sb-ink-3">
                  WBS: KP3.PIPING.RACK4
                </span>
              </div>
              <button
                type="button"
                data-testid="match-activity-id-link"
                onClick={() => router.push(`/activity/${activeActivityId}`)}
                className="text-title-3 font-bold text-sb-navy hover:underline flex items-center gap-1.5 text-left"
              >
                <span>{activeActivityId}</span>
                <ExternalLink className="w-4 h-4 text-sb-ink-3" />
              </button>
              <div className="text-caption text-sb-ink font-semibold">
                {activeActivityName}
              </div>
              <div className="text-[11px] font-mono text-sb-ink-3 pt-0.5">
                Physical Progress: <span className="font-bold text-sb-navy">{targetActivity?.physicalPercent || 38}%</span> → <span className="font-bold text-sb-verified-ink">40% (+2% delta)</span>
              </div>
            </div>

            {/* Prominent Confidence Score Badge using shared ConfidenceBadge */}
            <button
              type="button"
              data-testid="confidence-xl-btn"
              onClick={() => setWhyConfidenceOpen(true)}
              className="text-right shrink-0 p-2 rounded-xl hover:bg-sb-white transition-all group border border-transparent hover:border-sb-border"
            >
              <ConfidenceBadge
                confidence={activeConfidence}
                variant="hero"
                showLabel={true}
              />
              <div className="text-[10px] font-bold text-sb-navy font-mono uppercase tracking-wider flex items-center justify-end gap-1 mt-1 group-hover:underline">
                <span>Why {activeConfidence}%?</span>
                <HelpCircle className="w-3 h-3" />
              </div>
            </button>
          </div>

          {/* Accumulator Progress Meter */}
          {isAccumulator && (
            <div className="p-3 bg-sb-bg/80 rounded-xl border border-sb-border/60 space-y-1.5" data-testid="accumulator-meter-block">
              <div className="flex justify-between text-caption font-semibold">
                <span className="text-sb-navy font-bold">Spool Erection Progress: 17 of 42 spools</span>
                <span className="text-sb-verified-ink font-mono font-bold">38% → 40%</span>
              </div>
              <div className="w-full h-2.5 bg-sb-border rounded-full overflow-hidden">
                <div className="h-full bg-sb-navy rounded-full transition-all" style={{ width: '40%' }} />
              </div>
              <div className="text-[11px] text-sb-ink-3">
                Parent activity remains open. Progress incremented by this event.
              </div>
            </div>
          )}

          {/* Distribute Multi-Activity Variant */}
          {isDistribute && (
            <div className="p-3 bg-sb-bg rounded-xl border border-sb-border space-y-2" data-testid="distribute-block">
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

          {/* Reasoning Chips */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-wider text-sb-ink-3 font-semibold px-0.5">
              <span>Multi-Factor AI Reasoning</span>
              <span className="text-sb-verified-ink font-bold">3 of 3 checks aligned</span>
            </div>
            <div className="flex flex-col gap-1.5">
              {activeReasons.map((reason, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-xl bg-sb-navy-tint/40 border border-sb-navy/15 flex items-center justify-between text-caption"
                >
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-sb-verified shrink-0" />
                    <span className="font-bold text-sb-navy">{reason.label}</span>
                  </div>
                  {reason.matchedText && (
                    <span className="text-[11px] font-mono text-sb-ink-3 bg-sb-white px-2 py-0.5 rounded border border-sb-border/60">
                      Matched: &ldquo;{reason.matchedText}&rdquo;
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Audit Chain Status */}
          <div className="pt-2 border-t border-sb-border/60 flex items-center justify-between text-caption">
            <button
              type="button"
              data-testid="evidence-chain-link"
              onClick={() => setEvidenceChainOpen(true)}
              className="font-bold text-sb-navy hover:underline flex items-center gap-1.5"
            >
              <ShieldCheck className="w-4 h-4 text-sb-verified" />
              <span>Evidence Linked (Immutable 4-step audit chain)</span>
            </button>
            <span className="text-[11px] font-mono text-sb-ink-3">SHA-256 Intact</span>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* ZONE 3: SCHEDULE CONTEXT (Predecessor → Current → Successor)              */}
        {/* ========================================================================= */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 px-1">
            <span className="w-2 h-2 rounded-full bg-amber-600" />
            <span className="text-[11px] font-mono uppercase tracking-wider text-sb-ink-3 font-bold">
              ZONE 3 · SCHEDULE CONTEXT (CPM NETWORK)
            </span>
          </div>

          <ScheduleContext
            nodes={[
              { id: 'PIP-24-016', name: 'Install Pipe Line 24-XX (Spool 16)', status: 'complete' },
              { id: activeActivityId, name: activeActivityName, status: 'active', selected: true },
              { id: 'PIP-24-018', name: 'NDT & Coating Line 24-XX', status: 'not-started' },
            ]}
            onNodeClick={(node) => router.push(`/activity/${node.id}`)}
            onViewInP6Click={() => setViewInP6Open(true)}
          />
        </div>

        {/* ========================================================================= */}
        {/* PRIMARY ACTIONS: Approve Match · Choose Another · Mark Unmatched          */}
        {/* ========================================================================= */}
        <div
          data-testid="pl3-actions-container"
          className="bg-sb-white rounded-2xl p-4 border border-sb-border shadow-e2 space-y-3 sticky bottom-4 z-30"
        >
          {/* Out of Sequence Override Reason Required */}
          {isOutOfSequence && (
            <div data-testid="out-of-sequence-override-box" className="space-y-1.5 bg-sb-review-tint p-3 rounded-xl border border-sb-review">
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
                    className={`px-3 py-1 rounded-full text-caption font-bold transition-colors ${
                      overrideReason === reason
                        ? 'bg-sb-review text-sb-white shadow-2xs'
                        : 'bg-sb-white text-sb-ink-2 border border-sb-border hover:bg-sb-bg'
                    }`}
                  >
                    {reason}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Primary Action Buttons Bar */}
          <div className="flex flex-col sm:flex-row gap-2.5">
            {/* 1. Approve Match (Primary High-Visibility Action) */}
            {!isUnmatchedVariant && (
              <button
                type="button"
                data-testid="approve-match-btn"
                disabled={isOutOfSequence && !overrideReason}
                onClick={() => setDiffSheetOpen(true)}
                className={`flex-1 min-h-[52px] py-3.5 px-6 rounded-full font-bold text-callout flex items-center justify-center gap-2 shadow-e2 transition-all active:scale-[0.99] select-none ${
                  isOutOfSequence && !overrideReason
                    ? 'bg-sb-border text-sb-ink-3 cursor-not-allowed'
                    : 'bg-sb-navy text-sb-white hover:bg-sb-navy-pressed ring-2 ring-sb-navy/20'
                }`}
              >
                <Check className="w-5 h-5" />
                <span>{isOutOfSequence ? 'Approve with Override' : isDistribute ? `Approve ${distributeChecked.length} Activities` : 'Approve Match'}</span>
                <span className="ml-1 text-[11px] font-mono px-1.5 py-0.5 rounded bg-sb-white/20 text-sb-white">
                  A
                </span>
              </button>
            )}

            {/* 2. Choose Another Button */}
            <button
              type="button"
              data-testid="choose-another-btn"
              onClick={() => setChooseAnotherOpen(true)}
              className={`min-h-[52px] px-5 rounded-full border text-callout font-bold flex items-center justify-center gap-1.5 transition-all active:scale-[0.99] ${
                isUnmatchedVariant
                  ? 'flex-1 bg-sb-navy text-sb-white border-sb-navy shadow-sm'
                  : 'bg-sb-white border-sb-border text-sb-navy hover:bg-sb-bg'
              }`}
            >
              <Search className="w-4.5 h-4.5 text-sb-navy" />
              <span>Choose Another</span>
              <span className="ml-0.5 text-[11px] font-mono px-1.5 py-0.5 rounded bg-sb-bg text-sb-ink-3">
                C
              </span>
            </button>

            {/* 3. Mark Unmatched Button */}
            <button
              type="button"
              data-testid="unmatched-btn"
              onClick={() => setUnmatchedSheetOpen(true)}
              className="min-h-[52px] px-5 rounded-full border border-sb-critical text-sb-critical bg-sb-white text-callout font-bold flex items-center justify-center gap-1.5 hover:bg-sb-critical-tint/50 transition-all active:scale-[0.99]"
            >
              <X className="w-4.5 h-4.5" />
              <span>Unmatched</span>
              <span className="ml-0.5 text-[11px] font-mono px-1.5 py-0.5 rounded bg-sb-critical-tint text-sb-critical font-bold">
                U
              </span>
            </button>
          </div>

          {/* Keyboard Shortcuts Hint */}
          <div className="flex items-center justify-center gap-3 text-[11px] font-mono text-sb-ink-3 pt-1">
            <span>Hotkeys: <strong>[A]</strong> Approve · <strong>[C]</strong> Choose · <strong>[U]</strong> Unmatched · <strong>[J]/[K]</strong> Next/Prev</span>
          </div>
        </div>

        {/* Stat Strip */}
        <div
          data-testid="pl3-stat-strip"
          className="grid grid-cols-3 gap-2 py-2 border-y border-sb-border"
        >
          <div
            onClick={() => router.push('/workbench?tab=review')}
            className="text-center p-2 rounded-xl bg-sb-white border border-sb-border/60 hover:border-sb-navy cursor-pointer transition-colors shadow-2xs"
          >
            <div className="text-[10px] uppercase font-bold text-sb-ink-3">Freshness</div>
            <div className="text-caption font-bold text-sb-navy font-mono mt-0.5">
              <FreshnessClock />
            </div>
          </div>

          <div
            onClick={() => router.push('/workbench?tab=done')}
            className="text-center p-2 rounded-xl bg-sb-white border border-sb-border/60 hover:border-sb-navy cursor-pointer transition-colors shadow-2xs"
          >
            <div className="text-[10px] uppercase font-bold text-sb-ink-3">Verified Today</div>
            <div className="text-caption font-bold text-sb-verified-ink font-mono mt-0.5">
              47
            </div>
          </div>

          <div
            onClick={() => router.push('/workbench?tab=review')}
            className="text-center p-2 rounded-xl bg-sb-white border border-sb-border/60 hover:border-sb-navy cursor-pointer transition-colors shadow-2xs"
          >
            <div className="text-[10px] uppercase font-bold text-sb-ink-3">Pending Review</div>
            <div className="text-caption font-bold text-sb-review-ink font-mono mt-0.5">
              {queueEvents.length}
            </div>
          </div>
        </div>
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
              <span className="text-sb-ink-3 font-sans font-medium">Audit Ledger ID</span>
              <span className="font-bold text-sb-navy">AUD-1281</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-sb-ink-3 font-sans font-medium">Signer</span>
              <span className="font-bold text-sb-navy">{user?.name || 'Meera Nair'}</span>
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <button
              type="button"
              data-testid="confirm-approval-btn"
              onClick={handleConfirmApproval}
              className="w-full py-3.5 rounded-full bg-sb-navy text-sb-white font-bold text-callout shadow-sm active:scale-95 transition-all"
            >
              Sign & Commit to Primavera P6
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

      {/* Why Confidence Sheet */}
      <Sheet
        open={whyConfidenceOpen}
        onOpenChange={setWhyConfidenceOpen}
        title={`Why ${activeConfidence}% Match?`}
        description="Multi-factor engineering ontology matching breakdown."
        data-testid="why-confidence-sheet"
      >
        <div className="p-4 space-y-3 text-caption">
          <p className="text-sb-ink-2">
            Confidence is calculated from 3 independent matching signals against the Primavera P6 schedule baseline:
          </p>
          <div className="space-y-2">
            {activeReasons.map((r, idx) => (
              <div
                key={idx}
                className="p-3 bg-sb-bg rounded-xl border border-sb-border flex items-start justify-between gap-2"
              >
                <div>
                  <div className="font-bold text-sb-navy">{r.label}</div>
                  <div className="text-[11px] text-sb-ink-3 mt-0.5">Matched from field event tokens</div>
                </div>
                {r.matchedText && (
                  <span className="font-mono text-sb-navy bg-sb-white px-2 py-0.5 rounded border border-sb-border font-semibold text-[11px] shrink-0">
                    &ldquo;{r.matchedText}&rdquo;
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </Sheet>

      {/* Logic Check Sheet */}
      <Sheet
        open={logicCheckOpen}
        onOpenChange={setLogicCheckOpen}
        title="Schedule Logic & Precedence Check"
        description="Verification of CPM relationships in Primavera P6."
        data-testid="logic-check-sheet"
      >
        <div className="p-4 space-y-3 text-caption">
          <div className="p-3 bg-sb-bg rounded-xl border border-sb-border space-y-1">
            <span className="font-bold text-sb-navy block">Scheduling Mode: Retained Logic</span>
            <p className="text-sb-ink-2 text-[12px]">
              Predecessor activity PIP-24-016 is 100% complete. Precedence requirements are satisfied.
            </p>
          </div>
        </div>
      </Sheet>

      {/* Evidence Chain Sheet */}
      <Sheet
        open={evidenceChainOpen}
        onOpenChange={setEvidenceChainOpen}
        title="Cryptographic Evidence Chain"
        description="Tamper-evident audit chain from field capture to schedule."
        data-testid="evidence-chain-sheet"
      >
        <div className="p-4 space-y-3">
          <EvidenceChain currentStep={3} event={event} />
        </div>
      </Sheet>

      {/* Choose Another Modal */}
      <Sheet
        open={chooseAnotherOpen}
        onOpenChange={setChooseAnotherOpen}
        title="Choose Alternative Activity"
        description="Search activities in Kandla–Panipat Phase 3 schedule."
        data-testid="choose-another-sheet"
      >
        <div className="p-4 space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 text-sb-ink-3 absolute left-3.5 top-3.5 pointer-events-none" />
            <input
              type="text"
              data-testid="choose-another-search"
              value={candidateSearch}
              onChange={(e) => setCandidateSearch(e.target.value)}
              placeholder="Search by ID or activity name..."
              className="w-full pl-10 pr-3.5 py-2.5 border border-sb-border rounded-xl text-caption text-sb-ink bg-sb-bg focus:outline-none focus:border-sb-navy"
            />
          </div>

          <div className="space-y-1.5 max-h-72 overflow-y-auto">
            {activities
              .filter(
                (a) =>
                  !candidateSearch ||
                  a.id.toLowerCase().includes(candidateSearch.toLowerCase()) ||
                  a.name.toLowerCase().includes(candidateSearch.toLowerCase())
              )
              .slice(0, 8)
              .map((act) => (
                <div
                  key={act.id}
                  data-testid={`candidate-activity-${act.id}`}
                  onClick={() => handleSelectAlternative(act.id, act.name)}
                  className="p-3 border border-sb-border rounded-xl bg-sb-white hover:border-sb-navy hover:bg-sb-navy-tint/30 cursor-pointer transition-all flex items-center justify-between text-caption"
                >
                  <div>
                    <span className="font-mono font-bold text-sb-navy block">{act.id}</span>
                    <span className="text-sb-ink font-medium">{act.name}</span>
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
        title="Route Unmatched Event"
        description="Select resolution pathway for this field event."
        data-testid="unmatched-sheet"
      >
        <div className="p-4 space-y-2">
          <button
            type="button"
            data-testid="mark-out-of-scope"
            onClick={() => handleMarkUnmatched('out-of-scope')}
            className="w-full p-3.5 border border-sb-border rounded-xl text-caption font-semibold text-sb-ink hover:bg-sb-bg transition-colors text-left"
          >
            Mark Out of Scope
          </button>
          <button
            type="button"
            data-testid="mark-duplicate"
            onClick={() => handleMarkUnmatched('duplicate')}
            className="w-full p-3.5 border border-sb-border rounded-xl text-caption font-semibold text-sb-ink hover:bg-sb-bg transition-colors text-left"
          >
            Mark as Duplicate Report
          </button>
          <button
            type="button"
            data-testid="ask-supervisor-clarification"
            onClick={() => handleMarkUnmatched('ask')}
            className="w-full p-3.5 border border-sb-border rounded-xl text-caption font-bold text-sb-navy hover:bg-sb-navy-tint/40 transition-colors text-left"
          >
            Ask Supervisor for Clarification
          </button>
        </div>
      </Sheet>

      {/* Chip Edit Modal */}
      {chipEditField && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-sb-white rounded-2xl max-w-sm w-full p-5 space-y-3 shadow-xl border border-sb-border">
            <h4 className="text-callout font-bold text-sb-navy capitalize">
              Edit {chipEditField}
            </h4>
            <input
              type="text"
              data-testid="chip-edit-input"
              value={chipEditValue}
              onChange={(e) => setChipEditValue(e.target.value)}
              className="w-full px-3.5 py-2 border border-sb-border rounded-xl text-caption text-sb-ink focus:outline-none focus:border-sb-navy"
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && handleSaveChipEdit()}
            />
            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setChipEditField(null)}
                className="px-3.5 py-2 border border-sb-border rounded-full text-caption font-semibold text-sb-ink hover:bg-sb-bg"
              >
                Cancel
              </button>
              <button
                type="button"
                data-testid="save-chip-edit-btn"
                onClick={handleSaveChipEdit}
                className="px-4 py-2 bg-sb-navy text-sb-white rounded-full text-caption font-bold shadow-sm"
              >
                Update & Re-match
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification with 8-second Safety Undo */}
      {toastMessage && (
        <Toast
          open={!!toastMessage}
          message={toastMessage}
          onClose={() => setToastMessage(null)}
          onUndo={
            undoId
              ? async () => {
                  if (undoId) await undoApproval(undoId);
                  setToastMessage('Approval undone. Returned to review queue.');
                  setUndoId(null);
                }
              : undefined
          }
          undoLabel="Undo (8s)"
          duration={8000}
        />
      )}
    </ProjectShell>
  );
}
