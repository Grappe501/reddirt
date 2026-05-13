#!/usr/bin/env node
/**
 * EMAIL-COMMAND-CENTER-BASELINE-PLAN-1.0 — read-only collision + ECC readiness for synthetic baseline decisions.
 * Never prints DATABASE_URL values, passwords, tokens, or keys.
 *
 * Heuristic SQL parse (regex): review edge cases with a DBA before resolve/deploy.
 *
 * Usage (from RedDirt/):
 *   node scripts/email-command-center-baseline-plan.mjs
 */

import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { PrismaClient } from "@prisma/client";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REDDIRT_ROOT = join(__dirname, "..");
const MIGRATIONS_DIR = join(REDDIRT_ROOT, "prisma", "migrations");
const DOCS_DIR = join(REDDIRT_ROOT, "docs");
const JSON_OUT = join(DOCS_DIR, "email-baseline-plan-output.json");
const MD_OUT = join(DOCS_DIR, "EMAIL_BASELINE_PLAN.md");

const SYNTHETIC_FOLDER = "00000000000000_existing_supabase_legacy_baseline";

process.chdir(REDDIRT_ROOT);

try {
  if (typeof process.loadEnvFile === "function") {
    const envPath = join(REDDIRT_ROOT, ".env");
    if (existsSync(envPath)) process.loadEnvFile(envPath);
  }
} catch {
  /* ignore */
}

/** Core tables called out for Kelly / volunteer flows (not exhaustive schema). */
const CORE_REDDIRT_TABLES = ["User", "VolunteerProfile", "ContactPreference"];

