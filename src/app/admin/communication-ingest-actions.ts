"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireAdminAction } from "@/app/admin/owned-media-auth";
import { getAdminActorUserId } from "@/lib/admin/actor";
import { fetchGmailUserEmail } from "@/lib/integrations/gmail/gmail-api";
import {
  CALENDAR_HISTORY_PHRASE_THRESHOLD,
  CALENDAR_IMPORT_EVENT_CAP_DEFAULT,
  COMMUNICATION_INGEST_CONFIRM_PHRASE,
  CONTACTS_HISTORY_PHRASE_THRESHOLD,
  CONTACTS_IMPORT_CAP_DEFAULT,
  GMAIL_HISTORY_PHRASE_THRESHOLD,
  GMAIL_IMPORT_MESSAGE_CAP_DEFAULT,
} from "@/lib/communications/communication-ingest-constants";
import {
  previewGmailIngest,
  runGmailIngest,
  previewGoogleContactsIngest,
  runGoogleContactsIngest,
  previewGoogleCalendarIngest,
  runGoogleCalendarIngest,
} from "@/lib/communications/ingest-service";
import type { GmailIngestQueryParams } from "@/lib/google/gmail-ingest";

const BASE = "/admin/workbench/communication-intelligence";

function trim(fd: FormData, key: string): string {
  const v = fd.get(key);
  return typeof v === "string" ? v.trim() : "";
}

function parseDate(fd: FormData, key: string): Date | null {
  const s = trim(fd, key);
  if (!s) return null;
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? null : d;
}

function parseBool(fd: FormData, key: string): boolean {
  return String(fd.get(key) ?? "") === "on" || String(fd.get(key) ?? "") === "true";
}

export async function previewGmailIngestAction(fd: FormData): Promise<void> {
  await requireAdminAction();
  const actorId = await getAdminActorUserId();
  if (!actorId) redirect(`${BASE}?error=actor`);
  const dateStart = parseDate(fd, "dateStart");
  const dateEnd = parseDate(fd, "dateEnd");
  if (!dateStart || !dateEnd) redirect(`${BASE}?error=dates`);
  const maxMessages = Math.min(Number(trim(fd, "maxMessages")) || GMAIL_IMPORT_MESSAGE_CAP_DEFAULT, 500);
  const query: GmailIngestQueryParams = {
    dateStart,
    dateEnd,
    includeSent: parseBool(fd, "includeSent"),
    includeInbox: parseBool(fd, "includeInbox"),
    includeArchived: parseBool(fd, "includeArchived"),
    includeSpam: parseBool(fd, "includeSpam"),
    includeTrash: parseBool(fd, "includeTrash"),
  };
  const res = await previewGmailIngest({ staffUserId: actorId, query, maxMessages });
  if (!res.ok) redirect(`${BASE}?error=${encodeURIComponent(res.error ?? "preview")}`);
  redirect(`${BASE}?gmail_preview=${res.listed}`);
}

