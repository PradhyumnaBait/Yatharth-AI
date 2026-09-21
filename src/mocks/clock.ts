'use client';

// Fixed base date: 20 Sep 2026, 09:24:00 IST (UTC+5:30 -> 03:54:00 UTC)
const BASE_DEMO_TIME = new Date('2026-09-20T09:24:00+05:30').getTime();
const START_TIME = Date.now();

let useRealClock = false;

export function setUseRealClock(enabled: boolean): void {
  useRealClock = enabled;
}

export function isUsingRealClock(): boolean {
  return useRealClock;
}

/**
 * Returns current demo time.
 * When useRealClock is false (default), ticks forward from 20 Sep 2026 09:24:00 IST in real time.
 */
export function demoNow(): Date {
  if (useRealClock) {
    return new Date();
  }
  const elapsed = Date.now() - START_TIME;
  return new Date(BASE_DEMO_TIME + elapsed);
}

export function demoNowISO(): string {
  return demoNow().toISOString();
}

/**
 * Formats time difference as freshness clock mm:ss, then 1h 12m, 2d 4h.
 */
export function formatFreshness(lastApprovedAt: Date | string | number): string {
  const lastTime = typeof lastApprovedAt === 'object' ? lastApprovedAt.getTime() : new Date(lastApprovedAt).getTime();
  const diffSeconds = Math.max(0, Math.floor((demoNow().getTime() - lastTime) / 1000));

  if (diffSeconds < 3600) {
    const m = Math.floor(diffSeconds / 60);
    const s = diffSeconds % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  } else if (diffSeconds < 86400) {
    const h = Math.floor(diffSeconds / 3600);
    const m = Math.floor((diffSeconds % 3600) / 60);
    return `${h}h ${m}m`;
  } else {
    const d = Math.floor(diffSeconds / 86400);
    const h = Math.floor((diffSeconds % 86400) / 3600);
    return `${d}d ${h}h`;
  }
}
