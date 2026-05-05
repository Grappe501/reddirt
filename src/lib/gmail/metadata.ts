/**
 * Gmail metadata-only reads (gmail.metadata scope). No bodies, no attachments.
 */

import type { gmail_v1 } from "googleapis";

export const GMAIL_METADATA_HEADER_NAMES = [
  "From",
  "To",
  "Cc",
  "Bcc",
  "Subject",
  "Date",
  "Message-ID",
  "In-Reply-To",
  "References",
  "Reply-To",
  "List-Unsubscribe",
  "Precedence",
] as const;

export async function listGmailLabels(gmail: gmail_v1.Gmail) {
  const res = await gmail.users.labels.list({ userId: "me" });
  return res.data.labels ?? [];
}

export async function listRecentGmailMessageRefs(
  gmail: gmail_v1.Gmail,
  opts: { labelIds?: string[]; maxResults: number }
) {
  const res = await gmail.users.messages.list({
    userId: "me",
    maxResults: opts.maxResults,
    labelIds: opts.labelIds ?? ["INBOX"],
  });
  return res.data.messages ?? [];
}

export async function getGmailMessageMetadata(
  gmail: gmail_v1.Gmail,
  messageId: string,
  metadataHeaders: readonly string[] = GMAIL_METADATA_HEADER_NAMES
) {
  const res = await gmail.users.messages.get({
    userId: "me",
    id: messageId,
    format: "metadata",
    metadataHeaders: [...metadataHeaders],
  });
  return res.data;
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

/** Best-effort parse of first email in a From header. Not exposed to UI — for aggregate counts only. */
export function extractPrimaryEmailFromHeader(fromRaw: string | undefined): string | null {
  if (!fromRaw) return null;
  const m = fromRaw.match(/<?([^\s<>]+@[^\s<>]+)>?/);
  return m ? m[1].toLowerCase() : null;
}

export function collectMetadataStats(
  listEntries: gmail_v1.Schema$Message[],
  metadataMessages: gmail_v1.Schema$Message[]
): {
  uniqueSenderCount: number;
  unreadInSampleCount: number;
  newestInternalDateMs: number | null;
} {
  const senders = new Set<string>();
  let unreadInSampleCount = 0;
  for (const m of listEntries) {
    if ((m.labelIds ?? []).includes("UNREAD")) unreadInSampleCount += 1;
  }
  let newest: number | null = null;
  for (const full of metadataMessages) {
    const ms = full.internalDate ? Number(full.internalDate) : NaN;
    if (!Number.isNaN(ms)) {
      newest = newest === null ? ms : Math.max(newest, ms);
    }
    const from = headerMap(full).from;
    const addr = extractPrimaryEmailFromHeader(from);
    if (addr) senders.add(addr);
  }
  return {
    uniqueSenderCount: senders.size,
    unreadInSampleCount,
    newestInternalDateMs: newest,
  };
}
