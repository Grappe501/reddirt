"use server";

import { CampaignEventStatus, CampaignEventType, EventWorkflowState } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { findInstantOnYmd } from "@/lib/calendar/public-event-format";
import { PUBLIC_CALENDAR_DEFAULT_TZ } from "@/lib/calendar/public-event-types";
import type { IngestImage } from "@/lib/scheduler/ingest";
import { runOscarIngest, type OscarDraft } from "@/lib/scheduler/oscar";
import {
  FIELD_ATTENDANCE_VALUES,
  KELLY_ROLE_VALUES,
  MOBILIZE_VALUES,
  TABLING_VALUES,
  VOLUNTEERS_VALUES,
  parseOptionalHref,
  type PublicFieldAttendance,
  type PublicKellyRole,
  type PublicMobilize,
  type PublicTabling,
  type PublicVolunteers,
} from "@/lib/scheduler/public-card-fields";
import { requireSchedulerPage } from "@/lib/scheduler/require-scheduler";
import { uniqueEventSlug } from "@/lib/scheduler/slug";

function pickAllowed<T extends string>(raw: FormDataEntryValue | null, allowed: readonly T[]): T | null {
  const v = String(raw ?? "").trim();
  if (!v) return null;
  return (allowed as readonly string[]).includes(v) ? (v as T) : null;
}

function chicagoAt(ymd: string, hm: string | undefined, fallbackHour: number): Date {
  const base = findInstantOnYmd(ymd, PUBLIC_CALENDAR_DEFAULT_TZ);
  const m = hm?.match(/^(\d{1,2}):(\d{2})/);
  const hours = m ? Number(m[1]) : fallbackHour;
  const mins = m ? Number(m[2]) : 0;
  return new Date(base.getTime() + hours * 3600000 + mins * 60000);
}

async function resolveCountyId(countyName: string | null | undefined): Promise<string | null> {
  const name = countyName?.trim();
  if (!name) return null;
  const row = await prisma.county.findFirst({
    where: {
      OR: [
        { displayName: { equals: name, mode: "insensitive" } },
        { displayName: { equals: `${name} County`, mode: "insensitive" } },
        { slug: name.toLowerCase().replace(/\s+/g, "-") },
      ],
    },
    select: { id: true },
  });
  return row?.id ?? null;
}

function cardFromForm(formData: FormData) {
  return {
    publicFieldAttendance: pickAllowed(formData.get("fieldAttendance"), FIELD_ATTENDANCE_VALUES),
    publicKellyRole: pickAllowed(formData.get("kellyRole"), KELLY_ROLE_VALUES),
    publicTabling: pickAllowed(formData.get("tabling"), TABLING_VALUES),
    publicVolunteers: pickAllowed(formData.get("volunteers"), VOLUNTEERS_VALUES),
    publicMobilize: pickAllowed(formData.get("mobilize"), MOBILIZE_VALUES),
    publicMobilizeHref: parseOptionalHref(String(formData.get("mobilizeHref") ?? "")),
    publicVolunteerHref: parseOptionalHref(String(formData.get("volunteerHref") ?? "")),
    schedulerNeedsMoreInfo: String(formData.get("needsMoreInfo") ?? "") === "on",
    publicSummary: String(formData.get("publicSummary") ?? "").trim().slice(0, 800) || null,
    locationName: String(formData.get("locationName") ?? "").trim().slice(0, 160) || null,
    title: String(formData.get("title") ?? "").trim().slice(0, 160),
  };
}

export async function saveSchedulerEventAction(formData: FormData) {
  await requireSchedulerPage();
  const id = String(formData.get("id") ?? "");
  if (!id) redirect("/scheduler");
  const patch = cardFromForm(formData);
  if (!patch.title) redirect(`/scheduler/events/${id}?error=title`);
  await prisma.campaignEvent.update({
    where: { id },
    data: {
      title: patch.title,
      locationName: patch.locationName,
      publicSummary: patch.publicSummary,
      publicFieldAttendance: patch.publicFieldAttendance,
      publicKellyRole: patch.publicKellyRole,
      publicTabling: patch.publicTabling,
      publicVolunteers: patch.publicVolunteers,
      publicMobilize: patch.publicMobilize,
      publicMobilizeHref: patch.publicMobilizeHref,
      publicVolunteerHref: patch.publicVolunteerHref,
      schedulerNeedsMoreInfo: patch.schedulerNeedsMoreInfo,
    },
  });
  revalidatePath("/scheduler");
  revalidatePath("/events");
  revalidatePath(`/scheduler/events/${id}`);
  redirect(`/scheduler/events/${id}?saved=1`);
}

