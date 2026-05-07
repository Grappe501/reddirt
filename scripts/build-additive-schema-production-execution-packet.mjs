/**
 * REDDIRT-ADDITIVE-SCHEMA-PRODUCTION-EXECUTION-PACKET-1.0
 * Offline-only: reads JSON/SQL artifacts, never connects to any database.
 * Does not run prisma migrate deploy / resolve / db push / reset or execute candidate SQL.
 */
import crypto from "crypto";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

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

/** Same algorithm as validate-additive-schema-install-candidate.mjs */
function splitSqlStatements(sql) {
  const out = [];
  let cur = "";
  let i = 0;
  let inSq = false;
  let inDq = false;
  let bcom = 0;
  while (i < sql.length) {
    const c = sql[i];
    const n = sql[i + 1];
    if (bcom > 0) {
      if (c === "/" && n === "*") {
        cur += "/*";
        i += 2;
        bcom++;
        continue;
      }
      if (c === "*" && n === "/") {
        cur += "*/";
        i += 2;
        bcom--;
        continue;
      }
      cur += c;
      i++;
      continue;
    }
    if (!inSq && !inDq) {
      if (c === "-" && n === "-") {
        while (i < sql.length && sql[i] !== "\n") {
          cur += sql[i];
          i++;
        }
        if (i < sql.length) {
          cur += sql[i];
          i++;
        }
        continue;
      }
      if (c === "/" && n === "*") {
        cur += "/*";
        i += 2;
        bcom++;
        continue;
      }
    }
    if (!inDq && c === "'") {
      if (inSq && n === "'") {
        cur += "''";
        i += 2;
        continue;
      }
      inSq = !inSq;
      cur += c;
      i++;
      continue;
    }
    if (inSq) {
      cur += c;
      i++;
      continue;
    }
    if (!inSq && c === '"') {
      if (inDq && n === '"') {
        cur += '""';
        i += 2;
        continue;
      }
      inDq = !inDq;
      cur += c;
      i++;
      continue;
    }
    if (!inSq && !inDq && c === ";") {
      const t = cur.trim();
      if (t) out.push(t);
      cur = "";
      i++;
      continue;
    }
    cur += c;
    i++;
  }
  const t = cur.trim();
  if (t) out.push(t);
  return out;
}

function stripLeadingLineComments(stmt) {
  return stmt.replace(/^(\s*--[^\n]*\n)+/g, "").trim();
}

function analyzeCandidateSql(raw) {
  const stmts = splitSqlStatements(raw).map(stripLeadingLineComments).filter((s) => s.length > 0);
  let createTypeCount = 0;
  let createTableCount = 0;
  let createIndexCount = 0;
  let alterTableCount = 0;
  let dropCount = 0;
  let truncateCount = 0;
  let deleteCount = 0;
  let insertCount = 0;
  const destructiveHits = [];

  for (let idx = 0; idx < stmts.length; idx++) {
    const s = stmts[idx];
    const low = s.toLowerCase();
    if (/^\s*create\s+type\b/i.test(s)) createTypeCount++;
    if (/^\s*create\s+table\b/i.test(s)) createTableCount++;
    if (/^\s*create\s+(unique\s+)?index\b/i.test(s)) createIndexCount++;
    if (/^\s*alter\s+table\b/i.test(s)) alterTableCount++;

    const dropStmt =
      /\bdrop\b/.test(low) && !/alter\s+table[\s\S]*alter\s+column[\s\S]*drop\s+(not\s+null|default)\b/.test(low);
    if (dropStmt) {
      dropCount++;
      destructiveHits.push({ idx, kind: "drop", preview: s.slice(0, 120) });
    }
    if (/\btruncate\b/.test(low)) {
      truncateCount++;
      destructiveHits.push({ idx, kind: "truncate", preview: s.slice(0, 120) });
    }
    if (/\bdelete\s+from\b/.test(low)) {
      deleteCount++;
      destructiveHits.push({ idx, kind: "delete", preview: s.slice(0, 120) });
    }
    if (/\binsert\s+into\b/.test(low)) {
      insertCount++;
      destructiveHits.push({ idx, kind: "insert", preview: s.slice(0, 120) });
    }
    if (/\bupdate\s+/.test(low) && !/update\s+statistics/.test(low)) {
      destructiveHits.push({ idx, kind: "update", preview: s.slice(0, 120) });
    }
    if (/alter\s+table[\s\S]*\bdrop\b/.test(low) && !/alter\s+column[\s\S]*drop\s+(not\s+null|default)\b/.test(low)) {
      destructiveHits.push({ idx, kind: "alter_drop", preview: s.slice(0, 120) });
    }
    if (/"auth"\./i.test(s) || /alter\s+table\s+"auth"/i.test(s)) {
      destructiveHits.push({ idx, kind: "auth", preview: s.slice(0, 120) });
    }
  }

  return {
    statementCount: stmts.length,
    createTypeCount,
    createTableCount,
    createIndexCount,
    alterTableCount,
    dropCount,
    truncateCount,
    deleteCount,
    insertCount,
    destructiveHits,
    noDestructiveViolations: destructiveHits.length === 0,
  };
}

