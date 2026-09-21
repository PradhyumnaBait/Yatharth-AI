'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/shell/PageHeader';
import { Toast } from '@/components/ui/Toast';
import { useAuthStore } from '@/store/auth';
import { useEventsStore } from '@/store/events';
import {
  Download,
  CheckCircle2,
  AlertTriangle,
  FileSpreadsheet,
  Calendar,
  History,
  Info,
  CheckSquare,
  Square,
  ChevronRight,
} from 'lucide-react';

interface ExportRow {
  id: string;
  activityId: string;
  field: 'Physical % Complete' | 'Actual Start' | 'Actual Finish';
  oldValue: string;
  newValue: string;
  sourceEvent: string;
  isOutOfSequence?: boolean;
}

const SAMPLE_EXPORT_ROWS: ExportRow[] = [
  {
    id: 'row-1',
    activityId: 'PIP-24-017',
    field: 'Physical % Complete',
    oldValue: '38%',
    newValue: '40%',
    sourceEvent: 'E-2091',
  },
  {
    id: 'row-2',
    activityId: 'CIV-12-003',
    field: 'Physical % Complete',
    oldValue: '92%',
    newValue: '96%',
    sourceEvent: 'E-2092',
  },
  {
    id: 'row-3',
    activityId: 'PIP-24-018',
    field: 'Actual Start',
    oldValue: 'Not set',
    newValue: '20-Sep-2026',
    sourceEvent: 'E-2093',
    isOutOfSequence: true,
  },
  {
    id: 'row-4',
    activityId: 'PIP-30-005',
    field: 'Physical % Complete',
    oldValue: '0%',
    newValue: '100%',
    sourceEvent: 'E-2094',
  },
];

interface ExportHistoryItem {
  id: string;
  filename: string;
  timestamp: string;
  count: number;
  exportedBy: string;
}

