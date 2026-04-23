import sendgrid from "@sendgrid/mail";
import twilio from "twilio";
import { CommsSendProvider, CommsWorkbenchChannel } from "@prisma/client";
import { prisma } from "@/lib/db";
import { getEffectivePreferenceForThread, canSendEmail, canSendSms } from "@/lib/comms/preferences";
import { normalizeUsPhone } from "@/lib/comms/phone";
import { getSendgridEnv, isSendgridConfigured } from "@/lib/integrations/sendgrid/env";
import { getTwilioEnv, isTwilioConfigured } from "@/lib/integrations/twilio/env";
import type { CommunicationSendExecutionContract } from "./send-execution-contract";

export type WorkbenchProviderDispatchResult =
  | {
      ok: true;
      provider: CommsSendProvider;
      providerMessageId: string;
      providerStatus: string | null;
      webhookPending: boolean;
    }
  | {
      ok: false;
      provider: CommsSendProvider;
      errorCode?: string;
      errorMessage: string;
    };

export function selectProviderForWorkbenchChannel(channel: CommsWorkbenchChannel): CommsSendProvider | null {
  if (channel === CommsWorkbenchChannel.EMAIL) return CommsSendProvider.SENDGRID;
  if (channel === CommsWorkbenchChannel.SMS) return CommsSendProvider.TWILIO;
  return null;
}

function getPublicWebhookBaseUrl(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL ?? "").replace(/\/$/, "") || "http://localhost:3000";
}

/**
 * Resolve thread for preference checks; optional for direct-address sends.
 */
async function assertEmailPreferencesOk(threadId: string): Promise<{ ok: true } | { ok: false; message: string }> {
  const thread = await prisma.communicationThread.findUnique({ where: { id: threadId } });
  if (!thread) return { ok: false, message: "Communication thread not found." };
  const p = await getEffectivePreferenceForThread(thread);
  const gate = canSendEmail(p);
  if (!gate.ok) return { ok: false, message: gate.reason };
  return { ok: true };
}

async function assertSmsPreferencesOk(threadId: string): Promise<{ ok: true } | { ok: false; message: string }> {
  const thread = await prisma.communicationThread.findUnique({ where: { id: threadId } });
  if (!thread) return { ok: false, message: "Communication thread not found." };
  const p = await getEffectivePreferenceForThread(thread);
  const gate = canSendSms(p);
  if (!gate.ok) return { ok: false, message: gate.reason };
  return { ok: true };
}

/**
 * Send using execution contract only (content); addresses come from resolution layer.
 */
export async function dispatchWorkbenchSend(params: {
  contract: CommunicationSendExecutionContract;
  provider: CommsSendProvider;
  toEmail: string | null;
  toPhone: string | null;
  preferenceThreadId: string | null;
}): Promise<WorkbenchProviderDispatchResult> {
  const { contract, provider, toEmail, toPhone, preferenceThreadId } = params;

  if (provider === CommsSendProvider.SENDGRID) {
    if (contract.channel !== CommsWorkbenchChannel.EMAIL) {
      return {
        ok: false,
        provider,
        errorCode: "CHANNEL_PROVIDER_MISMATCH",
        errorMessage: "SendGrid adapter only supports EMAIL channel.",
      };
    }
    const subject = contract.content.resolvedSubject?.trim() || "(no subject)";
    const text = contract.content.resolvedBody?.trim() ?? "";
    if (!toEmail?.includes("@")) {
      return { ok: false, provider, errorCode: "MISSING_RECIPIENT", errorMessage: "Email recipient is required." };
    }
    if (preferenceThreadId) {
      const pref = await assertEmailPreferencesOk(preferenceThreadId);
      if (!pref.ok) return { ok: false, provider, errorCode: "PREFERENCE_GATE", errorMessage: pref.message };
    }
    if (!isSendgridConfigured()) {
      return {
        ok: false,
        provider,
        errorCode: "NOT_CONFIGURED",
        errorMessage: "SendGrid is not configured (SENDGRID_API_KEY / SENDGRID_FROM_EMAIL).",
      };
    }
    const { apiKey, fromEmail, fromName } = getSendgridEnv();
    sendgrid.setApiKey(apiKey);
    try {
      const [res] = await sendgrid.send({
        to: toEmail.trim(),
        from: { email: fromEmail, name: fromName },
        subject,
        text,
        customArgs: {
          commsWorkbenchSendId: contract.sendId,
        },
      });
      const providerMessageId =
        (res?.headers["x-message-id"] as string | undefined) ??
        (res?.headers["X-Message-Id"] as string | undefined) ??
        contract.sendId;
      return {
        ok: true,
        provider,
        providerMessageId: providerMessageId || contract.sendId,
        providerStatus: "accepted",
        webhookPending: true,
      };
    } catch (e) {
      const err = e instanceof Error ? e.message : String(e);
      return { ok: false, provider, errorCode: "SENDGRID_ERROR", errorMessage: err };
    }
  }

  if (provider === CommsSendProvider.TWILIO) {
    if (contract.channel !== CommsWorkbenchChannel.SMS) {
      return {
        ok: false,
        provider,
        errorCode: "CHANNEL_PROVIDER_MISMATCH",
        errorMessage: "Twilio adapter only supports SMS channel.",
      };
    }
    const body = contract.content.resolvedBody?.trim() ?? "";
    const nTo = toPhone ? normalizeUsPhone(toPhone) : null;
    if (!nTo) {
      return { ok: false, provider, errorCode: "MISSING_RECIPIENT", errorMessage: "SMS recipient phone is required." };
    }
    if (preferenceThreadId) {
      const pref = await assertSmsPreferencesOk(preferenceThreadId);
      if (!pref.ok) return { ok: false, provider, errorCode: "PREFERENCE_GATE", errorMessage: pref.message };
    }
    if (!isTwilioConfigured()) {
      return {
        ok: false,
        provider,
        errorCode: "NOT_CONFIGURED",
        errorMessage: "Twilio is not configured (TWILIO_ACCOUNT_SID / TWILIO_AUTH_TOKEN / TWILIO_SMS_FROM).",
      };
    }
    const { accountSid, authToken, smsFrom } = getTwilioEnv();
    const client = twilio(accountSid, authToken);
    const base = getPublicWebhookBaseUrl();
    const statusCallback = `${base}/api/webhooks/twilio?commsWorkbenchSendId=${encodeURIComponent(contract.sendId)}`;
    try {
      const tmsg = await client.messages.create({
        from: smsFrom,
        to: nTo,
        body,
        statusCallback,
      });
      if (tmsg.status === "failed") {
        return {
          ok: false,
          provider,
          errorCode: "TWILIO_FAILED",
          errorMessage: tmsg.errorMessage || "Twilio reported failed send.",
        };
      }
      return {
        ok: true,
        provider,
        providerMessageId: tmsg.sid,
        providerStatus: tmsg.status,
        webhookPending: true,
      };
    } catch (e) {
      const err = e instanceof Error ? e.message : String(e);
      return { ok: false, provider, errorCode: "TWILIO_ERROR", errorMessage: err };
    }
  }

  return {
    ok: false,
    provider,
    errorCode: "UNSUPPORTED_PROVIDER",
    errorMessage: "No provider adapter for this configuration.",
  };
}
