import {
  EmailOptInStatus,
  Prisma,
  SmsOptInStatus,
} from "@prisma/client";
import { prisma } from "@/lib/db";
import type { ResolvedContact } from "./contact-resolution";
import { linkThreadToResolvedContact, resolveContactFromEmailAndPhone } from "./contact-resolution";

export type ContactPreferenceRow = Prisma.ContactPreferenceGetPayload<{
  select: {
    id: true;
    emailOptInStatus: true;
    smsOptInStatus: true;
    globalUnsubscribeAt: true;
    smsOptOutAt: true;
    sendgridSuppressionState: true;
    twilioOptOutState: true;
  };
}>;

function mergeSuppression(
  current: Prisma.JsonValue | null,
  event: { type: string; at: string; email?: string }
): Prisma.InputJsonValue {
  const base =
    current && typeof current === "object" && !Array.isArray(current) && current !== null
      ? { ...(current as Record<string, unknown>) }
      : ({} as Record<string, unknown>);
  return { ...base, lastEvent: event } as Prisma.InputJsonValue;
}

/** Prefer user → volunteer profile → thread-scoped row. */
export async function getEffectivePreferenceForThread(thread: {
  id: string;
  userId: string | null;
  volunteerProfileId: string | null;
}): Promise<ContactPreferenceRow | null> {
  if (thread.userId) {
    const p = await prisma.contactPreference.findUnique({
      where: { userId: thread.userId },
      select: {
        id: true,
        emailOptInStatus: true,
        smsOptInStatus: true,
        globalUnsubscribeAt: true,
        smsOptOutAt: true,
        sendgridSuppressionState: true,
        twilioOptOutState: true,
      },
    });
    if (p) return p;
  }
  if (thread.volunteerProfileId) {
    const p = await prisma.contactPreference.findUnique({
      where: { volunteerProfileId: thread.volunteerProfileId },
      select: {
        id: true,
        emailOptInStatus: true,
        smsOptInStatus: true,
        globalUnsubscribeAt: true,
        smsOptOutAt: true,
        sendgridSuppressionState: true,
        twilioOptOutState: true,
      },
    });
    if (p) return p;
  }
  return prisma.contactPreference.findUnique({
    where: { communicationThreadId: thread.id },
    select: {
      id: true,
      emailOptInStatus: true,
      smsOptInStatus: true,
      globalUnsubscribeAt: true,
      smsOptOutAt: true,
      sendgridSuppressionState: true,
      twilioOptOutState: true,
    },
  });
}

const prefSelect = {
  id: true,
  emailOptInStatus: true,
  smsOptInStatus: true,
  globalUnsubscribeAt: true,
  smsOptOutAt: true,
  sendgridSuppressionState: true,
  twilioOptOutState: true,
} as const;

/** Broadcast: preferences without a `CommunicationThread` (user or volunteer only). */
export async function getEffectivePreferenceByIdentity(params: {
  userId: string | null;
  volunteerProfileId: string | null;
}): Promise<ContactPreferenceRow | null> {
  if (params.userId) {
    const p = await prisma.contactPreference.findUnique({
      where: { userId: params.userId },
      select: prefSelect,
    });
    if (p) return p;
  }
  if (params.volunteerProfileId) {
    return prisma.contactPreference.findUnique({
      where: { volunteerProfileId: params.volunteerProfileId },
      select: prefSelect,
    });
  }
  return null;
}

export function canSendSms(p: ContactPreferenceRow | null): { ok: true } | { ok: false; reason: string } {
  if (!p) return { ok: true };
  if (p.smsOptInStatus === SmsOptInStatus.OPT_OUT) {
    return { ok: false, reason: "SMS opt-out (STOP) on file." };
  }
  return { ok: true };
}

export function canSendEmail(p: ContactPreferenceRow | null): { ok: true } | { ok: false; reason: string } {
  if (!p) return { ok: true };
  if (p.globalUnsubscribeAt) {
    return { ok: false, reason: "Global email unsubscribe on file." };
  }
  if (p.emailOptInStatus === EmailOptInStatus.OPT_OUT) {
    return { ok: false, reason: "Email opt-out on file (SendGrid / preference)." };
  }
  return { ok: true };
}

