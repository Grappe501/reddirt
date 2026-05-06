#!/usr/bin/env node
/**
 * REDDIRT-PRODUCTION-DB-BASELINE-AUDIT-1.0 — read-only metadata audit (no writes, no row exports).
 *
 * Uses DATABASE_URL only for connection; never logs the URL or credentials.
 * Prefers `pg` when resolvable from node_modules; otherwise PrismaClient + $queryRawUnsafe
 * with a fixed whitelist of SELECT statements against catalog metadata only.
 *
 * Usage (from RedDirt/):
 *   node scripts/audit-production-db-baseline.mjs
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REDDIRT_ROOT = join(__dirname, "..");
const DATA_PATH = join(REDDIRT_ROOT, "data", "production-db-baseline-audit.json");
const DOC_PATH = join(REDDIRT_ROOT, "docs", "production-db-baseline-audit.md");
const HANDOFF_PATH = join(REDDIRT_ROOT, "develop_notes", "REDDIRT_PRODUCTION_DB_BASELINE_AUDIT_1_0_REPORT.md");
const SCHEMA_PATH = join(REDDIRT_ROOT, "prisma", "schema.prisma");

const SLICE = "REDDIRT-PRODUCTION-DB-BASELINE-AUDIT-1.0";
const SCHEMAS_INSPECTED = ["public", "auth"];

const HIGH_VALUE_SUBSTRINGS = [
  "voter",
  "contact",
  "profile",
  "county",
  "email",
  "audience",
  "relational",
  "event",
];

process.chdir(REDDIRT_ROOT);
try {
  if (typeof process.loadEnvFile === "function") {
    const envPath = join(REDDIRT_ROOT, ".env");
    if (existsSync(envPath)) process.loadEnvFile(envPath);
  }
} catch {
  /* optional */
}

function ensureDirForFile(filePath) {
  const dir = dirname(filePath);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
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
    const table = mapM ? mapM[1] : name;
    models.push({ model: name, table });
  }
  return models;
}

function normTable(s) {
  return String(s || "").trim();
}

function tableFq(schema, table) {
  return `${normTable(schema)}.${normTable(table)}`;
}

function lower(s) {
  return String(s || "").toLowerCase();
}

function isHighValueTableName(tableName) {
  const t = lower(tableName);
  return HIGH_VALUE_SUBSTRINGS.some((k) => t.includes(k));
}

/** Try CommonJS resolution for optional `pg`. */
function tryLoadPg() {
  try {
    const require = createRequire(import.meta.url);
    return require("pg");
  } catch {
    return null;
  }
}

async function runWithPg(queries) {
  const pgMod = tryLoadPg();
  if (!pgMod || typeof pgMod.Client !== "function") return null;
  const client = new pgMod.Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  try {
    const out = {};
    for (const [key, sql] of Object.entries(queries)) {
      const res = await client.query(sql);
      out[key] = res.rows;
    }
    return out;
  } finally {
    await client.end();
  }
}

async function runWithPrisma(queries) {
  const { PrismaClient } = await import("@prisma/client");
  const prisma = new PrismaClient();
  try {
    const out = {};
    for (const [key, sql] of Object.entries(queries)) {
      out[key] = await prisma.$queryRawUnsafe(sql);
    }
    return out;
  } finally {
    await prisma.$disconnect();
  }
}

const SQL = {
  prismaMigrations: `
    SELECT EXISTS (
      SELECT 1
      FROM information_schema.tables
      WHERE table_schema = 'public'
        AND table_name = '_prisma_migrations'
    ) AS prisma_migrations_exists
  `,
  tables: `
    SELECT table_schema, table_name
    FROM information_schema.tables
    WHERE table_schema IN ('public', 'auth')
      AND table_type = 'BASE TABLE'
    ORDER BY table_schema, table_name
  `,
  columnCatalogTouch: `
    SELECT COUNT(*)::bigint AS column_catalog_rows
    FROM information_schema.columns
    WHERE table_schema IN ('public', 'auth')
  `,
  enums: `
    SELECT n.nspname AS enum_schema, t.typname AS enum_name
    FROM pg_type t
    JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE t.typtype = 'e'
      AND n.nspname IN ('public', 'auth')
    ORDER BY n.nspname, t.typname
  `,
  relTuples: `
    SELECT n.nspname AS rel_schema, c.relname AS rel_name,
           GREATEST(c.reltuples::bigint, 0) AS estimated_rows
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname IN ('public', 'auth')
      AND c.relkind = 'r'
    ORDER BY n.nspname, c.relname
  `,
};

