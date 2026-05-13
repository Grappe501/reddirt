#!/usr/bin/env node
/**
 * inspect-core-schema-drift.cjs — read-only Postgres inspection for User / County / VoterRecord drift.
 * Loads .env via Node 20+ loadEnvFile when available; never prints DATABASE_URL or secrets.
 *
 * Usage (from RedDirt/): node scripts/inspect-core-schema-drift.cjs
 */

"use strict";

const { existsSync } = require("fs");
const path = require("path");
const { PrismaClient } = require("@prisma/client");

const REDDIRT_ROOT = path.join(__dirname, "..");
process.chdir(REDDIRT_ROOT);

try {
  if (typeof process.loadEnvFile === "function") {
    const envPath = path.join(REDDIRT_ROOT, ".env");
    if (existsSync(envPath)) process.loadEnvFile(envPath);
  }
} catch {
  /* ignore */
}

const CORE_TABLES = ["User", "County", "VoterRecord"];

/** ECC / contact / send-related tables for row counts (allowlist). */
const ROW_COUNT_TABLES = [
  "VolunteerProfile",
  "ContactPreference",
  "StaffGmailAccount",
  "EmailContactProfile",
  "RelationalContact",
  "CampaignEvent",
  "CalendarSource",
  "EmailContactImportBatch",
  "EmailSendExecution",
  "EmailSendRecipient",
  "EmailSendApproval",
];

/**
 * Whitelisted orphan checks: childTable.childCol -> parentTable.parentCol
 * @type {{ childTable: string, childCol: string, parentTable: string, parentCol: string, notes: string }[]}
 */
const ALLOW_IDENT = /^[A-Za-z][A-Za-z0-9_]*$/;

function assertIdent(name) {
  if (!ALLOW_IDENT.test(name)) throw new Error(`Invalid SQL identifier: ${name}`);
}

const ORPHAN_CHECKS = [
  {
    childTable: "VolunteerProfile",
    childCol: "userId",
    parentTable: "User",
    parentCol: "id",
    notes: "VolunteerProfile.userId → User.id",
  },
  {
    childTable: "ContactPreference",
    childCol: "userId",
    parentTable: "User",
    parentCol: "id",
    notes: "ContactPreference.userId → User.id (nullable)",
  },
  {
    childTable: "StaffGmailAccount",
    childCol: "userId",
    parentTable: "User",
    parentCol: "id",
    notes: "StaffGmailAccount.userId → User.id",
  },
  {
    childTable: "EmailContactProfile",
    childCol: "userId",
    parentTable: "User",
    parentCol: "id",
    notes: "EmailContactProfile.userId → User.id (nullable)",
  },
  {
    childTable: "CountyVoterMetrics",
    childCol: "countyId",
    parentTable: "County",
    parentCol: "id",
    notes: "CountyVoterMetrics.countyId → County.id",
  },
  {
    childTable: "VoterRecord",
    childCol: "countyId",
    parentTable: "County",
    parentCol: "id",
    notes: "VoterRecord.countyId → County.id",
  },
  {
    childTable: "CommunicationIdentity",
    childCol: "voterRecordId",
    parentTable: "VoterRecord",
    parentCol: "id",
    notes: "CommunicationIdentity.voterRecordId → VoterRecord.id (nullable)",
  },
];

function envPresence() {
  const db = process.env.DATABASE_URL;
  const direct = process.env.DIRECT_URL;
  return {
    DATABASE_URL:
      typeof db === "string" && db.trim() ? `present (length ${db.trim().length})` : "absent",
    DIRECT_URL:
      typeof direct === "string" && direct.trim()
        ? `present (length ${direct.trim().length})`
        : "absent",
  };
}

/**
 * @param {import('@prisma/client').PrismaClient} prisma
 * @param {string} schema
 * @param {string} table
 */
async function tableExists(prisma, schema, table) {
  const rows = await prisma.$queryRaw`
    SELECT 1 AS ok
    FROM information_schema.tables
    WHERE table_schema = ${schema}
      AND table_name = ${table}
    LIMIT 1
  `;
  return rows.length > 0;
}

/**
 * @param {import('@prisma/client').PrismaClient} prisma
 * @param {string} table
 */
async function safeCount(prisma, table) {
  assertIdent(table);
  if (!ROW_COUNT_TABLES.includes(table)) {
    throw new Error(`Row count table not allowlisted: ${table}`);
  }
  const rows = await prisma.$queryRawUnsafe(`SELECT COUNT(*)::bigint AS c FROM "public"."${table}"`);
  return Number(rows[0]?.c ?? 0);
}

/**
 * @param {import('@prisma/client').PrismaClient} prisma
 * @param {{ childTable: string, childCol: string, parentTable: string, parentCol: string, notes: string }} spec
 */
