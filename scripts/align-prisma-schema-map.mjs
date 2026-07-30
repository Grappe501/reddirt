#!/usr/bin/env node
/**
 * REDDIRT-PRISMA-SCHEMA-MAP-ALIGNMENT-1.0 — offline Prisma ↔ live schema alignment plan.
 *
 * Reads audit + baseline plan + reconciliation JSON + prisma/schema.prisma + migration SQL.
 * Never connects to a database, never reads .env, never emits executable SQL.
 * Does not modify prisma/schema.prisma.
 *
 * Usage (from RedDirt/):
 *   node scripts/align-prisma-schema-map.mjs
 */

import { existsSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REDDIRT_ROOT = join(__dirname, "..");
const AUDIT_PATH = join(REDDIRT_ROOT, "data", "production-db-baseline-audit.json");
const PLAN_PATH = join(REDDIRT_ROOT, "data", "production-db-baseline-plan.json");
const RECON_PATH = join(REDDIRT_ROOT, "data", "production-db-schema-reconciliation.json");
const SCHEMA_PATH = join(REDDIRT_ROOT, "prisma", "schema.prisma");
const MIGRATIONS_DIR = join(REDDIRT_ROOT, "prisma", "migrations");
const OUT_JSON = join(REDDIRT_ROOT, "data", "prisma-schema-map-alignment.json");
const OUT_MD = join(REDDIRT_ROOT, "docs", "prisma-schema-map-alignment.md");
const HANDOFF_MD = join(REDDIRT_ROOT, "develop_notes", "REDDIRT_PRISMA_SCHEMA_MAP_ALIGNMENT_1_0_REPORT.md");

const SLICE = "REDDIRT-PRISMA-SCHEMA-MAP-ALIGNMENT-1.0";

const ABSOLUTE_DO_NOT = [
  "npx prisma migrate deploy",
  "npx prisma migrate resolve",
  "npx prisma db push",
  "npx prisma migrate reset",
];

const LEGACY_PREFIX = /^ar02_/i;
const RAW_INGEST_RE = /^ingestion_|_raw$|_raw_/i;

/** Curated @@map proposals (documentation only — not applied). */
const CURATED_MAP_PROPOSALS = [
  { modelName: "County", recommendedTable: "counties", confidence: "high", rationale: "Plural snake public table matches Prisma County semantics." },
  { modelName: "EventRequest", recommendedTable: "event_requests", confidence: "high", rationale: "Live event_requests aligns with Prisma EventRequest." },
  {
    modelName: "Submission",
    recommendedTable: null,
    confidence: "none",
    rationale:
      "Do not @@map to lowercase submissions — that physical table is legacy (module_id/raw_data) on the shared DB. RedDirt owns PascalCase \"Submission\" (Phase 1C).",
    doNotAutoMap: true,
  },
  { modelName: "MediaAsset", recommendedTable: "media_assets", confidence: "high", rationale: "Plural snake table present in audit." },
  {
    modelName: "WorkflowIntake",
    recommendedTable: null,
    confidence: "low",
    rationale: "Inspect workflow_intake / intakes / operator-owned intakes before any @@map; reconciliation may be ambiguous.",
  },
  {
    modelName: "VoterRecord",
    recommendedTable: null,
    confidence: "none",
    rationale: "Do not auto-map: live voter warehouse (voters, ar02_voters, voter_registry, etc.) may not match Prisma VoterRecord semantics — DBA review required.",
    doNotAutoMap: true,
  },
];

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
    const table = m[3] || m[4];
    if (table) out.push(table);
  }
  return out;
}

function listMigrationsLexical() {
  return readdirSync(MIGRATIONS_DIR)
    .filter((n) => {
      try {
        const p = join(MIGRATIONS_DIR, n);
        return statSync(p).isDirectory() && existsSync(join(p, "migration.sql"));
      } catch {
        return false;
      }
    })
    .sort((a, b) => a.localeCompare(b));
}

function parsePrismaModelsDeep(schemaText) {
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
    for (const x of body.matchAll(/@map\(\s*"([^"]+)"\s*\)/g)) fieldMaps.push(x[1]);
    const relationModels = extractRelationModels(body);
    models.push({
      modelName: name,
      prismaTableName,
      existingMappedTable: mappedTable,
      prismaSchema,
      fieldMapCount: fieldMaps.length,
      relationModels,
      blockPreview: body.replace(/\s+/g, " ").trim().slice(0, 200),
    });
  }
  return models;
}

