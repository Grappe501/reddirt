"use server";

import { revalidatePath } from "next/cache";
import { applyReviewDecision } from "@/lib/campaign-events/persistence/review-persistence";
import type { CampaignEventDecision } from "@/lib/campaign-events/review-meta";
import {
  getApprovalTokenById,
  markApprovalTokenUsed,
  type ApprovalTokenAction,
} from "@/lib/campaign-events/approval-email/approval-token-store";
import {
  decisionEventForAction,
  recordApprovalObservation,
} from "@/lib/campaign-events/ai-tools/record-approval-observation";
import { assertApprovalPathNoGoogleWrite } from "@/lib/campaign-events/ai-tools/sprint4-tool-helpers";

function mapTokenActionToDecision(action: ApprovalTokenAction): CampaignEventDecision | null {
  switch (action) {
    case "approve":
      return "approved";
    case "deny":
      return "denied";
    case "hold":
      return "hold";
    case "request_info":
      return "request_confirmation";
    default:
      return null;
  }
}

export async function applyApprovalTokenDecisionAction(
  tokenId: string,
  note?: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const token = await getApprovalTokenById(tokenId);
  if (!token) return { ok: false, error: "Invalid or unknown approval link." };
  if (token.status === "expired") return { ok: false, error: "This approval link has expired." };
  if (token.status === "revoked") return { ok: false, error: "This approval link was revoked." };
  if (token.status === "used" && token.action !== "review") {
    return { ok: false, error: "This approval link was already used." };
  }

  const decision = mapTokenActionToDecision(token.action);
  if (!decision) {
    return { ok: false, error: "Review links cannot submit decisions from this page." };
  }

  assertApprovalPathNoGoogleWrite("approval-token-decision");
  await applyReviewDecision(token.recordId, decision, {
    note,
    actor: `approval-token:${token.action}`,
  });
  const decisionEvent = decisionEventForAction(token.action);
  if (decisionEvent) {
    await recordApprovalObservation({
      recordId: token.recordId,
      toolId: "approval-action-writer",
      event: decisionEvent,
      actor: `approval-token:${token.action}`,
    });
  }

  if (token.action !== "review") {
    await markApprovalTokenUsed(tokenId);
  }

  revalidatePath(`/campaign-events/approval/${tokenId}`);
  revalidatePath(`/admin/campaign-events/${token.recordId}`);
  revalidatePath(`/admin/campaign-calendar/approval-package/${token.recordId}`);

  return { ok: true };
}