function evaluateCloneProof(clone) {
  const gates = {
    ok: clone?.ok === true,
    productionLikePrecheckPassed: clone?.productionLikePrecheckPassed === true,
    productionLikeCloneProof: clone?.productionLikeCloneProof === true,
    beforePublicTableCountGte100:
      typeof clone?.before?.publicTableCount === "number" && clone.before.publicTableCount >= 100,
    afterPublicGteBefore:
      typeof clone?.before?.publicTableCount === "number" &&
      typeof clone?.after?.publicTableCount === "number" &&
      clone.after.publicTableCount >= clone.before.publicTableCount,
    beforeAr02VotersExists: clone?.before?.ar02VotersExists === true,
    beforeContactsExists: clone?.before?.contactsExists === true,
    beforeAuthUsersExists: clone?.before?.authUsersExists === true,
    afterAr02VotersExists: clone?.after?.ar02VotersExists === true,
    afterContactsExists: clone?.after?.contactsExists === true,
    afterAuthUsersExists: clone?.after?.authUsersExists === true,
    voterTablesStillPresent: clone?.highValueProtection?.voterTablesStillPresent === true,
    legacyTablesStillPresent: clone?.highValueProtection?.legacyTablesStillPresent === true,
    authTablesStillPresent: clone?.highValueProtection?.authTablesStillPresent === true,
    productionMutatedFalse: clone?.productionMutated === false,
    candidateSqlExecutedOnProductionFalse: clone?.candidateSqlExecutedOnProduction === false,
    /** When present on clone artifact, must be true (shadow DB received candidate). */
    candidateSqlExecutedOnCloneWhenPresent:
      clone?.candidateSqlExecutedOnClone === undefined ? true : clone.candidateSqlExecutedOnClone === true,
  };

  const passed = Object.values(gates).every(Boolean);
  const claimsPassButHardenedFails =
    Boolean(clone?.ok && clone?.recommendation?.cloneProofPassed) && !passed;

  return { gates, passed, claimsPassButHardenedFails };
}

function sha256File(p) {
  const h = crypto.createHash("sha256");
  h.update(fs.readFileSync(p));
  return h.digest("hex");
}

