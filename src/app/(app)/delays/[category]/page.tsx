'use client';

import React from 'react';
import { PageHeader } from '@/components/shell/PageHeader';
import { RouteStub } from '@/components/shell/RouteStub';

export default function DelayDetailPage({ params }: { params: { category: string } }) {
  const formattedCategory = decodeURIComponent(params.category);

  return (
    <div className="flex flex-col min-h-full">
      <PageHeader variant="back" title={`Delay: ${formattedCategory}`} subtitle="Forensic Root-Cause Analysis" />
      <RouteStub
        screenId="PM4"
        title={`Delay Detail — ${formattedCategory}`}
        role="PM"
        route={`/delays/${params.category}`}
        purpose="Affected activities list, critical path impact, supervisor field quotes, chronological event timeline, and CSV export."
        priority="P2"
      />
    </div>
  );
}
