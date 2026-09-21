'use client';

import React from 'react';
import { PageHeader } from '@/components/shell/PageHeader';
import { RouteStub } from '@/components/shell/RouteStub';

export default function ProfilePage() {
  return (
    <div className="flex flex-col min-h-full">
      <PageHeader variant="back" title="Profile & Account" />
      <RouteStub
        screenId="S8"
        title="User Profile"
        role="all"
        route="/profile"
        purpose="User identity, employee ID, role badge, organization, statistics, and dev demo role switching."
        actions={[
          { label: 'Switch Demo Role', href: '/dev/roles' },
          { label: 'Settings', href: '/settings' },
        ]}
      />
    </div>
  );
}