export async function publishSchedulerEventAction(formData: FormData) {
  const actor = await requireSchedulerPage();
  const id = String(formData.get("id") ?? "");
  if (!id) redirect("/scheduler");
  const patch = cardFromForm(formData);
  if (!patch.title) redirect(`/scheduler/events/${id}?error=title`);
  await prisma.campaignEvent.update({
    where: { id },
    data: {
      title: patch.title,
      locationName: patch.locationName,
      publicSummary: patch.publicSummary,
      publicFieldAttendance: patch.publicFieldAttendance,
      publicKellyRole: patch.publicKellyRole,
      publicTabling: patch.publicTabling,
      publicVolunteers: patch.publicVolunteers,
      publicMobilize: patch.publicMobilize,
      publicMobilizeHref: patch.publicMobilizeHref,
      publicVolunteerHref: patch.publicVolunteerHref,
      schedulerNeedsMoreInfo: patch.schedulerNeedsMoreInfo,
      isPublicOnWebsite: true,
      eventWorkflowState: EventWorkflowState.PUBLISHED,
      status: CampaignEventStatus.SCHEDULED,
      schedulerPublishedBy: actor.name || actor.email,
      schedulerPublishedAt: new Date(),
    },
  });
  revalidatePath("/scheduler");
  revalidatePath("/events");
  revalidatePath(`/scheduler/events/${id}`);
  redirect(`/scheduler/events/${id}?published=1`);
}

export async function unpublishSchedulerEventAction(formData: FormData) {
  await requireSchedulerPage();
  const id = String(formData.get("id") ?? "");
  if (!id) redirect("/scheduler");
  await prisma.campaignEvent.update({
    where: { id },
    data: { isPublicOnWebsite: false },
  });
  revalidatePath("/scheduler");
  revalidatePath("/events");
  revalidatePath(`/scheduler/events/${id}`);
  redirect(`/scheduler/events/${id}?unpublished=1`);
}

export async function archiveSchedulerEventAction(formData: FormData) {
  const actor = await requireSchedulerPage();
  const id = String(formData.get("id") ?? "");
  if (!id) redirect("/scheduler");
  const reason = String(formData.get("archiveReason") ?? "").trim().slice(0, 800);
  if (reason.length < 8) redirect(`/scheduler/events/${id}?error=archive_reason`);
  const row = await prisma.campaignEvent.findUnique({
    where: { id },
    select: { locationName: true, county: { select: { displayName: true } } },
  });
  if (!row) redirect("/scheduler");
  const place = [row.locationName?.trim(), row.county?.displayName?.trim()].filter(Boolean).join(" · ") || "Place not set";
  await prisma.campaignEvent.update({
    where: { id },
    data: {
      isPublicOnWebsite: false,
      status: CampaignEventStatus.CANCELLED,
      eventWorkflowState: EventWorkflowState.CANCELED,
      schedulerArchivedAt: new Date(),
      schedulerArchivedBy: actor.name || actor.email,
      schedulerArchiveReason: reason,
      schedulerArchivePlace: place.slice(0, 240),
    },
  });
  revalidatePath("/scheduler");
  revalidatePath("/events");
  revalidatePath(`/scheduler/events/${id}`);
  redirect(`/scheduler/events/${id}?archived=1`);
}

const NEW_EVENT_TYPES = [
  "APPEARANCE",
  "RALLY",
  "MEETING",
  "FESTIVAL",
  "TRAINING",
  "CANVASS",
  "FUNDRAISER",
  "PRESS",
  "OTHER",
] as const;

export async function createSchedulerEventAction(formData: FormData) {
  await requireSchedulerPage();
  const title = String(formData.get("title") ?? "").trim().slice(0, 160);
  const date = String(formData.get("date") ?? "").slice(0, 10);
  if (!title || !/^\d{4}-\d{2}-\d{2}$/.test(date)) redirect("/scheduler/new?error=required");
  const startTime = String(formData.get("startTime") ?? "") || undefined;
  const endTime = String(formData.get("endTime") ?? "") || undefined;
  const locationName = String(formData.get("locationName") ?? "").trim().slice(0, 160) || null;
  const countyName = String(formData.get("county") ?? "").trim() || null;
  const rawType = String(formData.get("eventType") ?? "APPEARANCE");
  const eventType = (NEW_EVENT_TYPES as readonly string[]).includes(rawType)
    ? (rawType as (typeof NEW_EVENT_TYPES)[number])
    : "APPEARANCE";
  const slug = await uniqueEventSlug(title, date);
  const countyId = await resolveCountyId(countyName);
  const startAt = chicagoAt(date, startTime, 12);
  const endAt = chicagoAt(date, endTime || startTime, 13);
  const created = await prisma.campaignEvent.create({
    data: {
      slug,
      title,
      eventType: eventType as CampaignEventType,
      status: CampaignEventStatus.SCHEDULED,
      eventWorkflowState: EventWorkflowState.DRAFT,
      isPublicOnWebsite: false,
      startAt,
      endAt: endAt > startAt ? endAt : new Date(startAt.getTime() + 60 * 60 * 1000),
      timezone: PUBLIC_CALENDAR_DEFAULT_TZ,
      locationName,
      countyId,
      publicSummary: String(formData.get("publicSummary") ?? "").trim().slice(0, 800) || null,
    },
    select: { id: true },
  });
  revalidatePath("/scheduler");
  redirect(`/scheduler/events/${created.id}`);
}

