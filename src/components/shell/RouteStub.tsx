'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import { Button } from '../ui/Button';

export interface RouteStubProps {
  screenId: string;
  title: string;
  role: string;
  route: string;
  purpose: string;
  priority?: string;
  actions?: { label: string; href?: string; onClick?: () => void }[];
}

export const RouteStub: React.FC<RouteStubProps> = ({
  screenId,
  title,
  role,
  route,
  purpose,
  priority = 'P1',
  actions = [],
}) => {
  const router = useRouter();

  return (
    <div
      data-testid={`stub-${screenId.toLowerCase()}`}
      className="p-5 flex flex-col items-center justify-center min-h-[60vh] text-center"
    >
      <div className="flex items-center gap-2 mb-3">
        <span className="font-mono text-mono-s font-bold text-sb-navy bg-sb-navy-tint px-2.5 py-0.5 rounded-full">
          {screenId}
        </span>
        <span className="font-mono text-mono-s text-sb-ink-3 bg-sb-border px-2 py-0.5 rounded-full">
          Pri: {priority}
        </span>
      </div>

      <h1 className="text-title-2 font-bold text-sb-navy mb-1">{title}</h1>
      <div className="font-mono text-mono-s text-sb-ink-3 mb-2">{route}</div>
      <div className="text-caption font-semibold text-sb-navy bg-sb-bg px-3 py-1 rounded-full border border-sb-border mb-4">
        Target Role: {role}
      </div>

      <p className="text-body text-sb-ink-2 max-w-xs mb-6">{purpose}</p>

      <div className="flex flex-wrap gap-2 justify-center">
        <Button
          variant="outline"
          onClick={() => router.back()}
          className="h-10 px-4 text-callout"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" />
          Back
        </Button>
        {actions.map((act) => (
          <Button
            key={act.label}
            variant="primary"
            onClick={act.onClick || (() => act.href && router.push(act.href))}
            className="h-10 px-4 text-callout"
          >
            {act.label}
          </Button>
        ))}
      </div>
    </div>
  );
};
