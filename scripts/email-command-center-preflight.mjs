#!/usr/bin/env node
/**
 * EMAIL-GMAIL-OPS-HISTORY-1.3 + EMAIL-DB-RECONCILE-CONTACT-IMPORT-GATE-1.0
 * Email Command Center DB / migration / env preflight.
 * Never prints secret values or full DATABASE_URL (only present / masked length).
 *
 * Usage:
 *   node scripts/email-command-center-preflight.mjs
 *   node scripts/email-command-center-preflight.mjs --strict-gmail-env
 *
 * Exit:
 *   0 — DB reachable, gmailSyncState column present, all listed ECC migrations applied (and strict checks pass if --strict-gmail-env)
 *   1 — DATABASE_URL or DIRECT_URL missing, DNS/DB unreachable, column missing, any ECC migration missing, or strict Gmail env gaps
 */

import { lookup } from "node:dns/promises";
import { PrismaClient } from "@prisma/client";
import {
  EMAIL_COMMAND_CENTER_MIGRATION_DIRS,
  queryEmailCommandCenterMigrationsApplied,
} from "./lib/email-command-center-migrations.mjs";

const args = process.argv.slice(2);
const strictGmailEnv = args.includes("--strict-gmail-env");

function envPresent(key) {
  const v = process.env[key];
  return Boolean(typeof v === "string" && v.trim().length > 0);
}

function maskDbUrlHint() {
  const u = process.env.DATABASE_URL;
  if (!u || typeof u !== "string") return "absent";
  const t = u.trim();
  if (!t) return "absent";
  return `present (length ${t.length})`;
}

function maskDirectUrlHint() {
  const u = process.env.DIRECT_URL;
  if (!u || typeof u !== "string") return "absent";
  const t = u.trim();
  if (!t) return "absent";
  return `present (length ${t.length})`;
}

function parseDbUrlSafe() {
  const raw = process.env.DATABASE_URL;
  if (!raw || typeof raw !== "string" || !raw.trim()) return { ok: false };
  try {
    const u = new URL(raw.trim());
    return {
      ok: true,
      protocol: u.protocol.replace(/:$/, "") || "(none)",
      host: u.hostname || "",
      port: u.port || "5432",
    };
  } catch {
    return { ok: false };
  }
}

function parseDirectUrlSafe() {
  const raw = process.env.DIRECT_URL;
  if (!raw || typeof raw !== "string" || !raw.trim()) return { ok: false };
  try {
    const u = new URL(raw.trim());
    return {
      ok: true,
      protocol: u.protocol.replace(/:$/, "") || "(none)",
      host: u.hostname || "",
      port: u.port || "5432",
    };
  } catch {
    return { ok: false };
  }
}

function redactDbMessage(msg) {
  if (!msg || typeof msg !== "string") return "";
  return msg
    .replace(/postgresql:\/\/[^\s]+/gi, "[redacted]")
    .replace(/postgres:\/\/[^\s]+/gi, "[redacted]")
    .replace(/postgres\.[a-z0-9._-]{8,}/gi, "postgres.[redacted-ref]")
    .replace(/tenant\/user\s+postgres[^\s]*/gi, "tenant/user [redacted]")
    .slice(0, 220);
}

function clientIdPresent() {
  return (
    envPresent("GOOGLE_GMAIL_CLIENT_ID") ||
    envPresent("GOOGLE_CLIENT_ID") ||
    envPresent("GOOGLE_CALENDAR_CLIENT_ID")
  );
}

function clientSecretPresent() {
  return (
    envPresent("GOOGLE_GMAIL_CLIENT_SECRET") ||
    envPresent("GOOGLE_CLIENT_SECRET") ||
    envPresent("GOOGLE_CALENDAR_CLIENT_SECRET")
  );
}

function redirectPresent() {
  return envPresent("GOOGLE_GMAIL_REDIRECT_URI") || envPresent("NEXT_PUBLIC_SITE_URL");
}

