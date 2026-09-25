'use client';

import React, { useEffect, useState } from 'react';
import { Wifi, Battery, Signal, Smartphone } from 'lucide-react';
import { useAuthStore } from '@/store/auth';

export interface DeviceFrameProps {
  children: React.ReactNode;
}

export const DeviceFrame: React.FC<DeviceFrameProps> = ({ children }) => {
  const [frameEnabled, setFrameEnabled] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  const [urlRole, setUrlRole] = useState<string | null>(null);
  const { user } = useAuthStore();

  useEffect(() => {
    setIsMounted(true);
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('frame') === 'off') {
        setFrameEnabled(false);
      }
      const r = params.get('role');
      if (r) setUrlRole(r.toLowerCase());
    }
  }, []);

  const activeRole = urlRole || user?.role || 'supervisor';

  if (!isMounted) {
    return <div className="min-h-screen bg-sb-bg">{children}</div>;
  }

  // When frame is explicitly disabled via ?frame=off
  if (!frameEnabled) {
    return (
      <div className="min-h-screen bg-sb-bg w-full flex flex-col">
        {children}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0D162B] flex flex-col items-center justify-center p-0 md:p-6 lg:p-8 select-none">
      {/* Desktop Stage Header Tag */}
      <aside aria-label="Device presentation preview" className="hidden md:flex items-center justify-between w-[390px] mb-3 px-2 text-white/60 text-[11px] font-mono">
        <div className="flex items-center gap-1.5">
          <Smartphone className="w-3.5 h-3.5 text-white/80" />
          <span className="font-semibold text-white/90">SchedBridge AI</span>
          <span>·</span>
          <span className="capitalize">{activeRole} Device View</span>
        </div>
        <span className="px-2 py-0.5 rounded bg-white/10 text-white/80 font-bold text-[10px]">
          390 × 844
        </span>
      </aside>

      {/* Realistic Device Frame Container */}
      <div
        data-testid="device-frame"
        className="w-full h-screen md:w-[390px] md:h-[844px] bg-sb-bg relative flex flex-col overflow-hidden md:rounded-[48px] md:border-[10px] md:border-[#1A253E] md:ring-1 md:ring-white/10 md:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.7)] transition-all"
      >
        {/* Hardware / Speaker & Dynamic Island Status Bar (Visible on Desktop Stage) */}
        <div className="hidden md:flex items-center justify-between px-6 pt-3 pb-1 bg-sb-bg text-sb-ink z-50 text-caption font-semibold flex-shrink-0">
          <span className="text-[12px] font-semibold text-sb-ink font-mono">9:41</span>

          {/* Dynamic Island Pill */}
          <div className="w-24 h-5 bg-[#0D162B] rounded-full flex items-center justify-between px-2.5 shadow-inner">
            <div className="w-2.5 h-2.5 rounded-full bg-[#1A253E]" />
            <div className="w-2 h-2 rounded-full bg-emerald-500/80 animate-pulse" />
          </div>

          {/* Status Icons */}
          <div className="flex items-center gap-1.5 text-sb-ink">
            <Signal className="w-3.5 h-3.5 text-sb-ink" strokeWidth={2.2} />
            <Wifi className="w-3.5 h-3.5 text-sb-ink" strokeWidth={2.2} />
            <Battery className="w-4 h-4 text-sb-ink" strokeWidth={2.2} />
          </div>
        </div>

        {/* Inner Viewport Screen */}
        <div className="flex-1 relative overflow-y-auto overflow-x-hidden flex flex-col bg-sb-bg">
          {children}
        </div>

        {/* Bottom Home Indicator Bar (Desktop Mockup) */}
        <div className="hidden md:flex justify-center pb-2 pt-1 bg-sb-bg flex-shrink-0">
          <div className="w-32 h-1 bg-sb-ink/20 rounded-full" />
        </div>
      </div>
    </div>
  );
};
