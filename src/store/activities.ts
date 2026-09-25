'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Activity } from '@/services/types';
import { generateFullSchedule } from '@/mocks/fixtures/activities';

interface ActivitiesState {
  activities: Activity[];
  updateActivityProgress: (id: string, percent: number) => void;
  updateActivityStatus: (id: string, status: Activity['status']) => void;
  resetActivities: () => void;
}

export const useActivitiesStore = create<ActivitiesState>()(
  persist(
    (set) => ({
      activities: generateFullSchedule(),

      updateActivityProgress: (id: string, percent: number) => {
        set((state) => ({
          activities: state.activities.map((a) =>
            a.id === id
              ? {
                  ...a,
                  physicalPercent: percent,
                  status: percent >= 100 ? 'Complete' : percent > 0 ? 'In progress' : a.status,
                }
              : a
          ),
        }));
      },

      updateActivityStatus: (id: string, status: Activity['status']) => {
        set((state) => ({
          activities: state.activities.map((a) =>
            a.id === id ? { ...a, status } : a
          ),
        }));
      },

      resetActivities: () => {
        set({ activities: generateFullSchedule() });
      },
    }),
    {
      name: 'schedbridge-activities-store',
      version: 2,
      migrate: () => ({
        activities: generateFullSchedule(),
      }),
    }
  )
);

// Derived Selectors
export function useActiveActivitiesCount(): number {
  const activities = useActivitiesStore((state) => state.activities);
  return activities.filter((a) => a.status === 'In progress').length;
}

export function useActivity(id: string): Activity | undefined {
  const activities = useActivitiesStore((state) => state.activities);
  return activities.find((a) => a.id === id);
}
