'use client';

import React, { useState } from 'react';
import { useProjectStore } from '@/store/project';
import { TeamDetailSheet } from './TeamDetailSheet';
import { Users, Phone, HardHat, FileCheck, Clock, ChevronRight } from 'lucide-react';
import { CrewTeam } from '@/services/types';

export const ProjectTeamsTab: React.FC = () => {
  const teams = useProjectStore((s) => s.teams);
  const [selectedTeam, setSelectedTeam] = useState<CrewTeam | null>(null);

  return (
    <div className="space-y-3" data-testid="project-teams-tab">
      <div className="flex items-center justify-between px-1">
        <span className="text-callout font-bold text-sb-navy">
          Active Contractor Crews ({teams.length})
        </span>
        <span className="text-caption text-sb-ink-3">Tap for foreman details</span>
      </div>

      <div className="space-y-3" data-testid="teams-list">
        {teams.map((team) => (
          <div
            key={team.id}
            data-testid={`team-card-${team.id}`}
            onClick={() => setSelectedTeam(team)}
            className="bg-sb-white rounded-xl p-4 border border-sb-border shadow-sm hover:border-sb-navy/50 transition-all cursor-pointer space-y-3 group"
          >
            {/* Header: Crew Name & Contractor */}
            <div className="flex items-start justify-between gap-2">
              <div className="space-y-0.5">
                <h3 className="text-callout font-bold text-sb-navy group-hover:text-sb-navy flex items-center gap-1.5">
                  <HardHat className="w-4 h-4 text-sb-ink-2" />
                  <span>{team.name}</span>
                </h3>
                <div className="text-caption text-sb-ink-3">
                  Contractor: <span className="font-medium text-sb-ink-2">{team.contractor}</span>
                </div>
              </div>

              <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-sb-verified-tint text-sb-verified-ink font-semibold">
                {team.verifiedRate}% Verified
              </span>
            </div>

            {/* Foreman info row */}
            <div className="flex items-center justify-between text-caption py-2 px-3 rounded-lg bg-sb-bg/80 border border-sb-border/60">
              <div className="flex items-center gap-2">
                <span className="text-sb-ink-3">Foreman:</span>
                <span className="font-semibold text-sb-navy">{team.foreman}</span>
              </div>
              <div className="flex items-center gap-1 text-[11px] font-mono text-sb-ink-3">
                <Clock className="w-3 h-3" />
                <span>Last: {team.lastReportTime}</span>
              </div>
            </div>

            {/* Metric row: Headcount, Reports Today, Call Action */}
            <div className="flex items-center justify-between pt-1 border-t border-sb-border/60 text-caption">
              <div className="flex items-center gap-4 text-sb-ink-2">
                <div className="flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-sb-ink-3" />
                  <span className="font-mono font-bold text-sb-navy">{team.headcount}</span>
                  <span className="text-sb-ink-3 text-[11px]">workers</span>
                </div>

                <div className="flex items-center gap-1">
                  <FileCheck className="w-3.5 h-3.5 text-sb-ink-3" />
                  <span className="font-mono font-bold text-sb-navy">{team.reportsToday}</span>
                  <span className="text-sb-ink-3 text-[11px]">reports</span>
                </div>
              </div>

              <div className="flex items-center gap-1 text-sb-ink-3 group-hover:text-sb-navy font-medium text-[12px]">
                <span>Contact</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Team Detail Sheet */}
      <TeamDetailSheet
        team={selectedTeam}
        open={Boolean(selectedTeam)}
        onOpenChange={(open) => !open && setSelectedTeam(null)}
      />
    </div>
  );
};
