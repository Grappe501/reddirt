#!/usr/bin/env node
/**
 * REDDIRT-PRODUCTION-DB-SCHEMA-RECONCILIATION-1.0 — offline schema reconciliation (no DB).
 *
 * Reads production-db-baseline-audit.json + prisma/schema.prisma + prisma migration.sql files per folder.
 * Never uses DATABASE_URL or opens a socket. Never emits executable migration SQL.
 *
 * Usage (from RedDirt/):
 *   node scripts/reconcile-production-db-schema.mjs
 */

import { existsSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REDDIRT_ROOT = join(__dirname, "..");
const AUDIT_PATH = join(REDDIRT_ROOT, "data", "production-db-baseline-audit.json");
const SCHEMA_PATH = join(REDDIRT_ROOT, "prisma", "schema.prisma");
const MIGRATIONS_DIR = join(REDDIRT_ROOT, "prisma", "migrations");
const OUT_JSON = join(REDDIRT_ROOT, "data", "production-db-schema-reconciliation.json");
const OUT_MD = join(REDDIRT_ROOT, "docs", "production-db-schema-reconciliation.md");
const HANDOFF_MD = join(REDDIRT_ROOT, "develop_notes", "REDDIRT_PRODUCTION_DB_SCHEMA_RECONCILIATION_1_0_REPORT.md");

const SLICE = "REDDIRT-PRODUCTION-DB-SCHEMA-RECONCILIATION-1.0";
const SOURCE_AUDIT = "data/production-db-baseline-audit.json";

const ABSOLUTE_DO_NOT = [
  "npx prisma migrate deploy",
  "npx prisma migrate resolve",
  "npx prisma db push",
  "npx prisma migrate reset",
];

const HIGH_VALUE_TABLE_RE = /voter|contact|county|email|event|profile|audience|relational|path_to_victory/i;
const LEGACY_PREFIX_RE = /^ar02_/i;

/** Curated legacy / dual-app table name hints (lowercase). Operator-maintained. */
const LEGACY_ALIASES = {
  User: ["users", "profiles"],
  County: ["counties"],
  WorkflowIntake: ["workflow_intakes", "workflow_intake", "intakes"],
  EventRequest: ["event_requests"],
  SearchChunk: ["search_chunks", "search_chunk"],
  VoterRecord: ["voter_records", "voters", "voter_registry", "ar02_voters", "voter_profiles"],
  RelationalContact: ["relational_contacts", "contacts"],
  CampaignEvent: ["campaign_events", "events"],
  Submission: ["submissions"],
  VolunteerProfile: ["volunteer_profiles", "volunteers"],
  CommunicationThread: ["communication_threads"],
  CommunicationMessage: ["communication_messages"],
  MediaAsset: ["media_assets"],
  Person: ["people"],
  CountyCampaignStats: ["county_campaign_targets", "county_results"],
  EventSignup: ["volunteer_signups"],
  Task: ["tasks"],
  Donation: ["donations"],
  Election: ["elections"],
  Candidate: ["candidates"],
  Contest: ["contests"],
  PrecinctScore: ["precinct_scores"],
  GeographicUnit: ["geographic_units"],
  Location: ["locations"],
  Organization: ["organizations"],
  Workspace: ["workspaces"],
};

function lower(s) {
  return String(s || "").toLowerCase();
}

function stripSqlComments(sql) {
  let s = sql.replace(/\/\*[\s\S]*?\*\//g, " ");
  s = s.replace(/--[^\n]*/g, " ");
  return s;
}

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
  const m = clean.match(/CREATE\s+(?:UNIQUE\s+)?INDEX/gi);
  return m ? m.length : 0;
}

function pascalToSnake(name) {
  return name
    .replace(/([a-z0-9])([A-Z])/g, "$1_$2")
    .replace(/([A-Z])([A-Z][a-z])/g, "$1_$2")
    .toLowerCase();
}

function pluralizeSnake(snake) {
  if (snake.endsWith("s") || snake.endsWith("x")) return `${snake}es`;
  if (snake.endsWith("y") && !/[aeiou]y$/.test(snake)) return `${snake.slice(0, -1)}ies`;
  if (snake.endsWith("ch") || snake.endsWith("sh")) return `${snake}es`;
  return `${snake}s`;
}

function parsePrismaModelsExtended(schemaText) {
  const models = [];
  const re = /\bmodel\s+(\w+)\s*\{/g;
  const starts = [];
  let m;
  while ((m = re.exec(schemaText)) !== null) {
    starts.push({ name: m[1], brace: m.index + m[0].length - 1 });
  }
  for (const { name, brace } of starts) {
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
    const schemaM = body.match(/@@schema\(\s*"([^"]+)"\s*\)/);
    const prismaSchema = schemaM ? schemaM[1] : "public";
    const mappedTable = mapM ? mapM[1] : null;
    const prismaTableName = mappedTable || name;
    const fieldMaps = [];
    for (const x of body.matchAll(/@map\(\s*"([^"]+)"\s*\)/g)) {
      fieldMaps.push(x[1]);
    }
    models.push({
      modelName: name,
      prismaTableName,
      mappedTableName: mappedTable,
      prismaSchema,
      fieldMaps,
    });
  }
  return models;
}

function loadObservedPublic(audit) {
  const map = new Map();
  for (const fq of audit.observed?.tables || []) {
    if (!fq.startsWith("public.")) continue;
    const t = fq.slice("public.".length);
    map.set(lower(t), t);
  }
  return map;
}

function resolveMatch(observedMap, model) {
  const pt = model.prismaTableName;
  const tries = [];
  const add = (cand, typ) => {
    if (cand == null || cand === "") return;
    const k = lower(cand);
    if (!tries.some((x) => x[0] === k)) tries.push([k, typ]);
  };
  add(pt, "case_insensitive");
  add(pascalToSnake(model.modelName), "inferred_snake_case");
  add(pluralizeSnake(pascalToSnake(model.modelName)), "inferred_plural_snake");
  add(pascalToSnake(pt), "inferred_snake_case");
  add(pluralizeSnake(pascalToSnake(pt)), "inferred_plural_snake");
  for (const a of LEGACY_ALIASES[model.modelName] || []) add(a, "legacy_alias");

  for (const [k, typ] of tries) {
    if (observedMap.has(k)) {
      const obs = observedMap.get(k);
      const isExactString = obs === pt;
      const matchType = isExactString ? "exact" : typ;
      return { observed: obs, matchType };
    }
  }
  return { observed: null, matchType: "none" };
}

function classifyStatus(observed, matchType, modelName) {
  if (!observed) return "missing_safe_to_create_candidate";
  if (modelName === "User" && observed === "users") return "legacy_preserve_do_not_touch";
  if (LEGACY_PREFIX_RE.test(observed)) return "needs_mapping_review";
  if (matchType === "legacy_alias") {
    if (modelName === "User" && (observed === "users" || observed === "profiles"))
      return "legacy_preserve_do_not_touch";
    return "needs_mapping_review";
  }
  if (matchType === "inferred_snake_case" || matchType === "inferred_plural_snake") {
    if (HIGH_VALUE_TABLE_RE.test(observed)) return "needs_mapping_review";
    return "prisma_managed_candidate";
  }
  if (matchType === "case_insensitive" || matchType === "exact") return "prisma_managed_candidate";
  return "needs_mapping_review";
}

function riskLevel(observed, matchType, status, modelName) {
  if (status === "unsafe_unknown") return "high";
  if (!observed) return "medium";
  if (LEGACY_PREFIX_RE.test(observed)) return "high";
  if (HIGH_VALUE_TABLE_RE.test(observed) && matchType !== "case_insensitive" && matchType !== "exact")
    return "high";
  if (HIGH_VALUE_TABLE_RE.test(modelName) && status !== "prisma_managed_candidate") return "medium";
  return "low";
}

function buildNotes(model, matchType, observed) {
  const parts = [];
  if (model.mappedTableName) parts.push(`@@map("${model.mappedTableName}")`);
  if (model.fieldMaps.length) parts.push(`${model.fieldMaps.length} field(s) with @map`);
  if (matchType === "legacy_alias") parts.push("matched via curated legacy alias list");
  if (observed && LEGACY_PREFIX_RE.test(observed)) parts.push("ar02_* warehouse table — verify semantics");
  return parts.join("; ").slice(0, 280) || "—";
}

function listMigrationsLexical() {
  return readdirSync(MIGRATIONS_DIR)
    .filter((n) => {
      const p = join(MIGRATIONS_DIR, n);
      try {
        return statSync(p).isDirectory() && existsSync(join(p, "migration.sql"));
      } catch {
        return false;
      }
    })
    .sort((a, b) => a.localeCompare(b));
}

function baselineStrategyFromCounts(matrix, databaseOnlyTables, legacyPreserveTables) {
  const missing = matrix.filter((r) => !r.observedDbMatch).length;
  const review = matrix.filter((r) => r.status === "needs_mapping_review").length;
  const preserve = matrix.filter((r) => r.status === "legacy_preserve_do_not_touch").length;
  const matched = matrix.length - missing;

  if (missing > 80 && databaseOnlyTables.length > 50 && legacyPreserveTables.length > 15) {
    return {
      strategy: "split_legacy_and_prisma_domains",
      safeToBaselineNow: false,
      reason:
        "Large legacy-only public surface alongside most Prisma models unmatched by name — treat warehouse / app domains separately before any migrate baseline.",
      nextRecommendedSlice: "REDDIRT-PRISMA-SCHEMA-MAP-ALIGNMENT-1.0",
    };
  }
  if (review > 25 || legacyPreserveTables.length > 20) {
    return {
      strategy: "manual_schema_reconciliation_required",
      safeToBaselineNow: false,
      reason:
        "Many models need @@map / lineage review or legacy preservation decisions; operator and DBA must close mapping gaps before Prisma history can be applied safely.",
      nextRecommendedSlice: "REDDIRT-PRISMA-SCHEMA-MAP-ALIGNMENT-1.0",
    };
  }
  if (missing < 20 && review < 8 && matched / matrix.length >= 0.85) {
    return {
      strategy: "baseline_after_mapping_review",
      safeToBaselineNow: false,
      reason:
        "Majority of models resolve to observed tables with bounded open reviews — after explicit @@map / shadow-DB sign-off, a baseline execution packet may be considered.",
      nextRecommendedSlice: "REDDIRT-PRODUCTION-DB-BASELINE-EXECUTION-1.0",
    };
  }
  return {
    strategy: "do_not_baseline_yet",
    safeToBaselineNow: false,
    reason:
      "Drift posture does not yet meet conservative thresholds for baseline-after-review; continue reconciliation and shadow proofs.",
    nextRecommendedSlice: "REDDIRT-PRISMA-SCHEMA-MAP-ALIGNMENT-1.0",
  };
}

function isHighValueLegacyTableName(name) {
  return HIGH_VALUE_TABLE_RE.test(name) || LEGACY_PREFIX_RE.test(name) || lower(name).includes("path_to_victory");
}

function truncateBullets(items, max = 40) {
  if (!items.length) return "_None._";
  const head = items.slice(0, max);
  const lines = head.map((x) => `- \`${String(x).replace(/`/g, "'")}\``);
  if (items.length > max) lines.push(`- _…${items.length - max} more in JSON._`);
  return lines.join("\n");
}

