'use client';

import React, { useEffect, useState } from 'react';
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

  // Clean, modern responsive container without fake phone notches or artificial phone overlays
  return (
    <div className="min-h-screen bg-[#F0F2F5] py-0 md:py-6 lg:py-0 flex items-center justify-center">
      <div
        data-testid="device-frame"
        className={`w-full bg-sb-bg relative flex flex-col overflow-hidden select-none transition-all ${
          !isSupervisor
            ? 'min-h-screen md:min-h-[844px] md:max-w-[420px] md:rounded-2xl md:shadow-e2 md:border md:border-sb-border lg:border-0 lg:rounded-none lg:shadow-none lg:w-full lg:h-screen lg:max-w-none'
            : 'min-h-screen md:h-[844px] md:max-w-[420px] md:rounded-2xl md:shadow-e2 md:border md:border-sb-border'
        }`}
      >
        {/* Viewport Content */}
        <div className="flex-1 relative overflow-y-auto overflow-x-hidden flex flex-col">
          {children}
        </div>
      </div>
    </div>
  );
};
