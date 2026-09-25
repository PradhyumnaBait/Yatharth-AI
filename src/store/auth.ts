'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type UserRole = 'supervisor' | 'planner' | 'pm' | 'admin';

export interface UserProfile {
  id: string;
  name: string;
  title: string;
  employeeId: string;
  role: UserRole;
  organization: string;
  avatarUrl?: string;
  currentProjectId: string;
}

export const DEMO_USERS: Record<UserRole, UserProfile> = {
  supervisor: {
    id: 'user-rahul',
    name: 'Rahul Patil',
    title: 'Field Supervisor',
    employeeId: 'SUP-0412',
    role: 'supervisor',
    organization: 'Sterling Infra EPC',
    avatarUrl: '/images/avatar-rahul.jpg',
    currentProjectId: 'kandla-panipat-p3',
  },
  planner: {
    id: 'user-meera',
    name: 'Meera Nair',
    title: 'Project Controls Planner',
    employeeId: 'PLN-0107',
    role: 'planner',
    organization: 'Sterling Infra EPC',
    avatarUrl: undefined, // Needs human to supply real photo of Meera Nair
    currentProjectId: 'kandla-panipat-p3',
  },
  pm: {
    id: 'user-arvind',
    name: 'Arvind Deshmukh',
    title: 'Project Manager',
    employeeId: 'PM-0031',
    role: 'pm',
    organization: "Owner's Project Team",
    avatarUrl: undefined, // Needs human to supply real photo of Arvind Deshmukh
    currentProjectId: 'kandla-panipat-p3',
  },
  admin: {
    id: 'user-sana',
    name: 'Sana Qureshi',
    title: 'Project Admin',
    employeeId: 'ADM-0002',
    role: 'admin',
    organization: 'Sterling Infra EPC',
    avatarUrl: undefined, // Needs human to supply real photo of Sana Qureshi
    currentProjectId: 'kandla-panipat-p3',
  },
};

export interface AccessRequest {
  id: string;
  name: string;
  contact: string;
  organization: string;
  projectId: string;
  role: UserRole;
  time: string;
}

interface AuthState {
  user: UserProfile | null;
  isAuthenticated: boolean;
  activeProjectId: string;
  hasSeenOnboarding: boolean;
  hasSeenPermissionsPrimer: boolean;
  failedAttempts: number;
  lockoutUntil: number | null;
  accessRequests: AccessRequest[];
  approveAccessRequest: (id: string) => void;
  rejectAccessRequest: (id: string) => void;
  setUser: (user: UserProfile | null) => void;
  setRole: (role: UserRole) => void;
  setActiveProject: (projectId: string) => void;
  setHasSeenOnboarding: (seen: boolean) => void;
  setHasSeenPermissionsPrimer: (seen: boolean) => void;
  recordFailedAttempt: () => { locked: boolean; remainingAttempts: number; lockoutSeconds: number };
  resetLockout: () => void;
  addAccessRequest: (req: Omit<AccessRequest, 'id' | 'time'>) => string;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null, // Start unauthenticated to showcase A1 Welcome & Auth screens A1-A8
      isAuthenticated: false,
      activeProjectId: 'kandla-panipat-p3',
      hasSeenOnboarding: false,
      hasSeenPermissionsPrimer: false,
      failedAttempts: 0,
      lockoutUntil: null,
      accessRequests: [
        {
          id: 'REQ-0086',
          name: 'Vikram Mehta',
          contact: 'SUP-0391',
          organization: 'Sterling Infra EPC',
          projectId: 'kandla-panipat-p3',
          role: 'supervisor',
          time: '10 min ago',
        },
        {
          id: 'REQ-0087',
          name: 'Pooja Sharma',
          contact: 'PLN-0142',
          organization: 'Sterling Infra EPC',
          projectId: 'kandla-panipat-p3',
          role: 'planner',
          time: '25 min ago',
        },
        {
          id: 'REQ-0088',
          name: 'Rajesh Gupta',
          contact: 'PM-0089',
          organization: "Owner's Project Team",
          projectId: 'kandla-panipat-p3',
          role: 'pm',
          time: '1 hour ago',
        },
        {
          id: 'REQ-0089',
          name: 'Anil Kumar',
          contact: 'SUP-0402',
          organization: 'Punj Lloyd Ltd',
          projectId: 'kandla-panipat-p3',
          role: 'supervisor',
          time: '2 hours ago',
        },
      ],
      approveAccessRequest: (id) =>
        set((state) => ({
          accessRequests: state.accessRequests.filter((r) => r.id !== id),
        })),
      rejectAccessRequest: (id) =>
        set((state) => ({
          accessRequests: state.accessRequests.filter((r) => r.id !== id),
        })),
      setUser: (user) =>
        set({
          user,
          isAuthenticated: !!user,
          failedAttempts: 0,
          lockoutUntil: null,
        }),
      setRole: (role) => {
        const demoUser = DEMO_USERS[role];
        set({
          user: demoUser,
          isAuthenticated: true,
          failedAttempts: 0,
          lockoutUntil: null,
        });
      },
      setActiveProject: (projectId) => set({ activeProjectId: projectId }),
      setHasSeenOnboarding: (seen) => set({ hasSeenOnboarding: seen }),
      setHasSeenPermissionsPrimer: (seen) => set({ hasSeenPermissionsPrimer: seen }),
      recordFailedAttempt: () => {
        const state = get();
        const nextAttempts = state.failedAttempts + 1;
        if (nextAttempts >= 3) {
          const lockoutSeconds = 30;
          const lockoutTime = Date.now() + lockoutSeconds * 1000;
          set({ failedAttempts: nextAttempts, lockoutUntil: lockoutTime });
          return { locked: true, remainingAttempts: 0, lockoutSeconds };
        } else {
          set({ failedAttempts: nextAttempts });
          return { locked: false, remainingAttempts: 3 - nextAttempts, lockoutSeconds: 0 };
        }
      },
      resetLockout: () => set({ failedAttempts: 0, lockoutUntil: null }),
      addAccessRequest: (req) => {
        const currentRequests = get().accessRequests;
        // Generate REQ-0087 or sequential
        const nextNum = 86 + currentRequests.length;
        const requestId = `REQ-${String(nextNum).padStart(4, '0')}`;
        const newEntry: AccessRequest = {
          ...req,
          id: requestId,
          time: 'Just now',
        };
        set({ accessRequests: [newEntry, ...currentRequests] });
        return requestId;
      },
      logout: () => set({ user: null, isAuthenticated: false }),
    }),
    {
      name: 'schedbridge-auth',
    }
  )
);
