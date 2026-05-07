/**
 * REDDIRT-PRISMA-SCHEMA-MAP-PATCH-PLAN-AND-SHADOW-PROOF-1.0 — Phase 1–2 + shadow plan + test readiness (offline only).
 * Does not read .env or connect to any database.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const SLICE = "REDDIRT-PRISMA-SCHEMA-MAP-PATCH-PLAN-AND-SHADOW-PROOF-1.0";

const PATHS = {
  audit: path.join(ROOT, "data/production-db-baseline-audit.json"),
  baselinePlan: path.join(ROOT, "data/production-db-baseline-plan.json"),
  reconciliation: path.join(ROOT, "data/production-db-schema-reconciliation.json"),
  alignment: path.join(ROOT, "data/prisma-schema-map-alignment.json"),
  schema: path.join(ROOT, "prisma/schema.prisma"),
  migrationsDir: path.join(ROOT, "prisma/migrations"),
  srcDir: path.join(ROOT, "src"),
  outFullReview: path.join(ROOT, "data/prisma-schema-map-full-review.json"),
  outPatchPlanJson: path.join(ROOT, "data/prisma-schema-map-patch-plan.json"),
  outPatchPlanMd: path.join(ROOT, "docs/prisma-schema-map-patch-plan.md"),
  outShadowJson: path.join(ROOT, "data/production-db-shadow-proof-plan.json"),
  outShadowMd: path.join(ROOT, "docs/production-db-shadow-proof-plan.md"),
  outTestReadiness: path.join(ROOT, "docs/production-db-test-readiness.md"),
};

const FORBIDDEN_AUTO_MAP_MODELS = new Set([
  "User",
  "VoterRecord",
  "WorkflowIntake",
  "RelationalContact",
  "CampaignEvent",
]);

const VOTER_WAREHOUSE_TABLE_SUBSTRINGS = [
  "ar02_voters",
  "ar02_voter",
  "voter_vote_history",
  "voter_registry",
  "voter_profiles",
  "voter_import_batches",
  "voter_geocoded",
  "voter_block_group_map",
  "voter_party_model",
  "voter_scores",
];

function readJson(p) {
  return JSON.parse(fs.readFileSync(p, "utf8"));
}

function walkTsFiles(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) {
      if (ent.name === "node_modules" || ent.name === ".next" || ent.name === "dist") continue;
      walkTsFiles(p, out);
    } else if (/\.(ts|tsx)$/.test(ent.name)) out.push(p);
  }
  return out;
}

/** Parse Prisma models: name, body lines, @@map if any */
function parsePrismaModels(schemaText) {
  const lines = schemaText.split(/\r?\n/);
  const models = [];
  let current = null;
  let depth = 0;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const start = line.match(/^model\s+(\w+)\s*\{/);
    if (start) {
      current = { modelName: start[1], startLine: i + 1, body: [], map: null };
      depth = 1;
      continue;
    }
    if (current) {
      const open = (line.match(/\{/g) || []).length;
      const close = (line.match(/\}/g) || []).length;
      const mapm = line.match(/@@map\("([^"]+)"\)/);
      if (mapm) current.map = mapm[1];
      current.body.push(line);
      depth += open - close;
      if (depth <= 0) {
        models.push(current);
        current = null;
        depth = 0;
      }
    }
  }
  return models;
}

function scanMigrations(migrationsDir) {
  const byModelCreates = new Map();
  const migrationSummaries = [];
  if (!fs.existsSync(migrationsDir)) return { byModelCreates, migrationSummaries };
  const dirs = fs
    .readdirSync(migrationsDir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .sort();
  for (const dir of dirs) {
    const sqlPath = path.join(migrationsDir, dir, "migration.sql");
    if (!fs.existsSync(sqlPath)) continue;
    const sql = fs.readFileSync(sqlPath, "utf8");
    const creates = [];
    const re = /CREATE TABLE\s+"([^"]+)"/g;
    let m;
    while ((m = re.exec(sql)) !== null) {
      creates.push(m[1]);
      if (!byModelCreates.has(m[1])) byModelCreates.set(m[1], []);
      byModelCreates.get(m[1]).push(dir);
    }
    migrationSummaries.push({
      migrationId: dir,
      createTables: creates,
      byteLength: sql.length,
    });
  }
  return { byModelCreates, migrationSummaries };
}

