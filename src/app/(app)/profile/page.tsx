'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/shell/PageHeader';
import { useAuthStore, DEMO_USERS, UserRole } from '@/store/auth';
import { useProjectStore } from '@/store/project';
import { Sheet } from '@/components/ui/Sheet';
import {
  User,
  Settings,
  Globe,
  Bell,
  FolderSync,
  HelpCircle,
  LogOut,
  ChevronRight,
  Shield,
  Layers,
  ArrowRightLeft,
  Check,
} from 'lucide-react';
import { useTranslation } from '@/i18n/useTranslation';

export default function ProfilePage() {
  const router = useRouter();
  const { user, setRole, logout } = useAuthStore();
  const projects = useProjectStore((s) => s.projects);
  const activeProjectId = useProjectStore((s) => s.activeProjectId);
  const { t } = useTranslation();
  const setActiveProjectId = useProjectStore((s) => s.setActiveProjectId);

  const currentUser = user || DEMO_USERS.supervisor;
  const currentProject = projects.find((p) => p.id === activeProjectId);

  const [switchUserSheetOpen, setSwitchUserSheetOpen] = useState(false);
  const [switchProjectSheetOpen, setSwitchProjectSheetOpen] = useState(false);
  const [signOutDialogOpen, setSignOutDialogOpen] = useState(false);

  // Role-specific stats
  const getRoleStats = () => {
    switch (currentUser.role) {
      case 'supervisor':
        return [
          { label: 'Reports this week', value: '14' },
          { label: 'Verified rate', value: '92%' },
          { label: 'Avg time to verify', value: '42 min' },
        ];
      case 'planner':
        return [
          { label: 'Events reviewed', value: '47' },
          { label: 'Queue freshness', value: '00:03' },
          { label: 'Approval rate', value: '94%' },
        ];
      case 'pm':
        return [
          { label: 'Monitored packages', value: '3' },
          { label: 'Schedule SPI', value: '0.92' },
          { label: 'Alerts resolved', value: '12' },
        ];
      case 'admin':
        return [
          { label: 'Active users', value: '38' },
          { label: 'Access requests', value: '04' },
          { label: 'P6 Baselines', value: '3' },
        ];
    }
  };

  const handleRoleSelect = (role: UserRole) => {
    setRole(role);
    setSwitchUserSheetOpen(false);
    router.refresh();
  };

  const handleSignOut = () => {
    logout();
    router.push('/');
  };

  return (
    <div className="flex flex-col min-h-full pb-8">
      <span data-testid="stub-s8" className="sr-only">S8</span>
      <PageHeader variant="back" title="Profile & Account" />

      <div className="px-4 py-3 space-y-4">
        {/* User Card */}
        <div className="bg-white p-4 rounded-card border border-sb-border shadow-e1">
          <div className="flex items-center gap-3.5">
            <div className="w-14 h-14 rounded-full bg-sb-navy text-white flex items-center justify-center font-bold text-h3 flex-shrink-0">
              {currentUser.name
                .split(' ')
                .map((n) => n[0])
                .join('')}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h2 data-testid="profile-user-name" className="text-body font-bold text-sb-ink truncate">{currentUser.name}</h2>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-sb-bg-subtle text-sb-navy px-2 py-0.5 rounded border border-sb-border">
                  {currentUser.role}
                </span>
              </div>

              <div className="flex items-center gap-2 text-caption text-sb-text-subtle mt-0.5">
                <span className="font-mono text-mono-s font-semibold text-sb-ink">
                  {currentUser.employeeId}
                </span>
                <span>·</span>
                <span className="truncate">{currentUser.organization}</span>
              </div>

              <p className="text-[11px] text-sb-text-muted mt-1 truncate">
                Active Project: {currentProject?.name || 'Kandla–Panipat Pipeline'}
              </p>
            </div>
          </div>

          {/* Role Stats Row */}
          <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-sb-border-subtle bg-sb-bg-subtle p-2.5 rounded-lg text-center">
            {getRoleStats().map((stat, i) => (
              <div key={i} className={i < 2 ? 'border-r border-sb-border-subtle pr-1' : ''}>
                <span className="text-[10px] text-sb-text-subtle font-medium block truncate">
                  {stat.label}
                </span>
                <span className="text-caption font-mono font-bold text-sb-navy mt-0.5 block">
                  {stat.value}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Navigation Section */}
        <div className="bg-white rounded-card border border-sb-border shadow-e1 divide-y divide-sb-border-subtle overflow-hidden">
          <div
            data-testid="profile-settings-link"
            onClick={() => router.push('/settings')}
            className="flex items-center justify-between p-3.5 hover:bg-sb-bg cursor-pointer transition-colors"
          >
            <div className="flex items-center gap-3">
              <Settings className="w-4 h-4 text-sb-text-subtle" />
              <span className="text-caption font-medium text-sb-ink">{t('profile.settingsRules')}</span>
            </div>
            <ChevronRight className="w-4 h-4 text-sb-text-subtle" />
          </div>

          <div
            data-testid="profile-notifications-link"
            onClick={() => router.push('/notifications')}
            className="flex items-center justify-between p-3.5 hover:bg-sb-bg cursor-pointer transition-colors"
          >
            <div className="flex items-center gap-3">
              <Bell className="w-4 h-4 text-sb-text-subtle" />
              <span className="text-caption font-medium text-sb-ink">{t('profile.notifications')}</span>
            </div>
            <ChevronRight className="w-4 h-4 text-sb-text-subtle" />
          </div>

          <div
            data-testid="profile-switch-project-btn"
            onClick={() => setSwitchProjectSheetOpen(true)}
            className="flex items-center justify-between p-3.5 hover:bg-sb-bg cursor-pointer transition-colors"
          >
            <div className="flex items-center gap-3">
              <Layers className="w-4 h-4 text-sb-text-subtle" />
              <span className="text-caption font-medium text-sb-ink">{t('profile.switchProject')}</span>
            </div>
            <span className="text-caption text-sb-text-muted flex items-center gap-1">
              Package 3 <ChevronRight className="w-4 h-4 text-sb-text-subtle" />
            </span>
          </div>

          <div
            onClick={() => router.push('/help')}
            className="flex items-center justify-between p-3.5 hover:bg-sb-bg cursor-pointer transition-colors"
          >
            <div className="flex items-center gap-3">
              <HelpCircle className="w-4 h-4 text-sb-text-subtle" />
              <span className="text-caption font-medium text-sb-ink">{t('profile.helpSpecs')}</span>
            </div>
            <ChevronRight className="w-4 h-4 text-sb-text-subtle" />
          </div>
        </div>

        {/* Developer Demo Section */}
        <div className="bg-white rounded-card border border-sb-border shadow-e1 divide-y divide-sb-border-subtle overflow-hidden">
          <div className="px-3.5 py-2 bg-sb-bg-subtle text-[11px] font-bold uppercase text-sb-text-subtle tracking-wider">
            {t('profile.developerControls')}
          </div>

          <div
            data-testid="profile-switch-demo-user-btn"
            onClick={() => setSwitchUserSheetOpen(true)}
            className="flex items-center justify-between p-3.5 hover:bg-sb-bg cursor-pointer transition-colors"
          >
            <div className="flex items-center gap-3">
              <ArrowRightLeft className="w-4 h-4 text-sb-navy" />
              <div>
                <span className="text-caption font-medium text-sb-ink block">{t('profile.switchDemoUser')}</span>
                <span className="text-[11px] text-sb-text-subtle">
                  {t('profile.switchDemoUserSub')}
                </span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-sb-text-subtle" />
          </div>

          <div
            data-testid="profile-sign-out-btn"
            onClick={() => setSignOutDialogOpen(true)}
            className="flex items-center justify-between p-3.5 hover:bg-red-50/50 cursor-pointer transition-colors text-red-700"
          >
            <div className="flex items-center gap-3">
              <LogOut className="w-4 h-4 text-red-600" />
              <span className="text-caption font-semibold">{t('profile.signOut')}</span>
            </div>
            <ChevronRight className="w-4 h-4 text-red-400" />
          </div>
        </div>
      </div>

      {/* Switch Demo User Sheet */}
      <Sheet
        isOpen={switchUserSheetOpen}
        onClose={() => setSwitchUserSheetOpen(false)}
        title="Switch Demo Account"
      >
        <div className="space-y-2.5">
          <p className="text-caption text-sb-text-subtle mb-3">
            Select a demo account to instantly experience SchedBridge from that role&apos;s perspective.
          </p>

          {(Object.keys(DEMO_USERS) as UserRole[]).map((roleKey) => {
            const demo = DEMO_USERS[roleKey];
            const isCurrent = currentUser.role === roleKey;

            return (
              <div
                key={roleKey}
                data-testid={`switch-user-role-${roleKey}`}
                onClick={() => handleRoleSelect(roleKey)}
                className={`p-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                  isCurrent
                    ? 'border-sb-navy bg-sb-bg shadow-sm'
                    : 'border-sb-border bg-white hover:border-sb-border-strong'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-sb-navy text-white text-caption font-bold flex items-center justify-center">
                    {demo.name[0]}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-caption font-bold text-sb-ink">{demo.name}</span>
                      <span className="text-[10px] uppercase font-bold text-sb-navy bg-slate-100 px-1.5 py-0.2 rounded">
                        {demo.role}
                      </span>
                    </div>
                    <span className="text-[11px] text-sb-text-subtle block">
                      {demo.title} · {demo.employeeId}
                    </span>
                  </div>
                </div>

                {isCurrent && <Check className="w-4 h-4 text-sb-navy" />}
              </div>
            );
          })}
        </div>
      </Sheet>

      {/* Switch Project Sheet */}
      <Sheet
        isOpen={switchProjectSheetOpen}
        onClose={() => setSwitchProjectSheetOpen(false)}
        title="Switch Active Project"
      >
        <div className="space-y-2.5">
          {projects.map((proj) => {
            const isActive = proj.id === activeProjectId;
            return (
              <div
                key={proj.id}
                data-testid={`switch-project-${proj.id}`}
                onClick={() => {
                  setActiveProjectId(proj.id);
                  setSwitchProjectSheetOpen(false);
                }}
                className={`p-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                  isActive
                    ? 'border-sb-navy bg-sb-bg shadow-sm'
                    : 'border-sb-border bg-white hover:border-sb-border-strong'
                }`}
              >
                <div>
                  <span className="text-caption font-bold text-sb-ink block">{proj.name}</span>
                  <span className="text-[11px] text-sb-text-subtle">
                    Data Date: {proj.dataDate} · Physical: {proj.physicalProgress}%
                  </span>
                </div>
                {isActive && <Check className="w-4 h-4 text-sb-navy" />}
              </div>
            );
          })}
        </div>
      </Sheet>

      {/* Sign Out Confirmation Dialog */}
      {signOutDialogOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div
            data-testid="sign-out-dialog"
            className="bg-white rounded-2xl max-w-sm w-full p-5 space-y-4 shadow-xl border border-sb-border animate-in zoom-in-95 duration-150"
          >
            <div className="space-y-1">
              <h3 className="text-body font-bold text-sb-ink">Sign Out of SchedBridge?</h3>
              <p className="text-caption text-sb-text-subtle">
                You will return to the welcome screen. Your local demo data and simulated states will remain saved.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                data-testid="cancel-sign-out-btn"
                onClick={() => setSignOutDialogOpen(false)}
                className="px-4 py-2 text-caption font-medium border border-sb-border rounded-lg bg-white hover:bg-sb-bg text-sb-ink transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                data-testid="confirm-sign-out-btn"
                onClick={handleSignOut}
                className="px-4 py-2 text-caption font-semibold bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
