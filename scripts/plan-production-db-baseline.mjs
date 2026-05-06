#!/usr/bin/env node
/**
 * REDDIRT-PRODUCTION-DB-BASELINE-PLAN-1.0 — offline preservation-first baseline plan.
 *
 * Reads audit JSON + prisma/migrations only. Never connects to a database.
 * Never emits executable SQL. Intended for human approval before any migrate tooling.
 *
 * Usage (from RedDirt/):
 *   node scripts/plan-production-db-baseline.mjs
 */

import { existsSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REDDIRT_ROOT = join(__dirname, "..");
const AUDIT_PATH = join(REDDIRT_ROOT, "data", "production-db-baseline-audit.json");
const MIGRATIONS_DIR = join(REDDIRT_ROOT, "prisma", "migrations");
const SCHEMA_PATH = join(REDDIRT_ROOT, "prisma", "schema.prisma");
const PLAN_JSON = join(REDDIRT_ROOT, "data", "production-db-baseline-plan.json");
const PLAN_MD = join(REDDIRT_ROOT, "docs", "production-db-baseline-plan.md");
const HANDOFF_MD = join(REDDIRT_ROOT, "develop_notes", "REDDIRT_PRODUCTION_DB_BASELINE_PLAN_1_0_REPORT.md");

const SLICE = "REDDIRT-PRODUCTION-DB-BASELINE-PLAN-1.0";
const SOURCE_AUDIT = "data/production-db-baseline-audit.json";

const HIGH_VALUE_RE = /voter|contact|county|email|event|profile|audience|relational/i;

const ABSOLUTE_DO_NOT = [
  "npx prisma migrate deploy",
  "npx prisma migrate resolve",
  "npx prisma db push",
  "npx prisma migrate reset",
];

function stripSqlComments(sql) {
  let s = sql.replace(/\/\*[\s\S]*?\*\//g, " ");
  s = s.replace(/--[^\n]*/g, " ");
  return s;
}

/** Extract quoted or bare identifiers from CREATE TABLE ... ( */
function extractCreateTables(sql) {
  const clean = stripSqlComments(sql);
  const out = [];
  const re =
    /CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?(?:(?:"([^"]+)"|(\w+))\.)?(?:"([^"]+)"|(\w+))\s*\(/gi;
  let m;
  while ((m = re.exec(clean)) !== null) {
    const schema = m[1] || m[2] || null;
    const table = m[3] || m[4];
    if (table) out.push({ schema: schema || "public", table });
  }
  return out;
}

function extractAlterTableTargets(sql) {
  const clean = stripSqlComments(sql);
  const out = [];
  const re = /ALTER\s+TABLE\s+(?:(?:"([^"]+)"|(\w+))\.)?(?:"([^"]+)"|(\w+))/gi;
  let m;
  while ((m = re.exec(clean)) !== null) {
    const schema = m[1] || m[2] || null;
    const table = m[3] || m[4];
    if (table) out.push({ schema: schema || "public", table });
  }
  return out;
}

function extractCreateTypes(sql) {
  const clean = stripSqlComments(sql);
  const out = [];
  const re = /CREATE\s+TYPE\s+(?:(?:"([^"]+)"|(\w+))\.)?(?:"([^"]+)"|(\w+))/gi;
  let m;
  while ((m = re.exec(clean)) !== null) {
    const schema = m[1] || m[2] || null;
    const typ = m[3] || m[4];
    if (typ) out.push({ schema: schema || "public", type: typ });
  }
  return out;
}

function countCreateIndexes(sql) {
  const clean = stripSqlComments(sql);
  const re = /CREATE\s+(?:UNIQUE\s+)?INDEX/gi;
  const m = clean.match(re);
  return m ? m.length : 0;
}

/** Destructive DDL only (used for unsafe heuristics — excludes routine data-fix DELETEs). */
function detectDestructiveDdl(sql) {
  const clean = stripSqlComments(sql);
  const hits = [];
  const patterns = [
    /\bDROP\s+TABLE\b/gi,
    /\bDROP\s+TYPE\b/gi,
    /\bDROP\s+SCHEMA\b/gi,
    /\bTRUNCATE\b/gi,
    /\bALTER\s+TABLE\b[^;]{0,400}\bDROP\s+COLUMN\b/gi,
  ];
  for (const p of patterns) {
    let m;
    const rx = new RegExp(p.source, p.flags);
    while ((m = rx.exec(clean)) !== null) {
      const start = Math.max(0, m.index - 20);
      const snippet = clean.slice(start, m.index + 60).replace(/\s+/g, " ").trim();
      hits.push({ pattern: p.source, snippet: snippet.slice(0, 120) });
      if (hits.length > 15) break;
    }
    if (hits.length > 15) break;
  }
  return hits;
}

/** Broader scan for operator review (includes DELETE FROM data migrations). */
function detectHighRisk(sql) {
  const clean = stripSqlComments(sql);
  return [...detectDestructiveDdl(sql), ...detectDataMutatingHints(clean)];
}

function detectDataMutatingHints(clean) {
  const hits = [];
  const re = /\bDELETE\s+FROM\b/gi;
  let m;
  while ((m = re.exec(clean)) !== null) {
    const start = Math.max(0, m.index - 15);
    hits.push({
      pattern: "DELETE_FROM",
      snippet: clean.slice(start, m.index + 50).replace(/\s+/g, " ").trim().slice(0, 120),
    });
    if (hits.length > 8) break;
  }
  return hits;
}

function parsePrismaModels(schemaText) {
  const models = [];
  const re = /\bmodel\s+(\w+)\s*\{/g;
  const starts = [];
  let m;
  while ((m = re.exec(schemaText)) !== null) {
    starts.push({ name: m[1], brace: m.index + m[0].length - 1 });
  }
  for (let i = 0; i < starts.length; i++) {
    const { name, brace } = starts[i];
    let depth = 1;
    let j = brace + 1;
    while (j < schemaText.length && depth > 0) {
      const ch = schemaText[j];
      if (ch === "{") depth++;
      else if (ch === "}") depth--;
      j++;
    }
    const body = schemaText.slice(brace + 1, j - 1);
    const mapM = body.match(/@@map\(\s*"([^"]+)"\s*\)/);
    models.push({ model: name, table: mapM ? mapM[1] : name });
  }
  return models;
}

function norm(s) {
  return String(s || "").trim();
}

function lower(s) {
  return norm(s).toLowerCase();
}

function observedPublicTableNames(audit) {
  const names = [];
  for (const fq of audit.observed?.tables || []) {
    if (fq.startsWith("public.")) names.push(fq.slice("public.".length));
  }
  return names.sort((a, b) => lower(a).localeCompare(lower(b)));
}

function tableExistsInObserved(observedLowerSet, table) {
  return observedLowerSet.has(lower(table));
}

function migrationFootprintTables(createRows, alterRows) {
  const set = new Set();
  for (const r of createRows) set.add(r.table);
  for (const r of alterRows) set.add(r.table);
  return [...set];
}

function isHighValueTouching(sql, footprintNames) {
  if (HIGH_VALUE_RE.test(sql)) return true;
  for (const n of footprintNames) {
    if (HIGH_VALUE_RE.test(n)) return true;
  }
  return false;
}

function classifyMigration(observedLowerSet, createRows, alterRows) {
  const footprint = migrationFootprintTables(createRows, alterRows);
  if (footprint.length === 0) return "vacuous";

  let present = 0;
  let absent = 0;
  for (const t of footprint) {
    if (tableExistsInObserved(observedLowerSet, t)) present++;
    else absent++;
  }
  if (absent === 0) return "fully_present";
  if (present === 0) return "missing";
  return "mixed";
}

function chooseStrategy({
  audit,
  missingCount,
  mixedCount,
  destructiveDdlMigrationCount,
  prismaMatchCount,
  prismaExpectedCount,
  observedPublicTableCount,
}) {
  const notObserved = (audit.comparison?.tablesInPrismaNotObserved || []).length;
  const matchRatio = prismaExpectedCount > 0 ? prismaMatchCount / prismaExpectedCount : 0;
  const baselineRisk = audit.comparison?.baselineRisk || "";

  if (
    destructiveDdlMigrationCount > 0 &&
    (mixedCount + missingCount > 25 || matchRatio < 0.5)
  ) {
    return {
      strategy: "unsafe_to_baseline",
      reason:
        "Migration history includes destructive DDL while production footprint does not line up with Prisma tables; do not baseline or resolve-all without expert reconciliation and shadow proofs.",
      recommendedNextSlice: "REDDIRT-PRODUCTION-DB-SCHEMA-RECONCILIATION-1.0",
    };
  }

  if (
    matchRatio < 0.12 &&
    prismaExpectedCount >= 60 &&
    observedPublicTableCount >= 40 &&
    notObserved >= 40
  ) {
    return {
      strategy: "unsafe_to_baseline",
      reason:
        "Almost no Prisma-mapped public tables match observed names while production already holds many public tables — likely a parallel legacy lineage. Blind Prisma baseline or migrate-resolve would misrepresent reality.",
      recommendedNextSlice: "REDDIRT-PRODUCTION-DB-SCHEMA-RECONCILIATION-1.0",
    };
  }

  if (matchRatio >= 0.95 && mixedCount === 0 && missingCount === 0 && notObserved <= 5) {
    return {
      strategy: "baseline_all_existing_only",
      reason:
        "Observed public tables largely cover Prisma-mapped tables with no mixed migration footprint; a human may consider marking migrations applied only after shadow-DB verification and explicit approval.",
      recommendedNextSlice: "REDDIRT-PRODUCTION-DB-BASELINE-EXECUTION-1.0",
    };
  }

  if (matchRatio < 0.35 || notObserved > 40 || baselineRisk.includes("high")) {
    return {
      strategy: "manual_reconciliation_required",
      reason:
        "Large Prisma vs observed gap or audit high-risk posture: production appears to follow a different lineage than repo migrations; reconcile naming, shadow apply, and operator sign-off before any baseline.",
      recommendedNextSlice: "REDDIRT-PRODUCTION-DB-SCHEMA-RECONCILIATION-1.0",
    };
  }

  return {
    strategy: "manual_reconciliation_required",
    reason:
      "Mixed migration footprints or partial overlap require a governed reconciliation path before Prisma history can be trusted on this database.",
    recommendedNextSlice: "REDDIRT-PRODUCTION-DB-SCHEMA-RECONCILIATION-1.0",
  };
}

function loadAudit() {
  if (!existsSync(AUDIT_PATH)) {
    throw new Error(`Missing audit file: ${SOURCE_AUDIT} (run audit script first).`);
  }
  return JSON.parse(readFileSync(AUDIT_PATH, "utf8"));
}

function listMigrationsLexical() {
  const names = readdirSync(MIGRATIONS_DIR).filter((n) => {
    const p = join(MIGRATIONS_DIR, n);
    try {
      return statSync(p).isDirectory() && existsSync(join(p, "migration.sql"));
    } catch {
      return false;
    }
  });
  return names.sort((a, b) => a.localeCompare(b));
}

function buildPlan() {
  const audit = loadAudit();
  const schemaText = readFileSync(SCHEMA_PATH, "utf8");
  const prismaModels = parsePrismaModels(schemaText);
  const mappedTables = prismaModels.map((m) => m.table);

  const observedPublic = observedPublicTableNames(audit);
  const observedLowerSet = new Set(observedPublic.map(lower));

  const prismaTablesNotObserved = audit.comparison?.tablesInPrismaNotObserved || [];
  const databaseTablesNotInPrisma = (audit.comparison?.tablesInDatabaseNotInPrisma || []).filter((t) =>
    t.startsWith("public."),
  );

  let prismaMatchCount = 0;
  const prismaTablesPresentInDb = [];
  for (const t of mappedTables) {
    if (tableExistsInObserved(observedLowerSet, t)) {
      prismaMatchCount++;
      prismaTablesPresentInDb.push(t);
    }
  }
  prismaTablesPresentInDb.sort((a, b) => lower(a).localeCompare(lower(b)));

  const migrationDirs = listMigrationsLexical();
  const firstIntro = new Map();

  const perMigration = [];
  for (const dir of migrationDirs) {
    const sql = readFileSync(join(MIGRATIONS_DIR, dir, "migration.sql"), "utf8");
    const createTables = extractCreateTables(sql);
    const alterTargets = extractAlterTableTargets(sql);
    const createTypes = extractCreateTypes(sql);
    const createIndexCount = countCreateIndexes(sql);
    const destructiveDdl = detectDestructiveDdl(sql);
    const highRisk = detectHighRisk(sql);
    const footprintNames = migrationFootprintTables(
      createTables,
      alterTargets,
    );
    const cls = classifyMigration(observedLowerSet, createTables, alterTargets);
    const hv = isHighValueTouching(sql, footprintNames);

    for (const row of createTables) {
      const key = lower(row.table);
      if (!firstIntro.has(key)) firstIntro.set(key, dir);
    }

    perMigration.push({
      dir,
      createTables: createTables.map((r) => r.table),
      alterTargets: alterTargets.map((r) => r.table),
      createTypeCount: createTypes.length,
      createIndexCount,
      destructiveDdlHitCount: destructiveDdl.length,
      highRiskHitCount: highRisk.length,
      classification: cls,
      highValueTouching: hv,
    });
  }

  const fullyPresentMigrations = [];
  const missingMigrations = [];
  const mixedFootprintMigrations = [];
  const highValueTouchingMigrations = [];

  for (const row of perMigration) {
    if (row.highValueTouching) highValueTouchingMigrations.push(row.dir);
    if (row.classification === "fully_present" || row.classification === "vacuous") {
      fullyPresentMigrations.push(row.dir);
    } else if (row.classification === "missing") {
      missingMigrations.push(row.dir);
    } else if (row.classification === "mixed") {
      mixedFootprintMigrations.push(row.dir);
    }
  }

  const destructiveDdlMigrationCount = perMigration.filter((r) => r.destructiveDdlHitCount > 0).length;

  const strat = chooseStrategy({
    audit,
    missingCount: missingMigrations.length,
    mixedCount: mixedFootprintMigrations.length,
    destructiveDdlMigrationCount,
    prismaMatchCount,
    prismaExpectedCount: mappedTables.length,
    observedPublicTableCount: observedPublic.length,
  });

  const plan = {
    schemaVersion: "1.0",
    slice: SLICE,
    generatedAt: new Date().toISOString(),
    mode: "offline_plan_only",
    sourceAudit: SOURCE_AUDIT,
    databaseIdentity: {
      reachable: Boolean(audit.database?.reachable),
      prismaMigrationsTableExists: Boolean(audit.database?.prismaMigrationsTableExists),
      observedPublicTableCount: observedPublic.length,
      prismaExpectedTableCount: mappedTables.length,
    },
    migrationAnalysis: {
      totalMigrations: migrationDirs.length,
      fullyPresentMigrations,
      missingMigrations,
      mixedFootprintMigrations,
      highValueTouchingMigrations,
    },
    tableComparison: {
      observedPublicTables: observedPublic,
      prismaTablesNotObserved,
      databaseTablesNotInPrisma,
    },
    recommendedStrategy: {
      strategy: strat.strategy,
      safeToExecuteAutomatically: false,
      requiresHumanApproval: true,
      recommendedNextSlice: strat.recommendedNextSlice,
      reason: strat.reason,
    },
    commandsForHumanReviewOnly: [
      "Compare this JSON to the latest production-db-baseline-audit.json (regenerate audit if DATABASE_URL target changed).",
      "Use an empty shadow Postgres database: prisma migrate deploy there to validate the migration chain without touching production.",
      "If reconciliation proceeds, document any rename or multi-app lineage decisions before migrate resolve on production.",
      "Keep REDDIRT lane rules: no migrate deploy / resolve / db push / reset on production until explicit human approval after shadow verification.",
    ],
    absoluteDoNotRunYet: ABSOLUTE_DO_NOT,
    _meta: {
      prismaSchemaModelCount: prismaModels.length,
      auditSlice: audit.slice,
      auditGeneratedAt: audit.generatedAt,
      firstTableIntroductionCount: firstIntro.size,
      migrationsWithDestructiveDdl: perMigration.filter((r) => r.destructiveDdlHitCount > 0).map((r) => r.dir),
      migrationsWithHighRiskSql: perMigration.filter((r) => r.highRiskHitCount > 0).map((r) => r.dir),
      note:
        "firstIntroduction map is internal to script logic; migration.sql parsing is heuristic and may miss edge-case DDL.",
    },
  };

  const prismaWithMigrationCreate = mappedTables.filter((t) => firstIntro.has(lower(t))).length;

  return {
    plan,
    perMigration,
    firstIntro,
    prismaModels,
    prismaWithMigrationCreate,
    audit,
    prismaTablesPresentInDb,
  };
}

function truncateBullets(items, max = 50) {
  if (!items.length) return "_None._";
  const head = items.slice(0, max);
  const lines = head.map((x) => `- \`${String(x).replace(/`/g, "'")}\``);
  if (items.length > max) {
    lines.push(`- _…${items.length - max} more — full list in \`data/production-db-baseline-plan.json\`._`);
  }
  return lines.join("\n");
}

function writePlanMarkdown(plan, audit, prismaWithMigrationCreate, prismaTablesPresentInDb) {
  const ma = plan.migrationAnalysis;
  const warn = audit.warnings || [];
  const warnBlock =
    warn.length === 0
      ? "_No warnings on source audit._"
      : warn
          .slice(0, 8)
          .map((w) => `- ${w}`)
          .join("\n");

  return [
    `# Production database baseline plan (offline)`,
    ``,
    `**Slice:** \`${plan.slice}\` · **Generated:** ${plan.generatedAt} · **Source audit:** \`${plan.sourceAudit}\``,
    ``,
    `## Purpose`,
    ``,
    `Preservation-first analysis of **Prisma migration SQL** against **read-only audit** outputs. **No database access**, **no executable SQL output**, **no migrations**. This document supports **human-approved** baseline planning so production voter and campaign data are never reset or blindly overwritten. After the database transfer, the **correct** Supabase target is known; this plan turns audit + migration history into an actionable reconciliation story before Netlify can safely run \`prisma migrate deploy\`.`,
    ``,
    `## Source audit summary`,
    ``,
    `- **Audit slice:** \`${audit.slice || "unknown"}\``,
    `- **Audit generated at:** ${audit.generatedAt || "unknown"}`,
    `- **Audit mode:** ${audit.mode || "unknown"}`,
    `- **Audit baseline risk (heuristic):** \`${audit.comparison?.baselineRisk || "unknown"}\``,
    `- **Warnings (sample):**`,
    warnBlock,
    ``,
    `## Current database identity`,
    ``,
    `- **Reachable (at audit time):** ${plan.databaseIdentity.reachable}`,
    `- **\`public._prisma_migrations\` present:** ${plan.databaseIdentity.prismaMigrationsTableExists}`,
    `- **Observed public base tables:** ${plan.databaseIdentity.observedPublicTableCount}`,
    `- **Prisma expected public tables (\`schema.prisma\`):** ${plan.databaseIdentity.prismaExpectedTableCount}`,
    `- **Prisma-mapped names found in observed public (case-insensitive):** ${prismaTablesPresentInDb.length}`,
    ``,
    `## Migration footprint analysis`,
    ``,
    `Migrations are ordered **lexically** by folder name under \`prisma/migrations/\`. Each \`migration.sql\` is scanned (heuristic) for \`CREATE TABLE\`, \`ALTER TABLE\`, \`CREATE TYPE\`, \`CREATE INDEX\` counts, destructive DDL, and high-value keywords. Footprint = tables touched by **CREATE** or **ALTER** in that file vs **observed public** table names from the audit.`,
    ``,
    `- **Total migrations:** ${ma.totalMigrations}`,
    `- **Prisma tables with a first \`CREATE TABLE\` somewhere in the chain:** ${prismaWithMigrationCreate} / ${plan.databaseIdentity.prismaExpectedTableCount}`,
    `- **Fully present or vacuous (no DDL tables, or all footprint tables match observed public):** ${ma.fullyPresentMigrations.length}`,
    `- **Missing footprint (non-empty footprint, zero tables matched observed public):** ${ma.missingMigrations.length}`,
    `- **Mixed footprint (some matched, some not):** ${ma.mixedFootprintMigrations.length}`,
    `- **High-value keyword touch (migration dir, SQL, or table names):** ${ma.highValueTouchingMigrations.length}`,
    ``,
    `### Fully present / vacuous migrations (sample)`,
    ``,
    truncateBullets(ma.fullyPresentMigrations, 25),
    ``,
    `### Missing-footprint migrations (sample)`,
    ``,
    truncateBullets(ma.missingMigrations, 25),
    ``,
    `## Tables already present`,
    ``,
    `**Prisma-mapped table names** that the audit shows exist in **\`public\`** (case-insensitive name match). These are the strongest evidence that a Prisma object may already live in production under the same identifier.`,
    ``,
    `- **Count:** ${prismaTablesPresentInDb.length}`,
    ``,
    truncateBullets(prismaTablesPresentInDb, 40),
    ``,
    `## Tables missing from production`,
    ``,
    `**Prisma-mapped tables** the audit did **not** see in \`public\` (same naming convention Prisma uses in migrations — often **PascalCase**). A large list usually means a **parallel legacy schema** (e.g. snake_case tables) rather than an empty database.`,
    ``,
    `- **Count:** ${plan.tableComparison.prismaTablesNotObserved.length}`,
    ``,
    truncateBullets(plan.tableComparison.prismaTablesNotObserved, 45),
    ``,
    `## Mixed migrations`,
    ``,
    ma.mixedFootprintMigrations.length
      ? truncateBullets(ma.mixedFootprintMigrations, 40)
      : `_None on this plan run — every non-vacuous migration was either fully missing or fully present under the heuristic._`,
    ``,
    `## High-value migration touchpoints`,
    ``,
    `Migrations whose SQL, **\`CREATE TABLE\`** identifiers, or directory name match sensitive domains (voter, contact, county, email, event, profile, audience, relational). **Naming heuristic only** — not a data classification.`,
    ``,
    truncateBullets(ma.highValueTouchingMigrations, 40),
    ``,
    `## Recommended baseline strategy`,
    ``,
    `- **Strategy label:** \`${plan.recommendedStrategy.strategy}\``,
    `- **Safe to execute automatically:** ${plan.recommendedStrategy.safeToExecuteAutomatically}`,
    `- **Requires human approval:** ${plan.recommendedStrategy.requiresHumanApproval}`,
    ``,
    `**Reason:** ${plan.recommendedStrategy.reason}`,
    ``,
    `## Human review checklist`,
    ``,
    `- [ ] Confirm the audit was run against the **intended** production \`DATABASE_URL\` after the database transfer.`,
    `- [ ] Read \`data/production-db-baseline-plan.json\` alongside this file; spot-check migrations that touch voter or comms domains.`,
    `- [ ] Run **\`prisma migrate deploy\` on a shadow empty database** to validate the migration chain produces the expected schema (still **no** production writes).`,
    `- [ ] Decide whether production is **legacy parallel schema**, **partial Prisma overlap**, or another lineage before any \`migrate resolve\`.`,
    `- [ ] Obtain **explicit** sign-off from Steve / DBA before any execution packet.`,
    `- [ ] Only after reconciliation: revisit Netlify build (\`migrate deploy\` step) with a written rollback story.`,
    ``,
    `## Commands for review only`,
    ``,
    ...plan.commandsForHumanReviewOnly.map((c) => `- ${c}`),
    ``,
    `## Absolute forbidden commands`,
    ``,
    ...plan.absoluteDoNotRunYet.map((c) => `- \`${c}\` — **do not** run against production until governance approves an execution slice.`),
    ``,
    `## Next recommended slice`,
    ``,
    `**\`${plan.recommendedStrategy.recommendedNextSlice}\`** — follow this slice before attempting baseline execution or unblocking \`migrate deploy\` on production.`,
    ``,
    `---`,
    ``,
    `_Full machine-readable plan: [\`data/production-db-baseline-plan.json\`](../data/production-db-baseline-plan.json). Heuristic DDL parse — verify edge cases manually._`,
    ``,
    `_Prisma map alignment packet: [\`docs/prisma-schema-map-alignment.md\`](../docs/prisma-schema-map-alignment.md) · [\`data/prisma-schema-map-alignment.json\`](../data/prisma-schema-map-alignment.json) · [\`develop_notes/REDDIRT_PRISMA_SCHEMA_MAP_ALIGNMENT_1_0_REPORT.md\`](../develop_notes/REDDIRT_PRISMA_SCHEMA_MAP_ALIGNMENT_1_0_REPORT.md) — \`node scripts/align-prisma-schema-map.mjs\` (offline; **no** \`schema.prisma\` edits in that slice)._`,
    ``,
  ].join("\n");
}

function writeHandoff(plan, audit, prismaWithMigrationCreate, prismaTablesPresentInDb) {
  const ma = plan.migrationAnalysis;
  return [
    `# REDDIRT-PRODUCTION-DB-BASELINE-PLAN-1.0 — report`,
    ``,
    `**Lane:** \`RedDirt/\` only · **Generated:** ${plan.generatedAt}`,
    ``,
    `## Slice summary`,
    ``,
    `**REDDIRT-PRODUCTION-DB-BASELINE-PLAN-1.0** builds an **offline** preservation-first baseline story by comparing **read-only audit** metadata to **every** \`prisma/migrations/*/migration.sql\` file. **No** database connection, **no** \`DATABASE_URL\`, **no** Prisma CLI execution, **no** SQL intended to run. This is the correct next step after the **database transfer** fixed the wrong-target problem: we now plan the baseline carefully, then can unblock Netlify and return focus to email proof, calendar proof, county dashboard audit, and path-to-victory mapping.`,
    ``,
    `## Files created`,
    ``,
    `- \`data/production-db-baseline-plan.json\` — structured plan (\`schemaVersion\` **1.0**).`,
    `- \`docs/production-db-baseline-plan.md\` — operator markdown (required sections).`,
    `- \`develop_notes/REDDIRT_PRODUCTION_DB_BASELINE_PLAN_1_0_REPORT.md\` — this report.`,
    ``,
    `## Inputs inspected`,
    ``,
    `- \`${SOURCE_AUDIT}\` — latest production baseline audit (must be regenerated when the DB target changes).`,
    `- \`prisma/schema.prisma\` — Prisma model → default table mapping and \`@@map\` overrides.`,
    `- \`prisma/migrations/**/migration.sql\` — **${ma.totalMigrations}** migration files in lexical folder order.`,
    ``,
    `## Migration analysis summary`,
    ``,
    `- **Fully present / vacuous:** ${ma.fullyPresentMigrations.length}`,
    `- **Missing footprint:** ${ma.missingMigrations.length}`,
    `- **Mixed footprint:** ${ma.mixedFootprintMigrations.length}`,
    `- **High-value touching:** ${ma.highValueTouchingMigrations.length}`,
    `- **Prisma tables with migration \`CREATE TABLE\` chain entry:** ${prismaWithMigrationCreate} / ${plan.databaseIdentity.prismaExpectedTableCount}`,
    `- **Prisma-mapped tables also seen in observed public:** ${prismaTablesPresentInDb.length}`,
    ``,
    `## Baseline recommendation`,
    ``,
    `- **Strategy:** \`${plan.recommendedStrategy.strategy}\``,
    `- **Reason:** ${plan.recommendedStrategy.reason}`,
    `- **Next slice:** \`${plan.recommendedStrategy.recommendedNextSlice}\``,
    ``,
    `## Governance status`,
    ``,
    `- **\`safeToExecuteAutomatically\`:** ${plan.recommendedStrategy.safeToExecuteAutomatically} (planner default).`,
    `- **\`requiresHumanApproval\`:** ${plan.recommendedStrategy.requiresHumanApproval} — **must** stay true until an explicit execution packet is approved.`,
    `- **Forbidden until approved:** \`migrate deploy\`, \`migrate resolve\`, \`db push\`, \`migrate reset\` on production (see plan markdown **Absolute forbidden commands**).`,
    `- **Row / voter export:** not performed by this slice.`,
    ``,
    `## Checks`,
    ``,
    `- \`node scripts/plan-production-db-baseline.mjs\` — regenerates JSON + markdown + this report.`,
    `- \`npm run typecheck\` — lane TypeScript.`,
    `- \`npm run check\` — lint + typecheck + production build.`,
    `- \`npm run email:no-send-scan\` — Comms no-send governance scan.`,
    ``,
    `## Risks / limitations`,
    ``,
    `- Regex-based DDL parse can miss uncommon syntax or nested PL/pgSQL.`,
    `- **Naming lineage:** legacy snake_case public tables will not match Prisma PascalCase \`CREATE TABLE\` names in heuristics — reconciliation is semantic.`,
    `- **Auth schema:** audit includes \`auth.*\`; this plan’s footprint checks focus on **public** observed tables.`,
    ``,
    `## Next recommended slice`,
    ``,
    `**${plan.recommendedStrategy.recommendedNextSlice}**`,
    ``,
  ].join("\n");
}

function main() {
  process.chdir(REDDIRT_ROOT);
  const { plan, prismaWithMigrationCreate, audit, prismaTablesPresentInDb } = buildPlan();
  const out = { ...plan };
  delete out._meta;

  writeFileSync(PLAN_JSON, JSON.stringify(out, null, 2), "utf8");
  writeFileSync(PLAN_MD, writePlanMarkdown(out, audit, prismaWithMigrationCreate, prismaTablesPresentInDb), "utf8");
  writeFileSync(HANDOFF_MD, writeHandoff(out, audit, prismaWithMigrationCreate, prismaTablesPresentInDb), "utf8");

  console.log(`plan-production-db-baseline: wrote ${PLAN_JSON}`);
  console.log(`plan-production-db-baseline: wrote ${PLAN_MD}`);
  console.log(`plan-production-db-baseline: wrote ${HANDOFF_MD}`);
  console.log(`plan-production-db-baseline: strategy=${out.recommendedStrategy.strategy} migrations=${out.migrationAnalysis.totalMigrations}`);
}

main();
