/**
 * SchedBridge AI — Motion & Animation Tokens
 * Shared design system animation curves, spring timings, and interaction utilities.
 *
 * Hardware-accelerated transitions prioritizing 'transform' and 'opacity' properties.
 * Fully compatible with prefers-reduced-motion accessibility constraints.
 */

import { useEffect, useState } from 'react';

export const MOTION_TOKENS = {
  // 1. Standard Transition (240ms, cubic-bezier(0.4, 0, 0.2, 1))
  standard: {
    durationMs: 240,
    durationSec: 0.24,
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
    transition: 'all 240ms cubic-bezier(0.4, 0, 0.2, 1)',
    transformOpacity: 'transform 240ms cubic-bezier(0.4, 0, 0.2, 1), opacity 240ms cubic-bezier(0.4, 0, 0.2, 1)',
    framer: {
      duration: 0.24,
      ease: [0.4, 0, 0.2, 1] as const,
    },
  },

  // 2. Bouncy / Spring Transition (400ms, cubic-bezier(0.34, 1.56, 0.64, 1))
  // Optimized for confirmations, tab selection, success states, badge reveals
  spring: {
    durationMs: 400,
    durationSec: 0.4,
    easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
    transition: 'all 400ms cubic-bezier(0.34, 1.56, 0.64, 1)',
    transformOpacity: 'transform 400ms cubic-bezier(0.34, 1.56, 0.64, 1), opacity 240ms cubic-bezier(0.4, 0, 0.2, 1)',
    framer: {
      type: 'spring' as const,
      stiffness: 380,
      damping: 24,
      mass: 0.8,
    },
  },

  // 3. Press-Feedback Utility (Scale to 0.96 on press, spring back on release)
  press: {
    scale: 0.96,
    className: 'sb-press-spring',
    framer: {
      whileTap: { scale: 0.96 },
      transition: { type: 'spring', stiffness: 450, damping: 25 },
    },
  },

  // 4. Skeleton / Shimmer Timing
  shimmer: {
    durationMs: 1400,
    durationSec: 1.4,
    easing: 'ease-in-out',
    className: 'sb-skeleton-shimmer',
  },

  // 5. Reduced-Motion Instant Fallback
  reducedMotion: {
    transition: 'none !important',
    durationSec: 0.001,
    transformOpacity: 'none !important',
    framer: {
      duration: 0.001,
    },
  },
} as const;

/**
 * Reusable utility classnames for Tailwind or HTML elements
 */
export const motionClasses = {
  standard: 'transition-all duration-[240ms] ease-[cubic-bezier(0.4,0,0.2,1)]',
  standardTransform: 'transition-[transform,opacity] duration-[240ms] ease-[cubic-bezier(0.4,0,0.2,1)]',
  spring: 'transition-all duration-[400ms] ease-[cubic-bezier(0.34,1.56,0.64,1)]',
  springTransform: 'transition-[transform,opacity] duration-[400ms] ease-[cubic-bezier(0.34,1.56,0.64,1)]',
  press: 'sb-press-spring',
  shimmer: 'sb-skeleton-shimmer',
} as const;

/**
 * React hook to observe and respond to the user's OS 'prefers-reduced-motion' setting.
 */
export function usePrefersReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handler = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handler);
      return () => mediaQuery.removeEventListener('change', handler);
    } else {
      mediaQuery.addListener(handler);
      return () => mediaQuery.removeListener(handler);
    }
  }, []);

  return prefersReducedMotion;
}

/**
 * Helper to generate Framer Motion variants that respect prefers-reduced-motion.
 */
export function getResponsiveMotion<T>(activeMotion: T, fallback: T, isReduced: boolean): T {
  return isReduced ? fallback : activeMotion;
}
