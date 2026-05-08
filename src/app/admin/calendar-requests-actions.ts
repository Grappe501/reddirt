"use server";

import { randomBytes } from "crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  CampaignEventStatus,
  CampaignEventType,
  CampaignEventVisibility,
  EventWorkflowState,
  WorkflowActionKind,
  WorkflowIntakeStatus,
} from "@prisma/client";
import { requireAdminAction } from "@/app/admin/owned-media-auth";
import { getAdminActorUserId } from "@/lib/admin/actor";
import { isCalendarLikeWorkflowIntake } from "@/lib/calendar/calendar-intake-taxonomy";
import { prisma } from "@/lib/db";

function trim(fd: FormData, key: string): string {
  const v = fd.get(key);
  return typeof v === "string" ? v.trim() : "";
}

function newDraftSlug() {
  return `draft-${randomBytes(4).toString("hex")}`;
}

function isCalendarLaneIntake(row: {
  source: string | null;
  metadata: unknown;
  submission: { type: string | null; structuredData: unknown } | null;
} | null): row is NonNullable<typeof row> {
  if (!row) return false;
  return isCalendarLikeWorkflowIntake({
    source: row.source,
    metadata: row.metadata,
    submission: row.submission ?? undefined,
  });
}

async function logIntakeAction(input: {
  workflowIntakeId: string;
  actorUserId: string | null;
  kind: WorkflowActionKind;
  fromStatus: WorkflowIntakeStatus | null;
  toStatus: WorkflowIntakeStatus | null;
  summary: string;
}) {
  await prisma.workflowAction.create({
    data: {
      workflowIntakeId: input.workflowIntakeId,
      actorUserId: input.actorUserId,
      kind: input.kind,
      fromStatus: input.fromStatus ?? undefined,
      toStatus: input.toStatus ?? undefined,
      summary: input.summary,
      metadata: { packet: "CALENDAR_REQUESTS_OPS" },
    },
  });
}

export async function markCalendarIntakeInReviewAction(fd: FormData): Promise<void> {
  await requireAdminAction();
  const actorId = await getAdminActorUserId();
  const id = trim(fd, "intakeId");
  if (!id) redirect("/admin/workbench/calendar/requests?error=id");
  const row = await prisma.workflowIntake.findUnique({
    where: { id },
    include: { submission: { select: { type: true, structuredData: true } } },
  });
  if (!isCalendarLaneIntake(row)) redirect("/admin/workbench/calendar/requests?error=not-found");
  const from = row.status;
  await prisma.workflowIntake.update({ where: { id }, data: { status: "IN_REVIEW" } });
  await logIntakeAction({
    workflowIntakeId: id,
    actorUserId: actorId,
    kind: "STATUS_CHANGE",
    fromStatus: from,
    toStatus: "IN_REVIEW",
    summary: "Marked in review (Calendar Requests).",
  });
  revalidatePath("/admin/workbench/calendar/requests");
  revalidatePath("/admin/workbench/calendar");
  redirect("/admin/workbench/calendar/requests?notice=review");
}

export async function markCalendarIntakeNeedsFollowUpAction(fd: FormData): Promise<void> {
  await requireAdminAction();
  const actorId = await getAdminActorUserId();
  const id = trim(fd, "intakeId");
  if (!id) redirect("/admin/workbench/calendar/requests?error=id");
  const row = await prisma.workflowIntake.findUnique({
    where: { id },
    include: { submission: { select: { type: true, structuredData: true } } },
  });
  if (!isCalendarLaneIntake(row)) redirect("/admin/workbench/calendar/requests?error=not-found");
  const from = row.status;
  await prisma.workflowIntake.update({ where: { id }, data: { status: "AWAITING_INFO" } });
  await logIntakeAction({
    workflowIntakeId: id,
    actorUserId: actorId,
    kind: "STATUS_CHANGE",
    fromStatus: from,
    toStatus: "AWAITING_INFO",
    summary: "Marked needs follow-up (Calendar Requests).",
  });
  revalidatePath("/admin/workbench/calendar/requests");
  revalidatePath("/admin/workbench/calendar");
  redirect("/admin/workbench/calendar/requests?notice=followup");
}

