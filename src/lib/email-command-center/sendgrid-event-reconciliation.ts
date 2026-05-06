/**
 * EMAIL-SENDGRID-EVENT-RECIPIENT-RECONCILIATION-1.0 — match SendGrid webhook events to EmailSendRecipient / EmailSendExecution.
 * Read-only toward SendGrid API (no sends). Suppression upserts mirror webhook route behavior.
 */

import type { EmailSendRecipient, EmailSendRecipientStatus, Prisma, SendGridEvent } from "@prisma/client";
import { prisma } from "@/lib/db";
import {
  mapSendGridEventToSuppressionType,
  shouldCreateSuppressionForEvent,
} from "@/lib/sendgrid/event-parser";

const RECON_KEY = "eccReconciliation" as const;

export type EccSendGridReconciliationMeta = {
  v: 1;
  state: "matched" | "unmatched" | "skipped";
  recipientId?: string;
  sendExecutionId?: string;
  reconciledAt: string;
  note?: string;
};

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function getMetaRecord(metadataJson: unknown): Record<string, unknown> {
  if (!isPlainObject(metadataJson)) return {};
  return { ...metadataJson };
}

export function getReconciliationMeta(metadataJson: unknown): EccSendGridReconciliationMeta | null {
  if (!isPlainObject(metadataJson)) return null;
  const r = metadataJson[RECON_KEY];
  if (!isPlainObject(r)) return null;
  const state = r.state;
  if (state !== "matched" && state !== "unmatched" && state !== "skipped") return null;
  const reconciledAt = typeof r.reconciledAt === "string" ? r.reconciledAt : null;
  if (!reconciledAt) return null;
  return {
    v: 1,
    state,
    recipientId: typeof r.recipientId === "string" ? r.recipientId : undefined,
    sendExecutionId: typeof r.sendExecutionId === "string" ? r.sendExecutionId : undefined,
    reconciledAt,
    note: typeof r.note === "string" ? r.note.slice(0, 500) : undefined,
  };
}

function mergeReconciliation(
  metadataJson: unknown,
  patch: EccSendGridReconciliationMeta,
): Prisma.InputJsonValue {
  const base = getMetaRecord(metadataJson);
  return { ...base, [RECON_KEY]: patch } as Prisma.InputJsonValue;
}

/** Strip SendGrid filter suffixes for fuzzy message-id match. */
export function normalizeSendGridMessageIdForMatch(raw: string | null | undefined): string | null {
  if (!raw?.trim()) return null;
  const s = raw.trim();
  if (s.length <= 12) return s;
  const lower = s.toLowerCase();
  const idx = lower.indexOf(".recvd-");
  if (idx !== -1) return s.slice(0, idx);
  return s;
}

function pickCustomArgs(rawEventJson: unknown): Record<string, string> {
  if (!isPlainObject(rawEventJson)) return {};
  const ca = rawEventJson.custom_args ?? rawEventJson.customArgs;
  if (!isPlainObject(ca)) return {};
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(ca)) {
    if (typeof v === "string" && v.trim()) out[k] = v.trim();
  }
  return out;
}

export async function listUnreconciledSendGridEvents(limit = 80): Promise<SendGridEvent[]> {
  try {
    const rows = await prisma.sendGridEvent.findMany({
      orderBy: { occurredAt: "desc" },
      take: Math.min(Math.max(limit * 4, 120), 600),
    });
    return rows.filter((e) => !getReconciliationMeta(e.metadataJson));
  } catch {
    return [];
  }
}

/**
 * Map webhook event to a recipient row when possible (does not mutate DB).
 */
