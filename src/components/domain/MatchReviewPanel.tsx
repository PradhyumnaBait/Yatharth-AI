'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
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
  Volume2,
  ShieldCheck,
} from 'lucide-react';
import { FieldEvent, Activity } from '@/services/types';

export interface MatchReviewPanelProps {
  eventId: string;
  onSelectEventId?: (id: string) => void;
  isTwoPane?: boolean;
}

export const MatchReviewPanel: React.FC<MatchReviewPanelProps> = ({
  eventId,
  onSelectEventId,
  isTwoPane = false,
}) => {
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

  const rawIndex = queueEvents.findIndex((e) => e.id === eventId);
  const currentEventIndex = rawIndex >= 0 ? rawIndex : 0;
  const event = events.find((e) => e.id === eventId) || queueEvents[currentEventIndex] || queueEvents[0];

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

  // Toast & Undo
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [undoId, setUndoId] = useState<string | null>(null);

  // Search in Choose Another
  const [candidateSearch, setCandidateSearch] = useState('');

  // Navigate pager
  const goToNext = useCallback(() => {
    if (currentEventIndex < queueEvents.length - 1) {
      const nextId = queueEvents[currentEventIndex + 1].id;
      if (onSelectEventId) {
        onSelectEventId(nextId);
      } else {
        router.push(`/workbench/${nextId}`);
      }
    }
  }, [currentEventIndex, queueEvents, onSelectEventId, router]);

  const goToPrev = useCallback(() => {
    if (currentEventIndex > 0) {
      const prevId = queueEvents[currentEventIndex - 1].id;
      if (onSelectEventId) {
        onSelectEventId(prevId);
      } else {
        router.push(`/workbench/${prevId}`);
      }
    }
  }, [currentEventIndex, queueEvents, onSelectEventId, router]);

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
    const currentId = event.id;
    await approveEvent(currentId, activeActivityId, user?.name || 'Meera Nair');
    setDiffSheetOpen(false);
    setUndoId(currentId);
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
      <div className="p-8 text-center bg-sb-white rounded-2xl border border-sb-border shadow-sm space-y-3 m-4" data-testid="all-caught-up-card">
        <CheckCircle2 className="w-12 h-12 text-sb-verified mx-auto" />
        <h3 className="text-title-2 font-bold text-sb-navy">All caught up!</h3>
        <p className="text-caption text-sb-ink-3">
          There are no pending events waiting for match review.
        </p>
      </div>
    );
  }

  const isWarningVariant = event.logicCheckStatus === 'Warning' || event.isConflict;
  const isOutOfSequence = isWarningVariant && event.logicCheckMessage?.includes('out of sequence');
  const targetActivity = activities.find((a) => a.id === activeActivityId);

  return (
    <div className="p-4 lg:p-6 space-y-4 max-w-3xl" data-testid="match-review-panel">
      {/* 1. Header & Pager */}
      <div className="bg-sb-white p-4 rounded-2xl border border-sb-border shadow-e1 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-caption px-2 py-0.5 rounded-full bg-sb-navy-tint text-sb-navy font-bold">
              {event.id}
            </span>
            <span className="text-[11px] font-mono text-sb-ink-3">
              Kandla–Panipat Phase 3 · {event.timestamp}
            </span>
          </div>
          <h3 className="text-callout font-bold text-sb-navy mt-1">
            Activity Match Review
          </h3>
        </div>

        {/* Pager */}
        <div className="flex items-center gap-1.5 bg-sb-bg border border-sb-border rounded-full px-3 py-1 text-caption font-mono" data-testid="pager-controls">
          <button
            type="button"
            data-testid="pager-prev"
            onClick={goToPrev}
            disabled={currentEventIndex === 0}
            className="p-0.5 text-sb-ink-3 hover:text-sb-navy disabled:opacity-30 transition-colors"
          >
            <ChevronLeft className="w-4 h-4 text-sb-navy" />
          </button>
          <span className="font-mono text-caption text-sb-navy font-bold px-1">
            {currentEventIndex + 1} of {queueEvents.length}
          </span>
          <button
            type="button"
            data-testid="pager-next"
            onClick={goToNext}
            disabled={currentEventIndex === queueEvents.length - 1}
            className="p-0.5 text-sb-ink-3 hover:text-sb-navy disabled:opacity-30 transition-colors"
          >
            <ChevronRight className="w-4 h-4 text-sb-navy" />
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* ZONE 1: FIELD EVIDENCE                                                    */}
      {/* ========================================================================= */}
      <div className="bg-sb-white p-5 rounded-2xl border border-sb-border shadow-e2 space-y-4" data-testid="field-evidence-card">
        <div className="flex items-center justify-between border-b border-sb-border/60 pb-2.5">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-600" />
            <span className="text-[11px] font-mono uppercase tracking-wider text-sb-ink-3 font-bold">
              ZONE 1 · FIELD EVIDENCE
            </span>
          </div>
          <span className="text-caption font-mono text-sb-ink-3">{event.authorName || 'Rahul Patil'} ({event.authorRole || 'Supervisor'})</span>
        </div>

        {/* Audio Player */}
        <div className="p-3.5 bg-sb-bg rounded-xl border border-sb-border flex items-center gap-3.5 shadow-2xs">
          <button
            type="button"
            data-testid="play-audio-btn"
            onClick={togglePlay}
            className="w-10 h-10 rounded-full bg-sb-navy text-sb-white flex items-center justify-center hover:bg-sb-navy-pressed shadow-sm shrink-0 sb-press-spring cursor-pointer"
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
          </button>
          <div className="flex-1 min-w-0 space-y-1">
            <div className="flex items-center justify-between text-[10px] font-mono text-sb-ink-3">
              <span className="font-semibold text-sb-navy">Voice Evidence Recording</span>
              <span>00:12</span>
            </div>
            <div className="h-2 bg-sb-border rounded-full overflow-hidden">
              <div
                className="h-full bg-sb-navy rounded-full transition-all"
                style={{ width: `${audioProgress * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Spoken Quote */}
        <div className="p-3 bg-sb-bg/80 rounded-xl border border-sb-border text-caption text-sb-ink font-medium italic leading-relaxed">
          &ldquo;{event.rawText}&rdquo;
        </div>

        {/* Extracted Chips */}
        <div>
          <span className="text-[10px] uppercase font-bold text-sb-ink-3 tracking-wider block mb-1.5 font-mono">
            Extracted Entities (tap to edit)
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {Object.entries(extractedChips).map(([key, val]) => (
              <button
                key={key}
                type="button"
                data-testid={`chip-${key}`}
                onClick={() => {
                  setChipEditField(key);
                  setChipEditValue(String(val));
                }}
                className="p-2 rounded-xl bg-sb-bg border border-sb-border hover:border-sb-navy text-left font-medium text-sb-navy group sb-press-spring cursor-pointer"
              >
                <div className="flex items-center justify-between text-[10px] uppercase text-sb-ink-3 font-bold">
                  <span className="capitalize">{key}</span>
                  <Edit2 className="w-2.5 h-2.5 opacity-40 group-hover:opacity-100" />
                </div>
                <div className="font-bold text-caption text-sb-navy truncate mt-0.5">{String(val)}</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* ZONE 2: AI MATCH & REASONING                                              */}
      {/* ========================================================================= */}
      <div className="bg-sb-white p-5 rounded-2xl border border-sb-border shadow-e2 space-y-4" data-testid="ai-match-card">
        <div className="flex items-start justify-between border-b border-sb-border/60 pb-2.5">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-600" />
            <span className="text-[11px] font-mono uppercase tracking-wider text-sb-ink-3 font-bold">
              ZONE 2 · AI MATCH & REASONING
            </span>
          </div>

          <span
            className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase ${
              event.logicCheckStatus === 'Warning'
                ? 'bg-amber-100 text-amber-900 border border-amber-300'
                : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
            }`}
          >
            {event.logicCheckStatus === 'Warning' ? 'Logic Warning' : 'Logic Passed'}
          </span>
        </div>

        {/* Matched Activity Box with Confidence */}
        <div className="p-4 border border-sb-border rounded-xl bg-sb-bg flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1 space-y-1">
            <div className="font-mono text-[11px] font-bold text-sb-navy bg-sb-navy-tint px-2 py-0.5 rounded inline-block" data-testid="matched-activity-id">
              {activeActivityId}
            </div>
            <h4 className="text-callout font-bold text-sb-navy">{activeActivityName}</h4>
            <div className="text-[11px] font-mono text-sb-ink-3">
              Baseline Progress: <span className="font-bold text-sb-navy">{targetActivity?.physicalPercent || 38}%</span> → <span className="font-bold text-sb-verified-ink">40% (+2% delta)</span>
            </div>
          </div>

          <button
            type="button"
            data-testid="why-confidence-btn"
            onClick={() => setWhyConfidenceOpen(true)}
            className="text-right shrink-0 hover:opacity-80 transition-opacity sb-press-spring cursor-pointer"
          >
            <ConfidenceBadge
              confidence={activeConfidence}
              variant="hero"
              showLabel={true}
              data-testid="match-confidence-value"
            />
            <span className="text-[10px] font-bold text-sb-navy underline font-mono">
              Why {activeConfidence}%?
            </span>
          </button>
        </div>

        {/* Multi-factor reasons */}
        <div className="space-y-1.5">
          <span className="text-[10px] font-mono uppercase tracking-wider text-sb-ink-3 font-bold block">
            Matching Rationale
          </span>
          <div className="flex flex-col gap-1.5">
            {activeReasons.map((r, idx) => (
              <div
                key={idx}
                className="p-2.5 bg-sb-navy-tint/40 border border-sb-navy/15 rounded-xl flex items-center justify-between text-caption"
              >
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-sb-verified shrink-0" />
                  <span className="font-bold text-sb-navy">{r.label}</span>
                </div>
                {r.matchedText && (
                  <span className="font-mono text-sb-ink-3 bg-sb-white px-2 py-0.5 rounded border border-sb-border/60 text-[11px]">
                    &ldquo;{r.matchedText}&rdquo;
                  </span>
                )}
              </div>
            ))}
          </div>
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
      <div className="bg-sb-white p-4 rounded-2xl border border-sb-border shadow-e2 space-y-3 sticky bottom-4 z-30">
        <div className="flex flex-col sm:flex-row gap-2.5">
          <button
            type="button"
            data-testid="approve-match-btn"
            onClick={() => setDiffSheetOpen(true)}
            className="flex-1 min-h-[52px] py-3.5 px-6 bg-sb-navy text-sb-white font-bold text-callout rounded-full hover:bg-sb-navy-pressed shadow-e2 flex items-center justify-center gap-2 sb-press-spring cursor-pointer"
          >
            <Check className="w-5 h-5" />
            <span>Approve Match</span>
            <span className="ml-1 text-[11px] font-mono px-1.5 py-0.5 rounded bg-sb-white/20 text-sb-white">
              A
            </span>
          </button>

          <button
            type="button"
            data-testid="choose-another-btn"
            onClick={() => setChooseAnotherOpen(true)}
            className="min-h-[52px] px-5 border border-sb-border rounded-full text-callout font-bold text-sb-navy hover:bg-sb-bg flex items-center justify-center gap-1.5 sb-press-spring cursor-pointer"
          >
            <Search className="w-4.5 h-4.5 text-sb-navy" />
            <span>Choose Another</span>
            <span className="ml-0.5 text-[11px] font-mono px-1.5 py-0.5 rounded bg-sb-bg text-sb-ink-3">
              C
            </span>
          </button>

          <button
            type="button"
            data-testid="unmatched-btn"
            onClick={() => setUnmatchedSheetOpen(true)}
            className="min-h-[52px] px-5 border border-sb-critical text-sb-critical bg-sb-white rounded-full text-callout font-bold hover:bg-sb-critical-tint/50 flex items-center justify-center gap-1.5 sb-press-spring cursor-pointer"
          >
            <X className="w-4.5 h-4.5" />
            <span>Unmatched</span>
            <span className="ml-0.5 text-[11px] font-mono px-1.5 py-0.5 rounded bg-sb-critical-tint text-sb-critical font-bold">
              U
            </span>
          </button>
        </div>

        <div className="flex items-center justify-between pt-1 border-t border-sb-border/60 text-caption">
          <div className="flex items-center gap-2">
            <button
              type="button"
              data-testid="logic-check-btn"
              onClick={() => setLogicCheckOpen(true)}
              className="text-[12px] font-semibold text-sb-navy hover:underline"
            >
              Logic Check: Passed
            </button>
            <span className="text-sb-ink-3">·</span>
            <button
              type="button"
              data-testid="evidence-chain-btn"
              onClick={() => setEvidenceChainOpen(true)}
              className="text-[12px] font-semibold text-sb-navy hover:underline"
            >
              Evidence Chain (SHA-256)
            </button>
          </div>
          <span className="text-[11px] font-mono text-sb-ink-3">
            Hotkeys: <strong>[A]</strong> Approve · <strong>[C]</strong> Choose · <strong>[U]</strong> Unmatched
          </span>
        </div>
      </div>

      {/* Diff / Confirmation Sheet */}
      <Sheet
        open={diffSheetOpen}
        onOpenChange={setDiffSheetOpen}
        title="Approve Schedule Update"
        description="Verify changes to P6 activity and ledger record."
      >
        <div className="p-4 space-y-4">
          <div className="p-3.5 bg-sb-bg rounded-xl border border-sb-border space-y-2 font-mono text-[12px]">
            <div className="flex justify-between py-1 border-b border-sb-border/60">
              <span className="text-sb-ink-3 font-sans">Target Activity</span>
              <span className="font-bold text-sb-navy">{activeActivityId}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-sb-border/60">
              <span className="text-sb-ink-3 font-sans">Physical Progress</span>
              <span className="font-bold text-sb-verified-ink">38% → 40%</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-sb-ink-3 font-sans">Signer</span>
              <span className="font-bold text-sb-navy">{user?.name || 'Meera Nair'}</span>
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <button
              type="button"
              data-testid="confirm-approval-btn"
              onClick={handleConfirmApproval}
              className="w-full py-3.5 bg-sb-navy text-sb-white text-caption font-bold rounded-full hover:bg-sb-navy-pressed transition-colors shadow-sm"
            >
              Sign & Approve Match
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
        description="Multi-factor token overlap with construction taxonomy."
      >
        <div className="p-4 space-y-3 text-caption">
          <div className="space-y-2">
            {activeReasons.map((r, idx) => (
              <div
                key={idx}
                className="p-3 bg-sb-bg border border-sb-border rounded-xl flex items-center justify-between text-caption"
              >
                <span className="font-bold text-sb-navy">{r.label}</span>
                {r.matchedText && (
                  <span className="font-mono text-sb-navy bg-sb-white px-2 py-0.5 rounded border border-sb-border">
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
        title="Schedule Logic & Predecessors"
      >
        <div className="p-4 space-y-3 text-caption">
          <div className="p-3 bg-sb-bg rounded-xl border border-sb-border space-y-1">
            <span className="font-bold text-sb-navy block">Retained Logic Mode Active</span>
            <p className="text-sb-ink-2">
              All predecessor activities are validated before activity commit.
            </p>
          </div>
        </div>
      </Sheet>

      {/* Evidence Chain Sheet */}
      <Sheet
        open={evidenceChainOpen}
        onOpenChange={setEvidenceChainOpen}
        title="Evidence Hash Chain"
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
              className="w-full pl-10 pr-3.5 py-2.5 border border-sb-border rounded-xl text-caption text-sb-ink bg-sb-bg"
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
                  className="p-3 border border-sb-border rounded-xl bg-sb-white hover:border-sb-navy cursor-pointer transition-colors flex items-center justify-between text-caption"
                >
                  <div>
                    <span className="font-mono font-bold text-sb-navy block">{act.id}</span>
                    <span className="text-sb-ink">{act.name}</span>
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

      {/* Toast Notification with Undo */}
      {toastMessage && (
        <Toast
          open={!!toastMessage}
          message={toastMessage}
          onClose={() => setToastMessage(null)}
          onUndo={
            undoId
              ? async () => {
                  if (undoId) await undoApproval(undoId);
                  setToastMessage(null);
                  setUndoId(null);
                }
              : undefined
          }
          undoLabel="Undo (8s)"
          duration={8000}
        />
      )}
    </div>
  );
};
