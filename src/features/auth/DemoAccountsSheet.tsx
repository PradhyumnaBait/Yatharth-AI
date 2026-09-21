'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Sheet } from '@/components/ui/Sheet';
import { Avatar } from '@/components/ui/Avatar';
import { DEMO_USERS, useAuthStore, UserRole } from '@/store/auth';
import { useUiStore } from '@/store/ui';
import { TRANSLATIONS } from '@/lib/translations';
import { ArrowRight, HardHat, Compass, Briefcase, ShieldCheck } from 'lucide-react';

export interface DemoAccountsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  subtitle?: string;
}

const ROLE_ICONS: Record<UserRole, React.ReactNode> = {
  supervisor: <HardHat className="w-3.5 h-3.5" />,
  planner: <Compass className="w-3.5 h-3.5" />,
  pm: <Briefcase className="w-3.5 h-3.5" />,
  admin: <ShieldCheck className="w-3.5 h-3.5" />,
};

const ROLE_BADGE_STYLES: Record<UserRole, string> = {
  supervisor: 'bg-sb-review-tint text-sb-review-ink',
  planner: 'bg-sb-navy-tint text-sb-navy',
  pm: 'bg-sb-verified-tint text-sb-verified-ink',
  admin: 'bg-sb-bg text-sb-ink-2',
};

export const DemoAccountsSheet: React.FC<DemoAccountsSheetProps> = ({
  open,
  onOpenChange,
  title,
  subtitle,
}) => {
  const router = useRouter();
  const { setRole } = useAuthStore();
  const { language } = useUiStore();
  const t = TRANSLATIONS[language]?.demoSheet || TRANSLATIONS.en.demoSheet;

  const demoList = [
    DEMO_USERS.supervisor,
    DEMO_USERS.planner,
    DEMO_USERS.pm,
    DEMO_USERS.admin,
  ];

  const handleSelectUser = (role: UserRole) => {
    setRole(role);
    onOpenChange(false);
    router.push('/home');
  };

  return (
    <Sheet
      open={open}
      onOpenChange={onOpenChange}
      title={title || t.title}
      description={subtitle || t.subtitle}
      data-testid="demo-accounts-sheet"
    >
      <div className="space-y-2.5 pt-2 pb-2">
        {demoList.map((demoUser) => {
          return (
            <button
              key={demoUser.id}
              type="button"
              onClick={() => handleSelectUser(demoUser.role)}
              data-testid={`demo-user-${demoUser.role}`}
              className="w-full p-3.5 rounded-[16px] border border-sb-border bg-sb-white hover:bg-sb-bg transition-colors flex items-center justify-between text-left group"
            >
              <div className="flex items-center gap-3 min-w-0">
                <Avatar
                  name={demoUser.name}
                  src={demoUser.avatarUrl}
                  size="md"
                />
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-callout font-semibold text-sb-navy truncate">
                      {demoUser.name}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                        ROLE_BADGE_STYLES[demoUser.role]
                      }`}
                    >
                      {ROLE_ICONS[demoUser.role]}
                      <span>{demoUser.title}</span>
                    </span>
                  </div>

                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="font-mono text-mono-s text-sb-ink-3">
                      {demoUser.employeeId}
                    </span>
                    <span className="text-caption text-sb-ink-3">·</span>
                    <span className="text-caption text-sb-ink-3 truncate">
                      {demoUser.organization}
                    </span>
                  </div>
                </div>
              </div>

              <div className="w-8 h-8 rounded-full bg-sb-bg flex items-center justify-center text-sb-navy group-hover:bg-sb-navy group-hover:text-sb-white transition-colors shrink-0 ml-2">
                <ArrowRight className="w-4 h-4" />
              </div>
            </button>
          );
        })}
      </div>

      <div className="pt-3 pb-2 text-center">
        <p className="text-caption text-sb-ink-3">{t.footer}</p>
      </div>
    </Sheet>
  );
};
