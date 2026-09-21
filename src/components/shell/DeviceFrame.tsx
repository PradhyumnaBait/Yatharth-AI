'use client';

import React, { useEffect, useState } from 'react';
import { Wifi, Battery, Signal } from 'lucide-react';
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
  const isSupervisor = activeRole === 'supervisor';

  if (!isMounted) {
    return <div className="min-h-screen bg-sb-bg">{children}</div>;
  }

  // When frame is explicitly turned off
  if (!frameEnabled) {
    return <div className="min-h-screen bg-sb-bg w-full flex flex-col">{children}</div>;
  }

  // For Planner, PM, and Admin on desktop (≥ 1024px): Expand to full desktop without phone frame
  // Supervisors remain in the phone frame at all viewports (SPEC §7 & P15)
  return (
    <div className="min-h-screen bg-[#E5E9F0] py-0 md:py-8 lg:py-0 flex items-center justify-center">
      {/* 
        For non-supervisors at lg (≥ 1024px): full width container without borders
        For supervisor: always strict 390x844 phone mockup
      */}
      <div
        data-testid="device-frame"
        className={`w-full bg-sb-bg relative flex flex-col overflow-hidden select-none transition-all ${
          !isSupervisor
            ? 'h-screen md:h-[844px] md:w-[390px] md:rounded-[48px] md:shadow-e3 md:border-[10px] md:border-[#0D162B] lg:border-0 lg:rounded-none lg:shadow-none lg:w-full lg:h-screen lg:max-w-none'
            : 'h-screen md:h-[844px] md:w-[390px] md:rounded-[48px] md:shadow-e3 border-0 md:border-[10px] md:border-[#0D162B]'
        }`}
      >
        {/* Fake 9:41 Status Bar (Visible only inside Phone Frame on desktop, hidden on lg desktop for non-supervisors) */}
        <div
          className={`hidden md:flex items-center justify-between px-6 pt-3 pb-1 bg-transparent text-sb-ink z-50 text-caption font-semibold flex-shrink-0 ${
            !isSupervisor ? 'lg:hidden' : ''
          }`}
        >
          <span>9:41</span>

          {/* Dynamic Island Pill */}
          <div className="w-24 h-5 bg-black rounded-full flex items-center justify-center">
            <div className="w-2.5 h-2.5 rounded-full bg-[#1A1A1A] ml-auto mr-2" />
          </div>

          <div className="flex items-center gap-1.5 text-sb-ink">
            <Signal className="w-3.5 h-3.5" strokeWidth={2} />
            <Wifi className="w-3.5 h-3.5" strokeWidth={2} />
            <Battery className="w-4 h-4" strokeWidth={2} />
          </div>
        </div>

        {/* Viewport Content */}
        <div className="flex-1 relative overflow-y-auto overflow-x-hidden flex flex-col">
          {children}
        </div>
      </div>
    </div>
  );
};
