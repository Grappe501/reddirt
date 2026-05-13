"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import {
  CalendarAlertChannel,
  CalendarAlertSeverity,
  CalendarAlertStatus,
  CampaignTaskPriority,
  CampaignTaskStatus,
  CampaignTaskType,
  EventWorkflowState,
  GoogleEventSyncState,
  KellyCockpitDecisionKind,
  KellySurrogateTypePref,
} from "@prisma/client";
import { ADMIN_SESSION_COOKIE, getAdminSecret, verifyAdminSessionToken } from "@/lib/admin/session";
import { prisma } from "@/lib/db";
import {
  patchKellyItemStaged,
  type GoogleSyncStatusPref,
  type GoogleSyncTargetPref,
  type KellyItemStagedMetadata,
  type PressReleasePref,
} from "@/lib/calendar/kelly-cockpit-staged-metadata";
import { promoteKellyCalendarItemToCampaignEvent } from "@/lib/calendar/kelly-promote-json-item";
import { syncKellyCampaignEventToGoogle } from "@/lib/calendar/kelly-sync-campaign-event-google";
import { findKellyConfirmedCalendarSource, findKellyTentativeCalendarSource } from "@/lib/calendar/kelly-google-calendar-policy";
import { runIncrementalIngestForSource } from "@/lib/calendar/google-sync-engine";

const REVAL = ["/admin/calendar-command-center", "/admin/calendar-command-center/kelly"] as const;

function actorId() {
  return process.env.KELLY_COCKPIT_ACTOR_ID?.trim() || "kelly-cockpit-admin";
}

async function assertAdminSession() {
  const secret = getAdminSecret();
  const token = (await cookies()).get(ADMIN_SESSION_COOKIE)?.value;
  if (!secret || !verifyAdminSessionToken(token, secret)) throw new Error("Unauthorized");
}

function rev(eventId?: string) {
  for (const p of REVAL) revalidatePath(p);
  if (eventId) revalidatePath(`/admin/calendar-command-center/event/${encodeURIComponent(eventId)}`);
}

async function staffTaskLine(title: string, calendarItemId: string) {
  await prisma.campaignTask.create({
    data: {
      title: title.slice(0, 200),
      description: `Kelly Calendar Cockpit · item ${calendarItemId}`,
      taskType: CampaignTaskType.OTHER,
      status: CampaignTaskStatus.TODO,
      priority: CampaignTaskPriority.HIGH,
    },
  });
}

export async function approveCalendarItem(calendarItemId: string, notes?: string) {
  await assertAdminSession();
  await prisma.kellyCalendarDecision.create({
    data: {
      calendarItemId,
      decision: KellyCockpitDecisionKind.APPROVE,
      decidedByUserId: actorId(),
      notes: notes?.slice(0, 8000),
    },
  });

  const { campaignEventId } = await promoteKellyCalendarItemToCampaignEvent(calendarItemId, actorId());

  const before = await prisma.campaignEvent.findUnique({
    where: { id: campaignEventId },
    select: { eventWorkflowState: true },
  });
  const fromState = before?.eventWorkflowState ?? EventWorkflowState.DRAFT;

  await prisma.campaignEvent.update({
    where: { id: campaignEventId },
    data: {
      eventWorkflowState: EventWorkflowState.APPROVED,
      approvedAt: new Date(),
    },
  });

  await prisma.eventStageChangeLog.create({
    data: {
      eventId: campaignEventId,
      fromState,
      toState: EventWorkflowState.APPROVED,
      actorUserId: null,
      note: notes?.slice(0, 2000) ?? "Kelly approved",
    },
  });

  await syncKellyCampaignEventToGoogle(campaignEventId, null);

  rev(calendarItemId);
  return { ok: true as const };
}