function buildPostcheckPlanJson(packetSlice, candidateSummary) {
  return {
    schemaVersion: "1.0",
    slice: packetSlice,
    generatedAt: new Date().toISOString(),
    mode: "read_only_post_execution_verification_plan",
    disclaimer:
      "Operator-run verification in Supabase SQL editor or read-only psql against production after additive install. Repo scripts do not execute these checks against production in this slice.",
    phases: [
      {
        id: "p1_schema_presence",
        title: "High-value and required tables still present",
        checks: [
          "Use information_schema.tables (table_schema = 'public' | 'auth') to confirm public.ar02_voters, public.contacts, and auth.users still exist.",
          "Confirm required public tables: counties, event_requests, message_audiences, path_to_victory, people, person_profiles.",
        ],
      },
      {
        id: "p2_prisma_introspection_alignment",
        title: "Application tables that were missing pre-install",
        checks: [
          "Spot-check new Prisma-backed tables from candidate (e.g. WorkflowIntake / AdminContentBlock / HomepageConfig) exist in public schema with expected casing from candidate SQL.",
          "Run local npm run check and npm run typecheck against production DATABASE_URL only in a controlled operator environment (not from this packet script).",
        ],
      },
      {
        id: "p3_no_prisma_migrate_deploy_yet",
        title: "Migration history unchanged by additive SQL",
        checks: [
          "Additive install does not replace need for separate migration-history strategy; do not run prisma migrate deploy until that strategy is approved.",
        ],
      },
      {
        id: "p4_email_no_send_scan",
        title: "Comms lane regression signal",
        checks: ["npm run email:no-send-scan (lane local check; live send remains blocked by policy)."],
      },
    ],
    expectedStatementOrderNote:
      `Candidate contains approximately ${candidateSummary.statementCount} statements; full-file apply is single operator action in Supabase SQL editor.`,
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

function buildApprovalGatesJson(packetSlice, eligibility) {
  const gates = [
    { id: "backup_pitr", label: "Supabase backup / PITR restore path documented and tested on a non-prod proof", owner: "operator", status: "pending" },
    { id: "steve_phrase", label: `Steve states approval phrase: ${APPROVAL_PHRASE}`, owner: "Steve", status: "pending" },
    { id: "correct_db", label: `Confirm production project ref ${PRODUCTION_PROJECT_REF} matches operator target (visual cross-check in dashboard)`, owner: "operator", status: "pending" },
    { id: "maintenance_window", label: "Maintenance window communicated; app traffic expectations set", owner: "operator", status: "pending" },
    { id: "candidate_hash", label: "Operator records sha256 of additive-schema-install-candidate.sql and matches packet", owner: "operator", status: "pending" },
    { id: "clone_proof_fresh", label: "data/additive-schema-clone-test-result.json passes hardened production-like gates (re-run clone test if stale)", owner: "operator", status: eligibility.productionLikeCloneProofPassed ? "pending" : "blocked" },
    { id: "no_raw_diff", label: "Raw Prisma diff and rejected statements are not executed on production", owner: "operator", status: "pending" },
  ];
  return {
    schemaVersion: "1.0",
    slice: packetSlice,
    generatedAt: new Date().toISOString(),
    approvalPhraseRequired: APPROVAL_PHRASE,
    gates,
    notes: "Statuses are machine-hint only; human sign-off is authoritative.",
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
    };
    candidateNoDestructive =
      a.noDestructiveViolations && a.dropCount === 0 && a.truncateCount === 0 && a.deleteCount === 0 && a.insertCount === 0;
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

  const gatesJson = buildApprovalGatesJson(SLICE, eligibility);
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

All gates default **pending**. **Steve** must explicitly approve using the phrase in the JSON. **Netlify retry** and **live send** stay blocked by policy until separate slices.

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
2. Open Supabase SQL editor for the **production** project (ref above).
3. Run the **entire** candidate file as a single governed transaction only if your operational standard allows; otherwise split by object class (types → tables → indexes) per DBA preference — still additive only.
4. On any error, **stop**; do not partial-apply further sections without analysis. Rollback is **PITR / restore**, not a hand-written DROP script.

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

Read-only checks in Supabase SQL editor or operator-controlled \`psql\` **after** additive install. Repo verification script \`scripts/verify-additive-schema-production-postcheck.mjs\` validates **plan shape only** (offline).

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

  fs.writeFileSync(
    PATHS.docProdDbTest,
    `# Production DB test readiness (additive schema context)

After additive install, **hosted** verification (\`DATABASE_URL\` / \`DIRECT_URL\`) remains **operator-owned**. Automated agents should not assume connectivity.

## Suggested order

1. Read-only \`SELECT 1\` and table presence probes (no PII export).  
2. Application smoke against staging or production UI per separate runbook — **no** live sends.  
3. Align with [\`docs/email-command-center-launch-hardening.md\`](./email-command-center-launch-hardening.md) for comms lane gates.
`,
    "utf8"
  );

  fs.writeFileSync(
    PATHS.docNetlifyRetry,
    `# Netlify production retry readiness (additive schema)

**This packet does not approve or perform Netlify retries.**

When Steve approves a **separate** Netlify slice, ensure additive schema postcheck is complete and migration strategy is explicit. Do not conflate RedDirt additive DDL with Netlify button retries.
`,
    "utf8"
  );

  fs.writeFileSync(
    PATHS.docHostedProof,
    `# Hosted DB proof after baseline (additive schema note)

Additive schema install **adds** objects; it does not replace the need for **hosted** read-only proof against the canonical Supabase project (**ref ${PRODUCTION_PROJECT_REF}**).

Record proof in operator-controlled artifacts (no secrets): env **names** present, \`SELECT 1\` success, optional safe row counts without exporting voter rows.
`,
    "utf8"
  );

  if (fs.existsSync(PATHS.docEmailHardening)) {
    const eh = fs.readFileSync(PATHS.docEmailHardening, "utf8");
    if (!eh.includes("REDDIRT-ADDITIVE-SCHEMA-PRODUCTION-EXECUTION-PACKET-1.0")) {
      fs.appendFileSync(
        PATHS.docEmailHardening,
        `\n\n## Cross-cut — REDDIRT-ADDITIVE-SCHEMA-PRODUCTION-EXECUTION-PACKET-1.0\n\nGated additive DDL packet: [\`docs/additive-schema-production-execution-packet.md\`](./additive-schema-production-execution-packet.md) · [\`data/additive-schema-production-execution-packet.json\`](../data/additive-schema-production-execution-packet.json). **No** production execution from repo scripts; **no** Netlify retry; **no** live send. Rebuild: \`node scripts/build-additive-schema-production-execution-packet.mjs\`.\n`,
        "utf8"
      );
    }
  }

  const mapInsert = `- **REDDIRT-ADDITIVE-SCHEMA-PRODUCTION-EXECUTION-PACKET-1.0** — [\`additive-schema-production-execution-packet.md\`](./additive-schema-production-execution-packet.md) · [\`additive-schema-production-approval-gates.md\`](./additive-schema-production-approval-gates.md) · [\`additive-schema-production-runbook.md\`](./additive-schema-production-runbook.md) · [\`additive-schema-production-postcheck-plan.md\`](./additive-schema-production-postcheck-plan.md) · [\`post-additive-schema-netlify-readiness.md\`](./post-additive-schema-netlify-readiness.md) · [\`data/additive-schema-production-execution-packet.json\`](../data/additive-schema-production-execution-packet.json) · [\`data/additive-schema-production-approval-gates.json\`](../data/additive-schema-production-approval-gates.json) · [\`data/additive-schema-production-postcheck-plan.json\`](../data/additive-schema-production-postcheck-plan.json) · [\`data/post-additive-schema-netlify-readiness.json\`](../data/post-additive-schema-netlify-readiness.json) · \`scripts/build-additive-schema-production-execution-packet.mjs\` · \`scripts/validate-additive-schema-production-execution-packet.mjs\` · \`scripts/run-additive-schema-production-preflight.mjs\` · \`scripts/run-additive-schema-production-guarded.mjs\` (**\`--dry-run\`** default; **\`--execute\`** = env gate check only — **no** Prisma/\`psql\` spawn) · \`scripts/verify-additive-schema-production-postcheck.mjs\` — **governed** additive SQL execution packet (**no** production mutate from automation).`;

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

  const threadInsert = `**REDDIRT-ADDITIVE-SCHEMA-PRODUCTION-EXECUTION-PACKET-1.0** — **The raw Prisma diff is not safe to execute.** \`node scripts/build-additive-schema-production-execution-packet.mjs\` · \`node scripts/validate-additive-schema-production-execution-packet.mjs\` · \`node scripts/run-additive-schema-production-preflight.mjs\` · \`node scripts/run-additive-schema-production-guarded.mjs\` (**\`--dry-run\`** default; **\`--execute\`** = gate check only — **no** Prisma \`db execute\` / \`psql\` spawn). Docs: [\`additive-schema-production-execution-packet.md\`](./additive-schema-production-execution-packet.md) · [\`additive-schema-production-runbook.md\`](./additive-schema-production-runbook.md) · [\`post-additive-schema-netlify-readiness.md\`](./post-additive-schema-netlify-readiness.md). Data: [\`data/additive-schema-production-execution-packet.json\`](../data/additive-schema-production-execution-packet.json) · [\`data/additive-schema-production-approval-gates.json\`](../data/additive-schema-production-approval-gates.json). **No** production SQL from repo scripts; **Netlify retry** and **live send** remain separate Steve gates.`;

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

  const ledgerInsert = ` **REDDIRT-ADDITIVE-SCHEMA-PRODUCTION-EXECUTION-PACKET-1.0** — [\`docs/additive-schema-production-execution-packet.md\`](./additive-schema-production-execution-packet.md) · [\`data/additive-schema-production-execution-packet.json\`](../data/additive-schema-production-execution-packet.json) · \`scripts/build-additive-schema-production-execution-packet.mjs\` (governed operator packet; **no** automation SQL toward production).`;

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

## Summary

- **readyForProductionExecutionPacket:** ${readyForProductionExecutionPacket}
- **Candidate sha256:** ${candidateSha256 || "n/a"}
- **Parsed statement count:** ${candidateSummary.statementCount}
- **Clone hardened gates passed:** ${clonePassed}
- **Blockers (machine):** ${errors.length ? errors.join("; ") : "(none)"}

## Artifact staleness

If \`data/additive-schema-clone-test-result.json\` shows \`ok: true\` but \`before.publicTableCount\` < 100 or missing \`productionLikeCloneProof\`, it is **inconsistent** with \`scripts/test-additive-schema-install-on-clone.mjs\` (hardened runner). Re-run clone proof and \`node scripts/build-additive-schema-production-execution-review.mjs\`, then rebuild this packet.

## Commands (lane root)

\`\`\`text
node scripts/build-additive-schema-production-execution-packet.mjs
node scripts/validate-additive-schema-production-execution-packet.mjs
node scripts/run-additive-schema-production-preflight.mjs
node scripts/run-additive-schema-production-guarded.mjs
node scripts/verify-additive-schema-production-postcheck.mjs
\`\`\`

## Policy

This packet **never** executes production SQL, **never** runs Prisma migrate deploy / resolve / db push / reset, **never** retries Netlify, **never** approves live sends.
`;

  fs.writeFileSync(PATHS.developReport, report, "utf8");

  console.log(readyForProductionExecutionPacket ? "PASS build-additive-schema-production-execution-packet.mjs" : "BLOCKED build-additive-schema-production-execution-packet.mjs");
  console.log(" ", rel(PATHS.outPacket));
  if (warnings.length) console.log("Warnings:", warnings.join(" | "));
  if (errors.length) console.error("Blockers:", errors.join(" | "));

  process.exit(readyForProductionExecutionPacket ? 0 : 1);
}

main();
