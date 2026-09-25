'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { ProjectShell } from '@/components/shell/ProjectShell';
import { ProjectOverviewTab } from '@/components/project/ProjectOverviewTab';
import { ProjectActivitiesTab } from '@/components/project/ProjectActivitiesTab';
import { ProjectEvidenceTab } from '@/components/project/ProjectEvidenceTab';
import { ProjectTeamsTab } from '@/components/project/ProjectTeamsTab';
import { PageHeader } from '@/components/shell/PageHeader';
import { useProjectStore } from '@/store/project';
import { useActiveActivitiesCount } from '@/store/activities';
import { Loader2, AlertCircle } from 'lucide-react';

function ProjectDetailPageContent() {
  const router = useRouter();
  const rawParams = useParams();
  const projectId = (rawParams?.id as string) || '';
  const searchParams = useSearchParams();
  const initialTab = searchParams.get('tab') || 'overview';

  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState(initialTab);
  const [selectedPhase, setSelectedPhase] = useState<string | null>(null);

  const projects = useProjectStore((s) => s.projects);
  const activeProjectId = useProjectStore((s) => s.activeProjectId);
  const setActiveProjectId = useProjectStore((s) => s.setActiveProjectId);
  const inProgressCount = useActiveActivitiesCount();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Sync project ID if path param matches
  useEffect(() => {
    if (projectId && projects.some((p) => p.id === projectId) && activeProjectId !== projectId) {
      setActiveProjectId(projectId);
    }
  }, [projectId, projects, activeProjectId, setActiveProjectId]);

  if (!mounted) {
    return (
      <div className="flex flex-col min-h-screen bg-sb-bg p-6 items-center justify-center space-y-3">
        <Loader2 className="w-8 h-8 text-sb-navy animate-spin" />
        <p className="text-caption text-sb-ink-3">Loading project details...</p>
      </div>
    );
  }

  const project =
    projects.find((p) => p.id === projectId) ||
    projects.find((p) => p.id === activeProjectId) ||
    projects[0];

  if (!project) {
    return (
      <div className="flex flex-col min-h-full bg-sb-bg p-6 text-center space-y-4">
        <PageHeader variant="back" title="Project Not Found" />
        <div className="p-8 bg-sb-white rounded-2xl border border-sb-border max-w-md mx-auto space-y-3">
          <AlertCircle className="w-8 h-8 text-sb-critical mx-auto" />
          <h3 className="text-callout font-bold text-sb-navy">Project Not Found</h3>
          <p className="text-caption text-sb-ink-3">
            The requested project &quot;{projectId}&quot; does not exist or has been removed.
          </p>
          <button
            type="button"
            onClick={() => router.push('/home')}
            className="px-4 py-2 bg-sb-navy text-sb-white rounded-full text-caption font-semibold"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  const handleSelectPhase = (phaseName: string) => {
    setSelectedPhase(phaseName);
    setActiveTab('activities');
  };

  const handleClearPhase = () => {
    setSelectedPhase(null);
  };

  return (
    <ProjectShell
      projectName={project.name || 'Kandla–Panipat Pipeline — Package 3'}
      subtitle={project.description || '10 km execution package · KP 178.0–188.0'}
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

export default function ProjectDetailPage() {
  return (
    <React.Suspense
      fallback={
        <div className="flex flex-col min-h-screen bg-sb-bg p-6 items-center justify-center space-y-3">
          <Loader2 className="w-8 h-8 text-sb-navy animate-spin" />
          <p className="text-caption text-sb-ink-3">Loading project...</p>
        </div>
      }
    >
      <ProjectDetailPageContent />
    </React.Suspense>
  );
}
