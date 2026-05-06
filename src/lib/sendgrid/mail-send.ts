import "server-only";

/**
 * EMAIL-SEND-EXECUTION-1.0 — SendGrid Mail Send API (v3 /mail/send) for governed operator sends only.
 * No Marketing campaign scheduling. No automation. Used only from send-execution server paths.
 */

const MAIL_SEND_URL = "https://api.sendgrid.com/v3/mail/send";
const MAX_RECIPIENTS_PER_REQUEST = 900;

export type SendGridMailReadiness = {
  sendgridApiKeyConfigured: boolean;
  fromEmailConfigured: boolean;
  fromNameConfigured: boolean;
  asmGroupConfigured: boolean;
  broadcastAllowed: boolean;
  notes: string[];
};

export function getSendGridMailReadiness(): SendGridMailReadiness {
  const sendgridApiKeyConfigured = Boolean(process.env.SENDGRID_API_KEY?.trim());
  const fromEmailConfigured = Boolean(process.env.SENDGRID_FROM_EMAIL?.trim());
  const fromNameConfigured = Boolean(process.env.SENDGRID_FROM_NAME?.trim());
  const rawAsm = process.env.SENDGRID_UNSUBSCRIBE_GROUP_ID?.trim();
  const asmGroupConfigured = Boolean(rawAsm && !Number.isNaN(parseInt(rawAsm, 10)));
  const broadcastAllowed =
    sendgridApiKeyConfigured && fromEmailConfigured && fromNameConfigured && asmGroupConfigured;
  const notes: string[] = [];
  if (!sendgridApiKeyConfigured) notes.push("SENDGRID_API_KEY missing — mail send blocked.");
  if (!fromEmailConfigured) notes.push("SENDGRID_FROM_EMAIL missing — mail send blocked.");
  if (!fromNameConfigured) notes.push("SENDGRID_FROM_NAME missing — mail send blocked.");
  if (!asmGroupConfigured) {
    notes.push(
      "SENDGRID_UNSUBSCRIBE_GROUP_ID missing or not a numeric ASM group — broadcast blocked (test send to a single explicit address may still be allowed by caller policy).",
    );
  }
  return {
    sendgridApiKeyConfigured,
    fromEmailConfigured,
    fromNameConfigured,
    asmGroupConfigured,
    broadcastAllowed,
    notes,
  };
}

function readApiKey(): string | null {
  const k = process.env.SENDGRID_API_KEY?.trim();
  return k || null;
}

function readAsmGroupId(): number | null {
  const raw = process.env.SENDGRID_UNSUBSCRIBE_GROUP_ID?.trim();
  if (!raw) return null;
  const n = parseInt(raw, 10);
  return Number.isNaN(n) ? null : n;
}

export function sanitizeSendGridMailError(error: unknown): string {
  if (error instanceof Error && error.message) {
    const m = error.message.trim();
    return m.length > 280 ? `${m.slice(0, 280)}…` : m;
  }
  return "SendGrid mail request failed.";
}

function safeJson(text: string): unknown {
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return null;
  }
}

function extractSendGridErrors(body: unknown): string | null {
  if (!body || typeof body !== "object") return null;
  const o = body as { errors?: { message?: string }[] };
  if (!Array.isArray(o.errors) || !o.errors.length) return null;
  const m = o.errors[0]?.message;
  return typeof m === "string" ? m.slice(0, 400) : null;
}

export type SendGridSingleMailInput = {
  to: string;
  subject: string;
  html: string;
  text: string;
  fromEmail: string;
  fromName: string;
  replyToEmail?: string | null;
};

