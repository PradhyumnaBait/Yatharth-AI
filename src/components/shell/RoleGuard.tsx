'use client';

import React, { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore, UserRole } from '@/store/auth';

interface RouteRule {
  pattern: RegExp;
  allowedRoles: UserRole[];
}

const ROUTE_RULES: RouteRule[] = [
  // Supervisor specific
  { pattern: /^\/capture(\/.*)?$/, allowedRoles: ['supervisor'] },
  { pattern: /^\/reports(\/.*)?$/, allowedRoles: ['supervisor'] },

  // Planner specific
  { pattern: /^\/workbench(\/.*)?$/, allowedRoles: ['planner'] },
  { pattern: /^\/export(\/.*)?$/, allowedRoles: ['planner'] },
  { pattern: /^\/ingest(\/.*)?$/, allowedRoles: ['planner'] },

  // PM specific
  { pattern: /^\/analytics(\/.*)?$/, allowedRoles: ['pm'] },
  { pattern: /^\/ask(\/.*)?$/, allowedRoles: ['pm'] },
  { pattern: /^\/delays(\/.*)?$/, allowedRoles: ['pm'] },

  // Admin specific
  { pattern: /^\/admin(\/.*)?$/, allowedRoles: ['admin'] },

  // Shared audit (Planner, PM, Admin)
  { pattern: /^\/audit(\/.*)?$/, allowedRoles: ['planner', 'pm', 'admin'] },
];

export interface RoleGuardProps {
  children: React.ReactNode;
}

export const RoleGuard: React.FC<RoleGuardProps> = ({ children }) => {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const role: UserRole = user?.role || 'supervisor';
  const [hasHydrated, setHasHydrated] = React.useState(false);

  useEffect(() => {
    // Sync with Zustand persist rehydration
    const unsub = useAuthStore.persist?.onFinishHydration?.(() => {
      setHasHydrated(true);
    });
    if (useAuthStore.persist?.hasHydrated?.()) {
      setHasHydrated(true);
    } else {
      setHasHydrated(true);
    }
    return () => unsub?.();
  }, []);

  useEffect(() => {
    if (!hasHydrated) return;

    // Public routes that bypass auth
    const isPublic =
      pathname.startsWith('/welcome') ||
      pathname.startsWith('/login') ||
      pathname.startsWith('/request-access') ||
      pathname.startsWith('/select-project') ||
      pathname.startsWith('/dev');

    if (!isAuthenticated && !isPublic) {
      router.replace('/welcome');
      return;
    }

    if (isAuthenticated) {
      for (const rule of ROUTE_RULES) {
        if (rule.pattern.test(pathname)) {
          if (!rule.allowedRoles.includes(role)) {
            // Unauthorized for this role -> Redirect to Home
            router.replace('/home');
            return;
          }
        }
      }
    }
  }, [hasHydrated, pathname, isAuthenticated, role, router]);

  return <>{children}</>;
};
