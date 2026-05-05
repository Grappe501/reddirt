/**
 * Gmail metadata-only review read model (EMAIL-GMAIL-REVIEW-TO-QUEUE-1.4).
 * No bodies, no attachments, no OpenAI.
 */

import type { gmail_v1 } from "googleapis";
import type {
  EmailWorkflowPriority,
  EmailWorkflowSourceType,
  EmailWorkflowTriggerType,
} from "@prisma/client";
import { getGmailApiForStaffUser, getConnectedStaffGmailRow } from "@/lib/gmail/client";
import {
  extractPrimaryEmailFromHeader,
  getGmailMessageMetadata,
  listRecentGmailMessageRefs,
} from "@/lib/gmail/metadata";

/** Headers fetched for operator review (subset of API metadata; no Bcc surfaced in UI). */
export const GMAIL_REVIEW_METADATA_HEADERS = [
  "From",
  "To",
  "Cc",
  "Subject",
  "Date",
  "Message-ID",
  "In-Reply-To",
  "References",
  "Reply-To",
  "List-Unsubscribe",
  "Precedence",
] as const;

export type GmailReviewWarningFlag =
  | "no_subject"
  | "likely_automated_or_list"
  | "reply_or_threaded"
  | "possible_unsubscribe_or_list_sender";

export type GmailReviewItemDto = {
  gmailMessageId: string;
  gmailThreadId: string;
  /** Gmail internal epoch ms when present — not shown as body; helps queue sorting. */
  occurredAtFromInternalDate: Date | null;
  fromLabel: string;
  fromEmail: string | null;
  toSummary: string;
  subject: string;
  date: string;
  labels: string[];
  headerMessageId: string | null;
  safeQueueTitle: string;
  safeQueueReason: string;
  suggestedSourceType: EmailWorkflowSourceType;
  suggestedTriggerType: EmailWorkflowTriggerType;
  suggestedPriority: EmailWorkflowPriority;
  warningFlags: GmailReviewWarningFlag[];
};

export type GmailReviewQueueDraft = {
  priority: EmailWorkflowPriority;
  sourceType: EmailWorkflowSourceType;
  triggerType: EmailWorkflowTriggerType;
  title: string;
  queueReason: string;
  whoSummary: string;
  whatSummary: string;
  whenSummary: string;
  whereSummary: string;
  whySummary: string;
  impactSummary: string;
  recommendedResponseSummary: string;
  recommendedResponseRationale: string;
  occurredAt: Date | null;
};

export function normalizeGmailHeaderValue(
  headers: gmail_v1.Schema$MessagePartHeader[] | undefined,
  name: string
): string {
  const want = name.toLowerCase();
  for (const h of headers ?? []) {
    if ((h.name ?? "").toLowerCase() === want) {
      return String(h.value ?? "").trim();
    }
  }
  return "";
}

function truncateSafe(s: string, max: number): string {
  const t = s.trim();
  if (t.length <= max) return t;
  return `${t.slice(0, Math.max(0, max - 1))}…`;
}

function formatMessageDate(headers: gmail_v1.Schema$MessagePartHeader[] | undefined, internalMs: string | null | undefined): string {
  const dateHdr = normalizeGmailHeaderValue(headers, "Date");
  if (dateHdr) return dateHdr;
  if (internalMs) {
    const n = Number(internalMs);
    if (!Number.isNaN(n)) return new Date(n).toISOString();
  }
  return "—";
}

function derivePriority(subject: string, flags: GmailReviewWarningFlag[]): EmailWorkflowPriority {
  const u = subject.toUpperCase();
  if (/\bURGENT\b|\bASAP\b|\bIMMEDIATE\b|\bTIME-?SENSITIVE\b/.test(u)) return "HIGH";
  if (flags.includes("likely_automated_or_list")) return "LOW";
  return "NORMAL";
}

function collectWarningFlags(args: {
  subject: string;
  inReplyTo: string;
  references: string;
  listUnsub: string;
  precedence: string;
}): GmailReviewWarningFlag[] {
  const flags: GmailReviewWarningFlag[] = [];
  if (!args.subject.trim()) flags.push("no_subject");

  const prec = args.precedence.toLowerCase();
  if (prec.includes("bulk") || prec.includes("list") || prec.includes("junk")) {
    flags.push("likely_automated_or_list");
  }
  if (args.listUnsub.trim()) {
    flags.push("possible_unsubscribe_or_list_sender");
  }
  if (args.inReplyTo.trim() || args.references.trim()) {
    flags.push("reply_or_threaded");
  }
  return flags;
}

