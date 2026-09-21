'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useEventsStore } from '@/store/events';
import { StatusPill } from '@/components/ui/StatusPill';
import {
  Mic,
  Camera,
  FileSpreadsheet,
  FileText,
  LayoutList,
  LayoutGrid,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { FieldEvent } from '@/services/types';

export const ProjectEvidenceTab: React.FC = () => {
  const router = useRouter();
  const events = useEventsStore((s) => s.events);

  const [sourceFilter, setSourceFilter] = useState<'All' | 'Voice' | 'Photos' | 'DPR' | 'Excel'>('All');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

  const filteredEvents = useMemo(() => {
    return events.filter((e) => {
      if (sourceFilter === 'All') return true;
      if (sourceFilter === 'Voice') return e.source === 'voice';
      if (sourceFilter === 'Photos') return Boolean(e.thumbnailUrl);
      if (sourceFilter === 'DPR') return e.source === 'pdf';
      if (sourceFilter === 'Excel') return e.source === 'excel';
      return true;
    });
  }, [events, sourceFilter]);

  const getSourceIcon = (event: FieldEvent) => {
    if (event.thumbnailUrl) return <Camera className="w-3.5 h-3.5" />;
    if (event.source === 'voice') return <Mic className="w-3.5 h-3.5" />;
    if (event.source === 'excel') return <FileSpreadsheet className="w-3.5 h-3.5" />;
    return <FileText className="w-3.5 h-3.5" />;
  };

  return (
    <div className="space-y-3.5" data-testid="project-evidence-tab">
      {/* Controls Bar: Filter chips + Grid/List toggle */}
      <div className="flex items-center justify-between gap-2 overflow-x-auto scrollbar-none pb-1">
        <div className="flex items-center gap-1.5 min-w-max">
          {(['All', 'Voice', 'Photos', 'DPR', 'Excel'] as const).map((filter) => (
            <button
              key={filter}
              type="button"
              data-testid={`evidence-filter-${filter.toLowerCase()}`}
              onClick={() => setSourceFilter(filter)}
              className={`px-3 py-1 rounded-full text-caption font-medium transition-colors ${
                sourceFilter === filter
                  ? 'bg-sb-navy text-sb-white font-semibold'
                  : 'bg-sb-white border border-sb-border text-sb-ink-2 hover:bg-sb-bg'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        <div className="flex items-center bg-sb-white rounded-lg border border-sb-border p-0.5 flex-shrink-0">
          <button
            type="button"
            data-testid="evidence-view-list"
            onClick={() => setViewMode('list')}
            aria-label="List view"
            className={`p-1.5 rounded ${viewMode === 'list' ? 'bg-sb-navy-tint text-sb-navy' : 'text-sb-ink-3'}`}
          >
            <LayoutList className="w-4 h-4" />
          </button>
          <button
            type="button"
            data-testid="evidence-view-grid"
            onClick={() => setViewMode('grid')}
            aria-label="Grid view"
            className={`p-1.5 rounded ${viewMode === 'grid' ? 'bg-sb-navy-tint text-sb-navy' : 'text-sb-ink-3'}`}
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="text-[12px] text-sb-ink-3 px-1 flex justify-between">
        <span>{filteredEvents.length} evidence records</span>
        <span>Tap item to view in S5</span>
      </div>

      {/* Grid or List Render */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-2 gap-3" data-testid="evidence-grid">
          {filteredEvents.map((event) => (
            <div
              key={event.id}
              data-testid={`evidence-card-${event.id}`}
              onClick={() => router.push(`/event/${event.id}`)}
              className="bg-sb-white rounded-xl border border-sb-border overflow-hidden shadow-sm hover:border-sb-navy/50 transition-all cursor-pointer flex flex-col group"
            >
              <div className="relative h-28 bg-sb-navy flex items-center justify-center overflow-hidden">
                {event.thumbnailUrl ? (
                  <Image
                    src={event.thumbnailUrl}
                    alt={event.id}
                    fill
                    sizes="(max-width: 450px) 50vw, 200px"
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="text-sb-white/70 flex flex-col items-center gap-1">
                    {getSourceIcon(event)}
                    <span className="text-[10px] font-mono uppercase">{event.source}</span>
                  </div>
                )}
                <div className="absolute top-2 right-2">
                  <StatusPill status={event.status} />
                </div>
              </div>

              <div className="p-2.5 flex-1 flex flex-col justify-between space-y-1.5">
                <div>
                  <div className="flex justify-between items-center text-[10px] font-mono text-sb-ink-3">
                    <span>{event.id}</span>
                    <span>{event.timestamp}</span>
                  </div>
                  <div className="text-caption font-semibold text-sb-navy truncate mt-0.5">
                    {event.suggestedActivityName || event.rawText}
                  </div>
                </div>

                {event.suggestedActivityId && (
                  <div className="text-[10px] font-mono font-bold text-sb-navy truncate">
                    {event.suggestedActivityId}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-2.5" data-testid="evidence-list">
          {filteredEvents.map((event) => (
            <div
              key={event.id}
              data-testid={`evidence-row-${event.id}`}
              onClick={() => router.push(`/event/${event.id}`)}
              className="bg-sb-white rounded-xl p-3.5 border border-sb-border shadow-sm hover:border-sb-navy/50 transition-all cursor-pointer flex items-start gap-3 group"
            >
              {/* Thumbnail or Source Icon Block */}
              <div className="relative w-12 h-12 rounded-lg bg-sb-navy-tint flex-shrink-0 flex items-center justify-center overflow-hidden border border-sb-border/60">
                {event.thumbnailUrl ? (
                  <Image
                    src={event.thumbnailUrl}
                    alt={event.id}
                    fill
                    sizes="48px"
                    className="object-cover"
                  />
                ) : (
                  <div className="text-sb-navy">
                    {getSourceIcon(event)}
                  </div>
                )}
              </div>

              {/* Main Content */}
              <div className="min-w-0 flex-1 space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="font-mono text-[11px] font-bold text-sb-navy">{event.id}</span>
                    <span className="text-[10px] text-sb-ink-3 font-mono">· {event.timestamp}</span>
                  </div>
                  <StatusPill status={event.status} />
                </div>

                <div className="text-caption text-sb-ink font-medium line-clamp-1 group-hover:text-sb-navy">
                  &ldquo;{event.rawText}&rdquo;
                </div>

                {/* Chips Row: Extracted facts + Linked Activity */}
                <div className="flex flex-wrap items-center gap-1 pt-0.5">
                  {event.suggestedActivityId && (
                    <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-sb-navy text-sb-white">
                      {event.suggestedActivityId}
                    </span>
                  )}
                  {event.extractedInfo.action && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-sb-bg text-sb-ink-2 border border-sb-border/60">
                      {event.extractedInfo.action}
                    </span>
                  )}
                  {event.extractedInfo.object && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-sb-bg text-sb-ink-2 border border-sb-border/60">
                      {event.extractedInfo.object}
                    </span>
                  )}
                  <span className="text-[10px] text-sb-ink-3 ml-auto font-medium">
                    {event.authorName}
                  </span>
                </div>
              </div>

              <ChevronRight className="w-4 h-4 text-sb-ink-3 group-hover:text-sb-navy mt-4 flex-shrink-0" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
