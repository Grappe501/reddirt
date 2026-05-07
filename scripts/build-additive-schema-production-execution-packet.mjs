/**
 * REDDIRT-ADDITIVE-SCHEMA-PRODUCTION-EXECUTION-PACKET-1.0
 * Offline-only: reads JSON/SQL artifacts, never connects to any database.
 * Does not run prisma migrate deploy / resolve / db push / reset or execute candidate SQL.
 */
import crypto from "crypto";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { analyzeCandidateSql, evaluateCloneProofHardened } from "./lib/additive-candidate-sql-guards.mjs";

const evaluateCloneProof = evaluateCloneProofHardened;

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const SLICE = "REDDIRT-ADDITIVE-SCHEMA-PRODUCTION-EXECUTION-PACKET-1.0";
const PRODUCTION_PROJECT_REF = "giozeoqulfojhxpywjil";
const APPROVAL_PHRASE = "STEVE_APPROVES_REDDIRT_ADDITIVE_SCHEMA_PRODUCTION_EXECUTION";

const PATHS = {
  unsafeAnalysis: path.join(ROOT, "data/unsafe-production-schema-diff-analysis.json"),
  plan: path.join(ROOT, "data/additive-schema-install-plan.json"),
  validation: path.join(ROOT, "data/additive-schema-install-validation.json"),
  cloneResult: path.join(ROOT, "data/additive-schema-clone-test-result.json"),
  executionReview: path.join(ROOT, "data/additive-schema-production-execution-review.json"),
  baselineAudit: path.join(ROOT, "data/production-db-baseline-audit.json"),
  candidateSql: path.join(ROOT, "data/sql/additive-schema-install-candidate.sql"),
  rejectedSql: path.join(ROOT, "data/sql/additive-schema-install-rejected-statements.sql"),
  outPacket: path.join(ROOT, "data/additive-schema-production-execution-packet.json"),
  outGates: path.join(ROOT, "data/additive-schema-production-approval-gates.json"),
  outPostcheck: path.join(ROOT, "data/additive-schema-production-postcheck-plan.json"),
  outNetlify: path.join(ROOT, "data/post-additive-schema-netlify-readiness.json"),
  docPacket: path.join(ROOT, "docs/additive-schema-production-execution-packet.md"),
  docGates: path.join(ROOT, "docs/additive-schema-production-approval-gates.md"),
  docRunbook: path.join(ROOT, "docs/additive-schema-production-runbook.md"),
  docPostcheck: path.join(ROOT, "docs/additive-schema-production-postcheck-plan.md"),
  docNetlify: path.join(ROOT, "docs/post-additive-schema-netlify-readiness.md"),
  docProdDbTest: path.join(ROOT, "docs/production-db-test-readiness.md"),
  docNetlifyRetry: path.join(ROOT, "docs/netlify-production-retry-readiness.md"),
  docHostedProof: path.join(ROOT, "docs/hosted-db-proof-after-baseline.md"),
  docEmailHardening: path.join(ROOT, "docs/email-command-center-launch-hardening.md"),
  docProjectMap: path.join(ROOT, "docs/PROJECT_MASTER_MAP.md"),
  docThreadMap: path.join(ROOT, "docs/THREAD_HANDOFF_MASTER_MAP.md"),
  docLedger: path.join(ROOT, "docs/campaign-email-command-center-progress-ledger.md"),
  developReport: path.join(ROOT, "develop_notes/REDDIRT_ADDITIVE_SCHEMA_PRODUCTION_EXECUTION_PACKET_1_0_REPORT.md"),
};

function readJson(p) {
  try {
    return JSON.parse(fs.readFileSync(p, "utf8"));
  } catch {
    return null;
  }
}

function rel(p) {
  return path.relative(ROOT, p).split(path.sep).join("/");
}

const ADDITIVE_PACKET_DOC_MARKER = "## REDDIRT-ADDITIVE-SCHEMA-PRODUCTION-EXECUTION-PACKET-1.0 (cross-links)";

/** Append governance links without clobbering existing operator docs in `docs/`. */
function appendAdditivePacketDocLinks(docPath) {
  if (!fs.existsSync(docPath)) return;
  const body = fs.readFileSync(docPath, "utf8");
  if (body.includes(ADDITIVE_PACKET_DOC_MARKER)) return;
  const section = `

${ADDITIVE_PACKET_DOC_MARKER}

Governed additive schema execution packet (automation does **not** apply production SQL from repo scripts in this slice):

- [\`additive-schema-production-execution-packet.md\`](./additive-schema-production-execution-packet.md) · [\`data/additive-schema-production-execution-packet.json\`](../data/additive-schema-production-execution-packet.json) · [\`data/additive-schema-production-execution-packet-validation.json\`](../data/additive-schema-production-execution-packet-validation.json)
- [\`additive-schema-production-approval-gates.md\`](./additive-schema-production-approval-gates.md) · [\`data/additive-schema-production-approval-gates.json\`](../data/additive-schema-production-approval-gates.json)
- [\`additive-schema-production-runbook.md\`](./additive-schema-production-runbook.md)
- [\`additive-schema-production-postcheck-plan.md\`](./additive-schema-production-postcheck-plan.md) · [\`data/additive-schema-production-postcheck-plan.json\`](../data/additive-schema-production-postcheck-plan.json)
- [\`post-additive-schema-netlify-readiness.md\`](./post-additive-schema-netlify-readiness.md) · [\`data/post-additive-schema-netlify-readiness.json\`](../data/post-additive-schema-netlify-readiness.json)
- [\`../develop_notes/REDDIRT_ADDITIVE_SCHEMA_PRODUCTION_EXECUTION_PACKET_1_0_REPORT.md\`](../develop_notes/REDDIRT_ADDITIVE_SCHEMA_PRODUCTION_EXECUTION_PACKET_1_0_REPORT.md)

Scripts: \`node scripts/build-additive-schema-production-execution-packet.mjs\` · \`node scripts/validate-additive-schema-production-execution-packet.mjs\` · \`node scripts/run-additive-schema-production-preflight.mjs\` · \`node scripts/run-additive-schema-production-guarded.mjs\` (**\`--dry-run\`** default) · \`node scripts/verify-additive-schema-production-postcheck.mjs\`.
`;
  fs.appendFileSync(docPath, section, "utf8");
}

