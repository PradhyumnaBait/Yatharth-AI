'use client';

import React, { useState } from 'react';
import { PageHeader } from '@/components/shell/PageHeader';
import {
  HelpCircle,
  BookOpen,
  Keyboard,
  ShieldCheck,
  Cpu,
  Mic,
  FileCheck,
  Layers,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  MessageSquare,
} from 'lucide-react';

interface FaqItem {
  question: string;
  answer: string;
  category: string;
}

const FAQS: FaqItem[] = [
  {
    category: 'Capture & Voice',
    question: 'How does voice reporting work on the field?',
    answer:
      'Field supervisors can tap the microphone button on the capture screen and speak naturally in Hindi, English, Marathi, or Gujarati. SchedBridge extracts key details (action, object, location, quantity, status) and maps them directly to corresponding P6 activities.',
  },
  {
    category: 'AI Matching',
    question: 'What do the 3 AI match confidence tiers mean?',
    answer:
      'Events with ≥95% confidence are eligible for auto-acceptance. Events between 60% and 94% enter the Planner Review queue. Events below 60% or missing schedule alignment are tagged as Unmatched for manual resolution.',
  },
  {
    category: 'P6 Governance',
    question: 'How are Primavera P6 schedule updates governed?',
    answer:
      'All schedule updates use Retained Logic. Progress is measured strictly via Physical % complete. Critical milestones and Actual Finish events are never auto-accepted and require human planner sign-off.',
  },
  {
    category: 'Offline Capability',
    question: 'Can supervisors capture progress without network connectivity?',
    answer:
      'Yes. When working in remote or dead zones, audio recordings and photo evidence are securely cached in local device storage. Once connectivity is restored, the queue syncs automatically with the central project repository.',
  },
];

const SHORTCUTS = [
  { key: 'A', action: 'Approve current match (Planner Workbench)' },
  { key: 'C', action: 'Open clarification thread with supervisor' },
  { key: 'U', action: 'Undo last approval (within 8-second window)' },
  { key: 'J / K', action: 'Navigate to Next / Previous event card' },
  { key: 'Space', action: 'Play / Pause voice evidence audio' },
];

export default function HelpPage() {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenFaqIndex((prev) => (prev === index ? null : index));
  };

  return (
    <div className="flex flex-col min-h-full bg-sb-bg pb-12" data-testid="help-screen">
      <PageHeader
        variant="back"
        title="Help & User Guide"
        subtitle="SIH 26122 · Operational documentation & shortcuts"
      />

      <div className="p-4 space-y-4 max-w-3xl mx-auto w-full">
        {/* Quick Overview Hero */}
        <div className="bg-sb-white rounded-2xl p-5 border border-sb-border shadow-e1 space-y-3">
          <div className="flex items-center gap-2 text-sb-navy">
            <BookOpen className="w-5 h-5 text-sb-navy" />
            <h2 className="text-callout font-bold text-sb-navy">SchedBridge AI Overview</h2>
          </div>
          <p className="text-caption text-sb-ink-2 leading-relaxed">
            SchedBridge AI bridges field operations and Primavera P6 enterprise schedules. Field supervisors record natural speech and photo evidence; AI transcribes, extracts engineering entities, checks precedence logic, and matches progress directly to activities.
          </p>
          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-sb-border/60 text-center">
            <div className="p-2.5 rounded-xl bg-sb-bg border border-sb-border space-y-0.5">
              <Mic className="w-4 h-4 text-sb-navy mx-auto" />
              <div className="text-[11px] font-bold text-sb-navy">Voice Capture</div>
              <div className="text-[10px] text-sb-ink-3">Multilingual DPR</div>
            </div>
            <div className="p-2.5 rounded-xl bg-sb-bg border border-sb-border space-y-0.5">
              <Cpu className="w-4 h-4 text-sb-navy mx-auto" />
              <div className="text-[11px] font-bold text-sb-navy">AI Matching</div>
              <div className="text-[10px] text-sb-ink-3">P6 WBS & Codes</div>
            </div>
            <div className="p-2.5 rounded-xl bg-sb-bg border border-sb-border space-y-0.5">
              <ShieldCheck className="w-4 h-4 text-sb-verified-ink mx-auto" />
              <div className="text-[11px] font-bold text-sb-verified-ink">Audit Chain</div>
              <div className="text-[10px] text-sb-ink-3">Full Provenance</div>
            </div>
          </div>
        </div>

        {/* Keyboard Shortcuts Reference */}
        <div className="bg-sb-white rounded-2xl p-5 border border-sb-border shadow-e1 space-y-3">
          <div className="flex items-center gap-2 text-sb-navy">
            <Keyboard className="w-5 h-5 text-sb-navy" />
            <h2 className="text-callout font-bold text-sb-navy">Planner Keyboard Shortcuts</h2>
          </div>
          <p className="text-[12px] text-sb-ink-3">
            Accelerate event triage and verification workflow in the Planner Workbench:
          </p>
          <div className="divide-y divide-sb-border/60 bg-sb-bg rounded-xl border border-sb-border overflow-hidden">
            {SHORTCUTS.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 text-caption">
                <span className="text-sb-ink-2 font-medium">{item.action}</span>
                <kbd className="px-2.5 py-1 bg-sb-white rounded-md border border-sb-border font-mono font-bold text-sb-navy text-[12px] shadow-sm">
                  {item.key}
                </kbd>
              </div>
            ))}
          </div>
        </div>

        {/* Frequently Asked Questions */}
        <div className="bg-sb-white rounded-2xl p-5 border border-sb-border shadow-e1 space-y-3">
          <div className="flex items-center gap-2 text-sb-navy">
            <HelpCircle className="w-5 h-5 text-sb-navy" />
            <h2 className="text-callout font-bold text-sb-navy">Frequently Asked Questions</h2>
          </div>
          <div className="space-y-2">
            {FAQS.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div
                  key={idx}
                  className="rounded-xl border border-sb-border bg-sb-bg overflow-hidden transition-all"
                >
                  <button
                    type="button"
                    onClick={() => toggleFaq(idx)}
                    className="w-full p-3.5 flex items-center justify-between text-left gap-3 hover:bg-sb-border/20 transition-colors"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="text-[10px] font-mono uppercase font-bold text-sb-navy tracking-wider">
                        {faq.category}
                      </div>
                      <div className="text-caption font-bold text-sb-ink mt-0.5">
                        {faq.question}
                      </div>
                    </div>
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4 text-sb-navy shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-sb-ink-3 shrink-0" />
                    )}
                  </button>
                  {isOpen && (
                    <div className="p-3.5 pt-0 text-[13px] text-sb-ink-2 leading-relaxed border-t border-sb-border/40 bg-sb-white">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* SIH 26122 Spec Compliance Footer */}
        <div className="p-4 bg-sb-navy/5 rounded-2xl border border-sb-navy/20 flex items-center justify-between text-caption text-sb-navy">
          <div className="space-y-0.5">
            <div className="font-bold">Smart India Hackathon 2024 · PS 26122</div>
            <div className="text-[11px] text-sb-ink-3">Oil India Limited · Construction Progress Tracking</div>
          </div>
          <span className="font-mono text-[11px] px-2.5 py-1 bg-sb-white rounded-lg border border-sb-border font-bold">
            v0.1.0-RC
          </span>
        </div>
      </div>
    </div>
  );
}
