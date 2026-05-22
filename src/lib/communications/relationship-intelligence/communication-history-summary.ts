import type { CommunicationSendRecord } from "@/lib/campaign-events/communications/communications-types";

export function summarizeSendHistory(sends: CommunicationSendRecord[], contactEmail?: string): {
  sendCount: number;
  lastSendAt?: string;
  blockedCount: number;
} {
  const relevant = contactEmail
    ? sends.filter((s) => s.status !== "draft")
    : sends;
  const sent = relevant.filter((s) => s.status === "sent" || s.status === "test_sent");
  const last = sent.sort((a, b) => (b.createdAt > a.createdAt ? 1 : -1))[0];
  return {
    sendCount: sent.length,
    lastSendAt: last?.createdAt,
    blockedCount: relevant.filter((s) => s.status === "blocked").length,
  };
}

export function daysSince(iso?: string): number | undefined {
  if (!iso) return undefined;
  const ms = Date.now() - new Date(iso).getTime();
  return Math.floor(ms / (24 * 60 * 60 * 1000));
}
