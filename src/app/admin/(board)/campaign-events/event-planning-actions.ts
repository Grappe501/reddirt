"use server";

import { revalidatePath } from "next/cache";
import { appendGlobalUserObservation, type UserUxObservationEvent } from "@/lib/agents/user-intelligence/user-observations";
import {
  buildCampaignManagerBrief,
  buildCandidateBrief,
  detectRunOfShowGaps,
  estimateVolunteerPlan,
  generatePackList,
  generateRunOfShow,
  mergePlanningFromRow,
  scoreEventPlanningReadiness,
  seedContactsFromFactCard,
} from "@/lib/campaign-events/event-planning/event-planning-helpers";
import { loadEventPlanning, saveEventPlanning } from "@/lib/campaign-events/event-planning/event-planning-persist";
import type { EventPlanningData, EventPlanningSectionId } from "@/lib/campaign-events/event-planning/event-planning-types";
import { loadCalendarEventDrilldown, serializeCalendarRows } from "@/lib/campaign-events/load-campaign-calendar-events";

function revalidateDrilldown(recordId: string) {
  revalidatePath(`/admin/campaign-events/${recordId}`);
  revalidatePath("/admin/campaign-events/workbench");
  revalidatePath("/admin/campaign-events", "layout");
}

function track(
  event: UserUxObservationEvent,
  recordId: string,
  meta?: Record<string, string | number | boolean | null>,
) {
  appendGlobalUserObservation({
    event,
    actor: "admin",
    role: "campaign_manager",
    pathname: `/admin/campaign-events/${recordId}`,
    recordId,
    meta,
  });
}

async function loadRow(recordId: string) {
  const loaded = await loadCalendarEventDrilldown(recordId);
  if (!loaded) throw new Error("Event not found");
  const [row] = serializeCalendarRows([loaded.row]);
  return row;
}

export async function saveEventPlanningSectionAction(recordId: string, planning: EventPlanningData) {
  const prev = await loadEventPlanning(recordId);
  await saveEventPlanning(recordId, planning);
  const readiness = scoreEventPlanningReadiness(await loadRow(recordId), planning);
  const prevScore =
    scoreEventPlanningReadiness(await loadRow(recordId), prev).scorePercent;
  if (readiness.scorePercent > prevScore) {
    track("planning_readiness_improved", recordId, { score: readiness.scorePercent });
  }
  revalidateDrilldown(recordId);
  return { ok: true as const, readiness };
}

export async function markPlanningSectionCompleteAction(
  recordId: string,
  sectionId: EventPlanningSectionId,
  planning: EventPlanningData,
) {
  const next = {
    ...planning,
    sectionCompleted: { ...planning.sectionCompleted, [sectionId]: true },
  };
  await saveEventPlanning(recordId, next);
  track("planning_section_completed", recordId, { section: sectionId });
  revalidateDrilldown(recordId);
  return { ok: true as const };
}

export async function generateRunOfShowAction(recordId: string, planning: EventPlanningData) {
  const row = await loadRow(recordId);
  const runOfShow = generateRunOfShow(row);
  const next = { ...planning, runOfShow };
  await saveEventPlanning(recordId, next);
  track("run_of_show_created", recordId, { rows: runOfShow.length });
  revalidateDrilldown(recordId);
  return { ok: true as const, planning: next, gaps: detectRunOfShowGaps(runOfShow) };
}

export async function generatePackListAction(recordId: string, planning: EventPlanningData) {
  const row = await loadRow(recordId);
  const packList = generatePackList(row);
  const next = { ...planning, packList };
  await saveEventPlanning(recordId, next);
  track("pack_list_updated", recordId, { items: packList.length });
  revalidateDrilldown(recordId);
  return { ok: true as const, planning: next };
}

export async function seedVolunteerPlanAction(recordId: string, planning: EventPlanningData) {
  const row = await loadRow(recordId);
  const volunteerPlan = estimateVolunteerPlan(row);
  const next = { ...planning, volunteerPlan };
  await saveEventPlanning(recordId, next);
  track("volunteer_plan_updated", recordId);
  revalidateDrilldown(recordId);
  return { ok: true as const, planning: next };
}

export async function seedContactsAction(recordId: string, planning: EventPlanningData) {
  const row = await loadRow(recordId);
  const contacts = seedContactsFromFactCard(row);
  const next = { ...planning, contacts: { ...contacts, ...planning.contacts } };
  await saveEventPlanning(recordId, next);
  revalidateDrilldown(recordId);
  return { ok: true as const, planning: next };
}

export async function generateCandidateBriefAction(recordId: string, planning: EventPlanningData) {
  const row = await loadRow(recordId);
  const candidateBrief = buildCandidateBrief(row, planning);
  const next = { ...planning, candidateBrief };
  await saveEventPlanning(recordId, next);
  track("candidate_brief_generated", recordId);
  revalidateDrilldown(recordId);
  return { ok: true as const, planning: next, brief: candidateBrief };
}

export async function generateCmBriefAction(recordId: string, planning: EventPlanningData) {
  const row = await loadRow(recordId);
  const readiness = scoreEventPlanningReadiness(row, planning);
  const cmBrief = buildCampaignManagerBrief(row, planning, readiness);
  const next = { ...planning, cmBrief };
  await saveEventPlanning(recordId, next);
  track("cm_brief_generated", recordId);
  revalidateDrilldown(recordId);
  return { ok: true as const, planning: next, brief: cmBrief };
}

export async function loadEventPlanningReadinessAction(recordId: string, planning: EventPlanningData) {
  const row = await loadRow(recordId);
  const merged = mergePlanningFromRow(row, planning);
  return scoreEventPlanningReadiness(row, merged);
}
