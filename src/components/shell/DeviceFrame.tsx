'use client';

import React, { useEffect, useState } from 'react';
import { Wifi, Battery, Signal } from 'lucide-react';

export interface DeviceFrameProps {
  children: React.ReactNode;
}

export const DeviceFrame: React.FC<DeviceFrameProps> = ({ children }) => {
  const [frameEnabled, setFrameEnabled] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('frame') === 'off') {
        setFrameEnabled(false);
      }
    }
  }, []);

  if (!isMounted) {
    return <div className="min-h-screen bg-sb-bg">{children}</div>;
  }

  // When frame is explicitly turned off or on small screens (<= 500px)
  if (!frameEnabled) {
    return <div className="min-h-screen bg-sb-bg w-full">{children}</div>;
  }

  return (
    <div className="min-h-screen bg-[#E5E9F0] py-0 md:py-8 flex items-center justify-center">
      {/* 390x844 Reference Phone Frame */}
      <div
        data-testid="device-frame"
        className="w-full h-screen md:h-[844px] md:w-[390px] bg-sb-bg md:rounded-[48px] md:shadow-e3 border-0 md:border-[10px] md:border-[#0D162B] relative flex flex-col overflow-hidden select-none"
      >
        {/* Fake 9:41 Status Bar (Visible only inside Device Frame on desktop) */}
        <div className="hidden md:flex items-center justify-between px-6 pt-3 pb-1 bg-transparent text-sb-ink z-50 text-caption font-semibold flex-shrink-0">
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