function writeMarkdown(payload) {
  const { audit, matrix, migrationFootprints, databaseOnlyTables, legacyPreserveTables, missingPrismaTables, mappingReviewNeeded, baselineRecommendation } =
    payload;
  const exact = matrix.filter((r) => r.matchType === "case_insensitive" || r.matchType === "exact");
  const snake = matrix.filter((r) => r.matchType === "inferred_snake_case" || r.matchType === "inferred_plural_snake");
  const legacyAlias = matrix.filter((r) => r.matchType === "legacy_alias");

  return [
    `# Production database schema reconciliation (offline)`,
    ``,
    `**Slice:** \`${SLICE}\` · **Generated:** ${payload.generatedAt} · **Source:** \`${SOURCE_AUDIT}\``,
    ``,
    `## Purpose`,
    ``,
    `Reconcile **read-only audit** public table names with **Prisma models** and **migration SQL** footprints — **offline only** (no \`DATABASE_URL\`, no Postgres I/O, no executable migration output). Goal: explain whether drift is **true missing schema**, **naming drift**, **legacy voter warehouse**, or **missing \`@@map\`**, so production voter/campaign data is never destroyed by speed.`,
    ``,
    `## Source audit summary`,
    ``,
    `- **Audit slice:** \`${audit.slice || ""}\` · **Generated:** ${audit.generatedAt || ""}`,
    `- **Reachable:** ${audit.database?.reachable} · **\`_prisma_migrations\`:** ${audit.database?.prismaMigrationsTableExists}`,
    `- **Observed public tables:** ${payload.databaseIdentity.observedPublicTableCount} · **Prisma models:** ${payload.databaseIdentity.prismaExpectedModelCount}`,
    ``,
    `## Why baseline is blocked`,
    ``,
    `Prisma expects **PascalCase** tables (e.g. \`User\`, \`WorkflowIntake\`) while production shows **snake_case / legacy** names (\`users\`, \`event_requests\`, \`ar02_voters\`). Without reconciliation, **\`migrate deploy\`**, **\`migrate resolve\`**, or **\`db push\`** can mis-apply DDL or corrupt history. **Correct DB is identified** — baseline remains blocked until mapping truth is human-approved.`,
    ``,
    `## Prisma model/table interpretation`,
    ``,
    `Each model’s physical table is \`@@map("…")\` when present, otherwise the **model name** (Prisma default). Field-level \`@map\` is counted for operator review (column drift) but does not change table matching here.`,
    ``,
    `## Database table interpretation`,
    ``,
    `Observed names come from **\`information_schema\`** via the audit (\`public.*\` only). Matching uses **exact / case / snake / plural / curated legacy aliases** — heuristics, not proof of semantic equivalence.`,
    ``,
    `## Exact matches`,
    ``,
    `- **Count (case-aligned / Prisma table name key):** ${exact.length}`,
    truncateBullets(
      exact.map((r) => `${r.modelName} → ${r.observedDbMatch}`),
      25,
    ),
    ``,
    `## Inferred snake_case/plural matches`,
    ``,
    `- **Count:** ${snake.length}`,
    truncateBullets(
      snake.map((r) => `${r.modelName} → ${r.observedDbMatch} (${r.matchType})`),
      25,
    ),
    ``,
    `## Legacy alias matches`,
    ``,
    `- **Count:** ${legacyAlias.length} (curated \`LEGACY_ALIASES\` in script — operator-maintained).`,
    truncateBullets(
      legacyAlias.map((r) => `${r.modelName} → ${r.observedDbMatch}`),
      25,
    ),
    ``,
    `## Legacy preserve tables`,
    ``,
    `High-value or warehouse-style **public** tables with **no** confident Prisma model owner in this reconciliation — **do not drop or truncate** while investigating.`,
    ``,
    `- **Count:** ${legacyPreserveTables.length}`,
    truncateBullets(legacyPreserveTables, 35),
    ``,
    `## Missing Prisma tables`,
    ``,
    `Models with **no** observed public match under current heuristics (safe **create** candidates only after shadow DB + governance — **not** on production blindly).`,
    ``,
    `- **Count:** ${missingPrismaTables.length}`,
    truncateBullets(missingPrismaTables, 35),
    ``,
    `## Migration footprint findings`,
    ``,
    `- **Migrations scanned:** ${migrationFootprints.length}`,
    `- Each entry lists \`CREATE TABLE\` names (Prisma-style), \`ALTER TABLE\` targets, type and index counts. See **\`data/production-db-schema-reconciliation.json\` → \`migrationFootprints\`**.`,
    ``,
    `## High-value data protection`,
    ``,
    `- This packet **never** exports rows; names and heuristics only.`,
    `- Treat **\`ar02_*\`**, **\`voter*\`**, **\`contacts\`**, **\`path_to_victory\`**, and similar as **production-critical** until a DBA-signed mapping exists.`,
    ``,
    `## Baseline recommendation`,
    ``,
    `- **Strategy:** \`${baselineRecommendation.strategy}\``,
    `- **\`safeToBaselineNow\`:** ${baselineRecommendation.safeToBaselineNow}`,
    `- **Reason:** ${baselineRecommendation.reason}`,
    `- **Next slice:** \`${baselineRecommendation.nextRecommendedSlice}\``,
    ``,
    `## Human review checklist`,
    ``,
    `- [ ] Re-run \`node scripts/audit-production-db-baseline.mjs\` if the Supabase target changed.`,
    `- [ ] Walk **\`mappingReviewNeeded\`** models in JSON with a DBA (semantic match, not string match).`,
    `- [ ] Decide **legacy domain** vs **Prisma app domain** tables; document **\`@@map\`** decisions in a follow-on packet.`,
    `- [ ] Run **shadow** \`prisma migrate deploy\` only on a **throwaway** database.`,
    `- [ ] Only then consider **\`REDDIRT-PRODUCTION-DB-BASELINE-EXECUTION-1.0\`** or similar — never skip reconciliation.`,
    ``,
    `## Absolute forbidden commands`,
    ``,
    ...ABSOLUTE_DO_NOT.map((c) => `- \`${c}\` on **production** until this reconciliation is closed and approved.`),
    ``,
    `## Next recommended slice`,
    ``,
    `**\`${baselineRecommendation.nextRecommendedSlice}\`** — close Prisma ↔ legacy naming and ownership before Netlify \`migrate deploy\` or baseline execution.`,
    ``,
    `---`,
    ``,
    `_Machine-readable: [\`data/production-db-schema-reconciliation.json\`](../data/production-db-schema-reconciliation.json)._`,
    ``,
    `_Prisma ↔ live table @@map alignment (offline): [\`docs/prisma-schema-map-alignment.md\`](../docs/prisma-schema-map-alignment.md) · [\`data/prisma-schema-map-alignment.json\`](../data/prisma-schema-map-alignment.json) · [\`develop_notes/REDDIRT_PRISMA_SCHEMA_MAP_ALIGNMENT_1_0_REPORT.md\`](../develop_notes/REDDIRT_PRISMA_SCHEMA_MAP_ALIGNMENT_1_0_REPORT.md) — \`node scripts/align-prisma-schema-map.mjs\`._`,
    ``,
  ].join("\n");
}

