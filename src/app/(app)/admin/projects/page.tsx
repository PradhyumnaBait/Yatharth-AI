'use client';

import React, { useState } from 'react';
import { PageHeader } from '@/components/shell/PageHeader';
import { useProjectStore } from '@/store/project';
import { useUiStore } from '@/store/ui';
import { Sheet } from '@/components/ui/Sheet';
import { Project } from '@/services/types';
import {
  Layers,
  Calendar,
  Sliders,
  Archive,
  ChevronRight,
  Check,
  FileCheck,
  AlertTriangle,
} from 'lucide-react';

interface BaselineVersion {
  version: string;
  date: string;
  activitiesCount: number;
  importedBy: string;
  isActive: boolean;
}

const BASELINES: BaselineVersion[] = [
  { version: 'v3 (Current)', date: '15 Sep 2026', activitiesCount: 200, importedBy: 'Meera Nair (PLN-0107)', isActive: true },
  { version: 'v2', date: '01 Aug 2026', activitiesCount: 194, importedBy: 'Meera Nair (PLN-0107)', isActive: false },
  { version: 'v1 (Original)', date: '15 May 2026', activitiesCount: 185, importedBy: 'Meera Nair (PLN-0107)', isActive: false },
];

export default function AdminProjectsPage() {
  const projects = useProjectStore((s) => s.projects);
  const activeProjectId = useProjectStore((s) => s.activeProjectId);
  const setActiveProjectId = useProjectStore((s) => s.setActiveProjectId);

  const { autoAcceptThreshold, reviewThreshold, setAutoAcceptThreshold, setReviewThreshold, showToast } = useUiStore();

  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [detailSheetOpen, setDetailSheetOpen] = useState(false);
  const [archiveDialogOpen, setArchiveDialogOpen] = useState(false);

  const handleCardClick = (proj: Project) => {
    setSelectedProject(proj);
    setDetailSheetOpen(true);
  };

  const handleArchive = () => {
    if (!selectedProject) return;
    setArchiveDialogOpen(false);
    setDetailSheetOpen(false);
    showToast(`Project "${selectedProject.name}" archived.`);
  };

  return (
    <div className="flex flex-col min-h-full pb-8">
      <PageHeader variant="back" title="Projects & Baselines" />

      <div className="px-4 py-3 space-y-4">
        <div>
          <h3 className="text-body font-semibold text-sb-ink">Pipeline Packages ({projects.length})</h3>
          <p className="text-caption text-sb-text-muted">
            Manage project baselines, data dates, and threshold overrides
          </p>
        </div>

        {/* Project Cards List */}
        <div className="space-y-3">
          {projects.map((proj) => {
            const isActive = proj.id === activeProjectId;

            return (
              <div
                key={proj.id}
                data-testid={`project-card-${proj.id}`}
                onClick={() => handleCardClick(proj)}
                className={`p-4 rounded-card border transition-all cursor-pointer shadow-sm ${
                  isActive
                    ? 'border-sb-navy bg-white ring-1 ring-sb-navy'
                    : 'border-sb-border bg-white hover:border-sb-navy'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-body font-bold text-sb-ink">{proj.name}</h4>
                      {isActive && (
                        <span className="text-[10px] uppercase font-bold text-sb-navy bg-slate-100 px-1.5 py-0.2 rounded">
                          Active
                        </span>
                      )}
                    </div>
                    <p className="text-caption text-sb-text-subtle mt-0.5">{proj.description}</p>
                  </div>

                  <span className="font-mono text-mono-s font-semibold bg-sb-bg-subtle text-sb-navy px-2 py-0.5 rounded border border-sb-border">
                    {proj.baselineVersion}
                  </span>
                </div>

                <div className="flex items-center justify-between mt-3 pt-3 border-t border-sb-border-subtle text-caption text-sb-text-subtle">
                  <div className="flex items-center gap-4">
                    <span>Data Date: <strong className="font-mono text-sb-ink">{proj.dataDate}</strong></span>
                    <span>Progress: <strong className="font-mono text-sb-navy">{proj.physicalProgress}%</strong></span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-sb-text-subtle" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Project Detail Sheet */}
      <Sheet
        isOpen={detailSheetOpen}
        onClose={() => setDetailSheetOpen(false)}
        title={selectedProject ? selectedProject.name : 'Project Baselines'}
      >
        {selectedProject && (
          <div className="space-y-4">
            {/* Info Card */}
            <div className="bg-sb-bg-subtle p-3.5 rounded-card border border-sb-border space-y-1">
              <span className="text-[10px] font-mono text-sb-navy uppercase font-bold">
                Project Code: {selectedProject.id}
              </span>
              <h4 className="text-body font-bold text-sb-ink">{selectedProject.name}</h4>
              <p className="text-caption text-sb-text-subtle">
                Data Date: <strong className="text-sb-ink font-mono">{selectedProject.dataDate}</strong> · Physical Progress: <strong className="text-sb-navy font-mono">{selectedProject.physicalProgress}%</strong>
              </p>
            </div>

            {/* Baseline Versions */}
            <div>
              <h5 className="text-caption font-bold uppercase text-sb-text-subtle tracking-wider mb-2">
                Primavera P6 Baseline Versions (v1–v3)
              </h5>
              <div className="space-y-2">
                {BASELINES.map((b) => (
                  <div
                    key={b.version}
                    className={`p-3 border rounded-lg transition-colors ${
                      b.isActive ? 'border-sb-navy bg-white' : 'border-sb-border bg-sb-bg-subtle'
                    }`}
                  >
                    <div className="flex items-center justify-between text-caption mb-1">
                      <span className="font-bold text-sb-ink font-mono">{b.version}</span>
                      <span className="text-mono-s text-sb-text-subtle">{b.date}</span>
                    </div>
                    <div className="text-[11px] text-sb-text-muted flex items-center justify-between">
                      <span>{b.activitiesCount} activities · {b.importedBy}</span>
                      {b.isActive && (
                        <span className="text-sb-navy font-bold flex items-center gap-0.5">
                          <Check className="w-3 h-3" /> Active Baseline
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Matching Thresholds for this Project */}
            <div className="pt-2 border-t border-sb-border-subtle space-y-3">
              <h5 className="text-caption font-bold uppercase text-sb-text-subtle tracking-wider">
                Matching Threshold Overrides
              </h5>

              <div className="space-y-1">
                <div className="flex justify-between text-caption">
                  <span className="text-sb-ink font-medium">Auto-accept Threshold (≥)</span>
                  <span className="font-mono font-bold text-sb-verified">{autoAcceptThreshold}%</span>
                </div>
                <input
                  type="range"
                  min="70"
                  max="100"
                  value={autoAcceptThreshold}
                  onChange={(e) => setAutoAcceptThreshold(Number(e.target.value))}
                  className="w-full accent-sb-navy"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-caption">
                  <span className="text-sb-ink font-medium">Unmatched Threshold (&lt;)</span>
                  <span className="font-mono font-bold text-sb-critical">{reviewThreshold}%</span>
                </div>
                <input
                  type="range"
                  min="30"
                  max="70"
                  value={reviewThreshold}
                  onChange={(e) => setReviewThreshold(Number(e.target.value))}
                  className="w-full accent-sb-navy"
                />
              </div>
            </div>

            {/* Archive Action */}
            <div className="pt-3 border-t border-sb-border-subtle">
              <button
                type="button"
                data-testid="archive-project-btn"
                onClick={() => setArchiveDialogOpen(true)}
                className="w-full py-2.5 border border-red-200 rounded-lg bg-red-50 hover:bg-red-100 text-caption font-semibold text-red-700 flex items-center justify-center gap-1.5 transition-colors"
              >
                <Archive className="w-4 h-4 text-red-600" />
                Archive Project
              </button>
            </div>
          </div>
        )}
      </Sheet>

      {/* Archive Confirmation Dialog */}
      {archiveDialogOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div
            data-testid="archive-dialog"
            className="bg-white rounded-2xl max-w-sm w-full p-5 space-y-4 shadow-xl border border-sb-border animate-in zoom-in-95 duration-150"
          >
            <div className="space-y-1">
              <h3 className="text-body font-bold text-sb-ink">
                Archive {selectedProject?.name}?
              </h3>
              <p className="text-caption text-sb-text-subtle">
                Archiving will freeze all data and disable new field report ingestion. Existing audit records remain intact.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setArchiveDialogOpen(false)}
                className="px-4 py-2 text-caption font-medium border border-sb-border rounded-lg bg-white hover:bg-sb-bg text-sb-ink"
              >
                Cancel
              </button>
              <button
                type="button"
                data-testid="confirm-archive-btn"
                onClick={handleArchive}
                className="px-4 py-2 text-caption font-semibold bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Archive
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
