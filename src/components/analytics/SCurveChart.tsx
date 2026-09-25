'use client';

import React, { useState, useId, useMemo, useEffect } from 'react';
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
  const [isRendered, setIsRendered] = useState(false);
  const chartId = useId();

  useEffect(() => {
    setIsRendered(false);
    const timer = setTimeout(() => setIsRendered(true), 20);
    return () => clearTimeout(timer);
  }, [range]);

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

  // Data date line x position (Today = 20 Sep 2026)
  const dataDateObj = new Date(2026, 8, 20);
  const dataDateX = xScale(dataDateObj);

  // Current active point for scrubber
  const activeIndex = scrubberIndex !== null ? scrubberIndex : (range === 'weekly' ? 7 : 4);
  const activePoint = data[Math.min(activeIndex, data.length - 1)];

  return (
    <div className="bg-white rounded-2xl border border-sb-border p-4 shadow-e1 animate-in fade-in duration-300">
      {/* Header & Controls */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-callout font-bold text-sb-navy">Cumulative Progress (S-Curve)</h3>
          <p className="text-[11px] text-sb-ink-3 font-mono">Planned / Actual / Today Timeline</p>
        </div>

        {/* Range Toggle */}
        <div className="inline-flex rounded-full border border-sb-border p-0.5 bg-sb-bg-subtle text-caption font-medium">
          <button
            type="button"
            data-testid="range-weekly"
            onClick={() => {
              setRange('weekly');
              setScrubberIndex(null);
            }}
            className={`px-2.5 py-1 rounded-full uppercase text-[11px] font-mono font-bold transition-all ${
              range === 'weekly'
                ? 'bg-sb-navy text-white shadow-2xs'
                : 'text-sb-ink-3 hover:text-sb-navy'
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
            className={`px-2.5 py-1 rounded-full uppercase text-[11px] font-mono font-bold transition-all ${
              range === 'monthly'
                ? 'bg-sb-navy text-white shadow-2xs'
                : 'text-sb-ink-3 hover:text-sb-navy'
            }`}
          >
            Monthly
          </button>
        </div>
      </div>

      {/* Clean Single Legend & Scrubber Readout */}
      <div className="flex items-center justify-between text-caption px-3 py-1.5 mb-3 bg-sb-bg-subtle rounded-xl border border-sb-border/50">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-1 bg-sb-navy inline-block rounded-full" />
            <span className="text-[11px] text-sb-navy font-bold font-mono">
              Actual {activePoint.actual !== undefined ? `${activePoint.actual}%` : '—'}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-1 bg-slate-400 inline-block rounded-full" />
            <span className="text-[11px] text-sb-ink-3 font-mono">
              Plan {activePoint.planned}%
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-600 inline-block" />
            <span className="text-[11px] text-amber-800 font-mono font-bold">
              Today
            </span>
          </div>
        </div>

        <span className="text-[11px] font-mono font-bold text-sb-navy bg-white px-2 py-0.5 rounded-md border border-sb-border/60 shadow-2xs">
          {activePoint.dateStr} 2026
        </span>
      </div>

      {/* Hand-built SVG Chart with Progressive Draw-in Animation & Minimal Gridlines */}
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
          <defs>
            <style>{`
              @keyframes drawProgressLine {
                from {
                  stroke-dashoffset: 600;
                }
                to {
                  stroke-dashoffset: 0;
                }
              }
              @keyframes drawTodayLine {
                from {
                  opacity: 0;
                  transform: scaleY(0);
                }
                to {
                  opacity: 1;
                  transform: scaleY(1);
                }
              }
            `}</style>
          </defs>

          <g transform={`translate(${margin.left}, ${margin.top})`}>
            {/* Minimal Background Baseline & Target Gridlines (Only 0%, 50%, 100% to remove clutter) */}
            {[0, 50, 100].map((val) => (
              <g key={`${chartId}-grid-${val}`}>
                <line
                  x1={0}
                  x2={innerWidth}
                  y1={yScale(val)}
                  y2={yScale(val)}
                  stroke="#E2E8F0"
                  strokeWidth={val === 0 ? 1.5 : 0.8}
                  strokeDasharray={val === 50 ? '3,3' : undefined}
                />
                <text
                  x={-6}
                  y={yScale(val) + 3}
                  textAnchor="end"
                  className="fill-sb-ink-3 text-[10px] font-mono"
                >
                  {val}%
                </text>
              </g>
            ))}

            {/* Planned Line (Grey / dashed) with Progressive Draw-in */}
            <path
              d={plannedPath}
              fill="none"
              stroke="#94A3B8"
              strokeWidth={2}
              strokeDasharray="4,4"
              style={{
                strokeDashoffset: isRendered ? 0 : 600,
                transition: 'stroke-dashoffset 900ms ease-out',
              }}
            />

            {/* Actual Line (Navy) with Progressive Draw-in */}
            <path
              d={actualPath}
              fill="none"
              stroke="#14213D"
              strokeWidth={2.75}
              strokeLinecap="round"
              style={{
                strokeDasharray: 600,
                strokeDashoffset: isRendered ? 0 : 600,
                transition: 'stroke-dashoffset 1100ms cubic-bezier(0.16, 1, 0.3, 1)',
              }}
            />

            {/* Today Line (Vertical marker with progressive reveal) */}
            <g
              style={{
                opacity: isRendered ? 1 : 0,
                transition: 'opacity 600ms ease-out 500ms',
              }}
            >
              <line
                x1={dataDateX}
                x2={dataDateX}
                y1={0}
                y2={innerHeight}
                stroke="#D97706"
                strokeWidth={1.5}
                strokeDasharray="2,2"
              />
              <rect
                x={dataDateX - 22}
                y={-14}
                width={44}
                height={14}
                rx={4}
                fill="#FEF3C7"
                stroke="#F59E0B"
                strokeWidth={0.75}
              />
              <text
                x={dataDateX}
                y={-4}
                textAnchor="middle"
                className="fill-amber-900 text-[9px] font-mono font-bold uppercase"
              >
                Today
              </text>
            </g>

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
                  opacity={0.6}
                />
                {activePoint.actual !== undefined && (
                  <circle
                    cx={xScale(activePoint.date)}
                    cy={yScale(activePoint.actual)}
                    r={4.5}
                    fill="#14213D"
                    stroke="#FFFFFF"
                    strokeWidth={2}
                    className="transition-all duration-150"
                  />
                )}
                <circle
                  cx={xScale(activePoint.date)}
                  cy={yScale(activePoint.planned)}
                  r={3.5}
                  fill="#94A3B8"
                  stroke="#FFFFFF"
                  strokeWidth={1.5}
                  className="transition-all duration-150"
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
                  y={innerHeight + 16}
                  textAnchor="middle"
                  className="fill-sb-ink-3 text-[10px] font-mono"
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
