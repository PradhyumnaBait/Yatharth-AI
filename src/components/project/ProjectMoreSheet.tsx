'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sheet } from '@/components/ui/Sheet';
import { FolderSync, Info, Download, Check, X } from 'lucide-react';
import { Project } from '@/services/types';

export interface ProjectMoreSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project?: Project;
}

export const ProjectMoreSheet: React.FC<ProjectMoreSheetProps> = ({
  open,
  onOpenChange,
  project,
}) => {
  const router = useRouter();
  const [showInfo, setShowInfo] = useState(false);
  const [copiedExport, setCopiedExport] = useState(false);

  const handleSwitchProject = () => {
    onOpenChange(false);
    router.push('/select-project');
  };

  const handleExport = () => {
    setCopiedExport(true);
    setTimeout(() => {
      setCopiedExport(false);
      onOpenChange(false);
    }, 1500);
  };

  return (
    <Sheet
      open={open}
      onOpenChange={(val) => {
        if (!val) setShowInfo(false);
        onOpenChange(val);
      }}
      title={showInfo ? 'Project Metadata' : 'Project Options'}
      description={project?.name || 'Kandla–Panipat Pipeline — Package 3'}
      data-testid="project-more-sheet"
    >
      <div className="p-4 space-y-4">
        {showInfo ? (
          <div className="space-y-3" data-testid="project-info-modal">
            <div className="bg-sb-bg p-3 rounded-lg border border-sb-border space-y-2 text-callout">
              <div className="flex justify-between items-center py-1 border-b border-sb-border/60">
                <span className="text-sb-ink-3 text-caption">Project Name</span>
                <span className="font-semibold text-sb-navy text-right text-caption">
                  {project?.name || 'Kandla–Panipat Pipeline — Package 3'}
                </span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-sb-border/60">
                <span className="text-sb-ink-3 text-caption">Chainage Range</span>
                <span className="font-mono text-caption text-sb-ink">KP 178.000 – KP 188.000</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-sb-border/60">
                <span className="text-sb-ink-3 text-caption">Baseline Schedule</span>
                <span className="font-mono text-caption text-sb-ink">{project?.baselineVersion || 'P6 XER v3'}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-sb-border/60">
                <span className="text-sb-ink-3 text-caption">Client</span>
                <span className="text-caption text-sb-ink font-medium">Indian Oil Corporation Ltd. (IOCL)</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-sb-border/60">
                <span className="text-sb-ink-3 text-caption">EPC Contractor</span>
                <span className="text-caption text-sb-ink font-medium">Sterling Infra EPC</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-sb-ink-3 text-caption">Data Date</span>
                <span className="font-mono text-caption text-sb-ink">{project?.dataDate || '20 Sep 2026'}</span>
              </div>
            </div>

            <button
              type="button"
              data-testid="project-info-back-btn"
              onClick={() => setShowInfo(false)}
              className="w-full py-2.5 rounded-full border border-sb-border text-sb-navy font-semibold text-callout hover:bg-sb-bg active:bg-sb-navy-tint transition-colors"
            >
              Back to Options
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            <button
              type="button"
              data-testid="project-more-switch-btn"
              onClick={handleSwitchProject}
              className="w-full flex items-center gap-3 p-3.5 rounded-xl border border-sb-border bg-sb-white hover:bg-sb-bg active:bg-sb-navy-tint transition-colors text-left"
            >
              <div className="w-10 h-10 rounded-full bg-sb-navy-tint flex items-center justify-center text-sb-navy flex-shrink-0">
                <FolderSync className="w-5 h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-callout font-semibold text-sb-navy">Switch Project</div>
                <div className="text-caption text-sb-ink-3">Change active package or refinery facility</div>
              </div>
            </button>

            <button
              type="button"
              data-testid="project-more-info-btn"
              onClick={() => setShowInfo(true)}
              className="w-full flex items-center gap-3 p-3.5 rounded-xl border border-sb-border bg-sb-white hover:bg-sb-bg active:bg-sb-navy-tint transition-colors text-left"
            >
              <div className="w-10 h-10 rounded-full bg-sb-navy-tint flex items-center justify-center text-sb-navy flex-shrink-0">
                <Info className="w-5 h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-callout font-semibold text-sb-navy">Project Information</div>
                <div className="text-caption text-sb-ink-3">View client, baseline P6 XER version & coordinates</div>
              </div>
            </button>

            <button
              type="button"
              data-testid="project-more-export-btn"
              onClick={handleExport}
              disabled={copiedExport}
              className="w-full flex items-center gap-3 p-3.5 rounded-xl border border-sb-border bg-sb-white hover:bg-sb-bg active:bg-sb-navy-tint transition-colors text-left"
            >
              <div className="w-10 h-10 rounded-full bg-sb-navy-tint flex items-center justify-center text-sb-navy flex-shrink-0">
                {copiedExport ? <Check className="w-5 h-5 text-sb-verified" /> : <Download className="w-5 h-5" />}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-callout font-semibold text-sb-navy">
                  {copiedExport ? 'Exported Successfully' : 'Export Summary'}
                </div>
                <div className="text-caption text-sb-ink-3">Download package CSV progress & variance summary</div>
              </div>
            </button>
          </div>
        )}
      </div>
    </Sheet>
  );
};
