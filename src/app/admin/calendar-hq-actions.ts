"use server";

import { revalidatePath } from "next/cache";
import { randomBytes } from "node:crypto";
import {
  CampaignEventStatus,
  CampaignEventType,
  CampaignEventVisibility,
  EventReadinessStatus,
  EventWorkflowState,
  GoogleEventSyncState,
  Prisma,
  TimeMatrixQuadrant,
} from "@prisma/client";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireAdminAction } from "@/app/admin/owned-media-auth";
import { getAdminActorUserId } from "@/lib/admin/actor";
import { getGoogleCalendarAuthUrl } from "@/lib/integrations/google/oauth";
import { getOrCreateWeeklyPlan } from "@/lib/calendar/hq-command-data";
import { ROLE_STRIP_KEYS } from "@/lib/calendar/weekly-time";
import { ensureExecutionChecklist, type ChecklistSection } from "@/lib/calendar/event-intelligence";
import {
  runApprove,
  runCancel,
  runComplete,
  runPublish,
  runSendBackToDraft,
  runSubmitForReview,
  applyLegacyWorkflowSetIfValid,
} from "@/lib/calendar/event-lifecycle";
import {
  pushCampaignEventToGoogle,
  pullOneEventFromGoogle,
  runIncrementalIngestForSource,
  registerOrRenewWatchForSource,
} from "@/lib/calendar/google-sync-engine";
import { fullListEstablishSyncToken } from "@/lib/integrations/google/calendar";
function pickState(raw: string): EventWorkflowState {
  const u = Object.values(EventWorkflowState).find((v) => v === raw);
  return u ?? EventWorkflowState.DRAFT;
}

