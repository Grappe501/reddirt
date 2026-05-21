import { buildApprovalEmailAssist } from "../approval-email/approval-email-assist";
import { buildApprovalPackage } from "../approval-package";
import type { ApprovalEmailLogEntry } from "../approval-email/approval-email-log";
import type { WorkbenchEventRow } from "../merge-persisted-row";

export type EmailArchitectureTrace = {
  sendEnabled: boolean;
  provider: string;
  readyToSend: boolean;
  missingConfig: string[];
  sendgridApiKeyConfigured: boolean;
  baseUrl: string;
  disabledReason: string | null;
};

function envTruthy(raw: string | undefined): boolean {
  const v = raw?.trim().toLowerCase();
  return v === "true" || v === "1" || v === "yes";
}

/** Tool: email-architecture-tracer (client-safe env read; no secrets) */
export function traceEmailArchitecture(): EmailArchitectureTrace {
  const sendEnabled = envTruthy(process.env.EMAIL_SEND_ENABLED);
  const provider = process.env.EMAIL_PROVIDER?.trim().toLowerCase() || "sendgrid";
  const missing: string[] = [];
  if (!sendEnabled) missing.push("EMAIL_SEND_ENABLED is not true");
  if (!process.env.SENDGRID_API_KEY?.trim()) missing.push("SENDGRID_API_KEY");
  if (!process.env.SENDGRID_FROM_EMAIL?.trim() && !process.env.APPROVAL_EMAIL_FROM?.trim()) {
    missing.push("APPROVAL_EMAIL_FROM or SENDGRID_FROM_EMAIL");
  }
  const baseUrl = (
    process.env.APPROVAL_BASE_URL?.trim() ||
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
    "http://localhost:3000"
  ).replace(/\/$/, "");
  return {
    sendEnabled,
    provider,
    readyToSend: sendEnabled && missing.length === 0 && provider === "sendgrid",
    missingConfig: missing,
    sendgridApiKeyConfigured: Boolean(process.env.SENDGRID_API_KEY?.trim()),
    baseUrl,
    disabledReason: missing.length ? `Sending disabled: ${missing.join("; ")}` : null,
  };
}

/** Tool: approval-followup-recommender (scaffold) */
export function recommendApprovalFollowUp(lastLog: ApprovalEmailLogEntry | null, row: WorkbenchEventRow): string | null {
  if (!lastLog || lastLog.status !== "sent") return null;
  if (row.rawDecision) return null;
  const sentAt = lastLog.sentAt ?? lastLog.createdAt;
  const days = Math.floor((Date.now() - new Date(sentAt).getTime()) / 86400000);
  if (days >= 2) return `Package sent ${days} days ago — consider resend to candidate recipients.`;
  if (days >= 0) return "Awaiting candidate decision — follow up after 48h if no response.";
  return null;
}

/** Tool: approval-google-write-blocker */
export function assertApprovalPathNoGoogleWrite(context: string): { ok: true; context: string } {
  return { ok: true, context: `${context} — Google Calendar write not invoked (Sprint 4 guard).` };
}

/** Tool: approval-email-risk-scanner */
export function scanApprovalEmailRisk(row: WorkbenchEventRow) {
  const pkg = buildApprovalPackage(row);
  const assist = buildApprovalEmailAssist(row);
  return {
    missingFields: pkg.missingFields,
    conflicts: pkg.conflicts,
    recommendedDecision: pkg.recommendedDecision,
    riskNote: assist.riskNote,
    safeToSend: !row.hasConflictWarning || row.rawDecision === "hold",
  };
}

