'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/shell/PageHeader';
import { useProjectStore } from '@/store/project';
import { useEventsStore } from '@/store/events';
import {
  Download,
  AlertTriangle,
  ChevronRight,
  Mic,
  FileText,
  FileSpreadsheet,
  CloudRain,
  Calendar,
} from 'lucide-react';

export default function DelayDetailPage({ params }: { params: { category: string } }) {
  const router = useRouter();
  const rawCategory = decodeURIComponent(params.category);
  const delayCauses = useProjectStore((s) => s.delayCauses);
  const events = useEventsStore((s) => s.events);

  // Match cause
  const cause =
    delayCauses.find((c) => c.category.toLowerCase() === rawCategory.toLowerCase()) || {
      category: rawCategory,
      eventsCount: 3,
      daysLost: 4,
      isCriticalPath: false,
    };

  // Affected activities based on category
  const affectedActivities = [
    ...(cause.criticalActivityId
      ? [
          {
            id: cause.criticalActivityId,
            name: cause.criticalActivityName || 'Key Execution Activity',
            daysLate: Math.round(cause.daysLost * 0.7),
            isCriticalPath: cause.isCriticalPath,
          },
        ]
      : []),
    {
      id: 'CIV-12-003',
      name: 'Excavate Trench KP 180.0–185.0',
      daysLate: 2,
      isCriticalPath: false,
    },
    {
      id: 'PIP-24-017',
      name: 'Weld Piping System 24-XX',
      daysLate: 1,
      isCriticalPath: true,
    },
  ];

  // Reports matching this delay category or delay events
  const matchingEvents = events
    .filter((e) => e.status === 'Delay' || e.queueTier === 'Delay' || e.extractedInfo?.action === 'Delay')
    .slice(0, 4);

  // Timeline entries (last 10 days)
  const isWeatherCategory = rawCategory.toLowerCase().includes('weather');
  const timelineDays = [
    { date: '11 Sep', hasDelay: true, weather: 'Heavy Rain' },
    { date: '12 Sep', hasDelay: true, weather: 'Rain / Flood' },
    { date: '13 Sep', hasDelay: false, weather: 'Clear' },
    { date: '14 Sep', hasDelay: true, weather: 'Dewatering' },
    { date: '15 Sep', hasDelay: false, weather: 'Clear' },
    { date: '16 Sep', hasDelay: false, weather: 'Clear' },
    { date: '17 Sep', hasDelay: true, weather: 'Crane breakdown' },
    { date: '18 Sep', hasDelay: true, weather: 'High wind' },
    { date: '19 Sep', hasDelay: false, weather: 'Clear' },
    { date: '20 Sep', hasDelay: true, weather: 'Current Status' },
  ];

  const handleDownloadCSV = () => {
    const headers = ['Category', 'Days Lost', 'Period', 'Activity ID', 'Activity Name', 'Critical Path', 'Supervisor Quote'];
    const rows = matchingEvents.map((e) => [
      cause.category,
      String(cause.daysLost),
      'Last 30 days',
      e.suggestedActivityId || 'N/A',
      e.suggestedActivityName || 'N/A',
      cause.isCriticalPath ? 'Yes' : 'No',
      e.rawText,
    ]);
    const csvContent = [headers.join(','), ...rows.map((r) => r.map((c) => `"${c}"`).join(','))].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Delay_Log_${cause.category.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col min-h-full pb-8">
      <PageHeader variant="back" title="Delay Detail" />

      <div className="px-4 py-3 space-y-4">
        {/* Category Header Card */}
        <div className="bg-white p-4 rounded-card border border-sb-border shadow-e1">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[11px] uppercase font-bold text-sb-text-subtle tracking-wider block">
                Delay Driver · Last 30 Days
              </span>
              <h2 className="text-h2 font-bold text-sb-ink mt-0.5">{cause.category}</h2>
            </div>
            {cause.isCriticalPath && (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded">
                <AlertTriangle className="w-3 h-3" />
                Critical path
              </span>
            )}
          </div>

          <div className="flex items-center gap-4 mt-3 pt-3 border-t border-sb-border-subtle text-caption">
            <div>
              <span className="text-sb-text-subtle block">Days Lost</span>
              <span className="text-body font-mono font-bold text-red-700">
                {cause.daysLost} days
              </span>
            </div>
            <div className="border-l border-sb-border pl-4">
              <span className="text-sb-text-subtle block">Events Count</span>
              <span className="text-body font-mono font-bold text-sb-ink">
                {cause.eventsCount} field reports
              </span>
            </div>
            <div className="border-l border-sb-border pl-4">
              <span className="text-sb-text-subtle block">Evaluation Period</span>
              <span className="text-body font-mono font-bold text-sb-ink">
                30 Days
              </span>
            </div>
          </div>
        </div>

        {/* Section 1: Affected Activities */}
        <div className="bg-white p-4 rounded-card border border-sb-border shadow-e1 space-y-3">
          <h3 className="text-body font-semibold text-sb-ink">1. Affected Activities</h3>
          <div className="space-y-2">
            {affectedActivities.map((act) => (
              <div
                key={act.id}
                data-testid={`affected-activity-${act.id}`}
                onClick={() => router.push(`/activity/${act.id}`)}
                className="p-3 border border-sb-border rounded-lg bg-sb-bg-subtle hover:bg-slate-50 hover:border-sb-navy cursor-pointer transition-colors flex items-center justify-between"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-sb-navy text-caption">
                      {act.id}
                    </span>
                    {act.isCriticalPath && (
                      <span className="text-[10px] font-semibold text-red-700 bg-red-50 border border-red-200 px-1.5 py-0.2 rounded">
                        Critical
                      </span>
                    )}
                  </div>
                  <span className="text-caption text-sb-ink font-medium block mt-0.5">
                    {act.name}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-mono-s font-bold text-red-700 bg-white border border-red-200 px-2 py-0.5 rounded">
                    +{act.daysLate}d late
                  </span>
                  <ChevronRight className="w-4 h-4 text-sb-text-subtle" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 2: Reports (Field Quotes) */}
        <div className="bg-white p-4 rounded-card border border-sb-border shadow-e1 space-y-3">
          <h3 className="text-body font-semibold text-sb-ink">2. Supervisor Field Quotes</h3>
          <div className="space-y-2.5">
            {matchingEvents.map((evt) => (
              <div
                key={evt.id}
                data-testid={`delay-report-${evt.id}`}
                onClick={() => router.push(`/event/${evt.id}`)}
                className="p-3 border border-sb-border rounded-lg bg-white hover:border-sb-navy cursor-pointer transition-colors space-y-1.5"
              >
                <div className="flex items-center justify-between text-caption">
                  <div className="flex items-center gap-1.5 text-sb-navy font-semibold">
                    {evt.source === 'voice' && <Mic className="w-3.5 h-3.5" />}
                    {evt.source === 'excel' && <FileSpreadsheet className="w-3.5 h-3.5" />}
                    {evt.source === 'pdf' && <FileText className="w-3.5 h-3.5" />}
                    <span>{evt.id}</span>
                  </div>
                  <span className="text-mono-s text-sb-text-subtle">{evt.timestamp}</span>
                </div>

                <p className="text-caption text-sb-ink italic font-medium">
                  &ldquo;{evt.rawText}&rdquo;
                </p>

                <div className="flex items-center justify-between text-[11px] text-sb-text-muted pt-1 border-t border-sb-border-subtle">
                  <span>Reported by {evt.authorName || 'Field Supervisor'}</span>
                  <span className="text-sb-navy font-semibold flex items-center gap-0.5">
                    View Evidence <ChevronRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 3: Timeline */}
        <div className="bg-white p-4 rounded-card border border-sb-border shadow-e1 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-body font-semibold text-sb-ink">3. Occurrence Timeline</h3>
            <span className="text-caption text-sb-text-muted flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" /> 10-day breakdown
            </span>
          </div>

          <div className="flex items-center justify-between pt-2 overflow-x-auto pb-1">
            {timelineDays.map((item, idx) => (
              <div key={idx} className="flex flex-col items-center gap-1 min-w-[28px]">
                <span className="text-[10px] font-mono text-sb-text-subtle">{item.date}</span>
                <div
                  className={`w-4 h-4 rounded-full flex items-center justify-center ${
                    item.hasDelay ? 'bg-red-600' : 'bg-slate-200'
                  }`}
                >
                  {isWeatherCategory && item.hasDelay && (
                    <CloudRain className="w-2.5 h-2.5 text-white" />
                  )}
                </div>
                <span className="text-[9px] text-sb-text-muted text-center max-w-[32px] truncate">
                  {item.weather}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Download CSV Action Button */}
        <button
          type="button"
          data-testid="download-delay-log-csv"
          onClick={handleDownloadCSV}
          className="w-full py-3 bg-sb-navy text-white text-body font-semibold rounded-xl hover:bg-slate-800 transition-colors flex items-center justify-center gap-2 shadow-sm"
        >
          <Download className="w-4 h-4" />
          Download delay log (CSV)
        </button>
      </div>
    </div>
  );
}
