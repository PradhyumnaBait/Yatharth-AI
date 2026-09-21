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
    <div className="space-y-4">
      {/* Truth Gap Sentence Card */}
      <div className="bg-amber-50 border border-amber-200 rounded-card p-4 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-amber-700 flex-shrink-0 mt-0.5" />
        <div>
          <h4 className="text-body font-semibold text-amber-900">
            Truth Gap Analysis
          </h4>
          <p className="text-caption text-amber-800 mt-0.5">
            Reported progress runs <span className="font-bold">3 points</span> ahead of verified progress.
          </p>
        </div>
      </div>

      {/* Paired Bar Chart */}
      <div className="bg-white rounded-card border border-sb-border p-4 shadow-e1">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-body font-semibold text-sb-ink">Phase Verification Gap</h3>
          <div className="flex items-center gap-4 text-caption text-sb-text-subtle">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm border border-sb-border-strong bg-transparent inline-block" />
              <span>DPR Reported</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-sb-navy inline-block" />
              <span className="text-sb-ink font-medium">Verified</span>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {phases.map((phase) => {
            const gap = phase.dprReported - phase.verified;
            return (
              <div
                key={phase.id}
                data-testid={`truth-gap-row-${phase.id}`}
                onClick={() => handleRowClick(phase)}
                className="group p-2 -mx-2 rounded-lg hover:bg-sb-bg cursor-pointer transition-colors"
              >
                <div className="flex items-center justify-between text-caption mb-1.5">
                  <span className="font-medium text-sb-ink group-hover:text-sb-navy flex items-center gap-1">
                    {phase.name}
                    <ChevronRight className="w-3.5 h-3.5 text-sb-text-subtle opacity-0 group-hover:opacity-100 transition-opacity" />
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-mono-s text-sb-text-subtle font-medium">
                      Reported {phase.dprReported}% · Verified {phase.verified}%
                    </span>
                    {gap > 0 ? (
                      <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded">
                        +{gap} pts gap
                      </span>
                    ) : (
                      <span className="text-[11px] font-medium text-sb-text-subtle bg-slate-50 px-1.5 py-0.5 rounded">
                        No gap
                      </span>
                    )}
                  </div>
                </div>

                {/* Paired Bar SVG */}
                <div className="space-y-1">
                  {/* Reported bar (outline) */}
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full border border-sb-border-strong rounded-full bg-slate-200"
                      style={{ width: `${Math.min(100, phase.dprReported)}%` }}
                    />
                  </div>
                  {/* Verified bar (navy) */}
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-sb-navy rounded-full"
                      style={{ width: `${Math.min(100, phase.verified)}%` }}
                    />
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
            <div className="bg-sb-bg-subtle p-3 rounded-card text-caption">
              <p className="text-sb-ink">
                <span className="font-semibold">{selectedPhase.name}</span> currently has a gap of{' '}
                <span className="font-bold text-amber-700">
                  {selectedPhase.dprReported - selectedPhase.verified} points
                </span>{' '}
                between DPR statements and verified field evidence.
              </p>
            </div>

            <div>
              <h4 className="text-caption font-semibold uppercase text-sb-text-subtle tracking-wide mb-2">
                Reported, Not Yet Verified Evidence
              </h4>

              {(() => {
                const phaseEvents = unverifiedEventsForPhase(selectedPhase.name);
                if (phaseEvents.length === 0) {
                  return (
                    <div className="py-6 text-center text-caption text-sb-text-subtle bg-slate-50 rounded-lg">
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
                        className="p-3 border border-sb-border rounded-lg bg-white hover:border-sb-navy cursor-pointer transition-colors"
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