/** ECC tables from Email Command Center recon checklist. */
const ECC_TABLES = [
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

function tableKey(schema, table) {
  return `${schema}.${table}`;
}

/**
 * @param {string} sql
 * @returns {{
 *   creates: { schema: string, table: string }[],
 *   alters: { schema: string, table: string }[],
 *   types: { schema: string, name: string }[],
 *   indexes: { name: string, schema: string, onTable: string }[],
 * }}
 */
function parseMigrationSql(sql) {
  /** @type {{ schema: string, table: string }[]} */
  const creates = [];
  /** @type {{ schema: string, table: string }[]} */
  const alters = [];
  /** @type {{ schema: string, name: string }[]} */
  const types = [];
  /** @type {{ name: string, schema: string, onTable: string }[]} */
  const indexes = [];

  const createTableRe =
    /CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?(?:(public|auth)\.)?"([^"]+)"\s*\(/gi;
  let m;
  while ((m = createTableRe.exec(sql)) !== null) {
    const schema = (m[1] || "public").toLowerCase();
    creates.push({ schema, table: m[2] });
  }

  const alterTableRe = /ALTER\s+TABLE\s+(?:(public|auth)\.)?"([^"]+)"\s+/gi;
  while ((m = alterTableRe.exec(sql)) !== null) {
    const schema = (m[1] || "public").toLowerCase();
    alters.push({ schema, table: m[2] });
  }

  const createTypeRe = /CREATE\s+TYPE\s+(?:(public|auth)\.)?"([^"]+)"\s+AS\s+ENUM/gi;
  while ((m = createTypeRe.exec(sql)) !== null) {
    const schema = (m[1] || "public").toLowerCase();
    types.push({ schema, name: m[2] });
  }

  const createIndexRe =
    /CREATE\s+(?:UNIQUE\s+)?INDEX\s+(?:IF\s+NOT\s+EXISTS\s+)?"([^"]+)"\s+ON\s+(?:(public|auth)\.)?"([^"]+)"/gi;
  while ((m = createIndexRe.exec(sql)) !== null) {
    const idxName = m[1];
    const schema = (m[2] || "public").toLowerCase();
    const onTable = m[3];
    indexes.push({ name: idxName, schema, onTable });
  }

  return { creates, alters, types, indexes };
}

function uniqueMigrateDirs() {
  const entries = readdirSync(MIGRATIONS_DIR, { withFileTypes: true });
  return entries
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .filter((name) => existsSync(join(MIGRATIONS_DIR, name, "migration.sql")))
    .sort();
}

async function main() {
  console.log("Email Command Center — baseline plan (read-only, no secrets)\n");
  console.log("Working directory:", REDDIRT_ROOT.replace(/\\/g, "/"));
  const ep = envPresenceOnly();
  console.log("Env (names only):");
  console.log(`  DATABASE_URL: ${ep.DATABASE_URL}`);
  console.log(`  DIRECT_URL: ${ep.DIRECT_URL}\n`);

  if (!process.env.DATABASE_URL?.trim()) {
    console.log("ERROR: DATABASE_URL not set — cannot connect.\n");
    process.exit(1);
  }

  const prisma = new PrismaClient();

  try {
      await prisma.$queryRaw`SELECT 1`;

      const publicTables = await prisma.$queryRaw`
        SELECT tablename AS name FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename
      `;
      const authTables = await prisma.$queryRaw`
        SELECT tablename AS name FROM pg_tables WHERE schemaname = 'auth' ORDER BY tablename
      `;
      const publicNames = publicTables.map((r) => r.name);
      const authNames = authTables.map((r) => r.name);

      const liveEnums = await prisma.$queryRaw`
        SELECT n.nspname AS schema, t.typname AS name
        FROM pg_type t
        JOIN pg_namespace n ON n.oid = t.typnamespace
        WHERE n.nspname IN ('public', 'auth') AND t.typtype = 'e'
        ORDER BY n.nspname, t.typname
      `;

      const liveIndexes = await prisma.$queryRaw`
        SELECT schemaname AS schema, tablename AS "tableName", indexname AS name
        FROM pg_indexes
        WHERE schemaname IN ('public', 'auth')
        ORDER BY schemaname, tablename, indexname
      `;

      const liveTableKeySet = new Set();
      for (const n of publicNames) liveTableKeySet.add(tableKey("public", n));
      for (const n of authNames) liveTableKeySet.add(tableKey("auth", n));

      const liveEnumKeySet = new Set();
      for (const r of liveEnums) liveEnumKeySet.add(`${r.schema}.${r.name}`);

      const liveIndexKeySet = new Set();
      for (const r of liveIndexes) liveIndexKeySet.add(`${r.schema}.${r.name}`);

      const migrateDirs = uniqueMigrateDirs();

      /** migration folder -> parsed buckets */
      const perFolder = {};
      const allCreates = [];
      const allTypes = [];
      const allIndexes = [];

      for (const folder of migrateDirs) {
        const p = join(MIGRATIONS_DIR, folder, "migration.sql");
        const sql = readFileSync(p, "utf8");
        const parsed = parseMigrationSql(sql);
        perFolder[folder] = parsed;
        for (const c of parsed.creates) allCreates.push({ ...c, folder });
        for (const t of parsed.types) allTypes.push({ ...t, folder });
        for (const i of parsed.indexes) allIndexes.push({ ...i, folder });
      }

      const migrationCreateSet = new Set();
      for (const c of allCreates) migrationCreateSet.add(tableKey(c.schema, c.table));

      const migrationTypeSet = new Set();
      for (const t of allTypes) migrationTypeSet.add(`${t.schema}.${t.name}`);

      const migrationIndexNameSet = new Set();
      for (const i of allIndexes) migrationIndexNameSet.add(`${i.schema}.${i.name}`);

      /** @type { { schema: string, table: string, folders: string[] }[] } */
      const tableCollisions = [];
      const seenColl = new Set();
      for (const c of allCreates) {
        const k = tableKey(c.schema, c.table);
        if (liveTableKeySet.has(k) && !seenColl.has(k)) {
          seenColl.add(k);
          const folders = [...new Set(allCreates.filter((x) => tableKey(x.schema, x.table) === k).map((x) => x.folder))];
          tableCollisions.push({ schema: c.schema, table: c.table, folders });
        }
      }

      /** @type { { schema: string, name: string, folders: string[] }[] } */
      const enumCollisions = [];
      const seenEnum = new Set();
      for (const t of allTypes) {
        const k = `${t.schema}.${t.name}`;
        if (liveEnumKeySet.has(k) && !seenEnum.has(k)) {
          seenEnum.add(k);
          const folders = [...new Set(allTypes.filter((x) => `${x.schema}.${x.name}` === k).map((x) => x.folder))];
          enumCollisions.push({ schema: t.schema, name: t.name, folders });
        }
      }

      /** @type { { schema: string, indexName: string, folders: string[] }[] } */
      const indexCollisions = [];
      const seenIdx = new Set();
      for (const i of allIndexes) {
        const k = `${i.schema}.${i.name}`;
        if (liveIndexKeySet.has(k) && !seenIdx.has(k)) {
          seenIdx.add(k);
          const folders = [...new Set(allIndexes.filter((x) => `${x.schema}.${x.name}` === k).map((x) => x.folder))];
          indexCollisions.push({ schema: i.schema, indexName: i.name, folders });
        }
      }

      /** Folders that CREATE or ALTER a table that already exists live */
      const foldersTouchingLive = [];
      for (const folder of migrateDirs) {
        const { creates, alters } = perFolder[folder];
        const createsOnLive = [];
        for (const c of creates) {
          const k = tableKey(c.schema, c.table);
          if (liveTableKeySet.has(k)) createsOnLive.push(k);
        }
        const altersLive = [];
        for (const a of alters) {
          const k = tableKey(a.schema, a.table);
          if (liveTableKeySet.has(k)) altersLive.push(k);
        }
        if (createsOnLive.length > 0 || altersLive.length > 0) {
          foldersTouchingLive.push({
            migrationFolder: folder,
            createsOnLive: [...new Set(createsOnLive)],
            altersLive: [...new Set(altersLive)],
          });
        }
      }

      const publicNameSet = new Set(publicNames);
      const eccReadiness = ECC_TABLES.map((t) => ({ table: t, present: publicNameSet.has(t) }));
      const coreReadiness = CORE_REDDIRT_TABLES.map((t) => ({ table: t, present: publicNameSet.has(t) }));

      const eccAbsent = eccReadiness.filter((x) => !x.present).map((x) => x.table);
      const coreAbsent = coreReadiness.filter((x) => !x.present).map((x) => x.table);

      const blockerCount = tableCollisions.length + enumCollisions.length + indexCollisions.length;
      const syntheticCandidate = blockerCount === 0;

      let recommendationSummary;
      if (syntheticCandidate) {
        recommendationSummary =
          "Candidate path: add synthetic baseline marker migration, mark only that marker as applied, then run migrate deploy — after backup/snapshot + DBA review of this report.";
      } else {
        recommendationSummary =
          "Stop: manual DBA baseline required; do not deploy — resolve table/enum/index collisions first.";
      }

    const payload = {
        generatedAt: new Date().toISOString(),
        heuristics: {
          sqlParse: "regex over migration.sql; may miss unusual DDL; verify with DBA",
          prismaMigrationFoldersScanned: migrateDirs.length,
        },
        live: {
          publicTableCount: publicNames.length,
          authTableCount: authNames.length,
          publicTables: publicNames,
          authTables: authNames,
          enumCount: liveEnums.length,
          enums: liveEnums.map((r) => ({ schema: r.schema, name: r.name })),
          indexCount: liveIndexes.length,
          indexesSample: liveIndexes.slice(0, 80),
          indexTruncated: liveIndexes.length > 80,
        },
        migrations: {
          distinctCreateTableStatements: migrationCreateSet.size,
          distinctCreateTypeStatements: migrationTypeSet.size,
          distinctIndexStatements: migrationIndexNameSet.size,
        },
        collisions: {
          tables: tableCollisions,
          enums: enumCollisions,
          indexes: indexCollisions,
        },
        foldersTouchingLive,
        eccReadiness: { absent: eccAbsent, details: eccReadiness },
        coreRedDirtReadiness: { absent: coreAbsent, details: coreReadiness },
        recommendation: {
          syntheticBaselineCandidate: syntheticCandidate,
          summary: recommendationSummary,
        },
        candidateCommandsNotRun: [
          "# NOT RUN — review backup + EMAIL_BASELINE_PLAN.md first",
          `mkdir prisma/migrations/${SYNTHETIC_FOLDER}`,
          `# prisma/migrations/${SYNTHETIC_FOLDER}/migration.sql — no-op baseline marker, example:`,
          '# ---',
          "# -- Synthetic legacy baseline: no DDL against existing Supabase + legacy public tables.",
          "# SELECT 1;",
          "# ---",
          `npx prisma migrate resolve --applied ${SYNTHETIC_FOLDER}`,
          "npx prisma migrate deploy",
        ],
      };

      writeFileSync(JSON_OUT, `${JSON.stringify(payload, null, 2)}\n`, "utf8");

      const md = buildMarkdownReport(payload);
      writeFileSync(MD_OUT, md, "utf8");

      /* ----- console ----- */
      console.log(`Scanned ${migrateDirs.length} migration folders.\n`);
      console.log(`--- Live: public tables (${publicNames.length}), auth tables (${authNames.length}) ---`);
      console.log(`Live enum types (public+auth): ${liveEnums.length}; indexes: ${liveIndexes.length}\n`);

      console.log("--- CREATE TABLE collisions (live ∩ migration creates) ---");
      if (tableCollisions.length === 0) console.log("  (none detected)");
      else {
        for (const c of tableCollisions) console.log(`  ${c.schema}.${c.table} — migrations: ${c.folders.join(", ")}`);
      }
      console.log("");

      console.log("--- CREATE TYPE collisions (live enums ∩ migration types) ---");
      if (enumCollisions.length === 0) console.log("  (none detected)");
      else {
        for (const c of enumCollisions) console.log(`  ${c.schema}.${c.name} — migrations: ${c.folders.join(", ")}`);
      }
      console.log("");

      console.log("--- INDEX name collisions (live ∩ migration index names) ---");
      if (indexCollisions.length === 0) console.log("  (none detected)");
      else {
        for (const c of indexCollisions) console.log(`  ${c.schema}.${c.indexName} — migrations: ${c.folders.join(", ")}`);
      }
      console.log("");

      console.log(`--- Migration folders touching already-live tables (${foldersTouchingLive.length}) ---`);
      if (foldersTouchingLive.length === 0) console.log("  (none)");
      else {
        for (const f of foldersTouchingLive) {
          console.log(`  ${f.migrationFolder}`);
          if (f.createsOnLive.length) console.log(`    CREATE targets live: ${f.createsOnLive.join(", ")}`);
          if (f.altersLive.length) console.log(`    ALTER targets live: ${f.altersLive.join(", ")}`);
        }
      }
      console.log("");

      console.log("--- ECC tables absent ---");
      console.log(eccAbsent.length ? `  ${eccAbsent.join(", ")}` : "  (none — all listed ECC tables present)");
      console.log("");
      console.log("--- Core RedDirt tables absent ---");
      console.log(coreAbsent.length ? `  ${coreAbsent.join(", ")}` : "  (none — all listed core tables present)");
      console.log("");

      console.log("=== Recommendation ===\n");
      console.log(`  ${recommendationSummary}\n`);
      console.log("  DO NOT BASELINE BLINDLY — never resolve all migrations as applied without proof.\n");

      console.log("=== Candidate commands (NOT RUN) ===\n");
      for (const line of payload.candidateCommandsNotRun) console.log(line);
      console.log("");
      console.log(`Wrote: ${JSON_OUT.replace(/\\/g, "/")}`);
      console.log(`Wrote: ${MD_OUT.replace(/\\/g, "/")}`);
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
  if (process.exitCode === 1) process.exit(1);
}

/**
 * @param {any} p
 */
function buildMarkdownReport(p) {
  const lines = [
    `# Email baseline plan (generated)`,
    ``,
    `- **Generated:** ${p.generatedAt}`,
    `- **SQL parse note:** ${p.heuristics.sqlParse}`,
    `- **Migration folders scanned:** ${p.heuristics.prismaMigrationFoldersScanned}`,
    ``,
    `## Live database (names only)`,
    ``,
    `- Public tables: **${p.live.publicTableCount}**`,
    `- Auth tables: **${p.live.authTableCount}**`,
    `- Enum types (public+auth): **${p.live.enumCount}**`,
    `- Indexes (public+auth): **${p.live.indexCount}**${p.live.indexTruncated ? " — sample in JSON only" : ""}`,
    ``,
    `### Public tables`,
    ``,
    p.live.publicTables.map((t) => `- \`${t}\``).join("\n") || "(none)",
    ``,
    `### Auth tables`,
    ``,
    p.live.authTables.map((t) => `- \`${t}\``).join("\n") || "(none)",
    ``,
    `## Migrations aggregate`,
    ``,
    `- Distinct CREATE TABLE targets: **${p.migrations.distinctCreateTableStatements}**`,
    `- Distinct CREATE TYPE (enum) targets: **${p.migrations.distinctCreateTypeStatements}**`,
    `- Distinct CREATE INDEX names: **${p.migrations.distinctIndexStatements}**`,
    ``,
    `## Collisions`,
    ``,
    `### Table CREATE collisions`,
    ``,
    p.collisions.tables.length === 0
      ? "*(none detected)*"
      : p.collisions.tables
          .map((c) => `- **${c.schema}.${c.table}** — \`${c.folders.join("`, `")}\``)
          .join("\n"),
    ``,
    `### Enum TYPE collisions`,
    ``,
    p.collisions.enums.length === 0
      ? "*(none detected)*"
      : p.collisions.enums
          .map((c) => `- **${c.schema}.${c.name}** — \`${c.folders.join("`, `")}\``)
          .join("\n"),
    ``,
    `### Index name collisions`,
    ``,
    p.collisions.indexes.length === 0
      ? "*(none detected)*"
      : p.collisions.indexes
          .map((c) => `- **${c.schema}.${c.indexName}** — \`${c.folders.join("`, `")}\``)
          .join("\n"),
    ``,
    `## Migration folders touching already-live tables`,
    ``,
    p.foldersTouchingLive.length === 0
      ? "*(none)*"
      : p.foldersTouchingLive
          .map((f) => {
            const bits = [];
            if (f.createsOnLive.length) bits.push(`CREATE → ${f.createsOnLive.join(", ")}`);
            if (f.altersLive.length) bits.push(`ALTER → ${f.altersLive.join(", ")}`);
            return `- **${f.migrationFolder}** — ${bits.join(" · ")}`;
          })
          .join("\n"),
    ``,
    `## ECC readiness`,
    ``,
    `**Absent:** ${p.eccReadiness.absent.length ? p.eccReadiness.absent.map((t) => `\`${t}\``).join(", ") : "*(all listed tables present)*"}`,
    ``,
    `## Core RedDirt readiness`,
    ``,
    `**Absent:** ${p.coreRedDirtReadiness.absent.length ? p.coreRedDirtReadiness.absent.map((t) => `\`${t}\``).join(", ") : "*(all listed core tables present)*"}`,
    ``,
    `## Recommendation`,
    ``,
    `${p.recommendation.summary}`,
    ``,
    `**Synthetic baseline candidate:** ${p.recommendation.syntheticBaselineCandidate ? "yes (pending DBA + backup)" : "no"}`,
    ``,
    `## Candidate commands (NOT RUN)`,
    ``,
    "```text",
    ...p.candidateCommandsNotRun,
    "```",
    ``,
    `Machine-readable: \`docs/email-baseline-plan-output.json\`.`,
    ``,
  ];
  return lines.join("\n");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
