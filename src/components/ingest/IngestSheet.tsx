'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sheet } from '@/components/ui/Sheet';
import {
  FileText,
  FileSpreadsheet,
  Calendar,
  Type,
  UploadCloud,
  ChevronRight,
} from 'lucide-react';

export interface IngestSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  'data-testid'?: string;
}

export const IngestSheet: React.FC<IngestSheetProps> = ({
  open,
  onOpenChange,
  'data-testid': testId = 'ingest-sheet',
}) => {
  const router = useRouter();
  const [isDragging, setIsDragging] = useState(false);

  const handleRoute = (path: string) => {
    onOpenChange(false);
    router.push(path);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    const name = file.name.toLowerCase();
    if (name.endsWith('.pdf')) {
      handleRoute('/ingest/dpr');
    } else if (name.endsWith('.xlsx') || name.endsWith('.csv')) {
      handleRoute('/ingest/excel');
    } else if (name.endsWith('.xer')) {
      handleRoute('/ingest/xer');
    }
  };

  return (
    <Sheet
      open={open}
      onOpenChange={onOpenChange}
      title="Ingest Progress & Baseline"
      description="Select an ingestion channel or drop a file anywhere."
      data-testid={testId}
    >
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className="p-4 space-y-3"
      >
        {/* Desktop Drag and Drop Dropzone */}
        <div
          className={`p-4 rounded-2xl border-2 border-dashed text-center transition-colors ${
            isDragging
              ? 'border-sb-navy bg-sb-navy-tint/30'
              : 'border-sb-border bg-sb-bg/50'
          }`}
        >
          <UploadCloud className="w-8 h-8 text-sb-navy mx-auto mb-1 opacity-80" />
          <div className="text-caption font-bold text-sb-navy">
            Drag and drop file here
          </div>
          <div className="text-[11px] text-sb-ink-3">
            Supports .pdf, .xlsx, .csv, and .xer files
          </div>
        </div>

        {/* 4 Large Action Rows */}
        <div className="space-y-2 pt-1">
          {/* 1. DPR PDF */}
          <button
            type="button"
            data-testid="ingest-option-dpr"
            onClick={() => handleRoute('/ingest/dpr')}
            className="w-full p-3.5 bg-sb-white rounded-xl border border-sb-border hover:border-sb-navy/60 transition-all flex items-center justify-between text-left shadow-sm group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-sb-navy-tint text-sb-navy flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <div className="text-caption font-bold text-sb-navy group-hover:text-sb-navy">
                  Upload DPR (PDF)
                </div>
                <div className="text-[11px] text-sb-ink-3">
                  Extract contractor daily progress statements via AI
                </div>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-sb-ink-3 group-hover:text-sb-navy group-hover:translate-x-0.5 transition-all" />
          </button>

          {/* 2. Excel Report */}
          <button
            type="button"
            data-testid="ingest-option-excel"
            onClick={() => handleRoute('/ingest/excel')}
            className="w-full p-3.5 bg-sb-white rounded-xl border border-sb-border hover:border-sb-navy/60 transition-all flex items-center justify-between text-left shadow-sm group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-sb-verified-tint text-sb-verified-ink flex items-center justify-center shrink-0">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div>
                <div className="text-caption font-bold text-sb-navy group-hover:text-sb-navy">
                  Upload Excel report
                </div>
                <div className="text-[11px] text-sb-ink-3">
                  Map contractor spreadsheet columns into field events
                </div>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-sb-ink-3 group-hover:text-sb-navy group-hover:translate-x-0.5 transition-all" />
          </button>

          {/* 3. XER Import */}
          <button
            type="button"
            data-testid="ingest-option-xer"
            onClick={() => handleRoute('/ingest/xer')}
            className="w-full p-3.5 bg-sb-white rounded-xl border border-sb-border hover:border-sb-navy/60 transition-all flex items-center justify-between text-left shadow-sm group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-sb-review-tint text-sb-review-ink flex items-center justify-center shrink-0">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <div className="text-caption font-bold text-sb-navy group-hover:text-sb-navy">
                  Import schedule (.xer)
                </div>
                <div className="text-[11px] text-sb-ink-3">
                  Parse Primavera P6 XER baseline or update file
                </div>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-sb-ink-3 group-hover:text-sb-navy group-hover:translate-x-0.5 transition-all" />
          </button>

          {/* 4. Type an Entry */}
          <button
            type="button"
            data-testid="ingest-option-type"
            onClick={() => handleRoute('/capture?mode=planner')}
            className="w-full p-3.5 bg-sb-white rounded-xl border border-sb-border hover:border-sb-navy/60 transition-all flex items-center justify-between text-left shadow-sm group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-sb-bg text-sb-ink flex items-center justify-center shrink-0">
                <Type className="w-5 h-5" />
              </div>
              <div>
                <div className="text-caption font-bold text-sb-navy group-hover:text-sb-navy">
                  Type an entry
                </div>
                <div className="text-[11px] text-sb-ink-3">
                  Capture field update on behalf of a crew with planner tag
                </div>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-sb-ink-3 group-hover:text-sb-navy group-hover:translate-x-0.5 transition-all" />
          </button>
        </div>
      </div>
    </Sheet>
  );
};