export default function ExportPage() {
  const router = useRouter();
  const { user } = useAuthStore();

  const [scope, setScope] = useState<'approved' | 'custom'>('approved');
  const [format, setFormat] = useState<'csv' | 'xer'>('csv');
  const [selectedRowIds, setSelectedRowIds] = useState<string[]>([
    'row-1',
    'row-2',
    'row-3',
    'row-4',
  ]);
  const [history, setHistory] = useState<ExportHistoryItem[]>([
    {
      id: 'exp-01',
      filename: 'SchedBridge_P6_Update_19SEP2026_1.csv',
      timestamp: '19 Sep 2026, 18:00',
      count: 28,
      exportedBy: 'Meera Nair',
    },
  ]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const toggleSelectRow = (id: string) => {
    setSelectedRowIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleGenerateFile = () => {
    const activeRows = SAMPLE_EXPORT_ROWS.filter((r) => selectedRowIds.includes(r.id));
    if (activeRows.length === 0) return;

    // Build P6-compliant CSV header and rows (Physical % Complete only)
    const csvLines = [
      'Activity_ID,Field_Name,Old_Value,New_Value,Data_Date,Source_Event_ID,Override_Flag',
      ...activeRows.map(
        (r) =>
          `"${r.activityId}","${r.field}","${r.oldValue}","${r.newValue}","20-Sep-2026","${r.sourceEvent}","${
            r.isOutOfSequence ? 'OUT_OF_SEQUENCE' : 'STANDARD'
          }"`
      ),
    ];

    const csvContent = csvLines.join('\n');
    const filename = `SchedBridge_P6_Update_20SEP2026_${history.length + 1}.csv`;

    // Trigger browser file download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    // Record export history
    setHistory((prev) => [
      {
        id: `exp-${Date.now()}`,
        filename,
        timestamp: 'Just now',
        count: activeRows.length,
        exportedBy: user?.name || 'Meera Nair',
      },
      ...prev,
    ]);

    setToastMessage(`Downloaded ${filename}`);
  };

  const handleDownloadAgain = (item: ExportHistoryItem) => {
    const dummyContent = 'Activity_ID,Field_Name,Old_Value,New_Value\nPIP-24-017,Physical % Complete,38%,40%';
    const blob = new Blob([dummyContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', item.filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setToastMessage(`Re-downloaded ${item.filename}`);
  };

  return (
    <div className="flex flex-col min-h-full bg-sb-bg pb-28" data-testid="export-screen-pl8">
      {/* 1. Header */}
      <PageHeader
        variant="back"
        title="P6 Update Export"
        subtitle="Physical % Complete Import Files"
      />

      <div className="p-4 space-y-4">
        {/* 2. Scope & Format Selectors */}
        <div className="bg-sb-white rounded-2xl p-4 border border-sb-border shadow-sm space-y-3">
          {/* Scope Selector */}
          <div>
            <div className="text-caption font-bold text-sb-navy mb-1.5">Export Scope</div>
            <div className="flex gap-2">
              <button
                type="button"
                data-testid="scope-approved-btn"
                onClick={() => setScope('approved')}
                className={`flex-1 py-2 rounded-xl text-caption font-semibold transition-colors ${
                  scope === 'approved'
                    ? 'bg-sb-navy text-sb-white'
                    : 'bg-sb-bg text-sb-ink-2 hover:bg-sb-border'
                }`}
              >
                Approved since last export
              </button>
              <button
                type="button"
                data-testid="scope-custom-btn"
                onClick={() => setScope('custom')}
                className={`flex-1 py-2 rounded-xl text-caption font-semibold transition-colors ${
                  scope === 'custom'
                    ? 'bg-sb-navy text-sb-white'
                    : 'bg-sb-bg text-sb-ink-2 hover:bg-sb-border'
                }`}
              >
                Custom date range
              </button>
            </div>
          </div>

          {/* Format Segmented Control */}
          <div className="pt-1">
            <div className="text-caption font-bold text-sb-navy mb-1.5">File Format</div>
            <div className="flex items-center bg-sb-bg border border-sb-border rounded-xl p-1">
              <button
                type="button"
                data-testid="format-csv-btn"
                onClick={() => setFormat('csv')}
                className={`flex-1 py-1.5 rounded-lg text-caption font-semibold transition-colors ${
                  format === 'csv'
                    ? 'bg-sb-navy text-sb-white'
                    : 'text-sb-ink-3 hover:text-sb-ink'
                }`}
              >
                CSV (P6 import)
              </button>
              <button
                type="button"
                data-testid="format-xer-btn"
                onClick={() => setFormat('xer')}
                className={`flex-1 py-1.5 rounded-lg text-caption font-semibold transition-colors ${
                  format === 'xer'
                    ? 'bg-sb-navy text-sb-white'
                    : 'text-sb-ink-3 hover:text-sb-ink'
                }`}
              >
                XER (beta)
              </button>
            </div>
          </div>
        </div>

        {/* 3. Retained Logic Mandatory Info Card */}
        <div className="p-3.5 bg-sb-bg rounded-xl border border-sb-border space-y-1 text-caption text-sb-ink">
          <div className="flex items-center gap-1.5 font-bold text-sb-navy">
            <Info className="w-4 h-4 text-sb-navy" />
            <span>Retained Logic Compliance</span>
          </div>
          <p className="text-[12px] text-sb-ink-2 leading-relaxed">
            P6 must import with <strong>Retained Logic</strong>. Out-of-sequence items are flagged below and include recorded override reason codes.
          </p>
        </div>

        {/* 4. Preview Table with Row Checkboxes */}
        <div data-testid="export-diff-table" className="bg-sb-white rounded-2xl p-4 border border-sb-border shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-sb-border/60 pb-2">
            <div className="text-caption font-bold text-sb-navy">
              Preview Changes ({selectedRowIds.length} items)
            </div>
            <span className="font-mono text-[10px] text-sb-ink-3">Physical % only</span>
          </div>

          <div className="divide-y divide-sb-border/60" data-testid="export-preview-table">
            {SAMPLE_EXPORT_ROWS.map((row) => {
              const isSelected = selectedRowIds.includes(row.id);

              return (
                <div
                  key={row.id}
                  data-testid={`export-row-${row.activityId}`}
                  onClick={() => toggleSelectRow(row.id)}
                  className="py-2.5 flex items-start gap-3 cursor-pointer hover:bg-sb-bg/40 transition-colors"
                >
                  <div className="pt-0.5">
                    {isSelected ? (
                      <CheckSquare className="w-4 h-4 text-sb-navy" />
                    ) : (
                      <Square className="w-4 h-4 text-sb-ink-3" />
                    )}
                  </div>

                  <div className="min-w-0 flex-1 space-y-0.5 text-[12px]">
                    <div className="flex items-center justify-between font-mono">
                      <span className="font-bold text-sb-navy">{row.activityId}</span>
                      <span className="text-sb-verified-ink font-semibold">{row.newValue}</span>
                    </div>

                    <div className="text-sb-ink-2 flex items-center justify-between">
                      <span>{row.field}</span>
                      <span className="font-mono text-[11px] text-sb-ink-3">{row.oldValue} → {row.newValue}</span>
                    </div>

                    <div className="flex items-center justify-between pt-0.5">
                      <span className="font-mono text-[10px] text-sb-ink-3">
                        Source: {row.sourceEvent}
                      </span>
                      {row.isOutOfSequence && (
                        <span
                          data-testid="oos-flag"
                          className="px-2 py-0.2 rounded bg-sb-review-tint text-sb-review-ink text-[10px] font-bold"
                        >
                          Out-of-sequence override
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 5. Generate File Action Button */}
        <button
          type="button"
          data-testid="download-export-btn"
          disabled={selectedRowIds.length === 0}
          onClick={handleGenerateFile}
          className={`w-full py-3.5 rounded-full font-bold text-callout shadow-sm active:scale-95 transition-all flex items-center justify-center gap-2 ${
            selectedRowIds.length > 0
              ? 'bg-sb-navy text-sb-white hover:bg-sb-navy-pressed'
              : 'bg-sb-border text-sb-ink-3 cursor-not-allowed'
          }`}
        >
          <Download className="w-4 h-4" />
          <span>Generate P6 Import File ({selectedRowIds.length})</span>
        </button>

        {/* 6. Export History */}
        <div className="bg-sb-white rounded-2xl p-4 border border-sb-border shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-caption font-bold text-sb-navy">
            <History className="w-4 h-4 text-sb-navy" />
            <span>Export History</span>
          </div>

          <div className="divide-y divide-sb-border/60">
            {history.map((item) => (
              <div
                key={item.id}
                data-testid={`history-item-${item.id}`}
                className="py-2.5 flex items-center justify-between text-[12px]"
              >
                <div>
                  <div className="font-mono font-bold text-sb-navy text-caption">
                    {item.filename}
                  </div>
                  <div className="text-sb-ink-3 text-[11px]">
                    {item.timestamp} · {item.count} updates · by {item.exportedBy}
                  </div>
                </div>

                <button
                  type="button"
                  data-testid={`download-again-${item.id}`}
                  onClick={() => handleDownloadAgain(item)}
                  className="px-3 py-1 text-[11px] font-semibold text-sb-navy border border-sb-border rounded-full hover:bg-sb-bg"
                >
                  Download
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Toast Feedback */}
      {toastMessage && (
        <Toast
          open={Boolean(toastMessage)}
          message={toastMessage}
          onClose={() => setToastMessage(null)}
        />
      )}
    </div>
  );
}
