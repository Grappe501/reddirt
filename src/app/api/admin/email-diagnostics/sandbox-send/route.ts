import { createHmac, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const HMAC_LABEL = "reddirt-email-diagnostics-bearer-v1";
const MAIL_SEND_URL = "https://api.sendgrid.com/v3/mail/send";
const DEFAULT_SUBJECT = "RedDirt SendGrid Sandbox Test";

// Safety: sandbox mode is intentionally hard-coded to true.
// This endpoint must never deliver email.

// Safety: this diagnostic does not write to the database, queues, or automation runners.

type DiagnosticsSecretSource = "EMAIL_DIAGNOSTICS_TOKEN" | "ADMIN_DIAGNOSTIC_TOKEN";

function getConfiguredDiagnosticsSecret():
  | { secret: string; source: DiagnosticsSecretSource }
  | undefined {
  const primary = process.env.EMAIL_DIAGNOSTICS_TOKEN?.trim();
  if (primary) return { secret: primary, source: "EMAIL_DIAGNOSTICS_TOKEN" };
  const fallback = process.env.ADMIN_DIAGNOSTIC_TOKEN?.trim();
  if (fallback) return { secret: fallback, source: "ADMIN_DIAGNOSTIC_TOKEN" };
  return undefined;
}

function timingSafeBearerMatch(expected: string, provided: string): boolean {
  const digest = (value: string) =>
    createHmac("sha256", HMAC_LABEL).update(value, "utf8").digest();
  try {
    const a = digest(expected);
    const b = digest(provided);
    return a.length === b.length && timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

function parseBearerToken(request: Request): "missing" | "invalid_scheme" | string {
  const raw = request.headers.get("authorization");
  if (raw == null || raw.trim() === "") return "missing";
  const trimmed = raw.trim();
  const match = /^Bearer\s+(\S*)$/i.exec(trimmed);
  if (!match) return "invalid_scheme";
  return match[1] ?? "";
}

/** Loose RFC-like check; rejects obvious non-emails without storing the value elsewhere. */
function looksLikeEmail(value: string): boolean {
  const t = value.trim();
  if (t.length < 5 || t.length > 320) return false;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(t)) return false;
  if (t.includes("..")) return false;
  return true;
}

function readRequiredFromEmail(): string | null {
  const primary = process.env.SENDGRID_FROM_EMAIL?.trim();
  if (primary) return primary;
  return null;
}

function sanitizeSendGridBodyForDetails(text: string): string[] {
  const details: string[] = [];
  let parsed: unknown;
  try {
    parsed = JSON.parse(text) as unknown;
  } catch {
    const line = redactSensitiveFromString(text.slice(0, 500));
    if (line) details.push(line);
    return details.slice(0, 8);
  }
  if (!parsed || typeof parsed !== "object") return details;
  const errors = (parsed as { errors?: unknown }).errors;
  if (!Array.isArray(errors)) return details;
  for (const err of errors.slice(0, 8)) {
    if (!err || typeof err !== "object") continue;
    const e = err as { field?: unknown; message?: unknown; help?: unknown };
    const field = typeof e.field === "string" ? e.field.slice(0, 120) : undefined;
    const message =
      typeof e.message === "string" ? redactSensitiveFromString(e.message.slice(0, 400)) : undefined;
    const help = typeof e.help === "string" ? redactSensitiveFromString(e.help.slice(0, 200)) : undefined;
    const parts = [field && `field=${field}`, message && `message=${message}`, help && `help=${help}`].filter(
      Boolean
    );
    if (parts.length) details.push(parts.join("; "));
  }
  return details;
}

function redactSensitiveFromString(s: string): string {
  return s
    .replace(/[^\s"'<>]+@[^\s"'<>]+\.[^\s"'<>]+/gi, "[redacted-email]")
    .replace(/\bSG\.[A-Za-z0-9_-]{10,}\b/g, "[redacted-token]");
}

type BodyInput = { to?: unknown; subject?: unknown };

/**
 * REDDIRT-SENDGRID-SANDBOX-SEND-1.0 — POST only. SendGrid Mail Send with sandbox_mode forced on. No DB, no queues.
 */
export async function POST(request: Request) {
  const configured = getConfiguredDiagnosticsSecret();
  if (!configured) {
    return NextResponse.json(
      { ok: false, error: "diagnostics_token_not_configured" },
      { status: 503 }
    );
  }

  const { secret } = configured;

  const bearer = parseBearerToken(request);
  if (bearer === "missing" || bearer === "invalid_scheme") {
    return NextResponse.json({ ok: false, error: "missing_authorization" }, { status: 401 });
  }

  if (!timingSafeBearerMatch(secret, bearer)) {
    return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
  }

  const apiKey = process.env.SENDGRID_API_KEY?.trim();
  const fromEmailRequired = readRequiredFromEmail();
  if (!apiKey || !fromEmailRequired) {
    return NextResponse.json(
      {
        ok: false,
        route: "/api/admin/email-diagnostics/sandbox-send",
        mode: "sendgrid_sandbox",
        delivered: false,
        sendgrid: { requestAccepted: false, status: 400 },
        error: {
          code: "SENDGRID_SANDBOX_VALIDATION_FAILED",
          message:
            "SENDGRID_API_KEY and SENDGRID_FROM_EMAIL must both be set (non-empty) for this diagnostic.",
        },
        sanitizedDetails: [],
      },
      { status: 200 }
    );
  }

  const fromEmail = fromEmailRequired;
  const fromName =
    process.env.SENDGRID_FROM_NAME?.trim() || "RedDirt Sandbox Diagnostic";

  let bodyJson: BodyInput;
  try {
    bodyJson = (await request.json()) as BodyInput;
  } catch {
    return NextResponse.json(
      {
        ok: false,
        route: "/api/admin/email-diagnostics/sandbox-send",
        mode: "sendgrid_sandbox",
        delivered: false,
        sendgrid: { requestAccepted: false, status: 400 },
        error: {
          code: "SENDGRID_SANDBOX_VALIDATION_FAILED",
          message: "Request body must be valid JSON.",
        },
        sanitizedDetails: [],
      },
      { status: 200 }
    );
  }

  const toRaw = bodyJson.to;
  if (typeof toRaw !== "string" || !looksLikeEmail(toRaw)) {
    return NextResponse.json(
      {
        ok: false,
        route: "/api/admin/email-diagnostics/sandbox-send",
        mode: "sendgrid_sandbox",
        delivered: false,
        sendgrid: { requestAccepted: false, status: 400 },
        error: {
          code: "SENDGRID_SANDBOX_VALIDATION_FAILED",
          message: 'Body field "to" is required and must look like an email address.',
        },
        sanitizedDetails: [],
      },
      { status: 200 }
    );
  }

  const toEmail = toRaw.trim();
  const subject =
    typeof bodyJson.subject === "string" && bodyJson.subject.trim()
      ? bodyJson.subject.trim().slice(0, 998)
      : DEFAULT_SUBJECT;

  const replyToEmail = process.env.SENDGRID_REPLY_TO_EMAIL?.trim();
  const replyToName = process.env.SENDGRID_REPLY_TO_NAME?.trim();

  const payload: Record<string, unknown> = {
    personalizations: [
      {
        to: [{ email: toEmail }],
        subject,
      },
    ],
    from: { email: fromEmail, name: fromName },
    content: [
      {
        type: "text/plain",
        value:
          "This is a RedDirt SendGrid sandbox validation request. Sandbox mode is enabled. No email should be delivered.",
      },
    ],
    mail_settings: {
      sandbox_mode: {
        enable: true,
      },
    },
  };

  if (replyToEmail && looksLikeEmail(replyToEmail)) {
    payload.reply_to = replyToName
      ? { email: replyToEmail, name: replyToName.slice(0, 200) }
      : { email: replyToEmail };
  }

  const res = await fetch(MAIL_SEND_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const requestAccepted = res.status === 200 || res.status === 202;

  if (requestAccepted) {
    return NextResponse.json(
      {
        ok: true,
        route: "/api/admin/email-diagnostics/sandbox-send",
        mode: "sendgrid_sandbox",
        delivered: false,
        sendgrid: {
          requestAccepted: true,
          status: res.status,
        },
        warnings: [
          "Sandbox mode was enabled. No email should have been delivered.",
          "This response is not proof of inbox delivery or Event Webhook delivery.",
        ],
        nextRecommendedStep: "Proceed to controlled live-send proof only after Steve explicitly approves.",
      },
      { status: 200 }
    );
  }

  const rawText = await res.text();
  const sanitizedDetails = sanitizeSendGridBodyForDetails(rawText);

  return NextResponse.json(
    {
      ok: false,
      route: "/api/admin/email-diagnostics/sandbox-send",
      mode: "sendgrid_sandbox",
      delivered: false,
      sendgrid: {
        requestAccepted: false,
        status: res.status,
      },
      error: {
        code: "SENDGRID_SANDBOX_VALIDATION_FAILED",
        message: "SendGrid rejected the sandbox request. Review sanitized validation errors.",
      },
      sanitizedDetails,
    },
    { status: 200 }
  );
}
