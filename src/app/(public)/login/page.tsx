'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Globe, Eye, EyeOff, AlertCircle, Building2, UserCheck, ShieldAlert } from 'lucide-react';
import { Logo } from '@/components/ui/Logo';
import { Button } from '@/components/ui/Button';
import { FormField } from '@/components/ui/FormField';
import { PinInput } from '@/components/ui/PinInput';
import {
  LanguageSheet,
  DemoAccountsSheet,
  ForgotPinSheet,
  PermissionsPrimerSheet,
} from '@/features/auth';
import { useAuthStore, DEMO_USERS } from '@/store/auth';
import { useUiStore } from '@/store/ui';
import { TRANSLATIONS } from '@/lib/translations';

const LANGUAGE_LABELS: Record<string, string> = {
  en: 'English',
  hi: 'हिन्दी',
  mr: 'मराठी',
  gu: 'ગુજરાતી',
};

export default function LoginPage() {
  const router = useRouter();
  const {
    setUser,
    hasSeenPermissionsPrimer,
    recordFailedAttempt,
    resetLockout,
    lockoutUntil,
  } = useAuthStore();
  const { language } = useUiStore();
  const t = TRANSLATIONS[language]?.login || TRANSLATIONS.en.login;

  // Form inputs
  const [employeeId, setEmployeeId] = useState('');
  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Modals / Sheets
  const [isLangSheetOpen, setIsLangSheetOpen] = useState(false);
  const [isDemoSheetOpen, setIsDemoSheetOpen] = useState(false);
  const [isForgotPinOpen, setIsForgotPinOpen] = useState(false);
  const [isPermissionsOpen, setIsPermissionsOpen] = useState(false);

  // Lockout countdown timer
  const [secondsRemaining, setSecondsRemaining] = useState(0);

  useEffect(() => {
    if (!lockoutUntil) {
      setSecondsRemaining(0);
      return;
    }

    const checkLockout = () => {
      const diff = Math.ceil((lockoutUntil - Date.now()) / 1000);
      if (diff <= 0) {
        setSecondsRemaining(0);
        resetLockout();
        setErrorMessage('');
      } else {
        setSecondsRemaining(diff);
      }
    };

    checkLockout();
    const timer = setInterval(checkLockout, 1000);
    return () => clearInterval(timer);
  }, [lockoutUntil, resetLockout]);

  const isLocked = secondsRemaining > 0;

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLocked) return;
    const cleanId = employeeId.trim().toUpperCase();
    if (!cleanId || pin.length < 6) return;

    setIsLoading(true);
    setErrorMessage('');

    // Simulate 700ms verification per SPEC §6 A3
    await new Promise((r) => setTimeout(r, 700));

    // Match against mock users
    const matched = Object.values(DEMO_USERS).find((u) => u.employeeId === cleanId);

    if (!matched) {
      setIsLoading(false);
      setErrorMessage(t.unknownId(cleanId));
      return;
    }

    if (pin !== '123456') {
      setIsLoading(false);
      const { locked, remainingAttempts, lockoutSeconds } = recordFailedAttempt();
      if (locked) {
        setErrorMessage(t.lockedMsg(lockoutSeconds));
      } else {
        setErrorMessage(t.wrongPin(remainingAttempts));
      }
      return;
    }

    // Success
    setIsLoading(false);
    setUser(matched);

    // If supervisor and hasn't seen permissions primer, show A8 sheet
    if (matched.role === 'supervisor' && !hasSeenPermissionsPrimer) {
      setIsPermissionsOpen(true);
    } else {
      router.push('/home');
    }
  };

  return (
    <div
      data-testid="login-screen-a3"
      className="relative w-full min-h-screen max-w-[390px] mx-auto bg-sb-bg flex flex-col justify-between p-6 select-none"
    >
      {/* Top Bar: Logo lockup left, Language chip right */}
      <div className="flex items-center justify-between pt-4 mb-8">
        <Link href="/welcome" aria-label="Go to Welcome">
          <Logo size="sm" showWordmark layout="row" />
        </Link>

        <button
          type="button"
          onClick={() => setIsLangSheetOpen(true)}
          data-testid="language-chip"
          className="h-8 px-3 rounded-full bg-sb-white border border-sb-border text-sb-navy font-semibold text-caption flex items-center gap-1.5 shadow-e1 active:scale-95 transition-transform"
        >
          <Globe className="w-3.5 h-3.5 text-sb-ink-3" />
          <span>{LANGUAGE_LABELS[language] || 'English'}</span>
        </button>
      </div>

      {/* Main Login Card */}
      <div className="flex-1 flex flex-col justify-center max-w-[342px] mx-auto w-full">
        <div className="mb-6">
          <h1
            data-testid="login-title"
            className="text-title-1 font-bold text-sb-navy tracking-tight mb-1.5"
          >
            {t.title}
          </h1>
          <p className="text-body text-sb-ink-2">
            {t.subtitle}
          </p>
        </div>

        {/* Lockout Banner */}
        {isLocked && (
          <div
            data-testid="lockout-banner"
            className="p-3.5 mb-5 bg-sb-critical-tint rounded-[16px] border border-sb-critical/30 flex items-center gap-3 text-callout font-medium text-sb-critical-ink"
          >
            <ShieldAlert className="w-5 h-5 text-sb-critical shrink-0" />
            <span>{t.lockedMsg(secondsRemaining)}</span>
          </div>
        )}

        <form onSubmit={handleSignIn} className="space-y-4">
          {/* Employee ID Input */}
          <div>
            <FormField label={t.employeeId}>
              <input
                type="text"
                value={employeeId}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  setEmployeeId(e.target.value.toUpperCase());
                  if (errorMessage) setErrorMessage('');
                }}
                placeholder={t.employeeIdPlaceholder}
                disabled={isLocked || isLoading}
                autoCapitalize="characters"
                data-testid="employee-id-input"
                className="w-full h-12 px-3.5 rounded-[12px] bg-sb-white border border-sb-border font-mono text-mono-m uppercase text-sb-navy shadow-e1 focus:border-sb-navy focus:outline-none transition-colors disabled:opacity-50"
              />
            </FormField>
          </div>

          {/* PIN Input with Show/Hide Toggle */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-caption font-medium text-sb-ink-2">
                {t.pin}
              </label>
              <button
                type="button"
                onClick={() => setShowPin(!showPin)}
                className="text-caption text-sb-ink-3 hover:text-sb-navy flex items-center gap-1"
                tabIndex={-1}
                aria-label={showPin ? 'Hide PIN' : 'Show PIN'}
              >
                {showPin ? (
                  <>
                    <EyeOff className="w-3.5 h-3.5" />
                    <span>Hide</span>
                  </>
                ) : (
                  <>
                    <Eye className="w-3.5 h-3.5" />
                    <span>Show</span>
                  </>
                )}
              </button>
            </div>

            <PinInput
              length={6}
              value={pin}
              onChange={(val) => {
                setPin(val);
                if (errorMessage) setErrorMessage('');
              }}
              masked={!showPin}
              disabled={isLocked || isLoading}
              data-testid="pin-input"
            />
          </div>

          {/* Inline Error Message */}
          {errorMessage && (
            <div
              data-testid="login-error-msg"
              className="flex items-start gap-2 p-3 bg-sb-critical-tint/60 rounded-[12px] text-caption text-sb-critical-ink border border-sb-critical/20"
            >
              <AlertCircle className="w-4 h-4 text-sb-critical shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Sign In Primary Pill */}
          <div className="pt-2">
            <Button
              type="submit"
              variant="primary"
              disabled={!employeeId.trim() || pin.length < 6 || isLocked || isLoading}
              loading={isLoading}
              className="w-full h-14 text-callout font-semibold shadow-e2"
              data-testid="sign-in-btn"
            >
              {isLoading ? t.signingIn : t.signIn}
            </Button>
          </div>

          {/* Company SSO Outline Button */}
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsDemoSheetOpen(true)}
            className="w-full h-12 text-callout"
            data-testid="sso-btn"
          >
            <Building2 className="w-4 h-4 mr-2 text-sb-ink-3" />
            {t.sso}
          </Button>
        </form>

        {/* Links: Forgot PIN & Request Access */}
        <div className="flex items-center justify-between pt-5 text-callout text-sb-navy font-medium">
          <button
            type="button"
            onClick={() => setIsForgotPinOpen(true)}
            data-testid="forgot-pin-link"
            className="hover:underline underline-offset-2"
          >
            {t.forgotPin}
          </button>

          <Link
            href="/request-access"
            data-testid="request-access-link"
            className="hover:underline underline-offset-2"
          >
            {t.requestAccess}
          </Link>
        </div>

        {/* Demo Accounts Quick-Trigger */}
        <div className="pt-6 pb-2 text-center">
          <button
            type="button"
            onClick={() => setIsDemoSheetOpen(true)}
            data-testid="demo-accounts-trigger"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-sb-navy-tint text-sb-navy text-caption font-semibold hover:bg-sb-navy hover:text-sb-white transition-colors"
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>{t.demoAccounts}</span>
          </button>
        </div>
      </div>

      {/* Hairline-flanked Caption */}
      <div className="w-full flex items-center justify-center gap-3 text-caption text-sb-ink-3 uppercase tracking-wider select-none py-2">
        <div className="h-[1px] flex-1 bg-sb-border" />
        <span className="shrink-0 text-[11px] font-medium">
          {TRANSLATIONS[language]?.welcome?.caption || 'Planning-to-Execution Intelligence'}
        </span>
        <div className="h-[1px] flex-1 bg-sb-border" />
      </div>

      {/* Sheets */}
      <LanguageSheet
        open={isLangSheetOpen}
        onOpenChange={setIsLangSheetOpen}
      />

      <DemoAccountsSheet
        open={isDemoSheetOpen}
        onOpenChange={setIsDemoSheetOpen}
      />

      <ForgotPinSheet
        open={isForgotPinOpen}
        onOpenChange={setIsForgotPinOpen}
        initialEmployeeId={employeeId}
      />

      <PermissionsPrimerSheet
        open={isPermissionsOpen}
        onOpenChange={setIsPermissionsOpen}
      />
    </div>
  );
}
