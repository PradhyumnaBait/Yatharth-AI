import {
  AuthService,
  ProjectService,
  ScheduleService,
  EventService,
  MatchService,
  VoiceService,
  ExtractionService,
  IngestService,
  ExportService,
  AnalyticsService,
  AuditService,
  NotificationService,
  AdminService,
  Project,
  Phase,
  Activity,
  FieldEvent,
  DelayCause,
  MemoryInsight,
  CrewTeam,
} from '@/services';
import { UserProfile, UserRole } from '@/store/auth';
import { AuditEntry } from '@/lib/hash';
import { api, setAuthToken } from './client';

export const httpAuthService: AuthService = {
  async login(employeeId: string, pin: string): Promise<UserProfile> {
    const res = await api.post('/auth/login', { employeeId, pin });
    if (res.accessToken) {
      setAuthToken(res.accessToken);
    }
    const roleLower = (res.role ? res.role.toLowerCase() : 'supervisor') as UserRole;
    return {
      id: res.id,
      employeeId: res.employeeId,
      name: res.name,
      title: roleLower === 'supervisor' ? 'Field Supervisor' : (roleLower === 'planner' ? 'Lead Planner' : (roleLower === 'pm' ? 'Project Manager' : 'Admin')),
      role: roleLower,
      organization: 'Sterling Infra EPC',
      avatarUrl: res.avatarUrl || '/images/avatar-rahul.jpg',
      currentProjectId: 'kandla-panipat-p3',
    };
  },
  async logout(): Promise<void> {
    await api.post('/auth/logout');
    setAuthToken(null);
  },
  async requestAccess(request: { name: string; contact: string; organization: string; projectId: string; role: UserRole }): Promise<{ requestId: string }> {
    return api.post('/auth/request-access', request);
  },
  async resetPin(employeeId: string, code: string, newPin: string): Promise<boolean> {
    const res = await api.post('/auth/reset-pin', { employeeId, code, newPin });
    return res.success;
  },
};

export const httpProjectService: ProjectService = {
  async getProjects(): Promise<Project[]> {
    return api.get('/projects');
  },
  async getProjectById(id: string): Promise<Project | null> {
    try {
      return await api.get(`/projects/${id}`);
    } catch {
      return null;
    }
  },
  async getPhases(projectId: string): Promise<Phase[]> {
    return api.get(`/projects/${projectId}/phases`);
  },
  async getTeams(projectId: string): Promise<CrewTeam[]> {
    return api.get(`/projects/${projectId}/teams`);
  },
};

export const httpScheduleService: ScheduleService = {
  async getActivities(projectId: string, filter?: { phaseId?: string; isCritical?: boolean }): Promise<Activity[]> {
    const params = new URLSearchParams();
    if (filter?.phaseId) params.append('phaseId', filter.phaseId);
    if (filter?.isCritical !== undefined) params.append('isCritical', String(filter.isCritical));
    const qs = params.toString() ? `?${params.toString()}` : '';
    return api.get(`/projects/${projectId}/activities${qs}`);
  },
  async getActivityById(id: string): Promise<Activity | null> {
    try {
      return await api.get(`/activities/${id}`);
    } catch {
      return null;
    }
  },
  async updateActivityProgress(activityId: string, physicalPercent: number, reason: string): Promise<Activity> {
    return api.patch(`/activities/${activityId}/progress`, { physicalPercent, reason });
  },
};

export const httpEventService: EventService = {
  async getEvents(projectId: string): Promise<FieldEvent[]> {
    return api.get(`/projects/${projectId}/events`);
  },
  async getEventById(id: string): Promise<FieldEvent | null> {
    try {
      return await api.get(`/events/${id}`);
    } catch {
      return null;
    }
  },
  async approveEvent(eventId: string, activityId?: string): Promise<{ event: FieldEvent; updatedActivity?: Activity }> {
    return api.post(`/events/${eventId}/approve`, { activityId });
  },
  async rejectEvent(eventId: string, reason: string): Promise<FieldEvent> {
    return api.post(`/events/${eventId}/reject`, { reason });
  },
  async rematchEvent(eventId: string, newActivityId: string, reason?: string): Promise<FieldEvent> {
    return api.post(`/events/${eventId}/rematch`, { newActivityId, reason });
  },
  async askQuestion(eventId: string, question: string): Promise<FieldEvent> {
    return api.post(`/events/${eventId}/questions`, { question });
  },
  async replyToQuestion(eventId: string, questionId: string, reply: string): Promise<FieldEvent> {
    return api.post(`/events/${eventId}/questions/${questionId}/reply`, { reply });
  },
  async submitEvent(event: Partial<FieldEvent>): Promise<FieldEvent> {
    return api.post('/events', event);
  },
};

