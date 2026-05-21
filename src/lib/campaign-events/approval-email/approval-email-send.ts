import "server-only";

import { randomBytes } from "node:crypto";
import { sendSendGridSingleTestEmail } from "@/lib/sendgrid/mail-send";
import { buildApprovalPackage } from "../approval-package";
import type { WorkbenchEventRow } from "../merge-persisted-row";
import { getApprovalPackageRecipientEmails } from "../approval-recipients";
import { buildApprovalEmailAssist } from "./approval-email-assist";
import { getApprovalEmailConfig } from "./approval-email-config";
import { appendApprovalEmailLog } from "./approval-email-persist";
import { buildApprovalEmailBodies } from "./approval-email-template";
import { approvalTokenUrl, createApprovalTokenSet } from "./approval-token-store";

export type SendApprovalPackageResult = {
  ok: boolean;
  status: "sent" | "skipped_disabled" | "failed" | "dry_run";
  logId: string;
  recipients: string[];
  subject: string;
  error?: string;
  tokenUrls?: Record<string, string>;
};

export async function sendApprovalPackageEmail(input: {
  row: WorkbenchEventRow;
  createdBy: string;
  dryRun?: boolean;
  testToSelf?: string;
}): Promise<SendApprovalPackageResult> {
  const config = getApprovalEmailConfig();
  const recipients = input.testToSelf ? [input.testToSelf.trim().toLowerCase()] : getApprovalPackageRecipientEmails();
  const payload = buildApprovalPackage(input.row);
  const assist = buildApprovalEmailAssist(input.row);
  const subject = assist.subject;

  if (input.dryRun) {
    const log = await appendApprovalEmailLog(input.row.recordId, {
      recipients,
      subject,
      provider: config.provider,
      status: "drafted",
      createdAt: new Date().toISOString(),
      createdBy: input.createdBy,
      dryRun: true,
    });
    return { ok: true, status: "dry_run", logId: log.id, recipients, subject };
  }

  if (!config.readyToSend) {
    const log = await appendApprovalEmailLog(input.row.recordId, {
      recipients,
      subject,
      provider: config.provider,
      status: "skipped_disabled",
      error: config.disabledReason ?? "Send disabled",
      createdAt: new Date().toISOString(),
      createdBy: input.createdBy,
    });
    return {
      ok: false,
      status: "skipped_disabled",
      logId: log.id,
      recipients,
      subject,
      error: config.disabledReason ?? undefined,
    };
  }

  const logId = `ael_${randomBytes(8).toString("hex")}`;
  const tokens = await createApprovalTokenSet({
    recordId: input.row.recordId,
    createdBy: input.createdBy,
    packageLogId: logId,
  });

  const links = {
    review: approvalTokenUrl(config.baseUrl, tokens.review.id),
    approve: approvalTokenUrl(config.baseUrl, tokens.approve.id),
    hold: approvalTokenUrl(config.baseUrl, tokens.hold.id),
    deny: approvalTokenUrl(config.baseUrl, tokens.deny.id),
    requestInfo: approvalTokenUrl(config.baseUrl, tokens.request_info.id),
  };

  const { html, text } = buildApprovalEmailBodies({ payload, assist, links });

  const errors: string[] = [];
  let lastStatus = 0;
  for (const to of recipients) {
    const result = await sendSendGridSingleTestEmail({
      to,
      subject,
      html,
      text,
      fromEmail: config.fromEmail,
      fromName: config.fromName,
      replyToEmail: config.replyToEmail,
    });
    if (!result.ok) errors.push(`${to}: ${result.safeMessage}`);
    else lastStatus = result.statusCode;
  }

  if (errors.length) {
    const log = await appendApprovalEmailLog(input.row.recordId, {
      recipients,
      subject,
      provider: "sendgrid",
      status: "failed",
      error: errors.join("; "),
      createdAt: new Date().toISOString(),
      createdBy: input.createdBy,
      tokenIds: Object.values(tokens).map((t) => t.id),
    });
    return {
      ok: false,
      status: "failed",
      logId: log.id,
      recipients,
      subject,
      error: errors.join("; "),
      tokenUrls: links,
    };
  }

  const log = await appendApprovalEmailLog(input.row.recordId, {
    recipients,
    subject,
    provider: "sendgrid",
    status: "sent",
    messageId: `sendgrid:${lastStatus}`,
    createdAt: new Date().toISOString(),
    sentAt: new Date().toISOString(),
    createdBy: input.createdBy,
    tokenIds: Object.values(tokens).map((t) => t.id),
  });

  return {
    ok: true,
    status: "sent",
    logId: log.id,
    recipients,
    subject,
    tokenUrls: links,
  };
}
