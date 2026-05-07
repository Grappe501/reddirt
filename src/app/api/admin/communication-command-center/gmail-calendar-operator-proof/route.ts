import { createHmac, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { getGmailCalendarOperatorProof } from "@/lib/communication-command-center/gmail-calendar-operator-proof";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const HMAC_LABEL = "reddirt-email-diagnostics-bearer-v1";

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
  const digest = (value: string) => createHmac("sha256", HMAC_LABEL).update(value, "utf8").digest();
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

/** REDDIRT-GMAIL-CALENDAR-OAUTH-OPERATOR-HOSTED-PROOF-1.0 — GET only; read-only JSON; no Google I/O or sends. */
export async function GET(request: Request) {
  const configured = getConfiguredDiagnosticsSecret();
  if (!configured) {
    return NextResponse.json({ ok: false, error: "diagnostics_token_not_configured" }, { status: 503 });
  }

  const bearer = parseBearerToken(request);
  if (bearer === "missing" || bearer === "invalid_scheme") {
    return NextResponse.json({ ok: false, error: "missing_authorization" }, { status: 401 });
  }

  if (!timingSafeBearerMatch(configured.secret, bearer)) {
    return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
  }

  const body = await getGmailCalendarOperatorProof();
  return NextResponse.json(body, { status: 200 });
}
