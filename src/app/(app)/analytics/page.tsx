'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/shell/PageHeader';
import { PageContainer } from '@/components/shell/PageContainer';
import { UnderlineTabs, TabItem } from '@/components/ui/UnderlineTabs';
import { useSPI, useProjectStore } from '@/store/project';
import { SCurveChart } from '@/components/analytics/SCurveChart';
import { TruthGapChart } from '@/components/analytics/TruthGapChart';
import { DelayRankedBars } from '@/components/analytics/DelayRankedBars';
import { MemoryInsightsView } from '@/components/analytics/MemoryInsightsView';
import {
  Download,
  ChevronRight,
  Sparkles,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  ArrowRight,
  TrendingDown,
  Layers,
} from 'lucide-react';

type AnalyticsTab = 'progress' | 'truth-gap' | 'delays' | 'memory';

export default function AnalyticsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<AnalyticsTab>('progress');
  const [showFullTable, setShowFullTable] = useState(false);
  const { spi, verified, planned } = useSPI();
  const phases = useProjectStore((s) => s.phases);

  const tabs: TabItem[] = [
    { id: 'progress', label: 'Progress & S-Curve' },
    { id: 'truth-gap', label: 'Truth Gap' },
    { id: 'delays', label: 'Delays & Variances' },
    { id: 'memory', label: 'Project Memory' },
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

  // Visible top phases (Summary view)
  const visiblePhases = showFullTable ? phases : phases.slice(0, 3);

  return (
    <PageContainer
      maxWidth="container"
      withGutter={false}
      withVerticalRhythm={false}
      className="flex flex-col min-h-full pb-8"
      data-testid="analytics-screen-mg1"
    >
      <PageHeader variant="back" title="Project Controls Analytics" />

      <div className="px-4 py-3 space-y-4">
        {/* 1. SUMMARY: Capped 3 Primary KPI Numerals */}
        <div className="grid grid-cols-3 gap-2 bg-sb-white p-3.5 rounded-2xl border border-sb-border shadow-e1">
          <div className="text-center border-r border-sb-border pr-2">
            <span className="text-[11px] uppercase font-bold text-sb-ink-3 tracking-wider block font-mono">
              Physical
            </span>
            <span data-testid="numeral-physical" className="text-title-2 font-mono font-bold text-sb-navy">
              {verified}%
            </span>
            <span className="text-[10px] text-sb-verified-ink font-semibold block">Verified</span>
          </div>

          <div className="text-center border-r border-sb-border pr-2">
            <span className="text-[11px] uppercase font-bold text-sb-ink-3 tracking-wider block font-mono">
              Planned
            </span>
            <span data-testid="numeral-planned" className="text-title-2 font-mono font-bold text-sb-ink">
              {planned}%
            </span>
            <span className="text-[10px] text-sb-ink-3 block">Baseline</span>
          </div>

          <div className="text-center">
            <span className="text-[11px] uppercase font-bold text-sb-ink-3 tracking-wider block font-mono">
              SPI Index
            </span>
            <span data-testid="numeral-spi" className="text-title-2 font-mono font-bold text-amber-700">
              {spi.toFixed(2)}
            </span>
            <span className="text-[10px] text-amber-700 font-semibold block">Behind (-6d)</span>
          </div>
        </div>

        {/* 2. KEY INSIGHT CARD */}
        <div
          data-testid="analytics-key-insight-card"
          className="p-3.5 rounded-2xl bg-sb-navy-tint/60 border border-sb-navy/20 flex items-start justify-between gap-3 shadow-2xs"
        >
          <div className="flex items-start gap-2.5 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-sb-navy text-sb-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            </div>
            <div className="min-w-0 space-y-0.5">
              <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-sb-navy">
                Critical Path Variance Insight
              </div>
              <p className="text-caption text-sb-ink font-medium leading-relaxed">
                6-day slip on Spool Rack 4 welding. 3% truth gap detected between contractor DPR claims (71%) and physical verification (68%).
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setActiveTab('memory')}
            className="text-[11px] font-bold text-sb-navy hover:underline shrink-0 flex items-center gap-1 mt-1 font-mono"
          >
            <span>Lessons</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {/* 3. Underline Tabs */}
        <UnderlineTabs
          tabs={tabs}
          activeTab={activeTab}
          onChange={(tab) => setActiveTab(tab as AnalyticsTab)}
        />

        {/* 4. OPTIONAL DETAILS & DRILL-DOWNS BY TAB */}
        {activeTab === 'progress' && (
          <div className="space-y-4 lg:grid lg:grid-cols-2 lg:gap-4 lg:space-y-0">
            <SCurveChart />

            {/* Phase Breakdown Card with Progressive Disclosure */}
            <div className="bg-sb-white rounded-2xl border border-sb-border p-4 shadow-e1 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-callout font-bold text-sb-navy">Phase Breakdown</h3>
                  <div className="text-[11px] text-sb-ink-3 font-mono">
                    Showing top {visiblePhases.length} of {phases.length} phases
                  </div>
                </div>
                <button
                  type="button"
                  data-testid="export-phase-csv"
                  onClick={handleExportPhaseCSV}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-caption font-bold border border-sb-border rounded-full bg-sb-bg hover:bg-sb-navy-tint/50 text-sb-navy transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export CSV</span>
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-caption">
                  <thead>
                    <tr className="border-b border-sb-border bg-sb-bg/80 text-sb-ink-3 font-bold text-[11px] font-mono">
                      <th className="py-2 px-3">Phase</th>
                      <th className="py-2 px-3 text-right">Weight</th>
                      <th className="py-2 px-3 text-right">Planned</th>
                      <th className="py-2 px-3 text-right">Verified</th>
                      <th className="py-2 px-3 text-right">Variance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-sb-border/60">
                    {visiblePhases.map((phase) => {
                      const gap = phase.planned - phase.verified;
                      return (
                        <tr
                          key={phase.id}
                          data-testid={`phase-row-${phase.id}`}
                          onClick={() => router.push(`/project?phase=${phase.id}`)}
                          className="hover:bg-sb-bg/60 cursor-pointer transition-colors group"
                        >
                          <td className="py-2.5 px-3 font-semibold text-sb-navy group-hover:underline flex items-center gap-1">
                            {phase.name}
                            <ChevronRight className="w-3.5 h-3.5 text-sb-ink-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono text-sb-ink-3">
                            {phase.weight}%
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono text-sb-ink">
                            {phase.planned}%
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono text-sb-navy font-bold">
                            {phase.verified}%
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono font-bold text-amber-700">
                            {gap > 0 ? `+${gap}d` : `${gap}d`}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* View Details / Expand Toggle */}
              {phases.length > 3 && (
                <button
                  type="button"
                  data-testid="toggle-phase-table-btn"
                  onClick={() => setShowFullTable(!showFullTable)}
                  className="w-full py-2 text-center text-caption font-bold text-sb-navy hover:underline flex items-center justify-center gap-1 border-t border-sb-border/60 pt-2"
                >
                  <span>{showFullTable ? 'Show Top 3 Phases Only' : `View All ${phases.length} Phases & Variances`}</span>
                  {showFullTable ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>
              )}
            </div>
          </div>
        )}

        {activeTab === 'truth-gap' && <TruthGapChart />}

        {activeTab === 'delays' && <DelayRankedBars />}

        {activeTab === 'memory' && <MemoryInsightsView />}
      </div>
    </PageContainer>
  );
}
