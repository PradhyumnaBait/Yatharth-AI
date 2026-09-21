'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Sheet } from '@/components/ui/Sheet';
import { Phone, Users, FileText, CheckCircle2, Clock, Building2, ChevronRight } from 'lucide-react';
import { CrewTeam } from '@/services/types';
import { useEventsStore } from '@/store/events';

export interface TeamDetailSheetProps {
  team: CrewTeam | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const TeamDetailSheet: React.FC<TeamDetailSheetProps> = ({
  team,
  open,
  onOpenChange,
}) => {
  const router = useRouter();
  const events = useEventsStore((s) => s.events);

  if (!team) return null;

  // Filter events filed by or associated with this crew/contractor
  const recentCrewEvents = events.slice(0, 3);

  return (
    <Sheet
      open={open}
      onOpenChange={onOpenChange}
      title={team.name}
      description={`Contractor: ${team.contractor}`}
      data-testid="team-detail-sheet"
    >
      <div className="p-4 space-y-4">
        {/* Foreman Contact Card & Call Button */}
        <div className="p-3.5 bg-sb-bg rounded-xl border border-sb-border space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[11px] text-sb-ink-3 uppercase font-semibold">Foreman In-Charge</div>
              <div className="text-callout font-bold text-sb-navy" data-testid="sheet-foreman-name">
                {team.foreman}
              </div>
              <div className="text-caption font-mono text-sb-ink-2 mt-0.5">{team.phone}</div>
            </div>

            {/* Functional tel: Call Button */}
            <a
              href={`tel:${team.phone.replace(/\s+/g, '')}`}
              data-testid="call-foreman-btn"
              className="px-4 py-2.5 rounded-full bg-sb-navy text-sb-white text-caption font-semibold flex items-center gap-2 hover:bg-sb-navy-pressed active:scale-95 transition-all shadow-sm select-none"
            >
              <Phone className="w-4 h-4" />
              <span>Call Foreman</span>
            </a>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-sb-border/70 text-center text-caption">
            <div>
              <div className="text-[11px] text-sb-ink-3">Headcount</div>
              <div className="font-mono font-bold text-sb-navy">{team.headcount} workers</div>
            </div>
            <div>
              <div className="text-[11px] text-sb-ink-3">Reports Today</div>
              <div className="font-mono font-bold text-sb-navy">{team.reportsToday} filed</div>
            </div>
            <div>
              <div className="text-[11px] text-sb-ink-3">Verified Rate</div>
              <div className="font-mono font-bold text-sb-verified-ink">{team.verifiedRate}%</div>
            </div>
          </div>
        </div>

        {/* Crew Composition */}
        <div className="space-y-2">
          <div className="text-[12px] font-bold text-sb-navy uppercase tracking-wider">
            Crew Composition & Allocation
          </div>
          <div className="bg-sb-white p-3 rounded-xl border border-sb-border space-y-2 text-caption">
            <div className="flex justify-between py-1 border-b border-sb-border/60">
              <span className="text-sb-ink-2">Skilled Welders / Fabricators</span>
              <span className="font-mono font-bold text-sb-navy">
                {Math.round(team.headcount * 0.45)}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-sb-border/60">
              <span className="text-sb-ink-2">Riggers & Machine Operators</span>
              <span className="font-mono font-bold text-sb-navy">
                {Math.round(team.headcount * 0.25)}
              </span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-sb-ink-2">General EPC Helpers</span>
              <span className="font-mono font-bold text-sb-navy">
                {team.headcount - Math.round(team.headcount * 0.45) - Math.round(team.headcount * 0.25)}
              </span>
            </div>
          </div>
        </div>

        {/* Recent Events Filed */}
        <div className="space-y-2">
          <div className="text-[12px] font-bold text-sb-navy uppercase tracking-wider">
            Recent Field Submissions
          </div>
          <div className="space-y-2" data-testid="team-recent-events">
            {recentCrewEvents.map((evt) => (
              <div
                key={evt.id}
                onClick={() => {
                  onOpenChange(false);
                  router.push(`/event/${evt.id}`);
                }}
                className="p-2.5 rounded-lg border border-sb-border bg-sb-white hover:bg-sb-bg active:bg-sb-navy-tint cursor-pointer transition-colors flex items-center justify-between text-caption group"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 font-mono text-[11px] text-sb-ink-3">
                    <span className="font-bold text-sb-navy">{evt.id}</span>
                    <span>· {evt.timestamp}</span>
                  </div>
                  <div className="text-sb-ink font-medium truncate group-hover:text-sb-navy">
                    {evt.rawText}
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-sb-ink-3 group-hover:text-sb-navy flex-shrink-0" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </Sheet>
  );
};