function pick(rows, ...keys) {
  if (!rows || !rows.length) return null;
  const r = rows[0];
  for (const k of keys) {
    if (r && r[k] !== undefined && r[k] !== null) return r[k];
  }
  return null;
}

function buildAuditPayload({ reachable, prismaMigrationsExists, tableRows, enumRows, relRows, prismaModels, errorMessage }) {
  const tables = (tableRows || []).map((row) => {
    const s = row.table_schema ?? row.TABLE_SCHEMA;
    const t = row.table_name ?? row.TABLE_NAME;
    return tableFq(s, t);
  });

  const enums = (enumRows || []).map((row) => {
    const es = row.enum_schema ?? row.ENUM_SCHEMA;
    const en = row.enum_name ?? row.ENUM_NAME;
    return `${es}.${en}`;
  });

  const estimatedRowsByTable = (relRows || []).map((row) => {
    const schema = row.rel_schema ?? row.REL_SCHEMA;
    const table = row.rel_name ?? row.REL_NAME;
    const raw = row.estimated_rows ?? row.ESTIMATED_ROWS;
    const estimatedRows = typeof raw === "bigint" ? Number(raw) : Number(raw) || 0;
    return { schema, table, estimatedRows };
  });

  const mappedTables = prismaModels.map((p) => p.table);
  const models = prismaModels.map((p) => p.model);

  const observedPublicTables = new Set(
    (tableRows || []).filter((row) => lower(row.table_schema ?? row.TABLE_SCHEMA) === "public").map((row) => normTable(row.table_name ?? row.TABLE_NAME)),
  );

  const prismaTableLower = new Set(mappedTables.map((t) => lower(t)));

  const tablesInDatabaseNotInPrisma = tables.filter((fq) => {
    const [sch, tbl] = fq.split(".");
    if (!tbl) return true;
    if (lower(sch) === "public") return !prismaTableLower.has(lower(tbl));
    return true;
  });

  const tablesInPrismaNotObserved = mappedTables.filter((tbl) => {
    let found = false;
    for (const o of observedPublicTables) {
      if (lower(o) === lower(tbl)) {
        found = true;
        break;
      }
    }
    return !found;
  });

  const highValueTables = tables.filter((fq) => {
    const parts = fq.split(".");
    const tbl = parts[parts.length - 1] || fq;
    return isHighValueTableName(tbl);
  });

  const warnings = [];
  if (!reachable && errorMessage) {
    warnings.push(`Connection failed (redacted): ${String(errorMessage).slice(0, 400)}`);
  }
  if (reachable && tablesInPrismaNotObserved.length > 0) {
    warnings.push(
      `${tablesInPrismaNotObserved.length} Prisma-mapped public table(s) not found in information_schema snapshot (case or naming drift, or different database).`,
    );
  }
  if (reachable && observedPublicTables.size > 0 && observedPublicTables.size < Math.min(20, Math.floor(mappedTables.length * 0.15))) {
    warnings.push(
      "Very few public tables relative to Prisma model count — confirm DATABASE_URL targets the intended RedDirt/campaign database (not an empty, pooler-only, or Supabase-auth-only project).",
    );
  }
  if (reachable && tablesInDatabaseNotInPrisma.filter((fq) => fq.startsWith("public.")).length > 5) {
    warnings.push("public schema contains multiple tables not present in prisma/schema.prisma — expect a large baseline diff if introspecting.");
  }

  let baselineRisk = "unknown";
  if (!reachable) baselineRisk = "unreachable_database";
  else if (!prismaMigrationsExists && (tablesInPrismaNotObserved.length > 0 || tables.length > 80))
    baselineRisk = "high_non_empty_without_prisma_migration_history";
  else if (!prismaMigrationsExists) baselineRisk = "elevated_missing_prisma_migrations";
  else if (tablesInPrismaNotObserved.length > 0 || tablesInDatabaseNotInPrisma.length > 0) baselineRisk = "medium_schema_drift";
  else baselineRisk = "lower_observed_alignment";

  const safeToBaselineNow = false;
  let reason =
    "Default false for production voter/campaign data: do not baseline until operator-reviewed plan exists.";
  let nextStep = "Review JSON + markdown, reconcile Prisma history vs live DB with a governed migration strategy (not blind introspect/push).";

  if (!reachable) {
    reason = "Database was not reachable; no live comparison.";
    nextStep = "Fix DATABASE_URL / network, then re-run this audit.";
  } else if (!prismaMigrationsExists) {
    reason =
      "Live database has no _prisma_migrations table while Prisma expects migration history for deploy — combined with non-trivial public/auth objects, blind baseline is unsafe.";
    nextStep =
      "Use a human-reviewed path (e.g. shadow DB or SQL-backed baseline plan) before migrate deploy / db push; keep this audit as the pre-change snapshot.";
  } else if (tablesInPrismaNotObserved.length === 0 && tablesInDatabaseNotInPrisma.filter((t) => t.startsWith("public.")).length === 0) {
    reason = "Alignment looks strong, but production baseline remains operator-gated.";
    nextStep = "If migration history is trusted, proceed only with normal change control — still avoid blind reset.";
  }

  return {
    schemaVersion: "1.0",
    slice: SLICE,
    generatedAt: new Date().toISOString(),
    mode: "read_only_metadata_audit",
    database: {
      reachable,
      schemasInspected: SCHEMAS_INSPECTED,
      prismaMigrationsTableExists: Boolean(prismaMigrationsExists),
    },
    observed: {
      tables,
      enums,
      estimatedRowsByTable,
    },
    prismaExpected: {
      models,
      mappedTables,
    },
    comparison: {
      tablesInDatabaseNotInPrisma,
      tablesInPrismaNotObserved,
      highValueTables,
      baselineRisk,
    },
    recommendation: {
      safeToBaselineNow,
      reason,
      nextStep,
    },
    warnings,
  };
}