export async function sendSendGridSingleTestEmail(
  input: SendGridSingleMailInput,
): Promise<{ ok: true; statusCode: number } | { ok: false; safeMessage: string }> {
  const apiKey = readApiKey();
  if (!apiKey) return { ok: false, safeMessage: "SENDGRID_API_KEY not configured." };
  const to = input.to.trim().toLowerCase();
  if (!to.includes("@")) return { ok: false, safeMessage: "Invalid test recipient email." };

  const payload: Record<string, unknown> = {
    personalizations: [{ to: [{ email: to }] }],
    from: { email: input.fromEmail.trim(), name: input.fromName.trim() },
    subject: input.subject,
    content: [
      { type: "text/plain", value: input.text },
      { type: "text/html", value: input.html },
    ],
  };
  if (input.replyToEmail?.trim()) {
    payload.reply_to = { email: input.replyToEmail.trim() };
  }

  const res = await fetch(MAIL_SEND_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (res.status >= 200 && res.status < 300) {
    return { ok: true, statusCode: res.status };
  }
  const text = await res.text();
  const parsed = safeJson(text);
  const msg = extractSendGridErrors(parsed) ?? `SendGrid mail HTTP ${res.status}`;
  return { ok: false, safeMessage: sanitizeSendGridMailError(new Error(msg)) };
}

export type SendGridBroadcastMailInput = {
  recipientEmails: string[];
  subject: string;
  html: string;
  text: string;
  fromEmail: string;
  fromName: string;
  replyToEmail?: string | null;
  /** Required for broadcast — caller must verify env + policy. */
  asmGroupId: number;
  /** When set with recipient ids, SendGrid echoes these on webhook events (no secrets). */
  sendExecutionId?: string;
  /** Parallel to recipientEmails after dedupe — omit entries where id unknown. */
  broadcastRecipientContext?: Array<{ email: string; emailSendRecipientId: string }>;
};

export async function sendSendGridBroadcastEmail(
  input: SendGridBroadcastMailInput,
): Promise<{ ok: true; batches: number; lastStatusCode: number } | { ok: false; safeMessage: string }> {
  const apiKey = readApiKey();
  if (!apiKey) return { ok: false, safeMessage: "SENDGRID_API_KEY not configured." };
  if (!Number.isFinite(input.asmGroupId)) {
    return { ok: false, safeMessage: "ASM group id required for broadcast send." };
  }
  const emails = [...new Set(input.recipientEmails.map((e) => e.trim().toLowerCase()).filter((e) => e.includes("@")))];
  if (emails.length === 0) return { ok: false, safeMessage: "No recipient emails for broadcast." };

  const ctxMap = new Map(
    (input.broadcastRecipientContext ?? []).map((r) => [r.email.trim().toLowerCase(), r.emailSendRecipientId.trim()]),
  );

  let batches = 0;
  let lastStatus = 202;
  for (let i = 0; i < emails.length; i += MAX_RECIPIENTS_PER_REQUEST) {
    const chunk = emails.slice(i, i + MAX_RECIPIENTS_PER_REQUEST);
    const personalizations = chunk.map((email) => {
      const row: Record<string, unknown> = { to: [{ email }] };
      const rid = ctxMap.get(email);
      if (input.sendExecutionId && rid) {
        row.custom_args = {
          sendExecutionId: input.sendExecutionId,
          emailSendRecipientId: rid,
        };
      }
      return row;
    });
    const payload: Record<string, unknown> = {
      personalizations,
      from: { email: input.fromEmail.trim(), name: input.fromName.trim() },
      subject: input.subject,
      content: [
        { type: "text/plain", value: input.text },
        { type: "text/html", value: input.html },
      ],
      asm: { group_id: input.asmGroupId },
    };
    if (input.replyToEmail?.trim()) {
      payload.reply_to = { email: input.replyToEmail.trim() };
    }

    const res = await fetch(MAIL_SEND_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    lastStatus = res.status;
    if (res.status < 200 || res.status >= 300) {
      const text = await res.text();
      const parsed = safeJson(text);
      const msg = extractSendGridErrors(parsed) ?? `SendGrid mail HTTP ${res.status}`;
      return { ok: false, safeMessage: sanitizeSendGridMailError(new Error(msg)) };
    }
    batches += 1;
  }

  return { ok: true, batches, lastStatusCode: lastStatus };
}

export { readAsmGroupId };
