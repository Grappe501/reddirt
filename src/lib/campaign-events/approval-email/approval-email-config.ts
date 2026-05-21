import "server-only";

import { getSendGridMailReadiness } from "@/lib/sendgrid/mail-send";

export type ApprovalEmailProvider = "sendgrid" | "none";

export type ApprovalEmailConfig = {
  sendEnabled: boolean;
  provider: ApprovalEmailProvider;
  fromEmail: string;
  fromName: string;
  replyToEmail: string;
  baseUrl: string;
  readyToSend: boolean;
  missingConfig: string[];
  disabledReason: string | null;
};

function envTruthy(raw: string | undefined): boolean {
  const v = raw?.trim().toLowerCase();
  return v === "true" || v === "1" || v === "yes";
}

export function getApprovalEmailConfig(): ApprovalEmailConfig {
  const sendEnabled = envTruthy(process.env.EMAIL_SEND_ENABLED);
  const providerRaw = process.env.EMAIL_PROVIDER?.trim().toLowerCase() || "sendgrid";
  const provider: ApprovalEmailProvider = providerRaw === "sendgrid" ? "sendgrid" : "none";

  const fromEmail =
    process.env.APPROVAL_EMAIL_FROM?.trim() ||
    process.env.SENDGRID_FROM_EMAIL?.trim() ||
    "";
  const fromName =
    process.env.APPROVAL_EMAIL_FROM_NAME?.trim() ||
    process.env.SENDGRID_FROM_NAME?.trim() ||
    "Kelly Grappe for Secretary of State";
  const replyToEmail = process.env.APPROVAL_EMAIL_REPLY_TO?.trim() || fromEmail;
  const baseUrl = (
    process.env.APPROVAL_BASE_URL?.trim() ||
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
    "http://localhost:3000"
  ).replace(/\/$/, "");

  const missingConfig: string[] = [];
  if (!sendEnabled) missingConfig.push("EMAIL_SEND_ENABLED is not true");
  if (provider !== "sendgrid") missingConfig.push(`EMAIL_PROVIDER must be sendgrid (got ${providerRaw || "empty"})`);

  const sg = getSendGridMailReadiness();
  if (!sg.sendgridApiKeyConfigured) missingConfig.push("SENDGRID_API_KEY");
  if (!fromEmail) missingConfig.push("APPROVAL_EMAIL_FROM or SENDGRID_FROM_EMAIL");
  if (!fromName) missingConfig.push("APPROVAL_EMAIL_FROM_NAME or SENDGRID_FROM_NAME");
  if (!baseUrl || baseUrl === "http://localhost:3000") {
    missingConfig.push("APPROVAL_BASE_URL or NEXT_PUBLIC_SITE_URL (production site URL)");
  }

  const readyToSend = sendEnabled && provider === "sendgrid" && missingConfig.length === 0;
  const disabledReason = readyToSend
    ? null
    : missingConfig.length
      ? `Sending disabled: ${missingConfig.join("; ")}`
      : "Sending disabled";

  return {
    sendEnabled,
    provider,
    fromEmail,
    fromName,
    replyToEmail,
    baseUrl,
    readyToSend,
    missingConfig,
    disabledReason,
  };
}