export async function requestCalendarItemModification(input: {
  calendarItemId: string;
  notes?: string;
  requestedDateChange?: string | null;
  requestedTimeChange?: string | null;
  requestedLocationChange?: string | null;
  partialAttendance?: boolean;
}) {
  await assertAdminSession();
  const meta = input.partialAttendance ? { partialAttendance: true } : {};
  await prisma.kellyCalendarDecision.create({
    data: {
      calendarItemId: input.calendarItemId,
      decision: KellyCockpitDecisionKind.MODIFY,
      decidedByUserId: actorId(),
      notes: input.notes?.slice(0, 8000),
      requestedDateChange: input.requestedDateChange ? new Date(input.requestedDateChange) : undefined,
      requestedTimeChange: input.requestedTimeChange?.slice(0, 120),
      requestedLocationChange: input.requestedLocationChange?.slice(0, 2000),
      staffFollowUpRequired: true,
      metadataJson: meta,
    },
  });
  await staffTaskLine("Kelly requested calendar changes", input.calendarItemId);
  rev(input.calendarItemId);
  return { ok: true as const };
}

export async function requestLocalCoverage(input: {
  calendarItemId: string;
  surrogateType: KellySurrogateTypePref;
  requestedSurrogateId?: string | null;
  notes?: string;
  countyId?: string | null;
}) {
  await assertAdminSession();
  const decision = await prisma.kellyCalendarDecision.create({
    data: {
      calendarItemId: input.calendarItemId,
      decision: KellyCockpitDecisionKind.SEND_LOCAL,
      decidedByUserId: actorId(),
      notes: input.notes?.slice(0, 8000),
      requestedSurrogateType: input.surrogateType,
      requestedSurrogateId: input.requestedSurrogateId?.slice(0, 120),
      staffFollowUpRequired: true,
    },
  });
  await prisma.localCoverageRequest.create({
    data: {
      calendarItemId: input.calendarItemId,
      countyId: input.countyId ?? undefined,
      requestedByUserId: actorId(),
      surrogateType: input.surrogateType,
      requestedSurrogateId: input.requestedSurrogateId?.slice(0, 120),
      notes: input.notes?.slice(0, 8000),
      sourceDecisionId: decision.id,
    },
  });
  await staffTaskLine("Confirm local / surrogate coverage for Kelly", input.calendarItemId);
  rev(input.calendarItemId);
  return { ok: true as const };
}

export async function holdCalendarItem(calendarItemId: string, reason?: string, notes?: string) {
  await assertAdminSession();
  const full = [reason ? `HOLD_REASON:${reason}` : "", notes ?? ""].filter(Boolean).join("\n").slice(0, 8000);
  await prisma.kellyCalendarDecision.create({
    data: {
      calendarItemId,
      decision: KellyCockpitDecisionKind.HOLD,
      decidedByUserId: actorId(),
      notes: full || undefined,
    },
  });
  rev(calendarItemId);
  return { ok: true as const };
}

export async function rejectCalendarItem(calendarItemId: string, reason: string) {
  await assertAdminSession();
  if (!reason.trim()) throw new Error("Reason required");
  await prisma.kellyCalendarDecision.create({
    data: {
      calendarItemId,
      decision: KellyCockpitDecisionKind.REJECT,
      decidedByUserId: actorId(),
      notes: reason.slice(0, 8000),
    },
  });
  rev(calendarItemId);
  return { ok: true as const };
}

export async function askStaffAboutCalendarItem(calendarItemId: string, message: string) {
  await assertAdminSession();
  if (!message.trim()) throw new Error("Message required");
  await prisma.kellyCalendarDecision.create({
    data: {
      calendarItemId,
      decision: KellyCockpitDecisionKind.ASK_STAFF,
      decidedByUserId: actorId(),
      notes: message.slice(0, 8000),
      staffFollowUpRequired: true,
    },
  });
  await staffTaskLine(`Kelly asked staff: ${message.slice(0, 80)}`, calendarItemId);
  rev(calendarItemId);
  return { ok: true as const };
}

export async function createCalendarAlert(input: {
  calendarItemId: string;
  campaignEventId?: string | null;
  alertType: string;
  severity: keyof typeof CalendarAlertSeverity;
  title: string;
  body: string;
  dueAt?: string | null;
  channel?: keyof typeof CalendarAlertChannel;
  dedupeKey?: string | null;
}) {
  await assertAdminSession();
  const sev =
    (CalendarAlertSeverity as Record<string, CalendarAlertSeverity>)[input.severity] ??
    CalendarAlertSeverity.MEDIUM;
  const ch = input.channel
    ? (CalendarAlertChannel as Record<string, CalendarAlertChannel>)[input.channel] ?? CalendarAlertChannel.IN_APP
    : CalendarAlertChannel.IN_APP;
  await prisma.calendarAlert.create({
    data: {
      calendarItemId: input.calendarItemId,
      campaignEventId: input.campaignEventId ?? undefined,
      alertType: input.alertType.slice(0, 96),
      severity: sev,
      title: input.title.slice(0, 200),
      body: input.body.slice(0, 8000),
      dueAt: input.dueAt ? new Date(input.dueAt) : undefined,
      channel: ch,
      dedupeKey: input.dedupeKey?.slice(0, 200) ?? undefined,
    },
  });
  rev(input.calendarItemId);
  return { ok: true as const };
}

