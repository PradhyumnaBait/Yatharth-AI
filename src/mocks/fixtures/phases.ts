import { Phase } from '@/services/types';

export const FIXTURE_PHASES: Phase[] = [
  { id: 'phase-trenching', name: 'Trenching', weight: 15, planned: 100, dprReported: 98, verified: 96 },
  { id: 'phase-stringing', name: 'Stringing', weight: 10, planned: 100, dprReported: 100, verified: 100 },
  { id: 'phase-welding', name: 'Welding', weight: 20, planned: 95, dprReported: 91, verified: 85 },
  { id: 'phase-ndt', name: 'NDT', weight: 10, planned: 80, dprReported: 76, verified: 70 },
  { id: 'phase-coating', name: 'Coating', weight: 10, planned: 75, dprReported: 72, verified: 66 },
  { id: 'phase-lowering', name: 'Lowering', weight: 12, planned: 75, dprReported: 70, verified: 65 },
  { id: 'phase-backfill', name: 'Backfill', weight: 8, planned: 70, dprReported: 62, verified: 60 },
  { id: 'phase-hydrotest', name: 'Hydrotest', weight: 10, planned: 0, dprReported: 0, verified: 0 },
  { id: 'phase-restoration', name: 'Restoration', weight: 5, planned: 0, dprReported: 0, verified: 0 },
];