function extractRelationModels(body) {
  const set = new Set();
  const re1 = /\b([A-Z][a-zA-Z0-9_]*)\s*\[\]\s*@relation/g;
  let m;
  while ((m = re1.exec(body)) !== null) set.add(m[1]);
  const re2 = /\b([A-Z][a-zA-Z0-9_]*)\?\s*@relation/g;
  while ((m = re2.exec(body)) !== null) set.add(m[1]);
  const re3 = /\b([A-Z][a-zA-Z0-9_]*)\s+@relation/g;
  while ((m = re3.exec(body)) !== null) {
    if (m[1] !== "fields" && m[1] !== "references") set.add(m[1]);
  }
  return [...set].sort();
}

function loadJson(path, label) {
  if (!existsSync(path)) {
    throw new Error(`Missing required file for ${label}: ${path}`);
  }
  return JSON.parse(readFileSync(path, "utf8"));
}

function authTablesFromAudit(audit) {
  return (audit.observed?.tables || []).filter((t) => t.startsWith("auth.")).sort();
}

function buildLegacyPreserveSet(reconciliation, audit) {
  const set = new Set((reconciliation.legacyPreserveTables || []).map(lower));
  for (const fq of audit.observed?.tables || []) {
    if (!fq.startsWith("public.")) continue;
    const t = fq.slice("public.".length);
    const l = lower(t);
    if (LEGACY_PREFIX.test(t) || l === "spatial_ref_sys" || RAW_INGEST_RE.test(l)) set.add(l);
  }
  return [...set].sort().map((l) => {
    const orig = (audit.observed?.tables || []).find((x) => x.startsWith("public.") && lower(x.slice(8)) === l);
    return orig ? orig.replace(/^public\./, "") : l;
  });
}

function deriveOwnershipClass(row, meta) {
  const { modelName } = row;
  const st = row.status;
  const mt = row.matchType;

  if (modelName === "User") return "legacy_preserve_do_not_touch";

  if (st === "legacy_preserve_do_not_touch") return "legacy_preserve_do_not_touch";

  if (modelName === "VoterRecord" || (modelName.startsWith("Voter") && mt === "legacy_alias"))
    return "unsafe_unknown";

  if (st === "needs_mapping_review") return "needs_explicit_map_review";

  if (st === "missing_safe_to_create_candidate") {
    if (/Voter|Relational|Contact|CampaignEvent/i.test(modelName)) return "needs_explicit_map_review";
    return "new_prisma_owned_table_candidate";
  }

  if (st === "prisma_managed_candidate") {
    if (meta.existingMappedTable) return "mapped_existing_table_candidate";
    if (mt === "exact" || mt === "case_insensitive") return "mapped_existing_table_candidate";
    return "needs_explicit_map_review";
  }

  return "unsafe_unknown";
}

function nextSliceDecision(unsafeUnknowns, mapReviewCount, proposedHighConfidence) {
  if (unsafeUnknowns.length > 8 || unsafeUnknowns.some((u) => u.modelName === "VoterRecord")) {
    return {
      strategy: "dba_review_first",
      nextRecommendedSlice: "REDDIRT-DBA-REVIEW-REQUIRED-1.0",
    };
  }
  if (mapReviewCount > 35 && proposedHighConfidence < 15) {
    return {
      strategy: "patch_plan_before_shadow",
      nextRecommendedSlice: "REDDIRT-PRISMA-SCHEMA-MAP-PATCH-PLAN-1.0",
    };
  }
  if (proposedHighConfidence >= 12 && unsafeUnknowns.length <= 5) {
    return {
      strategy: "shadow_migration_proof_ready",
      nextRecommendedSlice: "REDDIRT-SHADOW-DB-MIGRATION-PROOF-1.0",
    };
  }
  return {
    strategy: "patch_plan_before_shadow",
    nextRecommendedSlice: "REDDIRT-PRISMA-SCHEMA-MAP-PATCH-PLAN-1.0",
  };
}