export async function markCalendarAlertRead(alertId: string) {
  await assertAdminSession();
  await prisma.calendarAlert.update({
    where: { id: alertId },
    data: { status: CalendarAlertStatus.READ },
  });
  REVAL.forEach((p) => revalidatePath(p));
  return { ok: true as const };
}

export async function snoozeCalendarAlert(alertId: string, snoozeUntilIso: string) {
  await assertAdminSession();
  await prisma.calendarAlert.update({
    where: { id: alertId },
    data: { status: CalendarAlertStatus.SNOOZED, snoozedUntil: new Date(snoozeUntilIso) },
  });
  REVAL.forEach((p) => revalidatePath(p));
  return { ok: true as const };
}

export async function saveKellyCalendarItemStaging(
  calendarItemId: string,
  patch: {
    pressRelease?: PressReleasePref;
    pressAngleNote?: string | null;
    googleSyncStatus?: GoogleSyncStatusPref;
    googleSyncTarget?: GoogleSyncTargetPref;
  },
) {
  await assertAdminSession();
  const clean: KellyItemStagedMetadata = {};
  if (patch.pressRelease) clean.pressRelease = patch.pressRelease;
  if (patch.pressAngleNote !== undefined) clean.pressAngleNote = patch.pressAngleNote?.trim().slice(0, 4000) || undefined;
  if (patch.googleSyncStatus) clean.googleSyncStatus = patch.googleSyncStatus;
  if (patch.googleSyncTarget) clean.googleSyncTarget = patch.googleSyncTarget;
  patchKellyItemStaged(calendarItemId, clean);
  rev(calendarItemId);
  return { ok: true as const };
}

export async function promoteApprovedItemToCampaignEvent(calendarItemId: string, campaignEventId: string) {
  await assertAdminSession();
  const existing = await prisma.kellyCalendarPromotion.findUnique({ where: { calendarItemId } });
  if (existing) throw new Error("Already promoted");
  await prisma.kellyCalendarPromotion.create({
    data: {
      calendarItemId,
      campaignEventId,
      promotedByUserId: actorId(),
    },
  });
  rev(calendarItemId);
  return { ok: true as const };
}

/** Appends Kelly modification notes onto the linked `CampaignEvent.internalSummary` (does not auto-publish). */
export async function syncApprovedItemToCalendarHQ(calendarItemId: string) {
  await assertAdminSession();
  const promotion = await prisma.kellyCalendarPromotion.findUnique({ where: { calendarItemId } });
  if (!promotion) return { ok: false as const, message: "Item not promoted to a CampaignEvent yet." };
  const latestMod = await prisma.kellyCalendarDecision.findFirst({
    where: { calendarItemId, decision: KellyCockpitDecisionKind.MODIFY },
    orderBy: { createdAt: "desc" },
  });
  const ev = await prisma.campaignEvent.findUnique({ where: { id: promotion.campaignEventId } });
  if (!ev) return { ok: false as const, message: "CampaignEvent missing." };
  const bits = [
    latestMod?.notes,
    latestMod?.requestedTimeChange ? `Time: ${latestMod.requestedTimeChange}` : "",
    latestMod?.requestedLocationChange ? `Location: ${latestMod.requestedLocationChange}` : "",
  ]
    .filter(Boolean)
    .join("\n");
  if (!bits) return { ok: true as const, message: "Nothing to sync." };
  const merged = `${ev.internalSummary ?? ""}\n[Kelly Calendar Cockpit]\n${bits}`.slice(0, 20000);
  await prisma.campaignEvent.update({
    where: { id: ev.id },
    data: { internalSummary: merged },
  });
  rev(calendarItemId);
  return { ok: true as const, message: "Synced notes to Calendar HQ record." };
}

