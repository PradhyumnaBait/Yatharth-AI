'use client';

import React, { useEffect } from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { motion, AnimatePresence, useDragControls, PanInfo } from 'framer-motion';

export interface SheetProps {
  open?: boolean;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  onClose?: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  'data-testid'?: string;
}

export const Sheet: React.FC<SheetProps> = ({
  open,
  isOpen,
  onOpenChange,
  onClose,
  title,
  description,
  children,
  'data-testid': testId = 'bottom-sheet',
}) => {
  const isSheetOpen = open ?? isOpen ?? false;
  const handleClose = React.useCallback(() => {
    onOpenChange?.(false);
    onClose?.();
  }, [onOpenChange, onClose]);

  const handleOpenChange = (val: boolean) => {
    onOpenChange?.(val);
    if (!val) onClose?.();
  };

  const dragControls = useDragControls();

  const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (info.offset.y > 100 || info.velocity.y > 300) {
      handleClose();
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isSheetOpen) {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSheetOpen, handleClose]);

  return (
    <DialogPrimitive.Root open={isSheetOpen} onOpenChange={handleOpenChange}>
      <AnimatePresence>
        {isSheetOpen && (
          <DialogPrimitive.Portal forceMount>
            {/* Scrim */}
            <DialogPrimitive.Overlay asChild>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.18 }}
                className="fixed inset-0 z-50 bg-[#14213D]/40 backdrop-blur-none"
                data-testid={`${testId}-overlay`}
              />
            </DialogPrimitive.Overlay>

            {/* Content Card */}
            <DialogPrimitive.Content asChild>
              <motion.div
                drag="y"
                dragControls={dragControls}
                dragListener={false}
                dragConstraints={{ top: 0, bottom: 0 }}
                dragElastic={{ top: 0.05, bottom: 0.6 }}
                onDragEnd={handleDragEnd}
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', stiffness: 380, damping: 26, mass: 0.8 }}
                data-testid={testId}
                className="fixed bottom-0 left-0 right-0 z-50 mx-auto max-w-md w-full max-h-[90vh] bg-sb-white rounded-t-[28px] shadow-e3 border-t border-sb-border flex flex-col focus:outline-none overflow-hidden pb-safe"
              >
                {/* Grabber */}
                <div
                  onPointerDown={(e) => dragControls.start(e)}
                  className="w-full pt-3 pb-2 flex items-center justify-center cursor-grab active:cursor-grabbing touch-none select-none"
                  data-testid={`${testId}-grabber`}
                >
                  <div className="w-9 h-1 rounded-full bg-sb-border" />
                </div>

                {title && (
                  <div className="px-5 pt-1 pb-2">
                    <DialogPrimitive.Title className="text-title-3 font-semibold text-sb-navy">
                      {title}
                    </DialogPrimitive.Title>
                    {description && (
                      <DialogPrimitive.Description className="text-caption text-sb-ink-3 mt-0.5">
                        {description}
                      </DialogPrimitive.Description>
                    )}
                  </div>
                )}

                <div className="flex-1 overflow-y-auto px-5 pb-6">
                  {children}
                </div>
              </motion.div>
            </DialogPrimitive.Content>
          </DialogPrimitive.Portal>
        )}
      </AnimatePresence>
    </DialogPrimitive.Root>
  );
};
