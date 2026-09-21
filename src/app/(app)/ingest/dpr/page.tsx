'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/shell/PageHeader';
import { Toast } from '@/components/ui/Toast';
import { useEventsStore } from '@/store/events';
import { useAuthStore } from '@/store/auth';
import { matchEventText } from '@/mocks/matcher';
import {
  FileText,
  Upload,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  CheckSquare,
  Square,
  Sparkles,
  ExternalLink,
} from 'lucide-react';

interface ExtractedDprStatement {
  id: string;
  paragraphIndex: number;
  text: string;
  action: string;
  location: string;
  confidence: number;
  needsCheck?: boolean;
}

const SAMPLE_STATEMENTS: ExtractedDprStatement[] = [
  {
    id: 'dpr-stmt-1',
    paragraphIndex: 1,
    text: 'Welding completed on Line 24-XX spools 20 through 22 with 100% NDT clearance.',
    action: 'Welding',
    location: 'Line 24-XX',
    confidence: 95,
  },
  {
    id: 'dpr-stmt-2',
    paragraphIndex: 2,
    text: 'KP 185.3 continuous trenching achieved 180 meters before rain stoppage at 15:00 hrs.',
    action: 'Trenching',
    location: 'KP 185.3',
    confidence: 89,
    needsCheck: true,
  },
  {
    id: 'dpr-stmt-3',
    paragraphIndex: 3,
    text: 'Tie-in joint TI-04 alignment completed and clamped ready for root pass.',
    action: 'Welding',
    location: 'Tie-in TI-04',
    confidence: 84,
  },
  {
    id: 'dpr-stmt-4',
    paragraphIndex: 4,
    text: 'Holiday test inspection performed on coated section KP 183.2 to 183.8.',
    action: 'Coating',
    location: 'KP 183.2',
    confidence: 91,
  },
];

