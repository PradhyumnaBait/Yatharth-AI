'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Bell, Search, MoreHorizontal } from 'lucide-react';
import { Avatar } from '../ui/Avatar';
import { useAuthStore } from '@/store/auth';

export type HeaderVariant = 'home' | 'back' | 'project';

export interface PageHeaderProps {
  variant?: HeaderVariant;
  title?: string;
  subtitle?: React.ReactNode;
  projectName?: string;
  hasUnreadNotifications?: boolean;
  onSearchClick?: () => void;
  onNotificationsClick?: () => void;
  onMoreClick?: () => void;
  onProjectClick?: () => void;
  rightAction?: React.ReactNode;
  className?: string;
  'data-testid'?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  variant = 'home',
  title = 'SchedBridge AI',
  subtitle,
  projectName = 'Kandla–Panipat Pipeline — Package 3',
  hasUnreadNotifications = true,
  onSearchClick,
  onNotificationsClick,
  onProjectClick,
  onMoreClick,
  rightAction,
  className = '',
  'data-testid': testId = 'page-header',
}) => {
  const router = useRouter();
  const { user } = useAuthStore();

  const handleNotifications = onNotificationsClick || (() => router.push('/notifications'));
  const handleSearch = onSearchClick || (() => router.push('/search'));
  const handleProjectClick = onProjectClick || (() => router.push('/select-project'));

  if (variant === 'home') {
    return (
      <header
        data-testid={`${testId}-home`}
        className={`w-full flex items-center justify-between py-3 px-4 bg-sb-bg select-none ${className}`}
      >
        {/* Avatar + Greeting */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            data-testid={`${testId}-avatar-btn`}
            onClick={() => router.push('/profile')}
            className="focus-visible:outline focus-visible:outline-2 focus-visible:outline-sb-navy rounded-full active:scale-95 transition-transform"
            aria-label="Profile"
          >
            <Avatar
              name={user?.name || 'Rahul Patil'}
              src={user?.avatarUrl}
              size="md"
            />
          </button>
          <div className="min-w-0">
            <div className="text-caption text-sb-ink-3">Hello,</div>
            <div className="text-callout font-bold text-sb-navy truncate">
              {user?.name || 'Rahul Patil'}
            </div>
            <button
              type="button"
              data-testid="project-switcher-btn"
              onClick={handleProjectClick}
              className="text-left text-caption text-sb-ink-3 hover:text-sb-navy truncate -mt-0.5 flex items-center gap-1 group focus-visible:outline focus-visible:outline-1 focus-visible:outline-sb-navy rounded"
              title="Switch project"
            >
              <span className="truncate group-hover:underline">{projectName}</span>
              <span className="text-[10px] opacity-70 group-hover:opacity-100">▾</span>
            </button>
          </div>
        </div>

        {/* Bell with red unread dot */}
        <button
          type="button"
          data-testid={`${testId}-bell`}
          onClick={handleNotifications}
          aria-label="Notifications"
          className="relative w-11 h-11 rounded-full flex items-center justify-center text-sb-ink hover:bg-sb-white/60 active:bg-sb-navy-tint transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-sb-navy"
        >
          <Bell className="w-5 h-5" strokeWidth={1.5} />
          {hasUnreadNotifications && (
            <span
              data-testid={`${testId}-unread-dot`}
              className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-sb-critical ring-2 ring-sb-bg"
            />
          )}
        </button>
      </header>
    );
  }

  if (variant === 'project') {
    return (
      <header
        data-testid={`${testId}-project`}
        className={`w-full flex items-center justify-between py-3 px-4 bg-sb-white border-b border-sb-border select-none ${className}`}
      >
        <div className="flex items-center gap-2 min-w-0">
          <button
            type="button"
            data-testid={`${testId}-back-btn`}
            onClick={() => router.back()}
            aria-label="Back"
            className="w-10 h-10 -ml-1 rounded-full flex items-center justify-center text-sb-navy hover:bg-sb-navy-tint transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-sb-navy"
          >
            <ArrowLeft className="w-5 h-5" strokeWidth={2} />
          </button>
          <div className="min-w-0">
            <h1 className="text-callout font-bold text-sb-navy truncate">
              {projectName}
            </h1>
            <div className="text-caption text-sb-ink-3 truncate">
              {subtitle || '10 km execution package'}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            type="button"
            onClick={handleSearch}
            aria-label="Search"
            className="w-10 h-10 rounded-full flex items-center justify-center text-sb-ink hover:bg-sb-navy-tint transition-colors"
          >
            <Search className="w-5 h-5" strokeWidth={1.5} />
          </button>
          <button
            type="button"
            onClick={handleNotifications}
            aria-label="Notifications"
            className="relative w-10 h-10 rounded-full flex items-center justify-center text-sb-ink hover:bg-sb-navy-tint transition-colors"
          >
            <Bell className="w-5 h-5" strokeWidth={1.5} />
            {hasUnreadNotifications && (
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-sb-critical ring-2 ring-sb-white" />
            )}
          </button>
          <button
            type="button"
            onClick={onMoreClick}
            aria-label="More options"
            className="w-10 h-10 rounded-full flex items-center justify-center text-sb-ink hover:bg-sb-navy-tint transition-colors"
          >
            <MoreHorizontal className="w-5 h-5" strokeWidth={1.5} />
          </button>
        </div>
      </header>
    );
  }

  // Variant: Back
  return (
    <header
      data-testid={`${testId}-back`}
      className={`w-full flex items-center justify-between py-3 px-4 bg-sb-white border-b border-sb-border select-none ${className}`}
    >
      <div className="flex items-center gap-2 min-w-0">
        <button
          type="button"
          data-testid={`${testId}-back-btn`}
          onClick={() => router.back()}
          aria-label="Back"
          className="w-10 h-10 -ml-1 rounded-full flex items-center justify-center text-sb-navy hover:bg-sb-navy-tint transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-sb-navy"
        >
          <ArrowLeft className="w-5 h-5" strokeWidth={2} />
        </button>
        <div className="min-w-0">
          <h1 className="text-title-3 font-bold text-sb-navy truncate">
            {title}
          </h1>
          {subtitle && (
            <div className="text-caption text-sb-ink-3 truncate">
              {subtitle}
            </div>
          )}
        </div>
      </div>

      {rightAction && <div className="flex items-center">{rightAction}</div>}
    </header>
  );
};
