'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/shell/PageHeader';
import { handleAskQuery, AskResponse } from '@/mocks/askRouter';
import { Search, Bot, ArrowRight, CornerDownLeft, HelpCircle } from 'lucide-react';

const SUGGESTED_QUESTIONS = [
  'Which piping tasks are delayed?',
  'What is driving the delay?',
  'What did trenching achieve this week?',
  'Show out-of-sequence work',
  'What is pending review?',
  'Is welding on the critical path?',
];

export default function AskPage() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [activeResponse, setActiveResponse] = useState<AskResponse | null>(null);
  const [hasQueried, setHasQueried] = useState(false);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;

    const res = handleAskQuery(query);
    setActiveResponse(res);
    setHasQueried(true);
  };

  const handleChipClick = (question: string) => {
    setQuery(question);
    const res = handleAskQuery(question);
    setActiveResponse(res);
    setHasQueried(true);
  };

  return (
    <div className="flex flex-col min-h-full pb-8">
      <PageHeader variant="back" title="Ask SchedBridge" />

      <div className="px-4 py-3 space-y-4">
        {/* Search Query Input */}
        <form onSubmit={handleSubmit} className="relative">
          <div className="relative flex items-center">
            <Search className="w-5 h-5 text-sb-text-subtle absolute left-3.5 pointer-events-none" />
            <input
              type="text"
              data-testid="ask-input"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask about delays, progress, critical path..."
              className="w-full pl-10 pr-12 py-3 bg-white border border-sb-border rounded-xl text-body text-sb-ink placeholder:text-sb-text-muted focus:outline-none focus:border-sb-navy shadow-sm transition-colors"
            />
            {query.trim() && (
              <button
                type="submit"
                data-testid="ask-submit"
                className="absolute right-2 p-2 bg-sb-navy text-white rounded-lg hover:bg-slate-800 transition-colors"
              >
                <CornerDownLeft className="w-4 h-4" />
              </button>
            )}
          </div>
        </form>

        {/* Suggested Question Chips */}
        <div>
          <span className="text-[11px] uppercase font-semibold text-sb-text-subtle tracking-wider block mb-2">
            Suggested Queries
          </span>
          <div className="flex flex-wrap gap-1.5">
            {SUGGESTED_QUESTIONS.map((q) => (
              <button
                key={q}
                type="button"
                data-testid={`suggested-chip-${q.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
                onClick={() => handleChipClick(q)}
                className={`text-caption px-3 py-1.5 rounded-full border transition-all text-left ${
                  query === q
                    ? 'bg-sb-navy text-white border-sb-navy'
                    : 'bg-white text-sb-ink border-sb-border hover:border-sb-border-strong hover:bg-sb-bg-subtle'
                }`}
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        {/* Answer Card */}
        {hasQueried && activeResponse && (
          <div
            data-testid="ask-answer-card"
            className="bg-white rounded-card border border-sb-border p-4 shadow-e2 space-y-4 animate-in fade-in duration-200"
          >
            {/* Answer Text */}
            <div className="flex items-start gap-3">
              <span className="p-2 bg-sb-bg-subtle rounded-lg text-sb-navy flex-shrink-0 mt-0.5">
                <Bot className="w-4 h-4" />
              </span>
              <div>
                <h4 className="text-body font-semibold text-sb-ink leading-relaxed">
                  {activeResponse.answer}
                </h4>
              </div>
            </div>

            {/* Compact Summary Table if present */}
            {activeResponse.summaryTable && (
              <div className="border border-sb-border rounded-lg overflow-hidden text-caption">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-sb-bg-subtle border-b border-sb-border text-sb-text-subtle font-semibold">
                      {activeResponse.summaryTable.headers.map((h, i) => (
                        <th key={i} className="py-2 px-3">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-sb-border-subtle bg-white">
                    {activeResponse.summaryTable.rows.map((row, rIdx) => (
                      <tr key={rIdx} className="hover:bg-sb-bg transition-colors">
                        {row.map((cell, cIdx) => (
                          <td
                            key={cIdx}
                            className={`py-2 px-3 ${
                              cIdx === 0 ? 'font-mono font-medium text-sb-navy' : 'text-sb-ink'
                            }`}
                          >
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Source Line and Action Button */}
            <div className="flex items-center justify-between pt-2 border-t border-sb-border-subtle text-caption">
              <span className="text-mono-s text-sb-text-muted">
                {activeResponse.sourceLine}
              </span>

              {activeResponse.actionButton && (
                <button
                  type="button"
                  data-testid="ask-action-button"
                  onClick={() => router.push(activeResponse.actionButton!.href)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-caption font-semibold bg-sb-navy text-white rounded-lg hover:bg-slate-800 transition-colors"
                >
                  {activeResponse.actionButton.label}
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Empty State before any queries */}
        {!hasQueried && (
          <div className="p-8 text-center bg-white rounded-card border border-sb-border text-caption text-sb-text-subtle space-y-2">
            <HelpCircle className="w-8 h-8 text-sb-border-strong mx-auto" />
            <p className="font-medium text-sb-ink">Have a question about schedule execution?</p>
            <p>Select any suggested query above or type a keyword to inspect delays, progress, and review queue metrics.</p>
          </div>
        )}
      </div>
    </div>
  );
}