export async function mapSendGridEventToRecipient(
  event: SendGridEvent,
): Promise<{ recipient: EmailSendRecipient; sendExecutionId: string; reason: string } | null> {
  const email = event.email?.trim().toLowerCase() ?? "";
  const msgId = normalizeSendGridMessageIdForMatch(event.sendgridMessageId);
  const custom = pickCustomArgs(event.rawEventJson);

  if (custom.emailSendRecipientId) {
    const r = await prisma.emailSendRecipient.findUnique({
      where: { id: custom.emailSendRecipientId },
      include: { sendExecution: { select: { id: true, status: true, sentAt: true } } },
    });
    if (r && ["SENT", "SENDING"].includes(r.sendExecution.status)) {
      return { recipient: r, sendExecutionId: r.sendExecutionId, reason: "custom_args.recipientId" };
    }
  }

  if (custom.sendExecutionId && email.includes("@")) {
    const r = await prisma.emailSendRecipient.findFirst({
      where: {
        sendExecutionId: custom.sendExecutionId,
        email: { equals: email, mode: "insensitive" },
      },
      include: { sendExecution: { select: { id: true, status: true, sentAt: true } } },
    });
    if (r && ["SENT", "SENDING"].includes(r.sendExecution.status)) {
      return { recipient: r, sendExecutionId: r.sendExecutionId, reason: "custom_args.executionId+email" };
    }
  }

  if (msgId) {
    const byId = await prisma.emailSendRecipient.findFirst({
      where: {
        OR: [{ providerMessageId: msgId }, { providerMessageId: event.sendgridMessageId?.trim() ?? "" }],
      },
      include: { sendExecution: { select: { id: true, status: true, sentAt: true } } },
    });
    if (byId && ["SENT", "SENDING"].includes(byId.sendExecution.status)) {
      return { recipient: byId, sendExecutionId: byId.sendExecutionId, reason: "providerMessageId" };
    }
  }

  if (!email.includes("@")) return null;

  const windowStart = new Date(event.occurredAt.getTime() - 14 * 24 * 60 * 60 * 1000);
  const windowEnd = new Date(event.occurredAt.getTime() + 24 * 60 * 60 * 1000);

  const recentExecs = await prisma.emailSendExecution.findMany({
    where: {
      status: { in: ["SENT", "SENDING"] },
      sentAt: { not: null, gte: windowStart, lte: windowEnd },
    },
    orderBy: { sentAt: "desc" },
    select: { id: true },
    take: 24,
  });
  const execIds = recentExecs.map((x) => x.id);
  if (!execIds.length) return null;

  const candidates = await prisma.emailSendRecipient.findMany({
    where: {
      email: { equals: email, mode: "insensitive" },
      status: { in: ["SUBMITTED", "DELIVERED", "READY"] },
      sendExecutionId: { in: execIds },
    },
    include: { sendExecution: { select: { id: true, status: true, sentAt: true } } },
    take: 12,
  });
  const rank = new Map(execIds.map((id, i) => [id, i]));
  candidates.sort((a, b) => (rank.get(a.sendExecutionId) ?? 99) - (rank.get(b.sendExecutionId) ?? 99));
  const best = candidates[0];
  if (best) {
    return { recipient: best, sendExecutionId: best.sendExecutionId, reason: "email+sentWindow" };
  }
  return null;
}

function mapEventTypeToRecipientStatus(eventType: string): EmailSendRecipientStatus | null {
  const e = eventType.toLowerCase();
  if (e === "delivered" || e === "delivery") return "DELIVERED";
  if (e === "bounce" || e === "bounced") return "BOUNCED";
  if (e === "dropped") return "FAILED";
  if (e === "spamreport" || e === "spam_report") return "SPAM_REPORTED";
  if (e === "unsubscribe" || e === "group_unsubscribe") return "UNSUBSCRIBED";
  return null;
}

function isEngagementOnly(eventType: string): boolean {
  const e = eventType.toLowerCase();
  return e === "open" || e === "click";
}

