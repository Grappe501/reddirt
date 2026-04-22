import { EventWorkflowState } from "@prisma/client";

const ORDER: EventWorkflowState[] = [
  EventWorkflowState.DRAFT,
  EventWorkflowState.PENDING_APPROVAL,
  EventWorkflowState.APPROVED,
  EventWorkflowState.PUBLISHED,
  EventWorkflowState.CANCELED,
  EventWorkflowState.COMPLETED,
];

const INDEX = new Map<EventWorkflowState, number>(ORDER.map((s, i) => [s, i]));

export function eventWorkflowStageIndex(s: EventWorkflowState): number {
  return INDEX.get(s) ?? 0;
}

export function isEventStageAtOrPast(eventStage: EventWorkflowState, minStage: EventWorkflowState | null | undefined) {
  if (minStage == null) return true;
  return eventWorkflowStageIndex(eventStage) >= eventWorkflowStageIndex(minStage);
}