function computeNextRecommendedSlice(audit) {
  if (!audit.database.reachable) {
    return {
      id: "REDDIRT-PRODUCTION-DB-SCHEMA-RECONCILIATION-1.0",
      rationale:
        "Database unreachable from this audit run — confirm DATABASE_URL, network, and pooler/session mode before any baseline or migration plan.",
    };
  }
  const pubExtra = audit.comparison.tablesInDatabaseNotInPrisma.filter((t) => t.startsWith("public."));
  const prismaMissing = audit.comparison.tablesInPrismaNotObserved.length;
  const majorDrift =
    prismaMissing > 5 ||
    pubExtra.length > 5 ||
    audit.comparison.baselineRisk === "high_non_empty_without_prisma_migration_history";

  if (majorDrift) {
    return {
      id: "REDDIRT-PRODUCTION-DB-SCHEMA-RECONCILIATION-1.0",
      rationale:
        "Large Prisma/public mismatch, multiple public tables outside Prisma, or elevated baseline risk — reconcile live schema vs repo before a baseline packet.",
    };
  }

  if (prismaMissing === 0 && pubExtra.length <= 3) {
    return {
      id: "REDDIRT-PRODUCTION-DB-BASELINE-PLAN-1.0",
      rationale:
        "Public schema largely matches Prisma-mapped tables; operator may proceed to a written baseline / migration-history plan under change control (script policy still keeps safeToBaselineNow false until humans approve).",
    };
  }

  return {
    id: "REDDIRT-PRODUCTION-DB-SCHEMA-RECONCILIATION-1.0",
    rationale:
      "Bounded but non-trivial drift between Prisma expectations and observed public tables — reconcile naming, Supabase-only objects, or multi-schema edges before baseline.",
  };
}

function truncateMdList(items, max = 60) {
  if (!items.length) return "_None._";
  const head = items.slice(0, max);
  const lines = head.map((x) => `- \`${String(x).replace(/`/g, "'")}\``);
  if (items.length > max) lines.push(`- … _${items.length - max} more — see \`data/production-db-baseline-audit.json\`._`);
  return lines.join("\n");
}