function main() {
  process.chdir(REDDIRT_ROOT);
  const audit = loadJson(AUDIT_PATH, "audit");
  const baselinePlan = loadJson(PLAN_PATH, "baseline plan");
  const reconciliation = loadJson(RECON_PATH, "reconciliation");
  const schemaText = readFileSync(SCHEMA_PATH, "utf8");
  const prismaModels = parsePrismaModelsDeep(schemaText);
  const matrixByModel = new Map(
    (reconciliation.modelToTableMatrix || []).map((r) => [r.modelName, r]),
  );

  const supabaseAuthBoundary = authTablesFromAudit(audit);
  const legacyPreserveTables = buildLegacyPreserveSet(reconciliation, audit);

  const modelOwnershipMap = [];
  const newPrismaOwnedCandidates = [];
  const unsafeUnknowns = [];

  for (const meta of prismaModels) {
    const row = matrixByModel.get(meta.modelName) || {
      modelName: meta.modelName,
      prismaTableName: meta.prismaTableName,
      mappedTableName: meta.existingMappedTable,
      observedDbMatch: null,
      matchType: "none",
      status: "missing_safe_to_create_candidate",
      riskLevel: "medium",
      notes: "—",
    };
    const ownershipClassification = deriveOwnershipClass(row, meta);
    modelOwnershipMap.push({
      modelName: meta.modelName,
      prismaTableName: meta.prismaTableName,
      existingMappedTable: meta.existingMappedTable,
      prismaSchema: meta.prismaSchema,
      observedMatch: row.observedDbMatch,
      reconciliationStatus: row.status,
      reconciliationMatchType: row.matchType,
      ownershipClassification,
      fieldMapCount: meta.fieldMapCount,
      relationModels: meta.relationModels,
      notes:
        meta.modelName === "User"
          ? "Disambiguate public.users vs Supabase auth.users before any @@map or migrate."
          : row.notes || "—",
    });
    if (ownershipClassification === "new_prisma_owned_table_candidate") newPrismaOwnedCandidates.push(meta.modelName);
    if (ownershipClassification === "unsafe_unknown") unsafeUnknowns.push({ modelName: meta.modelName, reason: row.notes || "high ambiguity" });
  }

  const proposedMapRecommendations = CURATED_MAP_PROPOSALS.map((p) => ({
    modelName: p.modelName,
    recommendedTable: p.recommendedTable,
    confidence: p.confidence,
    rationale: p.rationale,
    doNotAutoMap: Boolean(p.doNotAutoMap),
    documentationOnly: true,
  }));

  const highConfProposals = proposedMapRecommendations.filter((p) => p.confidence === "high" && !p.doNotAutoMap).length;
  const mapReviewCount = modelOwnershipMap.filter((m) => m.ownershipClassification === "needs_explicit_map_review").length;
  const { strategy, nextRecommendedSlice } = nextSliceDecision(unsafeUnknowns, mapReviewCount, highConfProposals);

  const baselineBlockedBy = [
    "missing_public__prisma_migrations",
    "legacy_and_prisma_naming_drift",
    "voter_warehouse_semantic_uncertainty",
    "migrate_history_not_aligned_with_live_ddl",
  ];

  const out = {
    schemaVersion: "1.0",
    slice: SLICE,
    generatedAt: new Date().toISOString(),
    mode: "offline_alignment_plan_only",
    sourceFiles: {
      audit: "data/production-db-baseline-audit.json",
      baselinePlan: "data/production-db-baseline-plan.json",
      reconciliation: "data/production-db-schema-reconciliation.json",
      prismaSchema: "prisma/schema.prisma",
    },
    databaseIdentity: {
      observedPublicTableCount: reconciliation.databaseIdentity?.observedPublicTableCount ?? 0,
      prismaExpectedModelCount: reconciliation.databaseIdentity?.prismaExpectedModelCount ?? prismaModels.length,
      prismaMigrationsTableExists: Boolean(
        reconciliation.databaseIdentity?.prismaMigrationsTableExists ?? audit.database?.prismaMigrationsTableExists,
      ),
    },
    modelOwnershipMap,
    proposedMapRecommendations,
    legacyPreserveTables,
    newPrismaOwnedCandidates,
    unsafeUnknowns,
    supabaseAuthBoundary,
    baselineImpact: {
      safeToBaselineNow: false,
      reason:
        "Production remains a mixed legacy + campaign surface without Prisma migration history; baseline and migrate-resolve stay blocked until @@map and DBA ownership are closed on paper and in shadow DB.",
      baselineBlockedBy,
    },
    recommendedStrategy: {
      strategy,
      nextRecommendedSlice,
      requiresHumanApproval: true,
      safeToExecuteAutomatically: false,
    },
    absoluteDoNotRunYet: ABSOLUTE_DO_NOT,
  };

  writeFileSync(OUT_JSON, JSON.stringify(out, null, 2), "utf8");
  writeFileSync(OUT_MD, writeMarkdown(out, audit, baselinePlan, reconciliation), "utf8");
  writeFileSync(HANDOFF_MD, writeHandoff(out), "utf8");

  console.log(`align-prisma-schema-map: wrote ${OUT_JSON}`);
  console.log(`align-prisma-schema-map: wrote ${OUT_MD}`);
  console.log(`align-prisma-schema-map: wrote ${HANDOFF_MD}`);
  console.log(`align-prisma-schema-map: next=${out.recommendedStrategy.nextRecommendedSlice} unsafe=${unsafeUnknowns.length}`);
}

