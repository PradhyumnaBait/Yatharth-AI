'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore, UserRole, DEMO_USERS } from '@/store/auth';
import { Check, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function DevRolesPage() {
  const router = useRouter();
  const { user, setRole } = useAuthStore();
  const currentRole = user?.role || 'supervisor';

  const roles: { role: UserRole; title: string; name: string; id: string; desc: string }[] = [
    {
      role: 'supervisor',
      title: 'Field Supervisor',
      name: DEMO_USERS.supervisor.name,
      id: DEMO_USERS.supervisor.employeeId,
      desc: 'Capture voice reports, track own tasks, see 47/12/03 KPIs. Bottom Nav center: Mic (Time Agent)',
    },
    {
      role: 'planner',
      title: 'Project Controls Planner',
      name: DEMO_USERS.planner.name,
      id: DEMO_USERS.planner.employeeId,
      desc: 'Workbench triage queue, 94% Match Review, ingest sheets. Bottom Nav center: + (Ingest)',
    },
    {
      role: 'pm',
      title: 'Project Manager',
      name: DEMO_USERS.pm.name,
      id: DEMO_USERS.pm.employeeId,
      desc: '0.92 SPI KPI, S-curve analytics, delay tracking. Bottom Nav center: Ask (Schedule Queries)',
    },
    {
      role: 'admin',
      title: 'Project Admin',
      name: DEMO_USERS.admin.name,
      id: DEMO_USERS.admin.employeeId,
      desc: 'User management, synonym dictionary, access requests. Bottom Nav center: + (Add)',
    },
  ];

  return (
    <div className="min-h-screen bg-sb-bg p-6 max-w-lg mx-auto pb-20">
      <header className="mb-6">
        <div className="font-mono text-mono-s text-sb-navy bg-sb-navy-tint px-2.5 py-0.5 rounded-full inline-block mb-2">
          TASK P03 · ROLE SWITCHER
        </div>
        <h1 className="text-title-2 font-bold text-sb-navy">Switch Active Demo Role</h1>
        <p className="text-caption text-sb-ink-2 mt-1">
          Select a role below. The Bottom Nav, Center Action, and Route permissions will adapt immediately.
        </p>
      </header>

      <div className="space-y-3 mb-8">
        {roles.map((r) => {
          const isSelected = r.role === currentRole;
          return (
            <div
              key={r.role}
              onClick={() => setRole(r.role)}
              role="button"
              tabIndex={0}
              data-testid={`role-select-${r.role}`}
              className={`p-4 rounded-[16px] border text-left cursor-pointer transition-all active:scale-[0.99] ${
                isSelected
                  ? 'bg-sb-white border-sb-navy shadow-e2 ring-2 ring-sb-navy/20'
                  : 'bg-sb-white border-sb-border hover:border-sb-navy/40 shadow-e1'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-callout font-bold text-sb-navy">{r.title}</span>
                    <span className="font-mono text-mono-s text-sb-ink-3">({r.id})</span>
                  </div>
                  <div className="text-caption text-sb-navy font-medium mt-0.5">{r.name}</div>
                </div>
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center border ${
                    isSelected
                      ? 'bg-sb-navy text-sb-white border-sb-navy'
                      : 'border-sb-border bg-sb-bg'
                  }`}
                >
                  {isSelected && <Check className="w-3 h-3" strokeWidth={2.5} />}
                </div>
              </div>
              <p className="text-caption text-sb-ink-2 mt-2 pt-2 border-t border-sb-border">
                {r.desc}
              </p>
            </div>
          );
        })}
      </div>

      <div className="flex gap-3">
        <Button
          variant="primary"
          className="flex-1"
          onClick={() => router.push('/home')}
          data-testid="go-to-home"
        >
          <span>Open Home as {DEMO_USERS[currentRole].title}</span>
          <ArrowRight className="w-4 h-4 ml-1.5" />
        </Button>
      </div>
    </div>
  );
}