function rowEstimateFor(audit, schema, table) {
  const row = (audit.observed.estimatedRowsByTable || []).find(
    (r) => lower(r.schema) === lower(schema) && lower(r.table) === lower(table),
  );
  if (!row) return "—";
  return String(row.estimatedRows);
}

function writeMarkdown(audit) {
  const next = computeNextRecommendedSlice(audit);
  const publicTables = audit.observed.tables.filter((t) => t.startsWith("public."));
  const authTables = audit.observed.tables.filter((t) => t.startsWith("auth."));
  const pubExtra = audit.comparison.tablesInDatabaseNotInPrisma.filter((t) => t.startsWith("public."));
  const highValueLines =
    audit.comparison.highValueTables.length === 0
      ? "_None (name-pattern match on this run)._"
      : audit.comparison.highValueTables
          .map((fq) => {
            const [sch, tbl] = fq.includes(".") ? fq.split(".") : ["public", fq];
            const est = rowEstimateFor(audit, sch, tbl);
            return `- \`${fq.replace(/`/g, "'")}\` — estimated rows (\`pg_class.reltuples\`): **${est}**`;
          })
          .join("\n");

  return [
    `# Production database baseline audit (read-only)`,
    ``,
    `**Slice:** \`${audit.slice}\` · **Schema version:** \`${audit.schemaVersion}\` · **Generated:** ${audit.generatedAt}`,
    ``,
    `## Purpose`,
    ``,
    `Provide a **read-only** snapshot of PostgreSQL **catalog metadata** for the database pointed at by \`DATABASE_URL\`, scoped to **public** and **auth**, so operators can judge **Prisma baseline / migration risk** without exporting voter rows or mutating the database.`,
    ``,
    `## Why this audit exists`,
    ``,
    `Netlify and CI may fail with **Prisma P3005** when the database is **non-empty** and lacks **\`_prisma_migrations\`**. A blind \`prisma db pull\`, baseline, \`migrate resolve\`, \`db push\`, or reset against a database that holds **voter file** and **campaign** data is unacceptable. This audit captures **what exists** (table names, enum names, planner statistics) **before** any migration tooling runs.`,
    ``,
    `## What was inspected`,
    ``,
    `- **Connection:** \`DATABASE_URL\` (value **never** printed by this script).`,
    `- **information_schema.tables** — base tables in \`public\` and \`auth\`.`,
    `- **information_schema.columns** — single aggregate probe (row count only) to prove column catalog access without listing columns in markdown.`,
    `- **pg_class** + **pg_namespace** — ordinary tables; **\`reltuples\`** used as **estimated** row counts (not exact counts).`,
    `- **pg_type** + **pg_enum** — enum types in \`public\` and \`auth\`.`,
    `- **Prisma schema:** \`prisma/schema.prisma\` — model names and \`@@map("…")\` table names when present.`,
    `- **Migration table probe:** whether **\`public._prisma_migrations\`** exists.`,
    ``,
    `## What was not inspected`,
    ``,
    `- **No** application row data, voter payloads, email bodies, or file contents.`,
    `- **No** sequences, extensions, RLS policies, views, materialized views, functions, triggers, or foreign-key graphs (unless implied by table list only).`,
    `- **No** schemas outside **public** and **auth** (e.g. \`storage\`, \`graphql_public\`).`,
    `- **No** performance benchmarks, lock checks, or replication status.`,
    `- **No** secrets: URLs, passwords, tokens are not written to disk by this tool.`,
    ``,
    `## Existing migration history status`,
    ``,
    `- **\`public._prisma_migrations\` present:** **${audit.database.prismaMigrationsTableExists}**`,
    `- **Database reachable:** **${audit.database.reachable}**`,
    ``,
    `_Prisma \`migrate deploy\` expects migration history on the target database unless an operator-approved baseline strategy says otherwise._`,
    ``,
    `## Public/auth schema summary`,
    ``,
    `- **Observed base tables (all schemas in scope):** ${audit.observed.tables.length}`,
    `  - **public:** ${publicTables.length}`,
    `  - **auth:** ${authTables.length}`,
    `- **Observed enums:** ${audit.observed.enums.length}`,
    `- **Prisma models (expected public tables by default):** ${audit.prismaExpected.models.length}`,
    ``,
    `### public tables (${publicTables.length})`,
    ``,
    truncateMdList(publicTables, 80),
    ``,
    `### auth tables (${authTables.length}, sample)`,
    ``,
    truncateMdList(authTables, 40),
    ``,
    `## High-value data tables`,
    ``,
    `Tables whose **names** match campaign-sensitive keywords (\`voter\`, \`contact\`, \`profile\`, \`county\`, \`email\`, \`audience\`, \`relational\`, \`event\` — case-insensitive). **This is naming heuristics only**, not a data classification.`,
    ``,
    highValueLines,
    ``,
    `## Prisma expected table comparison`,
    ``,
    `- **Prisma-mapped public tables not observed in \`information_schema\`:** ${audit.comparison.tablesInPrismaNotObserved.length}`,
    `- **Observed tables not mapped in Prisma** (includes all \`auth.*\` and any Supabase-only \`public.*\`): ${audit.comparison.tablesInDatabaseNotInPrisma.length}`,
    ``,
    `### Sample: public tables not in Prisma (\`${pubExtra.length}\` total)`,
    ``,
    truncateMdList(pubExtra, 40),
    ``,
    `### Sample: Prisma tables missing from public snapshot (\`${audit.comparison.tablesInPrismaNotObserved.length}\` total)`,
    ``,
    truncateMdList(audit.comparison.tablesInPrismaNotObserved, 40),
    ``,
    `## Baseline risk`,
    ``,
    `**Heuristic label:** \`${audit.comparison.baselineRisk}\``,
    ``,
    `- **Script policy \`safeToBaselineNow\`:** **${audit.recommendation.safeToBaselineNow}** (always **false** until explicit human governance overrides this document).`,
    ``,
    `### Warnings from this run`,
    ``,
    audit.warnings.length ? audit.warnings.map((w) => `- ${w}`).join("\n") : `_None._`,
    ``,
    `## Recommended next step`,
    ``,
    audit.recommendation.nextStep,
    ``,
    `**Narrative:** ${audit.recommendation.reason}`,
    ``,
    `**Steering (computed):** **\`${next.id}\`** — ${next.rationale}`,
    ``,
    `## Absolute forbidden actions`,
    ``,
    `On the **production** (or production-equivalent) database targeted by this audit:`,
    ``,
    `- **No** \`prisma migrate reset\`, **no** destructive SQL (\`DROP\`, \`TRUNCATE\`, bulk \`DELETE\`).`,
    `- **No** \`prisma db push\` against shared voter/campaign data without an approved plan.`,
    `- **No** \`prisma migrate resolve\` that lies about migration history.`,
    `- **No** data exports of voter rolls or PII as part of “baseline debugging”.`,
    `- **No** committing \`.env\`, secrets, or full connection strings into the repo, docs, or chat.`,
    ``,
    `## Operator checklist before any baseline`,
    ``,
    `- [ ] Confirm **\`DATABASE_URL\`** points at the **intended** environment (not a disposable or default Supabase project).`,
    `- [ ] Re-run \`node scripts/audit-production-db-baseline.mjs\` and archive \`data/production-db-baseline-audit.json\` with a dated filename if you keep history.`,
    `- [ ] Read **Warnings** and **Prisma comparison** sections above; resolve “wrong database” signals before interpreting drift.`,
    `- [ ] Ensure **\`DIRECT_URL\` / session** strategy is documented for migration hosts if using a pooler on \`DATABASE_URL\`.`,
    `- [ ] Obtain **explicit** approval for the next slice (**\`${next.id}\`**) before Prisma baseline or migration repair.`,
    `- [ ] Run \`npm run email:db:diagnose\` / gates relevant to your lane **after** DB target is confirmed.`,
    ``,
    `---`,
    ``,
    `_Machine-readable twin: [\`data/production-db-baseline-audit.json\`](../data/production-db-baseline-audit.json). After audit, run **\`node scripts/reconcile-production-db-schema.mjs\`** for naming or legacy drift → [\`docs/production-db-schema-reconciliation.md\`](./production-db-schema-reconciliation.md)._`,
    ``,
  ].join("\n");
}

