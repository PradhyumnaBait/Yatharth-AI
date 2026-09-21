'use client';

import React from 'react';
import Image from 'next/image';
import { Calendar, Layers } from 'lucide-react';

export interface ProjectCardProps {
  imageSrc?: string;
  title: string;
  progress: number; // e.g. 68
  plannedProgress?: number; // e.g. 74
  dataDate: string; // e.g. "20 Sep 2026"
  activeActivitiesCount?: number; // e.g. 14
  metaRightContent?: React.ReactNode;
  onClick?: () => void;
  className?: string;
  'data-testid'?: string;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({
  imageSrc = '/images/refinery-pipes.jpg',
  title,
  progress,
  plannedProgress,
  dataDate,
  activeActivitiesCount = 14,
  metaRightContent,
  onClick,
  className = '',
  'data-testid': testId = 'project-card',
}) => {
  return (
    <div
      data-testid={testId}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      className={`relative w-full rounded-[20px] overflow-hidden bg-sb-white border border-sb-border shadow-e1 cursor-pointer transition-transform active:scale-[0.99] focus-visible:outline focus-visible:outline-2 focus-visible:outline-sb-navy ${className}`}
    >
      {/* 16:9 Hero Photo (Height ~168px) with Flat Scrim */}
      <div className="relative w-full h-[168px] bg-sb-navy">
        <Image
          src={imageSrc}
          alt={title}
          fill
          priority
          unoptimized
          sizes="(max-width: 450px) 100vw, 400px"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-sb-scrim" />
      </div>

      {/* White Panel Overlapping the Photo by 24px, Radius 24px */}
      <div className="relative -mt-6 bg-sb-white rounded-t-[24px] p-5 pt-4">
        <h3 className="text-title-3 font-semibold text-sb-navy line-clamp-1 mb-3">
          {title}
        </h3>

        {/* Progress Display */}
        <div className="flex items-baseline justify-between mb-2">
          <div className="flex items-baseline gap-2">
            <span className="text-num-l font-semibold text-sb-navy">
              {progress}%
            </span>
            <span className="text-caption font-medium text-sb-ink-2">
              Physical Progress
            </span>
          </div>
          {plannedProgress !== undefined && (
            <span className="text-caption text-sb-ink-3">
              Planned: {plannedProgress}%
            </span>
          )}
        </div>

        {/* 6px Navy Bar on --sb-border track with optional planned marker */}
        <div className="relative w-full h-1.5 bg-sb-border rounded-full overflow-hidden mb-4">
          <div
            className="h-full bg-sb-navy rounded-full transition-all duration-300"
            style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
          />
          {plannedProgress !== undefined && (
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-sb-ink-2 z-10"
              style={{ left: `${Math.min(100, Math.max(0, plannedProgress))}%` }}
              title={`Planned: ${plannedProgress}%`}
            />
          )}
        </div>

        {/* Meta Row */}
        <div className="flex items-center justify-between border-t border-sb-border pt-3 text-caption text-sb-ink-2">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-sb-ink-3" strokeWidth={1.5} />
            <span>Data Date:</span>
            <span className="font-mono text-mono-m font-semibold text-sb-navy">
              {dataDate}
            </span>
          </div>
          {metaRightContent ? (
            metaRightContent
          ) : (
            <div className="flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-sb-ink-3" strokeWidth={1.5} />
              <span>Activities:</span>
              <span className="font-mono text-mono-m font-semibold text-sb-navy">
                {activeActivitiesCount}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
