'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/shell/PageHeader';
import { UnderlineTabs, TabItem } from '@/components/ui/UnderlineTabs';
import { useNotificationsStore, AppNotification } from '@/store/notifications';
import {
  Bell,
  MessageSquare,
  AlertTriangle,
  Flame,
  UserCheck,
  CheckCheck,
  ChevronRight,
  Info,
} from 'lucide-react';

export default function NotificationsPage() {
  const router = useRouter();
  const notifications = useNotificationsStore((s) => s.notifications);
  const markAsRead = useNotificationsStore((s) => s.markAsRead);
  const markAllAsRead = useNotificationsStore((s) => s.markAllAsRead);

  const [activeTab, setActiveTab] = useState<'all' | 'needs-action'>('all');

  const needsActionCount = useMemo(() => {
    return notifications.filter((n) => n.needsAction && !n.read).length;
  }, [notifications]);

  const tabs: TabItem[] = [
    { id: 'all', label: 'All', count: notifications.filter((n) => !n.read).length || undefined },
    { id: 'needs-action', label: 'Needs action', count: needsActionCount || undefined },
  ];

  const filteredNotifications = useMemo(() => {
    if (activeTab === 'needs-action') {
      return notifications.filter((n) => n.needsAction);
    }
    return notifications;
  }, [notifications, activeTab]);

  const handleNotificationClick = (notif: AppNotification) => {
    markAsRead(notif.id);
    if (notif.targetRoute) {
      router.push(notif.targetRoute);
    }
  };

  const getIcon = (category: AppNotification['category']) => {
    switch (category) {
      case 'question':
        return <MessageSquare className="w-4 h-4 text-sb-navy" />;
      case 'warning':
        return <Flame className="w-4 h-4 text-sb-critical" />;
      case 'alert':
        return <AlertTriangle className="w-4 h-4 text-sb-review-ink" />;
      case 'access':
        return <UserCheck className="w-4 h-4 text-sb-verified-ink" />;
      default:
        return <Info className="w-4 h-4 text-sb-navy" />;
    }
  };

  return (
    <div className="flex flex-col min-h-full bg-sb-bg pb-24" data-testid="notifications-screen-s1">
      {/* 1. Header */}
      <PageHeader
        variant="back"
        title="Notifications"
        subtitle="Action items & alerts"
        rightAction={
          <button
            type="button"
            data-testid="mark-all-read-btn"
            onClick={markAllAsRead}
            className="text-caption font-semibold text-sb-navy hover:underline flex items-center gap-1 mr-1"
          >
            <CheckCheck className="w-4 h-4" />
            <span>Mark all read</span>
          </button>
        }
      />

      {/* 2. Underline Tabs (All · Needs action) */}
      <div className="px-4 pt-2 bg-sb-bg">
        <UnderlineTabs
          tabs={tabs}
          activeId={activeTab}
          onChange={(id) => setActiveTab(id as 'all' | 'needs-action')}
        />
      </div>

      {/* 3. Notifications List */}
      <div className="p-4 space-y-2.5" data-testid="notifications-list">
        {filteredNotifications.length === 0 ? (
          <div className="p-8 bg-sb-white rounded-2xl border border-sb-border text-center space-y-2">
            <Bell className="w-8 h-8 text-sb-ink-3 mx-auto" />
            <div className="text-caption text-sb-ink-3 font-medium">
              {activeTab === 'needs-action' ? 'No actions required right now.' : 'No notifications.'}
            </div>
          </div>
        ) : (
          filteredNotifications.map((notif) => (
            <div
              key={notif.id}
              data-testid={`notification-item-${notif.id}`}
              onClick={() => handleNotificationClick(notif)}
              className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start gap-3 group shadow-sm ${
                notif.read
                  ? 'bg-sb-white border-sb-border text-sb-ink-2 hover:border-sb-navy/40'
                  : 'bg-sb-white border-sb-navy/30 text-sb-ink shadow-e1 hover:border-sb-navy'
              }`}
            >
              {/* Category Icon Badge */}
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                  notif.category === 'question'
                    ? 'bg-sb-navy-tint'
                    : notif.category === 'warning'
                    ? 'bg-sb-critical-tint'
                    : notif.category === 'alert'
                    ? 'bg-sb-review-tint'
                    : 'bg-sb-bg'
                }`}
              >
                {getIcon(notif.category)}
              </div>

              {/* Text content */}
              <div className="min-w-0 flex-1 space-y-0.5">
                <div className="flex items-center justify-between gap-2">
                  <div className="text-caption font-bold text-sb-navy truncate group-hover:text-sb-navy">
                    {notif.title}
                  </div>
                  {!notif.read && (
                    <span
                      data-testid={`unread-dot-${notif.id}`}
                      className="w-2 h-2 rounded-full bg-sb-critical shrink-0"
                    />
                  )}
                </div>

                <div className="text-[12px] text-sb-ink-2 line-clamp-2">
                  {notif.message}
                </div>

                <div className="text-[11px] font-mono text-sb-ink-3 pt-0.5">
                  {notif.time}
                </div>
              </div>

              <ChevronRight className="w-4 h-4 text-sb-ink-3 group-hover:text-sb-navy mt-3 shrink-0" />
            </div>
          ))
        )}
      </div>
    </div>
  );
}
