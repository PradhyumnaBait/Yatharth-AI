'use client';

import React, { useState, useEffect } from 'react';
import { Sheet } from '@/components/ui/Sheet';
import { Button } from '@/components/ui/Button';
import { FormField } from '@/components/ui/FormField';
import { PinInput } from '@/components/ui/PinInput';
import { useUiStore } from '@/store/ui';
import { TRANSLATIONS } from '@/lib/translations';
import { CheckCircle2, AlertCircle, Info, KeyRound } from 'lucide-react';

export interface ForgotPinSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialEmployeeId?: string;
}

export const ForgotPinSheet: React.FC<ForgotPinSheetProps> = ({
  open,
  onOpenChange,
  initialEmployeeId = '',
}) => {
  const { language } = useUiStore();
  const t = TRANSLATIONS[language]?.forgotPinSheet || TRANSLATIONS.en.forgotPinSheet;

  const [step, setStep] = useState<1 | 2 | 3 | 'success'>(1);
  const [employeeId, setEmployeeId] = useState(initialEmployeeId);
  const [code, setCode] = useState('');
  const [codeError, setCodeError] = useState('');
  const [resendTimer, setResendTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);

  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Sync initialEmployeeId if provided
  useEffect(() => {
    if (initialEmployeeId) {
      setEmployeeId(initialEmployeeId);
    }
  }, [initialEmployeeId]);

  // Reset state when opening
  useEffect(() => {
    if (open) {
      setStep(1);
      setCode('');
      setCodeError('');
      setNewPin('');
      setConfirmPin('');
      setResendTimer(30);
      setCanResend(false);
    }
  }, [open]);

  // Resend countdown timer for step 2
  useEffect(() => {
    if (step !== 2 || canResend) return;

    const interval = setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [step, canResend]);

  const handleSendCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!employeeId.trim()) return;
    setStep(2);
    setResendTimer(30);
    setCanResend(false);
  };

  const handleVerifyCode = (overrideCode?: string) => {
    const codeToVerify = typeof overrideCode === 'string' ? overrideCode : code;
    if (codeToVerify !== '482913') {
      setCodeError(t.codeError);
      return;
    }
    setCodeError('');
    setStep(3);
  };

  const handleResend = () => {
    setResendTimer(30);
    setCanResend(false);
    setCodeError('');
  };

  const pinsMatch = newPin.length === 6 && confirmPin.length === 6 && newPin === confirmPin;
  const pinsMismatch = newPin.length === 6 && confirmPin.length === 6 && newPin !== confirmPin;

  const handleSavePin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pinsMatch) return;

    setIsSaving(true);
    await new Promise((r) => setTimeout(r, 600));
    setIsSaving(false);
    setStep('success');
  };

  const titles = {
    1: t.step1Title,
    2: t.step2Title,
    3: t.step3Title,
    success: t.successTitle,
  };

  const descriptions = {
    1: t.step1Desc,
    2: t.step2Desc,
    3: t.step3Desc,
    success: t.successDesc,
  };

  return (
    <Sheet
      open={open}
      onOpenChange={onOpenChange}
      title={titles[step]}
      description={descriptions[step]}
      data-testid="forgot-pin-sheet"
    >
      {step === 1 && (
        <form onSubmit={handleSendCode} className="space-y-4 pt-2">
          <FormField label={TRANSLATIONS[language]?.login?.employeeId || 'Employee ID'}>
            <input
              type="text"
              value={employeeId}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmployeeId(e.target.value.toUpperCase())}
              placeholder="e.g. SUP-0412"
              autoFocus
              data-testid="forgot-pin-id-input"
              className="w-full h-12 px-3.5 rounded-[12px] bg-sb-white border border-sb-border font-mono text-mono-m uppercase text-sb-navy shadow-e1 focus:border-sb-navy focus:outline-none transition-colors"
            />
          </FormField>

          <Button
            type="submit"
            variant="primary"
            disabled={!employeeId.trim()}
            className="w-full h-12"
            data-testid="send-code-btn"
          >
            {t.sendCode}
          </Button>
        </form>
      )}

      {step === 2 && (
        <div className="space-y-5 pt-2">
          {/* Demo hint callout */}
          <div className="p-3 bg-sb-bg rounded-[12px] border border-sb-border flex items-center gap-2.5 text-caption text-sb-navy">
            <Info className="w-4 h-4 text-sb-navy shrink-0" />
            <span className="font-medium font-mono text-mono-s">{t.demoHint}</span>
          </div>

          <div className="space-y-2">
            <PinInput
              length={6}
              value={code}
              onChange={(val) => {
                setCode(val);
                if (codeError) setCodeError('');
                if (val.length === 6 && val === '482913') {
                  handleVerifyCode(val);
                }
              }}
              masked={false}
              data-testid="forgot-pin-code-input"
            />

            {codeError && (
              <div
                data-testid="code-error-msg"
                className="flex items-center justify-center gap-1.5 text-caption text-sb-critical mt-1"
              >
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{codeError}</span>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between text-caption text-sb-ink-3">
            <span>
              {canResend ? (
                <button
                  type="button"
                  onClick={handleResend}
                  className="font-medium text-sb-navy underline underline-offset-2"
                >
                  {t.resendNow}
                </button>
              ) : (
                <span>{t.resendIn(resendTimer)}</span>
              )}
            </span>
          </div>

          <Button
            type="button"
            variant="primary"
            disabled={code.length < 6}
            onClick={() => handleVerifyCode()}
            className="w-full h-12"
            data-testid="verify-code-btn"
          >
            {t.verify}
          </Button>
        </div>
      )}

      {step === 3 && (
        <form onSubmit={handleSavePin} className="space-y-4 pt-2">
          <div className="space-y-2">
            <label className="block text-caption font-medium text-sb-ink-2">
              {t.newPin}
            </label>
            <PinInput
              length={6}
              value={newPin}
              onChange={setNewPin}
              data-testid="new-pin-input"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-caption font-medium text-sb-ink-2">
              {t.confirmPin}
            </label>
            <PinInput
              length={6}
              value={confirmPin}
              onChange={setConfirmPin}
              data-testid="confirm-pin-input"
            />
          </div>

          {pinsMismatch && (
            <div
              data-testid="pin-mismatch-msg"
              className="flex items-center gap-1.5 text-caption text-sb-critical"
            >
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{t.pinMismatch}</span>
            </div>
          )}

          <Button
            type="submit"
            variant="primary"
            disabled={!pinsMatch || isSaving}
            loading={isSaving}
            className="w-full h-12"
            data-testid="save-pin-btn"
          >
            {t.savePin}
          </Button>
        </form>
      )}

      {step === 'success' && (
        <div className="space-y-5 pt-3 pb-2 text-center">
          <div className="w-14 h-14 rounded-full bg-sb-verified-tint text-sb-verified flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <p className="text-body text-sb-ink-2 max-w-xs mx-auto">
            {t.successDesc}
          </p>

          <Button
            type="button"
            variant="primary"
            onClick={() => onOpenChange(false)}
            className="w-full h-12"
            data-testid="back-to-login-btn"
          >
            <KeyRound className="w-4 h-4 mr-2" />
            {t.backToLogin}
          </Button>
        </div>
      )}
    </Sheet>
  );
};
