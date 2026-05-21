"use server";

import { revalidatePath } from "next/cache";
import { loadPromotionWorkbench } from "@/lib/campaign-events/calendar-promotion/load-promotion-workbench";
import { promoteLedgerEventToGoogle } from "@/lib/campaign-events/calendar-promotion/promote-ledger-event";
import { buildGooglePayloadPreview } from "@/lib/campaign-events/calendar-promotion/build-google-payload";
import { loadCalendarEventDrilldown } from "@/lib/campaign-events/load-campaign-calendar-events";
import type { PromotionTargetLane } from "@/lib/campaign-events/calendar-promotion/promotion-types";

function revalidatePromotionSurfaces(recordId?: string) {
  revalidatePath("/admin/campaign-events/calendar-promotion");
  revalidatePath("/admin/campaign-events/workbench");
  revalidatePath("/admin/campaign-events/calendar-sync");
  revalidatePath("/admin/candidate-dashboard");
  revalidatePath("/admin/campaign-manager-dashboard");
  if (recordId) {
    revalidatePath(`/admin/campaign-events/${recordId}`);
  }
}

export async function loadPromotionWorkbenchAction(period: string) {
  const snapshot = await loadPromotionWorkbench(period);
  return { ok: true as const, snapshot };
}

export async function previewPromotionPayloadAction(recordId: string, targetLane: PromotionTargetLane) {
  const loaded = await loadCalendarEventDrilldown(recordId);
  if (!loaded) return { ok: false as const, error: "not_found" };
  const payload = await buildGooglePayloadPreview(loaded.record, loaded.row, targetLane);
  const result = await promoteLedgerEventToGoogle({
    recordId,
    targetLane,
    actor: "admin-preview",
    dryRun: true,
  });
  return { ok: true as const, payload, readiness: result.readiness };
}

export async function promoteLedgerEventAction(
  recordId: string,
  targetLane: PromotionTargetLane,
  options?: { acknowledgeWarnings?: boolean },
) {
  const result = await promoteLedgerEventToGoogle({
    recordId,
    targetLane,
    actor: "admin",
    acknowledgeWarnings: options?.acknowledgeWarnings,
  });
  revalidatePromotionSurfaces(recordId);
  return { ok: true as const, result };
}

export async function dryRunPromotionAction(recordId: string, targetLane: PromotionTargetLane) {
  const result = await promoteLedgerEventToGoogle({
    recordId,
    targetLane,
    actor: "dry-run",
    dryRun: true,
  });
  revalidatePromotionSurfaces(recordId);
  return { ok: true as const, result };
}
