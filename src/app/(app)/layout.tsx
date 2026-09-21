'use client';

import React from 'react';
import { DeviceFrame } from '@/components/shell/DeviceFrame';
import { BottomNav } from '@/components/shell/BottomNav';
import { RoleGuard } from '@/components/shell/RoleGuard';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <DeviceFrame>
      <RoleGuard>
        <div className="flex-1 flex flex-col relative w-full h-full pb-20 overflow-y-auto">
          {children}
        </div>
        <BottomNav />
      </RoleGuard>
    </DeviceFrame>
  );
}
