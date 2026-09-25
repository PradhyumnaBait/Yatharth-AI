'use client';

import React from 'react';

export type SkeletonVariant = 'rect' | 'text' | 'avatar' | 'card' | 'pill' | 'row';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: SkeletonVariant;
  width?: string | number;
  height?: string | number;
  className?: string;
  'data-testid'?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  variant = 'rect',
  width,
  height,
  className = '',
  style,
  'data-testid': testId = 'skeleton',
  ...props
}) => {
  const getVariantStyles = (): string => {
    switch (variant) {
      case 'avatar':
        return 'rounded-full w-10 h-10 shrink-0';
      case 'text':
        return 'rounded-md h-4 w-3/4';
      case 'pill':
        return 'rounded-full h-7 w-20';
      case 'card':
        return 'rounded-2xl h-28 w-full p-4';
      case 'row':
        return 'rounded-xl h-14 w-full';
      case 'rect':
      default:
        return 'rounded-lg';
    }
  };

  const customStyle: React.CSSProperties = {
    ...(width !== undefined ? { width: typeof width === 'number' ? `${width}px` : width } : {}),
    ...(height !== undefined ? { height: typeof height === 'number' ? `${height}px` : height } : {}),
    ...style,
  };

  return (
    <div
      data-testid={testId}
      aria-hidden="true"
      className={`sb-skeleton-shimmer ${getVariantStyles()} ${className}`}
      style={customStyle}
      {...props}
    />
  );
};