export async function updateRecipientStatusFromEvent(
  recipient: EmailSendRecipient,
  event: SendGridEvent,
): Promise<EmailSendRecipientStatus | "engagement" | "noop"> {
  const e = event.eventType.toLowerCase();
  const next = mapEventTypeToRecipientStatus(event.eventType);

  if (next) {
    const order: Record<EmailSendRecipientStatus, number> = {
      CANDIDATE: 0,
      EXCLUDED_SUPPRESSED: 0,
      EXCLUDED_MISSING_CONSENT: 0,
      READY: 1,
      SUBMITTED: 2,
      DELIVERED: 3,
      BOUNCED: 4,
      UNSUBSCRIBED: 4,
      SPAM_REPORTED: 4,
      FAILED: 4,
    };
    const cur = recipient.status;
    const terminal = next === "BOUNCED" || next === "FAILED" || next === "SPAM_REPORTED" || next === "UNSUBSCRIBED";
    const upgrade = order[next] >= order[cur] || terminal;
    const newStatus = upgrade ? next : cur;
    await prisma.emailSendRecipient.update({
      where: { id: recipient.id },
      data: {
        status: newStatus,
        providerMessageId: recipient.providerMessageId ?? event.sendgridMessageId?.trim().slice(0, 200) ?? null,
        providerEventJson: {
          lastEventId: event.id,
          lastEventType: event.eventType,
          lastOccurredAt: event.occurredAt.toISOString(),
        } as Prisma.InputJsonValue,
      },
    });
    return upgrade ? next : "noop";
  }

  if (e === "open" || e === "click") {
    const meta = getMetaRecord(recipient.metadataJson);
    const eng = isPlainObject(meta.eccEngagement) ? (meta.eccEngagement as Record<string, unknown>) : {};
    const opens = typeof eng.opens === "number" ? eng.opens : 0;
    const clicks = typeof eng.clicks === "number" ? eng.clicks : 0;
    const merged = {
      ...meta,
      eccEngagement: {
        opens: e === "open" ? opens + 1 : opens,
        clicks: e === "click" ? clicks + 1 : clicks,
        lastOpenAt: e === "open" ? event.occurredAt.toISOString() : eng.lastOpenAt,
        lastClickAt: e === "click" ? event.occurredAt.toISOString() : eng.lastClickAt,
      },
    };
    await prisma.emailSendRecipient.update({
      where: { id: recipient.id },
      data: {
        metadataJson: merged as Prisma.InputJsonValue,
        providerMessageId: recipient.providerMessageId ?? event.sendgridMessageId?.trim().slice(0, 200) ?? null,
        providerEventJson: {
          lastEventId: event.id,
          lastEventType: event.eventType,
          lastOccurredAt: event.occurredAt.toISOString(),
        } as Prisma.InputJsonValue,
      },
    });
    return "engagement";
  }

  return "noop";
}

async function ensureSuppressionFromEvent(event: SendGridEvent, reason: string | null): Promise<void> {
  const email = event.email?.trim().toLowerCase();
  if (!email?.includes("@")) return;
  if (!shouldCreateSuppressionForEvent(event.eventType, reason)) return;
  const st = mapSendGridEventToSuppressionType(event.eventType, reason);
  if (!st) return;
  try {
    await prisma.sendGridSuppression.create({
      data: {
        email,
        suppressionType: st,
        sendgridEventId: event.sendgridEventId,
        source: "ecc_reconciliation",
        occurredAt: event.occurredAt,
        metadataJson: {
          eventType: event.eventType,
          sendGridEventRowId: event.id,
          reason: reason ?? null,
        } as Prisma.InputJsonValue,
      },
    });
  } catch {
    /* duplicate or constraint — ignore */
  }
}

export async function updateSendExecutionRollups(sendExecutionId: string): Promise<void> {
  const rows = await prisma.emailSendRecipient.groupBy({
    by: ["status"],
    where: { sendExecutionId },
    _count: { _all: true },
  });
  const rollup: Record<string, number> = {};
  for (const r of rows) {
    rollup[r.status] = r._count._all;
  }
  const ex = await prisma.emailSendExecution.findUnique({
    where: { id: sendExecutionId },
    select: { metadataJson: true },
  });
  const prev = ex?.metadataJson && isPlainObject(ex.metadataJson) ? (ex.metadataJson as Record<string, unknown>) : {};
  await prisma.emailSendExecution.update({
    where: { id: sendExecutionId },
    data: {
      metadataJson: {
        ...prev,
        eccRecipientRollup: {
          at: new Date().toISOString(),
          byStatus: rollup,
        },
      } as Prisma.InputJsonValue,
    },
  });
}

