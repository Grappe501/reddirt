/**
 * Builds post–migration-history Netlify retry readiness packet from
 * data/migration-history-production-preflight.json + scripts/netlify-build.sh.
 * Does not trigger Netlify, mutate production, or approve live send.
 * REDDIRT-POST-MIGRATION-HISTORY-NETLIFY-RETRY-1.0
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const SLICE = "REDDIRT-POST-MIGRATION-HISTORY-NETLIFY-RETRY-1.0";
const NEXT_SLICE = "REDDIRT-NETLIFY-OPERATOR-RETRY-1.0";
const REQUIRED_REF = "giozeoqulfojhxpywjil";

const PREFLIGHT = path.join(ROOT, "data/migration-history-production-preflight.json");
const NETLIFY_BUILD = path.join(ROOT, "scripts/netlify-build.sh");
const NETLIFY_TOML = path.join(ROOT, "netlify.toml");
const PACKET_OUT = path.join(ROOT, "data/post-migration-history-netlify-retry-packet.json");
const CHECKLIST_JSON = path.join(ROOT, "data/post-migration-history-deploy-checklist.json");
const UNLOCK_JSON = path.join(ROOT, "data/communication-command-center-next-unlock.json");
const PACKET_MD = path.join(ROOT, "docs/post-migration-history-netlify-retry-packet.md");
const CHECKLIST_MD = path.join(ROOT, "docs/post-migration-history-deploy-checklist.md");
const REPORT = path.join(ROOT, "develop_notes/REDDIRT_POST_MIGRATION_HISTORY_NETLIFY_RETRY_1_0_REPORT.md");

function loadJson(p) {
  try {
    return JSON.parse(fs.readFileSync(p, "utf8"));
  } catch {
    return null;
  }
}

function analyzeNetlifyBuild(shPath) {
  if (!fs.existsSync(shPath)) {
    return { runsMigrateDeploy: false, buildScriptPresent: false, migrateDeployMatch: "" };
  }
  const src = fs.readFileSync(shPath, "utf8");
  const runsMigrateDeploy =
    /\bnpx\s+prisma\s+migrate\s+deploy\b/i.test(src) || /\bprisma\s+migrate\s+deploy\b/i.test(src);
  return { runsMigrateDeploy, buildScriptPresent: true, migrateDeployMatch: "prisma migrate deploy" };
}

function evaluatePreflight(pf) {
  const failures = [];
  const assert = (ok, msg) => {
    if (!ok) failures.push(msg);
  };

  if (!pf || typeof pf !== "object") {
    return { ok: false, failures: ["missing or invalid migration-history-production-preflight.json"], checks: {} };
  }

  const summary = String(pf.migrateStatusSummary || "");
  const statusUpToDate = /database schema is up to date/i.test(summary);

  const checks = {
    productionProjectRefConfirmed: pf.productionProjectRefConfirmed === true,
    requiredLegacyTablesPresent: pf.requiredLegacyTablesPresent === true,
    requiredNewAppTablesPresent: pf.requiredNewAppTablesPresent === true,
    authUsersPresent: pf.authUsersPresent === true,
    prismaMigrationsTableExists: pf.prismaMigrationsTableExists === true,
    prismaMigrationsCount71: pf.prismaMigrationsCount === 71,
    pendingMigrationCountZero: pf.pendingMigrationCount === 0,
    migrateStatusExitCodeZero: pf.migrateStatusExitCode === 0,
    migrateStatusSummaryUpToDate: statusUpToDate,
    readyForManualBaselineReview: pf.readyForManualBaselineReview === true,
  };

  assert(checks.productionProjectRefConfirmed, "preflight.productionProjectRefConfirmed must be true");
  assert(checks.requiredLegacyTablesPresent, "preflight.requiredLegacyTablesPresent must be true");
  assert(checks.requiredNewAppTablesPresent, "preflight.requiredNewAppTablesPresent must be true");
  assert(checks.authUsersPresent, "preflight.authUsersPresent must be true");
  assert(checks.prismaMigrationsTableExists, "preflight.prismaMigrationsTableExists must be true");
  assert(checks.prismaMigrationsCount71, "preflight.prismaMigrationsCount must be 71");
  assert(checks.pendingMigrationCountZero, "preflight.pendingMigrationCount must be 0");
  assert(checks.migrateStatusExitCodeZero, "preflight.migrateStatusExitCode must be 0");
  assert(checks.migrateStatusSummaryUpToDate, 'preflight.migrateStatusSummary must include "Database schema is up to date"');
  assert(checks.readyForManualBaselineReview, "preflight.readyForManualBaselineReview must be true");

  return { ok: failures.length === 0, failures, checks };
}

function buildDeployChecklist(generatedAt, netlifyTomlUsesBuildScript) {
  return {
    schemaVersion: "1.0",
    slice: SLICE,
    generatedAt,
    mode: "operator_netlify_production_retry_checklist",
    productionRef: REQUIRED_REF,
    items: [
      {
        id: "review_packet_json",
        required: true,
        title: "Review machine packet",
        detail: "Open data/post-migration-history-netlify-retry-packet.json and confirm eligibility.* matches operator truth.",
      },
      {
        id: "netlify_env_database_url",
        required: true,
        title: "Netlify DATABASE_URL",
        detail: `Hosted Postgres only; project ref must be ${REQUIRED_REF}. Use Supabase session pooler form (user postgres.${REQUIRED_REF}) when host is *.pooler.supabase.com. No localhost / clone URL.`,
      },
      {
        id: "netlify_env_direct_url",
        required: false,
        title: "Netlify DIRECT_URL",
        detail: "If split pooler/direct URIs are used, set DIRECT_URL per Supabase docs; otherwise build script mirrors DATABASE_URL.",
      },
      {
        id: "confirm_no_clone_in_netlify",
        required: true,
        title: "Confirm no clone/staging DB in production site env",
        detail: "Compare env to production project only; do not paste non-production URIs into the production Netlify site.",
      },
      {
        id: "build_script_migrate_deploy",
        required: true,
        title: "Understand build runs prisma migrate deploy",
        detail: netlifyTomlUsesBuildScript
          ? "netlify.toml invokes bash scripts/netlify-build.sh, which runs npx prisma migrate deploy after prisma generate. With pending migrations at 0, deploy should be a no-op aside from bookkeeping."
          : "Verify Netlify build command still runs prisma migrate deploy before next build.",
      },
      {
        id: "forbidden_cli",
        required: true,
        title: "Do not run db push or migrate reset",
        detail: "Forbidden on production: prisma db push, prisma migrate reset, raw additive SQL replay, migration-history baseline script again.",
      },
      {
        id: "retry_deploy_only",
        required: true,
        title: "Controlled production deploy retry",
        detail: "Use Netlify UI or approved CI to trigger production deploy only — not triggered by this repo packet.",
      },
      {
        id: "post_deploy_hosted_proof",
        required: true,
        title: "After green deploy: hosted DB proof",
        detail: "Run data-driven proof steps in data/hosted-db-proof-readiness.json and docs/hosted-db-proof-after-baseline.md (no secrets in logs).",
      },
      {
        id: "live_send_stays_blocked",
        required: true,
        title: "Live send remains blocked",
        detail: "EMAIL_WORKFLOW_CAN_SEND_FROM_ITEM and broadcast paths stay gated until a future explicit execution packet.",
      },
    ],
  };
}

function buildUnlockJson(generatedAt, eligibilityOk) {
  return {
    schemaVersion: "1.0",
    slice: SLICE,
    generatedAt,
    mode: "communication_command_center_next_unlock",
    liveSendBlocked: true,
    automaticNetlifyDeploy: false,
    eligibilityForNetlifyRetryFromPreflight: eligibilityOk,
    afterSuccessfulNetlifyProductionDeploy: [
      "Confirm site health and build logs show prisma migrate deploy completed without applying new migrations (pending was 0).",
      "Run npm run email:db:diagnose with DATABASE_URL pointed at hosted production (operator shell only; do not paste URI into chat).",
      "Optional: GET /api/admin/production-readiness/hosted-db with diagnostics token — see docs/email-hosted-db-proof.md.",
      "Continue lane gates in docs/email-command-center-launch-hardening.md — no contact import automation, no sends.",
    ],
    notUnblockedByThisPacket: [
      "live_send",
      "gmail_send_from_queue",
      "sendgrid_broadcast",
      "twilio_sms",
      "social_posting",
      "contact_import_commit",
      "prisma_db_push",
      "prisma_migrate_reset",
    ],
    nextRecommendedSlice: NEXT_SLICE,
  };
}

function writePacketMd(generatedAt, eligibility, failures, netlify) {
  const status = eligibility.readyForOperatorNetlifyRetry ? "READY (operator)" : "NOT READY — fix preflight / artifacts";
  return `# Post–migration-history Netlify retry packet

**Slice:** \`${SLICE}\`  
**Generated:** ${generatedAt}  
**Machine JSON:** [\`../data/post-migration-history-netlify-retry-packet.json\`](../data/post-migration-history-netlify-retry-packet.json)  
**Status:** ${status}

## Purpose

Governed readiness for the **first** production Netlify deploy retry after additive schema install, postcheck, and **Prisma migration history baseline** alignment. This document and JSON **do not** trigger Netlify, **do not** approve live send, and **do not** mutate production.

## Preconditions (from preflight)

Production migration-history preflight must show: ref confirmed, legacy + app tables present, \`auth.users\`, \`_prisma_migrations\` with **71** rows, \`prisma migrate status\` exit **0**, summary contains “Database schema is up to date”, pending migrations **0**.

## Netlify build

\`netlify.toml\` uses \`bash scripts/netlify-build.sh\`, which runs \`npx prisma migrate deploy\`. When the database is already up to date, **migrate deploy** is expected to be a **no-op** (no pending migrations). **\`db push\`** and **\`migrate reset\`** remain forbidden on production.

## Build gate result

${failures.length ? `**Blockers:**\n\n${failures.map((f) => `- ${f}`).join("\n")}` : "**All preflight gates passed** for this generator run."}

## Netlify script inspection

- **migrate deploy in build script:** ${netlify.runsMigrateDeploy ? "yes" : "no"}

## Operator checklist

See [\`post-migration-history-deploy-checklist.md\`](./post-migration-history-deploy-checklist.md) and [\`../data/post-migration-history-deploy-checklist.json\`](../data/post-migration-history-deploy-checklist.json).

## Next slice

**\`${NEXT_SLICE}\`** — operator-triggered Netlify retry with Steve-approved procedure outside this repo automation.
`;
}

function writeChecklistMd(generatedAt) {
  return `# Post–migration-history Netlify deploy checklist

**Slice:** \`${SLICE}\`  
**Generated:** ${generatedAt}  
**Machine JSON:** [\`../data/post-migration-history-deploy-checklist.json\`](../data/post-migration-history-deploy-checklist.json)

Use this checklist **immediately before** triggering a production Netlify deploy. Do not paste secrets into tickets or chat.

1. Verify [\`data/post-migration-history-netlify-retry-packet.json\`](../data/post-migration-history-netlify-retry-packet.json) shows \`eligibility.readyForOperatorNetlifyRetry: true\`.
2. In Netlify → Environment, confirm **DATABASE_URL** targets production ref **${REQUIRED_REF}** (pooler username \`postgres.${REQUIRED_REF}\` when using Supabase pooler). No localhost, no clone DB URL.
3. Confirm **DIRECT_URL** if your team uses split URIs.
4. Understand the build runs **\`npx prisma migrate deploy\`** (\`scripts/netlify-build.sh\`); with zero pending migrations it should not apply DDL.
5. Trigger deploy only via operator-controlled Netlify UI or approved pipeline — **not** from this script.
6. After success, run hosted proof steps per [\`hosted-db-proof-after-baseline.md\`](./hosted-db-proof-after-baseline.md) and [\`../data/hosted-db-proof-readiness.json\`](../data/hosted-db-proof-readiness.json).
7. **Live send** stays blocked until a separate execution packet.
`;
}

function writeDevelopReport(generatedAt, ok, failures) {
  return `# REDDIRT_POST_MIGRATION_HISTORY_NETLIFY_RETRY_1_0_REPORT

## Slice

${SLICE}

## Generated

${generatedAt}

## Outcomes

- **Packet build:** ${ok ? "all preflight gates satisfied" : "eligibility blocked — see failures in packet JSON"}
${failures.length ? `- **Failures:** ${failures.join("; ")}` : ""}

## Preflight source

Machine gates are derived only from \`data/migration-history-production-preflight.json\` (ref, legacy + app tables, \`auth.users\`, \`_prisma_migrations\` count **71**, \`prisma migrate status\` exit **0**, summary contains “Database schema is up to date”, pending **0**). Regenerate this packet after re-running \`node scripts/run-migration-history-production-preflight.mjs\` if production truth changes.

## Netlify build

\`scripts/netlify-build.sh\` runs \`npx prisma migrate deploy\` after \`prisma generate\`. When \`eligibility.migrateDeployExpectedNoOp\` is **true**, deploy should apply **no** pending migrations — operator must still confirm Netlify \`DATABASE_URL\` is production (ref **giozeoqulfojhxpywjil**, pooler user \`postgres.<ref>\` when using Supabase pooler).

## Repo commands (offline / planning)

- \`node scripts/build-post-migration-history-netlify-retry-packet.mjs\`
- \`node scripts/validate-post-migration-history-netlify-retry-packet.mjs\`
- \`node scripts/run-hosted-db-proof-readiness.mjs\`

## Artifacts written

- \`data/post-migration-history-netlify-retry-packet.json\`
- \`data/post-migration-history-netlify-retry-validation.json\` (from validate script, not overwritten by build)
- \`data/post-migration-history-deploy-checklist.json\`
- \`data/communication-command-center-next-unlock.json\`
- \`data/hosted-db-proof-readiness.json\` (from \`run-hosted-db-proof-readiness.mjs\`, not overwritten by build)
- \`docs/post-migration-history-netlify-retry-packet.md\`
- \`docs/post-migration-history-deploy-checklist.md\`

## Safety

No production mutation, no Netlify trigger, no live send approval, no \`db push\` / \`migrate reset\`, no migration-history baseline re-execution from this packet builder.

## Next

Operator slice **${NEXT_SLICE}** — controlled Netlify production retry (UI or approved pipeline only).
`;
}

function main() {
  const generatedAt = new Date().toISOString();
  const pf = loadJson(PREFLIGHT);
  const { ok, failures, checks } = evaluatePreflight(pf);
  const netlify = analyzeNetlifyBuild(NETLIFY_BUILD);
  const netlifyToml = fs.existsSync(NETLIFY_TOML) ? fs.readFileSync(NETLIFY_TOML, "utf8") : "";
  const netlifyTomlUsesBuildScript =
    /command\s*=\s*["']?bash\s+scripts\/netlify-build\.sh["']?/i.test(netlifyToml) ||
    /scripts\/netlify-build\.sh/.test(netlifyToml);

  const prismaMigrateStatusClean =
    !!checks.migrateStatusExitCodeZero &&
    !!checks.migrateStatusSummaryUpToDate &&
    !!checks.pendingMigrationCountZero;

  const eligibility = {
    productionSchemaInstalled:
      !!checks.requiredLegacyTablesPresent &&
      !!checks.requiredNewAppTablesPresent &&
      !!checks.authUsersPresent &&
      !!checks.prismaMigrationsTableExists,
    legacyTablesPreserved: !!checks.requiredLegacyTablesPresent,
    migrationHistoryAligned:
      !!checks.prismaMigrationsTableExists &&
      !!checks.prismaMigrationsCount71 &&
      prismaMigrateStatusClean,
    pendingMigrationCountZero: !!checks.pendingMigrationCountZero,
    prismaMigrateStatusClean,
    netlifyBuildRunsMigrateDeploy: netlify.runsMigrateDeploy,
    migrateDeployExpectedNoOp: prismaMigrateStatusClean && netlify.runsMigrateDeploy,
    readyForOperatorNetlifyRetry: ok && netlify.runsMigrateDeploy,
    readyForAutomaticDeploy: false,
    readyForLiveSend: false,
  };

  const packet = {
    schemaVersion: "1.0",
    slice: SLICE,
    generatedAt,
    mode: "netlify_retry_readiness_after_migration_history_alignment",
    productionMutationExecutedByThisPacket: false,
    netlifyDeployTriggeredByThisPacket: false,
    liveSendApprovedByThisPacket: false,
    eligibility,
    deploymentRules: {
      operatorMustReviewNetlifyEnv: true,
      operatorMustConfirmDatabaseUrlProductionRef: REQUIRED_REF,
      operatorMustConfirmNoCloneUrlInNetlify: true,
      operatorMustConfirmNoLiveSend: true,
      dbPushForbidden: true,
      migrateResetForbidden: true,
    },
    nextRecommendedSlice: NEXT_SLICE,
    sourcesRead: [
      "data/migration-history-production-preflight.json",
      "scripts/netlify-build.sh",
      fs.existsSync(NETLIFY_TOML) ? "netlify.toml" : null,
    ].filter(Boolean),
    preflightChecks: checks,
    preflightGateFailures: failures,
    netlifyBuildInspection: {
      scriptPath: "scripts/netlify-build.sh",
      buildScriptPresent: netlify.buildScriptPresent,
      invokesPrismaMigrateDeploy: netlify.runsMigrateDeploy,
      note: "migrate deploy is safe as no-op only when pending migrations are 0 and history matches; operator still owns Netlify env and trigger.",
    },
  };

  fs.mkdirSync(path.dirname(PACKET_OUT), { recursive: true });
  fs.writeFileSync(PACKET_OUT, JSON.stringify(packet, null, 2), "utf8");

  const checklist = buildDeployChecklist(generatedAt, netlifyTomlUsesBuildScript);
  fs.writeFileSync(CHECKLIST_JSON, JSON.stringify(checklist, null, 2), "utf8");

  fs.writeFileSync(UNLOCK_JSON, JSON.stringify(buildUnlockJson(generatedAt, ok), null, 2), "utf8");

  fs.writeFileSync(PACKET_MD, writePacketMd(generatedAt, eligibility, failures, netlify), "utf8");
  fs.writeFileSync(CHECKLIST_MD, writeChecklistMd(generatedAt), "utf8");
  fs.writeFileSync(REPORT, writeDevelopReport(generatedAt, ok, failures), "utf8");

  console.log(ok ? "PASS build-post-migration-history-netlify-retry-packet.mjs" : "WARN build-post-migration-history-netlify-retry-packet.mjs (preflight gates not all satisfied — packet documents failures)");
  console.log(" ", path.relative(ROOT, PACKET_OUT));
  process.exit(0);
}

main();
