'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { FieldEvent } from '@/services/types';
import { generateSeedEvents } from '@/mocks/fixtures/events';
import { useAuditStore } from './audit';
import { useActivitiesStore } from './activities';
import { useNotificationsStore } from './notifications';
import { demoNow } from '@/mocks/clock';

interface EventsState {
  events: FieldEvent[];
  lastApprovedAt: number; // Unix timestamp
  previousStates: Record<string, FieldEvent>; // For 8s Undo support

  approveEvent: (
    eventId: string,
    activityId?: string,
    actorName?: string
  ) => Promise<{ success: boolean; event: FieldEvent }>;
  rejectEvent: (eventId: string, reason: string, actorName?: string) => Promise<FieldEvent>;
  rematchEvent: (eventId: string, newActivityId: string, reason?: string, actorName?: string) => Promise<FieldEvent>;
  undoApproval: (eventId: string) => Promise<boolean>;
  askQuestion: (eventId: string, question: string, authorName?: string) => Promise<FieldEvent>;
  replyToQuestion: (eventId: string, questionId: string, reply: string, authorName?: string) => Promise<FieldEvent>;
  addEvent: (event: Partial<FieldEvent>) => FieldEvent;
  resetEvents: (snapshot?: 'reference' | 'demo-start') => void;
}

// Initial freshness: 3 seconds prior to demoNow
const getInitialLastApprovedAt = () => demoNow().getTime() - 3000;