function str(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

export async function setEventWorkflowStateAction(formData: FormData) {
  await requireAdminAction();
  const id = str(formData, "eventId");
  if (!id) return;
  const state = pickState(String(formData.get("workflowState") ?? ""));
  const a = await getAdminActorUserId();
  const r = await applyLegacyWorkflowSetIfValid(id, state, a);
  if (!r.ok) {
    revalidatePath("/admin/workbench/calendar");
    revalidatePath("/campaign-calendar");
    return;
  }
  revalidatePath("/admin/workbench/calendar");
  revalidatePath("/campaign-calendar");
}

export async function submitEventForReviewAction(formData: FormData) {
  await requireAdminAction();
  const id = str(formData, "eventId");
  if (!id) return;
  const a = await getAdminActorUserId();
  try {
    await runSubmitForReview(id, {
      logNote: str(formData, "note") || null,
      approvalNote: str(formData, "approvalNote") || null,
      actorUserId: a,
    });
  } catch {
    /* noop — invalid transition */
  }
  revalidatePath("/admin/workbench/calendar");
  revalidatePath("/campaign-calendar");
  revalidatePath("/admin/events");
}

export async function approveEventAction(formData: FormData) {
  await requireAdminAction();
  const id = str(formData, "eventId");
  if (!id) return;
  const a = await getAdminActorUserId();
  try {
    await runApprove(id, {
      logNote: str(formData, "note") || null,
      approvalNote: str(formData, "approvalNote") || null,
      actorUserId: a,
    });
  } catch {
    /* noop */
  }
  revalidatePath("/admin/workbench/calendar");
  revalidatePath("/campaign-calendar");
  revalidatePath("/admin/events");
}

export async function sendEventBackToDraftAction(formData: FormData) {
  await requireAdminAction();
  const id = str(formData, "eventId");
  if (!id) return;
  const a = await getAdminActorUserId();
  try {
    await runSendBackToDraft(id, {
      logNote: str(formData, "note") || null,
      approvalNote: str(formData, "approvalNote") || null,
      actorUserId: a,
    });
  } catch {
    /* noop */
  }
  revalidatePath("/admin/workbench/calendar");
  revalidatePath("/campaign-calendar");
  revalidatePath("/admin/events");
}

export async function publishEventAction(formData: FormData) {
  await requireAdminAction();
  const id = str(formData, "eventId");
  if (!id) return;
  const a = await getAdminActorUserId();
  try {
    await runPublish(id, { logNote: str(formData, "note") || null, actorUserId: a });
  } catch {
    /* noop */
  }
  revalidatePath("/admin/workbench/calendar");
  revalidatePath("/campaign-calendar");
  revalidatePath("/admin/events");
}

export async function cancelEventAction(formData: FormData) {
  await requireAdminAction();
  const id = str(formData, "eventId");
  const reason = str(formData, "cancellationReason");
  if (!id) return;
  const a = await getAdminActorUserId();
  try {
    await runCancel(id, {
      logNote: str(formData, "note") || null,
      cancellationReason: reason,
      actorUserId: a,
    });
  } catch {
    /* noop */
  }
  revalidatePath("/admin/workbench/calendar");
  revalidatePath("/campaign-calendar");
  revalidatePath("/admin/events");
}

export async function completeEventAction(formData: FormData) {
  await requireAdminAction();
  const id = str(formData, "eventId");
  if (!id) return;
  const a = await getAdminActorUserId();
  try {
    await runComplete(id, { logNote: str(formData, "note") || null, actorUserId: a });
  } catch {
    /* noop */
  }
  revalidatePath("/admin/workbench/calendar");
  revalidatePath("/campaign-calendar");
  revalidatePath("/admin/events");
}

export async function startGoogleCalendarOAuthAction(formData: FormData) {
  await requireAdminAction();
  const sourceId = String(formData.get("sourceId") ?? "").trim();
  if (!sourceId) return;
  const url = getGoogleCalendarAuthUrl(sourceId);
  redirect(url);
}

export async function updateEventGoogleIdsAction(
  id: string,
  data: { googleEventId?: string | null; googleEtag?: string | null; googleSyncState?: GoogleEventSyncState; lastGoogleSyncAt?: Date }
) {
  await requireAdminAction();
  await prisma.campaignEvent.update({ where: { id }, data });
  revalidatePath("/admin/workbench/calendar");
}

const QSET = new Set<string>(Object.values(TimeMatrixQuadrant));

function pickQuadrant(raw: string | null | undefined): TimeMatrixQuadrant | undefined {
  if (!raw) return undefined;
  return QSET.has(raw) ? (raw as TimeMatrixQuadrant) : undefined;
}

export async function updateWeeklyPlanAction(formData: FormData) {
  await requireAdminAction();
  const weekKey = String(formData.get("weekKey") ?? "").trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(weekKey)) return;
  const plan = await getOrCreateWeeklyPlan(weekKey);
  const roleMap: Record<string, string> = {};
  for (const { key } of ROLE_STRIP_KEYS) {
    const v = String(formData.get(`role_${key}`) ?? "").trim();
    if (v) roleMap[key] = v;
  }
  await prisma.weeklyCampaignPlan.update({
    where: { id: plan.id },
    data: {
      missionStatement: String(formData.get("missionStatement") ?? "").trim() || null,
      outcome1: String(formData.get("outcome1") ?? "").trim() || null,
      outcome2: String(formData.get("outcome2") ?? "").trim() || null,
      outcome3: String(formData.get("outcome3") ?? "").trim() || null,
      roleCommitmentsJson: (roleMap as Prisma.InputJsonValue) ?? {},
    },
  });
  revalidatePath("/admin/workbench/calendar");
}