function writeHandoffReport(audit) {
  const next = computeNextRecommendedSlice(audit);
  const pubExtra = audit.comparison.tablesInDatabaseNotInPrisma.filter((t) => t.startsWith("public."));
  return [
    `# REDDIRT-PRODUCTION-DB-BASELINE-AUDIT-1.0 — required report`,
    ``,
    `**Lane:** \`RedDirt/\` only · **Generated:** ${audit.generatedAt}`,
    ``,
    `## Slice summary`,
    ``,
    `Read-only catalog audit (**${SLICE}**) before Prisma baseline, \`migrate resolve\`, \`db push\`, or reset on non-disposable Supabase data. Outputs JSON + operator markdown; **no** DB writes.`,
    ``,
    `## Files created`,
    ``,
    `_Per run, the script (re)materializes:_`,
    ``,
    `- \`data/production-db-baseline-audit.json\` — structured audit (\`schemaVersion\` **1.0**).`,
    `- \`docs/production-db-baseline-audit.md\` — operator markdown (required sections).`,
    `- \`develop_notes/REDDIRT_PRODUCTION_DB_BASELINE_AUDIT_1_0_REPORT.md\` — this report.`,
    ``,
    `## Files modified`,
    ``,
    `- \`scripts/audit-production-db-baseline.mjs\` — source for the audit (change in repo, not overwritten by the script).`,
    `- \`.gitignore\` — should list Supabase introspection scratch files (see **Scratch File Protection** in repo).`,
    ``,
    `## Read-only proof`,
    ``,
    `- Script uses **fixed \`SELECT\`** statements only (\`information_schema\`, \`pg_class\`, \`pg_namespace\`, \`pg_type\`, \`pg_enum\`).`,
    `- **No** \`INSERT\` / \`UPDATE\` / \`DELETE\` / \`DROP\` / \`TRUNCATE\`.`,
    `- **No** application row payloads in JSON or markdown.`,
    ``,
    `## DB baseline status`,
    ``,
    `- **Reachable:** ${audit.database.reachable}`,
    `- **\`_prisma_migrations\` exists:** ${audit.database.prismaMigrationsTableExists}`,
    `- **Observed tables (public+auth):** ${audit.observed.tables.length}`,
    `- **Prisma models:** ${audit.prismaExpected.models.length}`,
    `- **Public tables not in Prisma:** ${pubExtra.length}`,
    `- **Prisma public tables not observed:** ${audit.comparison.tablesInPrismaNotObserved.length}`,
    `- **Baseline risk (heuristic):** \`${audit.comparison.baselineRisk}\``,
    ``,
    `## High-value data protection status`,
    ``,
    `- **Name-pattern “high value” tables:** ${audit.comparison.highValueTables.length} (metadata only; see \`docs/production-db-baseline-audit.md\`).`,
    `- **Voter / PII row export:** **not performed** by this slice.`,
    ``,
    `## Scratch file protection`,
    ``,
    `The following paths must stay in \`.gitignore\` (local introspection / diff scratch only):`,
    ``,
    `- \`tmp-supabase-introspection.schema.prisma\``,
    `- \`supabase-introspection.prisma\``,
    `- \`supabase-introspection.stderr.txt\``,
    `- \`supabase-to-local-prisma-diff.sql\``,
    `- \`supabase-to-local-prisma-diff.stderr.txt\``,
    ``,
    `## Checks`,
    ``,
    `- \`node scripts/audit-production-db-baseline.mjs\` — regenerates JSON, \`docs/production-db-baseline-audit.md\`, and this report.`,
    `- \`npm run typecheck\` — lane TypeScript.`,
    `- \`npm run check\` — lint + typecheck + build.`,
    `- \`npm run email:no-send-scan\` — no-send governance scan (Comms lane).`,
    ``,
    `## Risks / limitations`,
    ``,
    `- **\`reltuples\`** are **estimates**; do not use for compliance-level row counts.`,
    `- **Wrong \`DATABASE_URL\`** produces a valid-looking audit that does **not** describe the campaign database.`,
    `- **Auth schema** tables always appear as “not in Prisma” for a typical single-schema Prisma app — expected.`,
    `- JSON shape is stable for automation; **do not** treat \`safeToBaselineNow\` as human approval.`,
    ``,
    `## Next recommended slice`,
    ``,
    `**${next.id}**`,
    ``,
    `${next.rationale}`,
    ``,
  ].join("\n");
}

