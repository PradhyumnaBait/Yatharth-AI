'use client';

import React from 'react';
import { PageHeader } from '@/components/shell/PageHeader';
import { RouteStub } from '@/components/shell/RouteStub';

export default function AdminProjectsPage() {
  return (
    <div className="flex flex-col min-h-full">
      <PageHeader variant="back" title="Projects & Baselines" />
      <RouteStub
        screenId="AD4"
        title="Projects & Baselines"
        role="Admin"
        route="/admin/projects"
        purpose="Baseline versions (v1–v3), data date administration, matching threshold configurations, and project archival."
        priority="P3"
      />
    </div>
  );
}
