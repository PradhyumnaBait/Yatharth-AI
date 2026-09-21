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
  BookOpen,
  User,
  Mic,
  Plus,
  MessageSquare,
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
  };
  if (role === 'planner') {
    centerConfig = {
      label: 'Ingest',
      href: '/ingest/excel',
      icon: Plus,
    };
  } else if (role === 'pm') {
    centerConfig = {
      label: 'Ask',
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
    slot4 = { label: 'Dictionary', href: '/admin/dictionary', icon: BookOpen };
  }

  const navItems = [
    { label: 'Home', href: '/home', icon: Home },
    slot2,
    null, // Placeholder for center raised button
    slot4,
    { label: 'Profile', href: '/profile', icon: User },
  ];

  const CenterIcon = centerConfig.icon;

  return (
    <nav
      data-testid={testId}
      className={`fixed bottom-0 left-0 right-0 z-40 max-w-md mx-auto w-full bg-sb-white border-t border-sb-border shadow-e2 pb-safe ${className}`}
    >
      <div className="relative h-16 flex items-center justify-around px-2">
        {navItems.map((item, index) => {
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

          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              data-testid={`${testId}-${item.label.toLowerCase()}`}
              className={`flex-1 flex flex-col items-center justify-center py-1 transition-colors ${
                isActive ? 'text-sb-navy' : 'text-sb-ink-3 hover:text-sb-ink'
              }`}
            >
              <Icon className="w-6 h-6" strokeWidth={isActive ? 2 : 1.5} />
              <span className={`text-[11px] mt-0.5 ${isActive ? 'font-semibold' : 'font-normal'}`}>
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