function sha256File(p) {
  const h = crypto.createHash("sha256");
  h.update(fs.readFileSync(p));
  return h.digest("hex");
}

function buildPostcheckPlanJson(packetSlice, candidateSummary) {
  const expectedNewAppTables = [
    "ContentItemOverride",
    "HomepageConfig",
    "InboundContentItem",
    "CampaignEvent",
    "AdminContentBlock",
    "OwnedMediaAsset",
    "SearchChunk",
    "WorkflowIntake",
    "EmailContactProfile",
    "EmailWorkflowItem",
  ];
  const expectedLegacyPublicTables = [
    "ar02_voters",
    "contacts",
    "counties",
    "event_requests",
    "message_audiences",
    "path_to_victory",
    "people",
    "person_profiles",
  ];
  return {
    schemaVersion: "1.0",
    slice: packetSlice,
    generatedAt: new Date().toISOString(),
    mode: "read_only_post_execution_verification_plan",
    disclaimer:
      "Operator-run verification in Supabase SQL editor or read-only psql against production after additive install. With DATABASE_URL set, `node scripts/verify-additive-schema-production-postcheck.mjs` runs read-only Prisma probes and writes `data/additive-schema-production-postcheck-result.json` (no mutations).",
    expectedNewAppTables,
    expectedLegacyPublicTables,
    authUsersTable: "auth.users",
    phases: [
      {
        id: "p1_new_app_tables",
        title: "Newly installed Prisma-backed public tables",
        checks: expectedNewAppTables.map(
          (t) => `Confirm public."${t}" exists (information_schema / pg_catalog; match quoted casing from candidate SQL).`
        ),
      },
      {
        id: "p2_legacy_high_value",
        title: "High-value legacy / campaign tables still present",
        checks: expectedLegacyPublicTables.map((t) => `Confirm public.${t} still exists.`),
      },
      {
        id: "p3_auth_users",
        title: "Supabase auth intact",
        checks: ["Confirm auth.users still exists."],
      },
      {
        id: "p4_prisma_introspection_alignment",
        title: "Application alignment",
        checks: [
          "Run local npm run check and npm run typecheck in operator-controlled environment when DATABASE_URL points at hosted DB (separate approval).",
        ],
      },
      {
        id: "p5_no_prisma_migrate_deploy_yet",
        title: "Migration history unchanged by additive SQL",
        checks: [
          "Additive install does not baseline _prisma_migrations; do not run prisma migrate deploy until migration-history strategy is approved.",
        ],
      },
      {
        id: "p6_email_no_send_scan",
        title: "Comms lane regression signal",
        checks: ["npm run email:no-send-scan (lane local check; live send remains blocked by policy)."],
      },
    ],
    expectedStatementOrderNote: `Candidate contains approximately ${candidateSummary.statementCount} statements; full-file apply is a single governed operator action (Supabase SQL editor or approved runner).`,
  };
}

function buildNetlifyReadinessJson(packetSlice) {
  return {
    schemaVersion: "1.0",
    slice: packetSlice,
    generatedAt: new Date().toISOString(),
    mode: "post_additive_schema_netlify_readiness",
    netlifyRetryApprovedByThisPacket: false,
    netlifyRetryStillSeparate: true,
    migrateDeployFromNetlifyStillBlocked: true,
    reason:
      "Netlify production deploy retry and prisma migrate deploy toward production remain out of scope for this packet; complete additive execution + hosted verification + Steve-approved migration strategy first.",
    prerequisites: [
      "Additive candidate applied on production with postcheck phase 1–2 green.",
      "Hosted DB proof (read-only) documented.",
      "Steve explicit approval for any Netlify retry touching production DATABASE_URL.",
    ],
  };
}

function gate(key, label, evidenceRequired, whoApproves, notes) {
  return {
    key,
    label,
    required: true,
    status: "pending",
    evidenceRequired,
    whoApproves,
    notes,
  };
}

