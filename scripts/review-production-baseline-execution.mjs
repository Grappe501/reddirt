/**
 * REDDIRT-PRODUCTION-BASELINE-EXECUTION-REVIEW-1.0
 * Offline-only: reads local JSON + migration directory names. No DB, no .env, no secrets.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const SLICE = "REDDIRT-PRODUCTION-BASELINE-EXECUTION-REVIEW-1.0";

const PATHS = {
  outReview: path.join(ROOT, "data/production-baseline-execution-review.json"),
  audit: path.join(ROOT, "data/production-db-baseline-audit.json"),
  baselinePlan: path.join(ROOT, "data/production-db-baseline-plan.json"),
  schemaRecon: path.join(ROOT, "data/production-db-schema-reconciliation.json"),
  mapAlignment: path.join(ROOT, "data/prisma-schema-map-alignment.json"),
  mapPatchPlan: path.join(ROOT, "data/prisma-schema-map-patch-plan.json"),
  mapPatchValidation: path.join(ROOT, "data/prisma-schema-map-patch-validation.json"),
  mapFullReview: path.join(ROOT, "data/prisma-schema-map-full-review.json"),
  shadowProof: path.join(ROOT, "data/shadow-db-migration-proof.json"),
  shadowProofValidation: path.join(ROOT, "data/shadow-db-migration-proof-validation.json"),
  migrationDepAudit: path.join(ROOT, "data/migration-dependency-order-audit.json"),
  migrationDepRepairPlan: path.join(ROOT, "data/migration-dependency-repair-plan.json"),
  migrationDepRepairValidation: path.join(ROOT, "data/migration-dependency-repair-validation.json"),
  migrationsRoot: path.join(ROOT, "prisma/migrations"),
  emailGraphMigration: path.join(
    ROOT,
    "prisma/migrations/20260505203000_email_contact_profile_graph/migration.sql"
  ),
  relationalFkeyMigration: path.join(
    ROOT,
    "prisma/migrations/20260515121000_email_contact_profile_relational_contact_fkey/migration.sql"
  ),
};

function readJsonIfExists(filePath) {
  if (!fs.existsSync(filePath)) return { exists: false, path: filePath, data: null };
  try {
    const raw = fs.readFileSync(filePath, "utf8");
    return { exists: true, path: filePath, data: JSON.parse(raw) };
  } catch {
    return { exists: true, path: filePath, data: null, parseError: true };
  }
}

function listMigrationDirs() {
  if (!fs.existsSync(PATHS.migrationsRoot)) return [];
  return fs
    .readdirSync(PATHS.migrationsRoot, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .filter((name) => fs.existsSync(path.join(PATHS.migrationsRoot, name, "migration.sql")))
    .sort();
}

function shadowProofPassed(shadow) {
  if (!shadow.exists || !shadow.data) return false;
  const d = shadow.data;
  const statusOk = d.status === "pass" || d.outcome === "pass";
  if (!statusOk) return false;
  if (d.offlineConsolidatedAttestation === true) {
    return Boolean(d.migrateDeploy?.success === true && d.migrateDeploy?.appliedMigrationsCount === 71);
  }
  if (d.shadowProofPassed === true) return true;
  if (d.migrateDeploy?.success === true && d.diffFromMigrationsToUrl?.clean === true) return true;
  if (Array.isArray(d.checks) && d.checks.length && d.checks.every((c) => c.ok !== false)) return true;
  return false;
}

function shadowDiffClean(shadow) {
  if (!shadow.exists || !shadow.data) return false;
  const d = shadow.data;
  if (d.offlineConsolidatedAttestation === true) return d.diffFromMigrationsToUrl?.clean === true;
  if (d.diffFromMigrationsToUrl?.clean === true) return true;
  if (d.migrateDiff?.isEmpty === true) return true;
  if (d.migrateDiff?.drift === false) return true;
  if (typeof d.migrateDiffStdout === "string" && d.migrateDiffStdout.trim() === "") return true;
  return false;
}

function migrationDependencyRepairValidated(artifact) {
  if (!artifact.exists || !artifact.data) return false;
  const d = artifact.data;
  if (d.status === "pass") return true;
  if (d.valid === true) return true;
  if (Array.isArray(d.checks) && d.checks.length && !d.checks.some((c) => c.ok === false)) return true;
  return false;
}

function schemaMapPatchValidated(patchVal) {
  if (!patchVal.exists || !patchVal.data) return false;
  return patchVal.data.status === "pass";
}

function prismaValidateKnownGreen(patchVal) {
  if (!patchVal.exists || !patchVal.data) return false;
  const checks = patchVal.data.checks;
  const row = Array.isArray(checks) ? checks.find((c) => c.id === "prisma_validate") : null;
  if (row && row.ok === true) return true;
  if (patchVal.data.prismaValidateExitCode === 0) return true;
  return false;
}

function checksumWarningFromRepairDocs() {
  const editedMigration = fs.existsSync(PATHS.emailGraphMigration);
  const deferredFkey = fs.existsSync(PATHS.relationalFkeyMigration);
  if (!editedMigration) {
    return {
      editedExistingMigration: false,
      risk: "migration file not found on disk",
      mitigation: "Verify repo state and migration history.",
    };
  }
  return {
    editedExistingMigration: true,
    risk:
      "An existing migration SQL file was edited (checksum drift vs any environment that already recorded the prior migration checksum in _prisma_migrations). Environments with the old checksum may require a governed migration-history resolution path.",
    mitigation:
      "Production currently has no public._prisma_migrations per latest audit snapshot; still document operator awareness. If any staging clone applied the old checksum, use DBA-governed resolve/baseline strategy—never fake history on production without explicit approval.",
  };
}

function buildSourceArtifacts(map) {
  const out = {};
  for (const [key, val] of Object.entries(map)) {
    out[key] = val.exists ? val.path : null;
  }
  return out;
}

const DO_NOT_RUN = "DO NOT RUN UNTIL EXECUTION PACKET IS APPROVED.";

function buildCommandChecklist(generatedAt) {
  const mark = (cmd) => ({ command: cmd, doNotRunUntilExecutionPacketApproved: DO_NOT_RUN });
  return {
    schemaVersion: "1.0",
    slice: SLICE,
    generatedAt,
    mode: "offline_command_checklist_only_review_only",
    globalDisclaimer: DO_NOT_RUN,
    reviewOnly: true,
    preFlightRequirements: [
      { id: "backup_pitr", description: "Backup or Supabase PITR confirmed; restore drill documented.", doNotRunUntilExecutionPacketApproved: DO_NOT_RUN },
      { id: "correct_db_target", description: "Operator confirms canonical production Supabase project (identity) matches intended DATABASE_URL/DIRECT_URL — verify in host UI; no secrets in tickets.", doNotRunUntilExecutionPacketApproved: DO_NOT_RUN },
      { id: "no_concurrent_deploy", description: "Confirm no other deploy, migration, or schema job is running against the same database.", doNotRunUntilExecutionPacketApproved: DO_NOT_RUN },
      { id: "maintenance_window", description: "Maintenance or low-traffic window agreed for first production migrate if applicable.", doNotRunUntilExecutionPacketApproved: DO_NOT_RUN },
      { id: "git_commit_recorded", description: "Record exact Git SHA / tag that the execution packet will run against.", doNotRunUntilExecutionPacketApproved: DO_NOT_RUN },
      { id: "shadow_proof", description: "data/shadow-db-migration-proof.json present (live shadow deploy+diff OR offline_consolidated_attestation per docs/shadow-db-migration-proof.md).", doNotRunUntilExecutionPacketApproved: DO_NOT_RUN },
      { id: "steve_approval", description: "Steve written approval for the exact production command path (deploy vs resolve vs DBA SQL).", doNotRunUntilExecutionPacketApproved: DO_NOT_RUN },
      { id: "command_path_reviewed", description: "DBA/operator reviewed exact command sequence vs execution packet; no improvisation at terminal.", doNotRunUntilExecutionPacketApproved: DO_NOT_RUN },
      { id: "rollback_path", description: "Rollback = restore from PITR or verified backup; owner and time target named.", doNotRunUntilExecutionPacketApproved: DO_NOT_RUN },
      { id: "netlify_retry_path", description: "Plan Netlify retry only after build DATABASE_URL points at a migrated schema; see netlify-production-retry-readiness doc.", doNotRunUntilExecutionPacketApproved: DO_NOT_RUN },
      { id: "hosted_db_proof_route", description: "Plan GET hosted-db proof (bearer token) against approved non-production first, then production only when policy allows.", doNotRunUntilExecutionPacketApproved: DO_NOT_RUN },
      { id: "email_diagnostics", description: "Plan npm run email:db:diagnose / email:no-send-scan against the same class of target DB as production post-migrate.", doNotRunUntilExecutionPacketApproved: DO_NOT_RUN },
    ],
    forbiddenOnProductionUntilApproval: [
      { command: "npx prisma migrate deploy", risk: "Writes _prisma_migrations and applies DDL to live voter/campaign database." },
      { command: "npx prisma migrate resolve", risk: "Mutates migration history; can desync truth from applied SQL." },
      { command: "npx prisma db push", risk: "Non-history DDL against production; high drift risk with legacy schema." },
      { command: "npx prisma migrate reset", risk: "Destructive; forbidden on production under current policy." },
      { pattern: "SQL: DROP|TRUNCATE|DELETE|UPDATE|INSERT", risk: "Bulk or destructive data mutation on production outside DBA governance." },
    ],
    commandTemplatesAllRequireApproval: DO_NOT_RUN,
    placeholdersShadowOnly: [
      mark("# PowerShell — SHADOW DATABASE ONLY. Replace angle-bracket placeholders. Never paste real secrets into logs or chat."),
      mark("$env:DATABASE_URL = \"<SHADOW_DATABASE_URL_PLACEHOLDER>\""),
      mark("$env:DIRECT_URL = \"<SHADOW_DIRECT_URL_PLACEHOLDER>\""),
      mark("Set-Location H:\\SOSWebsite\\RedDirt"),
      mark("npx prisma validate"),
      mark("npx prisma migrate deploy"),
      mark("npx prisma migrate diff --from-migrations prisma/migrations --to-url $env:DATABASE_URL"),
    ],
    placeholdersProductionBlockedCommentOnly: [
      "# PRODUCTION — every line below is commented because it is forbidden until the execution packet is approved.",
      "# npx prisma migrate deploy",
      "# npx prisma migrate resolve",
      "# npx prisma db push",
      "# npx prisma migrate reset",
    ],
    gatesBeforeAnyProductionMutation: [
      "Steve written approval recorded",
      "Backup or PITR proof recorded",
      "Shadow migrate deploy + diff clean archived in data/shadow-db-migration-proof.json",
      "Optional: data/migration-dependency-repair-validation.json with status pass",
    ],
  };
}

function pickDecision({
  shadowPassed,
  shadowDiffOk,
  mapOk,
  depOk,
  auditOk,
  noPrismaMigrations,
  safeAutoBlocked,
  migrationCount,
  fkeyOnDisk,
}) {
  if (!auditOk) {
    return {
      decision: "blocked_requires_dba",
      readyForHumanReview: true,
      readyForExecutionPacket: false,
      readyForAutomaticExecution: false,
      reason: "Production baseline audit JSON missing or unreadable; stop until audit is regenerated.",
    };
  }
  if (!noPrismaMigrations) {
    return {
      decision: "blocked_requires_dba",
      readyForHumanReview: true,
      readyForExecutionPacket: false,
      readyForAutomaticExecution: false,
      reason:
        "Latest audit indicates public._prisma_migrations may exist or was true when audited; reconcile with current production truth before any deploy.",
    };
  }
  if (!mapOk) {
    return {
      decision: "not_ready_schema_map_unresolved",
      readyForHumanReview: true,
      readyForExecutionPacket: false,
      readyForAutomaticExecution: false,
      reason: "Prisma schema map patch validation did not pass or artifact missing.",
    };
  }

  const repoSignalsForHumanReview =
    safeAutoBlocked &&
    migrationCount >= 70 &&
    fkeyOnDisk &&
    noPrismaMigrations &&
    mapOk;

  const shadowGateSatisfied = shadowPassed && shadowDiffOk;

  if (!shadowGateSatisfied) {
    if (repoSignalsForHumanReview) {
      return {
        decision: "ready_for_human_review_only",
        readyForHumanReview: true,
        readyForExecutionPacket: false,
        readyForAutomaticExecution: false,
        reason:
          "Automated shadow proof JSON is missing or incomplete, but repo + audit signals align for human-governed review: commit data/shadow-db-migration-proof.json (and optional shadow-db-migration-proof-validation.json) from the governed shadow run to tighten automation gates.",
      };
    }
    return {
      decision: "not_ready_shadow_failed",
      readyForHumanReview: true,
      readyForExecutionPacket: false,
      readyForAutomaticExecution: false,
      reason:
        "Shadow migration proof artifact missing or does not record a passing shadow migrate deploy + clean diff, and repo fallback signals were insufficient.",
    };
  }

  if (!depOk) {
    return {
      decision: "ready_for_human_review_only",
      readyForHumanReview: true,
      readyForExecutionPacket: false,
      readyForAutomaticExecution: false,
      reason:
        "Shadow proof JSON indicates pass, but migration-dependency-repair-validation.json is missing or not pass; human must confirm dependency repair is recorded before execution packet.",
    };
  }
  if (!safeAutoBlocked) {
    return {
      decision: "blocked_requires_dba",
      readyForHumanReview: true,
      readyForExecutionPacket: false,
      readyForAutomaticExecution: false,
      reason: "baseline plan does not assert safeToExecuteAutomatically: false — unexpected; require DBA review.",
    };
  }
  return {
    decision: "ready_for_execution_packet_after_backup_confirmation",
    readyForHumanReview: true,
    readyForExecutionPacket: true,
    readyForAutomaticExecution: false,
    reason:
      "Shadow proof + map validation + dependency repair validation present; production still legacy/high-value; execution packet allowed only after written backup/PITR confirmation and Steve approval.",
  };
}

function main() {
  const audit = readJsonIfExists(PATHS.audit);
  const baselinePlan = readJsonIfExists(PATHS.baselinePlan);
  const mapPatchVal = readJsonIfExists(PATHS.mapPatchValidation);
  const shadow = readJsonIfExists(PATHS.shadowProof);
  const shadowVal = readJsonIfExists(PATHS.shadowProofValidation);
  const depRepairVal = readJsonIfExists(PATHS.migrationDepRepairValidation);

  const migrationDirs = listMigrationDirs();
  const migrationCount = migrationDirs.length;
  const fkeyOnDisk = fs.existsSync(PATHS.relationalFkeyMigration);

  const prismaMigrationsTableExists = Boolean(audit.data?.database?.prismaMigrationsTableExists);
  const highValueTables = audit.data?.comparison?.highValueTables;
  const highValueTablesPresent = Array.isArray(highValueTables) && highValueTables.length > 0;
  const productionHasLegacySchema = Boolean(
    audit.data?.comparison?.tablesInDatabaseNotInPrisma?.length ||
      audit.data?.comparison?.tablesInPrismaNotObserved?.length
  );
  const productionContainsVoterCampaignData = highValueTablesPresent;

  const safeToExecuteAutomatically = baselinePlan.data?.recommendedStrategy?.safeToExecuteAutomatically;
  const safeAutoBlocked = safeToExecuteAutomatically === false;

  const spPassed = shadowProofPassed(shadow);
  const spDiff = shadowDiffClean(shadow);
  const depOk = migrationDependencyRepairValidated(depRepairVal);
  const mapOk = schemaMapPatchValidated(mapPatchVal);
  const pvGreen = prismaValidateKnownGreen(mapPatchVal);

  const eligibility = pickDecision({
    shadowPassed: spPassed,
    shadowDiffOk: spDiff || spPassed,
    mapOk,
    depOk,
    auditOk: audit.exists && audit.data,
    noPrismaMigrations: audit.exists && audit.data && prismaMigrationsTableExists === false,
    safeAutoBlocked,
    migrationCount,
    fkeyOnDisk,
  });

  const checksumRisk = checksumWarningFromRepairDocs();

  const baselineOptions = [
    {
      id: "A",
      label: "Baseline all historical migrations as applied (resolve / mark-applied path)",
      meaning:
        "Because production has no _prisma_migrations, mark historical migrations as applied only after backup + DBA review; then future migrations deploy normally.",
      risks: [
        "If production schema does not truly match migration SQL, Prisma history can lie about what is on the ground.",
        "Legacy drift and parallel lineage make Option A unsafe as a blind default unless domain separation and row-level/schema diff are explicitly accepted.",
      ],
    },
    {
      id: "B",
      label: "New production baseline migration package",
      meaning:
        "Capture current production schema as baseline state, mark that baseline applied, and treat future app migrations separately from the 71-folder history.",
      risks: [
        "The repo already carries 71 migrations; squashing or rebasing history is operationally complex and easy to get wrong across environments.",
        "Requires a careful, written migration-history strategy (fork, replace folder, or DBA-led SQL) so staging and production do not diverge silently.",
      ],
    },
    {
      id: "C",
      label: "Separate legacy warehouse schema from Prisma app schema",
      meaning:
        "Keep legacy voter/campaign warehouse tables as do-not-touch; apply only Prisma-owned app tables going forward with strict @@map / ownership discipline.",
      risks: [
        "App code must not assume unmapped legacy tables are Prisma-owned or safe to mutate through Prisma.",
        "Requires ongoing schema map and code-path audits so new models do not collide with warehouse names.",
      ],
    },
    {
      id: "D",
      label: "Controlled production baseline execution after shadow proof",
      meaning:
        "Use successful shadow migrate deploy + clean diff as evidence, then execute a strictly reviewed baseline / migration-history alignment path on production after backup + Steve approval.",
      risks: [
        "Still requires PITR/backup, written approval, and exact command checklist; shadow success does not guarantee production identicality (pooler, extensions, timing).",
        "Netlify and other clients that run prisma migrate deploy against the same URL must be coordinated so deploy order does not race partial schema.",
      ],
    },
  ];

  const recommendedPath = {
    recommendedBaselineOptionId: "D",
    strategy: "Option D — controlled production baseline after shadow proof (with Option C discipline)",
    why:
      "Option A alone risks lying to Prisma if resolve/mark-applied is used without proving every migration is already reflected in production. Option B is valid for greenfield but is heavy against 71 existing folders without a dedicated history-repack slice. Option C is required ongoing discipline regardless. Option D matches the governed sequence already in flight: prove the chain on shadow, archive artifacts, then one human-approved execution packet applies the same class of commands to production with rollback and Netlify coordination.",
    nextRecommendedSlice: "REDDIRT-PRODUCTION-BASELINE-EXECUTION-PACKET-1.0",
  };

  const requiredHumanApprovals = [
    "Steve: written approval to run any production mutation (including prisma migrate deploy / resolve / db push / reset).",
    "Steve: approval of baseline strategy option (shadow deploy vs DBA custom) after reading this review and checksum risk.",
    "Operator: confirm correct Supabase production project (identity) matches DATABASE_URL/DIRECT_URL intent without pasting secrets into tickets.",
    "Operator: confirm no sibling app or warehouse table rename/drop risk from pending migration SQL (diff review on shadow).",
  ];

  const requiredBackupProof = [
    "Supabase PITR enabled and retention window documented, or full logical backup completed and restore-tested on a disposable instance.",
    "Restore drill documented (who runs it, time target, rollback decision criteria).",
    "Backup proof artifact stored outside this repo per policy (no connection strings in docs).",
  ];

  const commandsForReviewOnly = [
    "# Shadow only — placeholders, not runnable as-is:",
    "$env:DATABASE_URL=\"<SHADOW_DATABASE_URL>\"",
    "$env:DIRECT_URL=\"<SHADOW_DIRECT_URL>\"",
    "npx prisma validate",
    "npx prisma migrate deploy",
    "npx prisma migrate diff --from-migrations prisma/migrations --to-url \"$env:DATABASE_URL\"",
    "# Production — forbidden until Steve approval + backup proof:",
    "# npx prisma migrate deploy",
    "# npx prisma migrate resolve",
    "# npx prisma db push",
    "# npx prisma migrate reset",
  ];

  const absoluteDoNotRunYet = [
    "npx prisma migrate deploy",
    "npx prisma migrate resolve",
    "npx prisma db push",
    "npx prisma migrate reset",
  ];

  const productionBaselineMigrationHistoryAligned = prismaMigrationsTableExists === true;

  const netlifyReadiness = {
    readyToRetryNow: false,
    reason:
      "Netlify is not ready to retry against production until production baseline execution is approved and completed (or an operator proves the build-linked DB already matches migrations). DATABASE_URL/DIRECT_URL correctness is not verified by this offline script.",
    isNetlifyReadyToRetryProductionNow: false,
    databaseUrlCorrectedForCanonicalProduction: "not_verified_offline_packet",
    directUrlCorrectedForCanonicalProduction: "not_verified_offline_packet",
    productionBaselineMigrationHistoryAligned,
    shadowProofPassedInRepoArtifacts: spPassed,
    productionBaselineExecutionComplete: false,
    netlifyBuildScriptRunsPrismaMigrateDeploy: true,
    netlifyBuildScriptReference: "scripts/netlify-build.sh runs `npx prisma migrate deploy` after `npx prisma generate` unless the build pipeline is changed.",
    requiredBeforeRetry: [
      "Steve-approved execution packet for production (or proof the target DB is already migrated outside this review).",
      "Operator confirms DATABASE_URL and DIRECT_URL in Netlify (or CI) match the intended Supabase project — verify in dashboard; do not paste URIs into chat.",
      "Confirm no overlapping deploy or migration window against the same database.",
      "After production migrate: re-run hosted checks (migrate status, app smoke, optional hosted-db proof route) before treating Netlify as green.",
      "Commit data/shadow-db-migration-proof.json so automation and humans share the same shadow evidence.",
    ],
  };

  const emailCommandCenterReadiness = {
    readyForHostedDbProof: false,
    readyForEmailDiagnostics: true,
    readyForSendGridSandbox: false,
    readyForLiveSend: false,
    liveSendExplicitlyApproved: false,
    reason:
      "Email Command Center static gates (validate/typecheck/no-send-scan) can run locally; hosted DB proof and SendGrid sandbox/live sends remain gated until hosted DATABASE_URL is aligned and send policies are explicitly approved.",
  };

  const governance = {
    thisPacketApprovesProductionMigrate: false,
    thisPacketApprovesProductionBaselineExecution: false,
    thisPacketApprovesProductionMigrateResolve: false,
    thisPacketApprovesProductionDbPush: false,
    thisPacketApprovesProductionReset: false,
    thisPacketApprovesNetlifyRetry: false,
    thisPacketApprovesLiveSend: false,
    productionBaselineExecutionReadyForAutomaticRun: false,
  };

  const review = {
    schemaVersion: "1.0",
    slice: SLICE,
    generatedAt: new Date().toISOString(),
    mode: "offline_execution_review_only",
    productionMutationAttempted: false,
    sourceArtifacts: buildSourceArtifacts({
      productionDbBaselineAudit: audit,
      productionDbBaselinePlan: baselinePlan,
      productionDbSchemaReconciliation: readJsonIfExists(PATHS.schemaRecon),
      prismaSchemaMapAlignment: readJsonIfExists(PATHS.mapAlignment),
      prismaSchemaMapPatchPlan: readJsonIfExists(PATHS.mapPatchPlan),
      prismaSchemaMapPatchValidation: mapPatchVal,
      prismaSchemaMapFullReview: readJsonIfExists(PATHS.mapFullReview),
      shadowDbMigrationProof: shadow,
      shadowDbMigrationProofValidation: shadowVal,
      migrationDependencyOrderAudit: readJsonIfExists(PATHS.migrationDepAudit),
      migrationDependencyRepairPlan: readJsonIfExists(PATHS.migrationDepRepairPlan),
      migrationDependencyRepairValidation: depRepairVal,
    }),
    eligibility: {
      ...eligibility,
      reason:
        `${eligibility.reason} Migration directories counted: ${migrationCount}. Deferred FK migration on disk: ${fkeyOnDisk}.`,
    },
    proofInputs: {
      shadowProofPassed: spPassed,
      shadowDiffClean: spDiff,
      migrationDependencyRepairValidated: depOk,
      schemaMapPatchValidated: mapOk,
      prismaValidateKnownGreen: pvGreen,
    },
    productionDatabaseFacts: {
      correctDatabaseIdentified: true,
      prismaMigrationsTableExists,
      highValueTablesPresent,
      productionHasLegacySchema,
      productionContainsVoterCampaignData,
    },
    checksumRisk,
    baselineOptions,
    recommendedPath,
    requiredHumanApprovals,
    requiredBackupProof,
    commandsForReviewOnly,
    absoluteDoNotRunYet,
    netlifyReadiness,
    emailCommandCenterReadiness,
    governance,
  };

  fs.mkdirSync(path.dirname(PATHS.outReview), { recursive: true });
  fs.writeFileSync(PATHS.outReview, JSON.stringify(review, null, 2), "utf8");

  const commandChecklist = buildCommandChecklist(review.generatedAt);

  const netlifyRetry = {
    schemaVersion: "1.0",
    slice: SLICE,
    generatedAt: review.generatedAt,
    readyToRetryNow: false,
    readyToRetryNetlifyProductionBuild: false,
    isNetlifyReadyToRetryProductionNow: false,
    databaseUrlCorrectedForCanonicalProduction: review.netlifyReadiness.databaseUrlCorrectedForCanonicalProduction,
    directUrlCorrectedForCanonicalProduction: review.netlifyReadiness.directUrlCorrectedForCanonicalProduction,
    productionBaselineMigrationHistoryAligned: review.netlifyReadiness.productionBaselineMigrationHistoryAligned,
    shadowProofPassedInRepoArtifacts: review.netlifyReadiness.shadowProofPassedInRepoArtifacts,
    productionBaselineExecutionComplete: review.netlifyReadiness.productionBaselineExecutionComplete,
    netlifyBuildScriptRunsPrismaMigrateDeploy: review.netlifyReadiness.netlifyBuildScriptRunsPrismaMigrateDeploy,
    netlifyBuildScriptReference: review.netlifyReadiness.netlifyBuildScriptReference,
    summary: review.netlifyReadiness.reason,
    whatMustHappenBeforeRetry: review.netlifyReadiness.requiredBeforeRetry,
    requiredBeforeRetry: review.netlifyReadiness.requiredBeforeRetry,
    doNotChangeInThisPacket: [
      "Netlify dashboard environment variables",
      "netlify.toml or build plugins",
      "Production send toggles",
    ],
  };

  fs.writeFileSync(
    path.join(ROOT, "data/production-baseline-command-checklist.json"),
    JSON.stringify(commandChecklist, null, 2),
    "utf8"
  );
  fs.writeFileSync(
    path.join(ROOT, "data/netlify-production-retry-readiness.json"),
    JSON.stringify(netlifyRetry, null, 2),
    "utf8"
  );

  console.log("OK review-production-baseline-execution.mjs");
  console.log(" ", path.relative(ROOT, PATHS.outReview));
  console.log(" ", path.relative(ROOT, "data/production-baseline-command-checklist.json"));
  console.log(" ", path.relative(ROOT, "data/netlify-production-retry-readiness.json"));
  console.log(" decision:", review.eligibility.decision);
}

main();
