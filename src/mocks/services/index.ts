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
} from '@/services';
import { simulateServiceLatency } from './base';
import { useProjectStore } from '@/store/project';
import { useActivitiesStore } from '@/store/activities';
import { useEventsStore } from '@/store/events';
import { useAuditStore } from '@/store/audit';
import { matchEventText } from '../matcher';
import { extractFieldInfo } from '../extractor';
import { DEMO_USERS, useAuthStore, AccessRequest } from '@/store/auth';

export const mockAuthService: AuthService = {
  async login(employeeId, pin) {
    await simulateServiceLatency('auth');
    const matchedUser = Object.values(DEMO_USERS).find((u) => u.employeeId === employeeId);
    if (!matchedUser) throw new Error(`No account found for ${employeeId}. Check the ID or request access.`);
    if (pin !== '123456') throw new Error("PIN doesn't match this employee ID.");
    return matchedUser;
  },
  async logout() {
    await simulateServiceLatency('auth');
    useAuthStore.getState().logout();
  },
  async requestAccess(request) {
    await simulateServiceLatency('auth');
    const requestId = useAuthStore.getState().addAccessRequest({
      name: request.name,
      contact: request.contact,
      organization: request.organization,
      projectId: request.projectId,
      role: request.role,
    });
    return { requestId };
  },
  async resetPin() {
    await simulateServiceLatency('auth');
    return true;
  },
};

export const mockProjectService: ProjectService = {
  async getProjects() {
    await simulateServiceLatency('project');
    return useProjectStore.getState().projects;
  },
  async getProjectById(id) {
    await simulateServiceLatency('project');
    return useProjectStore.getState().projects.find((p) => p.id === id) || null;
  },
  async getPhases() {
    await simulateServiceLatency('project');
    return useProjectStore.getState().phases;
  },
  async getTeams() {
    await simulateServiceLatency('project');
    return useProjectStore.getState().teams;
  },
};

export const mockScheduleService: ScheduleService = {
  async getActivities(_, filter) {
    await simulateServiceLatency('schedule');
    let acts = useActivitiesStore.getState().activities;
    if (filter?.phaseId) acts = acts.filter((a) => a.phaseId === filter.phaseId);
    if (filter?.isCritical) acts = acts.filter((a) => a.isCritical);
    return acts;
  },
  async getActivityById(id) {
    await simulateServiceLatency('schedule');
    return useActivitiesStore.getState().activities.find((a) => a.id === id) || null;
  },
  async updateActivityProgress(activityId, physicalPercent, reason) {
    await simulateServiceLatency('schedule');
    const store = useActivitiesStore.getState();
    store.updateActivityProgress(activityId, physicalPercent);
    const updated = store.activities.find((a) => a.id === activityId)!;

    await useAuditStore.getState().appendEntry({
      actor: 'Meera Nair',
      action: 'Manual Progress Adjustment',
      activityId,
      newValue: `${physicalPercent}%`,
      sourceEventId: reason,
    });
    return updated;
  },
};

export const mockEventService: EventService = {
  async getEvents() {
    await simulateServiceLatency('events');
    return useEventsStore.getState().events;
  },
  async getEventById(id) {
    await simulateServiceLatency('events');
    return useEventsStore.getState().events.find((e) => e.id === id) || null;
  },
  async approveEvent(eventId, activityId) {
    await simulateServiceLatency('workbench');
    const result = await useEventsStore.getState().approveEvent(eventId, activityId);
    const updatedActivity = activityId ? useActivitiesStore.getState().activities.find((a) => a.id === activityId) : undefined;
    return { event: result.event, updatedActivity };
  },
  async rejectEvent(eventId, reason) {
    await simulateServiceLatency('workbench');
    return useEventsStore.getState().rejectEvent(eventId, reason);
  },
  async rematchEvent(eventId, newActivityId, reason) {
    await simulateServiceLatency('workbench');
    return useEventsStore.getState().rematchEvent(eventId, newActivityId, reason);
  },
  async askQuestion(eventId, question) {
    await simulateServiceLatency('workbench');
    const store = useEventsStore.getState();
    const event = store.events.find((e) => e.id === eventId);
    if (!event) throw new Error(`Event ${eventId} not found`);
    const qId = `q-${Date.now()}`;
    const updated = {
      ...event,
      status: 'Reply needed' as const,
      questions: [...(event.questions || []), { id: qId, author: 'Meera Nair', text: question, time: 'Just now' }],
    };
    return updated;
  },
  async replyToQuestion(eventId, questionId, reply) {
    await simulateServiceLatency('workbench');
    const store = useEventsStore.getState();
    const event = store.events.find((e) => e.id === eventId);
    if (!event) throw new Error(`Event ${eventId} not found`);
    const updated = {
      ...event,
      status: 'Review' as const,
      questions: (event.questions || []).map((q) => (q.id === questionId ? { ...q, reply } : q)),
    };
    return updated;
  },
  async submitEvent(partialEvent) {
    await simulateServiceLatency('capture');
    return useEventsStore.getState().addEvent(partialEvent);
  },
};

