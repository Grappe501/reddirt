/**
 * REDDIRT-PRODUCTION-BASELINE-EXECUTION-PACKET-1.0
 * Offline only: reads JSON artifacts, validates gates, writes packet + gates + netlify plan + docs.
 * Does not connect to any database. Does not read .env.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const SLICE = "REDDIRT-PRODUCTION-BASELINE-EXECUTION-PACKET-1.0";
const STEVE_LINE = "DO NOT RUN UNTIL STEVE EXPLICITLY APPROVES PRODUCTION BASELINE EXECUTION.";
const APPROVAL_PHRASE = "STEVE_APPROVES_REDDIRT_PRODUCTION_BASELINE_EXECUTION";

const PATHS = {
  review: "data/production-baseline-execution-review.json",
  reviewVal: "data/production-baseline-execution-review-validation.json",
  checklist: "data/production-baseline-command-checklist.json",
  netlify: "data/netlify-production-retry-readiness.json",
  shadow: "data/shadow-db-migration-proof.json",
  shadowVal: "data/shadow-db-migration-proof-validation.json",
  depVal: "data/migration-dependency-repair-validation.json",
  audit: "data/production-db-baseline-audit.json",
  mapPatchVal: "data/prisma-schema-map-patch-validation.json",
  outPacket: "data/production-baseline-execution-packet.json",
  outGates: "data/production-baseline-approval-gates.json",
  outNetlifyPlan: "data/post-baseline-netlify-test-plan.json",
  migrations: "prisma/migrations",
};

function readJson(rel) {
  const p = path.join(ROOT, rel);
  if (!fs.existsSync(p)) return { ok: false, path: rel, data: null };
  try {
    return { ok: true, path: rel, data: JSON.parse(fs.readFileSync(p, "utf8")) };
  } catch {
    return { ok: false, path: rel, data: null };
  }
}

function toRelArtifacts() {
  return {
    productionBaselineExecutionReview: PATHS.review,
    productionBaselineExecutionReviewValidation: PATHS.reviewVal,
    productionBaselineCommandChecklist: PATHS.checklist,
    netlifyProductionRetryReadiness: PATHS.netlify,
    shadowDbMigrationProof: PATHS.shadow,
    shadowDbMigrationProofValidation: PATHS.shadowVal,
    migrationDependencyRepairValidation: PATHS.depVal,
    productionDbBaselineAudit: PATHS.audit,
    prismaSchemaMapPatchValidation: PATHS.mapPatchVal,
  };
}

function listMigrationCount() {
  const m = path.join(ROOT, PATHS.migrations);
  if (!fs.existsSync(m)) return 0;
  return fs
    .readdirSync(m, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .filter((name) => fs.existsSync(path.join(m, name.name, "migration.sql"))).length;
}

function verifyInputs() {
  const missing = [];
  const review = readJson(PATHS.review);
  const reviewVal = readJson(PATHS.reviewVal);
  const shadow = readJson(PATHS.shadow);
  const shadowVal = readJson(PATHS.shadowVal);
  const dep = readJson(PATHS.depVal);
  const audit = readJson(PATHS.audit);
  const mapPatch = readJson(PATHS.mapPatchVal);
  const checklist = readJson(PATHS.checklist);
  const netlify = readJson(PATHS.netlify);

  if (!review.ok || !review.data) missing.push(PATHS.review);
  if (!reviewVal.ok || reviewVal.data?.status !== "pass") missing.push(`${PATHS.reviewVal} (status must be pass)`);
  if (!shadow.ok || !shadow.data) missing.push(PATHS.shadow);
  if (!shadowVal.ok || shadowVal.data?.status !== "pass") missing.push(`${PATHS.shadowVal} (status must be pass)`);
  if (!dep.ok || dep.data?.status !== "pass") missing.push(`${PATHS.depVal} (status must be pass)`);
  if (!audit.ok) missing.push(PATHS.audit);
  if (!mapPatch.ok || mapPatch.data?.status !== "pass") missing.push(`${PATHS.mapPatchVal} (status must be pass)`);
  if (!checklist.ok) missing.push(PATHS.checklist);
  if (!netlify.ok) missing.push(PATHS.netlify);

  const r = review.data;
  const e = r?.eligibility;
  if (r && e?.decision !== "ready_for_execution_packet_after_backup_confirmation") {
    missing.push(`eligibility.decision must be ready_for_execution_packet_after_backup_confirmation (got ${e?.decision})`);
  }
  if (r && e?.readyForExecutionPacket !== true) missing.push("eligibility.readyForExecutionPacket must be true");
  if (r && e?.readyForAutomaticExecution !== false) missing.push("eligibility.readyForAutomaticExecution must be false");

  const p = r?.proofInputs;
  if (r && (!p?.shadowProofPassed || !p?.shadowDiffClean || !p?.migrationDependencyRepairValidated || !p?.schemaMapPatchValidated)) {
    missing.push("proofInputs must have shadowProofPassed, shadowDiffClean, migrationDependencyRepairValidated, schemaMapPatchValidated all true");
  }

  const em = r?.emailCommandCenterReadiness;
  if (r && (em?.readyForLiveSend === true || em?.liveSendExplicitlyApproved === true)) {
    missing.push("live send must not be approved in review JSON");
  }

  const gov = r?.governance;
  if (r && gov && gov.thisPacketApprovesLiveSend === true) missing.push("governance must not approve live send");

  const mc = listMigrationCount();
  if (mc !== 71) missing.push(`expected 71 migration directories with migration.sql, found ${mc}`);

  return {
    missing,
    review: review.data,
    shadow: shadow.data,
    dep: dep.data,
    audit: audit.data,
    mapPatch: mapPatch.data,
    migrationCount: mc,
  };
}

function buildApprovalGates(generatedAt) {
  const gate = (key, label, evidenceRequired, whoApproves, notes = "") => ({
    key,
    label,
    required: true,
    status: "pending",
    evidenceRequired,
    whoApproves,
    notes,
  });

  return {
    schemaVersion: "1.0",
    slice: SLICE,
    generatedAt,
    approvalPhraseRequired: APPROVAL_PHRASE,
    liveSendRemainsBlocked: true,
    netlifyRetryRemainsBlockedUntilPostVerify: true,
    gates: [
      gate(
        "backup_pitr_proof",
        "Backup / PITR proof confirmed.",
        "Pointer to backup snapshot ID, PITR window, or restore-test record (no secrets).",
        "Steve / operator"
      ),
      gate(
        "correct_supabase_project",
        "Correct Supabase project confirmed.",
        "Supabase dashboard project ref + name match intended production (verify in UI).",
        "Operator"
      ),
      gate(
        "production_db_url_org_project",
        "Production DATABASE_URL belongs to the paid/pro organization project.",
        "Confirm in Supabase + hosting env UIs that the pooler URL targets the intended org project (do not paste full URL into tickets).",
        "Operator"
      ),
      gate(
        "maintenance_window",
        "Maintenance window selected.",
        "Agreed calendar window or explicit low-risk window for migrate deploy.",
        "Steve / operator"
      ),
      gate(
        "latest_branch_commit",
        "Latest branch/commit confirmed.",
        "Git SHA or tag recorded for RedDirt that generated this packet and migrations.",
        "Operator"
      ),
      gate(
        "shadow_proof_passed",
        "Shadow proof artifact passed.",
        "`data/shadow-db-migration-proof-validation.json` status pass + proof JSON present.",
        "Machine / operator"
      ),
      gate(
        "migration_dependency_repair_passed",
        "Migration dependency repair artifact passed.",
        "`data/migration-dependency-repair-validation.json` status pass.",
        "Machine / operator"
      ),
      gate(
        "production_baseline_review_passed",
        "Production baseline review passed.",
        "`data/production-baseline-execution-review-validation.json` status pass.",
        "Machine / operator"
      ),
      gate(
        "steve_approval_phrase_recorded",
        "Steve approval phrase recorded.",
        `Written record that Steve used phrase: ${APPROVAL_PHRASE} (store per policy, not in chat logs).`,
        "Steve"
      ),
      gate(
        "dba_checksum_warning_ack",
        "DBA / checksum warning acknowledged.",
        "Operator/DBA sign-off on edited migration checksum risk (see packet checksumRisk).",
        "Operator / DBA"
      ),
      gate(
        "netlify_retry_plan_ack",
        "Netlify deploy retry plan acknowledged.",
        "Read `docs/post-baseline-netlify-test-plan.md` — retry only after baseline + migrate status clean.",
        "Operator"
      ),
      gate(
        "hosted_db_proof_plan_ack",
        "Hosted DB proof route test plan acknowledged.",
        "Read `docs/hosted-db-proof-after-baseline.md` — token never pasted into tickets.",
        "Operator"
      ),
      gate(
        "live_send_remains_blocked",
        "Live send remains blocked.",
        "Confirm packet `emailCommandCenterProofPlan.liveSendApproved` is false and no live-send env toggles are staged.",
        "Steve / operator"
      ),
    ],
  };
}

function buildNetlifyPlanJson(generatedAt) {
  return {
    schemaVersion: "1.0",
    slice: SLICE,
    generatedAt,
    liveSendRemainsBlocked: true,
    readyToRetryImmediately: false,
    requiresBaselineExecutionFirst: true,
    summary:
      "Netlify production retry stays blocked until production baseline execution completes, migrate status is clean, and hosted proof + email diagnostics pass.",
    stages: [
      {
        id: "baseline_done",
        label: "Confirm production baseline execution completed.",
        detail: "Operator attests `npx prisma migrate deploy` (or DBA-equivalent) finished successfully against the confirmed production URL.",
      },
      {
        id: "migrate_status_clean",
        label: "Confirm `npx prisma migrate status` no longer reports all 71 migrations pending.",
        detail: "Against production DATABASE_URL/DIRECT_URL: applied count aligns with repo (71 migrations).",
      },
      {
        id: "netlify_env_vars",
        label: "Confirm Netlify env vars: DATABASE_URL, DIRECT_URL, EMAIL_DIAGNOSTICS_TOKEN.",
        detail: "Names only in tickets; values verified in Netlify UI by authorized operator.",
      },
      {
        id: "trigger_netlify_deploy",
        label: "Trigger Netlify deploy.",
        detail: "Only after Steve approves retry; `scripts/netlify-build.sh` runs `prisma generate` then `prisma migrate deploy`.",
      },
      {
        id: "build_pipeline",
        label: "Confirm build reaches and passes: prisma generate, prisma migrate deploy, Next build.",
        detail: "Build logs show each step green; investigate failures before re-triggering.",
      },
      {
        id: "hosted_db_proof_no_token",
        label: "Test hosted DB proof route without token.",
        detail: "Expect 401, 503, or JSON handler response — not 404 HTML (wrong deploy or missing route).",
      },
      {
        id: "hosted_db_proof_with_token",
        label: "Test hosted DB proof route with token.",
        detail: "Bearer token from secure channel only; never paste token into docs or chat.",
      },
      {
        id: "email_diagnostics",
        label: "Test email diagnostics.",
        detail: "Run documented email diagnostics against hosted env (no PII export).",
      },
      {
        id: "sendgrid_auth",
        label: "Test SendGrid auth.",
        detail: "Verify API key scope / auth without enabling broadcast.",
      },
      {
        id: "sendgrid_sandbox_only",
        label: "Test SendGrid sandbox only.",
        detail: "Sandbox mode only — no production recipient blast.",
      },
      {
        id: "live_send_blocked",
        label: "Keep live send blocked.",
        detail: "No live-send approval; no broadcast toggles until separate governance slice.",
      },
    ],
    forbiddenInThisPacket: ["Netlify env edits", "netlify.toml edits", "live sends", "SendGrid broadcast"],
  };
}

function writeMarkdown(rel, body) {
  fs.writeFileSync(path.join(ROOT, rel), body, "utf8");
}

function buildSuccessPacket(ctx) {
  const { review: r, audit, migrationCount, generatedAt } = ctx;
  const pdf = r.productionDatabaseFacts || {};
  const reason =
    r.eligibility?.reason ||
    "Shadow proof and validations pass; execution remains manual-only until backup/PITR proof and Steve approval.";

  const commandTemplatesForReviewOnly = [
    {
      phase: "0_preconditions",
      title: "Preconditions (no Prisma yet)",
      lines: [STEVE_LINE, "# Confirm backup/PITR and database identity in Supabase/Netlify UIs (do not paste full URIs into tickets)."],
    },
    {
      phase: "1_prisma_validate_production_target",
      title: "Validate schema against production URL (operator session only)",
      lines: [
        STEVE_LINE,
        "# $env:DATABASE_URL = \"<PRODUCTION_POOLER_URI_PLACEHOLDER>\"",
        "# $env:DIRECT_URL   = \"<PRODUCTION_DIRECT_URI_PLACEHOLDER>\"",
        "# Set-Location <REDDIRT_ROOT>",
        "# npx prisma validate",
      ],
    },
    {
      phase: "2_prisma_migrate_deploy_production",
      title: "Apply migrations to production",
      lines: [
        STEVE_LINE,
        "# npx prisma migrate status",
        "# npx prisma migrate deploy",
        "# npx prisma migrate status",
      ],
    },
    {
      phase: "3_post_verify",
      title: "Post-deploy verification",
      lines: [
        STEVE_LINE,
        "# npm run email:db:diagnose",
        "# npm run email:no-send-scan",
        "# Hosted DB proof per docs/hosted-db-proof-after-baseline.md",
      ],
    },
  ];

  const postExecutionVerification = [
    "`npx prisma migrate status` shows expected applied migrations (not 71 pending).",
    "`npm run email:db:diagnose` and `npm run email:no-send-scan` clean in controlled window.",
    "Hosted DB proof route returns JSON success with bearer token.",
    "Netlify build passes prisma generate + migrate deploy + Next build (when retry approved).",
    "Live send and broadcast remain disabled.",
  ];

  return {
    schemaVersion: "1.0",
    slice: SLICE,
    generatedAt,
    mode: "approval_gated_execution_packet",
    executionPacketStatus: "ready",
    productionMutationExecutedByThisPacket: false,
    sourceArtifacts: toRelArtifacts(),
    eligibility: {
      readyForExecutionPacket: true,
      readyForAutomaticExecution: false,
      readyForManualExecutionAfterApproval: false,
      reason,
    },
    proofSummary: {
      shadowProofPassed: !!r.proofInputs?.shadowProofPassed,
      shadowDiffClean: !!r.proofInputs?.shadowDiffClean,
      migrationDependencyRepairValidated: !!r.proofInputs?.migrationDependencyRepairValidated,
      schemaMapPatchValidated: !!r.proofInputs?.schemaMapPatchValidated,
      productionBaselineReviewValidated: true,
    },
    productionDatabaseFacts: {
      correctDatabaseIdentified: !!pdf.correctDatabaseIdentified,
      prismaMigrationsTableExists: !!pdf.prismaMigrationsTableExists,
      highValueTablesPresent: !!pdf.highValueTablesPresent,
      containsVoterCampaignData: !!(pdf.containsVoterCampaignData ?? pdf.productionContainsVoterCampaignData),
    },
    backupAndApprovalRequirements: {
      backupPitrProofRequired: true,
      steveApprovalRequired: true,
      dbaReviewRecommended: true,
      maintenanceWindowRequired: true,
    },
    executionStrategy: {
      recommendedStrategy: r.recommendedPath?.strategy || "Option D — controlled production baseline after shadow proof (with Option C discipline).",
      manualOnly: true,
      automaticExecutionAllowed: false,
      summary:
        "Single governed operator session: backup/PITR proven, correct DB URL, then `prisma validate` + `migrate deploy` + post-verify. No automatic runner in repo.",
    },
    migrationDirectoryCount: migrationCount,
    checksumRisk: r.checksumRisk,
    commandTemplatesForReviewOnly,
    postExecutionVerification,
    netlifyRetryPlan: {
      readyToRetryImmediately: false,
      requiresBaselineExecutionFirst: true,
      steps: [
        "Complete production baseline migrate per runbook.",
        "Verify migrate status and hosted DB proof.",
        "Confirm Netlify env vars then trigger deploy only with Steve approval.",
      ],
    },
    emailCommandCenterProofPlan: {
      hostedDbProofAfterDeploy: true,
      emailDiagnosticsAfterHostedDbProof: true,
      sendGridSandboxAfterDiagnostics: true,
      liveSendApproved: false,
    },
    absoluteDoNotRunUntilApproved: [
      "npx prisma migrate deploy",
      "npx prisma migrate resolve",
      "npx prisma db push",
      "npx prisma migrate reset",
    ],
    approvalPhraseRequired: APPROVAL_PHRASE,
    auditSnapshotNote:
      audit?.database?.prismaMigrationsTableExists === false
        ? "Latest audit JSON: no public._prisma_migrations at audit time."
        : "See production-db-baseline-audit.json for latest prismaMigrationsTableExists.",
  };
}

function buildBlockedPacket(missing, generatedAt) {
  return {
    schemaVersion: "1.0",
    slice: SLICE,
    generatedAt,
    mode: "approval_gated_execution_packet",
    executionPacketStatus: "blocked_missing_required_artifact",
    missingArtifacts: missing,
    productionMutationExecutedByThisPacket: false,
    sourceArtifacts: toRelArtifacts(),
    eligibility: {
      readyForExecutionPacket: false,
      readyForAutomaticExecution: false,
      readyForManualExecutionAfterApproval: false,
      reason: `Blocked: missing or invalid prerequisites — ${missing.join("; ")}`,
    },
    proofSummary: {
      shadowProofPassed: false,
      shadowDiffClean: false,
      migrationDependencyRepairValidated: false,
      schemaMapPatchValidated: false,
      productionBaselineReviewValidated: false,
    },
    productionDatabaseFacts: {
      correctDatabaseIdentified: false,
      prismaMigrationsTableExists: false,
      highValueTablesPresent: false,
      containsVoterCampaignData: false,
    },
    backupAndApprovalRequirements: {
      backupPitrProofRequired: true,
      steveApprovalRequired: true,
      dbaReviewRecommended: true,
      maintenanceWindowRequired: true,
    },
    executionStrategy: {
      recommendedStrategy: "",
      manualOnly: true,
      automaticExecutionAllowed: false,
      summary: "Packet incomplete until all source artifacts validate.",
    },
    migrationDirectoryCount: listMigrationCount(),
    checksumRisk: null,
    commandTemplatesForReviewOnly: [],
    postExecutionVerification: [],
    netlifyRetryPlan: {
      readyToRetryImmediately: false,
      requiresBaselineExecutionFirst: true,
      steps: [],
    },
    emailCommandCenterProofPlan: {
      hostedDbProofAfterDeploy: true,
      emailDiagnosticsAfterHostedDbProof: true,
      sendGridSandboxAfterDiagnostics: true,
      liveSendApproved: false,
    },
    absoluteDoNotRunUntilApproved: [
      "npx prisma migrate deploy",
      "npx prisma migrate resolve",
      "npx prisma db push",
      "npx prisma migrate reset",
    ],
    approvalPhraseRequired: APPROVAL_PHRASE,
  };
}

function main() {
  const generatedAt = new Date().toISOString();
  const { missing, review, audit, migrationCount } = verifyInputs();

  const approvalGates = buildApprovalGates(generatedAt);
  const netlifyPlan = buildNetlifyPlanJson(generatedAt);

  fs.writeFileSync(path.join(ROOT, PATHS.outGates), JSON.stringify(approvalGates, null, 2), "utf8");
  fs.writeFileSync(path.join(ROOT, PATHS.outNetlifyPlan), JSON.stringify(netlifyPlan, null, 2), "utf8");

  let packet;
  if (missing.length) {
    packet = buildBlockedPacket(missing, generatedAt);
    fs.writeFileSync(path.join(ROOT, PATHS.outPacket), JSON.stringify(packet, null, 2), "utf8");
    console.error("FAIL build-production-baseline-execution-packet.mjs — blocked_missing_required_artifact");
    missing.forEach((m) => console.error(" -", m));
    writeBlockedDocs(generatedAt, missing);
    process.exit(1);
  }

  packet = buildSuccessPacket({ review, audit, migrationCount, generatedAt });
  fs.writeFileSync(path.join(ROOT, PATHS.outPacket), JSON.stringify(packet, null, 2), "utf8");

  writeSuccessDocs(generatedAt, review);
  console.log("OK build-production-baseline-execution-packet.mjs");
  console.log(" ", PATHS.outPacket);
  console.log(" ", PATHS.outGates);
  console.log(" ", PATHS.outNetlifyPlan);
}

function writeBlockedDocs(generatedAt, missing) {
  writeMarkdown(
    "docs/production-baseline-execution-packet.md",
    `# Production baseline execution packet (${SLICE}) — **BLOCKED**

**Status:** \`executionPacketStatus: blocked_missing_required_artifact\` — **no** production mutation.

**Missing / invalid:** ${missing.map((m) => `\`${m}\``).join(", ")}

Regenerate after inputs pass: \`node scripts/build-production-baseline-execution-packet.mjs\`.
`
  );
  writeMarkdown(
    "docs/production-baseline-approval-gates.md",
    `# Production baseline approval gates (${SLICE}) — **BLOCKED**

Packet build failed; gates JSON was written with all \`status: "pending"\`. Fix missing artifacts then rebuild.
`
  );
  writeMarkdown(
    "docs/production-baseline-execution-runbook.md",
    `# Production baseline execution runbook (${SLICE}) — **BLOCKED**

See \`docs/production-baseline-execution-packet.md\`. Do not run production Prisma until build succeeds.
`
  );
  writeMarkdown(
    "docs/post-baseline-netlify-test-plan.md",
    `# Post-baseline Netlify test plan (${SLICE}) — **BLOCKED**

Rebuild packet first. JSON: [\`data/post-baseline-netlify-test-plan.json\`](../data/post-baseline-netlify-test-plan.json).
`
  );
  writeMarkdown(
    "docs/hosted-db-proof-after-baseline.md",
    `# Hosted DB proof after baseline (${SLICE}) — **BLOCKED**

Rebuild execution packet before using this doc.
`
  );
  const report = `# REDDIRT_PRODUCTION_BASELINE_EXECUTION_PACKET_1_0_REPORT

**Slice:** ${SLICE}  
**Generated:** ${generatedAt}

## Slice summary

Build **BLOCKED** — missing or invalid prerequisites.

## Missing artifacts / checks

${missing.map((m) => `- ${m}`).join("\n")}

## Governance status

| Question | Answer |
|----------|--------|
| Did this mutate production? | **NO** |
| Execution packet prepared? | **NO** (blocked) |

## Next recommended slice

Fix inputs listed above, then re-run \`node scripts/build-production-baseline-execution-packet.mjs\`.
`;
  fs.writeFileSync(path.join(ROOT, "develop_notes/REDDIRT_PRODUCTION_BASELINE_EXECUTION_PACKET_1_0_REPORT.md"), report, "utf8");
}

function writeSuccessDocs(generatedAt, r) {
  writeMarkdown(
    "docs/production-baseline-execution-packet.md",
    `# Production baseline execution packet (${SLICE})

**Status:** prepared **offline** only — \`executionPacketStatus: ready\` — **no production mutation** by this packet.

**Machine JSON:** [\`data/production-baseline-execution-packet.json\`](../data/production-baseline-execution-packet.json) · **Gates:** [\`data/production-baseline-approval-gates.json\`](../data/production-baseline-approval-gates.json) · **Netlify plan:** [\`data/post-baseline-netlify-test-plan.json\`](../data/post-baseline-netlify-test-plan.json) · **Validation:** [\`data/production-baseline-execution-packet-validation.json\`](../data/production-baseline-execution-packet-validation.json) · **Preflight:** [\`data/production-baseline-execution-preflight.json\`](../data/production-baseline-execution-preflight.json)

**Related:** [\`production-baseline-execution-review.md\`](./production-baseline-execution-review.md) · [\`production-baseline-approval-gates.md\`](./production-baseline-approval-gates.md) · [\`production-baseline-execution-runbook.md\`](./production-baseline-execution-runbook.md) · [\`develop_notes/REDDIRT_PRODUCTION_BASELINE_EXECUTION_PACKET_1_0_REPORT.md\`](../develop_notes/REDDIRT_PRODUCTION_BASELINE_EXECUTION_PACKET_1_0_REPORT.md)

---

## Steve gate (every template line)

**${STEVE_LINE}**

Approval phrase (record out-of-band): \`${APPROVAL_PHRASE}\`

---

## Checksum / DBA

${r.checksumRisk?.risk || "See packet JSON `checksumRisk`."}

---

## Next step

1. \`node scripts/validate-production-baseline-execution-packet.mjs\`
2. \`node scripts/run-production-baseline-execution-preflight.mjs\` (requires \`DATABASE_URL\` / \`DIRECT_URL\` in env — **never** logged)
3. \`node scripts/run-production-baseline-execution-guarded.mjs --dry-run\` only from automation
`
  );

  writeMarkdown(
    "docs/production-baseline-approval-gates.md",
    `# Production baseline approval gates (${SLICE})

Every gate in [\`data/production-baseline-approval-gates.json\`](../data/production-baseline-approval-gates.json) stays \`status: "pending"\` until a human records evidence **outside** this repo per policy.

**Approval phrase (Steve):** \`${APPROVAL_PHRASE}\` — store in your approval system; do not paste secrets into chat.

**Live sends** and **Netlify production retry** remain **blocked** until post-baseline verification — [\`post-baseline-netlify-test-plan.md\`](./post-baseline-netlify-test-plan.md).
`
  );

  writeMarkdown(
    "docs/production-baseline-execution-runbook.md",
    `# Production baseline execution runbook (${SLICE})

## Order of operations

1. **Validate packet:** \`node scripts/validate-production-baseline-execution-packet.mjs\`
2. **Preflight:** \`node scripts/run-production-baseline-execution-preflight.mjs\` (checks env presence + URL shape only — **does not** print secrets)
3. **Gates:** satisfy every gate in [\`production-baseline-approval-gates.md\`](./production-baseline-approval-gates.md)
4. **Guarded (dry-run only from CI):** \`node scripts/run-production-baseline-execution-guarded.mjs --dry-run\`
5. **Manual execution:** operator runs \`npx prisma validate\` then \`npx prisma migrate deploy\` in a **separate** approved terminal — this repo’s guarded script **does not** invoke Prisma.

## Steve gate

**${STEVE_LINE}**

No production Prisma without backup proof, correct DB, and recorded approval phrase.
`
  );

  writeMarkdown(
    "docs/post-baseline-netlify-test-plan.md",
    `# Post-baseline Netlify test plan (${SLICE})

Stages are machine-listed in [\`data/post-baseline-netlify-test-plan.json\`](../data/post-baseline-netlify-test-plan.json): baseline done → migrate status clean → Netlify envs → deploy → build steps → hosted proof (no token / with token) → email diagnostics → SendGrid auth → **sandbox only** → live send still blocked.

**Until** production \`_prisma_migrations\` is aligned, **do not** treat Netlify production as green.

See also [\`netlify-production-retry-readiness.md\`](./netlify-production-retry-readiness.md).
`
  );

  writeMarkdown(
    "docs/hosted-db-proof-after-baseline.md",
    `# Hosted DB proof after baseline (${SLICE})

After production \`migrate deploy\`, exercise the **read-only** hosted DB proof route (see Email Command Center docs for the exact path, commonly \`GET /api/admin/production-readiness/hosted-db\`).

## Rules

- **Never** paste bearer tokens, API keys, or full \`DATABASE_URL\` into tickets, chat, or screenshots.
- **404 HTML** from the site usually means wrong deploy, wrong domain, or route not shipped — fix deploy before interpreting DB state.
- **401 / 403** without token (or bad token) — expected auth boundary; confirms route exists.
- **503** may mean misconfigured server env or DB unreachable from host — investigate infra.
- **200** JSON with valid token — preferred success shape for “DB reachable from hosted app” (interpret only documented fields; no voter dumps).

## PowerShell templates (placeholders only — **no secrets**)

\`\`\`powershell
# Replace HOST and use a token from your secure channel (do not commit).
$base = "https://HOST"
# Without token — expect 401/403/503 or small JSON, not HTML 404:
Invoke-WebRequest -Uri "$base/api/admin/production-readiness/hosted-db" -Method GET -UseBasicParsing
# With token:
$token = "<PASTE_ONLY_IN_SECURE_SESSION>"
Invoke-WebRequest -Uri "$base/api/admin/production-readiness/hosted-db" -Headers @{ Authorization = "Bearer $token" } -Method GET -UseBasicParsing
\`\`\`

**Live send** remains **blocked** until a separate governance slice explicitly approves it.
`
  );

  const report = `# REDDIRT_PRODUCTION_BASELINE_EXECUTION_PACKET_1_0_REPORT

**Slice:** ${SLICE}  
**Generated:** ${generatedAt}

## Slice summary

Built the **gated** production baseline execution **packet** (JSON + docs) from validated review and shadow artifacts. **No** production database mutation; **no** Netlify retry; **no** live send approval.

## Files created / overwritten

| Output | Path |
|--------|------|
| Packet | \`data/production-baseline-execution-packet.json\` |
| Approval gates | \`data/production-baseline-approval-gates.json\` |
| Netlify post-plan | \`data/post-baseline-netlify-test-plan.json\` |
| Docs | \`docs/production-baseline-execution-packet.md\`, \`production-baseline-approval-gates.md\`, \`production-baseline-execution-runbook.md\`, \`post-baseline-netlify-test-plan.md\`, \`hosted-db-proof-after-baseline.md\` |

## Files modified

- \`scripts/build-production-baseline-execution-packet.mjs\` (this generator)
- \`scripts/validate-production-baseline-execution-packet.mjs\`
- \`scripts/run-production-baseline-execution-preflight.mjs\`
- \`scripts/run-production-baseline-execution-guarded.mjs\`
- Hub docs per Phase 8 (production-db-test-readiness, netlify-production-retry-readiness, email-command-center-launch-hardening, campaign-email-command-center-progress-ledger, PROJECT_MASTER_MAP, THREAD_HANDOFF_MASTER_MAP) — verify links in those files.

## Source artifacts inspected

Relative paths embedded in \`data/production-baseline-execution-packet.json\` → \`sourceArtifacts\`.

## Execution packet status

\`executionPacketStatus: ready\` — **prepared**, not executed.

## Approval gates status

All gates \`status: "pending"\` in \`data/production-baseline-approval-gates.json\`.

## Preflight status

Run \`node scripts/run-production-baseline-execution-preflight.mjs\` after setting \`DATABASE_URL\` and \`DIRECT_URL\` in the shell (values never printed).

## Guarded runner status

**Dry-run only** in automation. **Do not** run with \`--execute\` from Cursor. With \`--execute\` and all env flags, the script still **does not** spawn Prisma — operator runs commands in a separate terminal.

**PowerShell env for guarded \`--execute\` gate check (example):**

\`\`\`powershell
$env:REDDIRT_PRODUCTION_BASELINE_EXECUTION_APPROVED='STEVE_APPROVES_REDDIRT_PRODUCTION_BASELINE_EXECUTION'
$env:REDDIRT_BACKUP_PITR_CONFIRMED='YES'
$env:REDDIRT_CORRECT_PRODUCTION_DB_CONFIRMED='YES'
$env:REDDIRT_MAINTENANCE_WINDOW_CONFIRMED='YES'
$env:REDDIRT_SHADOW_PROOF_CONFIRMED='YES'
$env:REDDIRT_ACKNOWLEDGE_CHECKSUM_RISK='YES'
# Plus DATABASE_URL and DIRECT_URL set in the same session (never echo).
\`\`\`

## Netlify / hosted DB test plan

See \`data/post-baseline-netlify-test-plan.json\` and \`docs/post-baseline-netlify-test-plan.md\`. Hosted DB proof detail: \`docs/hosted-db-proof-after-baseline.md\`.

## Email Command Center readiness impact

Packet keeps \`emailCommandCenterProofPlan.liveSendApproved: false\`. Hosted proof and diagnostics are **planned after** baseline + deploy, not approved here.

## Governance status

| Question | Answer |
|----------|--------|
| Did this mutate production? | **NO** |
| Did this run production migrate deploy / resolve / db push / reset? | **NO** |
| Did this approve Netlify retry? | **NO** |
| Did this approve live send? | **NO** |
| Is an execution packet prepared? | **YES** |
| Are approval gates pending? | **YES** |
| Is automatic execution allowed? | **NO** |

## What Steve must approve next

Backup/PITR proof, correct production Supabase project + URL intent, maintenance window, written baseline execution approval (phrase \`${APPROVAL_PHRASE}\`), DBA checksum acknowledgment, then operator manual Prisma in a separate terminal.

## Checks

Run: \`node scripts/validate-production-baseline-execution-packet.mjs\`, \`node scripts/run-production-baseline-execution-preflight.mjs\`, \`node scripts/run-production-baseline-execution-guarded.mjs --dry-run\`, \`npx prisma validate\`, \`npm run typecheck\`, \`npm run check\`, \`npm run email:no-send-scan\`. Optional selfbuild validators if present (document in this report after run).

## Risks / limitations

- Edited migration checksum risk — see packet \`checksumRisk\`.
- This repo does not execute \`migrate deploy\`; operator discipline required.

## Next recommended slice

Operator execution after Steve approval + backup proof — **not** another Cursor build slice until baseline is done or blocked on new inputs.
`;
  fs.writeFileSync(path.join(ROOT, "develop_notes/REDDIRT_PRODUCTION_BASELINE_EXECUTION_PACKET_1_0_REPORT.md"), report, "utf8");
}

main();
