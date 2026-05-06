import { createHmac, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const HMAC_LABEL = "reddirt-email-diagnostics-bearer-v1";

/** Env names checked for SendGrid / from-identity / webhooks — values never read into the response. */
const SENDGRID_ENV_KEYS = [
  "SENDGRID_API_KEY",
  "SENDGRID_FROM_EMAIL",
  "SENDGRID_FROM_NAME",
  "SENDGRID_REPLY_TO_EMAIL",
  "SENDGRID_REPLY_TO_NAME",
  "SENDGRID_WEBHOOK_PUBLIC_KEY",
  "SENDGRID_EVENT_WEBHOOK_PUBLIC_KEY",
  "SENDGRID_WEBHOOK_VERIFICATION_KEY",
  "SENDGRID_UNSUBSCRIBE_GROUP_ID",
  "SENDGRID_DEFAULT_LIST_ID",
  "SENDGRID_SANDBOX_MODE",
  "SENDGRID_FROM",
  "SENDGRID_SENDER_EMAIL",
  "SENDGRID_DEFAULT_FROM_EMAIL",
  "SENDGRID_REPLY_TO",
  "SENDGRID_WEBHOOK_SECRET",
] as const;

const DIAGNOSTICS_ENV_KEYS = ["EMAIL_DIAGNOSTICS_TOKEN", "ADMIN_DIAGNOSTIC_TOKEN"] as const;

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

/** Compare bearer values without leaking lengths via `timingSafeEqual` on fixed-length digests. */
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

function envPresenceMap<const K extends readonly string[]>(
  keys: K
): Record<K[number], { present: boolean }> {
  const out = {} as Record<K[number], { present: boolean }>;
  for (const key of keys) {
    (out as Record<string, { present: boolean }>)[key] = {
      present: Boolean(process.env[key]?.trim()),
    };
  }
  return out;
}

type SendgridEnvPresence = Record<(typeof SENDGRID_ENV_KEYS)[number], { present: boolean }>;

function buildWarnings(sendgridEnv: SendgridEnvPresence): string[] {
  const warnings: string[] = [];
  if (!sendgridEnv.SENDGRID_API_KEY.present) {
    warnings.push("SENDGRID_API_KEY is not set; outbound SendGrid API calls will not authenticate.");
  }
  if (
    process.env.NODE_ENV === "production" &&
    !sendgridEnv.SENDGRID_WEBHOOK_PUBLIC_KEY.present &&
    !sendgridEnv.SENDGRID_WEBHOOK_VERIFICATION_KEY.present &&
    !sendgridEnv.SENDGRID_EVENT_WEBHOOK_PUBLIC_KEY.present
  ) {
    warnings.push(
      "Production: no SendGrid webhook verification public key env detected; signed Event Webhook verification may be unavailable."
    );
  }
  return warnings;
}

/**
 * REDDIRT-EMAIL-DIAGNOSTICS-ENV-1.0 — GET only. Env presence for SendGrid-related names; no sends, no SendGrid HTTP, no Prisma, no secret values or lengths in JSON.
 */
export async function GET(request: Request) {
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

  const sendgridEnv = envPresenceMap(SENDGRID_ENV_KEYS) as SendgridEnvPresence;
  const diagnosticsEnv = envPresenceMap(DIAGNOSTICS_ENV_KEYS);
  const warnings = buildWarnings(sendgridEnv);

  return NextResponse.json(
    {
      ok: true,
      route: "/api/admin/email-diagnostics",
      mode: "env_presence_only",
      sendgridEnv,
      diagnosticsEnv,
      warnings,
      nextRecommendedTests: [
        "POST /api/admin/email-diagnostics/sendgrid-auth-check",
        "POST /api/admin/email-diagnostics/sandbox-send",
      ],
    },
    { status: 200 }
  );
}
