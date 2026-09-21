import { MatchReason } from '@/services/types';

export interface MatchResult {
  activityId?: string;
  activityName?: string;
  confidence: number;
  reasons: MatchReason[];
  topCandidates: { id: string; name: string; confidence: number }[];
}

export function matchEventText(rawText: string): MatchResult {
  const text = rawText.toLowerCase();

  // 1. Fixed Hero Overrides (SPEC §9.4)
  if (text.includes('line 24-xx') && text.includes('spool 17')) {
    return {
      activityId: 'PIP-24-017',
      activityName: 'Weld Piping System 24-XX',
      confidence: 94,
      reasons: [
        { label: 'Piping', matchedText: 'Line 24-XX' },
        { label: 'Line 24-XX', matchedText: 'Line 24-XX' },
        { label: 'Welding', matchedText: 'welding' },
        { label: 'Active activity', matchedText: 'In progress' },
      ],
      topCandidates: [
        { id: 'PIP-24-017', name: 'Weld Piping System 24-XX', confidence: 94 },
        { id: 'PIP-24-016', name: 'Install Pipe Line 24-XX', confidence: 68 },
        { id: 'PIP-24-018', name: 'NDT & Coating Line 24-XX', confidence: 54 },
      ],
    };
  }

  // 2. New supervisor report rule: "Line 24-XX spool N welding complete" -> PIP-24-017 at 94 - (N mod 3) % (Spool 18 -> 93%)
  const spoolMatch = rawText.match(/spool\s+(\d+)/i);
  if (text.includes('line 24-xx') && spoolMatch) {
    const n = parseInt(spoolMatch[1], 10);
    const confidence = n === 18 ? 93 : 94 - (n % 3);
    return {
      activityId: 'PIP-24-017',
      activityName: 'Weld Piping System 24-XX',
      confidence,
      reasons: [
        { label: 'Line 24-XX', matchedText: 'Line 24-XX' },
        { label: `Spool ${n}`, matchedText: `Spool ${n}` },
        { label: 'Welding', matchedText: 'welding' },
      ],
      topCandidates: [
        { id: 'PIP-24-017', name: 'Weld Piping System 24-XX', confidence },
        { id: 'PIP-24-018', name: 'NDT & Coating Line 24-XX', confidence: 55 },
      ],
    };
  }

  if (text.includes('kp 184.2') || (text.includes('trenching') && text.includes('meter'))) {
    return {
      activityId: 'CIV-12-003',
      activityName: 'Excavate Trench KP 180.0–185.0',
      confidence: 78,
      reasons: [
        { label: 'Trenching', matchedText: 'trenching' },
        { label: 'KP 184.2', matchedText: 'KP 184.2' },
      ],
      topCandidates: [
        { id: 'CIV-12-003', name: 'Excavate Trench KP 180.0–185.0', confidence: 78 },
        { id: 'CIV-12-007', name: 'Backfill KP 178.0–181.0', confidence: 45 },
      ],
    };
  }

  if (text.includes('coating') || text.includes('24xx-sp-012')) {
    return {
      activityId: 'PIP-24-018',
      activityName: 'NDT & Coating Line 24-XX',
      confidence: 82,
      reasons: [
        { label: 'Coating', matchedText: 'Coating' },
        { label: 'Line 24-XX', matchedText: '24XX' },
      ],
      topCandidates: [
        { id: 'PIP-24-018', name: 'NDT & Coating Line 24-XX', confidence: 82 },
      ],
    };
  }

  if (text.includes('24 inch manifold') || text.includes('manifold')) {
    return {
      activityId: 'PIP-30-005',
      activityName: 'Weld Joint M-01-J1 (24″ manifold)',
      confidence: 88,
      reasons: [
        { label: 'Manifold', matchedText: 'manifold' },
        { label: 'Welding', matchedText: 'weld' },
      ],
      topCandidates: [
        { id: 'PIP-30-005', name: 'Weld Joint M-01-J1', confidence: 88 },
        { id: 'PIP-30-006', name: 'Weld Joint M-01-J2', confidence: 88 },
        { id: 'PIP-30-007', name: 'Weld Joint M-01-J3', confidence: 88 },
      ],
    };
  }

  if (text.includes('pig launcher')) {
    return {
      confidence: 41,
      reasons: [],
      topCandidates: [
        { id: 'CIV-15-001', name: 'Pig Launcher Excavation', confidence: 41 },
      ],
    };
  }

  if (text.includes('crane') || text.includes('lowering')) {
    return {
      activityId: 'PIP-24-021',
      activityName: 'Lower Pipe KP 181.0–183.0',
      confidence: 90,
      reasons: [
        { label: 'Lowering', matchedText: 'lowering' },
        { label: 'Crane delay', matchedText: 'crane' },
      ],
      topCandidates: [
        { id: 'PIP-24-021', name: 'Lower Pipe KP 181.0–183.0', confidence: 90 },
      ],
    };
  }

  // Fallback match
  return {
    confidence: 45,
    reasons: [],
    topCandidates: [],
  };
}
