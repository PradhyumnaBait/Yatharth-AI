'use client';

import React from 'react';
import { Check } from 'lucide-react';

export type ChainStep = 'Voice' | 'Event' | 'Match' | 'Approval';

export interface EvidenceChainProps {
  currentStep: number; // 1 to 4 (1 = Voice, 2 = Event, 3 = Match, 4 = Approval)
  onStepClick?: (step: ChainStep, index: number) => void;
  className?: string;
  'data-testid'?: string;
}

export const EvidenceChain: React.FC<EvidenceChainProps> = ({
  currentStep = 3,
  onStepClick,
  className = '',
  'data-testid': testId = 'evidence-chain',
}) => {
  const steps: ChainStep[] = ['Voice', 'Event', 'Match', 'Approval'];

  return (
    <div
      data-testid={testId}
      className={`flex items-center justify-between w-full py-2 ${className}`}
    >
      {steps.map((step, idx) => {
        const stepNum = idx + 1;
        const isComplete = stepNum < currentStep;
        const isCurrent = stepNum === currentStep;
        const isLast = idx === steps.length - 1;

        return (
          <React.Fragment key={step}>
            <div
              onClick={() => onStepClick?.(step, idx)}
              className={`flex items-center gap-1.5 cursor-pointer ${
                isComplete || isCurrent ? 'text-sb-navy' : 'text-sb-ink-3'
              }`}
              data-testid={`${testId}-step-${idx}`}
            >
              <div
                className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold border transition-colors ${
                  isComplete
                    ? 'bg-sb-navy text-sb-white border-sb-navy'
                    : isCurrent
                    ? 'bg-sb-white text-sb-navy border-sb-navy ring-2 ring-sb-navy/20'
                    : 'bg-sb-white text-sb-ink-3 border-sb-border'
                }`}
              >
                {isComplete ? <Check className="w-3 h-3" strokeWidth={2.5} /> : stepNum}
              </div>
              <span className={`text-caption ${isCurrent ? 'font-bold' : isComplete ? 'font-semibold' : 'font-normal'}`}>
                {step}
              </span>
            </div>

            {!isLast && (
              <div
                className={`flex-1 mx-2 h-0.5 border-t ${
                  stepNum < currentStep ? 'border-sb-navy' : 'border-dashed border-sb-border'
                }`}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};