export type OscarIngestState = {
  drafts: OscarDraft[];
  ignored: Array<{ title: string; reason: string }>;
  warning?: string;
};

export async function oscarInterpretAction(
  _prev: OscarIngestState | null,
  formData: FormData,
): Promise<OscarIngestState> {
  await requireSchedulerPage();
  const text = String(formData.get("text") ?? "");
  const imagesRaw = String(formData.get("imagesJson") ?? "[]");
  let images: IngestImage[] = [];
  try {
    const parsed = JSON.parse(imagesRaw) as IngestImage[];
    images = Array.isArray(parsed) ? parsed.slice(0, 6) : [];
  } catch {
    images = [];
  }
  if (!text.trim() && images.length === 0) {
    return { drafts: [], ignored: [], warning: "Paste an email or drop a flyer first." };
  }
  return runOscarIngest({ text, images });
}

export async function createDraftFromOscarAction(formData: FormData) {
  await requireSchedulerPage();
  const title = String(formData.get("title") ?? "").trim().slice(0, 160);
  const date = String(formData.get("date") ?? "").slice(0, 10);
  if (!title || !/^\d{4}-\d{2}-\d{2}$/.test(date)) redirect("/scheduler/inbox?error=draft");
  const startTime = String(formData.get("startTime") ?? "") || undefined;
  const endTime = String(formData.get("endTime") ?? "") || undefined;
  const city = String(formData.get("city") ?? "").trim().slice(0, 80) || null;
  const countyName = String(formData.get("county") ?? "").trim() || null;
  const slug = await uniqueEventSlug(title, date);
  const countyId = await resolveCountyId(countyName);
  const startAt = chicagoAt(date, startTime, 12);
  const endAt = chicagoAt(date, endTime || startTime, 13);
  const created = await prisma.campaignEvent.create({
    data: {
      slug,
      title,
      eventType: /fair|festival/i.test(title) ? CampaignEventType.FESTIVAL : CampaignEventType.APPEARANCE,
      status: CampaignEventStatus.SCHEDULED,
      eventWorkflowState: EventWorkflowState.DRAFT,
      isPublicOnWebsite: false,
      startAt,
      endAt: endAt > startAt ? endAt : new Date(startAt.getTime() + 60 * 60 * 1000),
      timezone: PUBLIC_CALENDAR_DEFAULT_TZ,
      locationName: city,
      countyId,
      publicSummary: String(formData.get("publicSummary") ?? "").trim().slice(0, 800) || null,
      publicFieldAttendance: pickAllowed(formData.get("fieldAttendance"), FIELD_ATTENDANCE_VALUES) as
        | PublicFieldAttendance
        | null,
      publicKellyRole: pickAllowed(formData.get("kellyRole"), KELLY_ROLE_VALUES) as PublicKellyRole | null,
      publicTabling: pickAllowed(formData.get("tabling"), TABLING_VALUES) as PublicTabling | null,
      publicVolunteers: pickAllowed(formData.get("volunteers"), VOLUNTEERS_VALUES) as PublicVolunteers | null,
      publicMobilize: pickAllowed(formData.get("mobilize"), MOBILIZE_VALUES) as PublicMobilize | null,
      publicMobilizeHref: parseOptionalHref(String(formData.get("mobilizeHref") ?? "")),
      publicVolunteerHref: parseOptionalHref(String(formData.get("volunteerHref") ?? "")),
      schedulerNeedsMoreInfo: String(formData.get("needsMoreInfo") ?? "") === "1",
    },
    select: { id: true },
  });
  revalidatePath("/scheduler");
  redirect(`/scheduler/events/${created.id}`);
}