export async function addWeeklyBigRockAction(formData: FormData) {
  await requireAdminAction();
  const weekKey = String(formData.get("weekKey") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();
  if (!weekKey || !title) return;
  const plan = await getOrCreateWeeklyPlan(weekKey);
  const n = await prisma.weeklyBigRock.count({ where: { weekPlanId: plan.id } });
  if (n >= 5) return;
  const max = await prisma.weeklyBigRock.aggregate({ _max: { sortOrder: true }, where: { weekPlanId: plan.id } });
  const sortOrder = (max._max.sortOrder ?? -1) + 1;
  const eventId = String(formData.get("eventId") ?? "").trim() || null;
  if (eventId) {
    const ev = await prisma.campaignEvent.findUnique({ where: { id: eventId } });
    const t = (ev?.title ?? title).trim() || "Big rock";
    await prisma.$transaction([
      prisma.weeklyBigRock.create({
        data: {
          weekPlanId: plan.id,
          title: t,
          sortOrder,
          eventId,
        },
      }),
      prisma.campaignEvent.update({ where: { id: eventId }, data: { isBigRock: true, bigRockOrder: sortOrder } }),
    ]);
  } else {
    await prisma.weeklyBigRock.create({ data: { weekPlanId: plan.id, title, sortOrder } });
  }
  revalidatePath("/admin/workbench/calendar");
}

export async function removeWeeklyBigRockAction(formData: FormData) {
  await requireAdminAction();
  const id = String(formData.get("bigRockId") ?? "").trim();
  if (!id) return;
  const rock = await prisma.weeklyBigRock.findUnique({ where: { id } });
  if (!rock) return;
  if (rock.eventId) {
    await prisma.campaignEvent.update({ where: { id: rock.eventId }, data: { isBigRock: false, bigRockOrder: null } });
  }
  await prisma.weeklyBigRock.delete({ where: { id } });
  revalidatePath("/admin/workbench/calendar");
}

export async function updateEventExecutionFieldsAction(formData: FormData) {
  await requireAdminAction();
  const eventId = String(formData.get("eventId") ?? "").trim();
  if (!eventId) return;
  const q = pickQuadrant(String(formData.get("timeMatrixQuadrant") ?? ""));
  const intent = String(formData.get("campaignIntent") ?? "").trim();
  const contentNotes = String(formData.get("contentOpportunityNotes") ?? "").trim();
  const markRock = formData.get("isBigRock") === "on" || formData.get("isBigRock") === "true";
  await prisma.campaignEvent.update({
    where: { id: eventId },
    data: {
      ...(q ? { timeMatrixQuadrant: q } : {}),
      campaignIntent: intent || null,
      contentOpportunityNotes: contentNotes || null,
      isBigRock: markRock,
    },
  });
  revalidatePath("/admin/workbench/calendar");
  revalidatePath("/admin/events");
  revalidatePath("/campaign-calendar");
}

export async function toggleExecutionChecklistItemAction(formData: FormData) {
  await requireAdminAction();
  const eventId = String(formData.get("eventId") ?? "").trim();
  const section = String(formData.get("section") ?? "").trim() as ChecklistSection;
  const itemId = String(formData.get("itemId") ?? "").trim();
  if (!eventId || !itemId) return;
  if (!["prep", "comms", "staffing", "followUp"].includes(section)) return;
  const ev = await prisma.campaignEvent.findUnique({ where: { id: eventId } });
  if (!ev) return;
  const check = ensureExecutionChecklist(ev.executionChecklistJson);
  const list = check[section];
  const it = list.find((x) => x.id === itemId);
  if (it) it.done = !it.done;
  await prisma.campaignEvent.update({
    where: { id: eventId },
    data: { executionChecklistJson: check as Prisma.InputJsonValue },
  });
  revalidatePath("/admin/workbench/calendar");
}

function newDraftSlug() {
  return `draft-${randomBytes(4).toString("hex")}`;
}

const READINESS = new Set<string>(Object.values(EventReadinessStatus));

function pickReadiness(raw: string): EventReadinessStatus {
  return READINESS.has(raw) ? (raw as EventReadinessStatus) : EventReadinessStatus.UNKNOWN;
}

export async function createDraftEventInSlotAction(formData: FormData) {
  await requireAdminAction();
  const ymd = String(formData.get("ymd") ?? "").trim();
  const week = String(formData.get("weekKey") ?? "").trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(ymd) || !week) return;
  const [y, mo, d] = ymd.split("-").map(Number);
  const startAt = new Date(Date.UTC(y, mo - 1, d, 15, 0, 0));
  const endAt = new Date(startAt.getTime() + 3600000);
  const ev = await prisma.campaignEvent.create({
    data: {
      slug: newDraftSlug(),
      title: "New draft event",
      eventType: CampaignEventType.OTHER,
      status: CampaignEventStatus.DRAFT,
      visibility: CampaignEventVisibility.INTERNAL,
      startAt,
      endAt,
      eventWorkflowState: EventWorkflowState.DRAFT,
    },
  });
  revalidatePath("/admin/workbench/calendar");
  revalidatePath("/admin/events");
  const returnSearch = String(formData.get("returnSearch") ?? "").trim();
  if (returnSearch) {
    const u = new URLSearchParams(returnSearch);
    u.set("event", ev.id);
    u.set("view", "week");
    u.set("week", week);
    redirect(`/admin/workbench/calendar?${u.toString()}`);
  } else {
    redirect(`/admin/workbench/calendar?week=${encodeURIComponent(week)}&view=week&event=${ev.id}`);
  }
}

