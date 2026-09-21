'use client';

import React, { useState, useMemo, useRef, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { PageHeader } from '@/components/shell/PageHeader';
import { StatusPill } from '@/components/ui/StatusPill';
import { Sheet } from '@/components/ui/Sheet';
import { useActivitiesStore } from '@/store/activities';
import { useEventsStore } from '@/store/events';
import { useAuthStore } from '@/store/auth';
import {
  Search as SearchIcon,
  X,
  Filter,
  Mic,
  ChevronRight,
  Clock,
  HelpCircle,
  FileText,
} from 'lucide-react';
import { Activity, FieldEvent } from '@/services/types';

const SUGGESTIONS = ['Hydrotest', 'Spool 17', 'KP 184', 'Crane'];

// Construction dictionary synonyms
const DICTIONARY_MAP: Record<string, string[]> = {
  hydro: ['hydrotest', 'pressure test', 'pip-24-024'],
  hydrotest: ['pip-24-024', 'pressure test'],
  spool: ['weld', 'piping', 'pip-24-017'],
  welding: ['spool', 'piping', 'joint'],
  crane: ['equipment', 'lowering', 'delay'],
  trench: ['excavate', 'civ-12-003', 'kp 184'],
  trenching: ['excavate', 'civ-12-003', 'kp 184'],
};

function SearchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuthStore();
  const isSupervisor = user?.role === 'supervisor';

  const activities = useActivitiesStore((s) => s.activities);
  const events = useEventsStore((s) => s.events);

  const [query, setQuery] = useState('');
  const [scope, setScope] = useState<'activities' | 'events'>('activities');
  const [recentSearches, setRecentSearches] = useState<string[]>(['Spool 18', 'Line 24-XX', 'KP 184.2']);
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);
  const [selectedDiscipline, setSelectedDiscipline] = useState('All');

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSelectSuggestion = (s: string) => {
    setQuery(s);
    if (!recentSearches.includes(s)) {
      setRecentSearches([s, ...recentSearches.slice(0, 4)]);
    }
  };

  // Dictionary-expanded search
  const expandedTerms = useMemo(() => {
    const qLower = query.toLowerCase().trim();
    if (!qLower) return [];
    const terms = [qLower];
    Object.entries(DICTIONARY_MAP).forEach(([key, syns]) => {
      if (qLower.includes(key)) {
        terms.push(...syns);
      }
    });
    return Array.from(new Set(terms));
  }, [query]);

  // Filtered Activities
  const activityResults = useMemo(() => {
    if (!query.trim()) return [];
    return activities.filter((act) => {
      if (selectedDiscipline !== 'All' && !act.phaseName?.toLowerCase().includes(selectedDiscipline.toLowerCase())) {
        return false;
      }
      return expandedTerms.some(
        (term) =>
          act.id.toLowerCase().includes(term) ||
          act.name.toLowerCase().includes(term) ||
          act.phaseName?.toLowerCase().includes(term)
      );
    });
  }, [activities, query, expandedTerms, selectedDiscipline]);

  // Filtered Events
  const eventResults = useMemo(() => {
    if (!query.trim()) return [];
    return events.filter((e) => {
      return expandedTerms.some(
        (term) =>
          e.id.toLowerCase().includes(term) ||
          e.rawText.toLowerCase().includes(term) ||
          e.suggestedActivityId?.toLowerCase().includes(term) ||
          e.authorName?.toLowerCase().includes(term)
      );
    });
  }, [events, query, expandedTerms]);

  return (
    <div className="flex flex-col min-h-full bg-sb-bg pb-28" data-testid="search-screen-s2">
      {/* 1. Header with Search Input */}
      <PageHeader
        variant="back"
        title="Search"
        rightAction={
          <button
            type="button"
            data-testid="search-filter-btn"
            onClick={() => setFilterSheetOpen(true)}
            aria-label="Filter search results"
            className="w-9 h-9 rounded-full flex items-center justify-center text-sb-ink hover:bg-sb-navy-tint transition-colors"
          >
            <Filter className="w-4 h-4" />
          </button>
        }
      />

      {/* 2. Search Input Box */}
      <div className="px-4 pt-1">
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            data-testid="search-main-input"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search activities, line numbers, KP..."
            className="w-full h-12 pl-10 pr-10 rounded-full bg-sb-white border border-sb-border text-callout font-medium text-sb-ink shadow-sm placeholder:text-sb-ink-3 focus:outline-none focus:border-sb-navy"
          />
          <SearchIcon className="w-4 h-4 text-sb-ink-3 absolute left-3.5 top-4 pointer-events-none" />
          {query && (
            <button
              type="button"
              data-testid="clear-search-btn"
              onClick={() => setQuery('')}
              className="absolute right-3 top-3.5 p-0.5 text-sb-ink-3 hover:text-sb-ink"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* 3. Segmented Control: Activities · Events */}
      <div className="px-4 pt-3 flex items-center justify-between gap-3">
        <div className="flex items-center bg-sb-white border border-sb-border rounded-xl p-1 shadow-sm">
          <button
            type="button"
            data-testid="search-segment-activities"
            onClick={() => setScope('activities')}
            className={`px-3 py-1 rounded-lg text-caption font-semibold transition-colors ${
              scope === 'activities' ? 'bg-sb-navy text-sb-white' : 'text-sb-ink-3 hover:text-sb-ink'
            }`}
          >
            Activities ({query ? activityResults.length : activities.length})
          </button>
          <button
            type="button"
            data-testid="search-segment-events"
            onClick={() => setScope('events')}
            className={`px-3 py-1 rounded-lg text-caption font-semibold transition-colors ${
              scope === 'events' ? 'bg-sb-navy text-sb-white' : 'text-sb-ink-3 hover:text-sb-ink'
            }`}
          >
            Events ({query ? eventResults.length : events.length})
          </button>
        </div>
      </div>

      {/* 4. Body Content */}
      <div className="p-4 space-y-4">
        {!query.trim() ? (
          /* Empty / Suggestions State */
          <div className="space-y-4" data-testid="search-suggestions-container">
            {/* Suggested Chips */}
            <div className="space-y-2">
              <div className="text-caption font-bold text-sb-navy">Suggested Searches</div>
              <div className="flex flex-wrap gap-2">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    data-testid={`search-suggestion-${s.toLowerCase().replace(/\s+/g, '-')}`}
                    onClick={() => handleSelectSuggestion(s)}
                    className="px-3.5 py-1.5 rounded-full bg-sb-white border border-sb-border text-caption font-semibold text-sb-navy hover:bg-sb-navy-tint/30 transition-colors shadow-sm"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Recent Searches */}
            {recentSearches.length > 0 && (
              <div className="space-y-2 pt-2">
                <div className="text-caption font-bold text-sb-navy">Recent Searches</div>
                <div className="bg-sb-white rounded-2xl border border-sb-border divide-y divide-sb-border/60 shadow-sm">
                  {recentSearches.map((rec) => (
                    <div
                      key={rec}
                      onClick={() => handleSelectSuggestion(rec)}
                      className="p-3 px-3.5 flex items-center justify-between text-caption text-sb-ink font-medium hover:bg-sb-bg cursor-pointer transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-sb-ink-3" />
                        <span>{rec}</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-sb-ink-3" />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Search Results */
          <div className="space-y-2.5" data-testid="search-results-list">
            {scope === 'activities' ? (
              activityResults.length === 0 ? (
                <div className="p-8 bg-sb-white rounded-2xl border border-sb-border text-center space-y-2">
                  <HelpCircle className="w-8 h-8 text-sb-ink-3 mx-auto" />
                  <div className="text-callout font-bold text-sb-navy">
                    No activity matches &lsquo;{query}&rsquo;
                  </div>
                  <div className="text-caption text-sb-ink-3">
                    Try searching a line number or activity ID like &lsquo;PIP-24-017&rsquo;.
                  </div>
                </div>
              ) : (
                activityResults.map((act) => (
                  <div
                    key={act.id}
                    data-testid={`search-result-activity-${act.id}`}
                    className="bg-sb-white rounded-xl p-3.5 border border-sb-border shadow-sm hover:border-sb-navy/50 transition-all flex items-center justify-between gap-3"
                  >
                    <div
                      onClick={() => router.push(`/activity/${act.id}`)}
                      className="space-y-1 min-w-0 flex-1 cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[11px] font-bold text-sb-navy">{act.id}</span>
                        <StatusPill status={act.status === 'Complete' ? 'Verified' : act.status === 'In progress' ? 'Review' : 'Delay'} />
                      </div>
                      <div className="text-caption text-sb-ink font-bold truncate">{act.name}</div>
                      <div className="text-[11px] text-sb-ink-3 truncate">{act.phaseName}</div>
                      <div className="flex items-center gap-2 pt-0.5">
                        <div className="w-20 h-1.5 bg-sb-bg rounded-full overflow-hidden border border-sb-border/60">
                          <div
                            className="h-full bg-sb-navy rounded-full"
                            style={{ width: `${act.physicalPercent}%` }}
                          />
                        </div>
                        <span className="font-mono text-[10px] text-sb-navy font-bold">
                          {act.physicalPercent}%
                        </span>
                      </div>
                    </div>

                    {isSupervisor && (
                      <button
                        type="button"
                        data-testid={`search-report-btn-${act.id}`}
                        onClick={() => router.push(`/capture?activity=${act.id}`)}
                        className="px-3 py-1.5 bg-sb-navy text-sb-white rounded-full text-caption font-semibold flex items-center gap-1 shrink-0 active:scale-95 transition-all shadow-sm"
                      >
                        <Mic className="w-3.5 h-3.5" />
                        <span>Report</span>
                      </button>
                    )}
                  </div>
                ))
              )
            ) : (
              /* Events Scope */
              eventResults.length === 0 ? (
                <div className="p-8 bg-sb-white rounded-2xl border border-sb-border text-center space-y-2">
                  <HelpCircle className="w-8 h-8 text-sb-ink-3 mx-auto" />
                  <div className="text-callout font-bold text-sb-navy">
                    No field events match &lsquo;{query}&rsquo;
                  </div>
                </div>
              ) : (
                eventResults.map((evt) => (
                  <div
                    key={evt.id}
                    data-testid={`search-result-event-${evt.id}`}
                    onClick={() => router.push(`/event/${evt.id}`)}
                    className="bg-sb-white rounded-xl p-3.5 border border-sb-border shadow-sm hover:border-sb-navy/50 cursor-pointer transition-all flex items-start justify-between gap-3"
                  >
                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex items-center gap-2 font-mono text-[11px]">
                        <span className="font-bold text-sb-navy">{evt.id}</span>
                        <span className="text-sb-ink-3">· {evt.timestamp}</span>
                        <StatusPill status={evt.status} />
                      </div>
                      <div className="text-caption text-sb-ink font-medium line-clamp-2">
                        &ldquo;{evt.rawText}&rdquo;
                      </div>
                      <div className="text-[11px] text-sb-ink-3">
                        {evt.authorName} · {evt.suggestedActivityId}
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-sb-ink-3 mt-2 shrink-0" />
                  </div>
                ))
              )
            )}
          </div>
        )}
      </div>

      {/* Filter Sheet */}
      <Sheet
        open={filterSheetOpen}
        onOpenChange={setFilterSheetOpen}
        title="Filter Search Results"
        data-testid="search-filter-sheet"
      >
        <div className="p-4 space-y-3">
          <div className="text-caption font-bold text-sb-navy">Discipline / Phase</div>
          <div className="flex flex-wrap gap-2">
            {['All', 'Piping', 'Civil', 'Equipment', 'Instrumentation'].map((disc) => (
              <button
                key={disc}
                type="button"
                onClick={() => {
                  setSelectedDiscipline(disc);
                  setFilterSheetOpen(false);
                }}
                className={`px-3 py-1.5 rounded-full text-caption font-semibold transition-colors ${
                  selectedDiscipline === disc
                    ? 'bg-sb-navy text-sb-white'
                    : 'bg-sb-white border border-sb-border text-sb-ink-2 hover:bg-sb-bg'
                }`}
              >
                {disc}
              </button>
            ))}
          </div>
        </div>
      </Sheet>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-sb-bg" />}>
      <SearchContent />
    </Suspense>
  );
}
