'use client';

import React from 'react';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  'data-testid'?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  'data-testid': testId = 'skeleton',
  ...props
}) => {
  return (
    <div
      data-testid={testId}
      className={`bg-sb-border/60 rounded-[8px] animate-pulse duration-[1200ms] ${className}`}
      {...props}
    />
  );
};