function writeMarkdown(out, audit, baselinePlan, reconciliation) {
  const totalMigrations = baselinePlan.migrationAnalysis?.totalMigrations ?? 0;
  const missingFootprintMigrations = (baselinePlan.migrationAnalysis?.missingMigrations || []).length;
  const exactSafe = out.modelOwnershipMap.filter((m) => m.ownershipClassification === "mapped_existing_table_candidate");
  const mapReview = out.modelOwnershipMap.filter((m) => m.ownershipClassification === "needs_explicit_map_review");
  const newOwned = out.modelOwnershipMap.filter((m) => m.ownershipClassification === "new_prisma_owned_table_candidate");
  const unsafe = out.modelOwnershipMap.filter((m) => m.ownershipClassification === "unsafe_unknown");
  const dbId = reconciliation.databaseIdentity || {};
  const recStrat = reconciliation.baselineRecommendation?.strategy ?? "—";

  const bullets = (arr, max = 35) => {
    if (!arr.length) return `_None._`;
    return arr
      .slice(0, max)
      .map((x) => `- ${typeof x === "string" ? `\`${x}\`` : `\`${x.modelName}\`: ${x.ownershipClassification || x.reason || ""}`}`)
      .join("\n");
  };

  const mustNotAuto = out.proposedMapRecommendations.filter((p) => p.doNotAutoMap || p.confidence === "none" || p.confidence === "low");

  return [
    `# Prisma schema map alignment (offline)`,
    ``,
    `**Slice:** \`${out.slice}\` · **Generated:** ${out.generatedAt} · **Mode:** \`${out.mode}\``,
    ``,
    `> **This packet does not change \`prisma/schema.prisma\`.**`,
    `> **This packet does not approve production baseline execution.**`,
    `> **Voter warehouse tables must not be renamed, dropped, overwritten, or forcibly mapped without human review.**`,
    `> **Supabase \`auth.*\` tables are provider-owned and must not be Prisma-migration-owned by RedDirt.**`,
    ``,
    `## Purpose`,
    ``,
    `Preservation-first **alignment plan** between **live Supabase \`public\`/\`auth\`** table names (from the baseline audit + schema reconciliation) and **\`prisma/schema.prisma\`**. The script emits **documentation and JSON only**: proposed \`@@map\` targets, ownership classifications, and governance flags. **No** Postgres connection, **no** row export, **no** executable SQL, **no** \`schema.prisma\` edits in this slice.`,
    ``,
    `## Source audit and reconciliation summary`,
    ``,
    `- **Audit JSON:** \`${out.sourceFiles.audit}\` — slice \`${audit.slice}\`, generated \`${audit.generatedAt}\`.`,
    `- **Baseline plan JSON:** \`${out.sourceFiles.baselinePlan}\` — slice \`${baselinePlan.slice}\` (migration SQL inventory; offline).`,
    `- **Reconciliation JSON:** \`${out.sourceFiles.reconciliation}\` — slice \`${reconciliation.slice}\`, reconciliation strategy **\`${recStrat}\`**.`,
    `- **Observed public tables (audit):** ${dbId.observedPublicTableCount ?? "—"} · **Prisma models expected:** ${dbId.prismaExpectedModelCount ?? out.modelOwnershipMap.length} · **\`public._prisma_migrations\` present:** ${dbId.prismaMigrationsTableExists === true ? "yes" : "no"}.`,
    ``,
    `## Why schema map alignment is required`,
    ``,
    `Without explicit \`@@map\` and ownership decisions, Prisma’s default **PascalCase** table names do not match the live **snake_case** / legacy warehouse surface. \`_prisma_migrations\` is absent on the audited database, so **migrate history cannot be trusted** against live DDL until naming and domains are reconciled. Alignment prevents accidental DDL against voter/campaign data.`,
    ``,
    `## Current Prisma model ownership problem`,
    ``,
    `Each Prisma model implies a physical table name equal to the **model name** unless \`@@map("…")\` is set. Reconciliation shows **naming and lineage drift**: many models appear as **missing** or **map-review** relative to \`public.*\`, while a large **legacy-only** public footprint is not owned by current Prisma migrations. **\`User\`** and **\`VoterRecord\`** are examples where **semantic** disambiguation (app user vs \`auth.users\`, warehouse vs model) must precede any map patch.`,
    ``,
    `## Live database legacy surface`,
    ``,
    `The audit’s \`public.*\` list includes **campaign** tables alongside **imported voter warehouse**, **ingestion**, and **analytics** tables. Patterns such as **\`ar02_*\`**, \`voter_registry\`, \`spatial_ref_sys\`, and raw ingestion tables are treated as **high-value or legacy-preserve** in this packet (see **Legacy preserve / do-not-touch tables**). These must not be collateral damage from Prisma DDL or forced \`@@map\` guesses.`,
    ``,
    `## Proposed @@map candidates`,
    ``,
    `### Documentation-only recommendations (from JSON \`proposedMapRecommendations\`)`,
    ``,
    ...out.proposedMapRecommendations.map(
      (p) =>
        `- **${p.modelName}** → ${p.recommendedTable ? `\`${p.recommendedTable}\`` : "_no auto table_"} (${p.confidence}) — ${p.rationale}${p.doNotAutoMap ? " **DO NOT auto-map.**" : ""}`,
    ),
    ``,
    `### Exact safe candidates (\`mapped_existing_table_candidate\`)`,
    ``,
    `- **Count:** ${exactSafe.length}`,
    bullets(exactSafe.map((m) => m.modelName)),
    ``,
    `### Map-review candidates (\`needs_explicit_map_review\`)`,
    ``,
    `- **Count:** ${mapReview.length}`,
    bullets(mapReview.map((m) => m.modelName), 40),
    ``,
    `## Models that must not be auto-mapped`,
    ``,
    `Treat the following as **manual / DBA** only — **no** script-applied \`@@map\`, **no** \`db push\`, **no** migration toward these tables until signed:`,
    ``,
    ...mustNotAuto.map(
      (p) =>
        `- **${p.modelName}**${p.recommendedTable ? ` (suggested \`${p.recommendedTable}\` is **not** approved)` : ""} — ${p.rationale}`,
    ),
    `- Any **voter warehouse** or **\`ar02_*\`** table: **must not** be renamed, dropped, overwritten, or forcibly mapped without human review.`,
    ``,
    `## Legacy preserve / do-not-touch tables`,
    ``,
    `- **Count:** ${out.legacyPreserveTables.length} (merged reconciliation + audit rules).`,
    bullets(out.legacyPreserveTables, 45),
    ``,
    `## New Prisma-owned table candidates`,
    ``,
    `Models with **no** confident observed \`public\` match — candidates for **future** app-owned tables in a **shadow** migration plan only (not created on production by this packet).`,
    ``,
    `- **Count:** ${newOwned.length}`,
    bullets(newOwned.map((m) => m.modelName), 40),
    ``,
    `### High semantic risk (\`unsafe_unknown\`)`,
    ``,
    `- **Count:** ${unsafe.length}`,
    bullets(unsafe.map((m) => m.modelName)),
    ``,
    `## Supabase auth boundary`,
    ``,
    `**${out.supabaseAuthBoundary.length}** tables under \`auth.*\` from the audit. They are **Supabase provider-owned**. RedDirt **must not** treat them as ordinary Prisma \`@@schema("auth")\` migration targets or rename/drop them via application migrations.`,
    ``,
    bullets(out.supabaseAuthBoundary, 25),
    ``,
    `## Baseline impact`,
    ``,
    `- **\`safeToBaselineNow\`:** ${out.baselineImpact.safeToBaselineNow}`,
    `- **Reason:** ${out.baselineImpact.reason}`,
    `- **Blocked by:** ${out.baselineImpact.baselineBlockedBy.join(", ")}.`,
    `- **This packet does not approve production baseline execution.** Close \`@@map\` / ownership with DBA and shadow proofs before any baseline execution slice.`,
    ``,
    `### Migration footprint (informational, from baseline plan)`,
    ``,
    `- **Total migration folders:** ${totalMigrations}`,
    `- **Missing-footprint migrations (vs audit):** ${missingFootprintMigrations}`,
    `- _Use shadow / clone Postgres for \`migrate deploy\` proofs — never as approval to run these commands on production from this document._`,
    ``,
    `## Recommended strategy`,
    ``,
    `- **Strategy:** \`${out.recommendedStrategy.strategy}\``,
    `- **Next slice:** \`${out.recommendedStrategy.nextRecommendedSlice}\``,
    `- **Requires human approval:** ${out.recommendedStrategy.requiresHumanApproval}`,
    `- **Safe to execute automatically:** ${out.recommendedStrategy.safeToExecuteAutomatically}`,
    ``,
    `## Human review checklist`,
    ``,
    `- [ ] Review JSON \`modelOwnershipMap\`, \`unsafeUnknowns\`, and \`legacyPreserveTables\` with Steve or DBA.`,
    `- [ ] Confirm **\`User\`** semantics (\`public.users\` vs **\`auth.users\`**) before any auth-linked \`@@map\`.`,
    `- [ ] Resolve **\`VoterRecord\`** against warehouse docs (\`voters\`, \`ar02_voters\`, \`voter_registry\`, etc.); **no** forced map.`,
    `- [ ] After sign-off, schedule **\`REDDIRT-PRISMA-SCHEMA-MAP-PATCH-PLAN-1.0\`** for controlled \`schema.prisma\` edits (separate slice).`,
    `- [ ] Run **shadow** \`prisma migrate deploy\` only on disposable Postgres; production migrate commands stay forbidden until an execution packet.`,
    ``,
    `## Absolute forbidden commands`,
    ``,
    ...ABSOLUTE_DO_NOT.map((c) => `- \`${c}\` — **do not** run against production until a named execution slice and DBA sign-off.`),
    ``,
    `## Next recommended slice`,
    ``,
    `**\`${out.recommendedStrategy.nextRecommendedSlice}\`**`,
    ``,
    `---`,
    ``,
    `_Artifacts: [\`data/prisma-schema-map-alignment.json\`](../data/prisma-schema-map-alignment.json) · [\`develop_notes/REDDIRT_PRISMA_SCHEMA_MAP_ALIGNMENT_1_0_REPORT.md\`](../develop_notes/REDDIRT_PRISMA_SCHEMA_MAP_ALIGNMENT_1_0_REPORT.md)_`,
    ``,
  ].join("\n");
}

function writeHandoff(out) {
  const mapLines = out.proposedMapRecommendations.map(
    (p) =>
      `- **${p.modelName}** → ${p.recommendedTable ? `\`${p.recommendedTable}\`` : "_none_"} (${p.confidence})${p.doNotAutoMap ? " — **do not auto-map**" : ""}`,
  );
  return [
    `# REDDIRT-PRISMA-SCHEMA-MAP-ALIGNMENT-1.0 — report`,
    ``,
    `**Lane:** \`RedDirt/\` only · **Generated:** ${out.generatedAt}`,
    ``,
    `## Slice summary`,
    ``,
    `Offline alignment of **Prisma models** to **live Supabase** \`public\` / \`auth\` table names using the baseline audit JSON, offline baseline plan JSON, reconciliation JSON, parsed \`schema.prisma\`, and migration SQL paths. Emits **\`@@map\` candidates**, **ownership classifications**, and **governance** flags only.`,
    ``,
    `> **This packet does not change \`prisma/schema.prisma\`.** **This packet does not approve production baseline execution.** Voter warehouse tables must not be renamed, dropped, overwritten, or forcibly mapped without human review. **\`auth.*\`** is provider-owned and must not be RedDirt Prisma-migration-owned.`,
    ``,
    `## Files created`,
    ``,
    `- [\`docs/prisma-schema-map-alignment.md\`](../docs/prisma-schema-map-alignment.md) — operator markdown (regenerated by script).`,
    `- [\`data/prisma-schema-map-alignment.json\`](../data/prisma-schema-map-alignment.json) — machine-readable alignment output.`,
    `- \`develop_notes/REDDIRT_PRISMA_SCHEMA_MAP_ALIGNMENT_1_0_REPORT.md\` — this report.`,
    ``,
    `## Inputs inspected`,
    ``,
    `- \`${out.sourceFiles.audit}\``,
    `- \`${out.sourceFiles.baselinePlan}\``,
    `- \`${out.sourceFiles.reconciliation}\``,
    `- \`${out.sourceFiles.prismaSchema}\``,
    `- \`prisma/migrations/*/migration.sql\` (lexical inventory; DDL summarized via baseline plan counts)`,
    ``,
    `## Alignment summary`,
    ``,
    `- **Models in \`modelOwnershipMap\`:** ${out.modelOwnershipMap.length}`,
    `- **Legacy preserve tables (merged list):** ${out.legacyPreserveTables.length}`,
    `- **New Prisma-owned model candidates:** ${out.newPrismaOwnedCandidates.length}`,
    `- **Unsafe / unknown model rows:** ${out.unsafeUnknowns.length}`,
    `- **Supabase \`auth.*\` boundary tables:** ${out.supabaseAuthBoundary.length}`,
    `- **Recommended strategy:** \`${out.recommendedStrategy.strategy}\` · **Next slice:** \`${out.recommendedStrategy.nextRecommendedSlice}\``,
    ``,
    `## Proposed map candidates`,
    ``,
    ...mapLines,
    ``,
    `_Operator narrative: [\`docs/prisma-schema-map-alignment.md\`](../docs/prisma-schema-map-alignment.md)._`,
    ``,
    `## Legacy/voter data protection status`,
    ``,
    `- **\`VoterRecord\`:** \`doNotAutoMap: true\` in JSON recommendations; warehouse semantics unknown.`,
    `- **\`ar02_*\` / voter_registry / ingestion / \`spatial_ref_sys\`:** on **legacy preserve** list — **do not touch** from Prisma automation.`,
    `- **No** row exports; **no** database I/O in this slice.`,
    ``,
    `## Baseline impact`,
    ``,
    `- **\`safeToBaselineNow\`:** ${out.baselineImpact.safeToBaselineNow}`,
    `- **Reason:** ${out.baselineImpact.reason}`,
    `- **\`baselineBlockedBy\`:** ${out.baselineImpact.baselineBlockedBy.join("; ")}.`,
    `- **Production baseline execution** remains **out of scope** until DBA + shadow proofs.`,
    ``,
    `## Governance status`,
    ``,
    `- **\`requiresHumanApproval\`:** ${out.recommendedStrategy.requiresHumanApproval}`,
    `- **\`safeToExecuteAutomatically\`:** ${out.recommendedStrategy.safeToExecuteAutomatically}`,
    `- **Forbidden toward production:** ${out.absoluteDoNotRunYet.join("; ")}`,
    ``,
    `## Checks`,
    ``,
    `- \`node scripts/align-prisma-schema-map.mjs\``,
    `- \`npm run typecheck\``,
    `- \`npm run check\``,
    `- \`npm run email:no-send-scan\``,
    ``,
    `## Risks / limitations`,
    ``,
    `- Curated \`@@map\` list is **not** exhaustive; extend with DBA.`,
    `- Classifications are **heuristic**; reconciliation \`status\` drives many rows.`,
    `- **\`User\`** vs **\`auth.users\`** and **\`VoterRecord\`** vs warehouse tables need explicit human decisions.`,
    ``,
    `## Next recommended slice`,
    ``,
    `**${out.recommendedStrategy.nextRecommendedSlice}**`,
    ``,
    `## Strategic meaning (post-alignment)`,
    ``,
    `1. **Patch** \`schema.prisma\` mappings carefully (\`REDDIRT-PRISMA-SCHEMA-MAP-PATCH-PLAN-1.0\` or successor).`,
    `2. **Prove** migrations on a **shadow/clone** database (\`REDDIRT-SHADOW-DB-MIGRATION-PROOF-1.0\` or successor).`,
    `3. **Then** design a **baseline execution** packet — only after maps and proofs are honest so Prisma is not “lied to” about production DDL.`,
    ``,
  ].join("\n");
}

main();
