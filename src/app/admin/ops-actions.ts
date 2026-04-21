"use server";

import { revalidatePath } from "next/cache";
import { randomBytes } from "node:crypto";
import {
  CampaignEventStatus,
  CampaignEventType,
  CampaignEventVisibility,
  CampaignTaskStatus,
  VolunteerAskStatus,
  VolunteerAskType,
} from "@prisma/client";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireAdminAction } from "@/app/admin/owned-media-auth";
import { runEventCreatedWorkflows, runEventSignupWorkflows } from "@/lib/ops/workflow/runner";

function pickEnum<T extends string>(raw: string, values: readonly T[], fallback: T): T {
  return (values as readonly string[]).includes(raw) ? (raw as T) : fallback;
}

function slugify(input: string): string {
  const s = input
    .toLowerCase()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return s.slice(0, 64) || "event";
}

function newEventSlug(title: string) {
  return `${slugify(title)}-${randomBytes(3).toString("hex")}`;
}

// --- Events ---

export async function createCampaignEventAction(formData: FormData) {
  await requireAdminAction();
  const title = String(formData.get("title") ?? "").trim();
  if (!title) redirect("/admin/events?error=title");
  const slug = newEventSlug(title);
  const eventType = pickEnum(
    String(formData.get("eventType") ?? "OTHER"),
    Object.values(CampaignEventType),
    CampaignEventType.OTHER
  );
  const startAt = new Date(String(formData.get("startAt") ?? ""));
  const endAt = new Date(String(formData.get("endAt") ?? ""));
  if (Number.isNaN(startAt.getTime()) || Number.isNaN(endAt.getTime())) redirect("/admin/events?error=date");
  const countyId = String(formData.get("countyId") ?? "").trim() || null;
  const description = String(formData.get("description") ?? "").trim() || null;
  const locationName = String(formData.get("locationName") ?? "").trim() || null;
  const address = String(formData.get("address") ?? "").trim() || null;
  const visibility = pickEnum(
    String(formData.get("visibility") ?? "INTERNAL"),
    Object.values(CampaignEventVisibility),
    CampaignEventVisibility.INTERNAL
  );
  const status = pickEnum(
    String(formData.get("status") ?? "SCHEDULED"),
    Object.values(CampaignEventStatus),
    CampaignEventStatus.SCHEDULED
  );

  const ev = await prisma.campaignEvent.create({
    data: {
      slug,
      title,
      description,
      eventType,
      status,
      visibility,
      countyId,
      locationName,
      address,
      startAt,
      endAt,
    },
  });

  await runEventCreatedWorkflows(ev.id);

  revalidatePath("/admin/workbench");
  revalidatePath("/admin/events");
  redirect(`/admin/events/${ev.id}`);
}

export async function updateCampaignEventAction(formData: FormData) {
  await requireAdminAction();
  const id = String(formData.get("id") ?? "").trim();
  if (!id) redirect("/admin/events?error=id");
  const title = String(formData.get("title") ?? "").trim();
  if (!title) redirect(`/admin/events/${id}?error=title`);
  const eventType = pickEnum(
    String(formData.get("eventType") ?? "OTHER"),
    Object.values(CampaignEventType),
    CampaignEventType.OTHER
  );
  const startAt = new Date(String(formData.get("startAt") ?? ""));
  const endAt = new Date(String(formData.get("endAt") ?? ""));
  if (Number.isNaN(startAt.getTime()) || Number.isNaN(endAt.getTime())) redirect(`/admin/events/${id}?error=date`);
  const countyId = String(formData.get("countyId") ?? "").trim() || null;
  const description = String(formData.get("description") ?? "").trim() || null;
  const locationName = String(formData.get("locationName") ?? "").trim() || null;
  const address = String(formData.get("address") ?? "").trim() || null;
  const visibility = pickEnum(
    String(formData.get("visibility") ?? "INTERNAL"),
    Object.values(CampaignEventVisibility),
    CampaignEventVisibility.INTERNAL
  );
  const status = pickEnum(
    String(formData.get("status") ?? "SCHEDULED"),
    Object.values(CampaignEventStatus),
    CampaignEventStatus.SCHEDULED
  );
  const notes = String(formData.get("notes") ?? "").trim() || null;

  await prisma.campaignEvent.update({
    where: { id },
    data: {
      title,
      description,
      eventType,
      status,
      visibility,
      countyId,
      locationName,
      address,
      startAt,
      endAt,
      notes,
    },
  });

  revalidatePath("/admin/events");
  revalidatePath(`/admin/events/${id}`);
  revalidatePath("/admin/workbench");
  redirect(`/admin/events/${id}?saved=1`);
}

// --- Tasks ---

