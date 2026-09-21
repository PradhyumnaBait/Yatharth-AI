'use client';

import React from 'react';
import { PageHeader } from '@/components/shell/PageHeader';
import { RouteStub } from '@/components/shell/RouteStub';

export default function AdminUsersPage() {
  return (
    <div className="flex flex-col min-h-full">
      <PageHeader variant="back" title="Users & Access Requests" />
      <RouteStub
        screenId="AD2"
        title="Users & Roles"
        role="Admin"
        route="/admin/users"
        purpose="Searchable user directory, approve/reject pending access requests (REQ-0087), and inspect the 4-role capability matrix."
        priority="P3"
      />
    </div>
  );
}
