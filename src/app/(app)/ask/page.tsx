'use client';

import React from 'react';
import { PageHeader } from '@/components/shell/PageHeader';
import { RouteStub } from '@/components/shell/RouteStub';

export default function AskPage() {
  return (
    <div className="flex flex-col min-h-full">
      <PageHeader variant="back" title="Ask Schedule AI" />
      <RouteStub
        screenId="PM3"
        title="Ask Schedule Intelligence"
        role="PM"
        route="/ask"
        purpose="Natural language schedule queries: delays, critical path, out-of-sequence work, and weekly achievements."
        priority="P3"
      />
    </div>
  );
}
