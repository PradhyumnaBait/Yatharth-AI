'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Mic, Link2, ShieldCheck, ChevronUp, ChevronDown } from 'lucide-react';
import { Logo } from '@/components/ui/Logo';
import { useAuthStore } from '@/store/auth';
import { useUiStore } from '@/store/ui';
import { TRANSLATIONS } from '@/lib/translations';

export default function WelcomePage() {
  const router = useRouter();
  const { isAuthenticated, hasSeenOnboarding, user } = useAuthStore();
  const { language } = useUiStore();
  const t = TRANSLATIONS[language]?.welcome || TRANSLATIONS.en.welcome;

  const [isExpanded, setIsExpanded] = useState(false);

  // Check if authenticated on mount. Skip to role Home unless preview mode requested.
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const search = window.location.search;
      const isPreview = search.includes('preview=1') || search.includes('stay=true');
      if (isAuthenticated && !isPreview) {
        router.replace('/home');
      }
    }
  }, [isAuthenticated, router]);

  const handleGetStarted = () => {
    if (hasSeenOnboarding) {
      router.push('/login');
    } else {
      router.push('/welcome/intro');
    }
  };

  return (
    <div
      data-testid="welcome-screen-a1"
      className="relative w-full h-full min-h-[844px] max-w-[390px] mx-auto bg-sb-navy overflow-hidden flex flex-col justify-between select-none"
    >
      {/* Top 62% Hero Photo with flat scrim */}
      <div className="relative w-full h-[62%] min-h-[480px] shrink-0 overflow-hidden">
        <Image
          src="/images/hero-worker.jpg"
          alt="SchedBridge AI field execution"
          fill
          priority
          sizes="(max-width: 500px) 100vw, 390px"
          className="object-cover object-center"
        />

        {/* Flat photo scrim only - NO gradients per SPEC §1 and §4.1 */}
        <div
          className="absolute inset-0 bg-[#14213D]/28"
          aria-hidden="true"
        />

        {/* Thin overlay headline top-left */}
        <div className="absolute top-12 left-6 right-6 z-10">
          <h1
            data-testid="welcome-overlay-headline"
            className="text-display-thin font-light text-white tracking-tight leading-[38px]"
          >
            {t.overlay1}
            <br />
            {t.overlay2}
            <br />
            {t.overlay3}
            <br />
            {t.overlay4}
          </h1>
        </div>

        {/* Optional preview indicator if user is already signed in */}
        {isAuthenticated && user && (
          <div className="absolute top-3 right-4 z-20">
            <Link
              href="/home"
              className="text-[11px] font-semibold text-white bg-sb-navy/70 border border-white/20 px-2.5 py-1 rounded-full backdrop-blur-none"
            >
              Home ({user.name.split(' ')[0]}) ›
            </Link>
          </div>
        )}
      </div>

      {/* Overlapping white sheet - overlaps photo lower edge */}
      <motion.div
        animate={{
          y: isExpanded ? -80 : 0,
        }}
        transition={{ type: 'spring', stiffness: 340, damping: 34 }}
        className="relative z-30 -mt-14 w-full bg-sb-white rounded-t-[28px] shadow-e3 px-6 pt-3 pb-8 flex flex-col items-center text-center flex-1"
        data-testid="welcome-sheet"
      >
        {/* Grabber: clickable/draggable to expand value points */}
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full pt-1 pb-3 flex flex-col items-center justify-center group focus:outline-none"
          aria-label={isExpanded ? t.tapToCollapse : t.tapToExpand}
          data-testid="welcome-grabber"
        >
          <div className="w-9 h-1 rounded-full bg-sb-border group-hover:bg-sb-ink-3 transition-colors mb-1" />
          <span className="text-[10px] uppercase font-semibold tracking-wider text-sb-ink-3/70 flex items-center gap-0.5">
            {isExpanded ? (
              <>
                <ChevronDown className="w-3 h-3" />
                <span>{t.tapToCollapse}</span>
              </>
            ) : (
              <>
                <ChevronUp className="w-3 h-3" />
                <span>{t.tapToExpand}</span>
              </>
            )}
          </span>
        </button>

        {/* Logo Lockup: mark + wordmark SCHEDBRIDGE AI */}
        <div className="mt-1 mb-3">
          <Logo size="md" showWordmark layout="row" data-testid="welcome-logo" />
        </div>

        {/* Sheet Headline: 2 lines, bold, navy */}
        <h2
          data-testid="welcome-headline"
          className="text-title-1 font-bold text-sb-navy tracking-tight leading-[30px] mb-2 px-2"
        >
          {t.tagline}
        </h2>

        {/* Sub-copy: one grey sentence in sb-ink-2 */}
        <p
          data-testid="welcome-subcopy"
          className="text-body text-sb-ink-2 mb-6 px-1 max-w-[320px]"
        >
          {t.desc}
        </p>

        {/* Expandable 3 value points drawer */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="w-full space-y-2.5 mb-5 text-left overflow-hidden"
              data-testid="welcome-value-points"
            >
              <div className="p-2.5 bg-sb-bg rounded-[14px] border border-sb-border flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-sb-navy-tint text-sb-navy flex items-center justify-center shrink-0 mt-0.5">
                  <Mic className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="text-callout font-semibold text-sb-navy">
                    {t.value1Title}
                  </div>
                  <div className="text-caption text-sb-ink-2">{t.value1Desc}</div>
                </div>
              </div>

              <div className="p-2.5 bg-sb-bg rounded-[14px] border border-sb-border flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-sb-navy-tint text-sb-navy flex items-center justify-center shrink-0 mt-0.5">
                  <Link2 className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="text-callout font-semibold text-sb-navy">
                    {t.value2Title}
                  </div>
                  <div className="text-caption text-sb-ink-2">{t.value2Desc}</div>
                </div>
              </div>

              <div className="p-2.5 bg-sb-bg rounded-[14px] border border-sb-border flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-sb-verified-tint text-sb-verified-ink flex items-center justify-center shrink-0 mt-0.5">
                  <ShieldCheck className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="text-callout font-semibold text-sb-navy">
                    {t.value3Title}
                  </div>
                  <div className="text-caption text-sb-ink-2">{t.value3Desc}</div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Full-width navy pill: Get Started › */}
        <button
          type="button"
          onClick={handleGetStarted}
          data-testid="get-started-btn"
          className="w-full h-14 rounded-full bg-sb-navy text-sb-white font-semibold text-callout tracking-wide flex items-center justify-center gap-1.5 active:scale-[0.98] active:bg-sb-navy-pressed transition-transform shadow-e2 mb-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-sb-navy"
        >
          <span>{t.getStarted}</span>
          <ChevronRight className="w-4 h-4 stroke-[2.5]" />
        </button>

        {/* Log In Link */}
        <div className="text-callout text-sb-ink-2 mb-6">
          <span>{t.alreadyHaveAccount}</span>
          <Link
            href="/login"
            data-testid="login-link"
            className="font-bold text-sb-navy hover:underline underline-offset-2 ml-1"
          >
            {t.logIn}
          </Link>
        </div>

        {/* Hairline-flanked caption */}
        <div
          data-testid="welcome-hairline-caption"
          className="w-full flex items-center justify-center gap-3 text-caption text-sb-ink-3 uppercase tracking-wider select-none mt-auto"
        >
          <div className="h-[1px] flex-1 bg-sb-border" />
          <span className="shrink-0 text-[11px] font-medium">{t.caption}</span>
          <div className="h-[1px] flex-1 bg-sb-border" />
        </div>
      </motion.div>
    </div>
  );
}
