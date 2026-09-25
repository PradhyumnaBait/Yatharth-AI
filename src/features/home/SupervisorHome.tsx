'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { ChevronRight, Mic, CheckCircle2, AlertCircle } from 'lucide-react';
import { ProjectCard } from '@/components/domain/ProjectCard';
import { EventRow } from '@/components/domain/EventRow';
import { StatusPill } from '@/components/ui/StatusPill';
import { Button } from '@/components/ui/Button';
import { useEventsStore } from '@/store/events';
import { useProjectStore, useActiveProject } from '@/store/project';
import { useActivitiesStore, useActiveActivitiesCount } from '@/store/activities';
import { useTranslation } from '@/i18n/useTranslation';

export type SupervisorPill = 'all' | 'progress' | 'tasks' | 'evidence';

interface SupervisorHomeProps {
  activePill: SupervisorPill;
}

export const SupervisorHome: React.FC<SupervisorHomeProps> = ({ activePill }) => {
  const router = useRouter();
  const { t } = useTranslation();
  const project = useActiveProject();
  const phases = useProjectStore((state) => state.phases);
  const events = useEventsStore((state) => state.events);
  const activities = useActivitiesStore((state) => state.activities);
  const activeActivitiesCount = useActiveActivitiesCount();

  // Find reference events or today's top events
  const e2091 = events.find((e) => e.id === 'E-2091');
  const e2092 = events.find((e) => e.id === 'E-2092');

  // Work packages for Tasks tab (Assigned to Rahul Patil's crew)
  const assignedTasks = activities.slice(0, 5);

  // Evidence items for Evidence tab
  const evidenceEvents = events.slice(0, 6);

  if (activePill === 'progress') {
    return (
      <div data-testid="supervisor-progress-body" className="px-4 py-2 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-title-3 font-bold text-sb-navy">
            Phase Progress ({phases.length} Phases)
          </h2>
          <span className="text-caption text-sb-ink-3">Tap to view schedule</span>
        </div>

        <div className="space-y-2.5">
          {phases.map((phase) => (
            <button
              key={phase.id}
              type="button"
              data-testid={`phase-item-${phase.id}`}
              onClick={() => router.push(`/schedule?phase=${phase.id}`)}
              className="w-full bg-sb-white rounded-[16px] p-4 border border-sb-border shadow-e1 text-left transition-transform active:scale-[0.99] hover:border-sb-navy/30"
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="text-callout font-semibold text-sb-navy">{phase.name}</div>
                  <div className="text-caption text-sb-ink-3">Weight: {phase.weight}% of package</div>
                </div>
                <div className="text-right">
                  <div className="font-mono text-num-m font-semibold text-sb-navy">
                    {phase.verified}%
                  </div>
                  <div className="text-caption text-sb-ink-3">Planned: {phase.planned}%</div>
                </div>
              </div>

              {/* Progress bar with planned tick */}
              <div className="relative w-full h-2 bg-sb-border rounded-full overflow-hidden">
                <div
                  className="h-full bg-sb-navy rounded-full transition-all"
                  style={{ width: `${phase.verified}%` }}
                />
                <div
                  className="absolute top-0 bottom-0 w-1 bg-sb-ink-2 z-10"
                  style={{ left: `${phase.planned}%` }}
                  title={`Planned: ${phase.planned}%`}
                />
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (activePill === 'tasks') {
    return (
      <div data-testid="supervisor-tasks-body" className="px-4 py-2 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-title-3 font-bold text-sb-navy">Assigned Work Packages</h2>
          <span className="text-caption text-sb-ink-3">This Week</span>
        </div>

        <div className="space-y-2.5">
          {assignedTasks.map((task) => (
            <div
              key={task.id}
              data-testid={`task-item-${task.id}`}
              className="bg-sb-white rounded-[16px] p-4 border border-sb-border shadow-e1 flex items-center justify-between gap-3"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-mono-s font-semibold text-sb-navy bg-sb-navy-tint px-2 py-0.5 rounded">
                    {task.id}
                  </span>
                  <span className="text-caption text-sb-ink-3 truncate">{task.phaseName}</span>
                </div>
                <div className="text-callout font-semibold text-sb-navy truncate">{task.name}</div>
                <div className="text-caption text-sb-ink-3 mt-1 flex items-center gap-3">
                  <span>Planned: {task.plannedStart.slice(0, 10)}</span>
                  <span>{task.physicalPercent}% done</span>
                </div>
              </div>

              <Button
                variant="primary"
                size="sm"
                data-testid={`report-btn-${task.id}`}
                onClick={() => router.push(`/capture?activityId=${task.id}`)}
                className="flex-shrink-0"
              >
                Report
              </Button>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (activePill === 'evidence') {
    return (
      <div data-testid="supervisor-evidence-body" className="px-4 py-2 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-title-3 font-bold text-sb-navy">Today&apos;s Field Evidence</h2>
          <button
            type="button"
            onClick={() => router.push('/reports')}
            className="text-caption font-semibold text-sb-navy hover:underline"
          >
            See All
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          {evidenceEvents.map((evt) => (
            <div
              key={evt.id}
              data-testid={`evidence-card-${evt.id}`}
              onClick={() => router.push('/reports')}
              className="bg-sb-white rounded-[16px] p-3 border border-sb-border shadow-e1 flex flex-col justify-between cursor-pointer hover:border-sb-navy/30 transition-colors"
            >
              <div className="relative w-full h-24 rounded-[10px] overflow-hidden bg-sb-navy-tint mb-2 flex items-center justify-center">
                {evt.thumbnailUrl ? (
                  <Image
                    src={evt.thumbnailUrl}
                    alt={evt.rawText}
                    fill
                    sizes="160px"
                    className="object-cover"
                  />
                ) : (
                  <Mic className="w-8 h-8 text-sb-navy/40" />
                )}
                <div className="absolute top-1.5 right-1.5">
                  <StatusPill status={evt.status} />
                </div>
              </div>

              <div className="text-callout font-medium text-sb-navy line-clamp-2 text-xs mb-1">
                &ldquo;{evt.rawText}&rdquo;
              </div>

              <div className="flex items-center justify-between text-[11px] text-sb-ink-3 pt-1 border-t border-sb-border">
                <span>{evt.timestamp}</span>
                <span className="truncate">{evt.authorName}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Default: 'all' pill — Pixel match of Reference Screen 2!
  return (
    <div data-testid="supervisor-all-body" className="space-y-4 pb-16">
      {/* Active Project Section */}
      <section className="px-4">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-title-3 font-bold text-sb-navy">{t('home.activeProject')}</h2>
          <button
            type="button"
            data-testid="see-all-projects-btn"
            onClick={() => router.push('/select-project')}
            className="text-caption font-semibold text-sb-navy hover:underline"
          >
            {t('home.seeAll')}
          </button>
        </div>

        <ProjectCard
          title={project?.name || 'Kandla–Panipat Pipeline — Package 3'}
          progress={project?.physicalProgress ?? 68}
          plannedProgress={project?.plannedProgress ?? 74}
          dataDate={project?.dataDate || '20 Sep 2026'}
          activeActivitiesCount={activeActivitiesCount || 14}
          imageSrc="/images/pipeline-trench.jpg"
          onClick={() => router.push(`/project/${project?.id || 'kandla-panipat-p3'}`)}
        />
      </section>

      {/* Today's Events Section */}
      <section className="px-4">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-title-3 font-bold text-sb-navy">{t('home.todaysEvents')}</h2>
          <button
            type="button"
            data-testid="see-all-events-btn"
            onClick={() => router.push('/reports?tab=Today')}
            className="text-caption font-semibold text-sb-navy hover:underline"
          >
            {t('home.seeAll')}
          </button>
        </div>

        <div className="bg-sb-white rounded-[20px] p-2 border border-sb-border shadow-e1 divide-y divide-sb-border">
          {/* Row 1: Welding — Line 24-XX 08:42 AM */}
          <EventRow
            id="E-2091"
            title="Welding — Line 24-XX"
            timestamp="08:42 AM"
            status={e2091?.status || 'Verified'}
            thumbnailSrc="/images/thumb-welding.jpg"
            onClick={() => router.push('/reports')}
          />

          {/* Row 2: Trenching — KP 184.2 09:17 AM */}
          <EventRow
            id="E-2092"
            title="Trenching — KP 184.2"
            timestamp="09:17 AM"
            status={e2092?.status || 'Review'}
            thumbnailSrc="/images/thumb-trenching.jpg"
            onClick={() => router.push('/reports')}
          />
        </div>
      </section>
    </div>
  );
};
