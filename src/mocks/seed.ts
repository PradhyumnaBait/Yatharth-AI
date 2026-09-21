import { AuditEntry, createAuditEntry } from '@/lib/hash';
import { useEventsStore } from '@/store/events';
import { useActivitiesStore } from '@/store/activities';
import { useProjectStore } from '@/store/project';
import { useAuditStore } from '@/store/audit';

const GENESIS_HASH = '0000000000000000000000000000000000000000000000000000000000000000';

/**
 * Generates ~1,280 hash-chained audit entries deterministically.
 */
export async function generateSeededAuditChain(count = 1280): Promise<AuditEntry[]> {
  const chain: AuditEntry[] = [];
  let prevHash = GENESIS_HASH;

  const actors = ['Meera Nair', 'Rahul Patil', 'Dinesh Rathod', 'Suresh Yadav', 'Contractor B'];
  const actions = ['Approve Match', 'Update Progress', 'Import Baseline', 'Rematch Activity', 'Auto Accept'];
  const activities = ['CIV-12-003', 'PIP-24-010', 'PIP-24-016', 'PIP-24-017', 'PIP-24-018', 'PIP-24-021'];

  for (let i = 1; i <= count; i++) {
    const actor = actors[i % actors.length];
    const action = actions[i % actions.length];
    const activityId = activities[i % activities.length];
    const id = `AUD-${String(i).padStart(5, '0')}`;
    const dayOffset = Math.floor(i / 150);
    const ts = `2026-09-${String(Math.max(1, 20 - dayOffset)).padStart(2, '0')}T10:00:00+05:30`;

    const entry = await createAuditEntry(prevHash, {
      id,
      ts,
      actor,
      action,
      activityId,
      oldValue: `${(i * 3) % 100}%`,
      newValue: `${((i * 3) % 100) + 2}%`,
      sourceEventId: `E-${String(1000 + (i % 200)).padStart(4, '0')}`,
    });

    chain.push(entry);
    prevHash = entry.hash;
  }

  return chain;
}

/**
 * Resets all stores to initial snapshot state.
 */
export async function initializeStores(snapshot: 'reference' | 'demo-start' = 'demo-start'): Promise<void> {
  useEventsStore.getState().resetEvents(snapshot);
  useActivitiesStore.getState().resetActivities();
  useProjectStore.getState().resetProjectData();

  const auditChain = await generateSeededAuditChain(1280);
  useAuditStore.getState().resetAudit(auditChain);
}