const STOP_KEYWORDS = new Set([
  "stop",
  "stopall",
  "unsubscribe",
  "cancel",
  "end",
  "quit",
]);

const START_KEYWORDS = new Set(["start", "unstop", "yes"]);

function inferOptFromBody(body: string): "stop" | "start" | null {
  const t = body.trim().toLowerCase();
  if (STOP_KEYWORDS.has(t) || t === "stop all") return "stop";
  if (START_KEYWORDS.has(t)) return "start";
  return null;
}

/**
 * Twilio / carrier opt-out: record on the best `ContactPreference` key for this thread.
 */
export async function recordSmsOptOutFromInbound(params: {
  threadId: string;
  source: "twilio_keyword" | "twilio_opt_out_param";
  twilioState?: string | null;
}): Promise<void> {
  const t = await prisma.communicationThread.findUnique({
    where: { id: params.threadId },
    select: { id: true, userId: true, volunteerProfileId: true },
  });
  if (!t) return;

  const data = {
    smsOptInStatus: SmsOptInStatus.OPT_OUT,
    smsOptOutAt: new Date(),
    source: params.source,
    twilioOptOutState: params.twilioState ?? "STOP",
  } as const;

  if (t.userId) {
    await prisma.contactPreference.upsert({
      where: { userId: t.userId },
      create: {
        userId: t.userId,
        emailOptInStatus: EmailOptInStatus.UNKNOWN,
        smsOptInStatus: SmsOptInStatus.OPT_OUT,
        smsOptOutAt: new Date(),
        source: params.source,
        twilioOptOutState: data.twilioOptOutState,
      },
      update: data,
    });
  } else if (t.volunteerProfileId) {
    await prisma.contactPreference.upsert({
      where: { volunteerProfileId: t.volunteerProfileId },
      create: {
        volunteerProfileId: t.volunteerProfileId,
        emailOptInStatus: EmailOptInStatus.UNKNOWN,
        smsOptInStatus: SmsOptInStatus.OPT_OUT,
        smsOptOutAt: new Date(),
        source: params.source,
        twilioOptOutState: data.twilioOptOutState,
      },
      update: data,
    });
  } else {
    await prisma.contactPreference.upsert({
      where: { communicationThreadId: t.id },
      create: {
        communicationThreadId: t.id,
        emailOptInStatus: EmailOptInStatus.UNKNOWN,
        smsOptInStatus: SmsOptInStatus.OPT_OUT,
        smsOptOutAt: new Date(),
        source: params.source,
        twilioOptOutState: data.twilioOptOutState,
      },
      update: data,
    });
  }
}

export async function recordSmsOptInFromInbound(params: { threadId: string }): Promise<void> {
  const t = await prisma.communicationThread.findUnique({
    where: { id: params.threadId },
    select: { id: true, userId: true, volunteerProfileId: true },
  });
  if (!t) return;
  const data = {
    smsOptInStatus: SmsOptInStatus.OPT_IN,
    twilioOptOutState: "START",
  } as const;
  if (t.userId) {
    await prisma.contactPreference.upsert({
      where: { userId: t.userId },
      create: {
        userId: t.userId,
        emailOptInStatus: EmailOptInStatus.UNKNOWN,
        smsOptInStatus: SmsOptInStatus.OPT_IN,
        source: "twilio_keyword",
        twilioOptOutState: "START",
      },
      update: data,
    });
  } else if (t.volunteerProfileId) {
    await prisma.contactPreference.upsert({
      where: { volunteerProfileId: t.volunteerProfileId },
      create: {
        volunteerProfileId: t.volunteerProfileId,
        emailOptInStatus: EmailOptInStatus.UNKNOWN,
        smsOptInStatus: SmsOptInStatus.OPT_IN,
        source: "twilio_keyword",
        twilioOptOutState: "START",
      },
      update: data,
    });
  } else {
    await prisma.contactPreference.upsert({
      where: { communicationThreadId: t.id },
      create: {
        communicationThreadId: t.id,
        emailOptInStatus: EmailOptInStatus.UNKNOWN,
        smsOptInStatus: SmsOptInStatus.OPT_IN,
        source: "twilio_keyword",
        twilioOptOutState: "START",
      },
      update: data,
    });
  }
}

