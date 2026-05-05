#!/usr/bin/env node
/**
 * EMAIL-GMAIL-OPS-HISTORY-1.3 — Email Command Center DB / migration preflight.
 * Never prints secret values or full DATABASE_URL (only present / masked length).
 *
 * Usage:
 *   node scripts/email-command-center-preflight.mjs
 *   node scripts/email-command-center-preflight.mjs --strict-gmail-env
 *
 * Exit:
 *   0 — DB reachable and gmailSyncState column present (and strict checks pass if --strict-gmail-env)
 *   1 — DATABASE_URL missing, DB unreachable, column missing, or strict Gmail env gaps
 */

import { PrismaClient } from "@prisma/client";

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

  const dbUrlPresent = envPresent("DATABASE_URL");
  row("DATABASE_URL set", dbUrlPresent, dbUrlPresent ? "" : "set DATABASE_URL for Prisma");
  console.log(`  DATABASE_URL: ${maskDbUrlHint()}`);

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
  for (const x of rows.slice(1)) {
    const mark = x.ok ? "yes" : "no";
    const tail = x.note ? `  (${x.note})` : "";
    console.log(`  ${x.label}: ${mark}${tail}`);
  }

  let dbReachable = false;
  let migrationColumnOk = false;
  let dbErrorSafe = "";
  let sendGridFoundationOk = false;

  if (!dbUrlPresent) {
    console.log("\n--- Database ---");
    console.log("  DB reachable: no (DATABASE_URL missing)");
    console.log("  gmailSyncState column: migration not verified (no connection)");
    console.log("\nPreflight FAILED: DATABASE_URL missing.");
    process.exit(1);
  }

  const prisma = new PrismaClient();
  try {
    await prisma.$queryRaw`SELECT 1`;
    dbReachable = true;
    migrationColumnOk = await columnExists(prisma);
    try {
      if (migrationColumnOk) {
        sendGridFoundationOk = await sendGridEventTableExists(prisma);
      }
    } catch {
      sendGridFoundationOk = false;
    }
  } catch (e) {
    dbReachable = false;
    dbErrorSafe =
      e instanceof Error
        ? e.message.replace(/ postgres\.[a-zA-Z0-9._-]+/gi, " [redacted-host]").slice(0, 200)
        : "db_connect_failed";
  } finally {
    await prisma.$disconnect();
  }

  console.log("\n--- Database ---");
  console.log(`  DB reachable: ${dbReachable ? "yes" : "no"}`);
  if (!dbReachable && dbErrorSafe) {
    console.log(`  Error (safe excerpt): ${dbErrorSafe}`);
  }
  console.log(
    `  StaffGmailAccount.gmailSyncState column: ${migrationColumnOk ? "present" : dbReachable ? "MISSING (run migrations)" : "migration not verified"}`
  );

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
      "\nPreflight FAILED: database unreachable. `npm run check` can still exit 0 — migrations were NOT verified."
    );
    process.exit(1);
  }

  if (!migrationColumnOk) {
    console.log(
      "\nPreflight FAILED: gmailSyncState column missing — run `npx prisma migrate deploy` against this database."
    );
    process.exit(1);
  }

  console.log(
    `\n--- SendGrid foundation (EMAIL-SENDGRID-FOUNDATION-1.0) — informational ---\n  SendGridEvent table: ${sendGridFoundationOk ? "present" : "MISSING (run migrate when ready)"}`
  );

  console.log(
    "\nPreflight OK: DB reachable and gmailSyncState present. (Run `npx prisma migrate deploy && npm run check` when you need both.)"
  );
  process.exit(0);
}

main().catch((e) => {
  console.error("preflight unexpected error:", e instanceof Error ? e.message.slice(0, 200) : e);
  process.exit(1);
});
