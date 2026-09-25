'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@/store/auth';
import { useUiStore } from '@/store/ui';
import { TRANSLATIONS } from '@/lib/translations';
import { ChevronRight, Mic, Cpu, ShieldCheck } from 'lucide-react';

interface IntroCard {
  id: number;
  image: string;
  icon: React.ReactNode;
  titleKey: 'step1Title' | 'step2Title' | 'step3Title';
  descKey: 'step1Desc' | 'step2Desc' | 'step3Desc';
}

const CARDS: IntroCard[] = [
  {
    id: 0,
    image: '/images/hero-worker-v2.jpg',
    icon: <Mic className="w-5 h-5" />,
    titleKey: 'step1Title',
    descKey: 'step1Desc',
  },
  {
    id: 1,
    image: '/images/refinery-pipes.jpg',
    icon: <Cpu className="w-5 h-5" />,
    titleKey: 'step2Title',
    descKey: 'step2Desc',
  },
  {
    id: 2,
    image: '/images/pipeline-trench.jpg',
    icon: <ShieldCheck className="w-5 h-5" />,
    titleKey: 'step3Title',
    descKey: 'step3Desc',
  },
];

export default function IntroPage() {
  const router = useRouter();
  const { setHasSeenOnboarding } = useAuthStore();
  const { language } = useUiStore();
  const t = TRANSLATIONS[language]?.intro || TRANSLATIONS.en.intro;

  const [currentIndex, setCurrentIndex] = useState(0);

  const handleFinish = () => {
    setHasSeenOnboarding(true);
    router.push('/login');
  };

  const handleNext = () => {
    if (currentIndex < CARDS.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      handleFinish();
    }
  };

  const currentCard = CARDS[currentIndex];

  return (
    <div
      data-testid="intro-screen-a2"
      className="relative w-full min-h-screen max-w-[420px] mx-auto bg-sb-navy overflow-y-auto flex flex-col justify-between select-none shadow-2xl"
    >
      {/* Top Skip Button */}
      <div className="absolute top-10 right-5 z-30">
        <button
          type="button"
          onClick={handleFinish}
          data-testid="intro-skip-btn"
          className="text-callout font-semibold text-white/90 hover:text-white bg-sb-navy/60 hover:bg-sb-navy/80 px-3.5 py-1.5 rounded-full border border-white/20 transition-colors"
        >
          {t.skip}
        </button>
      </div>

      {/* Hero Photo Carousel */}
      <div className="relative w-full h-[400px] sm:h-[440px] shrink-0 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentCard.id}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0"
          >
            <Image
              src={currentCard.image}
              alt={t[currentCard.titleKey]}
              fill
              priority
              sizes="(max-width: 500px) 100vw, 420px"
              className="object-cover object-center"
            />
            {/* Scrim */}
            <div className="absolute inset-0 bg-black/25" />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Overlapping White Panel */}
      <div
        className="relative z-20 -mt-10 w-full bg-sb-white rounded-t-[28px] shadow-e3 px-6 pt-5 pb-8 flex flex-col items-center text-center flex-1 justify-between"
        data-testid="intro-panel"
      >
        {/* Step Icon Badge */}
        <div className="w-12 h-12 rounded-full bg-sb-navy-tint text-sb-navy flex items-center justify-center -mt-1 mb-3 shadow-e1">
          {currentCard.icon}
        </div>

        {/* Card Text Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentCard.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="min-h-[110px] flex flex-col items-center justify-center"
          >
            <h2
              data-testid="intro-card-title"
              className="text-title-1 font-bold text-sb-navy tracking-tight mb-2 px-2"
            >
              {t[currentCard.titleKey]}
            </h2>
            <p
              data-testid="intro-card-desc"
              className="text-body text-sb-ink-2 max-w-[310px] leading-relaxed"
            >
              {t[currentCard.descKey]}
            </p>
          </motion.div>
        </AnimatePresence>

        {/* Bottom Section: Dots + Button */}
        <div className="w-full space-y-5 mt-4">
          {/* Page dots */}
          <div
            data-testid="intro-dots"
            className="flex items-center justify-center gap-2"
          >
            {CARDS.map((card, idx) => {
              const isActive = idx === currentIndex;
              return (
                <button
                  key={card.id}
                  type="button"
                  onClick={() => setCurrentIndex(idx)}
                  data-testid={`intro-dot-${idx}`}
                  aria-label={`Go to slide ${idx + 1}`}
                  className={`h-2 rounded-full transition-all duration-200 ${
                    isActive
                      ? 'w-6 bg-sb-navy'
                      : 'w-2 bg-sb-border hover:bg-sb-ink-3'
                  }`}
                />
              );
            })}
          </div>

          {/* Next / Continue CTA */}
          <button
            type="button"
            onClick={handleNext}
            data-testid="intro-next-btn"
            className="w-full h-14 rounded-full bg-sb-navy text-sb-white font-semibold text-callout tracking-wide flex items-center justify-center gap-2 active:scale-[0.98] active:bg-sb-navy-pressed transition-transform shadow-e2"
          >
            <span>
              {currentIndex === CARDS.length - 1 ? t.continue : t.next}
            </span>
            <ChevronRight className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>
      </div>
    </div>
  );
}