export async function createCampaignTaskAction(formData: FormData) {
  await requireAdminAction();
  const title = String(formData.get("title") ?? "").trim();
  if (!title) redirect("/admin/tasks?error=title");
  const eventId = String(formData.get("eventId") ?? "").trim() || null;
  const dueAtRaw = String(formData.get("dueAt") ?? "").trim();
  const dueAt = dueAtRaw ? new Date(dueAtRaw) : null;
  if (dueAt && Number.isNaN(dueAt.getTime())) redirect("/admin/tasks?error=date");
  const description = String(formData.get("description") ?? "").trim() || null;

  await prisma.campaignTask.create({
    data: {
      title,
      description,
      eventId: eventId || null,
    },
  });
  revalidatePath("/admin/tasks");
  revalidatePath("/admin/workbench");
  if (eventId) revalidatePath(`/admin/events/${eventId}`);
  redirect("/admin/tasks?created=1");
}

export async function updateTaskStatusAction(formData: FormData) {
  await requireAdminAction();
  const id = String(formData.get("id") ?? "").trim();
  if (!id) redirect("/admin/tasks?error=id");
  const status = pickEnum(
    String(formData.get("status") ?? "TODO"),
    Object.values(CampaignTaskStatus),
    CampaignTaskStatus.TODO
  );
  const completionNotes = String(formData.get("completionNotes") ?? "").trim() || null;

  await prisma.campaignTask.update({
    where: { id },
    data: {
      status,
      completedAt: status === "DONE" ? new Date() : null,
      completionNotes: status === "DONE" ? completionNotes : null,
    },
  });
  revalidatePath("/admin/tasks");
  revalidatePath("/admin/workbench");
  const ev = await prisma.campaignTask.findUnique({ where: { id }, select: { eventId: true } });
  if (ev?.eventId) revalidatePath(`/admin/events/${ev.eventId}`);
  redirect("/admin/tasks?updated=1");
}

export async function assignTaskAction(formData: FormData) {
  await requireAdminAction();
  const id = String(formData.get("id") ?? "").trim();
  if (!id) return;
  const assignedUserId = String(formData.get("assignedUserId") ?? "").trim() || null;
  const assignedRole = String(formData.get("assignedRole") ?? "").trim() || null;
  await prisma.campaignTask.update({
    where: { id },
    data: { assignedUserId, assignedRole },
  });
  revalidatePath("/admin/tasks");
  revalidatePath("/admin/workbench");
}

// --- Event signup ---

export async function createEventSignupAction(formData: FormData) {
  await requireAdminAction();
  const eventId = String(formData.get("eventId") ?? "").trim();
  if (!eventId) redirect("/admin/events?error=event");
  const firstName = String(formData.get("firstName") ?? "").trim();
  const lastName = String(formData.get("lastName") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  if (!firstName || !lastName || !email) redirect(`/admin/events/${eventId}?error=signup`);
  const mobilePhone = String(formData.get("mobilePhone") ?? "").trim() || null;
  const notes = String(formData.get("notes") ?? "").trim() || null;
  const countyId = String(formData.get("countyId") ?? "").trim() || null;

  const s = await prisma.eventSignup.create({
    data: {
      eventId,
      firstName,
      lastName,
      email,
      mobilePhone,
      notes,
      countyId,
    },
  });

  await runEventSignupWorkflows(s.id);

  revalidatePath("/admin/events");
  revalidatePath(`/admin/events/${eventId}`);
  revalidatePath("/admin/workbench");
  redirect(`/admin/events/${eventId}?signup=1`);
}

// --- Volunteer ask ---

export async function createVolunteerAskAction(formData: FormData) {
  await requireAdminAction();
  const title = String(formData.get("title") ?? "").trim();
  if (!title) redirect("/admin/asks?error=title");
  const askType = pickEnum(
    String(formData.get("askType") ?? "OTHER"),
    Object.values(VolunteerAskType),
    VolunteerAskType.OTHER
  );
  const description = String(formData.get("description") ?? "").trim() || null;
  const eventId = String(formData.get("eventId") ?? "").trim() || null;
  const countyId = String(formData.get("countyId") ?? "").trim() || null;
  const status = pickEnum(
    String(formData.get("status") ?? "DRAFT"),
    Object.values(VolunteerAskStatus),
    VolunteerAskStatus.DRAFT
  );
  const actionUrl = String(formData.get("actionUrl") ?? "").trim() || null;

  await prisma.volunteerAsk.create({
    data: {
      title,
      description,
      askType,
      status,
      eventId: eventId || null,
      countyId: countyId || null,
      actionUrl,
    },
  });
  revalidatePath("/admin/asks");
  revalidatePath("/admin/workbench");
  redirect("/admin/asks?created=1");
}

export async function updateVolunteerAskStatusAction(formData: FormData) {
  await requireAdminAction();
  const id = String(formData.get("id") ?? "").trim();
  if (!id) return;
  const status = pickEnum(
    String(formData.get("status") ?? "DRAFT"),
    Object.values(VolunteerAskStatus),
    VolunteerAskStatus.DRAFT
  );
  await prisma.volunteerAsk.update({ where: { id }, data: { status } });
  revalidatePath("/admin/asks");
  revalidatePath("/admin/workbench");
}
