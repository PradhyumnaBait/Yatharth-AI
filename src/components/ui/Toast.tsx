'use client';

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export interface ToastProps {
  message: string;
  open: boolean;
  onClose: () => void;
  onUndo?: () => void;
  undoLabel?: string;
  duration?: number;
  'data-testid'?: string;
}

export const Toast: React.FC<ToastProps> = ({
  message,
  open,
  onClose,
  onUndo,
  undoLabel = 'Undo',
  duration,
  'data-testid': testId = 'toast-notification',
}) => {
  const toastDuration = duration || (onUndo ? 8000 : 4000);

  useEffect(() => {
    if (!open) return;
    const timer = setTimeout(() => {
      onClose();
    }, toastDuration);
    return () => clearTimeout(timer);
  }, [open, toastDuration, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.18 }}
          data-testid={testId}
          role="status"
          aria-live="polite"
          className="fixed bottom-24 left-4 right-4 z-50 mx-auto max-w-sm h-12 px-4 rounded-full bg-sb-navy text-sb-white shadow-e3 flex items-center justify-between gap-3 text-callout font-medium"
        >
          <span className="truncate">{message}</span>
          {onUndo && (
            <button
              type="button"
              data-testid={`${testId}-undo`}
              onClick={() => {
                onUndo();
                onClose();
              }}
              className="px-2 py-1 rounded-full text-caption font-semibold text-sb-white bg-sb-navy-pressed hover:bg-sb-white/20 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-sb-white"
            >
              {undoLabel}
            </button>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};
