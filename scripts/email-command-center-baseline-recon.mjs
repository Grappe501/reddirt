#!/usr/bin/env node
/**
 * EMAIL-COMMAND-CENTER-BASELINE-RECON-1.0 — read-only hosted DB posture for Prisma baseline decisions.
 * Never prints DATABASE_URL values, passwords, tokens, or keys. Names + counts only.
 *
 * Usage (from RedDirt/):
 *   node scripts/email-command-center-baseline-recon.mjs
 */

import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { PrismaClient } from "@prisma/client";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REDDIRT_ROOT = join(__dirname, "..");
process.chdir(REDDIRT_ROOT);

try {
  if (typeof process.loadEnvFile === "function") {
    const envPath = join(REDDIRT_ROOT, ".env");
    if (existsSync(envPath)) process.loadEnvFile(envPath);
  }
} catch {
  /* ignore */
}

/** Prisma/Postgres table names as created by RedDirt migrations (quoted identifiers). */
const KEY_ECC_TABLES = [
  "User",
  "VolunteerProfile",
  "ContactPreference",
  "StaffGmailAccount",
  "SendGridEvent",
  "EmailContactImportBatch",
  "EmailContactImportRow",
  "EmailContactImportDecision",
  "EmailAudienceDefinition",
  "EmailAudiencePreviewRun",
  "MessageStudioDraft",
  "MessageStudioDraftRevision",
  "SendGridContactSyncRun",
  "EmailSendExecution",
  "EmailSendRecipient",
  "EmailSendApproval",
];

function envPresenceOnly() {
  const db = process.env.DATABASE_URL;
  const direct = process.env.DIRECT_URL;
  return {
    DATABASE_URL: typeof db === "string" && db.trim() ? `present (length ${db.trim().length})` : "absent",
    DIRECT_URL: typeof direct === "string" && direct.trim() ? `present (length ${direct.trim().length})` : "absent",
  };
}