async function main() {
  if (!process.env.DATABASE_URL || !String(process.env.DATABASE_URL).trim()) {
    console.error("audit-production-db-baseline: DATABASE_URL is required (not printing value).");
    process.exitCode = 1;
    const prismaText = existsSync(SCHEMA_PATH) ? readFileSync(SCHEMA_PATH, "utf8") : "";
    const prismaModels = prismaText ? parsePrismaModels(prismaText) : [];
    const audit = buildAuditPayload({
      reachable: false,
      prismaMigrationsExists: false,
      tableRows: [],
      enumRows: [],
      relRows: [],
      prismaModels,
      errorMessage: "DATABASE_URL missing",
    });
    ensureDirForFile(DATA_PATH);
    writeFileSync(DATA_PATH, jsonStringifySafe(audit), "utf8");
    writeFileSync(DOC_PATH, writeMarkdown(audit), "utf8");
    ensureDirForFile(HANDOFF_PATH);
    writeFileSync(HANDOFF_PATH, writeHandoffReport(audit), "utf8");
    console.log(`audit-production-db-baseline: wrote ${HANDOFF_PATH}`);
    return;
  }

  const prismaText = readFileSync(SCHEMA_PATH, "utf8");
  const prismaModels = parsePrismaModels(prismaText);

  let reachable = false;
  let prismaMigrationsExists = false;
  let tableRows = [];
  let enumRows = [];
  let relRows = [];
  let errorMessage = "";

  try {
    let bundle = await runWithPg(SQL);
    if (!bundle) bundle = await runWithPrisma(SQL);

    reachable = true;
    const existsVal = pick(bundle.prismaMigrations, "prisma_migrations_exists", "PRISMA_MIGRATIONS_EXISTS");
    prismaMigrationsExists = existsVal === true || existsVal === "true" || existsVal === "t" || existsVal === 1;

    tableRows = bundle.tables || [];
    enumRows = bundle.enums || [];

    relRows = bundle.relTuples || [];
  } catch (e) {
    reachable = false;
    errorMessage = redactError(e);
  }

  const audit = buildAuditPayload({
    reachable,
    prismaMigrationsExists,
    tableRows,
    enumRows,
    relRows,
    prismaModels,
    errorMessage,
  });

  ensureDirForFile(DATA_PATH);
  writeFileSync(DATA_PATH, jsonStringifySafe(audit), "utf8");
  writeFileSync(DOC_PATH, writeMarkdown(audit), "utf8");
  ensureDirForFile(HANDOFF_PATH);
  writeFileSync(HANDOFF_PATH, writeHandoffReport(audit), "utf8");

  console.log(`audit-production-db-baseline: wrote ${DATA_PATH}`);
  console.log(`audit-production-db-baseline: wrote ${DOC_PATH}`);
  console.log(`audit-production-db-baseline: wrote ${HANDOFF_PATH}`);
  if (!reachable) {
    console.error("audit-production-db-baseline: database unreachable; JSON documents failure state.");
    process.exitCode = 1;
  }
}

function redactError(e) {
  const msg = (e && e.message) || String(e);
  return msg
    .replace(/postgresql:\/\/[^\s"'<>]+/gi, "[redacted]")
    .replace(/postgres:\/\/[^\s"'<>]+/gi, "[redacted]")
    .replace(/password=[^\s&]+/gi, "password=[redacted]")
    .slice(0, 800);
}

function jsonStringifySafe(obj) {
  return JSON.stringify(
    obj,
    (_, v) => (typeof v === "bigint" ? Number(v) : v),
    2,
  );
}

main().catch((e) => {
  console.error("audit-production-db-baseline: fatal (no URL printed):", redactError(e));
  process.exitCode = 1;
});
