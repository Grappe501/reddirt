import type { ApprovalEmailProvider } from "./approval-email-config";

export type ApprovalEmailSendStatus = "drafted" | "skipped_disabled" | "sent" | "failed";

export type ApprovalEmailLogEntry = {
  id: string;
  recordId: string;
  recipients: string[];
  subject: string;
  provider: ApprovalEmailProvider | "none";
  status: ApprovalEmailSendStatus;
  messageId?: string;
  error?: string;
  createdAt: string;
  sentAt?: string;
  createdBy: string;
  tokenIds?: string[];
  dryRun?: boolean;
};

export function parseApprovalEmailLog(raw: unknown): ApprovalEmailLogEntry[] {
  if (!raw || typeof raw !== "object") return [];
  const o = raw as Record<string, unknown>;
  const log = o._approvalEmailLog;
  if (!Array.isArray(log)) return [];
  return log.filter((e): e is ApprovalEmailLogEntry => e && typeof e === "object" && typeof (e as ApprovalEmailLogEntry).id === "string");
}

export function latestApprovalEmailLog(entries: ApprovalEmailLogEntry[]): ApprovalEmailLogEntry | null {
  if (!entries.length) return null;
  return [...entries].sort((a, b) => (b.sentAt ?? b.createdAt).localeCompare(a.sentAt ?? a.createdAt))[0];
}