export default function IngestDprPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const addEvent = useEventsStore((s) => s.addEvent);

  const [selectedIds, setSelectedIds] = useState<string[]>([
    'dpr-stmt-1',
    'dpr-stmt-2',
    'dpr-stmt-3',
    'dpr-stmt-4',
  ]);
  const [activeStatementIndex, setActiveStatementIndex] = useState<number>(1);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSendToMatching = () => {
    if (selectedIds.length === 0) return;
    const toSend = SAMPLE_STATEMENTS.filter((s) => selectedIds.includes(s.id));

    toSend.forEach((s) => {
      const match = matchEventText(s.text);
      addEvent({
        source: 'pdf',
        rawText: s.text,
        timestamp: '09:30 AM',
        authorName: 'DPR Extractor Engine',
        status: match.confidence >= 90 ? 'Verified' : 'Review',
        confidence: match.confidence || s.confidence,
        suggestedActivityId: match.activityId || 'PIP-24-017',
        suggestedActivityName: match.activityName || 'Weld Piping System 24-XX',
        extractedInfo: {
          action: s.action,
          location: s.location,
          status: 'Completed',
        },
      });
    });

    setToastMessage(`Sent ${toSend.length} statements to matching.`);
    setTimeout(() => {
      router.push('/workbench');
    }, 1000);
  };

  return (
    <div className="flex flex-col min-h-full bg-sb-bg pb-28" data-testid="dpr-review-screen-pl6">
      {/* 1. Header */}
      <PageHeader
        variant="back"
        title="DPR Review"
        subtitle="Daily Progress Report Extractor"
        rightAction={
          <button
            type="button"
            onClick={() => router.push('/workbench')}
            className="text-caption font-semibold text-sb-navy hover:underline mr-1"
          >
            Workbench
          </button>
        }
      />

      {/* 2. Top Document Excerpt / PDF Preview */}
      <div className="px-4 py-2">
        <div className="bg-sb-white rounded-2xl p-4 border border-sb-border shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-sb-border/60 pb-2">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-sb-navy" />
              <span className="font-mono text-[11px] font-bold text-sb-navy">
                DPR_Package3_20Sep2026.pdf
              </span>
            </div>
            <span className="text-[10px] font-mono text-sb-ink-3 bg-sb-bg px-2 py-0.5 rounded">
              Page 1 of 3
            </span>
          </div>

          {/* Simulated PDF Paragraphs with Highlight */}
          <div className="p-3 bg-sb-bg/60 rounded-xl space-y-2 text-[12px] font-serif leading-relaxed text-sb-ink">
            <p className="text-sb-ink-3">
              [Contractor Daily Progress Log — Sterling Infra EPC — Shift A]
            </p>
            <p
              onClick={() => setActiveStatementIndex(1)}
              className={`p-1.5 rounded transition-colors cursor-pointer ${
                activeStatementIndex === 1
                  ? 'bg-sb-navy-tint border-l-2 border-sb-navy text-sb-navy font-medium'
                  : 'hover:bg-sb-white'
              }`}
            >
              1. Welding completed on Line 24-XX spools 20 through 22 with 100% NDT clearance.
            </p>
            <p
              onClick={() => setActiveStatementIndex(2)}
              className={`p-1.5 rounded transition-colors cursor-pointer ${
                activeStatementIndex === 2
                  ? 'bg-sb-review-tint border-l-2 border-sb-review-ink text-sb-review-ink font-medium'
                  : 'hover:bg-sb-white'
              }`}
            >
              2. KP 185.3 continuous trenching achieved 180 meters before rain stoppage at 15:00 hrs.
            </p>
            <p
              onClick={() => setActiveStatementIndex(3)}
              className={`p-1.5 rounded transition-colors cursor-pointer ${
                activeStatementIndex === 3
                  ? 'bg-sb-navy-tint border-l-2 border-sb-navy text-sb-navy font-medium'
                  : 'hover:bg-sb-white'
              }`}
            >
              3. Tie-in joint TI-04 alignment completed and clamped ready for root pass.
            </p>
          </div>
        </div>
      </div>

      {/* 3. Extracted Statements List */}
      <div className="px-4 space-y-3 pt-1">
        <div className="flex items-center justify-between text-caption font-bold text-sb-navy px-1">
          <span>Extracted Statements ({SAMPLE_STATEMENTS.length})</span>
          <span className="text-[11px] font-normal text-sb-ink-3 font-mono">
            {selectedIds.length} selected
          </span>
        </div>

        <div className="space-y-2.5" data-testid="dpr-statements-container">
          {SAMPLE_STATEMENTS.map((stmt) => {
            const isSelected = selectedIds.includes(stmt.id);

            return (
              <div
                key={stmt.id}
                data-testid={`dpr-statement-${stmt.paragraphIndex}`}
                onClick={() => toggleSelect(stmt.id)}
                className={`p-3.5 rounded-xl border bg-sb-white transition-all cursor-pointer shadow-sm ${
                  isSelected ? 'border-sb-navy bg-sb-navy-tint/10' : 'border-sb-border hover:border-sb-navy/40'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="pt-0.5">
                    {isSelected ? (
                      <CheckSquare className="w-5 h-5 text-sb-navy" />
                    ) : (
                      <Square className="w-5 h-5 text-sb-ink-3" />
                    )}
                  </div>

                  <div className="space-y-1.5 min-w-0 flex-1">
                    <p className="text-caption text-sb-ink font-medium leading-relaxed">
                      &ldquo;{stmt.text}&rdquo;
                    </p>

                    <div className="flex items-center gap-1.5 pt-0.5 flex-wrap">
                      <span className="px-2 py-0.5 bg-sb-bg rounded text-[10px] font-bold text-sb-navy">
                        {stmt.action}
                      </span>
                      <span className="px-2 py-0.5 bg-sb-bg rounded text-[10px] font-mono text-sb-ink-2">
                        {stmt.location}
                      </span>

                      {stmt.needsCheck && (
                        <span className="px-2 py-0.5 bg-sb-review-tint text-sb-review-ink rounded text-[10px] font-bold flex items-center gap-1">
                          <AlertTriangle className="w-2.5 h-2.5" />
                          <span>Check</span>
                        </span>
                      )}

                      <span className="font-mono text-[10px] text-sb-navy font-bold ml-auto">
                        {stmt.confidence}% match
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Action Button */}
        <div className="pt-2">
          <button
            type="button"
            data-testid="send-to-matching-btn"
            disabled={selectedIds.length === 0}
            onClick={handleSendToMatching}
            className={`w-full py-3 rounded-full font-bold text-callout shadow-sm active:scale-95 transition-all flex items-center justify-center gap-2 ${
              selectedIds.length > 0
                ? 'bg-sb-navy text-sb-white hover:bg-sb-navy-pressed'
                : 'bg-sb-border text-sb-ink-3 cursor-not-allowed'
            }`}
          >
            <span>Send {selectedIds.length} Statements to Matching</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

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