async function orphanCount(prisma, spec) {
  const { childTable, childCol, parentTable, parentCol } = spec;
  assertIdent(childTable);
  assertIdent(childCol);
  assertIdent(parentTable);
  assertIdent(parentCol);
  const childOk = await tableExists(prisma, "public", childTable);
  const parentOk = await tableExists(prisma, "public", parentTable);
  if (!childOk) {
    return { status: "child_table_missing", count: null, parentExists: parentOk };
  }
  if (!parentOk) {
    const q = `SELECT COUNT(*)::bigint AS c FROM "public"."${childTable}" t WHERE t."${childCol}" IS NOT NULL`;
    const rows = await prisma.$queryRawUnsafe(q);
    return {
      status: "parent_table_missing",
      count: Number(rows[0]?.c ?? 0),
      parentExists: false,
    };
  }
  const sql = `
    SELECT COUNT(*)::bigint AS c
    FROM "public"."${childTable}" t
    WHERE t."${childCol}" IS NOT NULL
      AND NOT EXISTS (
        SELECT 1 FROM "public"."${parentTable}" p WHERE p."${parentCol}" = t."${childCol}"
      )
  `;
  const rows = await prisma.$queryRawUnsafe(sql);
  return {
    status: "ok",
    count: Number(rows[0]?.c ?? 0),
    parentExists: true,
  };
}

async function main() {
  console.log("Core schema drift inspection (read-only, no secrets)\n");
  console.log("Working directory:", REDDIRT_ROOT.replace(/\\/g, "/"));
  const ep = envPresence();
  console.log("Env (names only):");
  console.log("  DATABASE_URL:", ep.DATABASE_URL);
  console.log("  DIRECT_URL:", ep.DIRECT_URL);
  console.log("");

  if (!process.env.DATABASE_URL?.trim()) {
    console.error("ERROR: DATABASE_URL not set.");
    process.exit(1);
  }

  const prisma = new PrismaClient();

  try {
    await prisma.$queryRaw`SELECT 1`;

    console.log("=== Core tables present (public) ===\n");
    for (const t of CORE_TABLES) {
      const ok = await tableExists(prisma, "public", t);
      console.log(`  "${t}": ${ok ? "YES" : "NO"}`);
    }
    console.log("");

    console.log("=== Row counts (allowlisted public tables) ===\n");
    for (const t of ROW_COUNT_TABLES) {
      if (await tableExists(prisma, "public", t)) {
        const c = await safeCount(prisma, t);
        console.log(`  "${t}": ${c} rows`);
      } else {
        console.log(`  "${t}": (table missing)`);
      }
    }
    console.log("");

    console.log("=== Orphan reference checks (non-null FKs with no parent row) ===\n");
    for (const spec of ORPHAN_CHECKS) {
      const r = await orphanCount(prisma, spec);
      if (r.status === "child_table_missing") {
        console.log(`  ${spec.notes}`);
        console.log(`    skip — child table missing`);
      } else if (r.status === "parent_table_missing") {
        console.log(`  ${spec.notes}`);
        console.log(
          `    PARENT MISSING — rows with non-null ${spec.childCol}: ${r.count} (cannot verify FK target)`,
        );
      } else {
        console.log(`  ${spec.notes}`);
        console.log(`    orphan rows: ${r.count}`);
      }
    }
    console.log("");

    const migExists = await tableExists(prisma, "public", "_prisma_migrations");
    console.log("=== _prisma_migrations (applied_steps_count = 0) ===\n");
    if (!migExists) {
      console.log("  table public._prisma_migrations: MISSING\n");
    } else {
      const zeroSteps = await prisma.$queryRaw`
        SELECT migration_name, finished_at, started_at, applied_steps_count, rolled_back_at
        FROM public._prisma_migrations
        WHERE COALESCE(applied_steps_count, 0) = 0
        ORDER BY migration_name
      `;
      if (zeroSteps.length === 0) {
        console.log("  (no rows with applied_steps_count = 0)\n");
      } else {
        for (const row of zeroSteps) {
          console.log(
            `  ${row.migration_name} | finished_at=${row.finished_at} | started_at=${row.started_at} | rolled_back_at=${row.rolled_back_at}`,
          );
        }
        console.log("");
      }

      const failedIntel = await prisma.$queryRaw`
        SELECT migration_name, finished_at, started_at, applied_steps_count, logs
        FROM public._prisma_migrations
        WHERE migration_name = '20260516143000_communication_intelligence_ingest'
        LIMIT 1
      `;
      if (failedIntel.length > 0) {
        console.log("=== Row: 20260516143000_communication_intelligence_ingest ===\n");
        const r = failedIntel[0];
        console.log(
          `  finished_at=${r.finished_at} applied_steps_count=${r.applied_steps_count} started_at=${r.started_at}`,
        );
        const logStr = r.logs ? String(r.logs).slice(0, 400) : "";
        if (logStr) console.log(`  logs (truncated): ${logStr.replace(/\s+/g, " ").trim()}`);
        console.log("");
      }
    }

    console.log("Next: docs/CORE_SCHEMA_DRIFT_REPAIR_PLAN.md");
    console.log("Draft DDL (not applied): docs/core-schema-drift-repair-draft.sql");
    console.log("");
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    const safe = msg
      .replace(/postgresql:\/\/[^\s"'<>]+/gi, "[redacted]")
      .replace(/postgres:\/\/[^\s"'<>]+/gi, "[redacted]")
      .slice(0, 500);
    console.error("ERROR (redacted):", safe);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
