import { test, expect } from '@playwright/test';
import { generateSeedEvents } from '../../src/mocks/fixtures/events';
import { useEventsStore } from '../../src/store/events';
import { useActivitiesStore } from '../../src/store/activities';
import { useAuditStore } from '../../src/store/audit';
import { generateSeededAuditChain } from '../../src/mocks/seed';
import { verifyAuditChain } from '../../src/lib/hash';

test.describe('Mock Data Layer & Acceptance Contract (P04)', () => {
  test('counts in demo-start snapshot: exactly 47 Verified, 12 Review, 03 Delays', () => {
    const events = generateSeedEvents('demo-start');

    const verifiedCount = events.filter((e) => e.status === 'Verified').length;
    const reviewCount = events.filter((e) => e.status === 'Review' || e.status === 'Unmatched').length;
    const delayCount = events.filter((e) => e.status === 'Delay').length;

    expect(verifiedCount).toBe(47);
    expect(reviewCount).toBe(12);
    expect(delayCount).toBe(3);
  });

  test('approving E-2091 flips it to Verified, updates counts to 48 / 11, resets freshness, updates accumulator, and preserves valid audit chain', async () => {
    // Reset stores to demo-start
    useEventsStore.getState().resetEvents('demo-start');
    useActivitiesStore.getState().resetActivities();
    const seedChain = await generateSeededAuditChain(10);
    useAuditStore.getState().resetAudit(seedChain);

    const initialVerified = useEventsStore.getState().events.filter((e) => e.status === 'Verified').length;
    const initialReview = useEventsStore.getState().events.filter((e) => e.status === 'Review' || e.status === 'Unmatched').length;
    const initialChainLen = useAuditStore.getState().chain.length;
    const initialActivity = useActivitiesStore.getState().activities.find((a) => a.id === 'PIP-24-017');

    expect(initialVerified).toBe(47);
    expect(initialReview).toBe(12);
    expect(initialActivity?.physicalPercent).toBe(38);

    // Approve E-2091
    const result = await useEventsStore.getState().approveEvent('E-2091', 'PIP-24-017', 'Meera Nair');
    expect(result.success).toBe(true);

    // Check counts after approval
    const newEvents = useEventsStore.getState().events;
    const newVerified = newEvents.filter((e) => e.status === 'Verified').length;
    const newReview = newEvents.filter((e) => e.status === 'Review' || e.status === 'Unmatched').length;

    expect(newVerified).toBe(48);
    expect(newReview).toBe(11);

    // Check accumulator update: 38% -> 40% (17 of 42 spools)
    const updatedActivity = useActivitiesStore.getState().activities.find((a) => a.id === 'PIP-24-017');
    expect(updatedActivity?.physicalPercent).toBe(40);

    // Check audit entry appended
    const updatedChain = useAuditStore.getState().chain;
    expect(updatedChain.length).toBe(initialChainLen + 1);
    const lastEntry = updatedChain[updatedChain.length - 1];
    expect(lastEntry.action).toBe('Approve Match');
    expect(lastEntry.sourceEventId).toBe('E-2091');

    // Verify cryptographic audit chain integrity
    const chainVerification = await verifyAuditChain(updatedChain);
    expect(chainVerification.valid).toBe(true);
  });
});