async function main() {
  console.log("Email Command Center — baseline recon (read-only, no secrets)\n");
  console.log("Working directory:", REDDIRT_ROOT.replace(/\\/g, "/"));
  console.log("Env (names only):");
  const ep = envPresenceOnly();
  console.log(`  DATABASE_URL: ${ep.DATABASE_URL}`);
  console.log(`  DIRECT_URL: ${ep.DIRECT_URL}`);
  console.log("");

  if (!process.env.DATABASE_URL?.trim()) {
    console.log("ERROR: DATABASE_URL not set — cannot connect.\n");
    process.exit(1);
  }

  const prisma = new PrismaClient();
  try {
    await prisma.$queryRaw`SELECT 1`;

    const migTableRows = await prisma.$queryRaw`
      SELECT EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_schema = 'public'
          AND table_name = '_prisma_migrations'
      ) AS exists
    `;
    const prismaMigrationsTableExists = Boolean(migTableRows[0]?.exists);

    let prismaMigrationRowCount = 0;
    if (prismaMigrationsTableExists) {
      const cnt = await prisma.$queryRaw`
        SELECT COUNT(*)::bigint AS c FROM public._prisma_migrations
      `;
      prismaMigrationRowCount = Number(cnt[0]?.c ?? 0);
    }

    const publicTables = await prisma.$queryRaw`
      SELECT tablename AS name
      FROM pg_tables
      WHERE schemaname = 'public'
      ORDER BY tablename
    `;
    const publicNames = publicTables.map((r) => r.name);

    const authTables = await prisma.$queryRaw`
      SELECT tablename AS name
      FROM pg_tables
      WHERE schemaname = 'auth'
      ORDER BY tablename
    `;
    const authNames = authTables.map((r) => r.name);

    /** @type {Record<string, boolean>} */
    const tablePresence = {};
    for (const t of KEY_ECC_TABLES) {
      tablePresence[t] = publicNames.includes(t);
    }

    let hasGmailSyncState = false;
    let hasGlobalUnsubscribeAt = false;
    let hasEmailOptInStatus = false;

    if (tablePresence.StaffGmailAccount) {
      const cols = await prisma.$queryRaw`
        SELECT column_name
        FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'StaffGmailAccount'
      `;
      const cn = new Set(cols.map((r) => r.column_name));
      hasGmailSyncState = cn.has("gmailSyncState");
    }

    if (tablePresence.ContactPreference) {
      const cols = await prisma.$queryRaw`
        SELECT column_name
        FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'ContactPreference'
      `;
      const cn = new Set(cols.map((r) => r.column_name));
      hasGlobalUnsubscribeAt = cn.has("globalUnsubscribeAt");
      hasEmailOptInStatus = cn.has("emailOptInStatus");
    }

    console.log("--- public._prisma_migrations ---");
    console.log(`  Table exists: ${prismaMigrationsTableExists ? "yes" : "no"}`);
    console.log(`  Row count: ${prismaMigrationsTableExists ? prismaMigrationRowCount : "n/a"}`);
    console.log("");

    console.log(`--- public tables (${publicNames.length}) — names only ---`);
    for (const n of publicNames) console.log(`  ${n}`);
    console.log("");

    console.log(`--- auth tables (${authNames.length}) — names only ---`);
    for (const n of authNames) console.log(`  ${n}`);
    console.log("");

    console.log("--- Key RedDirt / ECC tables (public) ---");
    for (const t of KEY_ECC_TABLES) {
      console.log(`  ${t}: ${tablePresence[t] ? "present" : "absent"}`);
    }
    console.log("");

    console.log("--- Key columns ---");
    console.log(
      `  StaffGmailAccount.gmailSyncState: ${tablePresence.StaffGmailAccount ? (hasGmailSyncState ? "present" : "ABSENT") : "n/a (table missing)"}`,
    );
    console.log(
      `  ContactPreference.globalUnsubscribeAt: ${tablePresence.ContactPreference ? (hasGlobalUnsubscribeAt ? "present" : "ABSENT") : "n/a (table missing)"}`,
    );
    console.log(
      `  ContactPreference.emailOptInStatus: ${tablePresence.ContactPreference ? (hasEmailOptInStatus ? "present" : "ABSENT") : "n/a (table missing)"}`,
    );
    console.log("");

    const hasUser = tablePresence.User;
    const hasVolunteer = tablePresence.VolunteerProfile;
    const hasContactPref = tablePresence.ContactPreference;
    const coreRedDirtSignal = hasUser || hasVolunteer || hasContactPref;

    const eccBundle = [
      "EmailSendExecution",
      "EmailSendApproval",
      "EmailSendRecipient",
      "EmailContactImportBatch",
      "MessageStudioDraft",
      "EmailAudienceDefinition",
      "SendGridEvent",
      "StaffGmailAccount",
    ];
    const eccPresentCount = eccBundle.filter((t) => tablePresence[t]).length;
    const eccAllPresent = eccBundle.every((t) => tablePresence[t]);
    const migHistoryEmpty = !prismaMigrationsTableExists || prismaMigrationRowCount === 0;

    /** Non-ECC public tables common in RedDirt / voter-file lanes (schema exists → not “greenfield”). */
    function hasLegacyOrParquetPublicSignal(names) {
      return names.some(
        (n) =>
          n.startsWith("import_") ||
          n.startsWith("voter_") ||
          n === "petitions" ||
          n.startsWith("initiative_") ||
          n.startsWith("review_"),
      );
    }

    const legacyPublicSignal = hasLegacyOrParquetPublicSignal(publicNames);

    /** Heuristic: very light public schema, no app/ECC/legacy signal — often greenfield + Supabase auth side. */
    const onlyTrivialPublic =
      publicNames.length <= 12 &&
      !hasUser &&
      !tablePresence.EmailSendExecution &&
      !tablePresence.EmailContactImportBatch &&
      !tablePresence.StaffGmailAccount &&
      !legacyPublicSignal &&
      !eccPresentCount;

    console.log("=== Safe recommendation (heuristic — verify with team) ===\n");

    console.log("  DO NOT BASELINE BLINDLY — never mark all migrations applied without proving history matches this database.");
    console.log("  DO NOT db push / reset / drop — production data may already exist.\n");

    let primary = "REVIEW_MANUALLY — compare recon output to `prisma/migrations` and steered baseline plan.";

    if (migHistoryEmpty && onlyTrivialPublic) {
      primary =
        "EMPTY/NEAR EMPTY DB — use migrate deploy on clean DB (after confirming this is the intended empty Supabase public schema).";
    } else if (migHistoryEmpty) {
      primary =
        "EXISTING REDDIRT DB WITHOUT MIGRATION HISTORY — requires baseline plan (e.g. prisma migrate resolve after DBA review; see runbook P3005 / baseline tree).";
    } else if (prismaMigrationsTableExists && prismaMigrationRowCount > 0 && coreRedDirtSignal && (!eccAllPresent || !hasGmailSyncState)) {
      primary =
        "PARTIAL ECC DB — baseline earlier migrations only, then deploy pending ECC migrations (steered plan — no blind `migrate resolve`).";
    } else if (prismaMigrationsTableExists && prismaMigrationRowCount > 0 && eccAllPresent && hasGmailSyncState) {
      primary =
        "Schema largely complete — run `npx prisma migrate status` / deploy; if P3005 persists, migration history still misaligned (baseline tree).";
    }

    console.log(`  ${primary}\n`);

    console.log("Next: see docs/EMAIL_PRODUCTION_MIGRATION_RUNBOOK.md — baseline decision tree and P3005.");
    console.log("");
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    const safe = msg
      .replace(/postgresql:\/\/[^\s"'<>]+/gi, "[redacted]")
      .replace(/postgres:\/\/[^\s"'<>]+/gi, "[redacted]")
      .slice(0, 500);
    console.error("ERROR (redacted):", safe);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
