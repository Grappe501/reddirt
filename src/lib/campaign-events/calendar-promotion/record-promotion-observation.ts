import { appendAiObservation } from "../ai-tools/observations-persist";
import type { ApprovalObservationEvent } from "../ai-tools/observations";

export type PromotionObservationEvent = Extract<
  ApprovalObservationEvent,
  | "promotion_attempted"
  | "promotion_blocked"
  | "promotion_succeeded"
  | "promotion_failed"
  | "payload_edited"
  | "operator_overrode_warning"
  | "duplicate_detected"
  | "tentative_promoted"
  | "official_promoted"
  | "ai_tool_invoked"
>;

export async function recordPromotionObservation(input: {
  recordId: string;
  toolId: string;
  event: PromotionObservationEvent;
  actor?: string;
  meta?: Record<string, string | number | boolean | null>;
}) {
  return appendAiObservation({
    recordId: input.recordId,
    toolId: input.toolId,
    event: input.event,
    actor: input.actor ?? "admin",
    meta: input.meta,
  });
}
