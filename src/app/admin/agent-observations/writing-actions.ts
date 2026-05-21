"use server";

import { requireAdminAction } from "@/app/admin/owned-media-auth";
import {
  captureWritingObservation,
  type WritingObservationMeta,
} from "@/lib/agents/writing-agent/writing-observation-capture";

export async function recordWritingObservationAction(meta: WritingObservationMeta) {
  await requireAdminAction();
  const obs = captureWritingObservation(meta);
  return { ok: true as const, id: obs.id };
}