function buildApprovalGatesJson(packetSlice) {
  const gates = [
    gate(
      "backup_pitr_proof",
      "Backup/PITR proof confirmed immediately before execution.",
      "Supabase dashboard backup snapshot ID or PITR restore drill note (no secrets).",
      "Steve/operator",
      "Restore path must be proven on a non-production fork first when feasible."
    ),
    gate(
      "correct_production_project_ref",
      `Correct production project ref confirmed: ${PRODUCTION_PROJECT_REF}.`,
      "Visual match of Supabase project ref in dashboard with packet.",
      "Steve/operator",
      "Cross-check pooler vs direct URL forms; ref must match giozeoqulfojhxpywjil."
    ),
    gate(
      "candidate_sql_hash_recorded",
      "Candidate SQL sha256 recorded and matches execution packet.",
      "sha256 of data/sql/additive-schema-install-candidate.sql equals packet candidateSqlSha256.",
      "Steve/operator",
      "Recompute after any candidate regeneration."
    ),
    gate(
      "candidate_sql_validation_passed",
      "Candidate SQL validation artifact passed (offline).",
      "data/additive-schema-install-validation.json status pass; safeForProduction false.",
      "Steve/operator",
      "Run node scripts/validate-additive-schema-install-candidate.mjs if candidate changes."
    ),
    gate(
      "production_like_clone_proof_passed",
      "Production-like clone proof passed.",
      "data/additive-schema-clone-test-result.json ok, productionLikeCloneProof, high-value protection flags.",
      "Steve/operator",
      "Re-run node scripts/test-additive-schema-install-on-clone.mjs if artifact is stale."
    ),
    gate(
      "high_value_table_precheck_production",
      "High-value table precheck passed on production immediately before execution.",
      "Preflight JSON shows requiredTablesPresent and authUsersPresent.",
      "Steve/operator",
      "Run node scripts/run-additive-schema-production-preflight.mjs with production DATABASE_URL."
    ),
    gate(
      "maintenance_window_confirmed",
      "Maintenance window confirmed.",
      "Communications log or calendar entry reference (no secrets).",
      "Steve/operator",
      "Schema DDL can lock objects briefly; traffic expectations documented."
    ),
    gate(
      "steve_approval_phrase_recorded",
      `Steve approval phrase recorded: ${APPROVAL_PHRASE}.`,
      "Written approval in ticket or env gate for guarded runner.",
      "Steve",
      "Phrase must match exactly for REDDIRT_ADDITIVE_SCHEMA_PRODUCTION_EXECUTION_APPROVED."
    ),
    gate(
      "operator_ack_schema_mutation",
      "Operator understands SQL will mutate production schema.",
      "Signed checklist or REDDIRT_ACKNOWLEDGE_SCHEMA_MUTATION=YES at execute time.",
      "Steve/operator",
      "Additive only; still irreversible without PITR."
    ),
    gate(
      "operator_ack_prisma_migrations_not_baselined",
      "Operator understands this does not baseline _prisma_migrations.",
      "Verbal/written ack captured in operator notes.",
      "Steve/operator",
      "Separate migration-history slice still required."
    ),
    gate(
      "operator_ack_netlify_separate",
      "Operator understands Netlify retry is separate.",
      "Acknowledgement note or REDDIRT_ACKNOWLEDGE_NETLIFY_SEPARATE=YES.",
      "Steve/operator",
      "Do not conflate DDL apply with Netlify button retry."
    ),
    gate(
      "operator_ack_live_send_blocked",
      "Operator understands live send remains blocked.",
      "Acknowledgement note or REDDIRT_ACKNOWLEDGE_LIVE_SEND_BLOCKED=YES.",
      "Steve/operator",
      "Email Command Center live paths stay gated."
    ),
    gate(
      "post_execution_verification_plan_acknowledged",
      "Post-execution verification plan acknowledged.",
      "Operator confirms they will run postcheck script and/or SQL probes after apply.",
      "Steve/operator",
      "See docs/additive-schema-production-postcheck-plan.md."
    ),
  ];
  return {
    schemaVersion: "1.0",
    slice: packetSlice,
    generatedAt: new Date().toISOString(),
    approvalPhraseRequired: APPROVAL_PHRASE,
    gates,
    notes: "Every gate starts pending; human sign-off is authoritative. Machine statuses never approve production execution.",
  };
}