export const httpMatchService: MatchService = {
  async matchText(text: string): Promise<{
    activityId?: string;
    activityName?: string;
    confidence: number;
    reasons: { label: string; matchedText?: string }[];
    topCandidates: { id: string; name: string; confidence: number }[];
  }> {
    return api.post('/matching/match', { text });
  },
};

export const httpVoiceService: VoiceService = {
  async record(): Promise<Blob> {
    return new Promise(async (resolve, reject) => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        const chunks: Blob[] = [];

        mediaRecorder.ondataavailable = (e) => {
          if (e.data.size > 0) chunks.push(e.data);
        };

        mediaRecorder.onstop = () => {
          stream.getTracks().forEach((track) => track.stop());
          resolve(new Blob(chunks, { type: 'audio/webm' }));
        };

        mediaRecorder.start();
        setTimeout(() => {
          if (mediaRecorder.state !== 'inactive') mediaRecorder.stop();
        }, 5000);
      } catch (err) {
        reject(err);
      }
    });
  },
  async transcribe(audioBlob?: Blob): Promise<{ transcript: string; language: string }> {
    if (!audioBlob) {
      throw new Error("No audio recording provided to transcribe.");
    }
    const formData = new FormData();
    formData.append('file', audioBlob, 'recording.webm');
    return api.upload('/voice/transcribe', formData);
  },
};

export const httpExtractionService: ExtractionService = {
  async extractFields(text: string): Promise<{
    action?: string;
    object?: string;
    location?: string;
    status?: string;
    quantity?: string;
  }> {
    return api.post('/extraction/extract', { text });
  },
};

export const httpIngestService: IngestService = {
  async parseExcel(file: File | Blob): Promise<{ totalRows: number; events: Partial<FieldEvent>[] }> {
    const formData = new FormData();
    formData.append('file', file, 'import.xlsx');
    return api.upload('/ingest/excel', formData);
  },
  async parseDprPdf(file: File | Blob): Promise<{ totalStatements: number; statements: string[] }> {
    const formData = new FormData();
    formData.append('file', file, 'dpr.pdf');
    return api.upload('/ingest/dpr', formData);
  },
  async parseXer(file: File | Blob): Promise<{ activitiesCount: number; relationshipsCount: number }> {
    const formData = new FormData();
    formData.append('file', file, 'schedule.xer');
    return api.upload('/ingest/xer', formData);
  },
};

export const httpExportService: ExportService = {
  async exportP6UpdateCsv(events: FieldEvent[]): Promise<string> {
    return api.post('/export/p6-csv', { events });
  },
};

export const httpAnalyticsService: AnalyticsService = {
  async getSCurveData(projectId: string): Promise<{ dates: string[]; planned: number[]; actual: number[] }> {
    return api.get(`/analytics/${projectId}/s-curve`);
  },
  async getDelayCauses(projectId: string): Promise<DelayCause[]> {
    return api.get(`/analytics/${projectId}/delays`);
  },
  async getProjectMemory(): Promise<MemoryInsight[]> {
    return api.get('/analytics/memory');
  },
};

export const httpAuditService: AuditService = {
  async getAuditTrail(projectId: string): Promise<AuditEntry[]> {
    return api.get(`/audit/${projectId}`);
  },
  async verifyChain(): Promise<{ valid: boolean; brokenAtIndex?: number }> {
    return api.get('/audit/verify');
  },
  async appendEntry(entry: Omit<AuditEntry, 'hash' | 'prevHash'>): Promise<AuditEntry> {
    return api.post('/audit/entries', entry);
  },
};

export const httpNotificationService: NotificationService = {
  async getNotifications(): Promise<{ id: string; title: string; time: string; unread: boolean; targetRoute?: string }[]> {
    return api.get('/notifications');
  },
  async markAllAsRead(): Promise<void> {
    return api.post('/notifications/mark-read');
  },
};

export const httpAdminService: AdminService = {
  async getUsers(): Promise<UserProfile[]> {
    return api.get('/admin/users');
  },
  async getAccessRequests(): Promise<{ id: string; name: string; role: UserRole; project: string; time: string }[]> {
    return api.get('/admin/access-requests');
  },
  async approveAccessRequest(requestId: string): Promise<void> {
    return api.post(`/admin/access-requests/${requestId}/approve`);
  },
  async rejectAccessRequest(requestId: string, reason: string): Promise<void> {
    return api.post(`/admin/access-requests/${requestId}/reject`, { reason });
  },
};
