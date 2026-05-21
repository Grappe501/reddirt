import { getApprovalPackageRecipientEmails, getCandidateApprovalToLine } from "./approval-recipients";
import type { WorkbenchEventRow } from "./merge-persisted-row";
import { buildApprovalEmailAssist } from "./approval-email/approval-email-assist";
import { getApprovalEmailConfig } from "./approval-email/approval-email-config";
import { latestApprovalEmailLog, type ApprovalEmailLogEntry } from "./approval-email/approval-email-log";
import {
  buildApprovalTimelineFromRow,
  type ApprovalPackagePayload,
} from "./approval-package-types";

export type { ApprovalPackagePayload, ApprovalPackageAction } from "./approval-package-types";
export { buildApprovalTimelineFromRow } from "./approval-package-types";

const WORKBENCH_BASE = "/admin/campaign-events/workbench";

/**
 * Normalized approval package for future email send + secure links.
 * No transport — preview and API shape only.
 */
export function buildApprovalPackage(
  row: WorkbenchEventRow,
  options?: {
    lastEmailLog?: ApprovalEmailLogEntry | null;
    tokenLinks?: ApprovalPackagePayload["tokenLinks"];
  },
): ApprovalPackagePayload {
  const emailConfig = getApprovalEmailConfig();
  const assist = buildApprovalEmailAssist(row);
  const lastLog = options?.lastEmailLog ?? null;
  const workbenchUrl = `${WORKBENCH_BASE}?highlight=${row.recordId}`;
  const drilldownUrl = `/admin/campaign-events/${row.recordId}`;
  const packagePreviewUrl = `/admin/campaign-calendar/approval-package/${row.recordId}`;

  const missingFields: string[] = [];
  if (!row.likelyCity) missingFields.push("City");
  if (!row.county) missingFields.push("County");
  if (row.persistedMissingCount > 0) missingFields.push(`${row.persistedMissingCount} fact-card gaps`);

  const assumptions = row.sections
    .flatMap((s) => s.fields)
    .filter((f) => f.status === "suggested" || f.suggestion)
    .slice(0, 8)
    .map((f) => ({ label: f.label, value: f.value ?? f.suggestion ?? "—" }));

  let recommendedDecision = row.decisionLabel ?? "Pending review";
  if (row.hasConflictWarning) recommendedDecision = "Hold — resolve conflicts first";
  else if (row.hasWorkHoursWarning && !row.rawDecision) recommendedDecision = "Request confirmation (work hours)";
  else if (row.rawEventStatus === "TENTATIVE") recommendedDecision = "Approve when logistics confirmed";

  return {
    recordId: row.recordId,
    generatedAt: new Date().toISOString(),
    eventSummary: {
      title: row.calendar.title,
      dateYmd: row.dateYmd,
      timeLabel: row.timeLabel,
      eventType: row.classificationLabel,
      city: row.likelyCity,
      county: row.county,
      status: row.eventStatus,
      reviewStatus: row.reviewStatus,
    },
    aiAssumptions: assumptions,
    missingFields,
    conflicts: row.conflicts.map((c) => ({ label: c.label, detail: c.detail })),
    travelEstimate: {
      line: row.travelLine,
      roundTripMiles: row.roundTripMiles,
      reimbursementDisplay: row.reimbursementDisplay,
    },
    recommendedDecision,
    actions: [
      {
        id: "approve",
        label: "Approve",
        disabled: !options?.tokenLinks?.approve,
        hint: options?.tokenLinks?.approve ? "Opens secure approval link" : "Send package email to enable links",
      },
      {
        id: "deny",
        label: "Deny",
        disabled: !options?.tokenLinks?.deny,
        hint: options?.tokenLinks?.deny ? "Opens secure link" : "Send package email first",
      },
      {
        id: "hold",
        label: "Hold",
        disabled: !options?.tokenLinks?.hold,
        hint: options?.tokenLinks?.hold ? "Opens secure link" : "Send package email first",
      },
      {
        id: "request_edits",
        label: "Request info",
        disabled: !options?.tokenLinks?.requestInfo,
        hint: options?.tokenLinks?.requestInfo ? "Opens secure link" : "Send package email first",
      },
    ],
    links: {
      workbenchUrl,
      drilldownUrl,
      packagePreviewUrl,
      secureTokenPlaceholder: options?.tokenLinks?.review ?? "(generate via Send approval package)",
    },
    approvalStatusTimeline: buildApprovalTimelineFromRow(row, row.approvalTimeline),
    recipientsPlaceholder: getApprovalPackageRecipientEmails(),
    candidateApprovalTo: getCandidateApprovalToLine(),
    emailSendEnabled: emailConfig.sendEnabled,
    emailConfig: {
      sendEnabled: emailConfig.sendEnabled,
      readyToSend: emailConfig.readyToSend,
      disabledReason: emailConfig.disabledReason,
      missingConfig: emailConfig.missingConfig,
      provider: emailConfig.provider,
      fromEmail: emailConfig.fromEmail,
    },
    emailAssist: assist,
    lastEmailLog: lastLog,
    tokenLinks: options?.tokenLinks ?? null,
  };
}

export function buildApprovalPackageWithLogs(
  row: WorkbenchEventRow,
  logs: ApprovalEmailLogEntry[],
  tokenLinks: ApprovalPackagePayload["tokenLinks"],
): ApprovalPackagePayload {
  return buildApprovalPackage(row, { lastEmailLog: latestApprovalEmailLog(logs), tokenLinks });
}
