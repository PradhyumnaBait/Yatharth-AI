import { Activity } from '@/services/types';

// Deterministic Pseudo-Random Number Generator (Mulberry32)
function createRNG(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const KEY_ACTIVITIES: Activity[] = [
  {
    id: 'CIV-12-003',
    name: 'Excavate Trench KP 180.0–185.0',
    phaseId: 'phase-trenching',
    phaseName: 'Trenching',
    status: 'In progress',
    physicalPercent: 92,
    plannedStart: '2026-08-10',
    plannedFinish: '2026-09-24',
    actualStart: '2026-08-12',
    quantityTotal: 5000,
    quantityCompleted: 4600,
    unit: 'm',
    predecessors: [],
    successors: [{ id: 'PIP-24-010', type: 'FS', lag: 0 }],
    isCritical: false,
  },
  {
    id: 'PIP-24-010',
    name: 'String Pipe Line 24-XX',
    phaseId: 'phase-stringing',
    phaseName: 'Stringing',
    status: 'Complete',
    physicalPercent: 100,
    plannedStart: '2026-08-20',
    plannedFinish: '2026-09-05',
    actualStart: '2026-08-20',
    actualFinish: '2026-09-04',
    quantityTotal: 42,
    quantityCompleted: 42,
    unit: 'spools',
    predecessors: [{ id: 'CIV-12-003', type: 'FS', lag: 0 }],
    successors: [{ id: 'PIP-24-016', type: 'FS', lag: 0 }],
    isCritical: false,
  },
  {
    id: 'PIP-24-016',
    name: 'Install Pipe Line 24-XX',
    phaseId: 'phase-stringing',
    phaseName: 'Stringing',
    status: 'Complete',
    physicalPercent: 100,
    plannedStart: '2026-09-01',
    plannedFinish: '2026-09-12',
    actualStart: '2026-09-01',
    actualFinish: '2026-09-12',
    quantityTotal: 42,
    quantityCompleted: 42,
    unit: 'spools',
    predecessors: [{ id: 'PIP-24-010', type: 'FS', lag: 0 }],
    successors: [{ id: 'PIP-24-017', type: 'FS', lag: 0 }],
    isCritical: true,
  },
  {
    id: 'PIP-24-017',
    name: 'Weld Piping System 24-XX',
    phaseId: 'phase-welding',
    phaseName: 'Welding',
    status: 'In progress',
    physicalPercent: 38,
    plannedStart: '2026-09-12',
    plannedFinish: '2026-09-28',
    actualStart: '2026-09-12',
    quantityTotal: 42,
    quantityCompleted: 16,
    unit: 'spools',
    predecessors: [{ id: 'PIP-24-016', type: 'FS', lag: 0 }],
    successors: [{ id: 'PIP-24-018', type: 'FS', lag: 0 }],
    isCritical: true,
  },
  {
    id: 'PIP-24-018',
    name: 'NDT & Coating Line 24-XX',
    phaseId: 'phase-ndt',
    phaseName: 'NDT',
    status: 'Not started',
    physicalPercent: 0,
    plannedStart: '2026-09-29',
    plannedFinish: '2026-10-10',
    quantityTotal: 42,
    quantityCompleted: 0,
    unit: 'joints',
    predecessors: [{ id: 'PIP-24-017', type: 'FS', lag: 0 }],
    successors: [{ id: 'PIP-24-024', type: 'FS', lag: 0 }],
    isCritical: true,
  },
  {
    id: 'PIP-24-021',
    name: 'Lower Pipe KP 181.0–183.0',
    phaseId: 'phase-lowering',
    phaseName: 'Lowering',
    status: 'In progress',
    physicalPercent: 60,
    plannedStart: '2026-09-15',
    plannedFinish: '2026-09-25',
    actualStart: '2026-09-15',
    quantityTotal: 2000,
    quantityCompleted: 1200,
    unit: 'm',
    predecessors: [{ id: 'PIP-24-017', type: 'FS', lag: 0 }],
    successors: [{ id: 'CIV-12-007', type: 'FS', lag: 0 }],
    isCritical: true,
  },
  {
    id: 'CIV-12-007',
    name: 'Backfill KP 178.0–181.0',
    phaseId: 'phase-backfill',
    phaseName: 'Backfill',
    status: 'In progress',
    physicalPercent: 60,
    plannedStart: '2026-09-16',
    plannedFinish: '2026-09-26',
    actualStart: '2026-09-16',
    quantityTotal: 3000,
    quantityCompleted: 1800,
    unit: 'm',
    predecessors: [{ id: 'PIP-24-021', type: 'FS', lag: 0 }],
    successors: [],
    isCritical: false,
  },
  {
    id: 'PIP-24-024',
    name: 'Hydrotest Line 24-XX',
    phaseId: 'phase-hydrotest',
    phaseName: 'Hydrotest',
    status: 'Not started',
    physicalPercent: 0,
    plannedStart: '2026-10-12',
    plannedFinish: '2026-10-22',
    quantityTotal: 10,
    quantityCompleted: 0,
    unit: 'km',
    predecessors: [{ id: 'PIP-24-018', type: 'FS', lag: 0 }],
    successors: [],
    isCritical: true,
  },
  {
    id: 'PIP-30-005',
    name: 'Weld Joint M-01-J1 (24″ manifold)',
    phaseId: 'phase-welding',
    phaseName: 'Welding',
    status: 'In progress',
    physicalPercent: 0,
    plannedStart: '2026-09-18',
    plannedFinish: '2026-09-22',
    actualStart: '2026-09-18',
    predecessors: [],
    successors: [],
    isCritical: false,
  },
  {
    id: 'PIP-30-006',
    name: 'Weld Joint M-01-J2 (24″ manifold)',
    phaseId: 'phase-welding',
    phaseName: 'Welding',
    status: 'In progress',
    physicalPercent: 0,
    plannedStart: '2026-09-18',
    plannedFinish: '2026-09-22',
    actualStart: '2026-09-18',
    predecessors: [],
    successors: [],
    isCritical: false,
  },
  {
    id: 'PIP-30-007',
    name: 'Weld Joint M-01-J3 (24″ manifold)',
    phaseId: 'phase-welding',
    phaseName: 'Welding',
    status: 'In progress',
    physicalPercent: 0,
    plannedStart: '2026-09-18',
    plannedFinish: '2026-09-22',
    actualStart: '2026-09-18',
    predecessors: [],
    successors: [],
    isCritical: false,
  },
  {
    id: 'CIV-15-001',
    name: 'Pig Launcher Excavation',
    phaseId: 'phase-trenching',
    phaseName: 'Trenching',
    status: 'Complete',
    physicalPercent: 100,
    plannedStart: '2026-08-01',
    plannedFinish: '2026-08-15',
    actualStart: '2026-08-01',
    actualFinish: '2026-08-14',
    predecessors: [],
    successors: [],
    isCritical: false,
  },
];

// Generate exactly 200 total activities with exactly 14 in progress
export function generateFullSchedule(): Activity[] {
  const activities: Activity[] = [...KEY_ACTIVITIES];
  const rng = createRNG(42);

  // Key activities currently have 7 'In progress' (CIV-12-003, PIP-24-017, PIP-24-021, CIV-12-007, PIP-30-005, PIP-30-006, PIP-30-007).
  // We need 7 more 'In progress' so total in progress = 14!
  let inProgressNeeded = 14 - activities.filter((a) => a.status === 'In progress').length;

  const phases = [
    { id: 'phase-trenching', name: 'Trenching', prefix: 'CIV-12' },
    { id: 'phase-stringing', name: 'Stringing', prefix: 'PIP-20' },
    { id: 'phase-welding', name: 'Welding', prefix: 'PIP-22' },
    { id: 'phase-ndt', name: 'NDT', prefix: 'NDT-10' },
    { id: 'phase-coating', name: 'Coating', prefix: 'COAT-05' },
    { id: 'phase-lowering', name: 'Lowering', prefix: 'LOW-08' },
    { id: 'phase-backfill', name: 'Backfill', prefix: 'CIV-14' },
    { id: 'phase-hydrotest', name: 'Hydrotest', prefix: 'HYD-01' },
    { id: 'phase-restoration', name: 'Restoration', prefix: 'ENV-02' },
  ];

  const totalToGenerate = 200 - activities.length;

  for (let i = 0; i < totalToGenerate; i++) {
    const phaseIndex = Math.floor(rng() * phases.length);
    const phase = phases[phaseIndex];
    const activityNum = String(100 + i).padStart(3, '0');
    const id = `${phase.prefix}-${activityNum}`;

    let status: Activity['status'] = 'Not started';
    let percent = 0;

    if (inProgressNeeded > 0 && rng() > 0.6) {
      status = 'In progress';
      percent = Math.floor(rng() * 70) + 15;
      inProgressNeeded--;
    } else if (['phase-trenching', 'phase-stringing'].includes(phase.id) && rng() > 0.2) {
      status = 'Complete';
      percent = 100;
    } else if (['phase-hydrotest', 'phase-restoration'].includes(phase.id)) {
      status = 'Not started';
      percent = 0;
    } else if (rng() > 0.5) {
      status = 'Complete';
      percent = 100;
    }

    activities.push({
      id,
      name: `${phase.name} Section KP ${(178 + (i % 10) * 1.0).toFixed(1)} Package`,
      phaseId: phase.id,
      phaseName: phase.name,
      status,
      physicalPercent: percent,
      plannedStart: '2026-08-15',
      plannedFinish: '2026-10-15',
      actualStart: status !== 'Not started' ? '2026-08-18' : undefined,
      actualFinish: status === 'Complete' ? '2026-09-10' : undefined,
      predecessors: [],
      successors: [],
      isCritical: rng() < 0.15,
    });
  }

  // Ensure exactly 14 are in progress if still needed
  if (inProgressNeeded > 0) {
    for (const act of activities) {
      if (inProgressNeeded <= 0) break;
      if (act.status === 'Not started') {
        act.status = 'In progress';
        act.physicalPercent = 45;
        inProgressNeeded--;
      }
    }
  }

  return activities;
}
