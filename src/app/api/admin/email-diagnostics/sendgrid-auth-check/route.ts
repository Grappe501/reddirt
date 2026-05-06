import { createHmac, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const HMAC_LABEL = "reddirt-email-diagnostics-bearer-v1";

const SENDGRID_SCOPES_URL = "https://api.sendgrid.com/v3/scopes";
const SENDGRID_VERIFIED_SENDERS_URL = "https://api.sendgrid.com/v3/verified_senders?limit=100";

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

function getConfiguredFromEmail(): string | undefined {
  const candidates = [
    process.env.SENDGRID_FROM_EMAIL,
    process.env.SENDGRID_FROM,
    process.env.SENDGRID_SENDER_EMAIL,
    process.env.SENDGRID_DEFAULT_FROM_EMAIL,
  ];
  for (const v of candidates) {
    const t = v?.trim();
    if (t) return t.toLowerCase();
  }
  return undefined;
}

function parseScopesJson(text: string): string[] | null {
  try {
    const j = JSON.parse(text) as unknown;
    if (j && typeof j === "object" && "scopes" in j && Array.isArray((j as { scopes: unknown }).scopes)) {
      return (j as { scopes: string[] }).scopes.filter((s): s is string => typeof s === "string");
    }
  } catch {
    return null;
  }
  return null;
}

type VerifiedRow = { from_email?: unknown; verified?: unknown };

function parseVerifiedSendersJson(text: string): VerifiedRow[] | null {
  try {
    const j = JSON.parse(text) as unknown;
    if (j && typeof j === "object" && "results" in j && Array.isArray((j as { results: unknown }).results)) {
      return (j as { results: VerifiedRow[] }).results;
    }
  } catch {
    return null;
  }
  return null;
}

function analyzeScopes(scopes: string[]) {
  const hasMailSendScope = scopes.includes("mail.send");
  const hasSenderRelatedScope = scopes.some(
    (s) =>
      s.includes("sender") ||
      s.includes("verified_senders") ||
      s.includes("sender_verification") ||
      s.includes("whitelabel")
  );
  const hasUsefulReadScopes = scopes.some(
    (s) => s.endsWith(".read") || s.includes(".read.") || s === "user.account.read"
  );
  return { hasMailSendScope, hasSenderRelatedScope, hasUsefulReadScopes, scopeCount: scopes.length };
}

function matchConfiguredSender(
  configured: string | undefined,
  rows: VerifiedRow[]
): { verifiedSenderCount: number; matched: boolean; verified: boolean } {
  const verifiedSenderCount = rows.length;
  if (!configured) {
    return { verifiedSenderCount, matched: false, verified: false };
  }
  let matched = false;
  let verified = false;
  for (const row of rows) {
    const fe = typeof row.from_email === "string" ? row.from_email.trim().toLowerCase() : "";
    if (fe && fe === configured) {
      matched = true;
      if (row.verified === true) verified = true;
    }
  }
  return { verifiedSenderCount, matched, verified };
}

/**
 * REDDIRT-SENDGRID-AUTH-CHECK-1.0 — POST only. Read-only SendGrid API checks (scopes + verified senders). No mail send.
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
  if (!apiKey) {
    return NextResponse.json(
      {
        ok: false,
        route: "/api/admin/email-diagnostics/sendgrid-auth-check",
        mode: "sendgrid_auth_and_sender_check",
        error: {
          code: "SENDGRID_API_KEY_MISSING",
          status: 400,
          message: "SENDGRID_API_KEY is not configured in the server environment.",
        },
      },
      { status: 200 }
    );
  }

  const configuredFromEmail = getConfiguredFromEmail();
  const configuredFromEmailPresent = Boolean(configuredFromEmail);

  let scopesEndpointStatus = 0;
  let scopes: string[] = [];
  try {
    const res = await fetch(SENDGRID_SCOPES_URL, {
      method: "GET",
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    scopesEndpointStatus = res.status;
    const text = await res.text();
    const parsed = parseScopesJson(text);
    if (!res.ok || parsed === null) {
      const status = res.status === 401 || res.status === 403 ? res.status : res.status || 502;
      return NextResponse.json(
        {
          ok: false,
          route: "/api/admin/email-diagnostics/sendgrid-auth-check",
          mode: "sendgrid_auth_and_sender_check",
          error: {
            code: "SENDGRID_SCOPES_CHECK_FAILED",
            status,
            message:
              res.status === 401 || res.status === 403
                ? "SendGrid rejected the configured API key or permissions."
                : "SendGrid scopes request failed or returned an unexpected payload.",
          },
        },
        { status: 200 }
      );
    }
    scopes = parsed;
  } catch {
    return NextResponse.json(
      {
        ok: false,
        route: "/api/admin/email-diagnostics/sendgrid-auth-check",
        mode: "sendgrid_auth_and_sender_check",
        error: {
          code: "SENDGRID_SCOPES_CHECK_FAILED",
          status: 0,
          message: "Could not reach SendGrid scopes endpoint (network or TLS error).",
        },
      },
      { status: 200 }
    );
  }

  const scopeInfo = analyzeScopes(scopes);
  if (!scopeInfo.hasMailSendScope) {
    return NextResponse.json(
      {
        ok: false,
        route: "/api/admin/email-diagnostics/sendgrid-auth-check",
        mode: "sendgrid_auth_and_sender_check",
        sendgrid: {
          reachable: true,
          scopesEndpointStatus,
          verifiedSendersEndpointStatus: undefined,
          hasMailSendScope: false,
          scopeCount: scopeInfo.scopeCount,
          hasSenderRelatedScope: scopeInfo.hasSenderRelatedScope,
          hasUsefulReadScopes: scopeInfo.hasUsefulReadScopes,
          configuredFromEmailPresent,
          configuredFromEmailMatchedVerifiedSender: false,
          configuredFromEmailVerified: false,
        },
        error: {
          code: "SENDGRID_MISSING_MAIL_SEND_SCOPE",
          status: 403,
          message: "SendGrid API key is valid for scopes lookup but does not include mail.send.",
        },
        warnings: [],
        nextRecommendedTest: "POST /api/admin/email-diagnostics/sandbox-send",
      },
      { status: 200 }
    );
  }

  const warnings: string[] = [];
  let verifiedSendersEndpointStatus = 0;
  let verifiedSenderCount: number | undefined;
  let configuredFromEmailMatchedVerifiedSender = false;
  let configuredFromEmailVerified = false;

  try {
    const vsRes = await fetch(SENDGRID_VERIFIED_SENDERS_URL, {
      method: "GET",
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    verifiedSendersEndpointStatus = vsRes.status;
    const vsText = await vsRes.text();

    if (vsRes.status === 403) {
      warnings.push(
        "SendGrid scopes check passed, but verified sender lookup was forbidden. Sender verification may need to be confirmed in the SendGrid dashboard."
      );
    } else if (!vsRes.ok) {
      warnings.push(
        `SendGrid verified senders request returned HTTP ${vsRes.status}; sender match could not be evaluated.`
      );
    } else {
      const rows = parseVerifiedSendersJson(vsText);
      if (rows === null) {
        warnings.push("SendGrid verified senders response was not in the expected shape; sender match skipped.");
      } else {
        const m = matchConfiguredSender(configuredFromEmail, rows);
        verifiedSenderCount = m.verifiedSenderCount;
        configuredFromEmailMatchedVerifiedSender = m.matched;
        configuredFromEmailVerified = m.verified;
      }
    }
  } catch {
    warnings.push("Could not complete verified senders request (network or TLS error).");
    verifiedSendersEndpointStatus = 0;
  }

  const reachable = scopesEndpointStatus === 200;

  return NextResponse.json(
    {
      ok: true,
      route: "/api/admin/email-diagnostics/sendgrid-auth-check",
      mode: "sendgrid_auth_and_sender_check",
      sendgrid: {
        reachable,
        scopesEndpointStatus,
        verifiedSendersEndpointStatus,
        hasMailSendScope: scopeInfo.hasMailSendScope,
        scopeCount: scopeInfo.scopeCount,
        hasSenderRelatedScope: scopeInfo.hasSenderRelatedScope,
        hasUsefulReadScopes: scopeInfo.hasUsefulReadScopes,
        configuredFromEmailPresent,
        configuredFromEmailMatchedVerifiedSender,
        configuredFromEmailVerified,
        ...(verifiedSenderCount !== undefined ? { verifiedSenderCount } : {}),
      },
      warnings,
      nextRecommendedTest: "POST /api/admin/email-diagnostics/sandbox-send",
    },
    { status: 200 }
  );
}