export const useEventsStore = create<EventsState>()(
  persist(
    (set, get) => ({
      events: generateSeedEvents('reference'),
      lastApprovedAt: getInitialLastApprovedAt(),
      previousStates: {},

      approveEvent: async (eventId, customActivityId, actorName = 'Meera Nair') => {
        const state = get();
        const event = state.events.find((e) => e.id === eventId);
        if (!event) throw new Error(`Event ${eventId} not found`);

        const targetActivityId = customActivityId || event.suggestedActivityId;
        const previousState = { ...event };
        const now = demoNow();

        // Update target activity in activities store if accumulator is specified
        if (targetActivityId) {
          const activitiesState = useActivitiesStore.getState();
          const activity = activitiesState.activities.find((a) => a.id === targetActivityId);
          if (activity) {
            let newPercent = activity.physicalPercent;
            if (event.accumulatorDetails) {
              newPercent = event.accumulatorDetails.percentNew;
            } else if (newPercent < 100) {
              newPercent = Math.min(100, newPercent + 2);
            }
            activitiesState.updateActivityProgress(targetActivityId, newPercent);
          }
        }

        // Updated event
        const updatedEvent: FieldEvent = {
          ...event,
          status: 'Verified',
          queueTier: 'Verified',
          approvedAt: now.toISOString(),
          approvedBy: actorName,
        };

        // Record in audit chain
        const auditStore = useAuditStore.getState();
        await auditStore.appendEntry({
          actor: actorName,
          action: 'Approve Match',
          activityId: targetActivityId,
          oldValue: event.accumulatorDetails?.percentOld ?? 38,
          newValue: event.accumulatorDetails?.percentNew ?? 40,
          sourceEventId: event.id,
        });

        // Set state: reset lastApprovedAt to now (resets freshness clock to 00:00)
        set({
          events: state.events.map((e) => (e.id === eventId ? updatedEvent : e)),
          lastApprovedAt: now.getTime(),
          previousStates: {
            ...state.previousStates,
            [eventId]: previousState,
          },
        });

        return { success: true, event: updatedEvent };
      },

      rejectEvent: async (eventId, reason, actorName = 'Meera Nair') => {
        const state = get();
        const event = state.events.find((e) => e.id === eventId);
        if (!event) throw new Error(`Event ${eventId} not found`);

        const previousState = { ...event };
        const updatedEvent: FieldEvent = {
          ...event,
          status: 'Rejected',
          queueTier: 'Review',
        };

        const auditStore = useAuditStore.getState();
        await auditStore.appendEntry({
          actor: actorName,
          action: 'Reject Event',
          activityId: event.suggestedActivityId,
          oldValue: event.status,
          newValue: 'Rejected',
          sourceEventId: event.id,
        });

        set({
          events: state.events.map((e) => (e.id === eventId ? updatedEvent : e)),
          previousStates: { ...state.previousStates, [eventId]: previousState },
        });

        return updatedEvent;
      },

      rematchEvent: async (eventId, newActivityId, reason = 'Manual match override', actorName = 'Meera Nair') => {
        const state = get();
        const event = state.events.find((e) => e.id === eventId);
        if (!event) throw new Error(`Event ${eventId} not found`);

        const previousState = { ...event };
        const updatedEvent: FieldEvent = {
          ...event,
          suggestedActivityId: newActivityId,
          reasons: [...event.reasons, { label: 'Manual override', matchedText: reason }],
        };

        const auditStore = useAuditStore.getState();
        await auditStore.appendEntry({
          actor: actorName,
          action: 'Rematch Activity',
          activityId: newActivityId,
          oldValue: event.suggestedActivityId,
          newValue: newActivityId,
          sourceEventId: event.id,
        });

        set({
          events: state.events.map((e) => (e.id === eventId ? updatedEvent : e)),
          previousStates: { ...state.previousStates, [eventId]: previousState },
        });

        return updatedEvent;
      },

      undoApproval: async (eventId) => {
        const state = get();
        const prev = state.previousStates[eventId];
        if (!prev) return false;

        const auditStore = useAuditStore.getState();
        await auditStore.appendEntry({
          actor: 'Meera Nair',
          action: 'Undo Approval',
          activityId: prev.suggestedActivityId,
          oldValue: 'Verified',
          newValue: prev.status,
          sourceEventId: eventId,
        });

        set({
          events: state.events.map((e) => (e.id === eventId ? prev : e)),
        });

        return true;
      },

      askQuestion: async (eventId: string, question: string, authorName = 'Meera Nair') => {
        const state = get();
        const event = state.events.find((e) => e.id === eventId);
        if (!event) throw new Error(`Event ${eventId} not found`);

        const qId = `q-${Date.now()}`;
        const newQuestion = { id: qId, author: authorName, text: question, time: 'Just now' };
        const updatedEvent: FieldEvent = {
          ...event,
          status: 'Reply needed',
          questions: [...(event.questions || []), newQuestion],
        };

        set({
          events: state.events.map((e) => (e.id === eventId ? updatedEvent : e)),
        });

        useNotificationsStore.getState().addNotification({
          title: `${authorName} asked: "${question}"`,
          message: `Clarification needed on ${event.suggestedActivityName || event.id}`,
          needsAction: true,
          category: 'question',
          targetRoute: `/event/${event.id}`,
        });

        return updatedEvent;
      },

      replyToQuestion: async (eventId: string, questionId: string, reply: string, authorName = 'Rahul Patil') => {
        const state = get();
        const event = state.events.find((e) => e.id === eventId);
        if (!event) throw new Error(`Event ${eventId} not found`);

        const updatedQuestions = (event.questions || []).map((q) =>
          q.id === questionId ? { ...q, reply } : q
        );

        const updatedEvent: FieldEvent = {
          ...event,
          status: 'Review',
          questions: updatedQuestions,
        };

        set({
          events: state.events.map((e) => (e.id === eventId ? updatedEvent : e)),
        });

        useNotificationsStore.getState().addNotification({
          title: `${authorName} replied on ${event.id}`,
          message: `"${reply}" — Returned to review queue`,
          needsAction: true,
          category: 'alert',
          targetRoute: `/event/${event.id}`,
        });

        return updatedEvent;
      },

      addEvent: (partialEvent) => {
        const state = get();
        const id = partialEvent.id || `E-${String(2110 + state.events.length).padStart(4, '0')}`;
        const newEvent: FieldEvent = {
          id,
          source: partialEvent.source || 'voice',
          timestamp: 'Just now',
          rawText: partialEvent.rawText || '',
          authorName: partialEvent.authorName || 'Rahul Patil',
          authorRole: partialEvent.authorRole || 'Field Supervisor',
          status: (partialEvent.status as FieldEvent['status']) || 'Review',
          queueTier: partialEvent.queueTier || 'Review',
          confidence: partialEvent.confidence ?? 85,
          suggestedActivityId: partialEvent.suggestedActivityId || 'PIP-24-017',
          suggestedActivityName: partialEvent.suggestedActivityName || 'Weld Piping System 24-XX',
          extractedInfo: partialEvent.extractedInfo || {},
          reasons: partialEvent.reasons || [],
          logicCheckStatus: partialEvent.logicCheckStatus || 'Passed',
        };

        set({
          events: [newEvent, ...state.events],
        });

        return newEvent;
      },

      resetEvents: (snapshot = 'demo-start') => {
        set({
          events: generateSeedEvents(snapshot),
          lastApprovedAt: getInitialLastApprovedAt(),
          previousStates: {},
        });
      },
    }),
    {
      name: 'schedbridge-events-store',
    }
  )
);

// Derived Selectors (Guaranteed to be calculated dynamically from the store)
export function useVerifiedEventsCount(): number {
  const events = useEventsStore((state) => state.events);
  return events.filter((e) => e.status === 'Verified').length;
}

export function useReviewEventsCount(): number {
  const events = useEventsStore((state) => state.events);
  // Review queue includes all events pending a human decision (Review + Unmatched)
  return events.filter((e) => e.status === 'Review' || e.status === 'Unmatched').length;
}

export function useDelayEventsCount(): number {
  const events = useEventsStore((state) => state.events);
  return events.filter((e) => e.status === 'Delay').length;
}

export function useWarningEventsCount(): number {
  const events = useEventsStore((state) => state.events);
  // Distinct warning issues: out-of-sequence warnings + unique conflict alerts (SPEC §6 PL1: 02 Warnings)
  const oos = events.filter((e) => e.queueTier === 'Warning' && !e.isConflict).length;
  const hasConflict = events.some((e) => e.isConflict && e.queueTier === 'Warning');
  return oos + (hasConflict ? 1 : 0);
}

export function useFreshnessSeconds(): number {
  const lastApprovedAt = useEventsStore((state) => state.lastApprovedAt);
  const now = demoNow().getTime();
  return Math.max(0, Math.floor((now - lastApprovedAt) / 1000));
}