export function handleTwilioOptOutKeywords(params: {
  threadId: string;
  body: string;
  optOutType?: string | null;
}): Promise<void> | null {
  if (params.optOutType) {
    return recordSmsOptOutFromInbound({
      threadId: params.threadId,
      source: "twilio_opt_out_param",
      twilioState: params.optOutType,
    });
  }
  const g = inferOptFromBody(params.body);
  if (g === "stop") return recordSmsOptOutFromInbound({ threadId: params.threadId, source: "twilio_keyword" });
  if (g === "start") return recordSmsOptInFromInbound({ threadId: params.threadId });
  return null;
}

export async function applySendgridEventToContactPreference(ev: {
  event?: string;
  email?: string;
}): Promise<void> {
  const email = ev.email?.trim().toLowerCase();
  if (!email) return;
  const u = await prisma.user.findFirst({
    where: { email: { equals: email, mode: "insensitive" } },
  });
  const eventName = (ev.event ?? "").toLowerCase();
  const isSuppression =
    eventName === "unsubscribe" ||
    eventName === "group_unsubscribe" ||
    eventName === "spamreport" ||
    eventName === "dropped" ||
    eventName === "bounce";
  if (!isSuppression) return;

  const now = new Date().toISOString();
  const payload = { type: eventName, at: now, email };

  if (!u) {
    const thread = await prisma.communicationThread.findFirst({
      where: { primaryEmail: { equals: email, mode: "insensitive" } },
    });
    if (!thread) return;
    const row = await prisma.contactPreference.findUnique({ where: { communicationThreadId: thread.id } });
    await prisma.contactPreference.upsert({
      where: { communicationThreadId: thread.id },
      create: {
        communicationThreadId: thread.id,
        emailOptInStatus: isSuppression ? EmailOptInStatus.OPT_OUT : EmailOptInStatus.UNKNOWN,
        smsOptInStatus: SmsOptInStatus.UNKNOWN,
        sendgridSuppressionState: mergeSuppression(null, payload),
        globalUnsubscribeAt: isSuppression ? new Date() : null,
        source: "sendgrid_event_webhook",
      },
      update: {
        emailOptInStatus: isSuppression ? EmailOptInStatus.OPT_OUT : undefined,
        globalUnsubscribeAt: isSuppression ? new Date() : undefined,
        sendgridSuppressionState: mergeSuppression(row?.sendgridSuppressionState ?? null, payload),
        source: "sendgrid_event_webhook",
      },
    });
    return;
  }

  const existing = await prisma.contactPreference.findUnique({ where: { userId: u.id } });
  await prisma.contactPreference.upsert({
    where: { userId: u.id },
    create: {
      userId: u.id,
      emailOptInStatus: isSuppression ? EmailOptInStatus.OPT_OUT : EmailOptInStatus.UNKNOWN,
      smsOptInStatus: SmsOptInStatus.UNKNOWN,
      sendgridSuppressionState: mergeSuppression(null, payload),
      globalUnsubscribeAt: isSuppression ? new Date() : null,
      source: "sendgrid_event_webhook",
    },
    update: {
      emailOptInStatus: isSuppression ? EmailOptInStatus.OPT_OUT : undefined,
      globalUnsubscribeAt: isSuppression ? new Date() : undefined,
      sendgridSuppressionState: mergeSuppression(existing?.sendgridSuppressionState ?? null, payload),
      source: "sendgrid_event_webhook",
    },
  });
}

/**
 * After a thread is created, resolve + link user/volunteer/county.
 */
export async function resolveAndLinkNewThread(
  threadId: string,
  input: { email: string | null; phone: string | null }
): Promise<ResolvedContact> {
  const r = await resolveContactFromEmailAndPhone({ email: input.email, phone: input.phone });
  await linkThreadToResolvedContact(threadId, r);
  return r;
}
