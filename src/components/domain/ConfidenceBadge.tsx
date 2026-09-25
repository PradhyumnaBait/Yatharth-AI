'use client';

import React from 'react';
import { CheckCircle2, AlertCircle, HelpCircle, ShieldCheck, Sparkles } from 'lucide-react';
import { useUiStore } from '@/store/ui';

export type ConfidenceTier = 'auto-accept' | 'review' | 'unmatched';

export interface ConfidenceBadgeProps {
  confidence: number; // e.g. 94
  autoAcceptThreshold?: number; // default 90 (product calibration setting)
  reviewThreshold?: number; // default 60 (product calibration setting)
  showLabel?: boolean;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'hero';
  variant?: 'badge' | 'hero' | 'minimal';
  className?: string;
  'data-testid'?: string;
}

export const ConfidenceBadge: React.FC<ConfidenceBadgeProps> = ({
  confidence,
  autoAcceptThreshold: customAutoAccept,
  reviewThreshold: customReview,
  showLabel = false,
  size = 'md',
  variant = 'badge',
  className = '',
  'data-testid': testId = 'confidence-badge',
}) => {
  const storeAutoAccept = useUiStore((s) => s.autoAcceptThreshold);
  const storeReview = useUiStore((s) => s.reviewThreshold);
  const [displayValue, setDisplayValue] = React.useState<number>(confidence);

  // Count-up animation (0 -> final value over 400ms spring duration)
  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    const isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (isReducedMotion) {
      setDisplayValue(confidence);
      return;
    }

    let start = 0;
    const end = confidence;
    const duration = 400; // 400ms spring timing
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic (0.34, 1.56, 0.64, 1 spring approximation)
      const easedProgress = progress === 1 ? 1 : 1 - Math.pow(1 - progress, 3);
      const currentVal = Math.round(start + (end - start) * easedProgress);
      setDisplayValue(currentVal);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    const handle = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(handle);
  }, [confidence]);

  // Calibration settings (configured in prototype product settings)
  const autoAcceptThreshold = customAutoAccept ?? (storeAutoAccept || 90);
  const reviewThreshold = customReview ?? (storeReview || 60);

  let tier: ConfidenceTier = 'auto-accept';
  let tierLabel = 'Tier 1: High';
  let tierIcon = CheckCircle2;
  let tierBadgeStyle = 'bg-emerald-50 text-emerald-950 border-emerald-300/80';
  let iconColor = 'text-emerald-600';

  if (confidence < reviewThreshold) {
    tier = 'unmatched';
    tierLabel = 'Tier 3: Unmatched';
    tierIcon = HelpCircle;
    tierBadgeStyle = 'bg-amber-50 text-amber-950 border-amber-300/80';
    iconColor = 'text-amber-600';
  } else if (confidence < autoAcceptThreshold) {
    tier = 'review';
    tierLabel = 'Tier 2: Review';
    tierIcon = AlertCircle;
    tierBadgeStyle = 'bg-blue-50 text-blue-950 border-blue-300/80';
    iconColor = 'text-blue-600';
  }

  const IconComponent = tierIcon;

  // Hero Variant (used for large prominent score displays in detail screens)
  if (variant === 'hero' || size === 'hero') {
    return (
      <div
        data-testid={testId}
        data-tier={tier}
        className={`inline-flex flex-col items-end text-right ${className}`}
        title={`Product calibration setting: Tier 1 (≥${autoAcceptThreshold}%), Tier 2 Review (${reviewThreshold}–${autoAcceptThreshold - 1}%), Tier 3 Unmatched (<${reviewThreshold}%)`}
      >
        <div className="flex items-center gap-1.5 font-mono">
          <IconComponent className={`w-5 h-5 ${iconColor}`} />
          <span
            className={`text-[44px] leading-none font-bold tracking-tight transition-transform ${
              tier === 'auto-accept'
                ? 'text-emerald-700'
                : tier === 'review'
                ? 'text-blue-700'
                : 'text-amber-700'
            }`}
          >
            {displayValue}%
          </span>
        </div>
        <div className="flex items-center gap-1 text-[11px] font-mono font-bold uppercase tracking-wider text-sb-navy mt-1">
          <span className={`px-2 py-0.5 rounded-full border text-[10px] ${tierBadgeStyle}`}>
            {tierLabel}
          </span>
        </div>
      </div>
    );
  }

  // Size configurations for standard badge variant
  const sizeClasses = {
    xs: 'px-1.5 py-0.5 text-[10px] gap-1',
    sm: 'px-2 py-0.5 text-[11px] gap-1',
    md: 'px-2.5 py-1 text-[12px] gap-1.5',
    lg: 'px-3.5 py-1.5 text-caption gap-2',
    hero: 'px-4 py-2 text-callout gap-2',
  };

  const iconSizes = {
    xs: 'w-2.5 h-2.5',
    sm: 'w-3 h-3',
    md: 'w-3.5 h-3.5',
    lg: 'w-4 h-4',
    hero: 'w-5 h-5',
  };

  return (
    <div
      data-testid={testId}
      data-tier={tier}
      className={`inline-flex items-center rounded-full border font-semibold shadow-2xs transition-all ${tierBadgeStyle} ${sizeClasses[size]} ${className}`}
      title={`Product calibration setting: Tier 1 (≥${autoAcceptThreshold}%), Tier 2 Review (${reviewThreshold}–${autoAcceptThreshold - 1}%), Tier 3 Unmatched (<${reviewThreshold}%)`}
    >
      <IconComponent className={`${iconSizes[size]} ${iconColor} shrink-0`} />
      <span className="font-mono font-bold tracking-tight">
        {displayValue}%
      </span>
      {showLabel && (
        <span className="font-mono text-[10px] uppercase font-bold tracking-wider opacity-85 pl-0.5">
          · {tierLabel}
        </span>
      )}
    </div>
  );
};
