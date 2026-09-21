'use client';

import React, { useState, useId, useMemo } from 'react';
import { scaleTime, scaleLinear } from 'd3-scale';
import { line, curveMonotoneX } from 'd3-shape';

interface DataPoint {
  date: Date;
  dateStr: string;
  planned: number;
  actual?: number;
}

export const SCurveChart: React.FC = () => {
  const [range, setRange] = useState<'weekly' | 'monthly'>('weekly');
  const [scrubberIndex, setScrubberIndex] = useState<number | null>(null);
  const chartId = useId();

  // Weekly data points centered around Data Date (20 Sep 2026)
  const weeklyData: DataPoint[] = useMemo(
    () => [
      { date: new Date(2026, 7, 3), dateStr: '03 Aug', planned: 20, actual: 18 },
      { date: new Date(2026, 7, 10), dateStr: '10 Aug', planned: 28, actual: 26 },
      { date: new Date(2026, 7, 17), dateStr: '17 Aug', planned: 37, actual: 35 },
      { date: new Date(2026, 7, 24), dateStr: '24 Aug', planned: 47, actual: 44 },
      { date: new Date(2026, 7, 31), dateStr: '31 Aug', planned: 56, actual: 52 },
      { date: new Date(2026, 8, 7), dateStr: '07 Sep', planned: 64, actual: 59 },
      { date: new Date(2026, 8, 14), dateStr: '14 Sep', planned: 70, actual: 65 },
      { date: new Date(2026, 8, 20), dateStr: '20 Sep', planned: 74, actual: 68 }, // Data Date
      { date: new Date(2026, 8, 28), dateStr: '28 Sep', planned: 81 },
      { date: new Date(2026, 9, 5), dateStr: '05 Oct', planned: 88 },
      { date: new Date(2026, 9, 12), dateStr: '12 Oct', planned: 94 },
      { date: new Date(2026, 9, 19), dateStr: '19 Oct', planned: 98 },
      { date: new Date(2026, 9, 26), dateStr: '26 Oct', planned: 100 },
    ],
    []
  );

  const monthlyData: DataPoint[] = useMemo(
    () => [
      { date: new Date(2026, 4, 1), dateStr: 'May', planned: 5, actual: 5 },
      { date: new Date(2026, 5, 1), dateStr: 'Jun', planned: 15, actual: 14 },
      { date: new Date(2026, 6, 1), dateStr: 'Jul', planned: 32, actual: 30 },
      { date: new Date(2026, 7, 1), dateStr: 'Aug', planned: 56, actual: 52 },
      { date: new Date(2026, 8, 20), dateStr: '20 Sep', planned: 74, actual: 68 }, // Data Date
      { date: new Date(2026, 9, 1), dateStr: 'Oct', planned: 90 },
      { date: new Date(2026, 10, 1), dateStr: 'Nov', planned: 98 },
      { date: new Date(2026, 11, 1), dateStr: 'Dec', planned: 100 },
    ],
    []
  );

  const data = range === 'weekly' ? weeklyData : monthlyData;

  const width = 350;
  const height = 180;
  const margin = { top: 20, right: 16, bottom: 28, left: 32 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  const xScale = scaleTime()
    .domain([data[0].date, data[data.length - 1].date])
    .range([0, innerWidth]);

  const yScale = scaleLinear().domain([0, 100]).range([innerHeight, 0]);

  // Planned line (grey)
  const plannedLineGenerator = line<DataPoint>()
    .x((d) => xScale(d.date))
    .y((d) => yScale(d.planned))
    .curve(curveMonotoneX);

  // Actual line up to Data Date (navy)
  const actualData = data.filter((d) => d.actual !== undefined);
  const actualLineGenerator = line<DataPoint>()
    .x((d) => xScale(d.date))
    .y((d) => yScale(d.actual!))
    .curve(curveMonotoneX);

  const plannedPath = plannedLineGenerator(data) || '';
  const actualPath = actualLineGenerator(actualData) || '';

  // Data date line x position
  const dataDateObj = new Date(2026, 8, 20);
  const dataDateX = xScale(dataDateObj);

  // Current active point for scrubber
  const activeIndex = scrubberIndex !== null ? scrubberIndex : 7; // default to 20 Sep (index 7 in weekly)
  const activePoint = data[Math.min(activeIndex, data.length - 1)];

  return (
    <div className="bg-white rounded-card border border-sb-border p-4 shadow-e1">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-body font-semibold text-sb-ink">Cumulative Progress (S-Curve)</h3>
          <p className="text-caption text-sb-text-muted">Physical % against baseline</p>
        </div>

        {/* Range Toggle */}
        <div className="inline-flex rounded-lg border border-sb-border p-0.5 bg-sb-bg-subtle text-caption font-medium">
          <button
            type="button"
            data-testid="range-weekly"
            onClick={() => {
              setRange('weekly');
              setScrubberIndex(null);
            }}
            className={`px-2.5 py-1 rounded-md transition-colors ${
              range === 'weekly'
                ? 'bg-sb-navy text-white shadow-sm'
                : 'text-sb-text-subtle hover:text-sb-ink'
            }`}
          >
            Weekly
          </button>
          <button
            type="button"
            data-testid="range-monthly"
            onClick={() => {
              setRange('monthly');
              setScrubberIndex(null);
            }}
            className={`px-2.5 py-1 rounded-md transition-colors ${
              range === 'monthly'
                ? 'bg-sb-navy text-white shadow-sm'
                : 'text-sb-text-subtle hover:text-sb-ink'
            }`}
          >
            Monthly
          </button>
        </div>
      </div>

      {/* Legend & Tooltip Header */}
      <div className="flex items-center justify-between text-caption px-1 mb-2 bg-sb-bg-subtle py-1.5 px-3 rounded-card">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-sb-navy inline-block rounded-full" />
            <span className="text-sb-ink font-medium">Actual ({activePoint.actual !== undefined ? `${activePoint.actual}%` : '—'})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-sb-border-focus inline-block rounded-full" />
            <span className="text-sb-text-subtle">Planned ({activePoint.planned}%)</span>
          </div>
        </div>
        <span className="text-mono-s font-medium text-sb-navy">
          {activePoint.dateStr} 2026
        </span>
      </div>

      {/* Hand-built SVG Chart */}
      <div className="relative select-none touch-none">
        <svg
          width="100%"
          height={height}
          viewBox={`0 0 ${width} ${height}`}
          className="overflow-visible"
          onPointerMove={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const clientX = e.clientX - rect.left;
            const svgX = (clientX / rect.width) * width - margin.left;
            const clampedX = Math.max(0, Math.min(innerWidth, svgX));
            // Find closest index
            let closestIdx = 0;
            let minDiff = Infinity;
            data.forEach((pt, i) => {
              const diff = Math.abs(xScale(pt.date) - clampedX);
              if (diff < minDiff) {
                minDiff = diff;
                closestIdx = i;
              }
            });
            setScrubberIndex(closestIdx);
          }}
          onPointerLeave={() => setScrubberIndex(null)}
          role="img"
          aria-label="Progress S-curve chart"
        >
          <g transform={`translate(${margin.left}, ${margin.top})`}>
            {/* Horizontal Gridlines */}
            {[0, 25, 50, 75, 100].map((val) => (
              <g key={`${chartId}-grid-${val}`}>
                <line
                  x1={0}
                  x2={innerWidth}
                  y1={yScale(val)}
                  y2={yScale(val)}
                  stroke="#E2E8F0"
                  strokeDasharray="2,2"
                  strokeWidth={1}
                />
                <text
                  x={-6}
                  y={yScale(val) + 3}
                  textAnchor="end"
                  className="fill-sb-text-subtle text-[10px] font-mono"
                >
                  {val}%
                </text>
              </g>
            ))}

            {/* Planned Line (Grey / border-focus) */}
            <path
              d={plannedPath}
              fill="none"
              stroke="#94A3B8"
              strokeWidth={2}
              strokeDasharray="4,3"
            />

            {/* Actual Line (Navy) */}
            <path
              d={actualPath}
              fill="none"
              stroke="#14213D"
              strokeWidth={2.5}
            />

            {/* Data Date Line (20 Sep 2026) */}
            <line
              x1={dataDateX}
              x2={dataDateX}
              y1={0}
              y2={innerHeight}
              stroke="#D97706"
              strokeWidth={1.5}
            />
            <text
              x={dataDateX}
              y={-6}
              textAnchor="middle"
              className="fill-amber-700 text-[10px] font-semibold"
            >
              Data Date
            </text>

            {/* Scrubber indicator */}
            {activePoint && (
              <g>
                <line
                  x1={xScale(activePoint.date)}
                  x2={xScale(activePoint.date)}
                  y1={0}
                  y2={innerHeight}
                  stroke="#14213D"
                  strokeWidth={1}
                  strokeDasharray="2,2"
                />
                {activePoint.actual !== undefined && (
                  <circle
                    cx={xScale(activePoint.date)}
                    cy={yScale(activePoint.actual)}
                    r={4}
                    fill="#14213D"
                    stroke="#FFFFFF"
                    strokeWidth={2}
                  />
                )}
                <circle
                  cx={xScale(activePoint.date)}
                  cy={yScale(activePoint.planned)}
                  r={3.5}
                  fill="#94A3B8"
                  stroke="#FFFFFF"
                  strokeWidth={1.5}
                />
              </g>
            )}

            {/* X-axis date labels */}
            {data
              .filter((_, idx) => (range === 'weekly' ? idx % 3 === 0 : true))
              .map((d, i) => (
                <text
                  key={`${chartId}-x-${i}`}
                  x={xScale(d.date)}
                  y={innerHeight + 18}
                  textAnchor="middle"
                  className="fill-sb-text-subtle text-[10px] font-mono"
                >
                  {d.dateStr}
                </text>
              ))}
          </g>
        </svg>
      </div>
    </div>
  );
};