export async function archiveCalendarIntakeAction(fd: FormData): Promise<void> {
  await requireAdminAction();
  const actorId = await getAdminActorUserId();
  const id = trim(fd, "intakeId");
  if (!id) redirect("/admin/workbench/calendar/requests?error=id");
  const row = await prisma.workflowIntake.findUnique({
    where: { id },
    include: { submission: { select: { type: true, structuredData: true } } },
  });
  if (!isCalendarLaneIntake(row)) redirect("/admin/workbench/calendar/requests?error=not-found");
  const from = row.status;
  await prisma.workflowIntake.update({ where: { id }, data: { status: "ARCHIVED" } });
  await logIntakeAction({
    workflowIntakeId: id,
    actorUserId: actorId,
    kind: "STATUS_CHANGE",
    fromStatus: from,
    toStatus: "ARCHIVED",
    summary: "Archived from Calendar Requests (no external publish).",
  });
  revalidatePath("/admin/workbench/calendar/requests");
  revalidatePath("/admin/workbench/calendar");
  redirect("/admin/workbench/calendar/requests?notice=archived");
}

export async function createDraftCampaignEventFromIntakeAction(fd: FormData): Promise<void> {
  await requireAdminAction();
  const actorId = await getAdminActorUserId();
  const id = trim(fd, "intakeId");
  if (!id) redirect("/admin/workbench/calendar/requests?error=id");
  const intake = await prisma.workflowIntake.findUnique({
    where: { id },
    include: {
      submission: { include: { user: true } },
      eventRequest: { include: { campaignEvent: true } },
    },
  });
  if (!isCalendarLaneIntake(intake)) redirect("/admin/workbench/calendar/requests?error=not-found");
  if (intake.eventRequest?.campaignEventId) {
    const evId = intake.eventRequest.campaignEventId;
    redirect(`/admin/workbench/calendar?event=${encodeURIComponent(evId)}&view=week`);
  }

  const sd =
    intake.submission?.structuredData &&
    typeof intake.submission.structuredData === "object" &&
    !Array.isArray(intake.submission.structuredData)
      ? (intake.submission.structuredData as Record<string, unknown>)
      : {};
  const community = typeof sd.community === "string" ? sd.community.trim() : "";
  const gatheringType = typeof sd.gatheringType === "string" ? sd.gatheringType.trim() : "gathering";
  const autoTitle = `Host ${gatheringType}${community ? ` — ${community}` : ""}`.trim() || "Host gathering request";
  const title = (intake.title?.trim() || autoTitle).slice(0, 500);

  const startAt = new Date();
  startAt.setUTCMinutes(0, 0, 0);
  startAt.setUTCHours(startAt.getUTCHours() + 72);
  const endAt = new Date(startAt.getTime() + 3600000);

  const notes = `Created from WorkflowIntake ${intake.id} (calendar-lane intake). Operator: link preserved for audit.`;

  const ev = await prisma.campaignEvent.create({
    data: {
      slug: newDraftSlug(),
      title: title.slice(0, 500),
      description: intake.submission?.content?.slice(0, 8000) ?? null,
      eventType: CampaignEventType.MEETING,
      status: CampaignEventStatus.DRAFT,
      visibility: CampaignEventVisibility.INTERNAL,
      countyId: intake.countyId,
      startAt,
      endAt,
      eventWorkflowState: EventWorkflowState.DRAFT,
      notes,
      internalSummary: `Source intake: ${intake.id}. Submitter: ${intake.submission?.user?.email ?? "unknown"}.`,
    },
  });

  await prisma.eventRequest.upsert({
    where: { workflowIntakeId: intake.id },
    create: {
      workflowIntakeId: intake.id,
      campaignEventId: ev.id,
      status: "OPEN",
      requestDetails: notes,
    },
    update: {
      campaignEventId: ev.id,
    },
  });

  await prisma.workflowIntake.update({
    where: { id: intake.id },
    data: { status: "CONVERTED" },
  });

  await logIntakeAction({
    workflowIntakeId: intake.id,
    actorUserId: actorId,
    kind: "EVENT_LINKED",
    fromStatus: intake.status,
    toStatus: "CONVERTED",
    summary: `Linked draft CampaignEvent ${ev.id} (Calendar Requests).`,
  });

  revalidatePath("/admin/workbench/calendar/requests");
  revalidatePath("/admin/workbench/calendar");
  revalidatePath("/admin/events");
  redirect(`/admin/workbench/calendar?event=${encodeURIComponent(ev.id)}&view=week`);
}
