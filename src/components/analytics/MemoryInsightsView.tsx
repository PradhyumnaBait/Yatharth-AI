'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useProjectStore } from '@/store/project';
import { MemoryInsight } from '@/services/types';
import { Sheet } from '@/components/ui/Sheet';
import { Download, ChevronRight, BookOpen, ArrowUpRight } from 'lucide-react';

export const MemoryInsightsView: React.FC = () => {
  const router = useRouter();
  const memoryInsights = useProjectStore((s) => s.memoryInsights);
  const [seasonFilter, setSeasonFilter] = useState<'All' | 'Monsoon' | 'Dry'>('All');
  const [selectedInsight, setSelectedInsight] = useState<MemoryInsight | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  // Filter insights by season if defined
  const filteredInsights = useMemo(() => {
    if (seasonFilter === 'All') return memoryInsights;
    return memoryInsights.filter((m) => !m.season || m.season === seasonFilter);
  }, [memoryInsights, seasonFilter]);

  // Duration variance table data
  const tableData = [
    { type: 'Trenching (Jun–Sep)', planned: '14 days', actual: '19.3 days', variance: '+38%', n: 41 },
    { type: 'Lowering (Single Crane)', planned: '8 days', actual: '10.2 days', variance: '+27%', n: 19 },
    { type: 'Field-Joint Coating (Open RFI)', planned: '10 days', actual: '12.2 days', variance: '+22%', n: 14 },
    { type: 'Hydrotesting', planned: '12 days', actual: '12.4 days', variance: '+3%', n: 12 },
    { type: 'Stringing', planned: '6 days', actual: '6.1 days', variance: '+2%', n: 24 },
  ];

  const handleExportCSV = () => {
    const headers = ['Activity Type', 'Planned Duration', 'Historical Actual', 'Variance', 'Sample Size (n)'];
    const rows = tableData.map((d) => [d.type, d.planned, d.actual, d.variance, String(d.n)]);
    const csvContent = [headers.join(','), ...rows.map((r) => r.map((c) => `"${c}"`).join(','))].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `SchedBridge_Memory_Benchmark_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCardClick = (insight: MemoryInsight) => {
    setSelectedInsight(insight);
    setSheetOpen(true);
  };

  return (
    <div className="space-y-4">
      {/* Header and Season Filter */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-body font-semibold text-sb-ink">Project Memory Insights</h3>
          <p className="text-caption text-sb-text-muted">Synthetic benchmarks across 3 past projects (n = 128)</p>
        </div>

        {/* Season Filter */}
        <div className="inline-flex rounded-lg border border-sb-border p-0.5 bg-sb-bg-subtle text-caption font-medium">
          {(['All', 'Monsoon', 'Dry'] as const).map((s) => (
            <button
              key={s}
              type="button"
              data-testid={`season-filter-${s.toLowerCase()}`}
              onClick={() => setSeasonFilter(s)}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                seasonFilter === s
                  ? 'bg-sb-navy text-white shadow-sm'
                  : 'text-sb-text-subtle hover:text-sb-ink'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Insight Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {filteredInsights.map((item) => (
          <div
            key={item.id}
            data-testid={`memory-card-${item.id}`}
            onClick={() => handleCardClick(item)}
            className="group p-4 bg-white border border-sb-border rounded-card hover:border-sb-navy cursor-pointer transition-all shadow-e1"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-sb-bg-subtle text-sb-navy">
                  <BookOpen className="w-4 h-4" />
                </span>
                <span className="text-caption font-bold text-sb-ink group-hover:text-sb-navy">
                  {item.title}
                </span>
              </div>
              <span className="text-mono-s font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                +{item.variancePercent}%
              </span>
            </div>

            <p className="text-caption text-sb-text-subtle leading-relaxed line-clamp-2">
              {item.insight}
            </p>

            <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-sb-border-subtle text-[11px] text-sb-text-muted">
              <span>Sample size: n = {item.sampleSize}</span>
              <span className="font-semibold text-sb-navy flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                View methodology <ChevronRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Table: Planned vs actual duration by activity type */}
      <div className="bg-white rounded-card border border-sb-border p-4 shadow-e1">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-body font-semibold text-sb-ink">
            Planned vs Actual Duration Benchmark
          </h4>
          <button
            type="button"
            data-testid="export-memory-csv"
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-caption font-medium border border-sb-border rounded-lg bg-sb-bg-subtle hover:bg-slate-100 text-sb-ink transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-caption">
            <thead>
              <tr className="border-b border-sb-border bg-sb-bg-subtle text-sb-text-subtle font-semibold">
                <th className="py-2 px-3">Activity Type</th>
                <th className="py-2 px-3 text-right">Planned</th>
                <th className="py-2 px-3 text-right">Historical</th>
                <th className="py-2 px-3 text-right">Variance</th>
                <th className="py-2 px-3 text-right">n</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sb-border-subtle">
              {tableData.map((row) => (
                <tr key={row.type} className="hover:bg-sb-bg transition-colors">
                  <td className="py-2.5 px-3 font-medium text-sb-ink">{row.type}</td>
                  <td className="py-2.5 px-3 text-right font-mono text-sb-text-subtle">{row.planned}</td>
                  <td className="py-2.5 px-3 text-right font-mono text-sb-ink font-semibold">{row.actual}</td>
                  <td className="py-2.5 px-3 text-right font-mono text-amber-700 font-semibold">{row.variance}</td>
                  <td className="py-2.5 px-3 text-right font-mono text-sb-text-subtle">{row.n}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Insight Detail Sheet */}
      <Sheet
        isOpen={sheetOpen}
        onClose={() => setSheetOpen(false)}
        title={selectedInsight ? selectedInsight.title : 'Insight Details'}
      >
        {selectedInsight && (
          <div className="space-y-4">
            <div className="bg-sb-bg-subtle p-3.5 rounded-card border border-sb-border">
              <span className="text-[10px] uppercase font-bold text-sb-navy tracking-wider">
                Historical Pattern
              </span>
              <p className="text-body text-sb-ink font-medium mt-1">
                {selectedInsight.insight}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-caption">
              <div className="p-3 border border-sb-border rounded-lg bg-white">
                <span className="text-sb-text-muted text-[11px] block">Sample Size</span>
                <span className="text-body font-mono font-bold text-sb-ink">
                  n = {selectedInsight.sampleSize} activities
                </span>
              </div>
              <div className="p-3 border border-sb-border rounded-lg bg-white">
                <span className="text-sb-text-muted text-[11px] block">Duration Variance</span>
                <span className="text-body font-mono font-bold text-amber-700">
                  +{selectedInsight.variancePercent}% vs Baseline
                </span>
              </div>
            </div>

            <div>
              <h5 className="text-caption font-bold uppercase tracking-wider text-sb-text-subtle mb-2">
                Matching Activities in Current Schedule
              </h5>
              <div className="space-y-2">
                {selectedInsight.activities.map((actId) => (
                  <div
                    key={actId}
                    data-testid={`insight-activity-${actId}`}
                    onClick={() => {
                      setSheetOpen(false);
                      router.push(`/activity/${actId}`);
                    }}
                    className="p-3 border border-sb-border rounded-lg bg-white hover:border-sb-navy cursor-pointer flex items-center justify-between group transition-colors"
                  >
                    <div>
                      <span className="font-mono font-bold text-sb-navy text-caption block">
                        {actId}
                      </span>
                      <span className="text-[11px] text-sb-text-subtle">
                        Tap to view activity accumulator & predecessors
                      </span>
                    </div>
                    <ArrowUpRight className="w-4 h-4 text-sb-text-subtle group-hover:text-sb-navy transition-colors" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Sheet>
    </div>
  );
};