function scanSrcUsage(srcDir) {
  const counts = new Map();
  const filesByModel = new Map();
  const files = walkTsFiles(srcDir);
  const prismaRe = /\bprisma\.([A-Z][a-zA-Z0-9_]*)\b/g;
  const dbRe = /\bdb\.([A-Z][a-zA-Z0-9_]*)\b/g;
  for (const fp of files) {
    const text = fs.readFileSync(fp, "utf8");
    const rel = path.relative(ROOT, fp).replace(/\\/g, "/");
    let mm;
    const bump = (name) => {
      counts.set(name, (counts.get(name) || 0) + 1);
      if (!filesByModel.has(name)) filesByModel.set(name, new Set());
      filesByModel.get(name).add(rel);
    };
    while ((mm = prismaRe.exec(text)) !== null) bump(mm[1]);
    while ((mm = dbRe.exec(text)) !== null) bump(mm[1]);
  }
  return { counts, filesByModel };
}

function publicTablesFromAudit(audit) {
  const set = new Set();
  const list = audit?.observed?.tables || [];
  for (const t of list) {
    if (typeof t === "string" && t.startsWith("public.")) set.add(t.slice("public.".length));
  }
  return set;
}

function isWarehouseTable(table) {
  const tl = table.toLowerCase();
  if (VOTER_WAREHOUSE_TABLE_SUBSTRINGS.some((s) => tl.includes(s))) return true;
  if (tl === "voters" && true) {
    /* public.voters in audit is legacy roll */
    return true;
  }
  return false;
}

function classifyModel(modelName, parsed, reconByModel, publicTables) {
  const row = reconByModel.get(modelName) || {};
  const observed = row.observedDbMatch || null;
  const status = row.status || "unknown";
  const risk = row.riskLevel || "medium";
  const existingMap = parsed.map;
  const defaultTable = existingMap || modelName;
  const srcUsageCount = 0;

  if (modelName === "VoterRecord") {
    return {
      classification: "legacy_voter_warehouse_do_not_map",
      riskLevel: "critical",
      confidence: "high",
      observedTableMatch: observed,
      proposedMap: null,
      patchAllowed: false,
      reason:
        "Voter warehouse semantics; production voter tables must not be auto-mapped from Prisma without human DBA review.",
    };
  }

  if (FORBIDDEN_AUTO_MAP_MODELS.has(modelName)) {
    return {
      classification: "existing_table_medium_confidence_review",
      riskLevel: modelName === "User" ? "critical" : "high",
      confidence: "low",
      observedTableMatch: observed,
      proposedMap: null,
      patchAllowed: false,
      reason: "Explicit governance: do not auto-map in this packet.",
    };
  }

  if (observed && publicTables.has(observed) && isWarehouseTable(observed)) {
    return {
      classification: "legacy_voter_warehouse_do_not_map",
      riskLevel: "critical",
      confidence: "high",
      observedTableMatch: observed,
      proposedMap: null,
      patchAllowed: false,
      reason: "Observed name matches voter/warehouse surface; preserve.",
    };
  }

  if (status === "legacy_preserve_do_not_touch") {
    return {
      classification: "legacy_voter_warehouse_do_not_map",
      riskLevel: "high",
      confidence: "medium",
      observedTableMatch: observed,
      proposedMap: null,
      patchAllowed: false,
      reason: "Reconciliation: legacy_preserve_do_not_touch.",
    };
  }

  if (status === "missing_safe_to_create_candidate" || status === "missing_requires_shadow_creation") {
    return {
      classification: "new_prisma_owned_candidate",
      riskLevel: risk === "low" ? "low" : "medium",
      confidence: "medium",
      observedTableMatch: observed,
      proposedMap: null,
      patchAllowed: false,
      reason: "No confident live-table match; expect shadow-created Prisma tables.",
    };
  }

  if (observed && publicTables.has(observed)) {
    if (existingMap && existingMap === observed) {
      return {
        classification: "existing_table_high_confidence_map",
        riskLevel: "low",
        confidence: "high",
        observedTableMatch: observed,
        proposedMap: observed,
        patchAllowed: true,
        reason: "@@map already matches audited public table name.",
      };
    }

    const autoEligibleRule =
      status === "prisma_managed_candidate" &&
      risk === "low" &&
      !existingMap &&
      !FORBIDDEN_AUTO_MAP_MODELS.has(modelName);

    if (autoEligibleRule && modelName !== "EventRequest") {
      return {
        classification: "existing_table_high_confidence_map",
        riskLevel: "low",
        confidence: "high",
        observedTableMatch: observed,
        proposedMap: observed,
        patchAllowed: true,
        reason:
          "Live table present in audit; reconciliation prisma_managed_candidate + low risk; Prisma default table name differs from legacy snake_case; EventRequest excluded by reconciliation override.",
      };
    }

    if (modelName === "EventRequest" || status === "needs_mapping_review") {
      return {
        classification: "existing_table_medium_confidence_review",
        riskLevel: "high",
        confidence: "medium",
        observedTableMatch: observed,
        proposedMap: observed,
        patchAllowed: false,
        reason:
          "Reconciliation flagged needs_mapping_review or model-specific governance (EventRequest).",
      };
    }

    return {
      classification: "existing_table_medium_confidence_review",
      riskLevel: risk,
      confidence: "medium",
      observedTableMatch: observed,
      proposedMap: observed,
      patchAllowed: false,
      reason: "Observed table exists but reconciliation risk/status blocks auto patch in this packet.",
    };
  }

  return {
    classification: "unsafe_unknown",
    riskLevel: "high",
    confidence: "low",
    observedTableMatch: observed,
    proposedMap: null,
    patchAllowed: false,
    reason: "No audited public table match for reconciliation row.",
  };
}

