'use client';

import React from 'react';

export interface FormFieldProps {
  label: string;
  error?: string;
  caption?: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
  'data-testid'?: string;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  error,
  caption,
  required = false,
  children,
  className = '',
  'data-testid': testId = 'form-field',
}) => {
  return (
    <div data-testid={testId} className={`flex flex-col gap-1.5 w-full ${className}`}>
      <label className="text-caption font-semibold text-sb-navy flex items-center justify-between">
        <span>
          {label}
          {required && <span className="text-sb-critical ml-0.5">*</span>}
        </span>
      </label>
      {children}
      {error ? (
        <span data-testid={`${testId}-error`} className="text-caption font-medium text-sb-critical-ink">
          {error}
        </span>
      ) : caption ? (
        <span className="text-caption text-sb-ink-3">
          {caption}
        </span>
      ) : null}
    </div>
  );
};
