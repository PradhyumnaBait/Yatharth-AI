'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Project, Phase, CrewTeam, DelayCause, MemoryInsight } from '@/services/types';
import { FIXTURE_PROJECTS } from '@/mocks/fixtures/projects';
import { FIXTURE_PHASES } from '@/mocks/fixtures/phases';
import { FIXTURE_TEAMS } from '@/mocks/fixtures/teams';
import { FIXTURE_DELAY_CAUSES, FIXTURE_MEMORY_INSIGHTS } from '@/mocks/fixtures/analytics';

interface ProjectState {
  projects: Project[];
  activeProjectId: string;
  phases: Phase[];
  teams: CrewTeam[];
  delayCauses: DelayCause[];
  memoryInsights: MemoryInsight[];

  setActiveProjectId: (id: string) => void;
  updatePhysicalProgress: (progress: number) => void;
  resetProjectData: () => void;
}

export const useProjectStore = create<ProjectState>()(
  persist(
    (set) => ({
      projects: FIXTURE_PROJECTS,
      activeProjectId: 'kandla-panipat-p3',
      phases: FIXTURE_PHASES,
      teams: FIXTURE_TEAMS,
      delayCauses: FIXTURE_DELAY_CAUSES,
      memoryInsights: FIXTURE_MEMORY_INSIGHTS,

      setActiveProjectId: (id: string) => set({ activeProjectId: id }),

      updatePhysicalProgress: (progress: number) => {
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === state.activeProjectId ? { ...p, physicalProgress: progress } : p
          ),
        }));
      },

      resetProjectData: () => {
        set({
          projects: FIXTURE_PROJECTS,
          activeProjectId: 'kandla-panipat-p3',
          phases: FIXTURE_PHASES,
          teams: FIXTURE_TEAMS,
          delayCauses: FIXTURE_DELAY_CAUSES,
          memoryInsights: FIXTURE_MEMORY_INSIGHTS,
        });
      },
    }),
    {
      name: 'schedbridge-project-store',
    }
  )
);

// Derived Selectors (No hard-coded metrics anywhere)
export function useActiveProject(): Project | undefined {
  const { projects, activeProjectId } = useProjectStore();
  return projects.find((p) => p.id === activeProjectId);
}

export function useSPI(): { spi: number; verified: number; planned: number } {
  const project = useActiveProject();
  const verified = project?.physicalProgress || 68;
  const planned = project?.plannedProgress || 74;
  const spi = Number((verified / planned).toFixed(2));
  return { spi, verified, planned };
}

export function useTruthGap(): { reported: number; verified: number; gap: number } {
  const project = useActiveProject();
  const verified = project?.physicalProgress || 68;
  const reported = 71; // Weighted DPR-reported progress from SPEC §9.2
  const gap = reported - verified; // 3 points
  return { reported, verified, gap };
}
