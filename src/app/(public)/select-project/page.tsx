'use client';

import React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Calendar, Layers, ChevronRight } from 'lucide-react';
import { useProjectStore } from '@/store/project';
import { useAuthStore } from '@/store/auth';
import { useUiStore } from '@/store/ui';
import { TRANSLATIONS } from '@/lib/translations';

const PROJECT_THUMBS: Record<string, string> = {
  'kandla-panipat-p3': '/images/pipeline-trench.jpg',
  'duliajan-upgrade': '/images/hero-worker.jpg',
  'numaligarh-tank-farm': '/images/refinery-pipes.jpg',
};

export default function SelectProjectPage() {
  const router = useRouter();
  const { projects, activeProjectId, setActiveProjectId } = useProjectStore();
  const { setActiveProject, user } = useAuthStore();
  const { language } = useUiStore();
  const t = TRANSLATIONS[language]?.projectPicker || TRANSLATIONS.en.projectPicker;

  const handleSelectProject = (projectId: string) => {
    setActiveProjectId(projectId);
    setActiveProject(projectId);
    router.push('/home');
  };

  return (
    <div
      data-testid="select-project-screen-a7"
      className="relative w-full min-h-screen max-w-[390px] mx-auto bg-sb-bg flex flex-col justify-between p-6 select-none"
    >
      <div>
        {/* Top Header */}
        <div className="flex items-center gap-3 pt-2 mb-6">
          <button
            type="button"
            onClick={() => router.back()}
            data-testid="project-picker-back-btn"
            className="w-10 h-10 rounded-full bg-sb-white border border-sb-border text-sb-navy flex items-center justify-center shadow-e1 active:scale-95 transition-transform"
            aria-label="Back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <span className="text-callout font-semibold text-sb-navy">
            {t.title}
          </span>
        </div>

        {/* Headline */}
        <div className="mb-6">
          <h1 className="text-title-1 font-bold text-sb-navy tracking-tight mb-1">
            {t.title}
          </h1>
          <p className="text-body text-sb-ink-2">
            {t.subtitle}
          </p>
        </div>

        {/* Project Cards List */}
        <div className="space-y-3.5" data-testid="project-cards-list">
          {projects.map((proj) => {
            const isCurrent = proj.id === activeProjectId;
            const thumb = PROJECT_THUMBS[proj.id] || '/images/pipeline-trench.jpg';

            return (
              <button
                key={proj.id}
                type="button"
                onClick={() => handleSelectProject(proj.id)}
                data-testid={`project-card-${proj.id}`}
                className={`w-full p-4 rounded-[20px] border text-left transition-all bg-sb-white hover:bg-sb-bg group flex flex-col justify-between shadow-e1 ${
                  isCurrent
                    ? 'border-sb-navy ring-2 ring-sb-navy/20'
                    : 'border-sb-border'
                }`}
              >
                {/* Header row: thumbnail + title + role */}
                <div className="flex items-start gap-3.5 mb-3">
                  <div className="relative w-14 h-14 rounded-[12px] overflow-hidden shrink-0 bg-sb-navy-tint">
                    <Image
                      src={thumb}
                      alt={proj.name}
                      fill
                      sizes="56px"
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-sb-navy/20" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <h3 className="text-title-3 font-semibold text-sb-navy line-clamp-1 group-hover:text-sb-navy-pressed">
                        {proj.name}
                      </h3>
                      <ChevronRight className="w-4 h-4 text-sb-ink-3 group-hover:translate-x-0.5 transition-transform shrink-0" />
                    </div>

                    <p className="text-caption text-sb-ink-2 line-clamp-1 mt-0.5">
                      {proj.description}
                    </p>

                    <div className="text-[11px] font-medium text-sb-navy bg-sb-navy-tint px-2 py-0.5 rounded-full inline-block mt-1">
                      Role: {user?.title || 'Field Supervisor'}
                    </div>
                  </div>
                </div>

                {/* Progress bar + metrics row */}
                <div className="space-y-1.5 pt-2 border-t border-sb-border">
                  <div className="flex items-center justify-between text-caption">
                    <span className="font-semibold text-sb-navy">
                      {proj.physicalProgress}% Progress
                    </span>
                    <span className="text-sb-ink-3">
                      Planned: {proj.plannedProgress}%
                    </span>
                  </div>

                  {/* 6px navy bar on border track per SPEC §4.5 */}
                  <div className="w-full h-1.5 rounded-full bg-sb-border overflow-hidden">
                    <div
                      className="h-full bg-sb-navy rounded-full transition-all duration-300"
                      style={{ width: `${proj.physicalProgress}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-sb-ink-3 pt-1">
                    <span className="flex items-center gap-1 font-mono text-mono-s">
                      <Calendar className="w-3 h-3 text-sb-ink-3" />
                      {proj.dataDate}
                    </span>
                    <span className="flex items-center gap-1">
                      <Layers className="w-3 h-3 text-sb-ink-3" />
                      {proj.activeActivitiesCount} active activities
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="pt-6 pb-2 text-center">
        <span className="text-caption text-sb-ink-3">
          Tap a project to set active workspace
        </span>
      </div>
    </div>
  );
}