export function buildGmailReviewItemFromMetadata(
  messageRef: gmail_v1.Schema$Message,
  metadata: gmail_v1.Schema$Message
): GmailReviewItemDto {
  const headers = metadata.payload?.headers;
  const fromRaw = normalizeGmailHeaderValue(headers, "From");
  const toRaw = normalizeGmailHeaderValue(headers, "To");
  const ccRaw = normalizeGmailHeaderValue(headers, "Cc");
  const subject = normalizeGmailHeaderValue(headers, "Subject");
  const inReplyTo = normalizeGmailHeaderValue(headers, "In-Reply-To");
  const references = normalizeGmailHeaderValue(headers, "References");
  const listUnsub = normalizeGmailHeaderValue(headers, "List-Unsubscribe");
  const precedence = normalizeGmailHeaderValue(headers, "Precedence");

  const messageId =
    metadata.id ?? messageRef.id ?? "";
  const threadId = metadata.threadId ?? "";
  if (!messageId || !threadId) {
    throw new Error("missing_gmail_identifiers");
  }

  const occurredAtFromInternalDate = parseOccurredAtFromGmailMetadata(metadata);

  const toParts = [toRaw && `To: ${toRaw}`, ccRaw && `Cc: ${ccRaw}`].filter(Boolean).join(" · ");
  const toSummary = truncateSafe(toParts || "(no visible To/Cc in metadata)", 240);

  const warningFlags = collectWarningFlags({ subject, inReplyTo, references, listUnsub, precedence });
  const suggestedPriority = derivePriority(subject, warningFlags);

  const safeTitleBase = subject.trim() ? truncateSafe(subject, 240) : "(No subject)";
  const safeQueueTitle = truncateSafe(`${safeTitleBase} · Gmail review`, 500);
  const safeQueueReason =
    "Candidate queue item from Gmail metadata review — operator must confirm in Gmail before any outbound action.";

  return {
    gmailMessageId: messageId,
    gmailThreadId: threadId,
    occurredAtFromInternalDate,
    fromLabel: truncateSafe(fromRaw || "—", 320),
    fromEmail: extractPrimaryEmailFromHeader(fromRaw || undefined),
    toSummary,
    subject: subject.trim() ? truncateSafe(subject, 500) : "",
    date: formatMessageDate(headers, metadata.internalDate ?? null),
    labels: [...(metadata.labelIds ?? [])],
    headerMessageId: (() => {
      const mid = normalizeGmailHeaderValue(headers, "Message-ID");
      return mid ? truncateSafe(mid, 500) : null;
    })(),
    safeQueueTitle,
    safeQueueReason,
    suggestedSourceType: "INBOUND_EMAIL",
    suggestedTriggerType: "INBOUND_MESSAGE",
    suggestedPriority,
    warningFlags,
  };
}

export function buildQueueDraftFromGmailReviewItem(item: GmailReviewItemDto): GmailReviewQueueDraft {
  const title = item.subject.trim() ? truncateSafe(item.subject, 500) : "(No subject)";
  return {
    priority: item.suggestedPriority,
    sourceType: item.suggestedSourceType,
    triggerType: item.suggestedTriggerType,
    title,
    queueReason: "Manual Gmail metadata review",
    whoSummary: item.fromLabel,
    whatSummary: item.subject.trim() ? truncateSafe(item.subject, 4000) : "No subject in metadata.",
    whenSummary: item.date,
    whereSummary: truncateSafe(
      `Gmail INBOX · labels: ${item.labels.length ? item.labels.join(", ") : "—"} · thread ${item.gmailThreadId.slice(0, 12)}…`,
      4000
    ),
    whySummary: "Operator selected this Gmail metadata item for campaign review.",
    impactSummary: "Needs campaign staff review before any response.",
    recommendedResponseSummary:
      "Review source email in Gmail or approved email workflow before responding.",
    recommendedResponseRationale:
      "Created from metadata-only Gmail review; no body was read by RedDirt.",
    occurredAt: item.occurredAtFromInternalDate,
  };
}

export type GmailReviewInboxForAdminOptions = {
  actorUserId: string;
  maxResults?: number;
};

export async function getGmailReviewInboxForAdmin(
  options: GmailReviewInboxForAdminOptions
): Promise<
  | { ok: true; items: GmailReviewItemDto[]; staffGmailAccountId: string; sendAsEmailDomainHint: string | null }
  | { ok: false; code: string; messageSafe: string }
> {
  const row = await getConnectedStaffGmailRow(options.actorUserId);
  if (!row) {
    return { ok: false, code: "not_connected", messageSafe: "no_active_staff_gmail_row" };
  }

  const gmail = await getGmailApiForStaffUser(options.actorUserId);
  if (!gmail) {
    return { ok: false, code: "no_client", messageSafe: "gmail_oauth_or_tokens_unavailable" };
  }

  const max = Math.min(Math.max(options.maxResults ?? 25, 1), 50);
  const refs = await listRecentGmailMessageRefs(gmail, {
    labelIds: ["INBOX"],
    maxResults: max,
  });

  const items: GmailReviewItemDto[] = [];
  for (const ref of refs) {
    if (!ref.id) continue;
    try {
      const meta = await getGmailMessageMetadata(gmail, ref.id, GMAIL_REVIEW_METADATA_HEADERS);
      items.push(buildGmailReviewItemFromMetadata(ref, meta));
    } catch {
      /* skip individual failures */
    }
  }

  const at = row.sendAsEmail.indexOf("@");
  const sendAsEmailDomainHint =
    at !== -1 && at < row.sendAsEmail.length - 1
      ? row.sendAsEmail.slice(at + 1).trim().toLowerCase() || null
      : null;

  return {
    ok: true,
    items,
    staffGmailAccountId: row.id,
    sendAsEmailDomainHint,
  };
}


export function parseOccurredAtFromGmailMetadata(metadata: gmail_v1.Schema$Message): Date | null {
  if (metadata.internalDate) {
    const ms = Number(metadata.internalDate);
    if (!Number.isNaN(ms)) return new Date(ms);
  }
  const dateStr = normalizeGmailHeaderValue(metadata.payload?.headers, "Date");
  if (!dateStr) return null;
  const d = new Date(dateStr);
  return Number.isNaN(d.getTime()) ? null : d;
}