function buildReconMap(reconciliation) {
  const m = new Map();
  for (const row of reconciliation.modelToTableMatrix || []) {
    m.set(row.modelName, row);
  }
  return m;
}

function main() {
  const audit = readJson(PATHS.audit);
  const baselinePlan = readJson(PATHS.baselinePlan);
  const reconciliation = readJson(PATHS.reconciliation);
  const alignment = readJson(PATHS.alignment);
  const schemaText = fs.readFileSync(PATHS.schema, "utf8");
  const parsedModels = parsePrismaModels(schemaText);
  const parsedByName = new Map(parsedModels.map((p) => [p.modelName, p]));
  const { byModelCreates, migrationSummaries } = scanMigrations(PATHS.migrationsDir);
  const { counts: srcCounts, filesByModel } = scanSrcUsage(PATHS.srcDir);
  const publicTables = publicTablesFromAudit(audit);
  const reconByModel = buildReconMap(reconciliation);

  const modelReview = [];
  for (const pm of parsedModels) {
    const name = pm.modelName;
    const row = reconByModel.get(name);
    const cls = classifyModel(name, pm, reconByModel, publicTables);
    const migIntro = byModelCreates.get(name) || [];
    modelReview.push({
      modelName: name,
      currentTableName: pm.map || name,
      existingMap: pm.map,
      proposedMap: cls.proposedMap ?? null,
      observedTableMatch: cls.observedTableMatch,
      classification: cls.classification,
      riskLevel: cls.riskLevel,
      confidence: cls.confidence,
      srcUsageCount: srcCounts.get(name) || 0,
      migrationIntroducedBy: migIntro,
      reason: cls.reason,
      patchAllowed: cls.patchAllowed,
    });
  }

  const tableReview = [];
  for (const t of publicTables) {
    let classification = "possibly_unmapped_app_table";
    if (isWarehouseTable(t)) classification = "warehouse_or_imported_table";
    else if (["spatial_ref_sys"].includes(t)) classification = "legacy_preserve_do_not_touch";
    const prismaTargets = modelReview.filter((m) => m.existingMap === t || m.observedTableMatch === t).map((m) => m.modelName);
    if (prismaTargets.length) classification = "prisma_managed_candidate";
    tableReview.push({
      tableName: t,
      classification,
      linkedModels: prismaTargets,
      notes: "",
    });
  }
  tableReview.sort((a, b) => a.tableName.localeCompare(b.tableName));

  const migrationReview = migrationSummaries;

  const srcUsageReview = [...srcCounts.entries()]
    .filter(([, c]) => c > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 80)
    .map(([modelName, hitCount]) => ({
      modelName,
      hitCount,
      sampleFiles: [...(filesByModel.get(modelName) || [])].slice(0, 5),
    }));

  const highConfidenceMapCandidates = modelReview.filter((m) => m.classification === "existing_table_high_confidence_map");
  const mediumConfidenceReviewCandidates = modelReview.filter((m) => m.classification === "existing_table_medium_confidence_review");
  const doNotMapModels = modelReview.filter((m) => m.classification === "legacy_voter_warehouse_do_not_map" || m.modelName === "VoterRecord");
  const legacyPreserveTables = [...publicTables].filter((t) => isWarehouseTable(t) || t === "spatial_ref_sys");
  const newPrismaOwnedCandidates = modelReview.filter((m) => m.classification === "new_prisma_owned_candidate").map((m) => m.modelName);
  const unsafeUnknowns = modelReview.filter((m) => m.classification === "unsafe_unknown");

  const safeHigh = highConfidenceMapCandidates.filter((m) => m.patchAllowed).length;
  const blockedMappingsCount = modelReview.filter((m) => !m.patchAllowed && m.observedTableMatch).length;

  const fullReview = {
    schemaVersion: "1.0",
    slice: SLICE,
    generatedAt: new Date().toISOString(),
    mode: "offline_full_review",
    sourceArtifacts: {
      audit: "data/production-db-baseline-audit.json",
      baselinePlan: "data/production-db-baseline-plan.json",
      reconciliation: "data/production-db-schema-reconciliation.json",
      alignment: "data/prisma-schema-map-alignment.json",
      prismaSchema: "prisma/schema.prisma",
      migrationsGlob: "prisma/migrations/**/migration.sql",
      srcScan: "src/**/*.{ts,tsx}",
    },
    databaseIdentity: {
      reachable: audit?.database?.reachable ?? null,
      prismaMigrationsTableExists: audit?.database?.prismaMigrationsTableExists ?? null,
      observedPublicTableCount: publicTables.size,
      prismaModelCount: parsedModels.length,
      alignmentSnapshot: alignment?.databaseIdentity || null,
    },
    modelReview,
    tableReview,
    migrationReview,
    srcUsageReview,
    highConfidenceMapCandidates,
    mediumConfidenceReviewCandidates,
    doNotMapModels: doNotMapModels.map((m) => m.modelName),
    legacyPreserveTables,
    newPrismaOwnedCandidates,
    unsafeUnknowns: unsafeUnknowns.map((m) => ({ modelName: m.modelName, reason: m.reason })),
    reviewSummary: {
      safeHighConfidenceMappingsCount: safeHigh,
      blockedMappingsCount,
      legacyPreserveCount: legacyPreserveTables.length,
      newPrismaOwnedCandidateCount: newPrismaOwnedCandidates.length,
      safeToBaselineNow: false,
      reason:
        "public._prisma_migrations absent; production baseline and migrate deploy remain explicitly blocked until shadow proof and human approval.",
    },
  };

  fs.mkdirSync(path.dirname(PATHS.outFullReview), { recursive: true });
  fs.writeFileSync(PATHS.outFullReview, JSON.stringify(fullReview, null, 2), "utf8");

  const autoEligible = modelReview.filter(
    (m) =>
      m.classification === "existing_table_high_confidence_map" &&
      m.proposedMap &&
      (!m.existingMap || m.existingMap === m.proposedMap),
  );
  const humanReview = modelReview.filter(
    (m) =>
      m.classification === "existing_table_medium_confidence_review" ||
      (m.observedTableMatch && !m.patchAllowed && m.classification !== "legacy_voter_warehouse_do_not_map" && m.classification !== "new_prisma_owned_candidate"),
  );
  const doNotMapSection = {
    models: ["VoterRecord", ...new Set(doNotMapModels.map((m) => m.modelName))].slice(0, 200),
    tables: ["auth.*", ...legacyPreserveTables.slice(0, 80)],
    notes:
      "Supabase auth schema is provider-owned. Legacy voter warehouse tables must not be renamed, dropped, or forcibly mapped.",
  };

  const patchPlan = {
    schemaVersion: "1.0",
    slice: SLICE,
    generatedAt: new Date().toISOString(),
    absoluteDoNotRunYet: [
      "npx prisma migrate deploy (production)",
      "npx prisma migrate resolve (production)",
      "npx prisma db push (production)",
      "npx prisma migrate reset",
      "Any SQL that DROP/TRUNCATE/DELETE/UPDATE/INSERT production voter or campaign rows",
    ],
    sectionA_autoEligibleSafeMappings: autoEligible.map((m) => ({
      modelName: m.modelName,
      proposedMap: m.proposedMap,
      observedTableMatch: m.observedTableMatch,
      rationale: m.reason,
    })),
    sectionB_humanReviewMappings: humanReview.slice(0, 120).map((m) => ({
      modelName: m.modelName,
      observedTableMatch: m.observedTableMatch,
      classification: m.classification,
      reason: m.reason,
    })),
    sectionC_doNotMap: doNotMapSection,
    sectionD_newPrismaOwnedCandidates: newPrismaOwnedCandidates,
    migrationImplications:
      "@@map only changes Prisma's physical table name expectation; it does not run DDL. Shadow clone must still prove column compatibility before any migrate deploy.",
  };

  fs.writeFileSync(PATHS.outPatchPlanJson, JSON.stringify(patchPlan, null, 2), "utf8");

  const patchPlanMd = `# Prisma schema map patch plan (${SLICE})

## 1. Purpose

Offline-engineered alignment between RedDirt \`schema.prisma\` and the audited Supabase production catalog, without mutating production data or migration history.

## 2. Current production DB state

- Reachable (audit): **${audit?.database?.reachable ?? "unknown"}**
- \`public._prisma_migrations\`: **${audit?.database?.prismaMigrationsTableExists === false ? "absent" : "present or unknown"}**
- Observed public tables (audit-derived count in this run): **${publicTables.size}**

## 3. Why baseline is still blocked

${fullReview.reviewSummary.reason}

## 4. Safe auto-eligible map candidates (this packet)

${autoEligible.length ? autoEligible.map((m) => `- **${m.modelName}** → \`@@map("${m.proposedMap}")\` (${m.observedTableMatch})`).join("\n") : "_None; all mappings deferred to review._"}

