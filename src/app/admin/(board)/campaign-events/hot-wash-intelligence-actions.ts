"use server";

import { revalidatePath } from "next/cache";
import { appendGlobalUserObservation } from "@/lib/agents/user-intelligence/user-observations";
import { loadCalendarEventDrilldown, serializeCalendarRows } from "@/lib/campaign-events/load-campaign-calendar-events";
import {
  buildHotWashExecutiveSummary,
  extractTopFindings,
  persistBlueprintFromEvent,
} from "@/lib/campaign-events/hot-wash-intelligence/event-intelligence-helpers";
import { runCampaignLearningLoop } from "@/lib/campaign-events/hot-wash-intelligence/campaign-learning-loop";
import {
  intelligenceToLegacyNotes,
  loadHotWashIntelligence,
  saveHotWashIntelligence,
} from "@/lib/campaign-events/hot-wash-intelligence/hot-wash-intelligence-persist";
import type { HotWashIntelligenceData } from "@/lib/campaign-events/hot-wash-intelligence/hot-wash-intelligence-types";
import { saveHotWashNotes } from "@/lib/campaign-events/hot-wash-notes";
import { loadCountyMemory } from "@/lib/campaign-events/county-memory/county-memory-store";

function revalidate(recordId: string) {
  revalidatePath(`/admin/campaign-events/${recordId}`);
  revalidatePath("/admin/campaign-events/media-approval");
  revalidatePath("/admin/ai-command-center");
}

async function loadRow(recordId: string) {
  const loaded = await loadCalendarEventDrilldown(recordId);
  if (!loaded) throw new Error("Event not found");
  return serializeCalendarRows([loaded.row])[0]!;
}

export async function saveHotWashIntelligenceAction(recordId: string, data: HotWashIntelligenceData) {
  const enriched: HotWashIntelligenceData = {
    ...data,
    executiveSummary: data.executiveSummary?.trim() || buildHotWashExecutiveSummary(await loadRow(recordId), data),
    topFindings: data.topFindings.length ? data.topFindings : extractTopFindings(data),
  };
  await saveHotWashIntelligence(recordId, enriched);
  await saveHotWashNotes(recordId, intelligenceToLegacyNotes(enriched));
  revalidate(recordId);
  return { ok: true as const };
}

export async function completeHotWashIntelligenceAction(recordId: string, data: HotWashIntelligenceData) {
  const row = await loadRow(recordId);
  const enriched: HotWashIntelligenceData = {
    ...data,
    executiveSummary: data.executiveSummary?.trim() || buildHotWashExecutiveSummary(row, data),
    topFindings: extractTopFindings(data),
  };
  await saveHotWashIntelligence(recordId, enriched, { markCompleted: true });
  await saveHotWashNotes(recordId, intelligenceToLegacyNotes(enriched));
  const loop = await runCampaignLearningLoop(row, enriched);
  const obsBase = { actor: "admin", role: "campaign_manager", pathname: `/admin/campaign-events/${recordId}`, recordId };
  appendGlobalUserObservation({ ...obsBase, event: "hotwash_completed", meta: { blueprint: loop.blueprintCreated, county: true } });
  appendGlobalUserObservation({ ...obsBase, event: "county_memory_updated" });
  appendGlobalUserObservation({ ...obsBase, event: "county_signal_detected" });
  if (loop.successfulEvent) appendGlobalUserObservation({ ...obsBase, event: "successful_event_logged" });
  if (loop.blueprintCreated) appendGlobalUserObservation({ ...obsBase, event: "event_blueprint_created" });
  if (loop.blueprintCreated) appendGlobalUserObservation({ ...obsBase, event: "event_pattern_detected" });
  appendGlobalUserObservation({ ...obsBase, event: "messaging_signal_detected" });
  appendGlobalUserObservation({ ...obsBase, event: "strategic_signal_detected" });
  appendGlobalUserObservation({ ...obsBase, event: "followup_task_generated" });
  appendGlobalUserObservation({ ...obsBase, event: "relationship_opportunity_detected" });
  revalidate(recordId);
  return { ok: true as const, loop };
}

export async function loadCountyMemoryPreviewAction(countyLabel: string) {
  const mem = await loadCountyMemory(countyLabel);
  return { ok: true as const, memory: mem };
}

export async function generateBlueprintFromHotWashAction(recordId: string, data: HotWashIntelligenceData) {
  const row = await loadRow(recordId);
  const bp = await persistBlueprintFromEvent(row, data);
  if (bp) {
    appendGlobalUserObservation({ event: "event_blueprint_created", actor: "admin", role: "campaign_manager", recordId });
  }
  revalidate(recordId);
  return { ok: true as const, blueprint: bp };
}
