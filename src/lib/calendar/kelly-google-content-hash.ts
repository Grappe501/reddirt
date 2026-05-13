import "server-only";

import { createHash } from "node:crypto";
import type { CampaignEvent } from "@prisma/client";

/** Stable hash for Kelly V2 Google extendedProperties (conflict detection + sync). */
export function computeKellyGoogleContentHash(
  ev: Pick<
    CampaignEvent,
    "id" | "title" | "startAt" | "endAt" | "locationName" | "countyId" | "updatedAt" | "eventWorkflowState"
  >,
): string {
  const payload = JSON.stringify({
    id: ev.id,
    title: ev.title,
    startAt: ev.startAt.toISOString(),
    endAt: ev.endAt.toISOString(),
    locationName: ev.locationName,
    countyId: ev.countyId,
    updatedAt: ev.updatedAt.toISOString(),
    eventWorkflowState: ev.eventWorkflowState,
  });
  return createHash("sha256").update(payload).digest("hex");
}
