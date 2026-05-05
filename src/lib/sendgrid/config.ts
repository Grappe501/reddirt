import "server-only";

/**
 * EMAIL-SENDGRID-FOUNDATION-1.0 — env presence / readiness only (never values or secrets).
 */

export type SendGridEnvStatus = {
  sendgridApiKeyPresent: boolean;
  sendgridFromEmailPresent: boolean;
  sendgridFromNamePresent: boolean;
  /** Signed Event Webhook verification public key (PEM) — env name only in UI. */
  sendgridWebhookVerificationKeyPresent: boolean;
  sendgridWebhookPublicKeyPresent: boolean;
  sendgridUnsubscribeGroupIdPresent: boolean;
  sendgridDefaultListIdPresent: boolean;
  sendgridSandboxModePresent: boolean;
};

export type SendGridReadiness = {
  configured: boolean;
  fromIdentityReady: boolean;
  webhookVerificationReady: boolean;
  /** Deliverability gate — always manual in this packet (no secretless API proof). */
  domainAuthentication: "manual_operator_checklist";
  foundationStatus: "readiness_only";
  notes: string[];
};

export type SendGridWebhookReadiness = {
  verificationKeyConfigured: boolean;
  /** Public URL path for SendGrid Event Webhook POST (no secret in path). */
  eventWebhookPath: string;
  legacyCommsWebhookPath: string;
  productionRequiresSignedPayloads: boolean;
};

export type SendGridPolicySummary = {
  canSendFromEmailWorkflowQueue: false;
  canMassSend: false;
  canAutoSyncContacts: false;
  canInvokeOpenAiFromSendGridPath: false;
  suppressionRequiredBeforeFutureSend: true;
};

export function isSendGridConfigured(): boolean {
  return Boolean(process.env.SENDGRID_API_KEY?.trim());
}

export function getSendGridEnvStatus(): SendGridEnvStatus {
  return {
    sendgridApiKeyPresent: Boolean(process.env.SENDGRID_API_KEY?.trim()),
    sendgridFromEmailPresent: Boolean(process.env.SENDGRID_FROM_EMAIL?.trim()),
    sendgridFromNamePresent: Boolean(process.env.SENDGRID_FROM_NAME?.trim()),
    sendgridWebhookVerificationKeyPresent: Boolean(process.env.SENDGRID_WEBHOOK_VERIFICATION_KEY?.trim()),
    sendgridWebhookPublicKeyPresent: Boolean(process.env.SENDGRID_WEBHOOK_PUBLIC_KEY?.trim()),
    sendgridUnsubscribeGroupIdPresent: Boolean(process.env.SENDGRID_UNSUBSCRIBE_GROUP_ID?.trim()),
    sendgridDefaultListIdPresent: Boolean(process.env.SENDGRID_DEFAULT_LIST_ID?.trim()),
    sendgridSandboxModePresent: Boolean(process.env.SENDGRID_SANDBOX_MODE?.trim()),
  };
}

export function getSendGridWebhookReadiness(): SendGridWebhookReadiness {
  const v =
    Boolean(process.env.SENDGRID_WEBHOOK_VERIFICATION_KEY?.trim()) ||
    Boolean(process.env.SENDGRID_WEBHOOK_PUBLIC_KEY?.trim());
  return {
    verificationKeyConfigured: v,
    eventWebhookPath: "/api/sendgrid/events",
    legacyCommsWebhookPath: "/api/webhooks/sendgrid",
    productionRequiresSignedPayloads: process.env.NODE_ENV === "production",
  };
}

export function getSendGridReadiness(): SendGridReadiness {
  const env = getSendGridEnvStatus();
  const w = getSendGridWebhookReadiness();
  const configured = env.sendgridApiKeyPresent;
  const fromIdentityReady = env.sendgridFromEmailPresent && env.sendgridFromNamePresent;
  const notes: string[] = [
    "EMAIL-SENDGRID-FOUNDATION-1.0 — no live sends, no automatic contact sync, no campaigns from this lane.",
    "Configure SendGrid Event Webhook in the SendGrid UI to POST signed events to the event webhook path.",
    "Domain authentication and sender identity are operator launch gates in SendGrid (not auto-verified here).",
  ];
  if (process.env.NODE_ENV === "production" && !w.verificationKeyConfigured) {
    notes.push("Production: configure SENDGRID_WEBHOOK_VERIFICATION_KEY or SENDGRID_WEBHOOK_PUBLIC_KEY for signed webhooks.");
  }
  return {
    configured,
    fromIdentityReady,
    webhookVerificationReady: w.verificationKeyConfigured,
    domainAuthentication: "manual_operator_checklist",
    foundationStatus: "readiness_only",
    notes,
  };
}

export function getSendGridPolicySummary(): SendGridPolicySummary {
  return {
    canSendFromEmailWorkflowQueue: false,
    canMassSend: false,
    canAutoSyncContacts: false,
    canInvokeOpenAiFromSendGridPath: false,
    suppressionRequiredBeforeFutureSend: true,
  };
}
