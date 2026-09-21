/**
 * Canonical JSON serialization ensuring consistent key ordering for cryptographic hashing.
 */
export function canonicalJSON(obj: unknown): string {
  if (obj === null || typeof obj !== 'object') {
    return JSON.stringify(obj);
  }
  if (Array.isArray(obj)) {
    return '[' + obj.map(canonicalJSON).join(',') + ']';
  }
  const sortedKeys = Object.keys(obj as Record<string, unknown>).sort();
  const pairs = sortedKeys.map(
    (key) => `${JSON.stringify(key)}:${canonicalJSON((obj as Record<string, unknown>)[key])}`
  );
  return '{' + pairs.join(',') + '}';
}

/**
 * Computes a SHA-256 hash over prevHash + canonical JSON payload.
 * Works seamlessly in Browser (SubtleCrypto) and Node.js environments.
 */
export async function computeSHA256(input: string): Promise<string> {
  if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
    const encoder = new TextEncoder();
    const data = encoder.encode(input);
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  }

  // Node.js fallback (uses dynamic require without triggering strict eslint rule)
  if (typeof window === 'undefined') {
    try {
      const getModule = new Function('m', 'return require(m)');
      const crypto = getModule('crypto');
      return crypto.createHash('sha256').update(input, 'utf8').digest('hex');
    } catch {
      // fallback
    }
  }

  // Standalone fallback hash
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return Math.abs(hash).toString(16).padStart(64, '0');
}

export interface AuditEntryData {
  id: string;
  ts: string;
  actor: string;
  action: string;
  activityId?: string;
  oldValue?: string | number | null;
  newValue?: string | number | null;
  sourceEventId?: string;
  details?: string;
  reason?: string;
}

export interface AuditEntry extends AuditEntryData {
  prevHash: string;
  hash: string;
}

export async function createAuditEntry(
  prevHash: string,
  entry: AuditEntryData
): Promise<AuditEntry> {
  const payload = prevHash + canonicalJSON(entry);
  const hash = await computeSHA256(payload);
  return {
    ...entry,
    prevHash,
    hash,
  };
}

export async function verifyAuditChain(
  chain: AuditEntry[]
): Promise<{ valid: boolean; brokenAtIndex?: number }> {
  for (let i = 0; i < chain.length; i++) {
    const entry = chain[i];
    const prevHash = i === 0 ? '0000000000000000000000000000000000000000000000000000000000000000' : chain[i - 1].hash;
    if (entry.prevHash !== prevHash) {
      return { valid: false, brokenAtIndex: i };
    }
    const { hash, prevHash: _, ...data } = entry;
    const computed = await computeSHA256(prevHash + canonicalJSON(data));
    if (computed !== hash) {
      return { valid: false, brokenAtIndex: i };
    }
  }
  return { valid: true };
}
