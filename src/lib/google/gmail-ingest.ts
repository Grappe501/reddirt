import "server-only";

import { createHash } from "crypto";
import type { gmail_v1 } from "googleapis";
import { GMAIL_METADATA_HEADER_NAMES } from "@/lib/gmail/metadata";
import { parseEmailAddressList, normalizeEmail, extractDomain } from "@/lib/communications/email-address";

export type GmailIngestQueryParams = {
  dateStart: Date;
  dateEnd: Date;
  includeSent: boolean;
  includeInbox: boolean;
  includeArchived: boolean;
  includeSpam: boolean;
  includeTrash: boolean;
};

function gmailDate(d: Date): string {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}/${m}/${day}`;
}

/** Conservative Gmail search query (metadata list). */
export function buildGmailIngestQuery(p: GmailIngestQueryParams): string {
  const parts: string[] = [`after:${gmailDate(p.dateStart)}`, `before:${gmailDate(p.dateEnd)}`];
  if (!p.includeSpam) parts.push("-in:spam");
  if (!p.includeTrash) parts.push("-in:trash");
  const loc: string[] = [];
  if (p.includeInbox) loc.push("in:inbox");
  if (p.includeSent) loc.push("in:sent");
  if (p.includeArchived) loc.push("in:anywhere");
  if (loc.length === 0) {
    parts.push("(in:inbox OR in:sent)");
  } else if (loc.length === 1) {
    parts.push(loc[0]!);
  } else {
    parts.push(`(${loc.join(" OR ")})`);
  }
  return parts.join(" ");
}

function headerMap(msg: gmail_v1.Schema$Message): Record<string, string> {
  const out: Record<string, string> = {};
  for (const h of msg.payload?.headers ?? []) {
    const n = h.name?.toLowerCase();
    if (!n || h.value == null) continue;
    out[n] = h.value;
  }
  return out;
}

function extractPlainFromParts(part: gmail_v1.Schema$MessagePart | undefined): string | null {
  if (!part) return null;
  if (part.mimeType === "text/plain" && part.body?.data) {
    try {
      return Buffer.from(part.body.data.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString("utf8");
    } catch {
      return null;
    }
  }
  for (const p of part.parts ?? []) {
    const inner = extractPlainFromParts(p);
    if (inner) return inner;
  }
  return null;
}

export type GmailIngestMessageDto = {
  googleMessageId: string;
  googleThreadId: string | null;
  historyId: string | null;
  internalDate: Date | null;
  sentAt: Date | null;
  subject: string | null;
  snippet: string | null;
  labelIds: string[];
  fromText: string | null;
  toText: string | null;
  ccText: string | null;
  bccText: string | null;
  replyToText: string | null;
  bodyText: string | null;
  bodyHash: string | null;
  hasAttachments: boolean;
  attachmentCount: number;
  sizeEstimate: number | null;
  rawHeadersJson: Record<string, string>;
};

export function mapGmailMessageToDto(
  msg: gmail_v1.Schema$Message,
  opts: { includeFullBody: boolean },
): GmailIngestMessageDto {
  const h = headerMap(msg);
  const id = msg.id ?? "";
  const threadId = msg.threadId ?? null;
  const internalMs = msg.internalDate ? Number(msg.internalDate) : NaN;
  const internalDate = Number.isFinite(internalMs) ? new Date(internalMs) : null;
  const dateHdr = h.date ? new Date(h.date) : null;
  const sentAt = dateHdr && !Number.isNaN(dateHdr.getTime()) ? dateHdr : internalDate;
  let bodyText: string | null = null;
  if (opts.includeFullBody) {
    bodyText = extractPlainFromParts(msg.payload ?? undefined);
  }
  const bodyHash = bodyText ? createHash("sha256").update(bodyText, "utf8").digest("hex") : null;
  let attachmentCount = 0;
  const walk = (p: gmail_v1.Schema$MessagePart | undefined) => {
    if (!p) return;
    if (p.filename && p.filename.length > 0) attachmentCount += 1;
    for (const c of p.parts ?? []) walk(c);
  };
  walk(msg.payload ?? undefined);

  return {
    googleMessageId: id,
    googleThreadId: threadId,
    historyId: msg.historyId ? String(msg.historyId) : null,
    internalDate,
    sentAt,
    subject: h.subject ?? null,
    snippet: msg.snippet ?? null,
    labelIds: msg.labelIds ?? [],
    fromText: h.from ?? null,
    toText: h.to ?? null,
    ccText: h.cc ?? null,
    bccText: h.bcc ?? null,
    replyToText: h["reply-to"] ?? null,
    bodyText,
    bodyHash,
    hasAttachments: attachmentCount > 0,
    attachmentCount,
    sizeEstimate: msg.sizeEstimate ?? null,
    rawHeadersJson: h,
  };
}

export type GmailParticipantDto = {
  role: "FROM" | "TO" | "CC" | "BCC" | "REPLY_TO";
  email: string;
  displayName: string | null;
  domain: string | null;
  normalizedEmail: string;
};

export function extractParticipantsFromDto(dto: GmailIngestMessageDto): GmailParticipantDto[] {
  const out: GmailParticipantDto[] = [];
  const push = (role: GmailParticipantDto["role"], raw: string | null) => {
    for (const p of parseEmailAddressList(raw ?? undefined)) {
      const domain = extractDomain(p.address);
      out.push({
        role,
        email: p.address,
        displayName: p.displayName,
        domain,
        normalizedEmail: normalizeEmail(p.address),
      });
    }
  };
  push("FROM", dto.fromText);
  push("TO", dto.toText);
  push("CC", dto.ccText);
  push("BCC", dto.bccText);
  push("REPLY_TO", dto.replyToText);
  return out;
}

export async function listGmailMessageIdsForQuery(
  gmail: gmail_v1.Gmail,
  input: { q: string; maxResults: number; pageToken?: string },
): Promise<{ ids: string[]; nextPageToken: string | undefined }> {
  const res = await gmail.users.messages.list({
    userId: "me",
    q: input.q,
    maxResults: Math.min(input.maxResults, 500),
    pageToken: input.pageToken,
  });
  const ids = (res.data.messages ?? []).map((m) => m.id ?? "").filter(Boolean);
  return { ids, nextPageToken: res.data.nextPageToken ?? undefined };
}

export async function fetchGmailMessageForIngest(
  gmail: gmail_v1.Gmail,
  messageId: string,
  format: "metadata" | "full",
): Promise<gmail_v1.Schema$Message> {
  const res = await gmail.users.messages.get({
    userId: "me",
    id: messageId,
    format,
    metadataHeaders: format === "metadata" ? [...GMAIL_METADATA_HEADER_NAMES] : undefined,
  });
  return res.data;
}
