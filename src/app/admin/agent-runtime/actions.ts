"use server";

import { requireAdminAction } from "@/app/admin/owned-media-auth";
import { runCampaignAgentRuntime, type CampaignAgentRuntimeInput } from "@/lib/agents/runtime/campaign-agent-runtime";
import { loadCampaignEventsDashboard } from "@/lib/campaign-events/load-campaign-events-dashboard";
import { recordSafeObservation } from "@/lib/agents/user-intelligence/record-observation-safe";
import {
  setMemoryReviewStatus,
  type MemoryReviewStatus,
} from "@/lib/agents/runtime/memory-review-store";
import type { AgentRuntimeResponse } from "@/lib/agents/runtime/agent-runtime-types";

export async function askCampaignAgentAction(
  input: Omit<CampaignAgentRuntimeInput, "snapshot"> & { message: string },
): Promise<{ ok: true; response: AgentRuntimeResponse }> {
  await requireAdminAction();
  const { snapshot } = await loadCampaignEventsDashboard(input.period);
  const response = runCampaignAgentRuntime({
    ...input,
    snapshot,
    syncStale: Boolean(snapshot.calendarSync?.jsonStale),
    actor: "admin",
  });
  recordSafeObservation({
    event: "user_used_plain_language_request",
    role: input.role,
    pathname: input.pathname,
    recordId: input.eventRecordId ?? null,
    meta: { auditId: response.auditId, task: response.interpretedIntent.task },
  });
  return { ok: true, response: JSON.parse(JSON.stringify(response)) as AgentRuntimeResponse };
}

export async function reviewMemoryCandidateAction(
  id: string,
  status: MemoryReviewStatus,
  note?: string,
): Promise<{ ok: boolean }> {
  await requireAdminAction();
  const updated = setMemoryReviewStatus(id, status, "admin", note);
  return { ok: Boolean(updated) };
}
