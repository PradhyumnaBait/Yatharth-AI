'use client';

import React, { useState } from 'react';
import {
  Check,
  Mic,
  Cpu,
  GitCommit,
  ShieldCheck,
  UserCheck,
  ChevronDown,
  ChevronUp,
  Clock,
  Layers,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import { FieldEvent } from '@/services/types';

export type ChainStep = 'Voice' | 'Event' | 'Match' | 'Approval';

export interface EvidenceChainProps {
  currentStep?: number; // 1 to 4 (1 = Voice, 2 = Event, 3 = Match, 4 = Approval)
  onStepClick?: (step: ChainStep, index: number) => void;
  className?: string;
  'data-testid'?: string;
  variant?: 'compact' | 'timeline' | 'detailed';
  event?: Partial<FieldEvent>;
  auditEntryId?: string;
  auditHash?: string;
  showExpandToggle?: boolean;
}

export const EvidenceChain: React.FC<EvidenceChainProps> = ({
  currentStep = 4,
  onStepClick,
  className = '',
  'data-testid': testId = 'evidence-chain',
  variant = 'timeline',
  event,
  auditEntryId = 'AUD-1281',
  auditHash = 'sha256:7f8a9b2c3d4e5f6a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4',
  showExpandToggle = false,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const steps: ChainStep[] = ['Voice', 'Event', 'Match', 'Approval'];

  // Data values from event or realistic Scene 7 defaults
  const reporterName = event?.authorName || 'Rahul Patil';
  const reporterRole = event?.authorRole || 'Field Supervisor';
  const reporterCrew = event?.authorCrew || 'Welding Crew B';
  const captureTime = event?.timestamp || '08:42:11 AM';
  const transcript = event?.rawText || 'Spool 17 erection completed at Rack 4. Hydrotest prep team standing by.';

  const matchedId = event?.suggestedActivityId || 'PIP-24-017';
  const matchedName = event?.suggestedActivityName || 'Weld Piping System 24-XX';
  const confidence = event?.confidence || 94;

  const approverName = 'Meera Nair';
  const approverRole = 'Project Controls Planner';
  const isApproved = event?.status === 'Verified' || currentStep >= 4;

  // Compact Variant (Horizontal mini-stepper)
  if (variant === 'compact') {
    return (
      <div
        data-testid={testId}
        className={`flex items-center justify-between w-full py-2 ${className}`}
      >
        {steps.map((step, idx) => {
          const stepNum = idx + 1;
          const isComplete = stepNum < currentStep || (stepNum === 4 && isApproved);
          const isCurrent = stepNum === currentStep;
          const isLast = idx === steps.length - 1;

          return (
            <React.Fragment key={step}>
              <div
                onClick={() => onStepClick?.(step, idx)}
                className={`flex items-center gap-1.5 cursor-pointer ${
                  isComplete || isCurrent ? 'text-sb-navy' : 'text-sb-ink-3'
                }`}
                data-testid={`${testId}-step-${idx}`}
              >
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold border transition-colors ${
                    isComplete
                      ? 'bg-sb-navy text-sb-white border-sb-navy shadow-xs'
                      : isCurrent
                      ? 'bg-sb-white text-sb-navy border-sb-navy ring-2 ring-sb-navy/20'
                      : 'bg-sb-white text-sb-ink-3 border-sb-border'
                  }`}
                >
                  {isComplete ? <Check className="w-3 h-3" strokeWidth={2.5} /> : stepNum}
                </div>
                <span className={`text-caption ${isCurrent ? 'font-bold' : isComplete ? 'font-semibold' : 'font-normal'}`}>
                  {step}
                </span>
              </div>

              {!isLast && (
                <div
                  className={`flex-1 mx-2 h-0.5 border-t ${
                    stepNum < currentStep ? 'border-sb-navy' : 'border-dashed border-sb-border'
                  }`}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    );
  }

  // Timeline / Detailed Variant (Full Scene 7 Cryptographic Audit Trail)
  return (
    <div
      data-testid={testId}
      className={`bg-sb-white rounded-2xl p-4 sm:p-5 border border-sb-border shadow-e2 space-y-4 ${className}`}
    >
      {/* 1. Header with Verification Badge */}
      <div className="flex items-center justify-between border-b border-sb-border/60 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center border border-emerald-300">
            <ShieldCheck className="w-4 h-4 text-emerald-700" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-mono uppercase tracking-wider text-sb-ink-3 font-bold">
                Forensic Audit Trail
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold">
                SHA-256 Intact
              </span>
            </div>
            <h3 className="text-callout font-bold text-sb-navy leading-tight">
              Evidence Chain & Provenance
            </h3>
          </div>
        </div>

        {showExpandToggle && (
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 text-sb-ink-3 hover:text-sb-navy transition-colors"
            aria-label={isExpanded ? 'Collapse timeline' : 'Expand timeline'}
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        )}
      </div>

      {isExpanded && (
        <div className="relative pl-6 space-y-5 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-sb-border">
          {/* STEP 1: Voice Capture */}
          <div className="relative group" data-testid={`${testId}-step-voice`}>
            <div className="absolute -left-6 top-0.5 w-5 h-5 rounded-full bg-sb-navy text-sb-white flex items-center justify-center shadow-xs border-2 border-sb-white">
              <Mic className="w-2.5 h-2.5" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-between text-caption">
                <span className="font-bold text-sb-navy">1. Field Voice Capture</span>
                <span className="font-mono text-[11px] text-sb-ink-3">{captureTime}</span>
              </div>
              <div className="text-[12px] text-sb-ink-2">
                Reported by <strong className="text-sb-navy">{reporterName}</strong> ({reporterRole}, {reporterCrew})
              </div>
              <div className="p-2.5 rounded-xl bg-sb-bg text-[12px] text-sb-ink italic border border-sb-border/60">
                &ldquo;{transcript}&rdquo;
              </div>
            </div>
          </div>

          {/* STEP 2: AI Entity Extraction */}
          <div className="relative group" data-testid={`${testId}-step-event`}>
            <div className="absolute -left-6 top-0.5 w-5 h-5 rounded-full bg-blue-600 text-sb-white flex items-center justify-center shadow-xs border-2 border-sb-white">
              <Cpu className="w-2.5 h-2.5" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-between text-caption">
                <span className="font-bold text-sb-navy">2. Natural Language Extraction</span>
                <span className="font-mono text-[11px] text-sb-ink-3">Automated Parser</span>
              </div>
              <div className="flex flex-wrap gap-1.5 pt-0.5">
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-blue-50 border border-blue-200 text-blue-900 font-semibold">
                  Discipline: Piping
                </span>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-900 font-semibold">
                  Object: Spool 17
                </span>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-amber-50 border border-amber-200 text-amber-900 font-semibold">
                  Location: Rack 4
                </span>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-sb-bg border border-sb-border text-sb-navy font-semibold">
                  Action: Erection
                </span>
              </div>
            </div>
          </div>

          {/* STEP 3: AI Schedule Match */}
          <div className="relative group" data-testid={`${testId}-step-match`}>
            <div className="absolute -left-6 top-0.5 w-5 h-5 rounded-full bg-emerald-600 text-sb-white flex items-center justify-center shadow-xs border-2 border-sb-white">
              <GitCommit className="w-2.5 h-2.5" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-between text-caption">
                <span className="font-bold text-sb-navy">3. P6 Schedule Matching</span>
                <span className="font-mono text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  {confidence}% Confidence
                </span>
              </div>
              <div className="text-[12px] text-sb-ink-2">
                Matched to <strong className="font-mono text-sb-navy">{matchedId}</strong> ({matchedName})
              </div>
              <div className="text-[11px] text-sb-ink-3">
                Precedence Check: Predecessor PIP-24-016 verified complete · Retained Logic compliant
              </div>
            </div>
          </div>

          {/* STEP 4: Planner Sign-off & Cryptographic Ledger */}
          <div className="relative group" data-testid={`${testId}-step-approval`}>
            <div className={`absolute -left-6 top-0.5 w-5 h-5 rounded-full flex items-center justify-center shadow-xs border-2 border-sb-white ${
              isApproved ? 'bg-sb-navy text-sb-white' : 'bg-sb-bg text-sb-ink-3 border-sb-border'
            }`}>
              <UserCheck className="w-2.5 h-2.5" />
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-caption">
                <span className="font-bold text-sb-navy">4. Human Sign-Off & Ledger Commit</span>
                <span className="font-mono text-[11px] font-bold text-sb-navy bg-sb-navy-tint px-2 py-0.5 rounded">
                  {auditEntryId}
                </span>
              </div>
              <div className="text-[12px] text-sb-ink-2">
                Signed by <strong className="text-sb-navy">{approverName}</strong> ({approverRole})
              </div>
              <div className="text-[11px] font-mono text-emerald-800 font-bold bg-emerald-50/70 p-2 rounded-xl border border-emerald-200/80 space-y-1">
                <div className="flex justify-between">
                  <span>Delta: 38% → 100% (Physical Complete)</span>
                  <span className="text-sb-ink-3 font-normal">20 Sep 2026</span>
                </div>
                <div className="text-[10px] text-sb-ink-3 font-mono truncate pt-0.5 border-t border-emerald-200/60">
                  Hash: {auditHash}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. Footer Audit Link */}
      <div className="pt-2 border-t border-sb-border/60 flex items-center justify-between text-caption">
        <span className="text-[11px] text-sb-ink-3 font-mono">
          Immutable tamper-evident record
        </span>
        <span className="text-[11px] font-bold text-sb-navy font-mono">
          Ledger Entry: {auditEntryId}
        </span>
      </div>
    </div>
  );
};
