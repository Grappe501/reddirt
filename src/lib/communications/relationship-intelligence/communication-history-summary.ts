import type { CommunicationSendRecord } from "@/lib/campaign-events/communications/communications-types";

/**
 * Summarize the aggregate communications audit log.
 *
 * V1 send records are list/segment level and do not carry recipient identity. A
 * previous implementation accepted contactEmail but then counted every campaign
 * send for that contact, inflating engagement and burnout scores. Until the send
 * ledger is recipient-addressable, contact-level history remains unknown rather
 * than manufacturing precision.
 */
export function summarizeSendHistory(sends: CommunicationSendRecord[], contactEmail?: string): {
  sendCount: number;
  lastSendAt?: string;
  blockedCount: number;
} {
  if (contactEmail) {
    return { sendCount: 0, blockedCount: 0 };
  }

  const sent = sends.filter((s) => s.status === "sent" || s.status === "test_sent");
  const last = [...sent].sort((a, b) => (b.createdAt > a.createdAt ? 1 : -1))[0];
  return {
    sendCount: sent.length,
    lastSendAt: last?.createdAt,
    blockedCount: sends.filter((s) => s.status === "blocked").length,
  };
}

export function daysSince(iso?: string): number | undefined {
  if (!iso) return undefined;
  const ms = Date.now() - new Date(iso).getTime();
  return Math.floor(ms / (24 * 60 * 60 * 1000));
}