function oauthStatePresent() {
  return envPresent("GMAIL_OAUTH_STATE_SECRET") || envPresent("ADMIN_SECRET");
}

const rows = [];

function row(label, ok, note = "") {
  rows.push({ label, ok: Boolean(ok), note });
}

async function columnExists(prisma) {
  const r = await prisma.$queryRaw`
    SELECT EXISTS (
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'StaffGmailAccount'
        AND column_name = 'gmailSyncState'
    ) AS ok;
  `;
  const first = Array.isArray(r) ? r[0] : null;
  return Boolean(first?.ok === true);
}

async function sendGridEventTableExists(prisma) {
  const r = await prisma.$queryRaw`
    SELECT EXISTS (
      SELECT 1
      FROM information_schema.tables
      WHERE table_schema = 'public'
        AND table_name = 'SendGridEvent'
    ) AS ok;
  `;
  const first = Array.isArray(r) ? r[0] : null;
  return Boolean(first?.ok === true);
}

async function main() {
  console.log("Email Command Center preflight (no secret values shown)\n");

  console.log("--- App build (not run in this script) ---");
  console.log(
    "  Migrations and DB reachability are not validated by `npm run check`. For a full gate before contact imports:"
  );
  console.log("  npm run email:contact-import:gate");
  console.log("  (runs prisma migrate deploy → this preflight → npm run check)\n");

  const dbUrlPresent = envPresent("DATABASE_URL");
  const directUrlPresent = envPresent("DIRECT_URL");
  console.log("--- Env (database) ---");
  console.log(`  DATABASE_URL set: ${dbUrlPresent ? "yes" : "no"} (${maskDbUrlHint()})`);
  console.log(
    `  DIRECT_URL set: ${directUrlPresent ? "yes" : "no"} (${maskDirectUrlHint()}) — required by prisma/schema.prisma (mirror DATABASE_URL for local; split per Supabase docs for pooler)`
  );

  const parsed = parseDbUrlSafe();
  const parsedDirect = parseDirectUrlSafe();
  if (parsed.ok) {
    console.log(`  DATABASE_URL parse: ok · protocol=${parsed.protocol} · host=${parsed.host} · port=${parsed.port}`);
  } else if (dbUrlPresent) {
    console.log("  DATABASE_URL parse: failed (string is not a valid URL)");
  } else {
    console.log("  DATABASE_URL parse: skipped (DATABASE_URL missing)");
  }
  if (directUrlPresent) {
    if (parsedDirect.ok) {
      console.log(`  DIRECT_URL parse: ok · protocol=${parsedDirect.protocol} · host=${parsedDirect.host} · port=${parsedDirect.port}`);
    } else {
      console.log("  DIRECT_URL parse: failed (string is not a valid URL)");
    }
  }

  row("DATABASE_URL set", dbUrlPresent, dbUrlPresent ? "" : "set DATABASE_URL for Prisma");
  row("DIRECT_URL set", directUrlPresent, directUrlPresent ? "" : "required — copy DATABASE_URL for local Docker; use Connect UI for Live RedDirt Supabase DB / hosted Supabase");

  row(
    "GOOGLE_CLIENT_ID (or GOOGLE_GMAIL_CLIENT_ID / GOOGLE_CALENDAR_CLIENT_ID)",
    clientIdPresent()
  );
  row(
    "GOOGLE_CLIENT_SECRET (or GOOGLE_GMAIL_CLIENT_SECRET / GOOGLE_CALENDAR_CLIENT_SECRET)",
    clientSecretPresent()
  );
  row("GOOGLE_GMAIL_REDIRECT_URI or NEXT_PUBLIC_SITE_URL", redirectPresent());
  row("GMAIL_TOKEN_ENCRYPTION_KEY", envPresent("GMAIL_TOKEN_ENCRYPTION_KEY"));
  row("GMAIL_OAUTH_STATE_SECRET or ADMIN_SECRET", oauthStatePresent());
  row("GOOGLE_PUBSUB_TOPIC (watch)", envPresent("GOOGLE_PUBSUB_TOPIC"));
  row(
    "GMAIL_PUBSUB_VERIFICATION_TOKEN or GOOGLE_PUBSUB_VERIFICATION_TOKEN (Pub/Sub push)",
    envPresent("GMAIL_PUBSUB_VERIFICATION_TOKEN") || envPresent("GOOGLE_PUBSUB_VERIFICATION_TOKEN")
  );
  row("GMAIL_WATCH_LABEL_IDS (optional)", true, envPresent("GMAIL_WATCH_LABEL_IDS") ? "set" : "optional default INBOX");
  row("GMAIL_WATCH_RENEWAL_DAYS (optional)", true, envPresent("GMAIL_WATCH_RENEWAL_DAYS") ? "set" : "optional default 1");

  console.log("\n--- Gmail-related env (yes/no) ---");
  for (const x of rows.slice(2)) {
    const mark = x.ok ? "yes" : "no";
    const tail = x.note ? `  (${x.note})` : "";
    console.log(`  ${x.label}: ${mark}${tail}`);
  }

  let dnsOk = false;
  let dnsDetail = "skipped";
  if (parsed.ok && parsed.host) {
    try {
      await lookup(parsed.host);
      dnsOk = true;
      dnsDetail = "lookup_ok";
    } catch (e) {
      dnsOk = false;
      dnsDetail = e instanceof Error ? e.code || e.message.slice(0, 80) : "lookup_failed";
    }
  } else {
    dnsDetail = dbUrlPresent ? "parse_failed" : "no_host";
  }

  console.log("\n--- DNS (DATABASE_URL host) ---");
  console.log(`  Resolves: ${dnsOk ? "yes" : "no"} (${dnsDetail})`);

  let dbReachable = false;
  let prismaQueryOk = false;
  let migrationColumnOk = false;
  let dbErrorSafe = "";
  let sendGridFoundationOk = false;
  let eccRows = [];
  let eccAllApplied = false;

  if (!dbUrlPresent) {
    console.log("\n--- Database connectivity ---");
    console.log("  DB connects: no (DATABASE_URL missing)");
    console.log("  Prisma query: skipped");
    console.log("\n--- Prisma migrations (Email Command Center checklist) ---");
    for (const name of EMAIL_COMMAND_CENTER_MIGRATION_DIRS) {
      console.log(`  ${name}: not verified (DB unreachable — not a schema failure)`);
    }
    console.log("\nPreflight FAILED: DATABASE_URL missing.");
    process.exit(1);
  }

  if (!parsed.ok) {
    console.log("\n--- Database connectivity ---");
    console.log("  DB connects: no (URL parse failed — fix DATABASE_URL shape)");
    console.log("\n--- Prisma migrations (Email Command Center checklist) ---");
    for (const name of EMAIL_COMMAND_CENTER_MIGRATION_DIRS) {
      console.log(`  ${name}: not verified (DATABASE_URL not parseable)`);
    }
    console.log("\nPreflight FAILED: DATABASE_URL is not a valid URL.");
    process.exit(1);
  }

  if (!directUrlPresent) {
    console.log("\nPreflight FAILED: DIRECT_URL missing.");
    console.log("  prisma/schema.prisma requires `directUrl = env(\"DIRECT_URL\")`.");
    console.log("  Local Docker: set DIRECT_URL to the same connection string as DATABASE_URL in `.env` (see `.env.example`).");
    console.log("  Live RedDirt Supabase DB: paste **Session** or **Direct** URI from that Supabase project’s Connect screen — see docs/deployment.md.");
    process.exit(1);
  }

  if (!parsedDirect.ok) {
    console.log("\nPreflight FAILED: DIRECT_URL is not a valid URL.");
    process.exit(1);
  }

  const prisma = new PrismaClient();
  try {
    await prisma.$queryRaw`SELECT 1`;
    prismaQueryOk = true;
    dbReachable = true;
    migrationColumnOk = await columnExists(prisma);
    try {
      eccRows = await queryEmailCommandCenterMigrationsApplied(prisma);
      eccAllApplied =
        eccRows.length === EMAIL_COMMAND_CENTER_MIGRATION_DIRS.length && eccRows.every((r) => r.applied);
    } catch {
      eccRows = [];
      eccAllApplied = false;
    }
    try {
      if (migrationColumnOk) {
        sendGridFoundationOk = await sendGridEventTableExists(prisma);
      }
    } catch {
      sendGridFoundationOk = false;
    }
  } catch (e) {
    dbReachable = false;
    prismaQueryOk = false;
    dbErrorSafe =
      e instanceof Error
        ? redactDbMessage(e.message)
        : "db_connect_failed";
  } finally {
    await prisma.$disconnect();
  }

  console.log("\n--- Database connectivity ---");
  console.log(`  DB connects (TCP + auth): ${dbReachable ? "yes" : "no"}`);
  console.log(`  Prisma can query (SELECT 1): ${prismaQueryOk ? "yes" : "no"}`);
  if (!dbReachable && dbErrorSafe) {
    console.log(`  Error (safe excerpt): ${dbErrorSafe}`);
  }

  console.log("\n--- Migrations applied (schema signals) ---");
  console.log(
    `  StaffGmailAccount.gmailSyncState column: ${migrationColumnOk ? "present" : dbReachable ? "MISSING — run prisma migrate deploy" : "not verified (no DB)"}`
  );

  console.log("\n--- Email Command Center migrations (_prisma_migrations) ---");
  if (!dbReachable) {
    for (const name of EMAIL_COMMAND_CENTER_MIGRATION_DIRS) {
      console.log(`  ${name}: not verified (DB unreachable — not a schema failure)`);
    }
  } else if (eccRows.length) {
    for (const r of eccRows) {
      console.log(`  ${r.name}: ${r.applied ? "applied" : "NOT applied"}`);
    }
  } else {
    for (const name of EMAIL_COMMAND_CENTER_MIGRATION_DIRS) {
      console.log(`  ${name}: not verified (query failed)`);
    }
  }

  const oauthCoreOk =
    clientIdPresent() &&
    clientSecretPresent() &&
    redirectPresent() &&
    envPresent("GMAIL_TOKEN_ENCRYPTION_KEY") &&
    oauthStatePresent();

  if (strictGmailEnv && !oauthCoreOk) {
    console.log("\nPreflight FAILED: --strict-gmail-env and OAuth core incomplete.");
    process.exit(1);
  }

  if (!dbReachable) {
    console.log(
      "\nPreflight FAILED: database unreachable — this is distinct from “migration missing”. `npm run check` can still exit 0; migrations were NOT verified."
    );
    process.exit(1);
  }

  if (!migrationColumnOk) {
    console.log(
      "\nPreflight FAILED: gmailSyncState column missing — run `npx prisma migrate deploy` against this database."
    );
    process.exit(1);
  }

  if (!eccAllApplied) {
    console.log(
      "\nPreflight FAILED: one or more Email Command Center migrations are not applied — run `npx prisma migrate deploy` from RedDirt/."
    );
    process.exit(1);
  }

  console.log(
    `\n--- SendGrid foundation (EMAIL-SENDGRID-FOUNDATION-1.0) — informational ---\n  SendGridEvent table: ${sendGridFoundationOk ? "present" : "MISSING (run migrate when ready)"}`
  );

  console.log(
    "\nPreflight OK: env present, DNS resolved, DB connected, Prisma queried, gmailSyncState present, and all listed Email Command Center migrations are applied."
  );
  console.log("Reminder: run `npm run check` separately — it does not substitute for migrate deploy.");
  process.exit(0);
}

main().catch((e) => {
  console.error("preflight unexpected error:", e instanceof Error ? redactDbMessage(e.message) : e);
  process.exit(1);
});
