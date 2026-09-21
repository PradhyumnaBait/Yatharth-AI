'use client';

import React, { useState } from 'react';
import { Mic, HelpCircle, ArrowRight, SkipForward } from 'lucide-react';
import { ClarificationQuestion } from '@/mocks/extractor';

export interface ClarificationCardProps {
  question: ClarificationQuestion;
  onAnswer: (field: string, answer: string) => void;
  onSkip: () => void;
}

export const ClarificationCard: React.FC<ClarificationCardProps> = ({
  question,
  onAnswer,
  onSkip,
}) => {
  const [customAnswer, setCustomAnswer] = useState('');
  const [isAnsweringVoice, setIsAnsweringVoice] = useState(false);

  const handleVoiceAnswer = () => {
    setIsAnsweringVoice(true);
    // Simulate short speech clarify input
    setTimeout(() => {
      setIsAnsweringVoice(false);
      onAnswer(question.field, question.chips[0]);
    }, 1200);
  };

  return (
    <div
      data-testid="clarification-card"
      className="bg-sb-white rounded-2xl p-5 border border-sb-border shadow-e2 space-y-4 animate-in fade-in slide-in-from-bottom-3"
    >
      <div className="flex items-center gap-2 text-sb-navy">
        <div className="w-8 h-8 rounded-full bg-sb-navy-tint flex items-center justify-center text-sb-navy">
          <HelpCircle className="w-4 h-4" />
        </div>
        <div>
          <div className="text-[11px] uppercase font-semibold text-sb-ink-3 tracking-wider">
            Clarification Needed
          </div>
          <h3 className="text-callout font-bold text-sb-navy" data-testid="clarification-question-text">
            {question.question}
          </h3>
        </div>
      </div>

      {/* Quick-reply chips */}
      <div className="space-y-1.5">
        <div className="text-[11px] text-sb-ink-3">Tap to select:</div>
        <div className="flex flex-wrap gap-2" data-testid="clarification-chips">
          {question.chips.map((chip) => (
            <button
              key={chip}
              type="button"
              data-testid={`clarify-chip-${chip.toLowerCase().replace(/\s+/g, '-')}`}
              onClick={() => onAnswer(question.field, chip)}
              className="px-3.5 py-2 rounded-xl bg-sb-bg border border-sb-border hover:bg-sb-navy-tint hover:border-sb-navy text-caption font-semibold text-sb-navy transition-all active:scale-95 shadow-sm"
            >
              {chip}
            </button>
          ))}
        </div>
      </div>

      {/* Spoken Answer Mic or Manual Input */}
      <div className="flex items-center gap-2 pt-2 border-t border-sb-border/60">
        <input
          type="text"
          value={customAnswer}
          onChange={(e) => setCustomAnswer(e.target.value)}
          placeholder="Or type answer..."
          className="flex-1 h-10 px-3 bg-sb-bg border border-sb-border rounded-xl text-caption text-sb-ink placeholder:text-sb-ink-3 focus:outline-none focus:border-sb-navy"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && customAnswer.trim()) {
              onAnswer(question.field, customAnswer.trim());
            }
          }}
        />

        {customAnswer.trim() ? (
          <button
            type="button"
            data-testid="submit-custom-answer-btn"
            onClick={() => onAnswer(question.field, customAnswer.trim())}
            className="h-10 px-3 rounded-xl bg-sb-navy text-sb-white text-caption font-semibold flex items-center gap-1"
          >
            <span>Set</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        ) : (
          <button
            type="button"
            data-testid="voice-clarify-btn"
            onClick={handleVoiceAnswer}
            disabled={isAnsweringVoice}
            className={`h-10 px-3 rounded-xl border border-sb-navy text-sb-navy text-caption font-semibold flex items-center gap-1.5 transition-colors ${
              isAnsweringVoice ? 'bg-sb-navy text-sb-white animate-pulse' : 'hover:bg-sb-navy-tint'
            }`}
          >
            <Mic className="w-3.5 h-3.5" />
            <span>{isAnsweringVoice ? 'Listening...' : 'Speak'}</span>
          </button>
        )}
      </div>

      {/* Skip */}
      <div className="text-right pt-1">
        <button
          type="button"
          data-testid="clarify-skip-btn"
          onClick={onSkip}
          className="text-[12px] text-sb-ink-3 hover:text-sb-navy flex items-center gap-1 ml-auto font-medium"
        >
          <span>Skip question</span>
          <SkipForward className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
