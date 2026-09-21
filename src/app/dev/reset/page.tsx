'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { ArrowRight } from 'lucide-react';

export default function DevResetPage() {
  const router = useRouter();
  const [snapshot, setSnapshot] = useState('demo-start');
  const [resetting, setResetting] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const snap = params.get('snapshot');
      if (snap) setSnapshot(snap);
    }
  }, []);

  const handleReset = (selectedSnapshot: string) => {
    setResetting(true);
    setSnapshot(selectedSnapshot);
    if (typeof window !== 'undefined') {
      localStorage.clear();
    }
    setTimeout(() => {
      setResetting(false);
      router.push('/home');
    }, 400);
  };

  return (
    <div className="min-h-screen bg-sb-bg p-6 max-w-md mx-auto flex flex-col justify-center text-center">
      <div className="font-mono text-mono-s text-sb-navy bg-sb-navy-tint px-2.5 py-0.5 rounded-full inline-block mx-auto mb-2">
        DEV TOOL · STORE RESET
      </div>
      <h1 className="text-title-2 font-bold text-sb-navy mb-2">Reset Demo State</h1>
      <p className="text-body text-sb-ink-2 mb-6">
        Select a seed snapshot to reset localStorage stores and reload initial fixture state.
      </p>

      <div className="space-y-3 mb-6">
        <button
          type="button"
          onClick={() => handleReset('reference')}
          disabled={resetting}
          className={`w-full p-4 rounded-[16px] bg-sb-white border text-left transition-all active:scale-[0.99] ${
            snapshot === 'reference' ? 'border-sb-navy shadow-e2' : 'border-sb-border shadow-e1 hover:border-sb-navy'
          }`}
        >
          <div className="text-callout font-bold text-sb-navy">Reference Snapshot</div>
          <div className="text-caption text-sb-ink-3 mt-0.5">
            Home exactly as pictured (Event 08:42 is already Verified). 47 Verified / 12 Review.
          </div>
        </button>

        <button
          type="button"
          onClick={() => handleReset('demo-start')}
          disabled={resetting}
          className={`w-full p-4 rounded-[16px] bg-sb-white border text-left transition-all active:scale-[0.99] ${
            snapshot === 'demo-start' ? 'border-sb-navy shadow-e2' : 'border-sb-border shadow-e1 hover:border-sb-navy'
          }`}
        >
          <div className="text-callout font-bold text-sb-navy">Demo-Start Snapshot</div>
          <div className="text-caption text-sb-ink-3 mt-0.5">
            Event E-2091 is pending review. Approving it live in Workbench flips it to Verified on Home.
          </div>
        </button>
      </div>

      <Button
        variant="outline"
        onClick={() => router.push('/home')}
        className="w-full"
      >
        <span>Return to Home</span>
        <ArrowRight className="w-4 h-4 ml-1.5" />
      </Button>
    </div>
  );
}