function writeHandoff(payload) {
  const br = payload.baselineRecommendation;
  return [
    `# REDDIRT-PRODUCTION-DB-SCHEMA-RECONCILIATION-1.0 — report`,
    ``,
    `**Lane:** \`RedDirt/\` only · **Generated:** ${payload.generatedAt}`,
    ``,
    `## Slice summary`,
    ``,
    `Offline reconciliation between **audit \`public.*\` table names** and **148 Prisma models** plus **70 migration SQL** files. Determines whether drift is missing schema, naming, legacy warehouse, or \`@@map\` gaps — **no DB mutations**, **no secrets**. Strategic posture: **correct DB found**, **production data protected**, **baseline still blocked**, **schema reconciliation required** — then Netlify and product work (Email → Calendar → County dashboard → Path to Victory).`,
    ``,
    `## Files created`,
    ``,
    `- \`data/production-db-schema-reconciliation.json\``,
    `- \`docs/production-db-schema-reconciliation.md\``,
    `- \`develop_notes/REDDIRT_PRODUCTION_DB_SCHEMA_RECONCILIATION_1_0_REPORT.md\` (this file)`,
    ``,
    `## Inputs inspected`,
    ``,
    `- \`${SOURCE_AUDIT}\``,
    `- \`prisma/schema.prisma\` (models, \`@@map\`, \`@@schema\`, field \`@map\`)`,
    `- \`prisma/migrations/**/migration.sql\` (**${payload.migrationFootprints.length}** files)`,
    ``,
    `## Reconciliation summary`,
    ``,
    `- **Models in matrix:** ${payload.modelToTableMatrix.length}`,
    `- **DB-only (unmatched) public tables:** ${payload.databaseOnlyTables.length}`,
    `- **Legacy preserve list:** ${payload.legacyPreserveTables.length}`,
    `- **Missing Prisma (no observed match):** ${payload.missingPrismaTables.length}`,
    `- **Mapping review needed:** ${payload.mappingReviewNeeded.length}`,
    ``,
    `## Legacy/voter data protection status`,
    ``,
    `- **No row export.** Name-level heuristics only.`,
    `- High-value / \`ar02_*\` tables flagged in **\`legacyPreserveTables\`** and matrix **\`riskLevel\`** for operator visibility.`,
    ``,
    `## Baseline recommendation`,
    ``,
    `- **Strategy:** \`${br.strategy}\``,
    `- **Reason:** ${br.reason}`,
    `- **Next slice:** \`${br.nextRecommendedSlice}\``,
    ``,
    `## Governance status`,
    ``,
    `- **\`safeToBaselineNow\`:** ${br.safeToBaselineNow} — must remain false until execution packet approved.`,
    `- **Forbidden:** production \`migrate deploy\` / \`resolve\` / \`db push\` / \`reset\` (see JSON \`absoluteDoNotRunYet\`).`,
    ``,
    `## Checks`,
    ``,
    `- \`node scripts/reconcile-production-db-schema.mjs\``,
    `- \`npm run typecheck\``,
    `- \`npm run check\``,
    `- \`npm run email:no-send-scan\``,
    ``,
    `## Risks / limitations`,
    ``,
    `- Heuristic matching ≠ semantic truth (e.g. \`contacts\` could mean multiple domains).`,
    `- \`LEGACY_ALIASES\` must be curated; wrong entries skew **\`matchType\`**.`,
    `- Migration regex may miss exotic DDL.`,
    ``,
    `## Next recommended slice`,
    ``,
    `**${br.nextRecommendedSlice}**`,
    ``,
  ].join("\n");
}

