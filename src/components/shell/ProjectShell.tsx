'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { PageHeader } from './PageHeader';
import { UnderlineTabs, TabItem } from '../ui/UnderlineTabs';
import { ProjectMoreSheet } from '../project/ProjectMoreSheet';
import { useActiveProject } from '@/store/project';

export interface ProjectShellProps {
  projectName?: string;
  subtitle?: string;
  heroImageSrc?: string;
  heroCaption?: string;
  tabs: TabItem[];
  activeTabId: string;
  onTabChange: (tabId: string) => void;
  children: React.ReactNode;
  className?: string;
  'data-testid'?: string;
}

export const ProjectShell: React.FC<ProjectShellProps> = ({
  projectName = 'Kandla–Panipat Pipeline — Package 3',
  subtitle = '10 km execution package · KP 178.0–188.0',
  heroImageSrc = '/images/refinery-pipes.jpg',
  heroCaption = 'Refinery Package 03 — Section 4B',
  tabs,
  activeTabId,
  onTabChange,
  children,
  className = '',
  'data-testid': testId = 'project-shell',
}) => {
  const [showMoreSheet, setShowMoreSheet] = useState(false);
  const activeProject = useActiveProject();

  return (
    <div data-testid={testId} className={`min-h-full bg-sb-bg flex flex-col ${className}`}>
      {/* Project Header */}
      <PageHeader
        variant="project"
        projectName={projectName}
        subtitle={subtitle}
        onMoreClick={() => setShowMoreSheet(true)}
      />

      {/* Hero Photo with Flat Scrim & Caption */}
      <div className="relative w-full h-[150px] sm:h-[180px] bg-sb-navy flex-shrink-0">
        <Image
          src={heroImageSrc}
          alt={projectName}
          fill
          priority
          sizes="(max-width: 450px) 100vw, 500px"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-sb-scrim" />
        {heroCaption && (
          <div
            data-testid="hero-caption"
            className="absolute bottom-6 right-3 text-[11px] font-mono text-sb-white/90 bg-sb-navy/80 px-2.5 py-1 rounded-[6px] shadow-sm select-none"
          >
            {heroCaption}
          </div>
        )}
      </div>

      {/* White Panel Overlapping the Photo by 24px with Top Radius 28px */}
      <div className="relative -mt-6 flex-1 bg-sb-white rounded-t-[28px] shadow-e2 flex flex-col border-t border-sb-border overflow-hidden">
        {/* Navigation Tabs */}
        <div className="px-4 pt-2 bg-sb-white border-b border-sb-border">
          <UnderlineTabs
            tabs={tabs}
            activeId={activeTabId}
            onChange={onTabChange}
          />
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 p-4 overflow-y-auto bg-sb-bg pb-20">
          {children}
        </div>
      </div>

      {/* More Options Sheet */}
      <ProjectMoreSheet
        open={showMoreSheet}
        onOpenChange={setShowMoreSheet}
        project={activeProject}
      />
    </div>
  );
};

