/**
 * REDDIRT-POST-ADDITIVE-SCHEMA-MIGRATION-HISTORY-STRATEGY-1.0
 * Offline only: reads repo prisma/migrations, governance JSON, operator postcheck attestation.
 * Does not connect to databases; does not run migrate deploy / resolve / db push / reset.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const SLICE = "REDDIRT-POST-ADDITIVE-SCHEMA-MIGRATION-HISTORY-STRATEGY-1.0";

const PATHS = {
  postcheckProof: path.join(ROOT, "data/post-additive-production-postcheck-proof.json"),
  baselineReview: path.join(ROOT, "data/production-baseline-execution-review.json"),
  netlifyRetryReadiness: path.join(ROOT, "data/netlify-production-retry-readiness.json"),
  additivePacket: path.join(ROOT, "data/additive-schema-production-execution-packet.json"),
  prismaDir: path.join(ROOT, "prisma/migrations"),
  outSchemaStatus: path.join(ROOT, "data/post-additive-production-schema-status.json"),
  outMigrateHistory: path.join(ROOT, "data/prisma-migration-history-status.json"),
  outStrategy: path.join(ROOT, "data/post-additive-migration-history-strategy.json"),
  outNetlifyDecision: path.join(ROOT, "data/post-additive-netlify-readiness-decision.json"),
  outGuardedPlan: path.join(ROOT, "data/migration-history-baseline-guarded-plan.json"),
  docSchema: path.join(ROOT, "docs/post-additive-production-schema-status.md"),
  docMigrate: path.join(ROOT, "docs/prisma-migration-history-status.md"),
  docStrategy: path.join(ROOT, "docs/post-additive-migration-history-strategy.md"),
  docNetlify: path.join(ROOT, "docs/post-additive-netlify-readiness-decision.md"),
  docGuarded: path.join(ROOT, "docs/migration-history-baseline-guarded-plan.md"),
  developReport: path.join(ROOT, "develop_notes/REDDIRT_POST_ADDITIVE_SCHEMA_MIGRATION_HISTORY_STRATEGY_1_0_REPORT.md"),
  projectMap: path.join(ROOT, "docs/PROJECT_MASTER_MAP.md"),
  threadMap: path.join(ROOT, "docs/THREAD_HANDOFF_MASTER_MAP.md"),
  ledger: path.join(ROOT, "docs/campaign-email-command-center-progress-ledger.md"),
};

function rel(p) {
  return path.relative(ROOT, p).split(path.sep).join("/");
}

function readJson(p) {
  try {
    return JSON.parse(fs.readFileSync(p, "utf8"));
  } catch {
    return null;
  }
}

function listMigrations() {
  if (!fs.existsSync(PATHS.prismaDir)) return { directories: [], count: 0 };
  const dirs = fs
    .readdirSync(PATHS.prismaDir)
    .filter((n) => {
      const p = path.join(PATHS.prismaDir, n);
      return fs.statSync(p).isDirectory() && fs.existsSync(path.join(p, "migration.sql"));
    })
    .sort();
  return { directories: dirs, count: dirs.length };
}

function patchMapOnce(filePath, anchorLineIncludes, insertLine) {
  if (!fs.existsSync(filePath)) return;
  const t = fs.readFileSync(filePath, "utf8");
  if (t.includes("REDDIRT-POST-ADDITIVE-SCHEMA-MIGRATION-HISTORY-STRATEGY-1.0")) return;
  const idx = t.indexOf(anchorLineIncludes);
  if (idx === -1) return;
  const lineEnd = t.indexOf("\n", idx);
  const at = lineEnd === -1 ? t.length : lineEnd + 1;
  fs.writeFileSync(filePath, t.slice(0, at) + insertLine + "\n" + t.slice(at), "utf8");
}

function main() {
  const generatedAt = new Date().toISOString();
  const errors = [];

  const proof = readJson(PATHS.postcheckProof);
  if (!proof || proof.schemaVersion !== "1.0") errors.push("missing or invalid data/post-additive-production-postcheck-proof.json");

  const baselineReview = readJson(PATHS.baselineReview);
  const netlifyReady = readJson(PATHS.netlifyRetryReadiness);
  const additivePacket = readJson(PATHS.additivePacket);
  const migrations = listMigrations();

  const frozenAuditPrismaMigrations = baselineReview?.productionDatabaseFacts?.prismaMigrationsTableExists;
  const checksumRisk = baselineReview?.checksumRisk?.editedExistingMigration === true;

  const schemaStatus = {
    schemaVersion: "1.0",
    slice: SLICE,
    generatedAt,
    mode: "post_additive_production_schema_status",
    productionMutationByThisScript: false,
    sources: {
      operatorPostcheckProof: rel(PATHS.postcheckProof),
      frozenBaselineReview: baselineReview ? rel(PATHS.baselineReview) : null,
    },
    productionProjectRef: proof?.productionProjectRef ?? null,
    postcheckOutcome: proof?.postcheckOutcome ?? null,
    publicTableCount: proof?.publicTableCount ?? null,
    requiredNewAppTables: proof?.requiredNewAppTables ?? [],
    highValueLegacyTables: proof?.highValueLegacyTables ?? [],
    authUsersStillPresent: proof?.authUsersStillPresent ?? null,
    additiveSqlBaselinedPrismaMigrations: proof?.additiveSqlBaselinedPrismaMigrations ?? null,
    frozenAuditPrismaMigrationsTableExists: typeof frozenAuditPrismaMigrations === "boolean" ? frozenAuditPrismaMigrations : null,
    auditStaleNote:
      "production-baseline-execution-review.json reflects a pre-additive audit snapshot where _prisma_migrations was absent; re-run read-only audit or prisma migrate status on hosted DB after operator approval.",
  };

  const migrateStatus = {
    schemaVersion: "1.0",
    slice: SLICE,
    generatedAt,
    mode: "prisma_migration_history_repo_status",
    productionMutationByThisScript: false,
    repoMigrationDirectoryCount: migrations.count,
    repoMigrationDirectories: migrations.directories,
    impliedPrismaMigrateDeployBehavior:
      "scripts/netlify-build.sh runs npx prisma migrate deploy after prisma generate when Netlify/CI uses that entrypoint.",
    prismaMigrationsTableOnProduction: {
      statedByOperatorAfterAdditive: proof?.additiveSqlBaselinedPrismaMigrations === false ? "not_baselined_by_additive_sql" : "unknown",
      frozenPreAdditiveAudit: frozenAuditPrismaMigrations === false ? "absent_at_audit_time" : frozenAuditPrismaMigrations === true ? "present_at_audit_time" : "unknown",
      operatorMustConfirmWith: "npx prisma migrate status (hosted DATABASE_URL/DIRECT_URL only; not run by this script)",
    },
    checksumEditedMigrationRiskFromReview: checksumRisk === true,
    whyBlindMigrateDeployUnsafe: [
      "migrate deploy applies migration SQL in order; if _prisma_migrations is empty, Prisma attempts the full chain.",
      "Additive SQL already created many objects; re-applying migrations risks duplicate-object failures or partial drift unless each migration is proven idempotent or marked resolved.",
    ],
  };

  const strategy = {
    schemaVersion: "1.0",
    slice: SLICE,
    generatedAt,
    mode: "migration_history_strategy_offline",
    productionMutationByThisScript: false,
    problemStatement:
      "Application schema is present on production after additive SQL, but Prisma migration history (_prisma_migrations) was not established by that step. Netlify/CI migrate deploy remains hazardous until history aligns with on-disk reality.",
    recommendedApproach: {
      id: "D_post_additive",
      label: "Controlled migration-history baseline after additive DDL (extends baseline Option D)",
      steps: [
        "Operator runs prisma migrate status against hosted production (read-only intent: observe pending vs applied; do not paste secrets).",
        "On a disposable shadow DB that mirrors post-additive production shape (or fresh + additive replay), run migrate deploy and capture diff; confirm no unexpected DDL.",
        "If production schema matches migration outcomes, use governed prisma migrate resolve (mark applied) per migration after DBA review — never fake history without proving equivalence.",
        "If any migration would mutate legacy/voter tables, stop and use reconciliation artifacts (prisma-schema-map-alignment, shadow proof) before touching production.",
        "Only after _prisma_migrations reflects truth: consider Netlify retry per separate readiness packet.",
      ],
      explicitlyRejectedInThisSlice: [
        "Blind npx prisma migrate deploy against production with empty _prisma_migrations while additive SQL already applied.",
        "prisma db push or migrate reset against production.",
        "Faking _prisma_migrations rows without checksum and DDL equivalence review.",
      ],
    },
    references: {
      baselineOptions: baselineReview?.baselineOptions ? "see data/production-baseline-execution-review.json baselineOptions A–D" : null,
      priorRecommendedOptionD: baselineReview?.recommendedPath?.recommendedBaselineOptionId ?? null,
      additiveExecutionPacket: additivePacket ? rel(PATHS.additivePacket) : null,
    },
    nextRecommendedSlice: "REDDIRT-MIGRATION-HISTORY-BASELINE-EXECUTION-PACKET-1.0",
  };

  const netlifyDecision = {
    schemaVersion: "1.0",
    slice: SLICE,
    generatedAt,
    mode: "netlify_readiness_decision_offline",
    retryNetlifyProductionBuildNow: false,
    retryApprovedByThisPacket: false,
    liveSendApprovedByThisPacket: false,
    migrateDeployRunsInNetlifyBuild: true,
    netlifyBuildScriptReference: rel(path.join(ROOT, "scripts/netlify-build.sh")),
    reason:
      "migrate deploy is still invoked from the Netlify build script; without aligned _prisma_migrations, production builds can fail (e.g. P3005) or attempt duplicate DDL.",
    prerequisitesBeforeRetry: [
      "Complete REDDIRT-MIGRATION-HISTORY-BASELINE-EXECUTION-PACKET-1.0 (or equivalent Steve-approved path).",
      "Hosted prisma migrate status shows migration history consistent with production schema.",
      "Steve approval for Netlify production retry touching production DATABASE_URL.",
    ],
    priorReadinessArtifact: netlifyReady ? rel(PATHS.netlifyRetryReadiness) : null,
  };

  const guardedPlan = {
    schemaVersion: "1.0",
    slice: SLICE,
    generatedAt,
    mode: "future_migration_history_baseline_guarded_plan",
    productionMutationByThisScript: false,
    futurePacket: "REDDIRT-MIGRATION-HISTORY-BASELINE-EXECUTION-PACKET-1.0",
    automaticExecutionAllowed: false,
    scriptsPlannedNotImplementedHere: [
      "scripts/build-migration-history-baseline-execution-packet.mjs (to be authored in future slice)",
      "scripts/validate-migration-history-baseline-execution-packet.mjs",
      "scripts/run-migration-history-baseline-preflight.mjs",
      "scripts/run-migration-history-baseline-guarded.mjs (--dry-run default)",
    ],
    approvalPhrasePlaceholder: "STEVE_APPROVES_REDDIRT_MIGRATION_HISTORY_BASELINE_ON_PRODUCTION",
    operatorCommandsForbiddenFromAutomation: [
      "npx prisma migrate deploy",
      "npx prisma migrate resolve",
      "npx prisma db push",
      "npx prisma migrate reset",
    ],
    notes: "This JSON is a plan stub only; no execution.",
  };

  fs.mkdirSync(path.dirname(PATHS.outSchemaStatus), { recursive: true });
  fs.writeFileSync(PATHS.outSchemaStatus, JSON.stringify(schemaStatus, null, 2), "utf8");
  fs.writeFileSync(PATHS.outMigrateHistory, JSON.stringify(migrateStatus, null, 2), "utf8");
  fs.writeFileSync(PATHS.outStrategy, JSON.stringify(strategy, null, 2), "utf8");
  fs.writeFileSync(PATHS.outNetlifyDecision, JSON.stringify(netlifyDecision, null, 2), "utf8");
  fs.writeFileSync(PATHS.outGuardedPlan, JSON.stringify(guardedPlan, null, 2), "utf8");

  const md = (title, body) => `# ${title}\n\n**Slice:** \`${SLICE}\` · **Generated:** ${generatedAt}\n\n${body}`;

  fs.writeFileSync(
    PATHS.docSchema,
    md(
      "Post-additive production schema status",
      `Machine JSON: [\`data/post-additive-production-schema-status.json\`](../data/post-additive-production-schema-status.json)

## Summary

Operator attestation (\`data/post-additive-production-postcheck-proof.json\`) records **POSTCHECK PASS**, **${proof?.publicTableCount ?? "—"}** public tables, required new app tables, and preserved high-value legacy tables. Additive SQL **did not** baseline \`_prisma_migrations\`.

## Audit note

Frozen baseline review may still show pre-additive \`_prisma_migrations\` absence — treat as **stale for post-additive truth** until a new hosted \`migrate status\` / audit is recorded.
`
    ),
    "utf8"
  );

  fs.writeFileSync(
    PATHS.docMigrate,
    md(
      "Prisma migration history status (repo + governance)",
      `Machine JSON: [\`data/prisma-migration-history-status.json\`](../data/prisma-migration-history-status.json)

## Repo

- **${migrations.count}** migration directories under \`prisma/migrations/\`.

## Production

- Operator statement: additive install **did not** insert Prisma migration history.
- **Do not** run blind \`migrate deploy\` on production until the baseline packet slice runs with Steve approval.

## Netlify

\`scripts/netlify-build.sh\` still runs \`npx prisma migrate deploy\` — see Netlify readiness decision doc.
`
    ),
    "utf8"
  );

  fs.writeFileSync(
    PATHS.docStrategy,
    md(
      "Post-additive migration history strategy",
      `Machine JSON: [\`data/post-additive-migration-history-strategy.json\`](../data/post-additive-migration-history-strategy.json)

## Safest path (summary)

1. **Observe** hosted \`prisma migrate status\` (operator, no secrets in tickets).  
2. **Prove** on shadow / disposable DB that the migration chain matches post-additive production (no surprise DDL on legacy).  
3. **Align history** with governed \`migrate resolve\` / baseline tooling only after equivalence — not additive SQL alone.  
4. **Then** revisit Netlify retry in a dedicated Steve-gated slice.

## Next slice

\`REDDIRT-MIGRATION-HISTORY-BASELINE-EXECUTION-PACKET-1.0\` (packet not built in this slice).
`
    ),
    "utf8"
  );

  fs.writeFileSync(
    PATHS.docNetlify,
    md(
      "Post-additive Netlify readiness decision",
      `Machine JSON: [\`data/post-additive-netlify-readiness-decision.json\`](../data/post-additive-netlify-readiness-decision.json)

## Decision

**Do not** retry Netlify production builds against production **now**. \`migrate deploy\` is still in the build path and migration history is not yet aligned with post-additive reality.

## Related

- [\`docs/post-additive-schema-netlify-readiness.md\`](./post-additive-schema-netlify-readiness.md) (additive-era prerequisites)  
- [\`data/netlify-production-retry-readiness.json\`](../data/netlify-production-retry-readiness.json)
`
    ),
    "utf8"
  );

  fs.writeFileSync(
    PATHS.docGuarded,
    md(
      "Migration history baseline — guarded execution plan (stub)",
      `Machine JSON: [\`data/migration-history-baseline-guarded-plan.json\`](../data/migration-history-baseline-guarded-plan.json)

Future slice will add build/validate/preflight/guarded scripts. This document records **intent only** — **no** production commands from automation in **REDDIRT-POST-ADDITIVE-SCHEMA-MIGRATION-HISTORY-STRATEGY-1.0**.
`
    ),
    "utf8"
  );

  const mapLine = `- **REDDIRT-POST-ADDITIVE-SCHEMA-MIGRATION-HISTORY-STRATEGY-1.0** — [\`post-additive-migration-history-strategy.md\`](./post-additive-migration-history-strategy.md) · [\`post-additive-netlify-readiness-decision.md\`](./post-additive-netlify-readiness-decision.md) · [\`migration-history-baseline-guarded-plan.md\`](./migration-history-baseline-guarded-plan.md) · [\`data/post-additive-migration-history-strategy.json\`](../data/post-additive-migration-history-strategy.json) · [\`data/post-additive-netlify-readiness-decision.json\`](../data/post-additive-netlify-readiness-decision.json) · [\`data/migration-history-baseline-guarded-plan.json\`](../data/migration-history-baseline-guarded-plan.json) · \`scripts/build-post-additive-migration-history-strategy.mjs\` · \`scripts/validate-post-additive-migration-history-strategy.mjs\` — **offline** migration-history + Netlify posture after additive SQL (**no** production migrate deploy / resolve / db push / reset; **no** Netlify retry).`;
  patchMapOnce(PATHS.projectMap, "- **REDDIRT-ADDITIVE-SCHEMA-PRODUCTION-EXECUTION-PACKET-1.0**", mapLine);

  const threadBlock = `**REDDIRT-POST-ADDITIVE-SCHEMA-MIGRATION-HISTORY-STRATEGY-1.0** — **Post-additive:** schema on production; **\`_prisma_migrations\` not set by additive SQL.** \`node scripts/build-post-additive-migration-history-strategy.mjs\` · \`node scripts/validate-post-additive-migration-history-strategy.mjs\`. Docs: [\`post-additive-migration-history-strategy.md\`](./post-additive-migration-history-strategy.md) · [\`post-additive-netlify-readiness-decision.md\`](./post-additive-netlify-readiness-decision.md). Data: [\`data/post-additive-production-postcheck-proof.json\`](../data/post-additive-production-postcheck-proof.json) (operator) · [\`data/post-additive-migration-history-strategy.json\`](../data/post-additive-migration-history-strategy.json). **No** Netlify retry; **no** \`migrate deploy\` from agents; **next:** \`REDDIRT-MIGRATION-HISTORY-BASELINE-EXECUTION-PACKET-1.0\`.`;

  if (fs.existsSync(PATHS.threadMap)) {
    const tm = fs.readFileSync(PATHS.threadMap, "utf8");
    if (!tm.includes("REDDIRT-POST-ADDITIVE-SCHEMA-MIGRATION-HISTORY-STRATEGY-1.0")) {
      const anchor = "**REDDIRT-ADDITIVE-SCHEMA-PRODUCTION-EXECUTION-PACKET-1.0**";
      const pos = tm.indexOf(anchor);
      if (pos !== -1) {
        const insertPos = tm.indexOf("\n", pos);
        const at = insertPos === -1 ? tm.length : insertPos + 1;
        fs.writeFileSync(PATHS.threadMap, tm.slice(0, at) + "\n" + threadBlock + "\n" + tm.slice(at), "utf8");
      }
    }
  }

  if (fs.existsSync(PATHS.ledger)) {
    const ld = fs.readFileSync(PATHS.ledger, "utf8");
    if (!ld.includes("REDDIRT-POST-ADDITIVE-SCHEMA-MIGRATION-HISTORY-STRATEGY-1.0")) {
      const ins =
        "**REDDIRT-POST-ADDITIVE-SCHEMA-MIGRATION-HISTORY-STRATEGY-1.0** — [`docs/post-additive-migration-history-strategy.md`](./post-additive-migration-history-strategy.md) · [`data/post-additive-migration-history-strategy.json`](../data/post-additive-migration-history-strategy.json) · `scripts/build-post-additive-migration-history-strategy.mjs` (post-additive **offline** migration-history + Netlify decision; **no** `migrate deploy` / Netlify retry from automation). ";
      const cross = "**Cross-cut — production DB baseline";
      const cpos = ld.indexOf(cross);
      if (cpos !== -1) {
        const at = ld.lastIndexOf("\n", cpos) + 1;
        fs.writeFileSync(PATHS.ledger, ld.slice(0, at) + ins + ld.slice(at), "utf8");
      }
    }
  }

  const report = `# REDDIRT_POST_ADDITIVE_SCHEMA_MIGRATION_HISTORY_STRATEGY_1_0_REPORT

**Lane:** RedDirt only  
**Slice:** \`${SLICE}\`  
**Generated:** ${generatedAt}

## Outputs

| Artifact | Path |
|----------|------|
| Schema status | \`data/post-additive-production-schema-status.json\` |
| Migration history status | \`data/prisma-migration-history-status.json\` |
| Strategy | \`data/post-additive-migration-history-strategy.json\` |
| Netlify decision | \`data/post-additive-netlify-readiness-decision.json\` |
| Guarded plan stub | \`data/migration-history-baseline-guarded-plan.json\` |

## Commands

\`\`\`text
node scripts/build-post-additive-migration-history-strategy.mjs
node scripts/validate-post-additive-migration-history-strategy.mjs
\`\`\`

## Blockers

${errors.length ? errors.map((e) => `- ${e}`).join("\n") : "- (none — postcheck proof loaded)"}

## Policy

No production \`migrate deploy\` / \`resolve\` / \`db push\` / \`reset\`; no Netlify retry; no live send approval from this slice.

## Next slice

\`REDDIRT-MIGRATION-HISTORY-BASELINE-EXECUTION-PACKET-1.0\` (to be implemented).
`;
  fs.writeFileSync(PATHS.developReport, report, "utf8");

  if (errors.length) {
    console.error("FAIL build-post-additive-migration-history-strategy.mjs");
    console.error(errors.join("\n"));
    process.exit(1);
  }

  console.log("PASS build-post-additive-migration-history-strategy.mjs");
  console.log(" ", rel(PATHS.outStrategy));
  process.exit(0);
}

main();
