'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Home,
  FileText,
  Briefcase,
  BarChart2,
  Users,
  Calendar,
  Layers,
  User,
  Mic,
  Plus,
  MessageSquare,
  Shield,
  Settings,
  Download,
  Flame,
  LucideIcon,
} from 'lucide-react';
import { useAuthStore, UserRole } from '@/store/auth';
import { IngestSheet } from '@/components/ingest/IngestSheet';

export interface LeftNavRailProps {
  className?: string;
  'data-testid'?: string;
}

interface NavItemConfig {
  label: string;
  href: string;
  icon: LucideIcon;
  badge?: string;
}

export const LeftNavRail: React.FC<LeftNavRailProps> = ({
  className = '',
  'data-testid': testId = 'left-nav-rail',
}) => {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuthStore();
  const role: UserRole = user?.role || 'planner';
  const [ingestSheetOpen, setIngestSheetOpen] = useState(false);

  // Pillar name and tag
  const pillarInfo = {
    supervisor: { name: 'FIELD', tag: 'Site Operations' },
    planner: { name: 'PLANNER', tag: 'Schedule Engineering' },
    pm: { name: 'MANAGEMENT', tag: 'Executive Controls' },
    admin: { name: 'ADMIN', tag: 'System Governance' },
  }[role] || { name: 'PLANNER', tag: 'Schedule Engineering' };

  // Primary Action Button Configuration
  const primaryActionConfig: {
    label: string;
    href: string;
    icon: LucideIcon;
    isSheet: boolean;
  } = {
    supervisor: {
      label: 'Quick Capture',
      href: '/capture',
      icon: Mic,
      isSheet: false,
    },
    planner: {
      label: 'Ingest Schedule / DPR',
      href: '/ingest/xer',
      icon: Plus,
      isSheet: true,
    },
    pm: {
      label: 'Ask AI Assistant',
      href: '/ask',
      icon: MessageSquare,
      isSheet: false,
    },
    admin: {
      label: 'Add Project / User',
      href: '/admin/users',
      icon: Plus,
      isSheet: false,
    },
  }[role] || {
    label: 'Quick Capture',
    href: '/capture',
    icon: Mic,
    isSheet: false,
  };

  // Navigation Links tailored to the 4 pillars (docs/NEW_IA_SITEMAP.md)
  let goldenNavItems: NavItemConfig[] = [];
  let secondaryNavItems: NavItemConfig[] = [];

  if (role === 'supervisor') {
    // FIELD Pillar: Core field capture & verification
    goldenNavItems = [
      { label: 'Home', href: '/home', icon: Home },
      { label: 'Capture', href: '/capture', icon: Mic },
      { label: 'Reports', href: '/reports', icon: FileText },
      { label: 'Schedule', href: '/schedule', icon: Calendar },
    ];
    secondaryNavItems = [
      { label: 'Profile', href: '/profile', icon: User },
      { label: 'Settings', href: '/settings', icon: Settings },
    ];
  } else if (role === 'planner') {
    // PLANNER Pillar: Review workbench, schedule engineering, delta export
    goldenNavItems = [
      { label: 'Review (Workbench)', href: '/workbench', icon: Briefcase },
      { label: 'Schedule (P6)', href: '/schedule', icon: Calendar },
      { label: 'Ingest Hub', href: '/ingest/xer', icon: Plus },
      { label: 'Export Deltas', href: '/export', icon: Download },
      { label: 'Overview', href: '/home', icon: Home },
    ];
    secondaryNavItems = [
      { label: 'Profile', href: '/profile', icon: User },
      { label: 'Settings', href: '/settings', icon: Settings },
    ];
  } else if (role === 'pm') {
    // MANAGEMENT Pillar: Analytics, delay attribution, master schedule, forensic audit
    goldenNavItems = [
      { label: 'Overview', href: '/home', icon: Home },
      { label: 'Analytics & S-Curve', href: '/analytics', icon: BarChart2 },
      { label: 'Delay Attribution', href: '/delays/monsoon', icon: Flame },
      { label: 'Master Schedule', href: '/schedule', icon: Calendar },
      { label: 'Audit Trail', href: '/audit', icon: Shield },
    ];
    secondaryNavItems = [
      { label: 'Profile', href: '/profile', icon: User },
      { label: 'Settings', href: '/settings', icon: Settings },
    ];
  } else {
    // ADMIN Pillar: User & Project governance, audit ledger
    goldenNavItems = [
      { label: 'User Governance', href: '/admin/users', icon: Users },
      { label: 'Projects & Packages', href: '/admin/projects', icon: Layers },
      { label: 'Audit Ledger', href: '/audit', icon: Shield },
      { label: 'Home Overview', href: '/home', icon: Home },
    ];
    secondaryNavItems = [
      { label: 'Rules & Settings', href: '/settings', icon: Settings },
      { label: 'Profile', href: '/profile', icon: User },
    ];
  }

  const handlePrimaryAction = () => {
    if (primaryActionConfig.isSheet) {
      setIngestSheetOpen(true);
    } else {
      router.push(primaryActionConfig.href);
    }
  };

  const PrimaryIcon = primaryActionConfig.icon;

  return (
    <>
      <aside
        data-testid={testId}
        className={`w-64 bg-sb-white border-r border-sb-border flex flex-col justify-between py-5 px-3.5 select-none shrink-0 min-h-screen ${className}`}
      >
        {/* Brand Header */}
        <div className="space-y-4">
          <div className="flex items-center gap-3 px-1.5">
            <div className="w-8 h-8 rounded-xl bg-sb-navy text-white flex items-center justify-center font-bold text-caption shadow-2xs">
              SB
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-body font-bold text-sb-navy tracking-tight">SchedBridge</h1>
                <span className="text-[10px] uppercase font-bold text-sb-navy bg-sb-navy-tint px-1.5 py-0.2 rounded font-mono">
                  {pillarInfo.name}
                </span>
              </div>
              <span className="text-[10px] text-sb-ink-3 font-mono block">
                {pillarInfo.tag}
              </span>
            </div>
          </div>

          {/* Primary Action Button */}
          <button
            type="button"
            data-testid="left-rail-center-action"
            onClick={handlePrimaryAction}
            className="w-full py-2.5 px-3.5 bg-sb-navy hover:bg-slate-800 text-white rounded-xl text-caption font-semibold flex items-center justify-center gap-2 shadow-sm transition-colors active:scale-[0.98]"
          >
            <PrimaryIcon className="w-4 h-4" />
            <span>{primaryActionConfig.label}</span>
          </button>

          {/* 1. Primary Golden Workflow Navigation Links */}
          <nav className="space-y-1 pt-1" aria-label={`${pillarInfo.name} Golden Workflow`}>
            {goldenNavItems.map((item) => {
              const isActive =
                item.href === '/home'
                  ? pathname === '/home'
                  : pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  data-testid={`left-nav-${item.label.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
                  className={`flex items-center justify-between px-3 py-2 rounded-xl text-caption transition-all ${
                    isActive
                      ? 'bg-sb-navy text-white font-semibold shadow-2xs'
                      : 'text-sb-ink-2 font-medium hover:text-sb-navy hover:bg-sb-bg'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-sb-ink-3'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`text-[10px] font-mono px-1.5 py-0.2 rounded font-bold ${
                        isActive ? 'bg-white/20 text-white' : 'bg-sb-bg text-sb-navy'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* 2. Visually Secondary Utility Navigation (Smaller Footprint) */}
          <div className="pt-3 border-t border-sb-border/60">
            <div className="px-2 pb-1 text-[10px] font-mono uppercase font-bold text-sb-ink-3/80 tracking-wider">
              Preferences & System
            </div>
            <nav className="space-y-0.5" aria-label="Secondary Navigation">
              {secondaryNavItems.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href);
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    data-testid={`left-nav-${item.label.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
                    className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-[12px] transition-colors ${
                      isActive
                        ? 'bg-slate-100 text-sb-navy font-semibold'
                        : 'text-sb-ink-3 hover:text-sb-navy hover:bg-sb-bg/70'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-sb-navy' : 'text-sb-ink-3'}`} />
                      <span>{item.label}</span>
                    </div>
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>

        {/* User Card at bottom */}
        {user && (
          <div className="pt-4 border-t border-sb-border-subtle flex items-center gap-3 px-2">
            <div className="w-8 h-8 rounded-full bg-sb-navy text-white font-bold flex items-center justify-center text-caption shrink-0">
              {user.name
                .split(' ')
                .map((n) => n[0])
                .join('')}
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-caption font-bold text-sb-ink block truncate">{user.name}</span>
              <span className="text-[10px] text-sb-text-subtle font-mono block truncate">
                {user.employeeId} · {user.role.toUpperCase()}
              </span>
            </div>
          </div>
        )}
      </aside>

      {/* Ingest Sheet for Planner */}
      <IngestSheet open={ingestSheetOpen} onOpenChange={setIngestSheetOpen} />
    </>
  );
};
