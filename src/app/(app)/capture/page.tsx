'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  X,
  Mic,
  Type,
  Globe,
  Clock,
  CheckCircle2,
  CloudOff,
  RotateCcw,
  Home,
  ChevronRight,
  Loader2,
  Sparkles,
  Volume2,
} from 'lucide-react';
import { PageContainer } from '@/components/shell/PageContainer';
import { LiveAudioWaveform } from '@/components/capture/LiveAudioWaveform';
import { ClarificationCard } from '@/components/capture/ClarificationCard';
import { ConfirmReportCard } from '@/components/capture/ConfirmReportCard';
import { extractFieldInfo, getClarificationQuestion, ClarificationQuestion } from '@/mocks/extractor';
import { matchEventText } from '@/mocks/matcher';
import { useEventsStore } from '@/store/events';
import { useOfflineStore } from '@/store/offline';
import { useAuthStore } from '@/store/auth';
import { useUiStore } from '@/store/ui';
import { demoNow } from '@/mocks/clock';
import { ExtractedInfo, FieldEvent } from '@/services/types';
import { voiceService } from '@/services';

type CaptureState =
  | 'idle'
  | 'listening'
  | 'transcribing'
  | 'clarify'
  | 'confirm'
  | 'submitting'
  | 'submitted'
  | 'queued';

const EXAMPLE_CHIPS = [
  {
    label: 'Spool 17 erection at Rack 4 (Golden Demo)',
    text: 'Spool 17 erection completed at Rack 4. Hydrotest prep team standing by.',
  },
  {
    label: 'Line 24-XX Spool 18 welding',
    text: 'Line 24-XX ki spool 18 welding complete ho gayi hai.',
  },
  {
    label: 'Trenching 200m at KP 184.2',
    text: 'KP 184.2 pe do sau meter trenching ho gayi.',
  },
  {
    label: 'Crane unavailable delay',
    text: 'Kal se crane nahi aayi, lowering ruka hua hai.',
  },
  {
    label: 'Spool erection (Needs clarify)',
    text: 'Spool erection finished.',
  },
] as const;

function CapturePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const prefilledActivity = searchParams.get('activity');

  const { user } = useAuthStore();
  const addEvent = useEventsStore((s) => s.addEvent);
  const addQueuedReport = useOfflineStore((s) => s.addQueuedReport);
  const isStoreOnline = useOfflineStore((s) => s.isOnline);
  const isSimulatingOffline = useUiStore((s) => s.isSimulatingOffline);

  // State machine state
  const [state, setState] = useState<CaptureState>('idle');
  const [isTypeInstead, setIsTypeInstead] = useState(false);
  const [typeText, setTypeText] = useState('');
  const [language, setLanguage] = useState('Hindi + English');
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // Audio Recording references
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Data processing states
  const [rawText, setRawText] = useState('');
  const [extractedInfo, setExtractedInfo] = useState<ExtractedInfo>({});
  const [clarificationQuestion, setClarificationQuestion] = useState<ClarificationQuestion | null>(null);
  const [submittedEventId, setSubmittedEventId] = useState<string>('E-2110');
  const [submissionTimestamp, setSubmissionTimestamp] = useState<string>('08:42:11');

  const stopRecordingRef = useRef<() => void>();

  // Timer effect for listening state
  useEffect(() => {
    if (state === 'listening') {
      setElapsedSeconds(0);
      timerIntervalRef.current = setInterval(() => {
        setElapsedSeconds((prev) => {
          if (prev >= 59) {
            // Auto-stop at 60s
            stopRecordingRef.current?.();
            return 60;
          }
          return prev + 1;
        });
      }, 1000);
    } else {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    }
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [state]);

  // Clean up media stream on unmount
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach((t) => t.stop());
      }
    };
  }, [stream]);

  // Start real microphone recording
  const startRecording = async () => {
    try {
      audioChunksRef.current = [];
      const userStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setStream(userStream);

      const recorder = new MediaRecorder(userStream);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      recorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);

        try {
          const res = await voiceService.transcribe(audioBlob);
          if (res && res.transcript && res.transcript.trim()) {
            processText(res.transcript.trim());
          } else {
            useUiStore.getState().showToast("Couldn't transcribe — try again or type it.");
            setState('idle');
          }
        } catch (err: any) {
          console.warn('Transcription error:', err);
          useUiStore.getState().showToast(err?.message || "Couldn't transcribe — try again or type it.");
          setState('idle');
        }
      };

      recorder.start();
      setState('listening');
    } catch (err) {
      console.warn('Microphone permission denied or unavailable:', err);
      // Graceful fallback to synthetic listening/typing
      setState('listening');
    }
  };

  // Stop recording and trigger transcribing
  const stopRecording = () => {
    const wasRecording = mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive';
    if (wasRecording) {
      mediaRecorderRef.current?.stop();
    }
    if (stream) {
      stream.getTracks().forEach((t) => t.stop());
      setStream(null);
    }
    setState('transcribing');

    if (!wasRecording) {
      // Simulate 700ms transcription latency when microphone was unavailable
      setTimeout(() => {
        const defaultText = prefilledActivity
          ? `Activity ${prefilledActivity} field progress completed.`
          : 'Spool 17 erection completed at Rack 4. Hydrotest prep team standing by.';
        processText(defaultText);
      }, 700);
    }
  };
  stopRecordingRef.current = stopRecording;

  // Process a text transcript and determine if clarification is required
  const processText = (text: string) => {
    setRawText(text);
    const info = extractFieldInfo(text);
    setExtractedInfo(info);

    const question = getClarificationQuestion(info);
    if (question) {
      setClarificationQuestion(question);
      setState('clarify');
    } else {
      setClarificationQuestion(null);
      setState('confirm');
    }
  };

  // Clarification answered
  const handleClarificationAnswer = (field: string, answer: string) => {
    const updated = { ...extractedInfo, [field]: answer };
    setExtractedInfo(updated);
    setClarificationQuestion(null);
    setState('confirm');
  };

  const handleSkipClarification = () => {
    if (clarificationQuestion) {
      const updated = { ...extractedInfo, [clarificationQuestion.field]: 'Unspecified' };
      setExtractedInfo(updated);
    }
    setClarificationQuestion(null);
    setState('confirm');
  };

  // Example chip tapped in idle
  const handleExampleChip = (phrase: string) => {
    setRawText(phrase);
    setState('transcribing');
    setTimeout(() => {
      processText(phrase);
    }, 500);
  };

  // Manual Type Instead submit
  const handleTypeSubmit = () => {
    if (!typeText.trim()) return;
    const input = typeText.trim();
    setTypeText('');
    setState('transcribing');
    setTimeout(() => {
      processText(input);
    }, 500);
  };

  // Final confirmation & submit
  const handleFinalSubmit = (
    finalInfo: ExtractedInfo,
    photos: string[],
    note: string,
    delayCategory?: string
  ) => {
    setState('submitting');

    setTimeout(() => {
      const now = demoNow();
      const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(
        now.getMinutes()
      ).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
      setSubmissionTimestamp(timeStr);

      const isOnline = typeof navigator !== 'undefined'
        ? navigator.onLine && isStoreOnline && !isSimulatingOffline
        : true;

      if (!isOnline) {
        // Offline: save to queue
        addQueuedReport({
          rawText,
          timestamp: `${String(now.getHours()).padStart(2, '0')}:${String(
            now.getMinutes()
          ).padStart(2, '0')} AM`,
          audioBlob: audioUrl || undefined,
        });
        setState('queued');
      } else {
        // Online: match and write to events store
        const match = matchEventText(rawText);
        const newEvt: Partial<FieldEvent> = {
          source: 'voice',
          rawText,
          timestamp: `${String(now.getHours()).padStart(2, '0')}:${String(
            now.getMinutes()
          ).padStart(2, '0')} AM`,
          authorName: user?.name || 'Rahul Patil',
          authorRole: user?.title || 'Field Supervisor',
          authorCrew: 'Welding Crew B',
          status: finalInfo.status === 'Delay' ? 'Delay' : 'Review',
          queueTier: finalInfo.status === 'Delay' ? 'Delay' : 'Review',
          confidence: match.confidence || 94,
          suggestedActivityId: match.activityId || prefilledActivity || 'PIP-24-017',
          suggestedActivityName: match.activityName || 'Weld Piping System 24-XX',
          extractedInfo: finalInfo,
          reasons: match.reasons || [
            'Discipline Match: Piping WBS KP3.PIPING.RACK4',
            'Location Alignment: Rack 4 corresponds to Section 4B active chainage',
            'Precedence Check: Predecessor activity PIP-24-016 verified complete',
          ],
          audioUrl: audioUrl || undefined,
          thumbnailUrl: photos[0] || undefined,
          delayCategory,
        };

        const created = addEvent(newEvt);
        setSubmittedEventId(created.id);
        setState('submitted');
      }
    }, 500);
  };

  const handleResetToIdle = () => {
    setRawText('');
    setExtractedInfo({});
    setClarificationQuestion(null);
    setAudioUrl(null);
    setState('idle');
  };

  const formatTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  return (
    <div
      data-testid="capture-modal-su2"
      className="fixed inset-0 z-50 bg-sb-navy text-sb-white flex flex-col justify-between overflow-y-auto select-none"
    >
      {/* 1. Top Header Bar */}
      <div className="w-full flex items-center justify-between p-4 border-b border-sb-white/10 shrink-0">
        <button
          type="button"
          data-testid="close-capture-btn"
          onClick={() => router.back()}
          className="w-10 h-10 rounded-full flex items-center justify-center bg-sb-white/10 hover:bg-sb-white/20 active:bg-sb-white/30 text-sb-white transition-colors"
          aria-label="Close Capture"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center min-w-0 px-2">
          <div className="text-[12px] font-semibold text-sb-white/90 truncate">
            Kandla–Panipat · 20 Sep 2026
          </div>
          <div className="text-[11px] text-sb-white/60 font-mono truncate">
            {prefilledActivity ? `Target: ${prefilledActivity}` : 'Time Agent Voice Capture'}
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Language Chip */}
          <button
            type="button"
            data-testid="capture-language-btn"
            onClick={() => setLanguage(language === 'Hindi + English' ? 'English' : 'Hindi + English')}
            className="px-2.5 py-1 rounded-full bg-sb-white/10 hover:bg-sb-white/20 text-[11px] font-medium text-sb-white flex items-center gap-1 transition-colors"
          >
            <Globe className="w-3 h-3" />
            <span>{language}</span>
          </button>

          {/* Type Instead Toggle */}
          <button
            type="button"
            data-testid="toggle-type-instead-btn"
            onClick={() => setIsTypeInstead(!isTypeInstead)}
            className={`p-2 rounded-full transition-colors ${
              isTypeInstead ? 'bg-sb-white text-sb-navy font-bold' : 'bg-sb-white/10 text-sb-white'
            }`}
            title="Type instead"
            aria-label="Type instead"
          >
            <Type className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. Main Visual Stream Body */}
      <PageContainer
        maxWidth="sm"
        withGutter={false}
        withVerticalRhythm={false}
        className="flex-1 flex flex-col items-center justify-center p-4 max-w-[420px] w-full mx-auto"
      >
        {/* STATE: IDLE */}
        {state === 'idle' && (
          <div className="flex flex-col items-center justify-center space-y-6 text-center animate-in fade-in w-full">
            <div className="space-y-1">
              <h2 className="text-title-2 font-bold text-sb-white">
                What got done today?
              </h2>
              <p className="text-caption text-sb-white/70">
                Tap the microphone and speak your field progress or delay.
              </p>
            </div>

            {/* Big 96px Mic Button */}
            <div className="relative my-2">
              <div className="absolute inset-0 rounded-full bg-sb-white/10 animate-ping opacity-30" />
              <button
                type="button"
                data-testid="big-mic-record-btn"
                onClick={startRecording}
                className="relative w-24 h-24 rounded-full bg-sb-white text-sb-navy hover:bg-sb-white/90 sb-press-spring flex items-center justify-center shadow-e3 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sb-white/40 cursor-pointer"
                aria-label="Start recording"
              >
                <Mic className="w-10 h-10" />
              </button>
            </div>

            {/* Type Instead Text Box if toggled */}
            {isTypeInstead && (
              <div className="w-full space-y-2 p-3 bg-sb-white/10 rounded-2xl border border-sb-white/20" data-testid="type-mode-container">
                <input
                  type="text"
                  data-testid="type-input-field"
                  value={typeText}
                  onChange={(e) => setTypeText(e.target.value)}
                  placeholder="e.g. Spool 17 erection completed at Rack 4..."
                  className="w-full h-11 px-3.5 bg-sb-white text-sb-navy rounded-xl text-caption placeholder:text-sb-ink-3 focus:outline-none"
                  onKeyDown={(e) => e.key === 'Enter' && handleTypeSubmit()}
                />
                <button
                  type="button"
                  data-testid="type-submit-btn"
                  onClick={handleTypeSubmit}
                  className="w-full py-2.5 rounded-xl bg-sb-white text-sb-navy font-bold text-caption hover:bg-sb-white/90"
                >
                  Process Text Update
                </button>
              </div>
            )}

            {/* Quick Example Chips */}
            <div className="w-full space-y-2 pt-2">
              <div className="text-[11px] font-mono uppercase tracking-wider text-sb-white/50">
                Quick Examples
              </div>
              <div className="flex flex-col gap-2" data-testid="example-chips-list">
                {EXAMPLE_CHIPS.map((chip, idx) => (
                  <button
                    key={idx}
                    type="button"
                    data-testid={`example-chip-${idx}`}
                    onClick={() => handleExampleChip(chip.text)}
                    className="w-full p-2.5 rounded-xl bg-sb-white/10 hover:bg-sb-white/20 active:bg-sb-white/30 text-left transition-colors border border-sb-white/10 flex items-center justify-between text-caption group"
                  >
                    <span className="text-sb-white font-medium truncate">{chip.label}</span>
                    <ChevronRight className="w-4 h-4 text-sb-white/40 group-hover:text-sb-white shrink-0 ml-2" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* STATE: LISTENING (Waveform + Active Recording) */}
        {state === 'listening' && (
          <div className="flex flex-col items-center justify-center space-y-6 text-center animate-in fade-in w-full">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sb-critical text-sb-white text-[12px] font-mono font-bold animate-pulse shadow-sm">
                <span className="w-2 h-2 rounded-full bg-sb-white" />
                <span>REC · {formatTimer(elapsedSeconds)} / 01:00</span>
              </div>
              <h2 className="text-title-2 font-bold text-sb-white pt-2">
                Listening to your update...
              </h2>
              <p className="text-caption text-sb-white/70">
                Speak clearly. Mention spool number, rack, line, and status.
              </p>
            </div>

            {/* Live Audio Waveform */}
            <div className="w-full max-w-[300px] bg-sb-white/10 rounded-2xl p-4 border border-sb-white/15 shadow-inner">
              <LiveAudioWaveform stream={stream} isRecording={true} />
            </div>

            {/* Stop Recording Button */}
            <div className="flex flex-col items-center gap-3">
              <button
                type="button"
                data-testid="stop-recording-btn"
                onClick={stopRecording}
                className="w-20 h-20 rounded-full bg-sb-critical text-sb-white hover:bg-sb-critical/90 active:scale-95 transition-all flex items-center justify-center shadow-e3 focus-visible:outline-none ring-4 ring-sb-critical/40"
                aria-label="Stop recording"
              >
                <div className="w-6 h-6 rounded bg-sb-white" />
              </button>
              <span className="text-[12px] text-sb-white/70 font-mono">Tap square to finish</span>
            </div>

            <button
              type="button"
              data-testid="cancel-recording-btn"
              onClick={handleResetToIdle}
              className="text-caption text-sb-white/60 hover:text-sb-white transition-colors"
            >
              Cancel recording
            </button>
          </div>
        )}

        {/* STATE: TRANSCRIBING */}
        {state === 'transcribing' && (
          <div className="flex flex-col items-center justify-center space-y-5 text-center animate-in fade-in w-full py-8">
            <div className="w-14 h-14 rounded-full bg-sb-white/10 flex items-center justify-center animate-spin text-sb-white border border-sb-white/20">
              <Loader2 className="w-7 h-7" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-title-3 font-bold text-sb-white">
                Transcribing & Normalising...
              </h3>
              <p className="text-caption text-sb-white/70 font-mono max-w-[280px]">
                Extracting action, object, location, and status parameters
              </p>
            </div>
            <div className="w-48 h-1.5 bg-sb-white/20 rounded-full overflow-hidden">
              <div className="h-full bg-sb-white w-2/3 animate-pulse rounded-full" />
            </div>
          </div>
        )}

        {/* STATE: CLARIFY OR CONFIRM (Continuous Unified Sequence) */}
        {(state === 'clarify' || state === 'confirm') && (
          <div className="w-full space-y-4">
            <ConfirmReportCard
              initialInfo={extractedInfo}
              rawText={rawText}
              isSubmitting={false}
              audioUrl={audioUrl}
              clarificationQuestion={state === 'clarify' ? clarificationQuestion : null}
              onAnswerClarification={handleClarificationAnswer}
              onSkipClarification={handleSkipClarification}
              onSubmit={handleFinalSubmit}
              onReRecord={handleResetToIdle}
            />
          </div>
        )}

        {/* STATE: SUBMITTING */}
        {state === 'submitting' && (
          <div className="flex flex-col items-center justify-center space-y-4 text-center animate-in fade-in py-8">
            <div className="w-14 h-14 rounded-full border-4 border-sb-white/30 border-t-sb-white animate-spin" />
            <div className="space-y-1">
              <h3 className="text-title-3 font-bold text-sb-white">
                Submitting to Primavera P6...
              </h3>
              <p className="text-caption text-sb-white/70">
                Matching schedule activity and routing to planner queue
              </p>
            </div>
          </div>
        )}

        {/* STATE: SUBMITTED (Online success) */}
        {state === 'submitted' && (
          <div
            data-testid="submitted-success-card"
            className="bg-sb-white text-sb-navy rounded-2xl p-6 border border-sb-border shadow-e3 text-center space-y-4 w-full animate-in zoom-in-95"
          >
            <div className="w-14 h-14 rounded-full bg-sb-verified-tint text-sb-verified-ink flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8 text-sb-verified" />
            </div>

            <div className="space-y-1">
              <div className="text-[11px] font-mono text-sb-ink-3">
                Sent at {submissionTimestamp}
              </div>
              <h3 className="text-title-2 font-bold text-sb-navy">
                Field Update Sent
              </h3>
              <div className="font-mono text-caption font-bold text-sb-navy bg-sb-bg py-1 px-3 rounded-full inline-block mt-1">
                Ref: {submittedEventId}
              </div>
              <p className="text-caption text-sb-ink-2 pt-2">
                Your planner will verify this report against the P6 schedule baseline in the Review Workbench.
              </p>
            </div>

            <div className="space-y-2 pt-2">
              <button
                type="button"
                data-testid="capture-report-another-btn"
                onClick={handleResetToIdle}
                className="w-full py-3 rounded-full bg-sb-navy text-sb-white font-semibold text-callout hover:bg-sb-navy-pressed flex items-center justify-center gap-2 sb-press-spring cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Report Another Update</span>
              </button>

              <button
                type="button"
                data-testid="capture-done-btn"
                onClick={() => router.push('/home')}
                className="w-full py-2.5 rounded-full border border-sb-border text-sb-navy font-semibold text-caption hover:bg-sb-bg flex items-center justify-center gap-1.5 sb-press-spring cursor-pointer"
              >
                <Home className="w-4 h-4" />
                <span>Done & Return Home</span>
              </button>
            </div>
          </div>
        )}

        {/* STATE: QUEUED (Offline saved) */}
        {state === 'queued' && (
          <div
            data-testid="queued-offline-card"
            className="bg-sb-white text-sb-navy rounded-2xl p-6 border border-sb-border shadow-e3 text-center space-y-4 w-full animate-in zoom-in-95"
          >
            <div className="w-14 h-14 rounded-full bg-sb-review-tint text-sb-review-ink flex items-center justify-center mx-auto">
              <CloudOff className="w-8 h-8 text-sb-review" />
            </div>

            <div className="space-y-1">
              <div className="text-[11px] font-mono text-sb-ink-3">
                Offline Mode Active
              </div>
              <h3 className="text-title-2 font-bold text-sb-navy">
                Saved on Device
              </h3>
              <p className="text-caption text-sb-ink-2 pt-1">
                Your report has been stored in your device queue. It will automatically sync as soon as internet connection restores.
              </p>
            </div>

            <div className="space-y-2 pt-2">
              <button
                type="button"
                data-testid="view-queued-reports-btn"
                onClick={() => router.push('/reports?tab=Queued')}
                className="w-full py-3 rounded-full bg-sb-navy text-sb-white font-semibold text-callout hover:bg-sb-navy-pressed flex items-center justify-center gap-2 sb-press-spring cursor-pointer"
              >
                <span>View Queued Reports in Reports</span>
                <ChevronRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                data-testid="queued-done-btn"
                onClick={() => router.push('/home')}
                className="w-full py-2.5 rounded-full border border-sb-border text-sb-navy font-semibold text-caption hover:bg-sb-bg sb-press-spring cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </PageContainer>

      {/* 3. Bottom Safe Area Bar */}
      <div className="p-3 text-center text-[11px] text-sb-white/40 font-mono border-t border-sb-white/10 shrink-0">
        SchedBridge Time Agent · Zero-gradient industrial EPC edition
      </div>
    </div>
  );
}

export default function CapturePage() {
  return (
    <React.Suspense fallback={<div className="fixed inset-0 bg-sb-navy" />}>
      <CapturePageContent />
    </React.Suspense>
  );
}