## 5. Human-review map candidates (excerpt)

${humanReview
  .slice(0, 25)
  .map((m) => `- **${m.modelName}** — ${m.observedTableMatch || "—"} — ${m.reason}`)
  .join("\n")}

## 6. Do-not-map models and tables

- **VoterRecord** and voter warehouse tables (e.g. \`ar02_voters\`, \`voters\`, voter metrics) — preserve; no forced @@map.
- **auth.*** — Supabase provider-owned; not RedDirt Prisma migration-owned.
- **User / WorkflowIntake / RelationalContact / CampaignEvent** — blocked from auto-map in this packet.

## 7. New Prisma-owned table candidates

Models with no confident live match (shadow migrations later): **${newPrismaOwnedCandidates.length}** (see JSON).

## 8. Migration implications

${patchPlan.migrationImplications}

## 9. Shadow proof requirement

See \`docs/production-db-shadow-proof-plan.md\` and \`data/production-db-shadow-proof-plan.json\`.

## 10. Production baseline execution remains blocked

Do not run production \`migrate deploy\`, \`db push\`, \`migrate resolve\`, or \`migrate reset\` until shadow proof passes and Steve explicitly approves the draft execution packet.

## 11. Operator checklist

1. Run shadow clone proof sequence (see shadow plan).
2. Confirm \`npx prisma validate\` on patched schema.
3. Compare \`prisma migrate diff\` on shadow only.
4. Obtain explicit approval before any production baseline commands.

## 12. Next recommended slice

Execute shadow DB proof, then human-reviewed baseline packet on **non-production** first.

---

Artifacts: \`data/prisma-schema-map-patch-plan.json\`
`;

  fs.writeFileSync(PATHS.outPatchPlanMd, patchPlanMd, "utf8");

  const shadowPlan = {
    schemaVersion: "1.0",
    slice: SLICE,
    generatedAt: new Date().toISOString(),
    mode: "plan_only",
    warnings: [
      "Do not run prisma migrate deploy, db push, migrate resolve, or migrate reset against production.",
      "Do not use production credentials for destructive experiments.",
    ],
    steps: [
      "Create or designate a Supabase shadow project, database branch, or restored clone without live campaign/voter write traffic.",
      "Load schema from production backup or logical dump into shadow; confirm auth and public catalogs match expectations.",
      "Apply the same prisma/schema.prisma mapping changes as main branch (no secrets in repo).",
      "Run `npx prisma validate` against shadow DATABASE_URL.",
      "Run `npx prisma migrate status` on shadow (expect drift until baseline strategy is chosen).",
      "Run `npx prisma migrate diff` (from migrations to shadow DB) and archive output for human review.",
      "Run `npx prisma migrate deploy` **only** on shadow/clone — never production in this slice.",
      "Verify no voter warehouse tables are dropped or renamed by generated SQL.",
      "Run `npm run build` / `npm run check` against shadow-connected env in CI or local.",
      "Verify hosted DB diagnostic route against shadow if applicable.",
    ],
    successCriteria: [
      "Shadow validates and deploy produces no destructive DDL against preserved tables.",
      "Operator signs off column-level compatibility for any @@map applied.",
    ],
  };
  fs.writeFileSync(PATHS.outShadowJson, JSON.stringify(shadowPlan, null, 2), "utf8");

  const shadowMd = `# Production DB shadow / clone proof plan (${SLICE})

**Do not run on production.** This document is a procedure only.

## Warnings

${shadowPlan.warnings.map((w) => `- ${w}`).join("\n")}

## Procedure

${shadowPlan.steps.map((s, i) => `${i + 1}. ${s}`).join("\n")}

## Success criteria

${shadowPlan.successCriteria.map((s) => `- ${s}`).join("\n")}

---

Artifact: \`data/production-db-shadow-proof-plan.json\`
`;

  fs.writeFileSync(PATHS.outShadowMd, shadowMd, "utf8");

  const testReadiness = `# Production DB test readiness (${SLICE})

## 1. Current status

Offline schema-map review and patch planning completed. Production remains read-only for this packet.

## 2. What is now lined up

- Full model/table/migration/src usage review JSON generated.
- Patch plan, shadow proof plan, and governance disclaimers recorded.

## 3. What schema maps were applied (in repo)

See Phase 3 in \`develop_notes/REDDIRT_PRISMA_SCHEMA_MAP_PATCH_PLAN_AND_SHADOW_PROOF_1_0_REPORT.md\` after \`npx prisma validate\`.

## 4. What remains blocked

- Production \`migrate deploy\`, \`db push\`, \`migrate resolve\`, \`reset\`.
- Faking migration history.
- Auto-mapping **VoterRecord** and voter warehouse tables.

## 5. Netlify

**Not ready to rely on production DB alignment** until shadow proof and optional baseline execution are approved. Builds that require a migrated schema may still fail until DATABASE_URL targets a schema consistent with migrations.

## 6. Shadow proof status

Plan ready; **execution not started** in this packet.

## 7. Production baseline status

**Blocked** — see \`docs/production-baseline-execution-packet-draft.md\`.

## 8. Hosted DB proof route status

Ready to run **only** against an approved non-production database URL; not verified against production in this packet.

## 9. Email Command Center test readiness

Static checks (e.g. \`npm run email:no-send-scan\`) can run in CI. DB-backed email diagnostics require a safe database target (local or shadow), not production voter data.

## 10. Commands operators may safely run

- \`node scripts/full-review-prisma-schema-map.mjs\`
- \`node scripts/validate-prisma-schema-map-patch.mjs\`
- \`node scripts/generate-production-baseline-execution-packet.mjs\`
- \`npx prisma validate\` (local env)
- \`npm run typecheck\`, \`npm run check\`, \`npm run email:no-send-scan\`

## 11. Commands operators must not run yet (production)

- \`npx prisma migrate deploy\`
- \`npx prisma migrate resolve\`
- \`npx prisma db push\`
- \`npx prisma migrate reset\`

## Plain-English readiness

| Question | Answer |
|----------|--------|
| Ready to run Netlify tests against **production** DB? | **No** — align shadow first. |
| Ready for hosted DB proof against **production**? | **No** — use shadow/local. |
| Ready for email diagnostics against **production**? | **No** — use non-production. |
| Ready for SendGrid sandbox? | **Only** with sandbox keys and non-production DB; not asserted here. |
| Ready for live send? | **No.** |

`;

  fs.writeFileSync(PATHS.outTestReadiness, testReadiness, "utf8");

  console.log("OK full-review-prisma-schema-map.mjs");
  console.log("  wrote", path.relative(ROOT, PATHS.outFullReview));
  console.log("  wrote", path.relative(ROOT, PATHS.outPatchPlanJson));
  console.log("  wrote", path.relative(ROOT, PATHS.outPatchPlanMd));
  console.log("  wrote", path.relative(ROOT, PATHS.outShadowJson));
  console.log("  wrote", path.relative(ROOT, PATHS.outShadowMd));
  console.log("  wrote", path.relative(ROOT, PATHS.outTestReadiness));
  console.log("  autoEligible @@map count:", autoEligible.length);
}

main();
