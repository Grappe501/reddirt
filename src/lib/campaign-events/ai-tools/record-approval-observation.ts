import "server-only";

import { appendAiObservation } from "./observations-persist";
import type { ApprovalObservationEvent } from "./observations";

export async function recordApprovalObservation(input: {
  recordId?: string | null;
  toolId: string;
  event: ApprovalObservationEvent;
  actor?: string;
  meta?: Record<string, string | number | boolean | null>;
}) {
  return appendAiObservation(input);
}

export function decisionEventForAction(
  action: string,
): ApprovalObservationEvent | null {
  switch (action) {
    case "approve":
      return "decision_approved";
    case "deny":
      return "decision_denied";
    case "hold":
      return "decision_held";
    case "request_info":
      return "missing_info_requested";
    default:
      return null;
  }
}
