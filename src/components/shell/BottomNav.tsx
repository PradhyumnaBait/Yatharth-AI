'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
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
  Settings,
  Download,
  Shield,
} from 'lucide-react';
import { useAuthStore, UserRole } from '@/store/auth';
import { IngestSheet } from '@/components/ingest/IngestSheet';

export interface BottomNavProps {
  onCenterAction?: () => void;
  className?: string;
  'data-testid'?: string;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  onCenterAction,
  className = '',
  'data-testid': testId = 'bottom-nav',
}) => {
  const pathname = usePathname();
  const { user } = useAuthStore();
  const role: UserRole = user?.role || 'supervisor';
  const [ingestSheetOpen, setIngestSheetOpen] = useState(false);

  // Slot 1: Home/Overview
  let slot1 = { label: 'Home', href: '/home', icon: Home };
  if (role === 'admin') {
    slot1 = { label: 'Users', href: '/admin/users', icon: Users };
  }

  // Slot 2 configuration
  let slot2 = { label: 'Reports', href: '/reports', icon: FileText };
  if (role === 'planner') {
    slot2 = { label: 'Review', href: '/workbench', icon: Briefcase };
  } else if (role === 'pm') {
    slot2 = { label: 'Analytics', href: '/analytics', icon: BarChart2 };
  } else if (role === 'admin') {
    slot2 = { label: 'Projects', href: '/admin/projects', icon: Layers };
  }

  // Center button configuration
  let centerConfig = {
    label: 'Capture',
    href: '/capture',
    icon: Mic,
  };
  if (role === 'planner') {
    centerConfig = {
      label: 'Ingest',
      href: '/ingest/xer',
      icon: Plus,
    };
  } else if (role === 'pm') {
    centerConfig = {
      label: 'Ask AI',
      href: '/ask',
      icon: MessageSquare,
    };
  } else if (role === 'admin') {
    centerConfig = {
      label: 'Add',
      href: '/admin/users',
      icon: Plus,
    };
  }

  // Slot 4 configuration
  let slot4 = { label: 'Schedule', href: '/schedule', icon: Calendar };
  if (role === 'admin') {
    slot4 = { label: 'Settings', href: '/settings', icon: Settings };
  }

  // Slot 5 configuration
  let slot5 = { label: 'Profile', href: '/profile', icon: User };
  if (role === 'planner') {
    slot5 = { label: 'Export', href: '/export', icon: Download };
  } else if (role === 'pm') {
    slot5 = { label: 'Audit', href: '/audit', icon: Shield };
  }

  const navItems = [
    slot1,
    slot2,
    null, // Placeholder for center raised button
    slot4,
    slot5,
  ];

  const CenterIcon = centerConfig.icon;

  return (
    <nav
      data-testid={testId}
      className={`fixed bottom-0 left-0 right-0 z-40 max-w-md mx-auto w-full bg-sb-white border-t border-sb-border shadow-e2 pb-safe ${className}`}
    >
      <div className="relative h-16 flex items-center justify-around px-2">
        {navItems.map((item) => {
          if (!item) {
            // Raised 64px Navy Center Button
            return (
              <div key="center-slot" className="relative -top-5 flex flex-col items-center" data-testid="bottom-nav-center-btn">
                <Link
                  href={centerConfig.href}
                  onClick={(e) => {
                    if (onCenterAction) {
                      e.preventDefault();
                      onCenterAction();
                    } else if (role === 'planner') {
                      e.preventDefault();
                      setIngestSheetOpen(true);
                    }
                  }}
                  data-testid="bottom-nav-center-action"
                  aria-label={centerConfig.label}
                  className="w-16 h-16 rounded-full bg-sb-navy text-sb-white flex items-center justify-center ring-[6px] ring-sb-white shadow-e3 hover:bg-sb-navy-pressed active:scale-95 transition-transform"
                >
                  <CenterIcon className="w-7 h-7 text-sb-white" strokeWidth={2} />
                </Link>
              </div>
            );
          }

          const isActive =
            item.href === '/home'
              ? pathname === '/home'
              : pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
          const isSecondary = item.label === 'Profile' || item.label === 'Settings';
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              data-testid={`${testId}-${item.label.toLowerCase()}`}
              className={`flex-1 flex flex-col items-center justify-center py-1 transition-colors ${
                isActive
                  ? 'text-sb-navy'
                  : isSecondary
                  ? 'text-sb-ink-3/80 hover:text-sb-navy'
                  : 'text-sb-ink-3 hover:text-sb-ink'
              }`}
            >
              <Icon
                className={`${isSecondary ? 'w-4 h-4' : 'w-5 h-5'}`}
                strokeWidth={isActive ? 2 : 1.5}
              />
              <span
                className={`mt-0.5 tracking-tight ${
                  isSecondary ? 'text-[9px]' : 'text-[10px]'
                } ${isActive ? 'font-bold text-sb-navy' : 'font-normal'}`}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>

      {/* Ingest Sheet for Planner */}
      <IngestSheet
        open={ingestSheetOpen}
        onOpenChange={setIngestSheetOpen}
      />
    </nav>
  );
};
