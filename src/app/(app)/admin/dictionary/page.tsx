'use client';

import React from 'react';
import { PageHeader } from '@/components/shell/PageHeader';
import { RouteStub } from '@/components/shell/RouteStub';

export default function AdminDictionaryPage() {
  return (
    <div className="flex flex-col min-h-full">
      <PageHeader variant="back" title="EPC Dictionary & Synonyms" />
      <RouteStub
        screenId="AD3"
        title="Synonym Dictionary"
        role="Admin"
        route="/admin/dictionary"
        purpose="Configure Indian EPC synonym mappings (e.g. Hydro → Hydrotest), discipline keyword mapping, and interactive phrase tester."
        priority="P3"
      />
    </div>
  );
}
