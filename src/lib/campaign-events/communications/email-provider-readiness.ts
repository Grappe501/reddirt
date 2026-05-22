/**
 * Campaign OS email provider readiness (env-only — safe for scripts and server).
 * Does not send mail.
 */

export type EmailProviderReadinessReport = {
  generatedAt: string;
  sendGrid: {
    apiKeyConfigured: boolean;
    fromEmailConfigured: boolean;
    fromNameConfigured: boolean;
    asmGroupConfigured: boolean;
    broadcastAllowed: boolean;
    webhookKeyConfigured: boolean;
    notes: string[];
  };
  gmail: {
    clientIdConfigured: boolean;
    tokenEncryptionConfigured: boolean;
    sendScopeOptional: boolean;
    notes: string[];
  };
  approvalEmail: {
    sendEnabled: boolean;
    provider: string;
    fromEmailConfigured: boolean;
    replyToConfigured: boolean;
    baseUrlConfigured: boolean;
    readyToSend: boolean;
    missingConfig: string[];
  };
  safety: {
    massEmailBlocked: boolean;
    massEmailBlockReasons: string[];
    testSendPossible: boolean;
    dryRunRecommended: boolean;
  };
  recommendedNextSteps: string[];
};

function envTruthy(raw: string | undefined): boolean {
  const v = raw?.trim().toLowerCase();
  return v === "true" || v === "1" || v === "yes";
}

export function buildEmailProviderReadinessReport(): EmailProviderReadinessReport {
  const apiKey = Boolean(process.env.SENDGRID_API_KEY?.trim());
  const fromEmail = Boolean(process.env.SENDGRID_FROM_EMAIL?.trim());
  const fromName = Boolean(process.env.SENDGRID_FROM_NAME?.trim());
  const asmRaw = process.env.SENDGRID_UNSUBSCRIBE_GROUP_ID?.trim();
  const asm = Boolean(asmRaw && !Number.isNaN(parseInt(asmRaw, 10)));
  const broadcastAllowed = apiKey && fromEmail && fromName && asm;

  const sendEnabled = envTruthy(process.env.EMAIL_SEND_ENABLED);
  const approvalFrom = process.env.APPROVAL_EMAIL_FROM?.trim() || process.env.SENDGRID_FROM_EMAIL?.trim() || "";
  const replyTo = process.env.APPROVAL_EMAIL_REPLY_TO?.trim() || approvalFrom;
  const baseUrl = (process.env.APPROVAL_BASE_URL?.trim() || process.env.NEXT_PUBLIC_SITE_URL?.trim() || "").replace(/\/$/, "");

  const approvalMissing: string[] = [];
  if (!sendEnabled) approvalMissing.push("EMAIL_SEND_ENABLED");
  if (!apiKey) approvalMissing.push("SENDGRID_API_KEY");
  if (!approvalFrom) approvalMissing.push("APPROVAL_EMAIL_FROM or SENDGRID_FROM_EMAIL");
  if (!baseUrl) approvalMissing.push("APPROVAL_BASE_URL or NEXT_PUBLIC_SITE_URL");

  const massBlockReasons: string[] = [
    "All-contact / broadcast sends require ECC Send Execution approval + SEND APPROVED",
    "Mass email blocked in Campaign OS V1 until suppression checklist complete",
  ];
  if (!asm) massBlockReasons.push("SENDGRID_UNSUBSCRIBE_GROUP_ID (ASM) required for marketing sends");
  if (!broadcastAllowed) massBlockReasons.push("SendGrid broadcast identity not fully configured");

  const sgNotes: string[] = [];
  if (!apiKey) sgNotes.push("SENDGRID_API_KEY missing");
  if (!asm) sgNotes.push("ASM unsubscribe group missing — broadcast blocked");

  const steps: string[] = [];
  if (!apiKey) steps.push("Set SENDGRID_API_KEY in Netlify env");
  if (!asm) steps.push("Configure SENDGRID_UNSUBSCRIBE_GROUP_ID in SendGrid");
  steps.push("Use /admin/workbench/email-command-center/readiness for hosted DB proof");
  steps.push("Use /admin/communications for unified Campaign OS comms dashboard");
  if (!sendEnabled) steps.push("Keep EMAIL_SEND_ENABLED=false until approval email dry-run passes");

  return {
    generatedAt: new Date().toISOString(),
    sendGrid: {
      apiKeyConfigured: apiKey,
      fromEmailConfigured: fromEmail,
      fromNameConfigured: fromName,
      asmGroupConfigured: asm,
      broadcastAllowed,
      webhookKeyConfigured: Boolean(
        process.env.SENDGRID_WEBHOOK_VERIFICATION_KEY?.trim() || process.env.SENDGRID_WEBHOOK_PUBLIC_KEY?.trim(),
      ),
      notes: sgNotes,
    },
    gmail: {
      clientIdConfigured: Boolean(process.env.GOOGLE_GMAIL_CLIENT_ID?.trim()),
      tokenEncryptionConfigured: Boolean(process.env.GMAIL_TOKEN_ENCRYPTION_KEY?.trim()),
      sendScopeOptional: envTruthy(process.env.GMAIL_OAUTH_INCLUDE_SEND_FOR_WORKBENCH),
      notes: ["Gmail ingest/review via Email Command Center; send optional via workbench OAuth"],
    },
    approvalEmail: {
      sendEnabled,
      provider: process.env.EMAIL_PROVIDER?.trim() || "sendgrid",
      fromEmailConfigured: Boolean(approvalFrom),
      replyToConfigured: Boolean(replyTo),
      baseUrlConfigured: Boolean(baseUrl),
      readyToSend: sendEnabled && approvalMissing.length === 0,
      missingConfig: approvalMissing,
    },
    safety: {
      massEmailBlocked: true,
      massEmailBlockReasons: massBlockReasons,
      testSendPossible: apiKey && fromEmail,
      dryRunRecommended: true,
    },
    recommendedNextSteps: steps,
  };
}