function main() {
  const generatedAt = new Date().toISOString();
  const errors = [];
  const warnings = [];

  const unsafe = readJson(PATHS.unsafeAnalysis);
  const plan = readJson(PATHS.plan);
  const validation = readJson(PATHS.validation);
  const clone = readJson(PATHS.cloneResult);
  const executionReview = readJson(PATHS.executionReview);
  const baselineAudit = readJson(PATHS.baselineAudit);

  const artifact = (p, j) => ({
    path: rel(p),
    loaded: j !== null,
    exists: fs.existsSync(p),
  });

  const sourceArtifacts = {
    unsafeProductionSchemaDiffAnalysis: artifact(PATHS.unsafeAnalysis, unsafe),
    additiveSchemaInstallPlan: artifact(PATHS.plan, plan),
    additiveSchemaInstallValidation: artifact(PATHS.validation, validation),
    additiveSchemaCloneTestResult: artifact(PATHS.cloneResult, clone),
    additiveSchemaProductionExecutionReview: artifact(PATHS.executionReview, executionReview),
    productionDbBaselineAudit: artifact(PATHS.baselineAudit, baselineAudit),
    additiveSchemaInstallCandidateSql: {
      path: rel(PATHS.candidateSql),
      loaded: fs.existsSync(PATHS.candidateSql),
      exists: fs.existsSync(PATHS.candidateSql),
    },
    additiveSchemaInstallRejectedStatementsSql: {
      path: rel(PATHS.rejectedSql),
      loaded: fs.existsSync(PATHS.rejectedSql),
      exists: fs.existsSync(PATHS.rejectedSql),
    },
  };

  if (!fs.existsSync(PATHS.candidateSql)) errors.push("missing data/sql/additive-schema-install-candidate.sql");

  const rawDiffRejected =
    Boolean(unsafe) &&
    (unsafe?.recommendation?.rawDiffSafeToExecute === false ||
      (typeof unsafe?.summary?.dropCount === "number" && unsafe.summary.dropCount > 0));
  if (!unsafe) errors.push("missing data/unsafe-production-schema-diff-analysis.json");
  if (unsafe && unsafe.recommendation?.rawDiffSafeToExecute !== false) {
    warnings.push("unsafe diff analysis does not explicitly set rawDiffSafeToExecute: false — verify manually.");
  }

  const candidateValidationPassed =
    validation?.status === "pass" && validation?.safeForCloneTest === true && validation?.safeForProduction === false;
  if (!validation) errors.push("missing data/additive-schema-install-validation.json");
  else if (!candidateValidationPassed) errors.push("additive-schema-install-validation.json must be pass with safeForCloneTest true and safeForProduction false");

  const safeForCloneTest = validation?.safeForCloneTest === true;
  const safeForProduction = validation?.safeForProduction === false;

  const { gates: cloneGates, passed: clonePassed, claimsPassButHardenedFails } = evaluateCloneProof(clone);
  if (!clone) errors.push("missing data/additive-schema-clone-test-result.json");
  if (claimsPassButHardenedFails) {
    warnings.push(
      "clone artifact claims ok/cloneProofPassed but fails hardened production-like gates — re-run scripts/test-additive-schema-install-on-clone.mjs against a production-like fork, then scripts/build-additive-schema-production-execution-review.mjs"
    );
  }

  const reviewMeaningful = executionReview?.cloneProofGates?.cloneProofMeaningful === true;
  if (executionReview && reviewMeaningful && !clonePassed) {
    warnings.push("data/additive-schema-production-execution-review.json says cloneProofMeaningful but current clone JSON fails hardened gates — refresh review after fixing clone artifact.");
  }

  let candidateSummary = {
    statementCount: 0,
    createTypeCount: 0,
    createTableCount: 0,
    createIndexCount: 0,
    alterTableCount: 0,
    dropCount: 0,
    truncateCount: 0,
    deleteCount: 0,
    insertCount: 0,
    updateCount: 0,
  };
  let candidateSha256 = null;
  let candidateNoDestructive = false;

  if (fs.existsSync(PATHS.candidateSql)) {
    const raw = fs.readFileSync(PATHS.candidateSql, "utf8");
    if (!raw.includes("DO NOT RUN ON PRODUCTION")) errors.push("candidate SQL must contain DO NOT RUN ON PRODUCTION");
    const a = analyzeCandidateSql(raw);
    candidateSummary = {
      statementCount: a.statementCount,
      createTypeCount: a.createTypeCount,
      createTableCount: a.createTableCount,
      createIndexCount: a.createIndexCount,
      alterTableCount: a.alterTableCount,
      dropCount: a.dropCount,
      truncateCount: a.truncateCount,
      deleteCount: a.deleteCount,
      insertCount: a.insertCount,
      updateCount: a.updateCount,
    };
    candidateNoDestructive =
      a.noDestructiveViolations &&
      a.dropCount === 0 &&
      a.truncateCount === 0 &&
      a.deleteCount === 0 &&
      a.insertCount === 0 &&
      a.updateCount === 0;
    if (!candidateNoDestructive) errors.push("candidate SQL failed destructive-statement scan — stop and repair candidate");
    candidateSha256 = sha256File(PATHS.candidateSql);
  }

  const highValueProtectionPassed =
    clonePassed &&
    cloneGates.voterTablesStillPresent &&
    cloneGates.legacyTablesStillPresent &&
    cloneGates.authTablesStillPresent;

  const readyForProductionExecutionPacket =
    errors.length === 0 &&
    rawDiffRejected &&
    candidateValidationPassed &&
    clonePassed &&
    highValueProtectionPassed &&
    candidateNoDestructive &&
    fs.existsSync(PATHS.candidateSql);

  const eligibility = {
    unsafeDiffRejected: rawDiffRejected,
    candidateValidationPassed,
    productionLikeCloneProofPassed: clonePassed,
    highValueProtectionPassed,
    readyForProductionExecutionPacket,
    readyForAutomaticExecution: false,
    readyForManualExecutionAfterApproval: false,
  };

  const approvalRequirements = {
    backupPitrProofRequired: true,
    steveApprovalRequired: true,
    correctProductionDbRequired: true,
    maintenanceWindowRequired: true,
    candidateSqlHashRequired: true,
    netlifyRetryStillSeparate: true,
    liveSendStillBlocked: true,
  };

  const nextRecommendedSlice = readyForProductionExecutionPacket
    ? "REDDIRT-ADDITIVE-SCHEMA-PRODUCTION-EXECUTION-OPERATOR-GATE-1.0"
    : "REDDIRT-RESTORE-PRODUCTION-LIKE-CLONE-1.0";

  const packet = {
    schemaVersion: "1.0",
    slice: SLICE,
    generatedAt,
    mode: "approval_gated_production_execution_packet",
    executionPacketStatus: readyForProductionExecutionPacket ? "ready_pending_human_approval" : "blocked_clone_or_validation",
    productionMutationExecutedByThisPacket: false,
    candidateSql: "data/sql/additive-schema-install-candidate.sql",
    candidateSqlSha256: candidateSha256,
    sourceArtifacts,
    eligibility,
    approvalRequirements,
    candidateSummary,
    cloneProofGateDetail: cloneGates,
    productionTargetSafety: {
      productionProjectRef: PRODUCTION_PROJECT_REF,
      mustNotEqualCloneRef: true,
      requiredExistingTablesBeforeExecution: [
        "public.ar02_voters",
        "public.contacts",
        "public.counties",
        "public.event_requests",
        "public.message_audiences",
        "public.path_to_victory",
        "public.people",
        "public.person_profiles",
      ],
    },
    manualExecutionOnly: true,
    automaticExecutionAllowed: false,
    productionExecutionApprovedByThisPacket: false,
    netlifyRetryApprovedByThisPacket: false,
    liveSendApprovedByThisPacket: false,
    approvalPhraseRequired: APPROVAL_PHRASE,
    nextRecommendedSlice,
    blockers: errors,
    warnings,
    claimsPassButHardenedFails,
    planStatementCount: plan?.summary?.candidateStatementCount ?? null,
    unsafeDiffSummary: unsafe?.summary ?? null,
  };

  const gatesJson = buildApprovalGatesJson(SLICE);
  const postcheckJson = buildPostcheckPlanJson(SLICE, candidateSummary);
  const netlifyJson = buildNetlifyReadinessJson(SLICE);

  fs.mkdirSync(path.dirname(PATHS.outPacket), { recursive: true });
  fs.writeFileSync(PATHS.outPacket, JSON.stringify(packet, null, 2), "utf8");
  fs.writeFileSync(PATHS.outGates, JSON.stringify(gatesJson, null, 2), "utf8");
  fs.writeFileSync(PATHS.outPostcheck, JSON.stringify(postcheckJson, null, 2), "utf8");
  fs.writeFileSync(PATHS.outNetlify, JSON.stringify(netlifyJson, null, 2), "utf8");

  const mdIntro = `# Additive schema production execution packet

**Slice:** \`${SLICE}\`  
**Generated:** ${generatedAt}  
**Machine JSON:** [\`data/additive-schema-production-execution-packet.json\`](../data/additive-schema-production-execution-packet.json)

## Safety

This packet **does not** execute SQL on production and **does not** run Prisma \`migrate deploy\`, \`migrate resolve\`, \`db push\`, or \`reset\`. The raw Prisma diff remains **rejected**. Only the curated **additive** candidate is in scope for a future manual operator run after gates.

## Eligibility snapshot

| Gate | Value |
|------|--------|
| readyForProductionExecutionPacket | **${eligibility.readyForProductionExecutionPacket}** |
| productionLikeCloneProofPassed | **${eligibility.productionLikeCloneProofPassed}** |
| candidate validation | **${eligibility.candidateValidationPassed}** |

## Candidate

- Path: \`data/sql/additive-schema-install-candidate.sql\`
- sha256: \`${candidateSha256 || "(none)"}\`
- Statement count (parsed): **${candidateSummary.statementCount}**

## Next slice

\`${nextRecommendedSlice}\`
`;

  fs.writeFileSync(PATHS.docPacket, mdIntro, "utf8");

  fs.writeFileSync(
    PATHS.docGates,
    `# Additive schema production approval gates

**Slice:** \`${SLICE}\`  
**Machine JSON:** [\`data/additive-schema-production-approval-gates.json\`](../data/additive-schema-production-approval-gates.json)

Thirteen gates, each starting **pending** with \`required: true\`. **Steve** must explicitly approve using the phrase in the JSON. **Netlify retry** and **live send** stay blocked by policy until separate slices.

## Required phrase

\`${APPROVAL_PHRASE}\`
`,
    "utf8"
  );

  fs.writeFileSync(
    PATHS.docRunbook,
    `# Additive schema production runbook (manual SQL)

**Slice:** \`${SLICE}\` · **Lane:** RedDirt only

## Preconditions

1. **Clone proof JSON is fresh** — \`data/additive-schema-clone-test-result.json\` must show hardened production-like gates (see packet JSON \`cloneProofGateDetail\`). If not, run \`node scripts/test-additive-schema-install-on-clone.mjs\` with \`REDDIRT_SCHEMA_INSTALL_TEST_DATABASE_URL\` on a **non-production** fork, then rebuild this packet.
2. **Supabase PITR / backup** — confirm restore path in dashboard documentation; this runbook does not execute restore.
3. **Correct project** — production Supabase project ref **${PRODUCTION_PROJECT_REF}** must match the SQL editor session.

## Forbidden (do not use for this install)

- Raw file \`data/sql/unsafe-production-to-current-schema-diff.sql\` and any Prisma-generated full diff
- \`npx prisma migrate deploy\` / \`migrate resolve\` / \`db push\` / \`reset\` against production for this step
- \`psql\` / \`prisma db execute\` from automation without Steve approval and without maintenance discipline

## Operator execution (after Steve approval)

1. Record **sha256** of \`data/sql/additive-schema-install-candidate.sql\` and compare to \`data/additive-schema-production-execution-packet.json\` → \`candidateSqlSha256\`.
2. Run \`node scripts/run-additive-schema-production-preflight.mjs\` with production \`DATABASE_URL\` / \`DIRECT_URL\` (script never prints secrets) and confirm \`readyForManualExecution\` is **true** in \`data/additive-schema-production-preflight.json\`.
3. **Preferred manual path:** Open Supabase SQL editor for the **production** project (ref above) and paste/run the candidate file per your DBA transaction policy (types → tables → indexes if splitting).
4. **Optional scripted path (operator workstation only):** \`node scripts/run-additive-schema-production-guarded.mjs --execute\` with all env gates set (see script header). This uses Prisma \`$executeRawUnsafe\` per parsed statement — **stop on first error**; never use unsupervised CI for \`--execute\`.
5. On any error, **stop**; rollback is **PITR / restore**, not a hand-written DROP script.

## Rollback / restore notes

- **Preferred:** Supabase **PITR** or backup restore to a point before the SQL window.
- **Not in scope:** destructive “undo” SQL (DROP newly created tables) as a default strategy — treat as last resort and separate human review.

## Post-execution

Follow [\`docs/additive-schema-production-postcheck-plan.md\`](./additive-schema-production-postcheck-plan.md) and machine JSON \`data/additive-schema-production-postcheck-plan.json\`.
`,
    "utf8"
  );

  fs.writeFileSync(
    PATHS.docPostcheck,
    `# Additive schema production post-check plan

**Machine JSON:** [\`data/additive-schema-production-postcheck-plan.json\`](../data/additive-schema-production-postcheck-plan.json)

Read-only checks in Supabase SQL editor or operator-controlled \`psql\` **after** additive install. \`scripts/verify-additive-schema-production-postcheck.mjs\` validates plan shape **offline** by default; with \`DATABASE_URL\` set it runs **read-only** Prisma probes and writes \`data/additive-schema-production-postcheck-result.json\` (never prints the URL).

## Phases

1. **Presence** — required public tables + \`auth.users\` still exist.  
2. **New tables** — spot-check Prisma-mapped tables that were missing in baseline audit.  
3. **Migration discipline** — additive SQL does not replace \`_prisma_migrations\` strategy; no blind \`migrate deploy\`.  
4. **Local lane checks** — \`npm run email:no-send-scan\`, \`npm run check\` in operator environment pointed at hosted DB only when approved separately.
`,
    "utf8"
  );

  fs.writeFileSync(
    PATHS.docNetlify,
    `# Post-additive schema Netlify readiness

**Machine JSON:** [\`data/post-additive-schema-netlify-readiness.json\`](../data/post-additive-schema-netlify-readiness.json)

**Netlify production retry** remains **out of scope** for this packet. This doc only records prerequisites so a **future** Steve-approved Netlify slice can proceed without conflating DB DDL with deploy retries.

## Prerequisites before any Netlify retry touching production

- Additive candidate applied and postcheck phase 1–2 satisfied.  
- Hosted read-only proof documented.  
- Separate approval for \`migrate deploy\` / build pipeline if applicable.
`,
    "utf8"
  );

  appendAdditivePacketDocLinks(PATHS.docProdDbTest);
  appendAdditivePacketDocLinks(PATHS.docNetlifyRetry);
  appendAdditivePacketDocLinks(PATHS.docHostedProof);

  if (fs.existsSync(PATHS.docEmailHardening)) {
    const eh = fs.readFileSync(PATHS.docEmailHardening, "utf8");
    if (!eh.includes("REDDIRT-ADDITIVE-SCHEMA-PRODUCTION-EXECUTION-PACKET-1.0")) {
      fs.appendFileSync(
        PATHS.docEmailHardening,
        `\n\n## Cross-cut — REDDIRT-ADDITIVE-SCHEMA-PRODUCTION-EXECUTION-PACKET-1.0\n\nGated additive DDL packet: [\`docs/additive-schema-production-execution-packet.md\`](./additive-schema-production-execution-packet.md) · [\`data/additive-schema-production-execution-packet.json\`](../data/additive-schema-production-execution-packet.json) · [\`data/additive-schema-production-execution-packet-validation.json\`](../data/additive-schema-production-execution-packet-validation.json) · [\`docs/additive-schema-production-approval-gates.md\`](./additive-schema-production-approval-gates.md) · [\`docs/additive-schema-production-runbook.md\`](./additive-schema-production-runbook.md). **No** production execution from repo scripts; **no** Netlify retry; **no** live send. Rebuild: \`node scripts/build-additive-schema-production-execution-packet.mjs\`.\n`,
        "utf8"
      );
    }
  }

  const mapInsert = `- **REDDIRT-ADDITIVE-SCHEMA-PRODUCTION-EXECUTION-PACKET-1.0** — [\`additive-schema-production-execution-packet.md\`](./additive-schema-production-execution-packet.md) · [\`additive-schema-production-approval-gates.md\`](./additive-schema-production-approval-gates.md) · [\`additive-schema-production-runbook.md\`](./additive-schema-production-runbook.md) · [\`additive-schema-production-postcheck-plan.md\`](./additive-schema-production-postcheck-plan.md) · [\`post-additive-schema-netlify-readiness.md\`](./post-additive-schema-netlify-readiness.md) · [\`data/additive-schema-production-execution-packet.json\`](../data/additive-schema-production-execution-packet.json) · [\`data/additive-schema-production-execution-packet-validation.json\`](../data/additive-schema-production-execution-packet-validation.json) · [\`data/additive-schema-production-approval-gates.json\`](../data/additive-schema-production-approval-gates.json) · [\`data/additive-schema-production-postcheck-plan.json\`](../data/additive-schema-production-postcheck-plan.json) · [\`data/post-additive-schema-netlify-readiness.json\`](../data/post-additive-schema-netlify-readiness.json) · [\`../develop_notes/REDDIRT_ADDITIVE_SCHEMA_PRODUCTION_EXECUTION_PACKET_1_0_REPORT.md\`](../develop_notes/REDDIRT_ADDITIVE_SCHEMA_PRODUCTION_EXECUTION_PACKET_1_0_REPORT.md) · \`scripts/build-additive-schema-production-execution-packet.mjs\` · \`scripts/validate-additive-schema-production-execution-packet.mjs\` · \`scripts/run-additive-schema-production-preflight.mjs\` · \`scripts/run-additive-schema-production-guarded.mjs\` (**\`--dry-run\`** default; **\`--execute\`** runs gated Prisma apply — operator-only) · \`scripts/verify-additive-schema-production-postcheck.mjs\` — governed additive SQL packet (**no** automation approval of production execution).`;

  const mapMarker = "- **REDDIRT-PRODUCTION-ADDITIVE-SCHEMA-INSTALL-PLAN-1.0**";
  if (fs.existsSync(PATHS.docProjectMap)) {
    const pm = fs.readFileSync(PATHS.docProjectMap, "utf8");
    if (!pm.includes("REDDIRT-ADDITIVE-SCHEMA-PRODUCTION-EXECUTION-PACKET-1.0")) {
      const idx = pm.indexOf(mapMarker);
      if (idx !== -1) {
        const lineEnd = pm.indexOf("\n", idx);
        const insertAt = lineEnd === -1 ? pm.length : lineEnd + 1;
        const next = pm.slice(0, insertAt) + mapInsert + "\n" + pm.slice(insertAt);
        fs.writeFileSync(PATHS.docProjectMap, next, "utf8");
      }
    }
  }

  const threadInsert = `**REDDIRT-ADDITIVE-SCHEMA-PRODUCTION-EXECUTION-PACKET-1.0** — **The raw Prisma diff is not safe to execute.** \`node scripts/build-additive-schema-production-execution-packet.mjs\` · \`node scripts/validate-additive-schema-production-execution-packet.mjs\` · \`node scripts/run-additive-schema-production-preflight.mjs\` · \`node scripts/run-additive-schema-production-guarded.mjs\` (**\`--dry-run\`** default; **\`--execute\`** = fully gated schema apply via Prisma \`$executeRawUnsafe\` per statement — **operator-only**, never from unsupervised agents). Docs: [\`additive-schema-production-execution-packet.md\`](./additive-schema-production-execution-packet.md) · [\`additive-schema-production-runbook.md\`](./additive-schema-production-runbook.md) · [\`post-additive-schema-netlify-readiness.md\`](./post-additive-schema-netlify-readiness.md). Data: [\`data/additive-schema-production-execution-packet.json\`](../data/additive-schema-production-execution-packet.json) · [\`data/additive-schema-production-execution-packet-validation.json\`](../data/additive-schema-production-execution-packet-validation.json) · [\`data/additive-schema-production-approval-gates.json\`](../data/additive-schema-production-approval-gates.json). [\`develop_notes/REDDIRT_ADDITIVE_SCHEMA_PRODUCTION_EXECUTION_PACKET_1_0_REPORT.md\`](../develop_notes/REDDIRT_ADDITIVE_SCHEMA_PRODUCTION_EXECUTION_PACKET_1_0_REPORT.md). **Netlify retry** and **live send** remain separate Steve gates.`;

  if (fs.existsSync(PATHS.docThreadMap)) {
    const tm = fs.readFileSync(PATHS.docThreadMap, "utf8");
    if (!tm.includes("REDDIRT-ADDITIVE-SCHEMA-PRODUCTION-EXECUTION-PACKET-1.0")) {
      const anchor = "## Additive schema install plan (unsafe diff → curated SQL, offline + clone)";
      const pos = tm.indexOf(anchor);
      if (pos !== -1) {
        const insertPos = pos + anchor.length;
        const next = tm.slice(0, insertPos) + "\n\n" + threadInsert + "\n" + tm.slice(insertPos);
        fs.writeFileSync(PATHS.docThreadMap, next, "utf8");
      }
    }
  }

  const ledgerInsert = ` **REDDIRT-ADDITIVE-SCHEMA-PRODUCTION-EXECUTION-PACKET-1.0** — [\`docs/additive-schema-production-execution-packet.md\`](./additive-schema-production-execution-packet.md) · [\`data/additive-schema-production-execution-packet.json\`](../data/additive-schema-production-execution-packet.json) · [\`data/additive-schema-production-execution-packet-validation.json\`](../data/additive-schema-production-execution-packet-validation.json) · [\`develop_notes/REDDIRT_ADDITIVE_SCHEMA_PRODUCTION_EXECUTION_PACKET_1_0_REPORT.md\`](../develop_notes/REDDIRT_ADDITIVE_SCHEMA_PRODUCTION_EXECUTION_PACKET_1_0_REPORT.md) · \`scripts/build-additive-schema-production-execution-packet.mjs\` (governed operator packet).`;

  if (fs.existsSync(PATHS.docLedger)) {
    const ld = fs.readFileSync(PATHS.docLedger, "utf8");
    if (!ld.includes("REDDIRT-ADDITIVE-SCHEMA-PRODUCTION-EXECUTION-PACKET-1.0")) {
      const cross = "**Cross-cut — production DB baseline";
      const cpos = ld.indexOf(cross);
      if (cpos !== -1) {
        const lineStart = ld.lastIndexOf("\n", cpos) + 1;
        const next = ld.slice(0, lineStart) + ledgerInsert + ld.slice(lineStart);
        fs.writeFileSync(PATHS.docLedger, next, "utf8");
      }
    }
  }

  const report = `# REDDIRT_ADDITIVE_SCHEMA_PRODUCTION_EXECUTION_PACKET_1_0_REPORT

**Lane:** RedDirt only  
**Generated:** ${generatedAt}  
**Slice:** \`${SLICE}\`

## 1. Slice summary

Governed **additive schema production execution packet** for RedDirt: machine JSON, thirteen approval gates, read-only preflight, guarded runner (**dry-run** default), postcheck plan, Netlify readiness notes, and cross-links. **No** production mutation from packet build scripts.

## 2. Files created

- \`data/additive-schema-production-execution-packet.json\`
- \`data/additive-schema-production-approval-gates.json\`
- \`data/additive-schema-production-postcheck-plan.json\`
- \`data/post-additive-schema-netlify-readiness.json\`
- \`docs/additive-schema-production-execution-packet.md\`
- \`docs/additive-schema-production-approval-gates.md\`
- \`docs/additive-schema-production-runbook.md\`
- \`docs/additive-schema-production-postcheck-plan.md\`
- \`docs/post-additive-schema-netlify-readiness.md\`
- \`develop_notes/REDDIRT_ADDITIVE_SCHEMA_PRODUCTION_EXECUTION_PACKET_1_0_REPORT.md\` (this file)

## 3. Files modified

- \`docs/production-db-test-readiness.md\`, \`docs/netlify-production-retry-readiness.md\`, \`docs/hosted-db-proof-after-baseline.md\` — cross-link section appended when missing.
- \`docs/email-command-center-launch-hardening.md\`, \`docs/PROJECT_MASTER_MAP.md\`, \`docs/THREAD_HANDOFF_MASTER_MAP.md\`, \`docs/campaign-email-command-center-progress-ledger.md\` — slice cross-links appended when missing.

## 4. Source artifacts inspected

- \`data/unsafe-production-schema-diff-analysis.json\`
- \`data/additive-schema-install-plan.json\`
- \`data/additive-schema-install-validation.json\`
- \`data/additive-schema-clone-test-result.json\`
- \`data/additive-schema-production-execution-review.json\`
- \`data/production-db-baseline-audit.json\`
- \`data/sql/additive-schema-install-candidate.sql\`
- \`data/sql/additive-schema-install-rejected-statements.sql\`

## 5. Candidate SQL summary

- **sha256:** ${candidateSha256 || "n/a"}
- **Parsed statement count:** ${candidateSummary.statementCount}
- **Creates:** types ${candidateSummary.createTypeCount}, tables ${candidateSummary.createTableCount}, indexes ${candidateSummary.createIndexCount}, alter ${candidateSummary.alterTableCount}
- **Destructive counts (must be zero):** drop ${candidateSummary.dropCount}, truncate ${candidateSummary.truncateCount}, delete ${candidateSummary.deleteCount}, insert ${candidateSummary.insertCount}, update ${candidateSummary.updateCount}

## 6. Clone proof summary

- **Hardened gates passed:** ${clonePassed}
- **Gate detail:** see \`data/additive-schema-production-execution-packet.json\` → \`cloneProofGateDetail\`.

## 7. Production preflight status

Run \`node scripts/run-additive-schema-production-preflight.mjs\` with operator \`DATABASE_URL\` / \`DIRECT_URL\` set. Latest machine output: \`data/additive-schema-production-preflight.json\` (not printed in this report).

## 8. Approval gates status

All thirteen gates start **pending** in \`data/additive-schema-production-approval-gates.json\`.

## 9. Guarded runner status

Default **dry-run** writes \`data/additive-schema-production-guarded-dry-run.json\`. **\`--execute\`** is operator-only with env gates; see \`scripts/run-additive-schema-production-guarded.mjs\`.

## 10. Postcheck plan

See \`docs/additive-schema-production-postcheck-plan.md\` and \`data/additive-schema-production-postcheck-plan.json\`. Optional read-only probes: \`node scripts/verify-additive-schema-production-postcheck.mjs\` with \`DATABASE_URL\` set.

## 11. Netlify / hosted DB readiness

\`docs/post-additive-schema-netlify-readiness.md\` — Netlify retry **not** approved by this slice. Hosted proof remains per \`docs/hosted-db-proof-after-baseline.md\`.

## 12. Email Command Center readiness impact

Additive DDL does **not** enable live send. Comms lane still gated; see \`docs/email-command-center-launch-hardening.md\`.

## 13. Governance status

- **readyForProductionExecutionPacket:** ${readyForProductionExecutionPacket}
- **readyForAutomaticExecution:** false (fixed in packet JSON)
- **Blockers (machine):** ${errors.length ? errors.join("; ") : "(none)"}

## 14. Checks

Rebuild: \`node scripts/build-additive-schema-production-execution-packet.mjs\` then \`node scripts/validate-additive-schema-production-execution-packet.mjs\`.

## 15. Risks / limitations

- Clone artifact must stay consistent with hardened runner; stale or hand-edited JSON can block the packet.
- Scripted \`--execute\` applies DDL sequentially; operator must still honor maintenance and PITR discipline.

## 16. Next recommended slice

\`${nextRecommendedSlice}\`

---

## Governance Q&A

| Question | Answer |
|----------|--------|
| Did this mutate production? | **NO.** |
| Did this execute candidate SQL on production? | **NO.** |
| Did this run production Prisma migrate deploy? | **NO.** |
| Did this run production Prisma migrate resolve? | **NO.** |
| Did this run production db push? | **NO.** |
| Did this run production reset? | **NO.** |
| Did this approve Netlify retry? | **NO.** |
| Did this approve live send? | **NO.** |
| Is production execution packet prepared? | **${readyForProductionExecutionPacket ? "YES" : "NO"}** |
| Is automatic execution allowed? | **NO.** |
| What must Steve approve next? | **Exact phrase + maintenance + PITR proof + preflight green + operator SQL plan** before any production DDL. Next slice: **REDDIRT-ADDITIVE-SCHEMA-PRODUCTION-EXECUTION-OPERATOR-GATE-1.0** (when packet ready). |

## Artifact staleness

If \`data/additive-schema-clone-test-result.json\` shows \`ok: true\` but \`before.publicTableCount\` < 100 or missing \`productionLikeCloneProof\`, it is **inconsistent** with \`scripts/test-additive-schema-install-on-clone.mjs\`. Re-run clone proof and \`node scripts/build-additive-schema-production-execution-review.mjs\`, then rebuild this packet.

## Commands (lane root)

\`\`\`text
node scripts/build-additive-schema-production-execution-packet.mjs
node scripts/validate-additive-schema-production-execution-packet.mjs
node scripts/run-additive-schema-production-preflight.mjs
node scripts/run-additive-schema-production-guarded.mjs --dry-run
node scripts/verify-additive-schema-production-postcheck.mjs
\`\`\`
`;

  fs.writeFileSync(PATHS.developReport, report, "utf8");

  console.log(readyForProductionExecutionPacket ? "PASS build-additive-schema-production-execution-packet.mjs" : "BLOCKED build-additive-schema-production-execution-packet.mjs");
  console.log(" ", rel(PATHS.outPacket));
  if (warnings.length) console.log("Warnings:", warnings.join(" | "));
  if (errors.length) console.error("Blockers:", errors.join(" | "));

  process.exit(readyForProductionExecutionPacket ? 0 : 1);
}

main();