export async function runGmailIngestAction(fd: FormData): Promise<void> {
  await requireAdminAction();
  const actorId = await getAdminActorUserId();
  if (!actorId) redirect(`${BASE}?error=actor`);
  const dateStart = parseDate(fd, "dateStart");
  const dateEnd = parseDate(fd, "dateEnd");
  if (!dateStart || !dateEnd) redirect(`${BASE}?error=dates`);
  const maxMessages = Number(trim(fd, "maxMessages")) || GMAIL_IMPORT_MESSAGE_CAP_DEFAULT;
  const bodyMode = trim(fd, "bodyStorageMode") || "METADATA_ONLY";
  const bodyStorageMode =
    bodyMode === "FULL_TEXT" ? "FULL_TEXT" : bodyMode === "SNIPPET_AND_HEADERS" ? "SNIPPET_AND_HEADERS" : "METADATA_ONLY";
  const phraseHistory = trim(fd, "confirmPhraseHistory");
  const phraseBody = trim(fd, "confirmPhraseBody");
  if (maxMessages > GMAIL_HISTORY_PHRASE_THRESHOLD && phraseHistory !== COMMUNICATION_INGEST_CONFIRM_PHRASE.gmailHistory) {
    redirect(`${BASE}?error=phrase_gmail_history`);
  }
  if (bodyStorageMode === "FULL_TEXT" && phraseBody !== COMMUNICATION_INGEST_CONFIRM_PHRASE.gmailFullBody) {
    redirect(`${BASE}?error=phrase_gmail_body`);
  }
  const providerAccountEmail = (await fetchGmailUserEmail(actorId)) ?? null;
  const query: GmailIngestQueryParams = {
    dateStart,
    dateEnd,
    includeSent: parseBool(fd, "includeSent"),
    includeInbox: parseBool(fd, "includeInbox"),
    includeArchived: parseBool(fd, "includeArchived"),
    includeSpam: parseBool(fd, "includeSpam"),
    includeTrash: parseBool(fd, "includeTrash"),
  };
  const run = await prisma.externalIngestRun.create({
    data: {
      source: "GMAIL_MESSAGES",
      mode: "IMPORT",
      status: "RUNNING",
      staffUserId: actorId,
      requestedByUserId: actorId,
      providerAccountEmail,
      startedAt: new Date(),
      configJson: { maxMessages, bodyStorageMode, query },
    },
  });
  try {
    const stats = await runGmailIngest({
      staffUserId: actorId,
      providerAccountEmail,
      requestedByUserId: actorId,
      ingestRunId: run.id,
      query,
      maxMessages: Math.min(maxMessages, 5000),
      bodyStorageMode,
    });
    await prisma.externalIngestRun.update({
      where: { id: run.id },
      data: {
        status: "COMPLETED",
        completedAt: new Date(),
        statsJson: stats as object,
      },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    await prisma.externalIngestRun.update({
      where: { id: run.id },
      data: {
        status: "FAILED",
        failedAt: new Date(),
        errorSummary: msg.slice(0, 2000),
      },
    });
    redirect(`${BASE}?error=gmail_import_failed`);
  }
  revalidatePath(BASE);
  redirect(`${BASE}?notice=gmail_import`);
}

export async function previewGoogleContactsIngestAction(fd: FormData): Promise<void> {
  await requireAdminAction();
  const actorId = await getAdminActorUserId();
  if (!actorId) redirect(`${BASE}?error=actor`);
  const pageSize = Math.min(Number(trim(fd, "maxContacts")) || 50, 200);
  const res = await previewGoogleContactsIngest({ staffUserId: actorId, pageSize });
  if (!res.ok) redirect(`${BASE}?error=${encodeURIComponent(res.error ?? "contacts_preview")}`);
  redirect(`${BASE}?contacts_preview=${res.count}`);
}

export async function runGoogleContactsIngestAction(fd: FormData): Promise<void> {
  await requireAdminAction();
  const actorId = await getAdminActorUserId();
  if (!actorId) redirect(`${BASE}?error=actor`);
  const maxContacts = Number(trim(fd, "maxContacts")) || CONTACTS_IMPORT_CAP_DEFAULT;
  const phrase = trim(fd, "confirmPhrase");
  if (maxContacts > CONTACTS_HISTORY_PHRASE_THRESHOLD && phrase !== COMMUNICATION_INGEST_CONFIRM_PHRASE.googleContacts) {
    redirect(`${BASE}?error=phrase_contacts`);
  }
  const providerAccountEmail = (await fetchGmailUserEmail(actorId)) ?? null;
  const run = await prisma.externalIngestRun.create({
    data: {
      source: "GOOGLE_CONTACTS",
      mode: "IMPORT",
      status: "RUNNING",
      staffUserId: actorId,
      requestedByUserId: actorId,
      providerAccountEmail,
      startedAt: new Date(),
      configJson: { maxContacts },
    },
  });
  try {
    const stats = await runGoogleContactsIngest({
      staffUserId: actorId,
      providerAccountEmail,
      ingestRunId: run.id,
      maxContacts: Math.min(maxContacts, 5000),
    });
    await prisma.externalIngestRun.update({
      where: { id: run.id },
      data: { status: "COMPLETED", completedAt: new Date(), statsJson: stats as object },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    await prisma.externalIngestRun.update({
      where: { id: run.id },
      data: { status: "FAILED", failedAt: new Date(), errorSummary: msg.slice(0, 2000) },
    });
    redirect(`${BASE}?error=contacts_import_failed`);
  }
  revalidatePath(BASE);
  redirect(`${BASE}?notice=contacts_import`);
}

export async function previewGoogleCalendarIngestAction(fd: FormData): Promise<void> {
  await requireAdminAction();
  const calendarSourceId = trim(fd, "calendarSourceId");
  if (!calendarSourceId) redirect(`${BASE}?error=calendar_source`);
  const timeMin = parseDate(fd, "calDateStart");
  const timeMax = parseDate(fd, "calDateEnd");
  if (!timeMin || !timeMax) redirect(`${BASE}?error=dates`);
  const maxEvents = Number(trim(fd, "maxEvents")) || CALENDAR_IMPORT_EVENT_CAP_DEFAULT;
  const includeCanceled = parseBool(fd, "includeCanceled");
  const res = await previewGoogleCalendarIngest({ calendarSourceId, timeMin, timeMax, maxEvents, includeCanceled });
  if (!res.ok) redirect(`${BASE}?error=${encodeURIComponent(res.error ?? "cal_preview")}`);
  redirect(`${BASE}?cal_preview=${res.count}`);
}

export async function runGoogleCalendarIngestAction(fd: FormData): Promise<void> {
  await requireAdminAction();
  const actorId = await getAdminActorUserId();
  if (!actorId) redirect(`${BASE}?error=actor`);
  const calendarSourceId = trim(fd, "calendarSourceId");
  if (!calendarSourceId) redirect(`${BASE}?error=calendar_source`);
  const timeMin = parseDate(fd, "calDateStart");
  const timeMax = parseDate(fd, "calDateEnd");
  if (!timeMin || !timeMax) redirect(`${BASE}?error=dates`);
  const maxEvents = Number(trim(fd, "maxEvents")) || CALENDAR_IMPORT_EVENT_CAP_DEFAULT;
  const includeCanceled = parseBool(fd, "includeCanceled");
  const includePrivateDetails = parseBool(fd, "includePrivateDetails");
  const phrase = trim(fd, "confirmPhrase");
  if (maxEvents > CALENDAR_HISTORY_PHRASE_THRESHOLD && phrase !== COMMUNICATION_INGEST_CONFIRM_PHRASE.calendarHistory) {
    redirect(`${BASE}?error=phrase_calendar`);
  }
  const providerAccountEmail = (await fetchGmailUserEmail(actorId)) ?? null;
  const run = await prisma.externalIngestRun.create({
    data: {
      source: "GOOGLE_CALENDAR_EVENTS",
      mode: "IMPORT",
      status: "RUNNING",
      staffUserId: actorId,
      requestedByUserId: actorId,
      providerAccountEmail,
      startedAt: new Date(),
      configJson: { calendarSourceId, maxEvents, includeCanceled, includePrivateDetails },
    },
  });
  try {
    const stats = await runGoogleCalendarIngest({
      calendarSourceId,
      providerAccountEmail,
      ingestRunId: run.id,
      timeMin,
      timeMax,
      maxEvents: Math.min(maxEvents, 5000),
      includeCanceled,
      includePrivateDetails,
    });
    await prisma.externalIngestRun.update({
      where: { id: run.id },
      data: { status: "COMPLETED", completedAt: new Date(), statsJson: stats as object },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    await prisma.externalIngestRun.update({
      where: { id: run.id },
      data: { status: "FAILED", failedAt: new Date(), errorSummary: msg.slice(0, 2000) },
    });
    redirect(`${BASE}?error=calendar_import_failed`);
  }
  revalidatePath(BASE);
  redirect(`${BASE}?notice=calendar_import`);
}

export async function approveCommunicationMatchCandidateAction(fd: FormData): Promise<void> {
  await requireAdminAction();
  const actorId = await getAdminActorUserId();
  const id = trim(fd, "candidateId");
  if (!id || !actorId) redirect(`${BASE}?error=candidate`);
  await prisma.communicationProfileMatchCandidate.update({
    where: { id },
    data: { status: "APPROVED", reviewedByUserId: actorId, reviewedAt: new Date() },
  });
  revalidatePath(BASE);
  redirect(`${BASE}?notice=match_approved`);
}

export async function rejectCommunicationMatchCandidateAction(fd: FormData): Promise<void> {
  await requireAdminAction();
  const actorId = await getAdminActorUserId();
  const id = trim(fd, "candidateId");
  if (!id || !actorId) redirect(`${BASE}?error=candidate`);
  await prisma.communicationProfileMatchCandidate.update({
    where: { id },
    data: { status: "REJECTED", reviewedByUserId: actorId, reviewedAt: new Date() },
  });
  revalidatePath(BASE);
  redirect(`${BASE}?notice=match_rejected`);
}

export async function markCommunicationIdentityNeedsReviewAction(fd: FormData): Promise<void> {
  await requireAdminAction();
  const id = trim(fd, "identityId");
  if (!id) redirect(`${BASE}?error=id`);
  await prisma.communicationIdentity.update({
    where: { id },
    data: { reviewStatus: "NEEDS_REVIEW" },
  });
  revalidatePath(BASE);
  redirect(`/admin/workbench/communication-intelligence/identities/${encodeURIComponent(id)}?notice=marked_review`);
}

export async function ignoreCommunicationIdentityAction(fd: FormData): Promise<void> {
  await requireAdminAction();
  const id = trim(fd, "identityId");
  if (!id) redirect(`${BASE}?error=id`);
  await prisma.communicationIdentity.update({
    where: { id },
    data: { reviewStatus: "IGNORED" },
  });
  revalidatePath(BASE);
  redirect(`${BASE}?notice=identity_ignored`);
}
