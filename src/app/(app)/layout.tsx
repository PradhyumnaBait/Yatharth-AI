'use client';

import React, { useEffect, useState } from 'react';
import { DeviceFrame } from '@/components/shell/DeviceFrame';
import { BottomNav } from '@/components/shell/BottomNav';
import { LeftNavRail } from '@/components/shell/LeftNavRail';
import { RoleGuard } from '@/components/shell/RoleGuard';
import { useAuthStore } from '@/store/auth';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuthStore();
  const [urlRole, setUrlRole] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const r = params.get('role');
      if (r) setUrlRole(r.toLowerCase());
    }
  }, []);

  const activeRole = urlRole || user?.role || 'supervisor';
  const isDesktopNonSupervisor = activeRole !== 'supervisor';

  return (
    <DeviceFrame>
      <RoleGuard>
        <div
          className={`flex-1 flex w-full h-full relative overflow-hidden ${
            isDesktopNonSupervisor ? 'lg:flex-row' : ''
          }`}
        >
          {/* Left Nav Rail for Planner, PM, and Admin on ≥ 1024px */}
          {isDesktopNonSupervisor && (
            <div className="hidden lg:flex shrink-0">
              <LeftNavRail />
            </div>
          )}

          {/* Main Viewport Content */}
          <div
            className={`flex-1 flex flex-col relative w-full h-full overflow-y-auto overflow-x-hidden ${
              isDesktopNonSupervisor ? 'pb-24 lg:pb-0' : 'pb-24'
            }`}
          >
            {children}
          </div>

          {/* Bottom Nav: shown on mobile, and for supervisor inside phone frame */}
          <div className={isDesktopNonSupervisor ? 'lg:hidden' : ''}>
            <BottomNav />
          </div>
        </div>
      </RoleGuard>
    </DeviceFrame>
  );
}
