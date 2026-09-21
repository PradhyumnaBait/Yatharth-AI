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
  BookOpen,
  User,
  Mic,
  Plus,
  MessageSquare,
  Shield,
  Layers,
  Settings,
} from 'lucide-react';
import { useAuthStore, UserRole } from '@/store/auth';
import { IngestSheet } from '@/components/ingest/IngestSheet';

export interface LeftNavRailProps {
  className?: string;
  'data-testid'?: string;
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

  // Slot 2 configuration
  let slot2 = { label: 'Reports', href: '/reports', icon: FileText };
  if (role === 'planner') {
    slot2 = { label: 'Workbench', href: '/workbench', icon: Briefcase };
  } else if (role === 'pm') {
    slot2 = { label: 'Analytics', href: '/analytics', icon: BarChart2 };
  } else if (role === 'admin') {
    slot2 = { label: 'Users', href: '/admin/users', icon: Users };
  }

  // Center button configuration
  let centerConfig = {
    label: 'Capture',
    href: '/capture',
    icon: Mic,
    isSheet: false,
  };
  if (role === 'planner') {
    centerConfig = {
      label: 'Ingest Data',
      href: '/ingest/excel',
      icon: Plus,
      isSheet: true,
    };
  } else if (role === 'pm') {
    centerConfig = {
      label: 'Ask Schedule',
      href: '/ask',
      icon: MessageSquare,
      isSheet: false,
    };
  } else if (role === 'admin') {
    centerConfig = {
      label: 'Admin Action',
      href: '/admin/users',
      icon: Plus,
      isSheet: false,
    };
  }

  // Slot 4 configuration
  let slot4 = { label: 'Schedule', href: '/schedule', icon: Calendar };
  if (role === 'admin') {
    slot4 = { label: 'Dictionary', href: '/admin/dictionary', icon: BookOpen };
  }

  const navItems = [
    { label: 'Home', href: '/home', icon: Home },
    slot2,
    slot4,
    { label: 'Profile', href: '/profile', icon: User },
    { label: 'Settings', href: '/settings', icon: Settings },
  ];

  const handleCenterClick = () => {
    if (centerConfig.isSheet) {
      setIngestSheetOpen(true);
    } else {
      router.push(centerConfig.href);
    }
  };

  const CenterIcon = centerConfig.icon;

  return (
    <>
      <aside
        data-testid={testId}
        className={`w-60 bg-white border-r border-sb-border flex flex-col justify-between py-6 px-4 select-none shrink-0 min-h-screen ${className}`}
      >
        {/* Brand Header */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 px-2">
            <div className="w-8 h-8 rounded-lg bg-sb-navy text-white flex items-center justify-center font-bold text-caption">
              SB
            </div>
            <div>
              <h1 className="text-body font-bold text-sb-ink tracking-tight">SchedBridge</h1>
              <span className="text-[10px] uppercase font-bold text-sb-text-subtle tracking-wider block">
                {role} Edition
              </span>
            </div>
          </div>

          {/* Primary Action Button */}
          <button
            type="button"
            data-testid="left-rail-center-action"
            onClick={handleCenterClick}
            className="w-full py-2.5 px-4 bg-sb-navy hover:bg-slate-800 text-white rounded-xl text-caption font-semibold flex items-center justify-center gap-2 shadow-sm transition-colors"
          >
            <CenterIcon className="w-4 h-4" />
            <span>{centerConfig.label}</span>
          </button>

          {/* Navigation Links (icon + label) */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const isActive = pathname.startsWith(item.href);
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  data-testid={`left-nav-${item.label.toLowerCase()}`}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-caption font-medium transition-colors ${
                    isActive
                      ? 'bg-sb-navy text-white font-semibold shadow-sm'
                      : 'text-sb-text-subtle hover:text-sb-ink hover:bg-sb-bg'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-sb-text-subtle'}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Card at bottom */}
        {user && (
          <div className="pt-4 border-t border-sb-border-subtle flex items-center gap-3 px-2">
            <div className="w-8 h-8 rounded-full bg-sb-bg-subtle text-sb-navy font-bold flex items-center justify-center text-caption">
              {user.name
                .split(' ')
                .map((n) => n[0])
                .join('')}
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-caption font-bold text-sb-ink block truncate">{user.name}</span>
              <span className="text-[10px] text-sb-text-subtle font-mono block truncate">
                {user.employeeId}
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
