export interface Project {
  id: string;
  name: string;
  description: string;
  dataDate: string; // e.g. "20 Sep 2026"
  physicalProgress: number; // e.g. 68
  plannedProgress: number; // e.g. 74
  activeActivitiesCount: number;
  totalActivitiesCount: number;
  baselineVersion: string; // e.g. "v3"
  isPopulated: boolean;
}

export interface Phase {
  id: string;
  name: string;
  weight: number; // e.g. 15 for 15%
  planned: number;
  dprReported: number;
  verified: number;
}

export type ActivityStatus = 'Not started' | 'In progress' | 'Complete';

export interface Activity {
  id: string;
  name: string;
  phaseId: string;
  phaseName: string;
  status: ActivityStatus;
  physicalPercent: number; // 0-100
  plannedStart: string;
  plannedFinish: string;
  actualStart?: string;
  actualFinish?: string;
  quantityTotal?: number;
  quantityCompleted?: number;
  unit?: string; // e.g. "spools", "m"
  predecessors: { id: string; type: 'FS' | 'SS' | 'FF'; lag: number }[];
  successors: { id: string; type: 'FS' | 'SS' | 'FF'; lag: number }[];
  isCritical: boolean;
  isOutOfSequence?: boolean;
}

export type EventSource = 'voice' | 'excel' | 'pdf' | 'manual';
export type QueueTier = 'Review' | 'Verified' | 'Unmatched' | 'Delay' | 'Warning';

export interface ExtractedInfo {
  action?: string;
  object?: string;
  location?: string;
  status?: string;
  quantity?: string;
  unit?: string;
}

export interface MatchReason {
  label: string;
  matchedText?: string;
}

export interface FieldEvent {
  id: string;
  source: EventSource;
  timestamp: string; // "08:42 AM"
  rawText: string;
  authorName: string;
  authorRole: string;
  authorPhone?: string;
  authorCrew?: string;
  audioUrl?: string;
  thumbnailUrl?: string;
  status: 'Verified' | 'Review' | 'Unmatched' | 'Delay' | 'Rejected' | 'Saved offline' | 'Reply needed';
  queueTier: QueueTier;
  confidence: number;
  suggestedActivityId?: string;
  suggestedActivityName?: string;
  extractedInfo: ExtractedInfo;
  reasons: MatchReason[];
  logicCheckStatus: 'Passed' | 'Warning' | 'Failed';
  logicCheckMessage?: string;
  delayCategory?: string;
  daysLost?: number;
  isConflict?: boolean;
  conflictEventId?: string;
  isAccumulator?: boolean;
  accumulatorDetails?: { current: number; total: number; unit: string; percentOld: number; percentNew: number };
  isDistribute?: boolean;
  distributeActivities?: { id: string; name: string; confidence: number }[];
  approvedAt?: string;
  approvedBy?: string;
  questions?: { id: string; author: string; text: string; time: string; reply?: string }[];
}

export interface DelayCause {
  id?: string;
  category: string;
  eventsCount: number;
  daysLost: number;
  isCriticalPath: boolean;
  criticalActivityId?: string;
  criticalActivityName?: string;
}

export interface MemoryInsight {
  id: string;
  title: string;
  insight: string;
  recommendation?: string;
  benchmarkProject?: string;
  sampleSize: number;
  season?: string;
  variancePercent: number;
  activities: string[];
}

export interface CrewTeam {
  id: string;
  name: string;
  foreman: string;
  contractor: string;
  headcount: number;
  reportsToday: number;
  lastReportTime: string;
  verifiedRate: number; // e.g. 94%
  phone: string;
}
