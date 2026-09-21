'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { ProjectShell } from '@/components/shell/ProjectShell';
import { ProjectOverviewTab } from '@/components/project/ProjectOverviewTab';
import { ProjectActivitiesTab } from '@/components/project/ProjectActivitiesTab';
import { ProjectEvidenceTab } from '@/components/project/ProjectEvidenceTab';
import { ProjectTeamsTab } from '@/components/project/ProjectTeamsTab';
import { useActiveProject, useProjectStore } from '@/store/project';
import { useActiveActivitiesCount } from '@/store/activities';

function ProjectDetailPageContent({ params }: { params: { id: string } }) {
  const searchParams = useSearchParams();
  const initialTab = searchParams.get('tab') || 'overview';

  const [activeTab, setActiveTab] = useState(initialTab);
  const [selectedPhase, setSelectedPhase] = useState<string | null>(null);

  const activeProject = useActiveProject();
  const setActiveProjectId = useProjectStore((s) => s.setActiveProjectId);
  const inProgressCount = useActiveActivitiesCount();

  // Sync project ID if path param matches one of the projects
  useEffect(() => {
    if (params.id && activeProject?.id !== params.id) {
      setActiveProjectId(params.id);
    }
  }, [params.id, activeProject?.id, setActiveProjectId]);

  const handleSelectPhase = (phaseName: string) => {
    setSelectedPhase(phaseName);
    setActiveTab('activities');
  };

  const handleClearPhase = () => {
    setSelectedPhase(null);
  };

  return (
    <ProjectShell
      projectName={activeProject?.name || 'Kandla–Panipat Pipeline — Package 3'}
      subtitle={activeProject?.description || '10 km execution package · KP 178.0–188.0'}
      heroImageSrc="/images/refinery-pipes.jpg"
      heroCaption="Refinery Package 03 — Section 4B"
      tabs={[
        { id: 'overview', label: 'Overview' },
        { id: 'activities', label: 'Activities', count: inProgressCount || 14 },
        { id: 'evidence', label: 'Evidence' },
        { id: 'teams', label: 'Teams' },
      ]}
      activeTabId={activeTab}
      onTabChange={(tabId) => {
        setActiveTab(tabId);
      }}
    >
      {activeTab === 'overview' && (
        <ProjectOverviewTab onSelectPhase={handleSelectPhase} />
      )}

      {activeTab === 'activities' && (
        <ProjectActivitiesTab
          selectedPhase={selectedPhase}
          onClearPhase={handleClearPhase}
        />
      )}

      {activeTab === 'evidence' && <ProjectEvidenceTab />}

      {activeTab === 'teams' && <ProjectTeamsTab />}
    </ProjectShell>
  );
}

export default function ProjectDetailPage({ params }: { params: { id: string } }) {
  return (
    <React.Suspense fallback={<div className="min-h-full bg-sb-bg" />}>
      <ProjectDetailPageContent params={params} />
    </React.Suspense>
  );
}
