"use server";

import { requireAdminAction } from "@/app/admin/owned-media-auth";
import {
  recordSafeObservation,
  type SafeObservationPayload,
} from "@/lib/agents/user-intelligence/record-observation-safe";

export async function recordAgentObservationAction(payload: SafeObservationPayload) {
  await requireAdminAction();
  const entry = recordSafeObservation(payload);
  return { ok: true as const, id: entry.id };
}
