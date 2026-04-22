import { EventWebhook, EventWebhookHeader } from "@sendgrid/eventwebhook";

const ewh = new EventWebhook();

export function getSendgridWebhookVerificationKey(): string {
  return process.env.SENDGRID_WEBHOOK_VERIFICATION_KEY?.trim() ?? "";
}

/**
 * @returns `true` if signed and valid; `true` if unsigned dev mode allowed; `false` if invalid.
 */
export function verifySendgridEventWebhook(
  publicKeyPem: string,
  rawBody: string | Buffer,
  signature: string | null,
  timestamp: string | null
): boolean {
  if (!signature || !timestamp) return false;
  const pub = ewh.convertPublicKeyToECDSA(publicKeyPem);
  return ewh.verifySignature(pub, rawBody, signature, timestamp);
}

export function shouldRequireSendgridWebhookSignature(): boolean {
  return process.env.NODE_ENV === "production";
}

export function sendgridEventWebhookHeaderNames() {
  return {
    signature: EventWebhookHeader.SIGNATURE(),
    timestamp: EventWebhookHeader.TIMESTAMP(),
  } as const;
}