export async function createBlankDraftEventAction() {
  await requireAdminAction();
  const startAt = new Date();
  startAt.setUTCMinutes(0, 0, 0);
  startAt.setUTCHours(startAt.getUTCHours() + 1);
  const endAt = new Date(startAt.getTime() + 3600000);
  const ev = await prisma.campaignEvent.create({
    data: {
      slug: newDraftSlug(),
      title: "New draft event",
      eventType: CampaignEventType.OTHER,
      status: CampaignEventStatus.DRAFT,
      visibility: CampaignEventVisibility.INTERNAL,
      startAt,
      endAt,
      eventWorkflowState: EventWorkflowState.DRAFT,
    },
  });
  revalidatePath("/admin/workbench/calendar");
  revalidatePath("/admin/events");
  redirect(`/admin/events/${ev.id}`);
}

export async function refreshCalendarHqAction() {
  await requireAdminAction();
  revalidatePath("/admin/workbench/calendar");
  revalidatePath("/campaign-calendar");
}

export async function slice1PublishQueueInfoAction() {
  await requireAdminAction();
  const n = await prisma.campaignEvent.count({
    where: { eventWorkflowState: EventWorkflowState.APPROVED, isPublicOnWebsite: false },
  });
  revalidatePath("/admin/workbench/calendar");
  redirect(
    `/admin/workbench/calendar?info=${encodeURIComponent(
      `${n} approved event(s) not yet on the public site. Open each to publish or set workflow to Public.`
    )}`
  );
}

export async function updateEventContextFieldsAction(formData: FormData) {
  await requireAdminAction();
  const id = String(formData.get("eventId") ?? "").trim();
  if (!id) return;
  const internalSummary = String(formData.get("internalSummary") ?? "").trim() || null;
  await prisma.campaignEvent.update({
    where: { id },
    data: {
      internalSummary,
      commsReadiness: pickReadiness(String(formData.get("commsReadiness") ?? "UNKNOWN")),
      staffingReadiness: pickReadiness(String(formData.get("staffingReadiness") ?? "UNKNOWN")),
      prepReadiness: pickReadiness(String(formData.get("prepReadiness") ?? "UNKNOWN")),
      followupReadiness: pickReadiness(String(formData.get("followupReadiness") ?? "UNKNOWN")),
    },
  });
  revalidatePath("/admin/workbench/calendar");
  revalidatePath("/admin/events");
}

function siteBaseUrl() {
  return (process.env.NEXT_PUBLIC_SITE_URL ?? "").replace(/\/$/, "") || "http://localhost:3000";
}

export async function pushEventToGoogleAction(formData: FormData) {
  await requireAdminAction();
  const id = str(formData, "eventId");
  if (!id) return;
  const a = await getAdminActorUserId();
  try {
    await pushCampaignEventToGoogle(id, a);
  } catch {
    /* logged on row */
  }
  revalidatePath("/admin/workbench/calendar");
  revalidatePath("/admin/events");
}

export async function pullEventFromGoogleAction(formData: FormData) {
  await requireAdminAction();
  const id = str(formData, "eventId");
  if (!id) return;
  try {
    await pullOneEventFromGoogle(id);
  } catch {
    /* noop */
  }
  revalidatePath("/admin/workbench/calendar");
  revalidatePath("/admin/events");
}

export async function clearEventGoogleErrorAction(formData: FormData) {
  await requireAdminAction();
  const id = str(formData, "eventId");
  if (!id) return;
  await prisma.campaignEvent.update({
    where: { id },
    data: { googleSyncError: null, googleSyncState: GoogleEventSyncState.IDLE },
  });
  revalidatePath("/admin/workbench/calendar");
  revalidatePath("/admin/events");
}

export async function incrementalSyncSourceAction(formData: FormData) {
  await requireAdminAction();
  const sid = str(formData, "sourceId");
  if (!sid) return;
  try {
    await runIncrementalIngestForSource(sid);
  } catch {
    /* logged */
  }
  revalidatePath("/admin/workbench/calendar");
}

export async function fullResyncSourceAction(formData: FormData) {
  await requireAdminAction();
  const sid = str(formData, "sourceId");
  if (!sid) return;
  try {
    await fullListEstablishSyncToken(sid);
  } catch {
    /* noop */
  }
  revalidatePath("/admin/workbench/calendar");
}

export async function registerCalendarWatchAction(formData: FormData) {
  await requireAdminAction();
  const sid = str(formData, "sourceId");
  if (!sid) return;
  const src = await prisma.calendarSource.findUnique({ where: { id: sid } });
  if (!src) return;
  try {
    await registerOrRenewWatchForSource(src, siteBaseUrl());
  } catch {
    /* noop */
  }
  revalidatePath("/admin/workbench/calendar");
}