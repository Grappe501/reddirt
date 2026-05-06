/**
 * EMAIL-HOSTED-DB-READINESS-ASSISTANT-1.0 — server-only env surface for operator UI.
 * Never reads or returns connection string values; hostnames only when parse succeeds.
 */

export type DbConnectionParseStatus = "unset" | "invalid" | "ok";

export type HostedDbTargetClassification =
  | "no_database_url"
  | "invalid_database_url"
  | "local_loopback"
  | "remote_supabase"
  | "remote_other_postgres";

export type HostedDbOperatorGateExtension = {
  databaseUrlPresent: boolean;
  directUrlPresent: boolean;
  databaseUrlParseStatus: DbConnectionParseStatus;
  directUrlParseStatus: DbConnectionParseStatus;
  /** Lowercase hostname from DATABASE_URL when parse OK — no userinfo path or query. */
  databaseUrlHostname: string | null;
  directUrlHostname: string | null;
  hostedDbTargetClassification: HostedDbTargetClassification;
  /** From `db.<ref>.supabase.co` only — masked ref for “wrong project?” sanity (not a secret). */
  supabaseProjectRefMasked: string | null;
};

export function parseConnectionStringHostname(raw: string | undefined): {
  present: boolean;
  parseStatus: DbConnectionParseStatus;
  hostname: string | null;
} {
  const s = raw?.trim();
  if (!s) return { present: false, parseStatus: "unset", hostname: null };
  try {
    const normalized = s.replace(/^postgresql:/i, "postgres:");
    const u = new URL(normalized);
    const h = u.hostname.toLowerCase();
    if (!h) return { present: true, parseStatus: "invalid", hostname: null };
    return { present: true, parseStatus: "ok", hostname: h };
  } catch {
    return { present: true, parseStatus: "invalid", hostname: null };
  }
}

function maskProjectRef(ref: string): string {
  if (ref.length <= 8) return `${ref.slice(0, 2)}…`;
  return `${ref.slice(0, 4)}…${ref.slice(-3)}`;
}

/** `db.<ref>.supabase.co` → project ref (public id segment, not a password). */
export function extractSupabaseDbProjectRef(hostname: string | null): string | null {
  if (!hostname) return null;
  const m = hostname.match(/^db\.([a-z0-9]{15,})\.supabase\.co$/i);
  return m?.[1] ?? null;
}

function isSupabaseStyleHost(hostname: string | null): boolean {
  if (!hostname) return false;
  return hostname.endsWith(".supabase.co") || hostname.includes("pooler.supabase.com");
}

export function classifyHostedDbTarget(args: {
  databaseUrlHostKind: "loopback" | "hostname" | "unset";
  dbParse: { present: boolean; parseStatus: DbConnectionParseStatus; hostname: string | null };
}): HostedDbTargetClassification {
  if (!args.dbParse.present) return "no_database_url";
  if (args.dbParse.parseStatus === "invalid") return "invalid_database_url";
  if (args.databaseUrlHostKind === "loopback") return "local_loopback";
  if (isSupabaseStyleHost(args.dbParse.hostname)) return "remote_supabase";
  if (args.databaseUrlHostKind === "hostname") return "remote_other_postgres";
  return "remote_other_postgres";
}

export function buildHostedDbOperatorGateExtension(
  databaseUrlHostKind: "loopback" | "hostname" | "unset",
): HostedDbOperatorGateExtension {
  const dbParse = parseConnectionStringHostname(process.env.DATABASE_URL);
  const directParse = parseConnectionStringHostname(process.env.DIRECT_URL);
  const hostedDbTargetClassification = classifyHostedDbTarget({ databaseUrlHostKind, dbParse });
  const ref = extractSupabaseDbProjectRef(dbParse.hostname);
  return {
    databaseUrlPresent: dbParse.present,
    directUrlPresent: directParse.present,
    databaseUrlParseStatus: dbParse.present ? dbParse.parseStatus : "unset",
    directUrlParseStatus: directParse.present ? directParse.parseStatus : "unset",
    databaseUrlHostname: dbParse.hostname,
    directUrlHostname: directParse.hostname,
    hostedDbTargetClassification,
    supabaseProjectRefMasked: ref ? maskProjectRef(ref) : null,
  };
}

export function hostedDbTargetClassificationLabel(c: HostedDbTargetClassification): string {
  const m: Record<HostedDbTargetClassification, string> = {
    no_database_url: "No DATABASE_URL — Prisma target unset",
    invalid_database_url: "DATABASE_URL present but not parseable as a URL",
    local_loopback: "Local loopback Postgres (typical Docker Compose on this machine)",
    remote_supabase: "Remote Supabase-style Postgres host",
    remote_other_postgres: "Remote non-loopback Postgres host (verify project/provider)",
  };
  return m[c];
}