export async function reconcileSendGridEvent(
  eventId: string,
): Promise<{ ok: true; outcome: "matched" | "skipped" | "unmatched" } | { ok: false; reason: string }> {
  const event = await prisma.sendGridEvent.findUnique({ where: { id: eventId } });
  if (!event) return { ok: false, reason: "Event not found." };
  if (getReconciliationMeta(event.metadataJson)) {
    return { ok: true, outcome: "skipped" };
  }

  const reason =
    typeof (event.rawEventJson as { reason?: unknown })?.reason === "string"
      ? String((event.rawEventJson as { reason: string }).reason)
      : null;

  const mapped = await mapSendGridEventToRecipient(event);

  if (isEngagementOnly(event.eventType) && !mapped) {
    await prisma.sendGridEvent.update({
      where: { id: eventId },
      data: {
        metadataJson: mergeReconciliation(event.metadataJson, {
          v: 1,
          state: "skipped",
          reconciledAt: new Date().toISOString(),
          note: "Engagement event with no linked recipient",
        }),
      },
    });
    return { ok: true, outcome: "skipped" };
  }

  if (!mapped) {
    await prisma.sendGridEvent.update({
      where: { id: eventId },
      data: {
        metadataJson: mergeReconciliation(event.metadataJson, {
          v: 1,
          state: "unmatched",
          reconciledAt: new Date().toISOString(),
          note: "No EmailSendRecipient match (message id, custom_args, or email+sent window).",
        }),
      },
    });
    return { ok: true, outcome: "unmatched" };
  }

  const { recipient, sendExecutionId } = mapped;
  await updateRecipientStatusFromEvent(recipient, event);
  await ensureSuppressionFromEvent(event, reason);
  await updateSendExecutionRollups(sendExecutionId);

  await prisma.sendGridEvent.update({
    where: { id: eventId },
    data: {
      metadataJson: mergeReconciliation(event.metadataJson, {
        v: 1,
        state: "matched",
        recipientId: recipient.id,
        sendExecutionId,
        reconciledAt: new Date().toISOString(),
        note: mapped.reason.slice(0, 280),
      }),
    },
  });

  return { ok: true, outcome: "matched" };
}

export async function reconcileRecentSendGridEvents(limit = 40): Promise<{
  processed: number;
  matched: number;
  skipped: number;
  unmatched: number;
  failed: number;
}> {
  const batch = await listUnreconciledSendGridEvents(limit);
  const slice = batch.slice(0, Math.min(Math.max(limit, 1), 120));
  let matched = 0;
  let skipped = 0;
  let unmatched = 0;
  let failed = 0;
  for (const ev of slice) {
    try {
      const r = await reconcileSendGridEvent(ev.id);
      if (!r.ok) {
        failed += 1;
        continue;
      }
      if (r.outcome === "matched") matched += 1;
      else if (r.outcome === "skipped") skipped += 1;
      else unmatched += 1;
    } catch {
      failed += 1;
    }
  }
  return { processed: slice.length, matched, skipped, unmatched, failed };
}

export type SendGridReconciliationSummary = {
  dbReachable: boolean;
  totalEvents: number;
  matchedCount: number;
  skippedCount: number;
  unmatchedCount: number;
  pendingReconciliationCount: number;
  lastReconciledAtIso: string | null;
  /** Recipient status counts across all send executions (bounded DB). */
  recipientByStatus: Partial<Record<EmailSendRecipientStatus, number>>;
  /** Recent events (newest first) for operator review. */
  recentEvents: Array<{
    id: string;
    eventType: string;
    email: string | null;
    occurredAtIso: string;
    reconciliation: EccSendGridReconciliationMeta | null;
  }>;
  bounceEventsApprox: number;
  unsubscribeEventsApprox: number;
  spamEventsApprox: number;
};

