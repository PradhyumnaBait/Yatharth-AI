'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { PageHeader } from '@/components/shell/PageHeader';
import { StatusPill } from '@/components/ui/StatusPill';
import { Waveform } from '@/components/domain/Waveform';
import { ConfidenceBadge } from '@/components/domain/ConfidenceBadge';
import { EvidenceChain } from '@/components/domain/EvidenceChain';
import { Sheet } from '@/components/ui/Sheet';
import { Toast } from '@/components/ui/Toast';
import { useEventsStore } from '@/store/events';
import { useAuthStore } from '@/store/auth';
import {
  Play,
  Pause,
  Mic,
  MessageSquare,
  Cpu,
  ExternalLink,
  ShieldCheck,
  Send,
  HelpCircle,
  Clock,
  User,
  ArrowRight,
  Loader2,
  AlertCircle,
} from 'lucide-react';

export default function EventDetailPage() {
  const router = useRouter();
  const rawParams = useParams();
  const eventId = (rawParams?.id as string) || '';

  const [mounted, setMounted] = useState(false);
  const { user } = useAuthStore();
  const event = useEventsStore((s) => s.events.find((e) => e.id === eventId));
  const askQuestion = useEventsStore((s) => s.askQuestion);
  const replyToQuestion = useEventsStore((s) => s.replyToQuestion);

  const isPlanner = user?.role === 'planner';
  const isSupervisor = user?.role === 'supervisor';

  // Audio Playback state
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);

  // Reply / Ask Question sheet states
  const [replySheetOpen, setReplySheetOpen] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(null);

  const [askSheetOpen, setAskSheetOpen] = useState(false);
  const [questionText, setQuestionText] = useState('');

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Audio playback handler (Real blob if available, SpeechSynthesis fallback for fixtures)
  const togglePlayAudio = () => {
    if (isPlaying) {
      if (audioElementRef.current) {
        audioElementRef.current.pause();
      }
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      setIsPlaying(false);
      return;
    }

    if (event?.audioUrl && audioElementRef.current) {
      audioElementRef.current.play();
    } else if (typeof window !== 'undefined' && window.speechSynthesis && event?.rawText) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(event.rawText);
      utterance.onend = () => {
        setIsPlaying(false);
        setAudioProgress(1);
      };
      utterance.onboundary = (e) => {
        if (event.rawText.length > 0) {
          setAudioProgress(Math.min(1, e.charIndex / event.rawText.length));
        }
      };
      window.speechSynthesis.speak(utterance);
      setIsPlaying(true);
    } else {
      // Simulate playback
      setIsPlaying(true);
      let p = 0;
      const interval = setInterval(() => {
        p += 0.1;
        setAudioProgress(Math.min(1, p));
        if (p >= 1) {
          clearInterval(interval);
          setIsPlaying(false);
        }
      }, 300);
    }
  };

  const handleSendReply = async () => {
    if (!replyText.trim() || !event) return;
    const qId = selectedQuestionId || event.questions?.[0]?.id || 'q-default';
    await replyToQuestion(event.id, qId, replyText.trim(), user?.name || 'Rahul Patil');
    setReplySheetOpen(false);
    setReplyText('');
    setToastMessage('Reply submitted! Event returned to planner queue.');
  };

  const handleSendQuestion = async () => {
    if (!questionText.trim() || !event) return;
    await askQuestion(event.id, questionText.trim(), user?.name || 'Meera Nair');
    setAskSheetOpen(false);
    setQuestionText('');
    setToastMessage('Clarification request sent to supervisor.');
  };

  if (!mounted) {
    return (
      <div className="flex flex-col min-h-screen bg-sb-bg items-center justify-center p-6 space-y-3">
        <Loader2 className="w-8 h-8 text-sb-navy animate-spin" />
        <p className="text-caption text-sb-ink-3">Loading event details...</p>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="flex flex-col min-h-full bg-sb-bg p-6 text-center space-y-4">
        <PageHeader variant="back" title="Event Not Found" />
        <div className="p-8 bg-sb-white rounded-2xl border border-sb-border max-w-md mx-auto space-y-3">
          <AlertCircle className="w-8 h-8 text-sb-critical mx-auto" />
          <h3 className="text-callout font-bold text-sb-navy">Event Not Found</h3>
          <p className="text-caption text-sb-ink-3">
            Event &quot;{eventId}&quot; could not be found in the current project log.
          </p>
          <div className="flex items-center justify-center gap-2 pt-2">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-4 py-2 border border-sb-border text-sb-ink rounded-full text-caption font-semibold"
            >
              Go Back
            </button>
            <button
              type="button"
              onClick={() => router.push('/workbench')}
              className="px-4 py-2 bg-sb-navy text-sb-white rounded-full text-caption font-semibold"
            >
              Open Workbench
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-full bg-sb-bg pb-36" data-testid="event-detail-screen-s5">
      {/* 1. Header with Event ID and Status */}
      <PageHeader
        variant="back"
        title={event.id}
        subtitle="Field Evidence & Matching"
        rightAction={
          <div className="flex items-center gap-1.5 mr-1">
            <StatusPill status={event.status} />
          </div>
        }
      />

      <div className="p-4 space-y-4">
        {/* 2. Audio Player & Evidence Card */}
        <div className="bg-sb-white rounded-2xl p-4 border border-sb-border shadow-e1 space-y-3">
          <div className="flex items-center justify-between text-[11px] font-mono text-sb-ink-3">
            <div className="flex items-center gap-1.5">
              <Mic className="w-3.5 h-3.5 text-sb-navy" />
              <span className="font-semibold text-sb-navy uppercase">{event.source} Report</span>
            </div>
            <span>{event.timestamp}</span>
          </div>

          {/* Interactive Player Controls */}
          <div className="flex items-center gap-3 p-3 bg-sb-bg rounded-xl border border-sb-border">
            <button
              type="button"
              data-testid="audio-play-pause-btn"
              onClick={togglePlayAudio}
              className="w-11 h-11 rounded-full bg-sb-navy text-sb-white hover:bg-sb-navy-pressed flex items-center justify-center shrink-0 active:scale-95 transition-all shadow-sm"
              aria-label={isPlaying ? 'Pause audio' : 'Play audio'}
            >
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
            </button>

            <div className="flex-1 min-w-0">
              <Waveform
                progress={audioProgress}
                onSeek={(prog) => setAudioProgress(prog)}
                isLive={isPlaying}
              />
            </div>

            {event.audioUrl && (
              <audio
                ref={audioElementRef}
                src={event.audioUrl}
                onTimeUpdate={(e) => {
                  const el = e.currentTarget;
                  if (el.duration) setAudioProgress(el.currentTime / el.duration);
                }}
                onEnded={() => {
                  setIsPlaying(false);
                  setAudioProgress(1);
                }}
                className="hidden"
              />
            )}
          </div>

          {/* Reporter metadata */}
          <div className="flex items-center justify-between text-caption pt-1 text-sb-ink-2">
            <div className="flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-sb-ink-3" />
              <span className="font-semibold text-sb-navy">{event.authorName}</span>
              <span className="text-sb-ink-3">({event.authorRole})</span>
            </div>
            <span className="text-[11px] font-mono text-sb-ink-3">{event.authorCrew || 'Piping Crew A'}</span>
          </div>

          {/* Quoted Transcript */}
          <div className="bg-sb-bg/80 p-3 rounded-xl border border-sb-border text-caption text-sb-ink italic font-medium" data-testid="event-transcript">
            &ldquo;{event.rawText}&rdquo;
          </div>

          {/* Extracted Information Chips */}
          <div className="space-y-1 pt-1">
            <div className="text-[11px] font-mono uppercase tracking-wider text-sb-ink-3">
              Extracted Information
            </div>
            <div className="flex flex-wrap gap-1.5" data-testid="event-extracted-chips">
              {event.extractedInfo.action && (
                <span className="px-2.5 py-1 rounded-lg bg-sb-navy-tint text-sb-navy font-semibold text-caption">
                  {event.extractedInfo.action}
                </span>
              )}
              {event.extractedInfo.object && (
                <span className="px-2.5 py-1 rounded-lg bg-sb-navy-tint text-sb-navy font-semibold text-caption">
                  {event.extractedInfo.object}
                </span>
              )}
              {event.extractedInfo.location && (
                <span className="px-2.5 py-1 rounded-lg bg-sb-navy-tint text-sb-navy font-semibold text-caption">
                  {event.extractedInfo.location}
                </span>
              )}
              {event.extractedInfo.status && (
                <span className="px-2.5 py-1 rounded-lg bg-sb-verified-tint text-sb-verified-ink font-bold text-caption">
                  {event.extractedInfo.status}
                </span>
              )}
              {event.extractedInfo.quantity && (
                <span className="px-2.5 py-1 rounded-lg bg-sb-bg border border-sb-border text-sb-ink-2 font-mono text-caption">
                  {event.extractedInfo.quantity} {event.extractedInfo.unit || ''}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* 3. AI Match Block */}
        <div className="bg-sb-white rounded-2xl p-4 border border-sb-border shadow-e1 space-y-3" data-testid="event-match-card">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Cpu className="w-4 h-4 text-sb-navy" />
              <h3 className="text-callout font-bold text-sb-navy">
                AI Schedule Match
              </h3>
            </div>
            <ConfidenceBadge
              confidence={event.confidence || 94}
              showLabel={true}
              data-testid="match-confidence-badge"
            />
          </div>

          <div className="p-3 bg-sb-bg rounded-xl border border-sb-border space-y-1">
            <div className="font-mono text-caption font-bold text-sb-navy">
              {event.suggestedActivityId || 'PIP-24-017'}
            </div>
            <div className="text-caption font-semibold text-sb-ink">
              {event.suggestedActivityName || 'Weld Piping System 24-XX'}
            </div>
          </div>

          {/* Match Reasons */}
          {event.reasons && event.reasons.length > 0 && (
            <div className="space-y-1">
              <div className="text-[11px] text-sb-ink-3">Matching Reasons:</div>
              <div className="flex flex-wrap gap-1">
                {event.reasons.map((r, i) => (
                  <span key={i} className="text-[11px] px-2 py-0.5 rounded bg-sb-bg text-sb-ink-2 border border-sb-border/60">
                    {r.label}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Evidence Chain Link */}
          <div className="flex items-center justify-between text-[11px] font-mono text-sb-ink-3 pt-2 border-t border-sb-border/60">
            <span>Evidence Chain:</span>
            <span className="text-sb-navy font-semibold">Voice → Event → Match → Approval</span>
          </div>
        </div>

        {/* 4. Cryptographic Audit Trail Timeline (Scene 7) */}
        <EvidenceChain
          event={event}
          currentStep={event.status === 'Verified' ? 4 : 3}
          auditEntryId={event.status === 'Verified' ? 'AUD-1281' : 'AUD-1282'}
        />

        {/* 4. Photos if any */}
        {event.thumbnailUrl && (
          <div className="bg-sb-white rounded-2xl p-4 border border-sb-border shadow-e1 space-y-2">
            <div className="text-caption font-bold text-sb-navy">Attached Photo</div>
            <div className="relative h-44 rounded-xl overflow-hidden border border-sb-border">
              <Image src={event.thumbnailUrl} alt="Field event photo" fill className="object-cover" />
            </div>
          </div>
        )}

        {/* 5. Conversation Thread & Reply Loop */}
        <div className="bg-sb-white rounded-2xl p-4 border border-sb-border shadow-e1 space-y-3" data-testid="conversation-thread-section">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <MessageSquare className="w-4 h-4 text-sb-navy" />
              <h3 className="text-callout font-bold text-sb-navy">
                Conversation & Clarification
              </h3>
            </div>
            {event.status === 'Reply needed' && (
              <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-sb-critical text-sb-white font-bold animate-pulse">
                Reply Needed
              </span>
            )}
          </div>

          {/* Questions list */}
          {(!event.questions || event.questions.length === 0) ? (
            <div className="p-4 bg-sb-bg rounded-xl text-center text-caption text-sb-ink-3">
              No planner clarification questions on this event.
            </div>
          ) : (
            <div className="space-y-2.5" data-testid="questions-list">
              {event.questions.map((q) => (
                <div key={q.id} className="p-3 bg-sb-bg rounded-xl border border-sb-border space-y-2">
                  <div className="flex items-center justify-between text-[11px] text-sb-ink-3">
                    <span className="font-semibold text-sb-navy">{q.author} (Planner)</span>
                    <span>{q.time}</span>
                  </div>
                  <div className="text-caption text-sb-ink font-medium" data-testid="planner-question-text">
                    &ldquo;{q.text}&rdquo;
                  </div>

                  {q.reply ? (
                    <div className="p-2.5 bg-sb-white rounded-lg border border-sb-verified/30 text-caption text-sb-navy space-y-0.5">
                      <div className="text-[10px] uppercase font-bold text-sb-verified-ink">
                        Supervisor Reply
                      </div>
                      <div data-testid="supervisor-reply-text">{q.reply}</div>
                    </div>
                  ) : (
                    <div className="pt-1">
                      <button
                        type="button"
                        data-testid="open-reply-sheet-btn"
                        onClick={() => {
                          setSelectedQuestionId(q.id);
                          setReplySheetOpen(true);
                        }}
                        className="px-3 py-1.5 bg-sb-navy text-sb-white rounded-lg text-caption font-semibold flex items-center gap-1.5 active:scale-95 transition-all shadow-sm"
                      >
                        <Send className="w-3 h-3" />
                        <span>Reply to Planner</span>
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Action Row for Planner (Ask Question / Open in Workbench) */}
          <div className="pt-2 flex items-center gap-2">
            {isPlanner && (
              <button
                type="button"
                data-testid="planner-ask-btn"
                onClick={() => setAskSheetOpen(true)}
                className="flex-1 py-2.5 rounded-full border border-sb-navy text-sb-navy text-caption font-semibold hover:bg-sb-navy-tint flex items-center justify-center gap-1.5"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>Ask Supervisor</span>
              </button>
            )}

            {isPlanner && (
              <button
                type="button"
                data-testid="open-workbench-btn"
                onClick={() => router.push(`/workbench/${event.id}`)}
                className="flex-1 py-2.5 rounded-full bg-sb-navy text-sb-white text-caption font-semibold flex items-center justify-center gap-1.5"
              >
                <span>Open Workbench</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Reply Sheet for Supervisor */}
      <Sheet
        open={replySheetOpen}
        onOpenChange={setReplySheetOpen}
        title="Reply to Planner"
        description="Provide clarification to return this event to the review queue."
        data-testid="reply-sheet"
      >
        <div className="p-4 space-y-3">
          <textarea
            data-testid="reply-input-textarea"
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder="Type your clarification (e.g. Spool 18 was on Line 24-XX)..."
            rows={3}
            className="w-full p-3 bg-sb-bg rounded-xl border border-sb-border text-caption text-sb-ink placeholder:text-sb-ink-3 focus:outline-none focus:border-sb-navy"
            autoFocus
          />

          <button
            type="button"
            data-testid="submit-reply-btn"
            disabled={!replyText.trim()}
            onClick={handleSendReply}
            className={`w-full py-3 rounded-full text-callout font-bold flex items-center justify-center gap-2 shadow-sm ${
              replyText.trim()
                ? 'bg-sb-navy text-sb-white hover:bg-sb-navy-pressed active:scale-95 transition-all'
                : 'bg-sb-border text-sb-ink-3 cursor-not-allowed'
            }`}
          >
            <Send className="w-4 h-4" />
            <span>Send Reply</span>
          </button>
        </div>
      </Sheet>

      {/* Ask Question Sheet for Planner */}
      <Sheet
        open={askSheetOpen}
        onOpenChange={setAskSheetOpen}
        title="Ask Supervisor for Clarification"
        description="Sets event status to Reply Needed and notifies supervisor."
        data-testid="ask-question-sheet"
      >
        <div className="p-4 space-y-3">
          <textarea
            data-testid="ask-question-textarea"
            value={questionText}
            onChange={(e) => setQuestionText(e.target.value)}
            placeholder="Type your question (e.g. Which line number or joint was this?)..."
            rows={3}
            className="w-full p-3 bg-sb-bg rounded-xl border border-sb-border text-caption text-sb-ink placeholder:text-sb-ink-3 focus:outline-none focus:border-sb-navy"
            autoFocus
          />

          <button
            type="button"
            data-testid="submit-question-btn"
            disabled={!questionText.trim()}
            onClick={handleSendQuestion}
            className={`w-full py-3 rounded-full text-callout font-bold flex items-center justify-center gap-2 shadow-sm ${
              questionText.trim()
                ? 'bg-sb-navy text-sb-white hover:bg-sb-navy-pressed active:scale-95 transition-all'
                : 'bg-sb-border text-sb-ink-3 cursor-not-allowed'
            }`}
          >
            <Send className="w-4 h-4" />
            <span>Send Question to Supervisor</span>
          </button>
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
