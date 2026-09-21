'use client';

import React, { useState, useMemo } from 'react';
import { PageHeader } from '@/components/shell/PageHeader';
import { useUiStore } from '@/store/ui';
import { useOfflineStore } from '@/store/offline';
import { useEventsStore } from '@/store/events';
import { useProjectStore } from '@/store/project';
import { useAuthStore } from '@/store/auth';
import {
  Globe,
  Wifi,
  WifiOff,
  Bell,
  Sliders,
  Lock,
  RotateCcw,
  Check,
  Smartphone,
  Info,
} from 'lucide-react';
import { useTranslation } from '@/i18n/useTranslation';

export default function SettingsPage() {
  const { t } = useTranslation();
  const {
    autoAcceptThreshold,
    reviewThreshold,
    isSimulatingOffline,
    language,
    textSize,
    setAutoAcceptThreshold,
    setReviewThreshold,
    setSimulateOffline,
    setLanguage,
    setTextSize,
    showToast,
  } = useUiStore();

  const { queuedReports, removeQueuedReport } = useOfflineStore();
  const [isSyncing, setIsSyncing] = useState(false);
  const events = useEventsStore((s) => s.events);
  const resetEvents = useEventsStore((s) => s.resetEvents);
  const resetProjectData = useProjectStore((s) => s.resetProjectData);
  const user = useAuthStore((s) => s.user);

  // Notification toggles state
  const [criticalAlerts, setCriticalAlerts] = useState(true);
  const [reviewAlerts, setReviewAlerts] = useState(true);
  const [dailyDigest, setDailyDigest] = useState(false);

  // Compute live tier counts based on slider thresholds
  const tierCounts = useMemo(() => {
    let autoAccept = 0;
    let review = 0;
    let unmatched = 0;

    events.forEach((e) => {
      const conf = e.confidence ?? 50;
      if (conf >= autoAcceptThreshold) {
        autoAccept++;
      } else if (conf >= reviewThreshold) {
        review++;
      } else {
        unmatched++;
      }
    });

    const total = events.length || 1;
    return {
      autoAccept,
      review,
      unmatched,
      autoAcceptPct: Math.round((autoAccept / total) * 100),
      reviewPct: Math.round((review / total) * 100),
      unmatchedPct: Math.round((unmatched / total) * 100),
    };
  }, [events, autoAcceptThreshold, reviewThreshold]);

  const handleResetData = () => {
    resetEvents('reference');
    resetProjectData();
    showToast('Demo data reset to reference snapshot.');
  };

  const handleSyncNow = async () => {
    setIsSyncing(true);
    queuedReports.forEach((r) => removeQueuedReport(r.id));
    setIsSyncing(false);
    showToast('Offline queue synchronized successfully.');
  };

  return (
    <div className="flex flex-col min-h-full pb-8">
      <PageHeader variant="back" title={t('settings.title')} />

      <div className="px-4 py-3 space-y-4">
        {/* Section: Matching Rules (Planner & Admin) */}
        <div className="bg-white p-4 rounded-card border border-sb-border shadow-e1 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-body font-semibold text-sb-ink">{t('settings.matching_thresholds')}</h3>
              <p className="text-caption text-sb-text-muted">
                {t('settings.matching_desc')}
              </p>
            </div>
            <Sliders className="w-4 h-4 text-sb-navy" aria-hidden="true" />
          </div>

          {/* Slider 1: Auto-Accept Threshold */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-caption">
              <label htmlFor="auto-accept-slider" className="font-semibold text-sb-ink">
                {t('settings.auto_accept_threshold')} (≥)
              </label>
              <span
                data-testid="auto-accept-value"
                className="font-mono font-bold text-sb-verified text-body"
              >
                {autoAcceptThreshold}%
              </span>
            </div>
            <input
              id="auto-accept-slider"
              type="range"
              min="70"
              max="100"
              step="1"
              data-testid="slider-auto-accept"
              aria-label={t('settings.auto_accept_threshold')}
              value={autoAcceptThreshold}
              onChange={(e) => setAutoAcceptThreshold(Number(e.target.value))}
              className="w-full accent-sb-navy cursor-pointer"
            />

            <div className="flex justify-between text-[11px] text-sb-text-subtle font-mono">
              <span>70%</span>
              <span>85%</span>
              <span>100%</span>
            </div>
          </div>

          {/* Slider 2: Unmatched Threshold */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-caption">
              <label htmlFor="unmatched-slider" className="font-semibold text-sb-ink">
                Unmatched Threshold (&lt;)
              </label>
              <span
                data-testid="review-threshold-value"
                className="font-mono font-bold text-sb-critical text-body"
              >
                {reviewThreshold}%
              </span>
            </div>
            <input
              id="unmatched-slider"
              type="range"
              min="30"
              max="70"
              step="1"
              data-testid="slider-unmatched"
              value={reviewThreshold}
              onChange={(e) => setReviewThreshold(Number(e.target.value))}
              className="w-full accent-sb-navy cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-sb-text-subtle font-mono">
              <span>30%</span>
              <span>50%</span>
              <span>70%</span>
            </div>
          </div>

          {/* Live Tier Preview Bar */}
          <div className="pt-2 border-t border-sb-border-subtle space-y-2">
            <div className="flex items-center justify-between text-caption">
              <span className="font-semibold text-sb-ink">Live Queue Tier Distribution</span>
              <span className="text-mono-s text-sb-text-subtle">{events.length} total events</span>
            </div>

            {/* 3-segment bar */}
            <div
              data-testid="tier-preview-bar"
              className="h-3.5 w-full bg-slate-100 rounded-full overflow-hidden flex"
            >
              <div
                data-testid="tier-preview-auto-accept"
                className="bg-emerald-600 transition-all duration-300"
                style={{ width: `${tierCounts.autoAcceptPct}%` }}
                title={`Auto-accept: ${tierCounts.autoAccept} events`}
              />
              <div
                data-testid="tier-preview-review"
                className="bg-amber-500 transition-all duration-300"
                style={{ width: `${tierCounts.reviewPct}%` }}
                title={`Review: ${tierCounts.review} events`}
              />
              <div
                data-testid="tier-preview-unmatched"
                className="bg-red-500 transition-all duration-300"
                style={{ width: `${tierCounts.unmatchedPct}%` }}
                title={`Unmatched: ${tierCounts.unmatched} events`}
              />
            </div>

            {/* Tier Legend with live counts */}
            <div className="grid grid-cols-3 gap-1 text-[11px] pt-1 text-center">
              <div className="p-1 rounded bg-emerald-50 text-emerald-900 border border-emerald-200">
                <span className="block font-bold">Auto-accept</span>
                <span data-testid="tier-count-auto-accept" className="font-mono font-bold">
                  {tierCounts.autoAccept} events
                </span>
              </div>

              <div className="p-1 rounded bg-amber-50 text-amber-900 border border-amber-200">
                <span className="block font-bold">Review</span>
                <span data-testid="tier-count-review" className="font-mono font-bold">
                  {tierCounts.review} events
                </span>
              </div>

              <div className="p-1 rounded bg-red-50 text-red-900 border border-red-200">
                <span className="block font-bold">Unmatched</span>
                <span data-testid="tier-count-unmatched" className="font-mono font-bold">
                  {tierCounts.unmatched} events
                </span>
              </div>
            </div>
          </div>

          {/* Locked Governance Info Rows */}
          <div className="pt-2 border-t border-sb-border-subtle space-y-1.5">
            <span className="text-[10px] uppercase font-bold text-sb-text-subtle tracking-wider block mb-1">
              Locked Governance Constraints
            </span>

            <div className="flex items-center gap-2 text-[11px] text-sb-text-subtle bg-sb-bg-subtle p-2 rounded border border-sb-border-subtle">
              <Lock className="w-3.5 h-3.5 text-sb-text-muted flex-shrink-0" />
              <span>Actual Finish is never auto-accepted</span>
            </div>

            <div className="flex items-center gap-2 text-[11px] text-sb-text-subtle bg-sb-bg-subtle p-2 rounded border border-sb-border-subtle">
              <Lock className="w-3.5 h-3.5 text-sb-text-muted flex-shrink-0" />
              <span>Progress measure: Physical % complete</span>
            </div>

            <div className="flex items-center gap-2 text-[11px] text-sb-text-subtle bg-sb-bg-subtle p-2 rounded border border-sb-border-subtle">
              <Lock className="w-3.5 h-3.5 text-sb-text-muted flex-shrink-0" />
              <span>P6 option assumed: Retained Logic</span>
            </div>
          </div>
        </div>

        {/* Section: Offline & Network */}
        <div className="bg-white p-4 rounded-card border border-sb-border shadow-e1 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {isSimulatingOffline ? (
                <WifiOff className="w-4 h-4 text-amber-600" aria-hidden="true" />
              ) : (
                <Wifi className="w-4 h-4 text-emerald-600" aria-hidden="true" />
              )}
              <h3 className="text-body font-semibold text-sb-ink">{t('settings.offline_mode')}</h3>
            </div>
            <span
              className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                isSimulatingOffline
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-emerald-100 text-emerald-800'
              }`}
            >
              {isSimulatingOffline ? t('settings.simulating_offline') : 'Connected'}
            </span>
          </div>

          <p className="text-caption text-sb-text-subtle">
            Queued local captures: <span className="font-mono font-bold text-sb-ink">{queuedReports.length}</span>
          </p>

          <div className="flex items-center justify-between pt-2 border-t border-sb-border-subtle">
            <label htmlFor="toggle-simulate-offline" className="text-caption font-medium text-sb-ink">
              {t('settings.simulate_offline_toggle')}
            </label>
            <input
              id="toggle-simulate-offline"
              type="checkbox"
              data-testid="toggle-simulate-offline"
              aria-label={t('settings.simulate_offline_toggle')}
              checked={isSimulatingOffline}
              onChange={(e) => setSimulateOffline(e.target.checked)}
              className="w-4 h-4 accent-sb-navy rounded cursor-pointer"
            />
          </div>

          <button
            type="button"
            data-testid="sync-now-button"
            onClick={handleSyncNow}
            disabled={isSyncing || queuedReports.length === 0}
            className="w-full py-2 bg-sb-bg-subtle border border-sb-border text-caption font-semibold rounded-lg hover:bg-slate-100 text-sb-ink disabled:opacity-50 transition-colors"
          >
            {isSyncing ? 'Syncing...' : t('settings.sync_now')}
          </button>
        </div>

        {/* Section: Language */}
        <div className="bg-white p-4 rounded-card border border-sb-border shadow-e1 space-y-3">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-sb-navy" aria-hidden="true" />
            <h3 className="text-body font-semibold text-sb-ink">{t('settings.language')}</h3>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {[
              { id: 'en', label: 'English' },
              { id: 'hi', label: 'हिन्दी' },
              { id: 'mr', label: 'मराठी' },
              { id: 'gu', label: 'ગુજરાતી' },
            ].map((lang) => (
              <button
                key={lang.id}
                type="button"
                data-testid={`lang-btn-${lang.id}`}
                onClick={() => setLanguage(lang.id as any)}
                aria-pressed={language === lang.id}
                className={`p-2.5 rounded-lg border text-caption font-medium flex items-center justify-between transition-colors ${
                  language === lang.id
                    ? 'border-sb-navy bg-sb-bg font-bold text-sb-navy'
                    : 'border-sb-border bg-white text-sb-ink hover:bg-slate-50'
                }`}
              >
                <span>{lang.label}</span>
                {language === lang.id && <Check className="w-4 h-4 text-sb-navy" aria-hidden="true" />}
              </button>
            ))}
          </div>
        </div>

        {/* Section: Display */}
        <div className="bg-white p-4 rounded-card border border-sb-border shadow-e1 space-y-3">
          <div className="flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-sb-navy" aria-hidden="true" />
            <h3 className="text-body font-semibold text-sb-ink">{t('settings.display_scale')}</h3>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              data-testid="display-size-default"
              onClick={() => setTextSize('default')}
              aria-pressed={textSize === 'default'}
              className={`p-2.5 rounded-lg border text-caption font-medium flex items-center justify-between transition-colors ${
                textSize === 'default'
                  ? 'border-sb-navy bg-sb-bg font-bold text-sb-navy'
                  : 'border-sb-border bg-white text-sb-ink'
              }`}
            >
              <span>{t('settings.display_default')}</span>
              {textSize === 'default' && <Check className="w-4 h-4 text-sb-navy" aria-hidden="true" />}
            </button>
            <button
              type="button"
              data-testid="display-size-large"
              onClick={() => setTextSize('large')}
              aria-pressed={textSize === 'large'}
              className={`p-2.5 rounded-lg border text-caption font-medium flex items-center justify-between transition-colors ${
                textSize === 'large'
                  ? 'border-sb-navy bg-sb-bg font-bold text-sb-navy'
                  : 'border-sb-border bg-white text-sb-ink'
              }`}
            >
              <span>{t('settings.display_large')}</span>
              {textSize === 'large' && <Check className="w-4 h-4 text-sb-navy" aria-hidden="true" />}
            </button>
          </div>
        </div>

        {/* Section: About & Reset */}
        <div className="bg-white p-4 rounded-card border border-sb-border shadow-e1 space-y-3">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-sb-navy" aria-hidden="true" />
            <h3 className="text-body font-semibold text-sb-ink">{t('settings.about')}</h3>
          </div>

          <div className="space-y-1 text-caption text-sb-text-subtle">
            <div className="flex justify-between">
              <span>App Version</span>
              <span className="font-mono text-sb-ink font-semibold">0.1.0</span>
            </div>
            <div className="flex justify-between">
              <span>Build Profile</span>
              <span className="text-sb-ink font-semibold">Prototype build</span>
            </div>
            <div className="flex justify-between">
              <span>Data Snapshot</span>
              <span className="font-mono text-sb-ink font-semibold">reference</span>
            </div>
          </div>

          <div className="pt-2 border-t border-sb-border-subtle">
            <button
              type="button"
              data-testid="reset-demo-data-btn"
              onClick={handleResetData}
              className="w-full py-2.5 bg-red-50 border border-red-200 text-red-700 text-caption font-semibold rounded-lg hover:bg-red-100 transition-colors flex items-center justify-center gap-1.5"
            >
              <RotateCcw className="w-4 h-4" aria-hidden="true" />
              {t('settings.reset_demo')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