export async function getSendGridReconciliationSummary(): Promise<SendGridReconciliationSummary> {
  const empty: SendGridReconciliationSummary = {
    dbReachable: false,
    totalEvents: 0,
    matchedCount: 0,
    skippedCount: 0,
    unmatchedCount: 0,
    pendingReconciliationCount: 0,
    lastReconciledAtIso: null,
    recipientByStatus: {},
    recentEvents: [],
    bounceEventsApprox: 0,
    unsubscribeEventsApprox: 0,
    spamEventsApprox: 0,
  };
  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch {
    return empty;
  }

  try {
    let matchedCount = 0;
    let skippedCount = 0;
    let unmatchedCount = 0;
    try {
      [matchedCount, skippedCount, unmatchedCount] = await Promise.all([
        prisma.sendGridEvent.count({
          where: { metadataJson: { path: [RECON_KEY, "state"], equals: "matched" } },
        }),
        prisma.sendGridEvent.count({
          where: { metadataJson: { path: [RECON_KEY, "state"], equals: "skipped" } },
        }),
        prisma.sendGridEvent.count({
          where: { metadataJson: { path: [RECON_KEY, "state"], equals: "unmatched" } },
        }),
      ]);
    } catch {
      matchedCount = 0;
      skippedCount = 0;
      unmatchedCount = 0;
    }

    const [
      totalEvents,
      recipientGroups,
      recent,
      bounceEventsApprox,
      unsubscribeEventsApprox,
      spamEventsApprox,
    ] = await Promise.all([
      prisma.sendGridEvent.count(),
      prisma.emailSendRecipient.groupBy({
        by: ["status"],
        _count: { _all: true },
      }),
      prisma.sendGridEvent.findMany({
        orderBy: { occurredAt: "desc" },
        take: 25,
        select: {
          id: true,
          eventType: true,
          email: true,
          occurredAt: true,
          metadataJson: true,
        },
      }),
      prisma.sendGridEvent.count({
        where: { eventType: { in: ["bounce", "bounced", "dropped"] } },
      }),
      prisma.sendGridEvent.count({
        where: { eventType: { in: ["unsubscribe", "group_unsubscribe"] } },
      }),
      prisma.sendGridEvent.count({
        where: { eventType: { in: ["spamreport", "spam_report"] } },
      }),
    ]);

    const pendingReconciliationCount = Math.max(0, totalEvents - matchedCount - skippedCount - unmatchedCount);
    const recipientByStatus: Partial<Record<EmailSendRecipientStatus, number>> = {};
    for (const g of recipientGroups) {
      recipientByStatus[g.status] = g._count._all;
    }

    let lastReconciledAtIso: string | null = null;
    for (const ev of recent) {
      const m = getReconciliationMeta(ev.metadataJson);
      if (m?.reconciledAt && (!lastReconciledAtIso || m.reconciledAt > lastReconciledAtIso)) {
        lastReconciledAtIso = m.reconciledAt;
      }
    }

    return {
      dbReachable: true,
      totalEvents,
      matchedCount,
      skippedCount,
      unmatchedCount,
      pendingReconciliationCount,
      lastReconciledAtIso,
      recipientByStatus,
      recentEvents: recent.map((e) => ({
        id: e.id,
        eventType: e.eventType,
        email: e.email,
        occurredAtIso: e.occurredAt.toISOString(),
        reconciliation: getReconciliationMeta(e.metadataJson),
      })),
      bounceEventsApprox,
      unsubscribeEventsApprox,
      spamEventsApprox,
    };
  } catch {
    return { ...empty, dbReachable: true };
  }
}