function main() {
  process.chdir(REDDIRT_ROOT);
  if (!existsSync(AUDIT_PATH)) {
    console.error("reconcile-production-db-schema: missing", SOURCE_AUDIT);
    process.exit(1);
  }
  const audit = JSON.parse(readFileSync(AUDIT_PATH, "utf8"));
  const schemaText = readFileSync(SCHEMA_PATH, "utf8");
  const models = parsePrismaModelsExtended(schemaText);
  const observedMap = loadObservedPublic(audit);

  const modelToTableMatrix = [];
  const matchedDbKeys = new Set();

  for (const model of models) {
    const { observed, matchType } = resolveMatch(observedMap, model);
    const status = classifyStatus(observed, matchType, model.modelName);
    const rl = riskLevel(observed, matchType, status, model.modelName);
    if (observed) matchedDbKeys.add(lower(observed));

    modelToTableMatrix.push({
      modelName: model.modelName,
      prismaTableName: model.prismaTableName,
      mappedTableName: model.mappedTableName,
      observedDbMatch: observed,
      matchType,
      status,
      riskLevel: rl,
      notes: buildNotes(model, matchType, observed),
    });
  }

  const allPublic = [...observedMap.values()];
  const databaseOnlyTables = allPublic
    .filter((t) => !matchedDbKeys.has(lower(t)))
    .sort((a, b) => lower(a).localeCompare(lower(b)));

  const legacyPreserveTables = databaseOnlyTables.filter(
    (t) => isHighValueLegacyTableName(t) || LEGACY_PREFIX_RE.test(t) || lower(t).includes("warehouse"),
  );

  const missingPrismaTables = modelToTableMatrix.filter((r) => !r.observedDbMatch).map((r) => r.modelName);

  const mappingReviewNeeded = modelToTableMatrix
    .filter((r) => r.status === "needs_mapping_review" || r.status === "legacy_preserve_do_not_touch")
    .map((r) => r.modelName);

  const migrationFootprints = [];
  for (const dir of listMigrationsLexical()) {
    const sql = readFileSync(join(MIGRATIONS_DIR, dir, "migration.sql"), "utf8");
    const creates = extractCreateTables(sql);
    const alters = extractAlterTableTargets(sql);
    const types = extractCreateTypes(sql);
    migrationFootprints.push({
      migration: dir,
      createTables: [...new Set(creates.map((c) => c.table))],
      alterTargets: [...new Set(alters.map((c) => c.table))],
      createTypeCount: types.length,
      createIndexCount: countCreateIndexes(sql),
    });
  }

  const baselineRecommendation = baselineStrategyFromCounts(
    modelToTableMatrix,
    databaseOnlyTables,
    legacyPreserveTables,
  );

  const out = {
    schemaVersion: "1.0",
    slice: SLICE,
    generatedAt: new Date().toISOString(),
    mode: "offline_reconciliation_only",
    sourceAudit: SOURCE_AUDIT,
    databaseIdentity: {
      observedPublicTableCount: allPublic.length,
      prismaExpectedModelCount: models.length,
      prismaMigrationsTableExists: Boolean(audit.database?.prismaMigrationsTableExists),
    },
    modelToTableMatrix,
    migrationFootprints,
    databaseOnlyTables,
    legacyPreserveTables,
    missingPrismaTables,
    mappingReviewNeeded,
    baselineRecommendation,
    absoluteDoNotRunYet: ABSOLUTE_DO_NOT,
  };

  const mdPayload = {
    generatedAt: out.generatedAt,
    audit,
    matrix: modelToTableMatrix,
    migrationFootprints,
    databaseOnlyTables,
    legacyPreserveTables,
    missingPrismaTables,
    mappingReviewNeeded,
    baselineRecommendation,
    databaseIdentity: out.databaseIdentity,
    modelToTableMatrix,
  };

  writeFileSync(OUT_JSON, JSON.stringify(out, null, 2), "utf8");
  writeFileSync(OUT_MD, writeMarkdown(mdPayload), "utf8");
  writeFileSync(HANDOFF_MD, writeHandoff(mdPayload), "utf8");

  console.log(`reconcile-production-db-schema: wrote ${OUT_JSON}`);
  console.log(`reconcile-production-db-schema: wrote ${OUT_MD}`);
  console.log(`reconcile-production-db-schema: wrote ${HANDOFF_MD}`);
  console.log(
    `reconcile-production-db-schema: strategy=${baselineRecommendation.strategy} dbOnly=${databaseOnlyTables.length} missingModels=${missingPrismaTables.length}`,
  );
}

main();
