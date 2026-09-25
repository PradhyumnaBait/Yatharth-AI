import {
  httpAuthService,
  httpProjectService,
  httpScheduleService,
  httpEventService,
  httpMatchService,
  httpVoiceService,
  httpExtractionService,
  httpIngestService,
  httpExportService,
  httpAnalyticsService,
  httpAuditService,
  httpNotificationService,
  httpAdminService,
} from './http/services';
import {
  mockAuthService,
  mockProjectService,
  mockScheduleService,
  mockEventService,
  mockMatchService,
  mockVoiceService,
  mockExtractionService,
  mockIngestService,
  mockExportService,
  mockAnalyticsService,
  mockAuditService,
  mockNotificationService,
  mockAdminService,
} from '@/mocks/services';

const USE_MOCK = process.env.NEXT_PUBLIC_DEMO_MOCK === 'true';

export const authService = USE_MOCK ? mockAuthService : httpAuthService;
export const projectService = USE_MOCK ? mockProjectService : httpProjectService;
export const scheduleService = USE_MOCK ? mockScheduleService : httpScheduleService;
export const eventService = USE_MOCK ? mockEventService : httpEventService;
export const matchService = USE_MOCK ? mockMatchService : httpMatchService;
export const voiceService = USE_MOCK ? mockVoiceService : httpVoiceService;
export const extractionService = USE_MOCK ? mockExtractionService : httpExtractionService;
export const ingestService = USE_MOCK ? mockIngestService : httpIngestService;
export const exportService = USE_MOCK ? mockExportService : httpExportService;
export const analyticsService = USE_MOCK ? mockAnalyticsService : httpAnalyticsService;
export const auditService = USE_MOCK ? mockAuditService : httpAuditService;
export const notificationService = USE_MOCK ? mockNotificationService : httpNotificationService;
export const adminService = USE_MOCK ? mockAdminService : httpAdminService;
