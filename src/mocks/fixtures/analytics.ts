import { DelayCause, MemoryInsight } from '@/services/types';

export const FIXTURE_DELAY_CAUSES: DelayCause[] = [
  {
    category: 'Equipment / crane',
    eventsCount: 9,
    daysLost: 11,
    isCriticalPath: true,
    criticalActivityId: 'PIP-24-021',
    criticalActivityName: 'Lower Pipe KP 181.0–183.0',
  },
  {
    category: 'Weather',
    eventsCount: 7,
    daysLost: 6,
    isCriticalPath: false,
    criticalActivityId: 'CIV-12-003',
    criticalActivityName: 'Excavate Trench KP 180.0–185.0',
  },
  {
    category: 'RFI / engineering',
    eventsCount: 5,
    daysLost: 4,
    isCriticalPath: true,
    criticalActivityId: 'PIP-24-018',
    criticalActivityName: 'NDT & Coating Line 24-XX',
  },
  {
    category: 'Material',
    eventsCount: 3,
    daysLost: 3,
    isCriticalPath: false,
  },
  {
    category: 'Permit / ROU',
    eventsCount: 2,
    daysLost: 2,
    isCriticalPath: false,
  },
  {
    category: 'Manpower',
    eventsCount: 1,
    daysLost: 1,
    isCriticalPath: false,
  },
];

export const FIXTURE_MEMORY_INSIGHTS: MemoryInsight[] = [
  {
    id: 'mem-1',
    title: 'Trenching Dewatering Monsoon Impact',
    insight: 'Trenching during Jun–Sep historically exceeds baseline duration by +38% due to dewatering and pit cave-ins.',
    sampleSize: 41,
    season: 'Monsoon',
    variancePercent: 38,
    activities: ['CIV-12-003', 'CIV-12-007'],
  },
  {
    id: 'mem-2',
    title: 'Single Crane Lowering Allocation Bottleneck',
    insight: 'Lowering-in operations with a single crane allocated average +27% duration overrun compared to tandem dual-crane crews.',
    sampleSize: 19,
    variancePercent: 27,
    activities: ['PIP-24-021'],
  },
  {
    id: 'mem-3',
    title: 'Field-Joint Coating with Open RFI',
    insight: 'Field-joint coating started prior to RFI specification closure incurs +22% rework and holiday testing failures.',
    sampleSize: 14,
    variancePercent: 22,
    activities: ['PIP-24-018'],
  },
  {
    id: 'mem-4',
    title: 'Hydrotest Duration Variance',
    insight: 'Hydrotest packages consistently execute within ±5% of planned schedule once golden joints are cleared.',
    sampleSize: 12,
    variancePercent: 5,
    activities: ['PIP-24-024'],
  },
];
