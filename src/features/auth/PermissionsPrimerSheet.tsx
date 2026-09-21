'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sheet } from '@/components/ui/Sheet';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/store/auth';
import { useUiStore } from '@/store/ui';
import { TRANSLATIONS } from '@/lib/translations';
import { Mic, Bell, MapPin, Check, AlertTriangle } from 'lucide-react';

export interface PermissionsPrimerSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type PermissionStatus = 'prompt' | 'granted' | 'denied' | 'skipped';

export const PermissionsPrimerSheet: React.FC<PermissionsPrimerSheetProps> = ({
  open,
  onOpenChange,
}) => {
  const router = useRouter();
  const { setHasSeenPermissionsPrimer } = useAuthStore();
  const { language } = useUiStore();
  const t = TRANSLATIONS[language]?.permissions || TRANSLATIONS.en.permissions;

  const [micStatus, setMicStatus] = useState<PermissionStatus>('prompt');
  const [notifStatus, setNotifStatus] = useState<PermissionStatus>('prompt');
  const [locStatus, setLocStatus] = useState<PermissionStatus>('prompt');

  const requestMic = async () => {
    try {
      if (navigator.mediaDevices?.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach((track) => track.stop());
        setMicStatus('granted');
      } else {
        setMicStatus('granted');
      }
    } catch {
      setMicStatus('denied');
    }
  };

  const requestNotif = async () => {
    try {
      if (typeof window !== 'undefined' && 'Notification' in window) {
        const res = await Notification.requestPermission();
        setNotifStatus(res === 'granted' ? 'granted' : 'denied');
      } else {
        setNotifStatus('granted');
      }
    } catch {
      setNotifStatus('skipped');
    }
  };

  const requestLoc = () => {
    if (typeof window !== 'undefined' && 'geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        () => setLocStatus('granted'),
        () => setLocStatus('denied'),
        { timeout: 5000 }
      );
    } else {
      setLocStatus('skipped');
    }
  };

  const handleContinue = () => {
    setHasSeenPermissionsPrimer(true);
    onOpenChange(false);
    router.push('/home');
  };

  return (
    <Sheet
      open={open}
      onOpenChange={onOpenChange}
      title={t.title}
      description={t.subtitle}
      data-testid="permissions-primer-sheet"
    >
      <div className="space-y-3 pt-2 pb-2">
        {/* Microphone */}
        <div
          data-testid="perm-row-mic"
          className="p-3.5 rounded-[16px] border border-sb-border bg-sb-white flex items-center justify-between gap-3"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-full bg-sb-navy-tint text-sb-navy flex items-center justify-center shrink-0">
              <Mic className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="text-callout font-semibold text-sb-navy">
                {t.micTitle}
              </div>
              <div className="text-caption text-sb-ink-3 line-clamp-2">
                {t.micDesc}
              </div>
            </div>
          </div>

          <div className="shrink-0 flex items-center gap-1.5">
            {micStatus === 'granted' ? (
              <span className="inline-flex items-center gap-1 text-caption font-semibold text-sb-verified bg-sb-verified-tint px-2.5 py-1 rounded-full">
                <Check className="w-3.5 h-3.5" />
                {t.allowed}
              </span>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => setMicStatus('skipped')}
                  className="text-caption font-medium h-8 px-2.5 rounded-full border border-sb-border bg-sb-white text-sb-navy hover:bg-sb-bg transition-colors"
                >
                  {t.notNow}
                </button>
                <button
                  type="button"
                  onClick={requestMic}
                  className="text-caption font-semibold h-8 px-3 rounded-full bg-sb-navy text-sb-white hover:bg-sb-navy-pressed transition-colors"
                  data-testid="allow-mic-btn"
                >
                  {t.allow}
                </button>
              </>
            )}
          </div>
        </div>

        {/* Notifications */}
        <div
          data-testid="perm-row-notif"
          className="p-3.5 rounded-[16px] border border-sb-border bg-sb-white flex items-center justify-between gap-3"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-full bg-sb-bg text-sb-ink-2 flex items-center justify-center shrink-0">
              <Bell className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="text-callout font-semibold text-sb-navy">
                {t.notifTitle}
              </div>
              <div className="text-caption text-sb-ink-3 line-clamp-2">
                {t.notifDesc}
              </div>
            </div>
          </div>

          <div className="shrink-0 flex items-center gap-1.5">
            {notifStatus === 'granted' ? (
              <span className="inline-flex items-center gap-1 text-caption font-semibold text-sb-verified bg-sb-verified-tint px-2.5 py-1 rounded-full">
                <Check className="w-3.5 h-3.5" />
                {t.allowed}
              </span>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => setNotifStatus('skipped')}
                  className="text-caption font-medium h-8 px-2.5 rounded-full border border-sb-border bg-sb-white text-sb-navy hover:bg-sb-bg transition-colors"
                >
                  {t.notNow}
                </button>
                <button
                  type="button"
                  onClick={requestNotif}
                  className="text-caption font-semibold h-8 px-3 rounded-full bg-sb-navy text-sb-white hover:bg-sb-navy-pressed transition-colors"
                >
                  {t.allow}
                </button>
              </>
            )}
          </div>
        </div>

        {/* Location */}
        <div
          data-testid="perm-row-loc"
          className="p-3.5 rounded-[16px] border border-sb-border bg-sb-white flex items-center justify-between gap-3"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-full bg-sb-bg text-sb-ink-2 flex items-center justify-center shrink-0">
              <MapPin className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="text-callout font-semibold text-sb-navy">
                {t.locTitle}
              </div>
              <div className="text-caption text-sb-ink-3 line-clamp-2">
                {t.locDesc}
              </div>
            </div>
          </div>

          <div className="shrink-0 flex items-center gap-1.5">
            {locStatus === 'granted' ? (
              <span className="inline-flex items-center gap-1 text-caption font-semibold text-sb-verified bg-sb-verified-tint px-2.5 py-1 rounded-full">
                <Check className="w-3.5 h-3.5" />
                {t.allowed}
              </span>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => setLocStatus('skipped')}
                  className="text-caption font-medium h-8 px-2.5 rounded-full border border-sb-border bg-sb-white text-sb-navy hover:bg-sb-bg transition-colors"
                >
                  {t.notNow}
                </button>
                <button
                  type="button"
                  onClick={requestLoc}
                  className="text-caption font-semibold h-8 px-3 rounded-full bg-sb-navy text-sb-white hover:bg-sb-navy-pressed transition-colors"
                >
                  {t.allow}
                </button>
              </>
            )}
          </div>
        </div>

        {/* Warning if mic was denied */}
        {micStatus === 'denied' && (
          <div
            data-testid="mic-denied-warning"
            className="p-3 bg-sb-critical-tint rounded-[12px] border border-sb-critical/20 flex items-start gap-2 text-caption text-sb-critical-ink"
          >
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{t.micDeniedWarning}</span>
          </div>
        )}
      </div>

      <div className="pt-3 pb-2">
        <Button
          type="button"
          variant="primary"
          onClick={handleContinue}
          className="w-full h-12"
          data-testid="permissions-continue-btn"
        >
          {t.continue}
        </Button>
      </div>
    </Sheet>
  );
};
