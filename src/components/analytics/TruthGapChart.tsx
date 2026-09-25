'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useProjectStore } from '@/store/project';
import { useEventsStore } from '@/store/events';
import { Sheet } from '@/components/ui/Sheet';
import { Phase, FieldEvent } from '@/services/types';
import { AlertCircle, ChevronRight, ArrowUpRight } from 'lucide-react';

export const TruthGapChart: React.FC = () => {
  const router = useRouter();
  const phases = useProjectStore((s) => s.phases);
  const events = useEventsStore((s) => s.events);

  const [selectedPhase, setSelectedPhase] = useState<Phase | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  const unverifiedEventsForPhase = (phaseName: string): FieldEvent[] => {
    return events.filter(
      (e) =>
        e.status !== 'Verified' &&
        (e.suggestedActivityName?.toLowerCase().includes(phaseName.toLowerCase()) ||
          e.extractedInfo?.action?.toLowerCase().includes(phaseName.toLowerCase()) ||
          e.rawText.toLowerCase().includes(phaseName.toLowerCase()))
    );
  };

  const handleRowClick = (phase: Phase) => {
    setSelectedPhase(phase);
    setSheetOpen(true);
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      {/* 1. Single Primary Variance Callout Card */}
      <div className="bg-amber-50/90 border border-amber-200/80 rounded-2xl p-4 flex items-center justify-between gap-3 shadow-2xs">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-500/15 text-amber-800 flex items-center justify-center shrink-0 mt-0.5">
            <AlertCircle className="w-4 h-4 text-amber-700" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-amber-900">
                Plan vs Actual Truth Gap
              </span>
            </div>
            <p className="text-caption text-amber-900 font-medium mt-0.5">
              Reported progress runs <span className="font-bold">3 points</span> ahead of verified progress.
            </p>
          </div>
        </div>

        <div className="text-right shrink-0 bg-white px-2.5 py-1 rounded-xl border border-amber-200 shadow-2xs">
          <span className="text-[10px] font-mono uppercase font-bold text-amber-700 block">Variance</span>
          <span className="text-callout font-mono font-bold text-amber-800">+3 pts</span>
        </div>
      </div>

      {/* 2. Plan vs Actual: Two-Line Comparison Chart */}
      <div className="bg-white rounded-2xl border border-sb-border p-4 shadow-e1">
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-sb-border/60">
          <div>
            <h3 className="text-callout font-bold text-sb-navy">Plan vs Actual by Phase</h3>
            <p className="text-[11px] text-sb-ink-3 font-mono">DPR Claimed vs Physical Verified Evidence</p>
          </div>
          <div className="flex items-center gap-3 text-caption">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-1.5 rounded-full bg-slate-300 inline-block" />
              <span className="text-[11px] text-sb-ink-3 font-mono">Plan (DPR)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-1.5 rounded-full bg-sb-navy inline-block" />
              <span className="text-[11px] text-sb-navy font-mono font-bold">Actual (Verified)</span>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {phases.map((phase, idx) => {
            const gap = phase.dprReported - phase.verified;
            return (
              <div
                key={phase.id}
                data-testid={`truth-gap-row-${phase.id}`}
                onClick={() => handleRowClick(phase)}
                className="group p-3 rounded-xl hover:bg-sb-bg/80 cursor-pointer transition-all border border-sb-border/40 hover:border-sb-navy/30"
                style={{
                  animation: `fadeIn 400ms ease-out ${idx * 60}ms both`,
                }}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-caption text-sb-navy group-hover:text-sb-navy flex items-center gap-1">
                    {phase.name}
                    <ChevronRight className="w-3.5 h-3.5 text-sb-ink-3 group-hover:translate-x-0.5 transition-transform" />
                  </span>

                  {/* Single Variance Callout per row */}
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono text-sb-ink-3">
                      Plan <span className="font-semibold text-sb-ink">{phase.dprReported}%</span> · Actual{' '}
                      <span className="font-bold text-sb-navy">{phase.verified}%</span>
                    </span>
                    {gap > 0 ? (
                      <span className="text-[11px] font-mono font-bold text-amber-800 bg-amber-50 border border-amber-200/80 px-2 py-0.5 rounded-full">
                        +{gap} pts gap
                      </span>
                    ) : (
                      <span className="text-[11px] font-mono font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                        Aligned
                      </span>
                    )}
                  </div>
                </div>

                {/* Clean Two-Line Comparison: Plan vs Actual */}
                <div className="space-y-1.5">
                  {/* Line 1: Plan / DPR Reported */}
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-sb-ink-3 w-10 shrink-0">Plan</span>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-slate-300 rounded-full transition-all duration-500 ease-out"
                        style={{ width: `${Math.min(100, phase.dprReported)}%` }}
                      />
                    </div>
                  </div>
                  {/* Line 2: Actual / Verified */}
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold text-sb-navy w-10 shrink-0">Actual</span>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-sb-navy rounded-full transition-all duration-500 ease-out"
                        style={{ width: `${Math.min(100, phase.verified)}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Drill-down Sheet */}
      <Sheet
        isOpen={sheetOpen}
        onClose={() => setSheetOpen(false)}
        title={selectedPhase ? `${selectedPhase.name} — Pending Verification` : 'Pending Verification'}
      >
        {selectedPhase && (
          <div className="space-y-4">
            <div className="bg-sb-bg-subtle p-3 rounded-2xl text-caption border border-sb-border/60">
              <p className="text-sb-ink">
                <span className="font-semibold">{selectedPhase.name}</span> currently has a gap of{' '}
                <span className="font-bold text-amber-700">
                  {selectedPhase.dprReported - selectedPhase.verified} points
                </span>{' '}
                between DPR statements and verified field evidence.
              </p>
            </div>

            <div>
              <h4 className="text-caption font-semibold uppercase text-sb-text-subtle tracking-wide mb-2 font-mono">
                Reported, Not Yet Verified Evidence
              </h4>

              {(() => {
                const phaseEvents = unverifiedEventsForPhase(selectedPhase.name);
                if (phaseEvents.length === 0) {
                  return (
                    <div className="py-6 text-center text-caption text-sb-text-subtle bg-slate-50 rounded-xl">
                      No unverified events found for this phase.
                    </div>
                  );
                }
                return (
                  <div className="space-y-2">
                    {phaseEvents.map((evt) => (
                      <div
                        key={evt.id}
                        data-testid={`unverified-event-${evt.id}`}
                        onClick={() => {
                          setSheetOpen(false);
                          router.push(`/event/${evt.id}`);
                        }}
                        className="p-3 border border-sb-border rounded-xl bg-white hover:border-sb-navy cursor-pointer transition-colors shadow-2xs"
                      >
                        <div className="flex items-center justify-between text-caption mb-1">
                          <span className="font-mono font-semibold text-sb-navy">{evt.id}</span>
                          <span className="text-mono-s text-sb-text-subtle">{evt.timestamp}</span>
                        </div>
                        <p className="text-caption text-sb-ink line-clamp-2 italic">
                          &ldquo;{evt.rawText}&rdquo;
                        </p>
                        <div className="flex items-center justify-between mt-2 pt-2 border-t border-sb-border-subtle text-[11px]">
                          <span className="text-sb-text-muted">By {evt.authorName || 'Field Team'}</span>
                          <span className="text-sb-navy font-semibold flex items-center gap-0.5">
                            Open Event <ArrowUpRight className="w-3 h-3" />
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>
          </div>
        )}
      </Sheet>
    </div>
  );
};
