'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/shell/PageHeader';
import { UnderlineTabs, TabItem } from '@/components/ui/UnderlineTabs';
import { useSPI, useProjectStore } from '@/store/project';
import { SCurveChart } from '@/components/analytics/SCurveChart';
import { TruthGapChart } from '@/components/analytics/TruthGapChart';
import { DelayRankedBars } from '@/components/analytics/DelayRankedBars';
import { MemoryInsightsView } from '@/components/analytics/MemoryInsightsView';
import { Download, ChevronRight } from 'lucide-react';

type AnalyticsTab = 'progress' | 'truth-gap' | 'delays' | 'memory';

export default function AnalyticsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<AnalyticsTab>('progress');
  const { spi, verified, planned } = useSPI();
  const phases = useProjectStore((s) => s.phases);

  const tabs: TabItem[] = [
    { id: 'progress', label: 'Progress' },
    { id: 'truth-gap', label: 'Truth Gap' },
    { id: 'delays', label: 'Delays' },
    { id: 'memory', label: 'Memory' },
  ];

  const handleExportPhaseCSV = () => {
    const headers = ['Phase', 'Weight (%)', 'Planned (%)', 'Verified (%)', 'Gap (pts)'];
    const rows = phases.map((p) => [
      p.name,
      `${p.weight}%`,
      `${p.planned}%`,
      `${p.verified}%`,
      `${p.planned - p.verified} pts`,
    ]);
    const csvContent = [headers.join(','), ...rows.map((r) => r.map((c) => `"${c}"`).join(','))].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `SchedBridge_Phase_Progress_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col min-h-full pb-8">
      <PageHeader variant="back" title="Project Analytics" />

      <div className="px-4 py-3 space-y-4">
        {/* Three Numerals Card: Physical 68% · Planned 74% · SPI 0.92 */}
        <div className="grid grid-cols-3 gap-2 bg-white p-3.5 rounded-card border border-sb-border shadow-e1">
          <div className="text-center border-r border-sb-border-subtle pr-2">
            <span className="text-[11px] uppercase font-semibold text-sb-text-subtle tracking-wide block">
              Physical
            </span>
            <span data-testid="numeral-physical" className="text-h2 font-mono font-bold text-sb-navy">
              {verified}%
            </span>
          </div>

          <div className="text-center border-r border-sb-border-subtle pr-2">
            <span className="text-[11px] uppercase font-semibold text-sb-text-subtle tracking-wide block">
              Planned
            </span>
            <span data-testid="numeral-planned" className="text-h2 font-mono font-bold text-sb-ink">
              {planned}%
            </span>
          </div>

          <div className="text-center">
            <span className="text-[11px] uppercase font-semibold text-sb-text-subtle tracking-wide block">
              SPI Index
            </span>
            <span data-testid="numeral-spi" className="text-h2 font-mono font-bold text-amber-700">
              {spi.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Underline Tabs */}
        <UnderlineTabs
          tabs={tabs}
          activeTab={activeTab}
          onChange={(tab) => setActiveTab(tab as AnalyticsTab)}
        />

        {/* Tab Content */}
        {activeTab === 'progress' && (
          <div className="space-y-4 lg:grid lg:grid-cols-2 lg:gap-4 lg:space-y-0">
            <SCurveChart />

            {/* Phase Table */}
            <div className="bg-white rounded-card border border-sb-border p-4 shadow-e1">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-body font-semibold text-sb-ink">Phase Breakdown</h3>
                <button
                  type="button"
                  data-testid="export-phase-csv"
                  onClick={handleExportPhaseCSV}
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
                      <th className="py-2 px-3">Phase</th>
                      <th className="py-2 px-3 text-right">Weight</th>
                      <th className="py-2 px-3 text-right">Planned</th>
                      <th className="py-2 px-3 text-right">Verified</th>
                      <th className="py-2 px-3 text-right">Gap</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-sb-border-subtle">
                    {phases.map((phase) => {
                      const gap = phase.planned - phase.verified;
                      return (
                        <tr
                          key={phase.id}
                          data-testid={`phase-row-${phase.id}`}
                          onClick={() => router.push(`/project?phase=${phase.id}`)}
                          className="hover:bg-sb-bg cursor-pointer transition-colors group"
                        >
                          <td className="py-2.5 px-3 font-medium text-sb-ink group-hover:text-sb-navy flex items-center gap-1">
                            {phase.name}
                            <ChevronRight className="w-3.5 h-3.5 text-sb-text-subtle opacity-0 group-hover:opacity-100 transition-opacity" />
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono text-sb-text-subtle">
                            {phase.weight}%
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono text-sb-ink">
                            {phase.planned}%
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono text-sb-navy font-semibold">
                            {phase.verified}%
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono font-semibold text-amber-700">
                            {gap > 0 ? `+${gap}` : gap}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'truth-gap' && <TruthGapChart />}

        {activeTab === 'delays' && <DelayRankedBars />}

        {activeTab === 'memory' && <MemoryInsightsView />}
      </div>
    </div>
  );
}
