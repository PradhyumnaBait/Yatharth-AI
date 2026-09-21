'use client';

import React, { useRef } from 'react';

export interface PinInputProps {
  length?: number;
  value: string;
  onChange: (value: string) => void;
  masked?: boolean;
  disabled?: boolean;
  className?: string;
  'data-testid'?: string;
}

export const PinInput: React.FC<PinInputProps> = ({
  length = 6,
  value,
  onChange,
  masked = true,
  disabled = false,
  className = '',
  'data-testid': testId = 'pin-input',
}) => {
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  const digits = Array.from({ length }, (_, i) => value[i] || '');

  const handleChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    const val = raw.replace(/\D/g, '');

    if (!val) {
      const currentDigits = Array.from({ length }, (_, i) => value[i] || '');
      currentDigits[index] = '';
      onChange(currentDigits.join('').trimEnd());
      return;
    }

    if (val.length > 1) {
      const multiDigits = val.slice(0, length);
      onChange(multiDigits);
      const targetFocus = Math.min(multiDigits.length, length - 1);
      inputsRef.current[targetFocus]?.focus();
      return;
    }

    const currentDigits = Array.from({ length }, (_, i) => value[i] || '');
    currentDigits[index] = val.slice(-1);
    const newValue = currentDigits.join('').slice(0, length);
    onChange(newValue);

    // Auto-advance
    if (val && index < length - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
    if (pasted) {
      onChange(pasted);
      const targetFocus = Math.min(pasted.length - 1, length - 1);
      inputsRef.current[targetFocus]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  return (
    <div
      data-testid={testId}
      className={`flex items-center justify-between gap-2 max-w-xs mx-auto ${className}`}
    >
      {Array.from({ length }).map((_, index) => {
        const val = digits[index] || '';
        return (
          <input
            key={index}
            ref={(el) => {
              inputsRef.current[index] = el;
            }}
            type={masked ? 'password' : 'text'}
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={length}
            disabled={disabled}
            value={val}
            onChange={(e) => handleChange(index, e)}
            onPaste={handlePaste}
            onKeyDown={(e) => handleKeyDown(index, e)}
            data-testid={`${testId}-digit-${index}`}
            className="w-11 h-13 rounded-[12px] bg-sb-white border border-sb-border text-center font-mono text-num-l text-sb-navy shadow-e1 focus:border-sb-navy focus:outline-none transition-colors disabled:opacity-50"
          />
        );
      })}
    </div>
  );
};
