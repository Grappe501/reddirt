import type { CalendarSurfaceRow } from "../load-campaign-calendar-events";
import type { HotWashIntelligenceData } from "./hot-wash-intelligence-types";
import { applyHotWashToCountyMemory } from "../county-memory/county-memory-builder";
import { persistBlueprintFromEvent, isSuccessfulEvent } from "./event-intelligence-helpers";
import { listMediaForEvent, upsertMediaRecord } from "../media/media-index";
import { scaffoldMediaIntelligenceMeta } from "./event-intelligence-helpers";

export type LearningLoopResult = {
  countyMemoryUpdated: boolean;
  blueprintCreated: boolean;
  blueprintId: string | null;
  mediaEnriched: number;
  successfulEvent: boolean;
};

/** CAPTURE → enrich media meta → county memory → blueprint (human-reviewed intel only). */
export async function runCampaignLearningLoop(
  row: CalendarSurfaceRow,
  intel: HotWashIntelligenceData,
): Promise<LearningLoopResult> {
  let mediaEnriched = 0;
  const media = await listMediaForEvent(row.recordId);
  for (const item of media) {
    const enriched = { ...item, intelligence: scaffoldMediaIntelligenceMeta(item) };
    if (JSON.stringify(enriched.intelligence) !== JSON.stringify(item.intelligence)) {
      await upsertMediaRecord(enriched);
      mediaEnriched++;
    }
  }

  await applyHotWashToCountyMemory(row, intel);
  const successful = isSuccessfulEvent(intel);
  let blueprintId: string | null = null;
  let blueprintCreated = false;
  if (successful) {
    const bp = await persistBlueprintFromEvent(row, intel);
    if (bp) {
      blueprintCreated = true;
      blueprintId = bp.id;
    }
  }

  return {
    countyMemoryUpdated: true,
    blueprintCreated,
    blueprintId,
    mediaEnriched,
    successfulEvent: successful,
  };
}
