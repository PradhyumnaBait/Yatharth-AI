import React from 'react';

export interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | 'container' | 'full';
  withGutter?: boolean;
  withVerticalRhythm?: boolean;
  'data-testid'?: string;
}

const maxWidthMap = {
  sm: 'max-w-screen-sm',
  md: 'max-w-screen-md',
  lg: 'max-w-screen-lg',
  xl: 'max-w-screen-xl',
  container: 'max-w-sb-container',
  full: 'max-w-full',
};

/**
 * Shared Layout Wrapper Component
 * Enforces consistent container max-width, gutters (16px mobile / 24px desktop),
 * and 8px-baseline vertical rhythm across views.
 */
export const PageContainer: React.FC<PageContainerProps> = ({
  children,
  className = '',
  maxWidth = 'container',
  withGutter = true,
  withVerticalRhythm = true,
  'data-testid': testId = 'page-container',
}) => {
  const maxWidthClass = maxWidthMap[maxWidth] || maxWidthMap.container;
  const gutterClass = withGutter ? 'px-4 lg:px-6' : '';
  const rhythmClass = withVerticalRhythm ? 'py-4 lg:py-6 space-y-4 lg:space-y-6' : '';

  return (
    <div
      data-testid={testId}
      className={`w-full mx-auto ${maxWidthClass} ${gutterClass} ${rhythmClass} ${className}`}
    >
      {children}
    </div>
  );
};
