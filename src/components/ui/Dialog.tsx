'use client';

import React from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { Button } from './Button';

export interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  destructive?: boolean;
  'data-testid'?: string;
}

export const Dialog: React.FC<DialogProps> = ({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  destructive = true,
  'data-testid': testId = 'dialog',
}) => {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay
          data-testid={`${testId}-overlay`}
          className="fixed inset-0 z-50 bg-[#14213D]/40 animate-fade-in"
        />
        <DialogPrimitive.Content
          data-testid={testId}
          className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[90vw] max-w-sm rounded-[20px] bg-sb-white p-6 shadow-e3 border border-sb-border focus:outline-none"
        >
          <DialogPrimitive.Title className="text-title-3 font-semibold text-sb-navy">
            {title}
          </DialogPrimitive.Title>
          <DialogPrimitive.Description className="text-body text-sb-ink-2 mt-2">
            {description}
          </DialogPrimitive.Description>
          <div className="mt-6 flex items-center justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="h-10 px-4 text-callout"
              data-testid={`${testId}-cancel`}
            >
              {cancelLabel}
            </Button>
            <Button
              variant={destructive ? 'destructive-outline' : 'primary'}
              onClick={() => {
                onConfirm();
                onOpenChange(false);
              }}
              className="h-10 px-4 text-callout"
              data-testid={`${testId}-confirm`}
            >
              {confirmLabel}
            </Button>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
};
