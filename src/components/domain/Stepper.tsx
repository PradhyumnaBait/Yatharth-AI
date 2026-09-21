'use client';

import React from 'react';
import { Check } from 'lucide-react';

export interface StepperProps {
  steps: string[];
  currentStep: number; // 1-based index
  onStepClick?: (stepIndex: number) => void;
  className?: string;
  'data-testid'?: string;
}

export const Stepper: React.FC<StepperProps> = ({
  steps,
  currentStep,
  onStepClick,
  className = '',
  'data-testid': testId = 'stepper',
}) => {
  return (
    <div data-testid={testId} className={`w-full flex items-center justify-between ${className}`}>
      {steps.map((label, idx) => {
        const stepNum = idx + 1;
        const isComplete = stepNum < currentStep;
        const isCurrent = stepNum === currentStep;
        const isLast = idx === steps.length - 1;

        return (
          <React.Fragment key={label}>
            <button
              type="button"
              disabled={!onStepClick || stepNum > currentStep}
              onClick={() => onStepClick?.(stepNum)}
              data-testid={`${testId}-step-${stepNum}`}
              className={`flex items-center gap-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-sb-navy rounded-full ${
                isCurrent || isComplete ? 'text-sb-navy' : 'text-sb-ink-3'
              } ${onStepClick && stepNum <= currentStep ? 'cursor-pointer' : 'cursor-default'}`}
            >
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center font-mono text-mono-s font-semibold border transition-colors ${
                  isComplete
                    ? 'bg-sb-navy text-sb-white border-sb-navy'
                    : isCurrent
                    ? 'bg-sb-white text-sb-navy border-sb-navy ring-2 ring-sb-navy/20'
                    : 'bg-sb-bg text-sb-ink-3 border-sb-border'
                }`}
              >
                {isComplete ? <Check className="w-3.5 h-3.5" strokeWidth={2.5} /> : stepNum}
              </div>
              <span className={`text-caption ${isCurrent ? 'font-bold text-sb-navy' : 'font-medium'}`}>
                {label}
              </span>
            </button>

            {!isLast && (
              <div
                className={`flex-1 mx-3 h-0.5 ${
                  stepNum < currentStep ? 'bg-sb-navy' : 'bg-sb-border'
                }`}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};
