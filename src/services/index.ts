import {
  Project,
  Phase,
  Activity,
  FieldEvent,
  DelayCause,
  MemoryInsight,
  CrewTeam,
} from './types';
import { UserProfile, UserRole } from '@/store/auth';
import { AuditEntry } from '@/lib/hash';

export interface AuthService {
  login(employeeId: string, pin: string): Promise<UserProfile>;
  logout(): Promise<void>;
  requestAccess(request: { name: string; contact: string; organization: string; projectId: string; role: UserRole }): Promise<{ requestId: string }>;
  resetPin(employeeId: string, code: string, newPin: string): Promise<boolean>;
}

export interface ProjectService {
  getProjects(): Promise<Project[]>;
  getProjectById(id: string): Promise<Project | null>;
  getPhases(projectId: string): Promise<Phase[]>;
  getTeams(projectId: string): Promise<CrewTeam[]>;
}

export interface ScheduleService {
  getActivities(projectId: string, filter?: { phaseId?: string; isCritical?: boolean }): Promise<Activity[]>;
  getActivityById(id: string): Promise<Activity | null>;
  updateActivityProgress(activityId: string, physicalPercent: number, reason: string): Promise<Activity>;
}

export interface EventService {
  getEvents(projectId: string): Promise<FieldEvent[]>;
  getEventById(id: string): Promise<FieldEvent | null>;
  approveEvent(eventId: string, activityId?: string): Promise<{ event: FieldEvent; updatedActivity?: Activity }>;
  rejectEvent(eventId: string, reason: string): Promise<FieldEvent>;
  rematchEvent(eventId: string, newActivityId: string, reason?: string): Promise<FieldEvent>;
  askQuestion(eventId: string, question: string): Promise<FieldEvent>;
  replyToQuestion(eventId: string, questionId: string, reply: string): Promise<FieldEvent>;
  submitEvent(event: Partial<FieldEvent>): Promise<FieldEvent>;
}

export interface MatchService {
  matchText(text: string): Promise<{
    activityId?: string;
    activityName?: string;
    confidence: number;
    reasons: { label: string; matchedText?: string }[];
    topCandidates: { id: string; name: string; confidence: number }[];
  }>;
}

export interface VoiceService {
  record(): Promise<Blob>;
  transcribe(audioBlob?: Blob): Promise<{ transcript: string; language: string }>;
}

export interface ExtractionService {
  extractFields(text: string): Promise<{
    action?: string;
    object?: string;
    location?: string;
    status?: string;
    quantity?: string;
  }>;
}

export interface IngestService {
  parseExcel(file: File | Blob): Promise<{ totalRows: number; events: Partial<FieldEvent>[] }>;
  parseDprPdf(file: File | Blob): Promise<{ totalStatements: number; statements: string[] }>;
  parseXer(file: File | Blob): Promise<{ activitiesCount: number; relationshipsCount: number }>;
}

export interface ExportService {
  exportP6UpdateCsv(events: FieldEvent[]): Promise<string>;
}

export interface AnalyticsService {
  getSCurveData(projectId: string): Promise<{ dates: string[]; planned: number[]; actual: number[] }>;
  getDelayCauses(projectId: string): Promise<DelayCause[]>;
  getProjectMemory(): Promise<MemoryInsight[]>;
}

export interface AuditService {
  getAuditTrail(projectId: string): Promise<AuditEntry[]>;
  verifyChain(): Promise<{ valid: boolean; brokenAtIndex?: number }>;
  appendEntry(entry: Omit<AuditEntry, 'hash' | 'prevHash'>): Promise<AuditEntry>;
}

export interface NotificationService {
  getNotifications(): Promise<{ id: string; title: string; time: string; unread: boolean; targetRoute?: string }[]>;
  markAllAsRead(): Promise<void>;
}

export interface AdminService {
  getUsers(): Promise<UserProfile[]>;
  getAccessRequests(): Promise<{ id: string; name: string; role: UserRole; project: string; time: string }[]>;
  approveAccessRequest(requestId: string): Promise<void>;
  rejectAccessRequest(requestId: string, reason: string): Promise<void>;
}

export * from './types';
