/**
 * REDDIRT-MIGRATION-HISTORY-BASELINE-EXECUTION-PACKET-1.0
 * Offline only: reads artifacts + prisma/migrations listing. No DB I/O.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const SLICE = "REDDIRT-MIGRATION-HISTORY-BASELINE-EXECUTION-PACKET-1.0";
const PRODUCTION_REF = "giozeoqulfojhxpywjil";
const EXPECTED_MIGRATION_COUNT = 71;
const EDITED_MIGRATION = "20260505203000_email_contact_profile_graph";
const DEFERRED_FK_MIGRATION = "20260515121000_email_contact_profile_relational_contact_fkey";
const APPROVAL_PHRASE = "STEVE_APPROVES_REDDIRT_MIGRATION_HISTORY_BASELINE_EXECUTION";

const PATHS = {
  postcheckProof: path.join(ROOT, "data/post-additive-production-postcheck-proof.json"),
  schemaStatus: path.join(ROOT, "data/post-additive-production-schema-status.json"),
  migrateHistory: path.join(ROOT, "data/prisma-migration-history-status.json"),
  strategy: path.join(ROOT, "data/post-additive-migration-history-strategy.json"),
  netlifyDecision: path.join(ROOT, "data/post-additive-netlify-readiness-decision.json"),
  guardedPlanStub: path.join(ROOT, "data/migration-history-baseline-guarded-plan.json"),
  additivePostcheckPlan: path.join(ROOT, "data/additive-schema-production-postcheck-plan.json"),
  cloneResult: path.join(ROOT, "data/additive-schema-clone-test-result.json"),
  additiveValidation: path.join(ROOT, "data/additive-schema-install-validation.json"),
  candidateSql: path.join(ROOT, "data/sql/additive-schema-install-candidate.sql"),
  prismaDir: path.join(ROOT, "prisma/migrations"),
  schemaPrisma: path.join(ROOT, "prisma/schema.prisma"),
  outPacket: path.join(ROOT, "data/migration-history-baseline-execution-packet.json"),
  outGates: path.join(ROOT, "data/migration-history-baseline-approval-gates.json"),
  outCommands: path.join(ROOT, "data/migration-history-baseline-command-list.json"),
  outNetlify: path.join(ROOT, "data/post-migration-history-netlify-readiness.json"),
  docPacket: path.join(ROOT, "docs/migration-history-baseline-execution-packet.md"),
  docGates: path.join(ROOT, "docs/migration-history-baseline-approval-gates.md"),
  docRunbook: path.join(ROOT, "docs/migration-history-baseline-runbook.md"),
  docPostNetlify: path.join(ROOT, "docs/post-migration-history-netlify-readiness.md"),
  projectMap: path.join(ROOT, "docs/PROJECT_MASTER_MAP.md"),
  threadMap: path.join(ROOT, "docs/THREAD_HANDOFF_MASTER_MAP.md"),
  ledger: path.join(ROOT, "docs/campaign-email-command-center-progress-ledger.md"),
  docProdTest: path.join(ROOT, "docs/production-db-test-readiness.md"),
  docNetlifyRetry: path.join(ROOT, "docs/netlify-production-retry-readiness.md"),
  docHosted: path.join(ROOT, "docs/hosted-db-proof-after-baseline.md"),
  docEmail: path.join(ROOT, "docs/email-command-center-launch-hardening.md"),
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

function listMigrationDirectories() {
  if (!fs.existsSync(PATHS.prismaDir)) return [];
  return fs
    .readdirSync(PATHS.prismaDir)
    .filter((n) => {
      const p = path.join(PATHS.prismaDir, n);
      return fs.statSync(p).isDirectory() && fs.existsSync(path.join(p, "migration.sql"));
    })
    .sort();
}

function artifact(p, loaded) {
  return { path: rel(p), loaded: Boolean(loaded), exists: fs.existsSync(p) };
}

function buildGates() {
  const gates = [
    { key: "backup_pitr", label: "Backup/PITR proof confirmed immediately before execution", required: true, status: "pending", evidenceRequired: "Supabase backup/PITR retention + restore drill reference (no secrets in repo)", whoApproves: "operator", notes: "" },
    { key: "correct_production_ref", label: `Correct production project ref confirmed: ${PRODUCTION_REF}`, required: true, status: "pending", evidenceRequired: "Dashboard visual match to intended Supabase project", whoApproves: "operator", notes: "" },
    { key: "post_additive_postcheck", label: "Production additive postcheck proof confirmed", required: true, status: "pending", evidenceRequired: "data/post-additive-production-postcheck-proof.json attestation current", whoApproves: "operator", notes: "" },
    { key: "command_list_reviewed", label: "Migration command list reviewed", required: true, status: "pending", evidenceRequired: "data/migration-history-baseline-command-list.json", whoApproves: "Steve/operator", notes: "" },
    { key: "migration_count_reviewed", label: "Migration count reviewed", required: true, status: "pending", evidenceRequired: "71 migration folders unless repo intentionally changed", whoApproves: "Steve/operator", notes: "" },
    { key: "checksum_risk", label: "Edited migration checksum risk acknowledged", required: true, status: "pending", evidenceRequired: `Awareness of ${EDITED_MIGRATION} edit per baseline review`, whoApproves: "Steve/operator", notes: "" },
    { key: "writes_prisma_migrations", label: "Operator understands this writes _prisma_migrations", required: true, status: "pending", evidenceRequired: "migrate resolve records rows; no DDL from migration.sql in resolve path", whoApproves: "operator", notes: "" },
    { key: "no_ddl_from_resolve", label: "Operator understands this does not run DDL migration files", required: true, status: "pending", evidenceRequired: "Training: resolve --applied marks applied only", whoApproves: "operator", notes: "" },
    { key: "no_migrate_deploy_in_packet", label: "Operator understands this packet path does not require migrate deploy for baseline", required: true, status: "pending", evidenceRequired: "Governed sequence: resolve first; deploy only if separate step approved", whoApproves: "Steve/operator", notes: "" },
    { key: "netlify_separate", label: "Operator understands this does not approve Netlify retry", required: true, status: "pending", evidenceRequired: "Separate slice after postcheck", whoApproves: "Steve", notes: "" },
    { key: "live_send_blocked", label: "Operator understands this does not approve live send", required: true, status: "pending", evidenceRequired: "EMAIL_WORKFLOW and provider sends unchanged", whoApproves: "Steve", notes: "" },
    { key: "maintenance_window", label: "Maintenance window confirmed", required: true, status: "pending", evidenceRequired: "Comms to stakeholders", whoApproves: "operator", notes: "" },
    { key: "steve_phrase", label: "Steve approval phrase recorded", required: true, status: "pending", evidenceRequired: APPROVAL_PHRASE, whoApproves: "Steve", notes: "" },
    { key: "postcheck_plan_ack", label: "Post-baseline verification plan acknowledged", required: true, status: "pending", evidenceRequired: "docs/migration-history-postcheck-plan.md", whoApproves: "operator", notes: "" },
  ];
  return {
    schemaVersion: "1.0",
    slice: SLICE,
    generatedAt: new Date().toISOString(),
    approvalPhraseRequired: APPROVAL_PHRASE,
    gates,
  };
}

function patchDocAppend(filePath, marker, block) {
  if (!fs.existsSync(filePath)) return;
  const t = fs.readFileSync(filePath, "utf8");
  if (t.includes(marker)) return;
  fs.appendFileSync(filePath, `\n\n${block}\n`, "utf8");
}

function patchMap(filePath, anchor, line) {
  if (!fs.existsSync(filePath)) return;
  const t = fs.readFileSync(filePath, "utf8");
  if (t.includes("REDDIRT-MIGRATION-HISTORY-BASELINE-EXECUTION-PACKET-1.0")) return;
  const idx = t.indexOf(anchor);
  if (idx === -1) return;
  const lineEnd = t.indexOf("\n", idx);
  const at = lineEnd === -1 ? t.length : lineEnd + 1;
  fs.writeFileSync(filePath, t.slice(0, at) + line + "\n" + t.slice(at), "utf8");
}

function main() {
  const generatedAt = new Date().toISOString();
  const errors = [];
  const warnings = [];

  const proof = readJson(PATHS.postcheckProof);
  if (!proof || proof.schemaVersion !== "1.0") errors.push("invalid data/post-additive-production-postcheck-proof.json");

  const postAdditiveOk =
    proof?.postcheckOutcome === "PASS" &&
    proof?.additiveSqlBaselinedPrismaMigrations === false &&
    proof?.productionProjectRef === PRODUCTION_REF &&
    proof?.authUsersStillPresent === true;

  if (!postAdditiveOk) errors.push("postcheck proof must show PASS, correct ref, auth.users, additiveSqlBaselinedPrismaMigrations false");

  const legacyOk =
    Array.isArray(proof?.highValueLegacyTables) &&
    proof.highValueLegacyTables.length >= 8 &&
    proof.highValueLegacyTables.every((t) => typeof t === "string");

  const newAppOk =
    Array.isArray(proof?.requiredNewAppTables) &&
    proof.requiredNewAppTables.length >= 10 &&
    proof.requiredNewAppTables.every((t) => typeof t === "string");

  if (!legacyOk) errors.push("highValueLegacyTables incomplete in proof");
  if (!newAppOk) errors.push("requiredNewAppTables incomplete in proof");

  readJson(PATHS.schemaStatus);
  readJson(PATHS.migrateHistory);
  readJson(PATHS.strategy);
  readJson(PATHS.netlifyDecision);
  readJson(PATHS.guardedPlanStub);
  readJson(PATHS.additivePostcheckPlan);
  const clone = readJson(PATHS.cloneResult);
  const validation = readJson(PATHS.additiveValidation);

  const candidateValidationPassed =
    validation?.status === "pass" && validation?.safeForCloneTest === true && validation?.safeForProduction === false;
  if (!validation) warnings.push("missing data/additive-schema-install-validation.json");
  else if (!candidateValidationPassed) warnings.push("additive install validation not pass");

  const productionLikeCloneProofPassed = Boolean(
    clone?.ok && clone?.productionLikeCloneProof === true && clone?.productionLikePrecheckPassed === true
  );
  if (!clone) warnings.push("missing data/additive-schema-clone-test-result.json");
  else if (!productionLikeCloneProofPassed) warnings.push("production-like clone proof not fully passed on artifact");

  const migrations = listMigrationDirectories();
  const migrationCount = migrations.length;
  if (migrationCount !== EXPECTED_MIGRATION_COUNT) {
    warnings.push(`migration folder count is ${migrationCount}, expected ${EXPECTED_MIGRATION_COUNT} — update packet if intentional`);
  }

  const commands = migrations.map((name) => ({
    migrationName: name,
    command: `npx prisma migrate resolve --applied "${name}"`,
    executionStatus: "DO_NOT_RUN_YET",
    scope: "production_or_clone_operator_only",
    notes: "Marks migration applied without executing migration.sql DDL. Only after schema equivalence is proven.",
  }));

  const riskFlags = {
    productionAppSchemaInstalled: true,
    migrationHistoryAbsentOrUnconfirmed: true,
    rawMigrateDeployUnsafeUntilBaseline: true,
    dbPushOrResetForbidden: true,
    editedMigrationChecksumRisk: true,
    editedMigrationId: EDITED_MIGRATION,
    deferredFkMigrationNoted: true,
    deferredFkMigrationId: DEFERRED_FK_MIGRATION,
  };

  const migrationDirectory = {
    path: "prisma/migrations",
    migrationCount,
    firstMigration: migrations[0] || "",
    lastMigration: migrations[migrations.length - 1] || "",
    knownEditedMigrationRisk: true,
  };

  const eligibility = {
    postAdditiveSchemaInstalled: errors.length === 0 && postAdditiveOk,
    legacyTablesPreserved: errors.length === 0 && legacyOk,
    candidateValidationPassed: candidateValidationPassed,
    productionLikeCloneProofPassed,
    productionPostcheckPassed: postAdditiveOk,
    migrationHistoryStillNeedsAlignment: true,
    readyForMigrationHistoryBaselinePacket: errors.length === 0,
    readyForAutomaticExecution: false,
    readyForManualExecutionAfterApproval: false,
  };

  const sourceArtifacts = {
    postAdditiveProductionPostcheckProof: artifact(PATHS.postcheckProof, proof),
    postAdditiveProductionSchemaStatus: artifact(PATHS.schemaStatus, readJson(PATHS.schemaStatus)),
    prismaMigrationHistoryStatus: artifact(PATHS.migrateHistory, readJson(PATHS.migrateHistory)),
    postAdditiveMigrationHistoryStrategy: artifact(PATHS.strategy, readJson(PATHS.strategy)),
    postAdditiveNetlifyReadinessDecision: artifact(PATHS.netlifyDecision, readJson(PATHS.netlifyDecision)),
    migrationHistoryBaselineGuardedPlanStub: artifact(PATHS.guardedPlanStub, readJson(PATHS.guardedPlanStub)),
    additiveSchemaProductionPostcheckPlan: artifact(PATHS.additivePostcheckPlan, readJson(PATHS.additivePostcheckPlan)),
    additiveSchemaCloneTestResult: artifact(PATHS.cloneResult, clone),
    additiveSchemaInstallValidation: artifact(PATHS.additiveValidation, validation),
    additiveSchemaInstallCandidateSql: artifact(PATHS.candidateSql, fs.existsSync(PATHS.candidateSql)),
    prismaSchemaPrisma: artifact(PATHS.schemaPrisma, fs.existsSync(PATHS.schemaPrisma)),
    prismaMigrationsGlob: rel(PATHS.prismaDir) + "/**/migration.sql",
  };

  const packet = {
    schemaVersion: "1.0",
    slice: SLICE,
    generatedAt,
    mode: "approval_gated_migration_history_baseline_packet",
    productionMutationExecutedByThisPacket: false,
    productionMigrationHistoryMutatedByThisPacket: false,
    sourceArtifacts,
    eligibility,
    riskFlags,
    migrationDirectory,
    approvalRequirements: {
      backupPitrProofRequired: true,
      steveApprovalRequired: true,
      correctProductionDbRequired: true,
      maintenanceWindowRequired: true,
      postAdditiveProductionPostcheckRequired: true,
      cloneBaselineProofRecommended: true,
      netlifyRetryStillSeparate: true,
      liveSendStillBlocked: true,
    },
    manualExecutionOnly: true,
    automaticExecutionAllowed: false,
    productionExecutionApprovedByThisPacket: false,
    netlifyRetryApprovedByThisPacket: false,
    liveSendApprovedByThisPacket: false,
    approvalPhraseRequired: APPROVAL_PHRASE,
    nextRecommendedSlice: "REDDIRT-MIGRATION-HISTORY-BASELINE-OPERATOR-GATE-1.0",
    commandListPath: rel(PATHS.outCommands),
    approvalGatesPath: rel(PATHS.outGates),
    warnings,
    blockers: errors,
    migrationCountExpected71Ok: migrationCount === EXPECTED_MIGRATION_COUNT,
  };

  const gatesJson = buildGates();
  gatesJson.generatedAt = generatedAt;

  const netlifyReadiness = {
    schemaVersion: "1.0",
    slice: SLICE,
    generatedAt,
    mode: "post_migration_history_netlify_readiness",
    netlifyProductionRetryApproved: false,
    netlifyRetryBlockedUntil: [
      "Migration-history baseline executed on production with Steve approval.",
      "data/migration-history-postcheck-plan.json checks satisfied (hosted migrate status clean).",
      "Separate Steve-approved Netlify retry packet.",
    ],
    hostedDbProof: "Follows successful Netlify deploy and operator-hosted verification — not claimed by this packet.",
    emailDiagnostics: "Run npm run email:db:diagnose and lane gates only after hosted DB is verified; no secrets in logs.",
    liveSend: "Remains blocked until explicit future execution packet.",
    netlifyBuildScriptNote: "scripts/netlify-build.sh still invokes npx prisma migrate deploy after prisma generate.",
  };

  fs.mkdirSync(path.dirname(PATHS.outPacket), { recursive: true });
  fs.writeFileSync(PATHS.outPacket, JSON.stringify(packet, null, 2), "utf8");
  fs.writeFileSync(PATHS.outGates, JSON.stringify(gatesJson, null, 2), "utf8");
  fs.writeFileSync(PATHS.outCommands, JSON.stringify({ schemaVersion: "1.0", slice: SLICE, generatedAt, commands }, null, 2), "utf8");
  fs.writeFileSync(PATHS.outNetlify, JSON.stringify(netlifyReadiness, null, 2), "utf8");

  const cross = `**REDDIRT-MIGRATION-HISTORY-BASELINE-EXECUTION-PACKET-1.0** — [\`migration-history-baseline-execution-packet.md\`](./migration-history-baseline-execution-packet.md) · [\`data/migration-history-baseline-execution-packet.json\`](../data/migration-history-baseline-execution-packet.json) · [\`data/migration-history-baseline-approval-gates.json\`](../data/migration-history-baseline-approval-gates.json) · [\`data/migration-history-baseline-command-list.json\`](../data/migration-history-baseline-command-list.json) · [\`docs/migration-history-baseline-runbook.md\`](../docs/migration-history-baseline-runbook.md) · \`scripts/build-migration-history-baseline-execution-packet.mjs\` — **governed** Prisma migration-history baseline (**no** production mutation from packet build; **no** Netlify retry).`;

  patchMap(PATHS.projectMap, "- **REDDIRT-POST-ADDITIVE-SCHEMA-MIGRATION-HISTORY-STRATEGY-1.0**", cross);

  if (fs.existsSync(PATHS.threadMap)) {
    const tm = fs.readFileSync(PATHS.threadMap, "utf8");
    if (!tm.includes("REDDIRT-MIGRATION-HISTORY-BASELINE-EXECUTION-PACKET-1.0")) {
      const a = "**REDDIRT-POST-ADDITIVE-SCHEMA-MIGRATION-HISTORY-STRATEGY-1.0**";
      const p = tm.indexOf(a);
      if (p !== -1) {
        const nl = tm.indexOf("\n", p);
        const at = nl === -1 ? tm.length : nl + 1;
        const block = `**REDDIRT-MIGRATION-HISTORY-BASELINE-EXECUTION-PACKET-1.0** — \`node scripts/build-migration-history-baseline-execution-packet.mjs\` · \`node scripts/run-migration-history-production-preflight.mjs\` · \`node scripts/test-migration-history-baseline-on-clone.mjs\` · \`node scripts/run-migration-history-baseline-guarded.mjs --dry-run\` · \`node scripts/validate-migration-history-baseline-execution-packet.mjs\` · \`node scripts/verify-migration-history-postcheck.mjs\`. Docs: [\`migration-history-baseline-execution-packet.md\`](./migration-history-baseline-execution-packet.md) · [\`migration-history-baseline-clone-proof.md\`](./migration-history-baseline-clone-proof.md). **No** production \`migrate deploy\`/\`resolve\` from agents; **next:** \`REDDIRT-MIGRATION-HISTORY-BASELINE-OPERATOR-GATE-1.0\`.\n`;
        fs.writeFileSync(PATHS.threadMap, tm.slice(0, at) + "\n" + block + tm.slice(at), "utf8");
      }
    }
  }

  if (fs.existsSync(PATHS.ledger)) {
    const ld = fs.readFileSync(PATHS.ledger, "utf8");
    if (!ld.includes("REDDIRT-MIGRATION-HISTORY-BASELINE-EXECUTION-PACKET-1.0")) {
      const ins = `**REDDIRT-MIGRATION-HISTORY-BASELINE-EXECUTION-PACKET-1.0** — [\`docs/migration-history-baseline-execution-packet.md\`](./migration-history-baseline-execution-packet.md) · [\`data/migration-history-baseline-execution-packet.json\`](../data/migration-history-baseline-execution-packet.json) · \`scripts/build-migration-history-baseline-execution-packet.mjs\` (**governed** \`_prisma_migrations\` baseline prep; **no** agent execution on production).\n\n`;
      const c = ld.indexOf("**REDDIRT-POST-ADDITIVE-SCHEMA-MIGRATION-HISTORY-STRATEGY-1.0**");
      if (c !== -1) fs.writeFileSync(PATHS.ledger, ld.slice(0, c) + ins + ld.slice(c), "utf8");
    }
  }

  const marker = "<!-- MIGRATION_HISTORY_BASELINE_PACKET_1_0 -->";
  patchDocAppend(
    PATHS.docEmail,
    "REDDIRT-MIGRATION-HISTORY-BASELINE-EXECUTION-PACKET-1.0",
    `## Cross-cut — REDDIRT-MIGRATION-HISTORY-BASELINE-EXECUTION-PACKET-1.0\n\n${marker}\n\nGoverned \`_prisma_migrations\` baseline packet: [\`migration-history-baseline-execution-packet.md\`](./migration-history-baseline-execution-packet.md) · [\`data/migration-history-baseline-execution-packet.json\`](../data/migration-history-baseline-execution-packet.json). **No** production mutation from build scripts; **no** Netlify retry; **no** live send. Dry-run: \`node scripts/run-migration-history-baseline-guarded.mjs --dry-run\`.`
  );

  patchDocAppend(
    PATHS.docProdTest,
    "MIGRATION_HISTORY_BASELINE_PACKET",
    `## Migration history baseline (post-additive)\n\nAfter additive SQL, use [\`migration-history-baseline-execution-packet.md\`](./migration-history-baseline-execution-packet.md) and [\`data/migration-history-production-preflight.json\`](../data/migration-history-production-preflight.json) before any hosted \`migrate deploy\` / Netlify retry.`
  );
  patchDocAppend(
    PATHS.docNetlifyRetry,
    "MIGRATION_HISTORY_BASELINE_PACKET",
    `## Post-additive: migration history before Netlify\n\nNetlify remains blocked until \`_prisma_migrations\` alignment — see [\`post-migration-history-netlify-readiness.md\`](./post-migration-history-netlify-readiness.md) and [\`migration-history-baseline-execution-packet.md\`](./migration-history-baseline-execution-packet.md).`
  );
  patchDocAppend(
    PATHS.docHosted,
    "MIGRATION_HISTORY_BASELINE_PACKET",
    `## After migration-history baseline\n\nOnce baseline + postcheck pass, document hosted read-only proof per \`email-hosted-db-proof.md\` and lane runbooks — not automatic from this packet.`
  );

  fs.writeFileSync(
    PATHS.docPacket,
    `# Migration history baseline execution packet

**Slice:** \`${SLICE}\` · **Generated:** ${generatedAt}

**Machine JSON:** [\`data/migration-history-baseline-execution-packet.json\`](../data/migration-history-baseline-execution-packet.json)

## Intent

Prepare **governed** \`migrate resolve --applied\` sequence for Prisma migration history after additive schema install. **This packet does not** execute production commands from \`build-migration-history-baseline-execution-packet.mjs\`.

## Commands

See [\`data/migration-history-baseline-command-list.json\`](../data/migration-history-baseline-command-list.json) — every row is **DO_NOT_RUN_YET** until Steve approval + preflight + optional clone proof.

## Next slice

\`REDDIRT-MIGRATION-HISTORY-BASELINE-OPERATOR-GATE-1.0\`
`,
    "utf8"
  );

  fs.writeFileSync(
    PATHS.docGates,
    `# Migration history baseline approval gates

**Machine JSON:** [\`data/migration-history-baseline-approval-gates.json\`](../data/migration-history-baseline-approval-gates.json)

All gates start **pending**. Approval phrase: \`${APPROVAL_PHRASE}\`.
`,
    "utf8"
  );

  fs.writeFileSync(
    PATHS.docRunbook,
    `# Migration history baseline runbook

**Slice:** \`${SLICE}\`

## Preconditions

1. [\`data/post-additive-production-postcheck-proof.json\`](../data/post-additive-production-postcheck-proof.json) current (POSTCHECK PASS).
2. Run [\`data/migration-history-production-preflight.json\`](../data/migration-history-production-preflight.json) via \`node scripts/run-migration-history-production-preflight.mjs\` with \`DATABASE_URL\` set (never paste URI into chat).
3. Optional: \`node scripts/test-migration-history-baseline-on-clone.mjs\` with \`REDDIRT_MIGRATION_HISTORY_TEST_DATABASE_URL\`.

## Operator sequence (after Steve approval — not automated here)

1. Backup / PITR proof.
2. For each migration in [\`data/migration-history-baseline-command-list.json\`](../data/migration-history-baseline-command-list.json): \`npx prisma migrate resolve --applied "<name>"\` **only if** production schema already matches that migration’s outcome (additive + prior DDL).
3. Re-check \`npx prisma migrate status\`.
4. **Separate** decision for \`migrate deploy\` (often no-op after resolve) — not bundled as automatic in guarded runner without explicit approval.

## Forbidden

- \`prisma migrate deploy\` on production without resolving pending/history strategy.
- \`db push\`, \`migrate reset\`, raw diff, additive candidate re-run.
`,
    "utf8"
  );

  fs.writeFileSync(
    PATHS.docPostNetlify,
    `# Post migration history Netlify readiness

**Machine JSON:** [\`data/post-migration-history-netlify-readiness.json\`](../data/post-migration-history-netlify-readiness.json)

Netlify production retry stays **blocked** until migration-history baseline is **actually executed** on production, postcheck passes, and a **separate** Steve-approved Netlify slice runs.

\`scripts/netlify-build.sh\` still runs \`npx prisma migrate deploy\` — history must be aligned first.

Hosted DB proof and email diagnostics follow a successful deploy path, documented elsewhere.
`,
    "utf8"
  );

  if (errors.length) {
    console.error("FAIL build-migration-history-baseline-execution-packet.mjs");
    errors.forEach((e) => console.error(" ", e));
    process.exit(1);
  }
  console.log("PASS build-migration-history-baseline-execution-packet.mjs");
  console.log(" ", rel(PATHS.outPacket));
  process.exit(0);
}

main();