/** Promote JSON item → CampaignEvent (if needed) and push to the correct Kelly Google lane. */
export async function pushKellyCampaignGoogleForItem(calendarItemId: string) {
  await assertAdminSession();
  const { campaignEventId } = await promoteKellyCalendarItemToCampaignEvent(calendarItemId, actorId());
  await syncKellyCampaignEventToGoogle(campaignEventId, null);
  rev(calendarItemId);
  return { ok: true as const };
}

/** Incremental pull for both Kelly Google lanes (staff). */
export async function pullKellyGoogleCampaignCalendars() {
  await assertAdminSession();
  const t = await findKellyTentativeCalendarSource();
  const c = await findKellyConfirmedCalendarSource();
  if (!t || !c) throw new Error("Kelly Google lanes missing — run npm run calendar:google:ensure");
  const tentative = await runIncrementalIngestForSource(t.id);
  const confirmed = await runIncrementalIngestForSource(c.id);
  REVAL.forEach((p) => revalidatePath(p));
  return { ok: true as const, tentative, confirmed };
}

/** Staff: mark linked CampaignEvent approved and sync to Confirmed Google calendar. */
export async function promoteKellyItemToConfirmedGoogleWorkflow(calendarItemId: string) {
  await assertAdminSession();
  const { campaignEventId } = await promoteKellyCalendarItemToCampaignEvent(calendarItemId, actorId());
  const before = await prisma.campaignEvent.findUnique({
    where: { id: campaignEventId },
    select: { eventWorkflowState: true },
  });
  const fromState = before?.eventWorkflowState ?? EventWorkflowState.DRAFT;
  await prisma.campaignEvent.update({
    where: { id: campaignEventId },
    data: { eventWorkflowState: EventWorkflowState.APPROVED, approvedAt: new Date() },
  });
  await prisma.eventStageChangeLog.create({
    data: {
      eventId: campaignEventId,
      fromState,
      toState: EventWorkflowState.APPROVED,
      actorUserId: null,
      note: "Staff promoted to Confirmed workflow + Google lane",
    },
  });
  await syncKellyCampaignEventToGoogle(campaignEventId, null);
  rev(calendarItemId);
  return { ok: true as const };
}

/** Staff: send event back to draft / Tentative lane in Google. */
export async function sendKellyItemBackToTentativeWorkflow(calendarItemId: string) {
  await assertAdminSession();
  const promo = await prisma.kellyCalendarPromotion.findUnique({ where: { calendarItemId } });
  if (!promo) throw new Error("Item not promoted to CampaignEvent yet.");
  const before = await prisma.campaignEvent.findUnique({
    where: { id: promo.campaignEventId },
    select: { eventWorkflowState: true },
  });
  const fromState = before?.eventWorkflowState ?? EventWorkflowState.APPROVED;
  await prisma.campaignEvent.update({
    where: { id: promo.campaignEventId },
    data: { eventWorkflowState: EventWorkflowState.DRAFT, approvedAt: null },
  });
  await prisma.eventStageChangeLog.create({
    data: {
      eventId: promo.campaignEventId,
      fromState,
      toState: EventWorkflowState.DRAFT,
      actorUserId: null,
      note: "Staff sent back to Tentative / draft workflow",
    },
  });
  await syncKellyCampaignEventToGoogle(promo.campaignEventId, null);
  rev(calendarItemId);
  return { ok: true as const };
}

/** Staff: clear conflict flag after manual resolution (does not auto-merge data). */
export async function resolveKellyGoogleConflictForItem(calendarItemId: string) {
  await assertAdminSession();
  const promo = await prisma.kellyCalendarPromotion.findUnique({ where: { calendarItemId } });
  if (!promo) throw new Error("Item not promoted to CampaignEvent yet.");
  await prisma.campaignEvent.update({
    where: { id: promo.campaignEventId },
    data: {
      syncReviewNeeded: false,
      googleSyncState: GoogleEventSyncState.IDLE,
      googleSyncError: null,
    },
  });
  rev(calendarItemId);
  return { ok: true as const };
}
