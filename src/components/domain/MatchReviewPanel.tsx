'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
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
      <div className="p-8 text-center bg-white rounded-2xl border border-sb-border shadow-sm space-y-3 m-4" data-testid="all-caught-up-card">
        <CheckCircle2 className="w-12 h-12 text-sb-verified mx-auto" />
        <h3 className="text-h3 font-bold text-sb-navy">All caught up!</h3>
        <p className="text-caption text-sb-text-subtle">
          There are no pending events waiting for match review.
        </p>
      </div>
    );
  }

  const isWarningVariant = event.logicCheckStatus === 'Warning' || event.isConflict;
  const isOutOfSequence = isWarningVariant && event.logicCheckMessage?.includes('out of sequence');
  const targetActivity = activities.find((a) => a.id === activeActivityId);

  return (
    <div className="p-4 space-y-4" data-testid="match-review-panel">
      {/* 1. Header & Pager */}
      <div className="bg-white p-3.5 rounded-card border border-sb-border shadow-sm flex items-center justify-between">
        <div>
          <span className="text-[11px] uppercase font-bold text-sb-critical tracking-wider block">
            Review Required ({queueEvents.length} pending)
          </span>
          <h3 className="text-body font-bold text-sb-ink">
            Event {event.id} Review
          </h3>
        </div>

        {/* Pager */}
        <div className="flex items-center gap-2" data-testid="pager-controls">
          <button
            type="button"
            data-testid="pager-prev"
            onClick={goToPrev}
            disabled={currentEventIndex === 0}
            className="p-1 rounded-lg border border-sb-border hover:bg-slate-50 disabled:opacity-30 transition-colors"
          >
            <ChevronLeft className="w-4 h-4 text-sb-ink" />
          </button>
          <span className="font-mono text-caption text-sb-ink font-semibold">
            {currentEventIndex + 1} of {queueEvents.length}
          </span>
          <button
            type="button"
            data-testid="pager-next"
            onClick={goToNext}
            disabled={currentEventIndex === queueEvents.length - 1}
            className="p-1 rounded-lg border border-sb-border hover:bg-slate-50 disabled:opacity-30 transition-colors"
          >
            <ChevronRight className="w-4 h-4 text-sb-ink" />
          </button>
        </div>
      </div>

      {/* 2. FIELD EVIDENCE Card */}
      <div className="bg-white p-4 rounded-card border border-sb-border shadow-sm space-y-3" data-testid="field-evidence-card">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-sb-navy bg-slate-100 px-2 py-0.5 rounded">
            FIELD EVIDENCE
          </span>
          <span className="text-mono-s text-sb-text-subtle">{event.timestamp}</span>
        </div>

        {/* Raw Quote / Audio Player */}
        <div className="p-3 bg-sb-bg-subtle rounded-xl space-y-2">
          <div className="flex items-center gap-3">
            <button
              type="button"
              data-testid="play-audio-btn"
              onClick={togglePlay}
              className="w-10 h-10 rounded-full bg-sb-navy text-white flex items-center justify-center hover:bg-slate-800 transition-colors shadow-sm shrink-0"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
            </button>
            <div className="flex-1 min-w-0">
              <p className="text-caption font-medium text-sb-ink italic truncate">
                &ldquo;{event.rawText}&rdquo;
              </p>
              <div className="flex items-center gap-2 mt-1">
                <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-sb-navy rounded-full transition-all"
                    style={{ width: `${audioProgress * 100}%` }}
                  />
                </div>
                <span className="text-[10px] font-mono text-sb-text-subtle">0:14</span>
              </div>
            </div>
          </div>
        </div>

        {/* Extracted Chips */}
        <div>
          <span className="text-[10px] uppercase font-bold text-sb-text-subtle tracking-wider block mb-1.5">
            Extracted Entities (tap to edit)
          </span>
          <div className="flex flex-wrap gap-1.5">
            {Object.entries(extractedChips).map(([key, val]) => (
              <button
                key={key}
                type="button"
                data-testid={`chip-${key}`}
                onClick={() => {
                  setChipEditField(key);
                  setChipEditValue(String(val));
                }}
                className="inline-flex items-center gap-1 px-2.5 py-1 bg-white border border-sb-border rounded-full text-[11px] hover:border-sb-navy transition-colors font-medium text-sb-ink"
              >
                <span className="text-sb-text-subtle uppercase text-[9px]">{key}:</span>
                <span className="font-bold">{String(val)}</span>
                <Edit2 className="w-2.5 h-2.5 text-sb-text-subtle ml-0.5" />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 3. AI MATCH Card */}
      <div className="bg-white p-4 rounded-card border border-sb-border shadow-sm space-y-3" data-testid="ai-match-card">
        <div className="flex items-start justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-sb-navy bg-slate-100 px-2 py-0.5 rounded">
              AI MATCH
            </span>
            <div className="flex items-center gap-2 mt-1">
              <span className="font-mono text-h2 font-bold text-sb-navy" data-testid="match-confidence-value">
                {activeConfidence}%
              </span>
              <button
                type="button"
                data-testid="why-confidence-btn"
                onClick={() => setWhyConfidenceOpen(true)}
                className="text-[11px] text-sb-navy font-semibold hover:underline flex items-center gap-0.5"
              >
                Why {activeConfidence}%? <HelpCircle className="w-3 h-3" />
              </button>
            </div>
          </div>

          <span
            className={`text-[11px] font-bold px-2 py-0.5 rounded uppercase ${
              event.logicCheckStatus === 'Warning'
                ? 'bg-amber-100 text-amber-900 border border-amber-300'
                : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
            }`}
          >
            {event.logicCheckStatus === 'Warning' ? 'Logic Warning' : 'Logic Passed'}
          </span>
        </div>

        {/* Matched Activity Box */}
        <div className="p-3 border border-sb-border rounded-xl bg-sb-bg-subtle space-y-1">
          <div className="flex items-center justify-between text-caption">
            <span className="font-mono font-bold text-sb-navy" data-testid="matched-activity-id">
              {activeActivityId}
            </span>
            <span className="text-[11px] font-mono text-sb-text-subtle">
              Current: {targetActivity?.physicalPercent || 38}%
            </span>
          </div>
          <h4 className="text-body font-bold text-sb-ink">{activeActivityName}</h4>
        </div>

        {/* Warning Alert if out-of-sequence */}
        {isOutOfSequence && (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2.5 text-caption">
            <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-amber-900">Out-of-Sequence Execution</span>
              <p className="text-amber-800 text-[11px] mt-0.5">
                {event.logicCheckMessage || 'Predecessor is incomplete. Requires override reason to approve.'}
              </p>
            </div>
          </div>
        )}

        {/* Primary Action Buttons */}
        <div className="pt-2 border-t border-sb-border-subtle flex items-center gap-2">
          <button
            type="button"
            data-testid="choose-another-btn"
            onClick={() => setChooseAnotherOpen(true)}
            className="flex-1 py-2.5 border border-sb-border rounded-xl text-caption font-semibold text-sb-ink hover:bg-slate-50 transition-colors"
          >
            Choose Another
          </button>

          <button
            type="button"
            data-testid="unmatched-btn"
            onClick={() => setUnmatchedSheetOpen(true)}
            className="px-3.5 py-2.5 border border-sb-border rounded-xl text-caption font-semibold text-sb-text-subtle hover:text-red-700 hover:border-red-300 transition-colors"
          >
            Unmatched
          </button>

          <button
            type="button"
            data-testid="approve-match-btn"
            onClick={() => setDiffSheetOpen(true)}
            className="flex-1 py-2.5 bg-sb-navy text-white rounded-xl text-caption font-semibold hover:bg-slate-800 transition-colors shadow-sm"
          >
            Approve Match
          </button>
        </div>
      </div>

      {/* 4. Secondary Detail Links */}
      <div className="grid grid-cols-2 gap-2 text-caption">
        <button
          type="button"
          data-testid="logic-check-btn"
          onClick={() => setLogicCheckOpen(true)}
          className="p-3 bg-white border border-sb-border rounded-xl hover:border-sb-navy transition-colors text-left flex items-center justify-between"
        >
          <div>
            <span className="font-bold text-sb-ink block">Logic Check</span>
            <span className="text-[11px] text-sb-text-subtle">Retained Logic</span>
          </div>
          <ChevronRight className="w-4 h-4 text-sb-text-subtle" />
        </button>

        <button
          type="button"
          data-testid="evidence-chain-btn"
          onClick={() => setEvidenceChainOpen(true)}
          className="p-3 bg-white border border-sb-border rounded-xl hover:border-sb-navy transition-colors text-left flex items-center justify-between"
        >
          <div>
            <span className="font-bold text-sb-ink block">Evidence Chain</span>
            <span className="text-[11px] text-sb-text-subtle">Immutable hash</span>
          </div>
          <ChevronRight className="w-4 h-4 text-sb-text-subtle" />
        </button>
      </div>

      {/* Diff / Confirmation Sheet */}
      <Sheet
        isOpen={diffSheetOpen}
        onClose={() => setDiffSheetOpen(false)}
        title="Approve Schedule Update"
      >
        <div className="space-y-4">
          <div className="p-3.5 bg-sb-bg-subtle rounded-xl border border-sb-border space-y-2">
            <span className="text-[10px] uppercase font-bold text-sb-navy tracking-wider">
              Pending Ledger Diff
            </span>
            <div className="text-caption space-y-1">
              <div className="flex justify-between">
                <span className="text-sb-text-subtle">Target Activity:</span>
                <span className="font-mono font-bold text-sb-navy">{activeActivityId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sb-text-subtle">Physical Progress:</span>
                <span className="font-mono font-bold text-emerald-700">
                  {targetActivity?.physicalPercent || 38}% ➔{' '}
                  {event.accumulatorDetails?.percentNew || (targetActivity?.physicalPercent || 38) + 2}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sb-text-subtle">Audit Signing:</span>
                <span className="font-mono text-sb-ink">SHA-256 subtle crypto</span>
              </div>
            </div>
          </div>

          {isOutOfSequence && (
            <div className="space-y-1">
              <label className="text-caption font-semibold text-amber-900 block">
                Out-of-Sequence Override Reason (Required)
              </label>
              <input
                type="text"
                data-testid="override-reason-input"
                value={overrideReason}
                onChange={(e) => setOverrideReason(e.target.value)}
                placeholder="e.g. Field expediting approved by Resident Engineer"
                className="w-full px-3 py-2 border border-amber-300 rounded-lg text-caption bg-amber-50/50"
              />
            </div>
          )}

          <button
            type="button"
            data-testid="confirm-approval-btn"
            disabled={isOutOfSequence && !overrideReason.trim()}
            onClick={handleConfirmApproval}
            className="w-full py-3 bg-sb-navy text-white text-caption font-semibold rounded-xl hover:bg-slate-800 disabled:opacity-50 transition-colors shadow-sm"
          >
            Sign & Approve Match
          </button>
        </div>
      </Sheet>

      {/* Why Confidence Sheet */}
      <Sheet
        isOpen={whyConfidenceOpen}
        onClose={() => setWhyConfidenceOpen(false)}
        title={`Why ${activeConfidence}% Match?`}
      >
        <div className="space-y-3">
          <p className="text-caption text-sb-text-subtle">
            Confidence is calculated via multi-factor token overlap with canonical construction taxonomy:
          </p>
          <div className="space-y-2">
            {activeReasons.map((r, idx) => (
              <div
                key={idx}
                className="p-2.5 bg-sb-bg-subtle border border-sb-border rounded-lg flex items-center justify-between text-caption"
              >
                <span className="font-semibold text-sb-ink">{r.label}</span>
                <span className="font-mono text-sb-navy bg-white px-2 py-0.5 rounded border border-sb-border-subtle">
                  Matched &ldquo;{r.matchedText}&rdquo;
                </span>
              </div>
            ))}
          </div>
        </div>
      </Sheet>

      {/* Logic Check Sheet */}
      <Sheet
        isOpen={logicCheckOpen}
        onClose={() => setLogicCheckOpen(false)}
        title="Schedule Logic & Predecessors"
      >
        <div className="space-y-3 text-caption">
          <div className="p-3 bg-sb-bg-subtle rounded-xl border border-sb-border space-y-1">
            <span className="font-bold text-sb-ink block">P6 Scheduling Option</span>
            <p className="text-sb-text-subtle">
              Retained Logic mode is active. Progress on out-of-sequence activities cannot shorten critical path duration until predecessors complete.
            </p>
          </div>
          <div className="p-3 border border-sb-border rounded-xl">
            <span className="font-bold text-sb-ink block mb-1">Predecessor Chain</span>
            <span className="font-mono text-sb-navy">PIP-24-016 ➔ PIP-24-017 ➔ PIP-24-018</span>
          </div>
        </div>
      </Sheet>

      {/* Evidence Chain Sheet */}
      <Sheet
        isOpen={evidenceChainOpen}
        onClose={() => setEvidenceChainOpen(false)}
        title="Evidence Hash Chain"
      >
        <div className="space-y-3">
          <EvidenceChain currentStep={3} />
        </div>
      </Sheet>

      {/* Choose Another Modal */}
      <Sheet
        isOpen={chooseAnotherOpen}
        onClose={() => setChooseAnotherOpen(false)}
        title="Choose Alternative Activity"
      >
        <div className="space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 text-sb-text-subtle absolute left-3 top-3 pointer-events-none" />
            <input
              type="text"
              data-testid="choose-another-search"
              value={candidateSearch}
              onChange={(e) => setCandidateSearch(e.target.value)}
              placeholder="Search by ID or activity name..."
              className="w-full pl-9 pr-3 py-2 border border-sb-border rounded-xl text-caption text-sb-ink"
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
                  className="p-2.5 border border-sb-border rounded-lg bg-white hover:border-sb-navy cursor-pointer transition-colors flex items-center justify-between text-caption"
                >
                  <div>
                    <span className="font-mono font-bold text-sb-navy block">{act.id}</span>
                    <span className="text-sb-ink">{act.name}</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-sb-text-subtle" />
                </div>
              ))}
          </div>
        </div>
      </Sheet>

      {/* Unmatched Sheet */}
      <Sheet
        isOpen={unmatchedSheetOpen}
        onClose={() => setUnmatchedSheetOpen(false)}
        title="Route Unmatched Event"
      >
        <div className="space-y-2">
          <button
            type="button"
            data-testid="mark-out-of-scope"
            onClick={() => handleMarkUnmatched('out-of-scope')}
            className="w-full p-3 border border-sb-border rounded-xl text-caption font-semibold text-sb-ink hover:bg-slate-50 transition-colors text-left"
          >
            Mark Out of Scope
          </button>
          <button
            type="button"
            data-testid="mark-duplicate"
            onClick={() => handleMarkUnmatched('duplicate')}
            className="w-full p-3 border border-sb-border rounded-xl text-caption font-semibold text-sb-ink hover:bg-slate-50 transition-colors text-left"
          >
            Mark as Duplicate Report
          </button>
          <button
            type="button"
            data-testid="ask-supervisor-clarification"
            onClick={() => handleMarkUnmatched('ask')}
            className="w-full p-3 border border-sb-border rounded-xl text-caption font-semibold text-sb-navy hover:bg-slate-50 transition-colors text-left"
          >
            Ask Supervisor for Clarification
          </button>
        </div>
      </Sheet>

      {/* Chip Edit Modal */}
      {chipEditField && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-4 space-y-3 shadow-xl border border-sb-border">
            <h4 className="text-body font-bold text-sb-ink capitalize">
              Edit {chipEditField}
            </h4>
            <input
              type="text"
              data-testid="chip-edit-input"
              value={chipEditValue}
              onChange={(e) => setChipEditValue(e.target.value)}
              className="w-full px-3 py-2 border border-sb-border rounded-lg text-caption text-sb-ink"
            />
            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setChipEditField(null)}
                className="px-3 py-1.5 border border-sb-border rounded-lg text-caption font-medium text-sb-ink"
              >
                Cancel
              </button>
              <button
                type="button"
                data-testid="save-chip-edit-btn"
                onClick={handleSaveChipEdit}
                className="px-3.5 py-1.5 bg-sb-navy text-white rounded-lg text-caption font-semibold"
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