export const mockMatchService: MatchService = {
  async matchText(text) {
    await simulateServiceLatency('matcher');
    return matchEventText(text);
  },
};

export const mockVoiceService: VoiceService = {
  async record() {
    await simulateServiceLatency('voice');
    return new Blob([], { type: 'audio/webm' });
  },
  async transcribe() {
    await simulateServiceLatency('voice');
    return { transcript: 'Line 24-XX ki spool 17 welding complete ho gayi hai.', language: 'hi-IN' };
  },
};

export const mockExtractionService: ExtractionService = {
  async extractFields(text) {
    await simulateServiceLatency('extractor');
    return extractFieldInfo(text);
  },
};

export const mockIngestService: IngestService = {
  async parseExcel() {
    await simulateServiceLatency('ingest');
    return { totalRows: 34, events: [] };
  },
  async parseDprPdf() {
    await simulateServiceLatency('ingest');
    return { totalStatements: 18, statements: [] };
  },
  async parseXer() {
    await simulateServiceLatency('ingest');
    return { activitiesCount: 200, relationshipsCount: 215 };
  },
};

export const mockExportService: ExportService = {
  async exportP6UpdateCsv(events) {
    await simulateServiceLatency('export');
    const headers = 'Activity ID,Field,Old Value,New Value,Source Event\n';
    const rows = events
      .filter((e) => e.status === 'Verified')
      .map((e) => `${e.suggestedActivityId || 'PIP-24-017'},Physical % Complete,38,40,${e.id}`)
      .join('\n');
    return headers + rows;
  },
};

export const mockAnalyticsService: AnalyticsService = {
  async getSCurveData() {
    await simulateServiceLatency('analytics');
    return {
      dates: ['15 Aug', '22 Aug', '29 Aug', '05 Sep', '12 Sep', '20 Sep'],
      planned: [10, 25, 42, 58, 68, 74],
      actual: [8, 22, 38, 52, 62, 68],
    };
  },
  async getDelayCauses() {
    await simulateServiceLatency('analytics');
    return useProjectStore.getState().delayCauses;
  },
  async getProjectMemory() {
    await simulateServiceLatency('analytics');
    return useProjectStore.getState().memoryInsights;
  },
};

export const mockAuditService: AuditService = {
  async getAuditTrail() {
    await simulateServiceLatency('audit');
    return useAuditStore.getState().chain;
  },
  async verifyChain() {
    await simulateServiceLatency('audit');
    return useAuditStore.getState().verifyChain();
  },
  async appendEntry(entry) {
    await simulateServiceLatency('audit');
    return useAuditStore.getState().appendEntry(entry);
  },
};

export const mockNotificationService: NotificationService = {
  async getNotifications() {
    await simulateServiceLatency('notifications');
    return [
      { id: 'notif-1', title: 'Meera asked: which spool range?', time: '08:55 AM', unread: true, targetRoute: '/event/E-2091' },
      { id: 'notif-2', title: '12 events need review in Planner Workbench', time: '08:42 AM', unread: true, targetRoute: '/workbench' },
      { id: 'notif-3', title: 'Out-of-sequence warning on PIP-24-018', time: '07:30 AM', unread: true, targetRoute: '/workbench/E-2093' },
      { id: 'notif-4', title: 'Project SPI fell below 0.95 (currently 0.92)', time: 'Yesterday', unread: false, targetRoute: '/analytics' },
    ];
  },
  async markAllAsRead() {
    await simulateServiceLatency('notifications');
  },
};

export const mockAdminService: AdminService = {
  async getUsers() {
    await simulateServiceLatency('admin');
    return Object.values(DEMO_USERS);
  },
  async getAccessRequests() {
    await simulateServiceLatency('admin');
    const list = useAuthStore.getState().accessRequests;
    return list.map((r: AccessRequest) => ({
      id: r.id,
      name: r.name,
      role: r.role,
      project: r.projectId,
      time: r.time,
    }));
  },
  async approveAccessRequest() {
    await simulateServiceLatency('admin');
  },
  async rejectAccessRequest() {
    await simulateServiceLatency('admin');
  },
};
