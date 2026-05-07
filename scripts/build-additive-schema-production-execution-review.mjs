/**
 * REDDIRT-ADDITIVE-SCHEMA-CLONE-PROOF-HARDENING-1.0
 * REDDIRT-PRODUCTION-ADDITIVE-SCHEMA-INSTALL-PLAN-1.0 — Phase 5
 * Production execution review draft (no execution, no production mutation).
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const SLICE = "REDDIRT-PRODUCTION-ADDITIVE-SCHEMA-INSTALL-PLAN-1.0";
const PATHS = {
  unsafeAnalysis: path.join(ROOT, "data/unsafe-production-schema-diff-analysis.json"),
  plan: path.join(ROOT, "data/additive-schema-install-plan.json"),
  validation: path.join(ROOT, "data/additive-schema-install-validation.json"),
  cloneResult: path.join(ROOT, "data/additive-schema-clone-test-result.json"),
  candidateSql: path.join(ROOT, "data/sql/additive-schema-install-candidate.sql"),
  outJson: path.join(ROOT, "data/additive-schema-production-execution-review.json"),
  outMd: path.join(ROOT, "docs/additive-schema-production-execution-review.md"),
};

const MIN_PUBLIC_TABLE_COUNT = 100;

function readJsonSafe(p) {
  try {
    return JSON.parse(fs.readFileSync(p, "utf8"));
  } catch {
    return null;
  }
}

function main() {
  const unsafe = readJsonSafe(PATHS.unsafeAnalysis);
  const plan = readJsonSafe(PATHS.plan);
  const validation = readJsonSafe(PATHS.validation);
  const clone = readJsonSafe(PATHS.cloneResult);
  const candidateExists = fs.existsSync(PATHS.candidateSql);

  const validationPass = validation?.status === "pass" && validation?.safeForCloneTest === true;
  const cloneConfigured = clone?.configured === true;
  const cloneSaysPass = Boolean(clone?.ok && clone?.recommendation?.cloneProofPassed);

  const b = clone?.before || {};
  const h = clone?.highValueProtection || {};

  const beforePublicCountOk = typeof b.publicTableCount === "number" && b.publicTableCount >= MIN_PUBLIC_TABLE_COUNT;
  const beforeContactsOk = Boolean(b.contactsExists);
  const beforeAr02Ok = Boolean(b.ar02VotersExists);
  const beforeAuthUsersOk = Boolean(b.authUsersExists);

  const highValueOk =
    Boolean(h.voterTablesStillPresent) && Boolean(h.legacyTablesStillPresent) && Boolean(h.authTablesStillPresent);
  const highValuePublicCountOk = Boolean(h.publicTableCountStillAdequate);

  const productionLikePrecheck = Boolean(clone?.productionLikePrecheckPassed);
  const productionLikeFlag = Boolean(clone?.productionLikeCloneProof);

  /** Meaningful clone proof: runner attested production-like before + preservation after. */
  const cloneProofMeaningful =
    cloneSaysPass &&
    productionLikeFlag &&
    productionLikePrecheck &&
    beforePublicCountOk &&
    beforeContactsOk &&
    beforeAr02Ok &&
    beforeAuthUsersOk &&
    highValueOk &&
    highValuePublicCountOk;

  /** Stale JSON: claims pass but fails hardened gates. */
  const cloneProofFalsePositive = cloneSaysPass && !cloneProofMeaningful;

  let nextRecommendedSlice = "REDDIRT-ADDITIVE-SCHEMA-CANDIDATE-REPAIR-1.0";
  if (!validationPass) {
    nextRecommendedSlice = "REDDIRT-ADDITIVE-SCHEMA-CANDIDATE-REPAIR-1.0";
  } else if (!cloneConfigured) {
    nextRecommendedSlice = "REDDIRT-ADDITIVE-SCHEMA-CLONE-PROOF-1.0";
  } else if (cloneProofMeaningful) {
    nextRecommendedSlice = "REDDIRT-ADDITIVE-SCHEMA-PRODUCTION-EXECUTION-PACKET-1.0";
  } else if (cloneProofFalsePositive || !beforePublicCountOk || !beforeContactsOk || !beforeAr02Ok || !beforeAuthUsersOk) {
    nextRecommendedSlice = "REDDIRT-RESTORE-PRODUCTION-LIKE-CLONE-1.0";
  } else {
    nextRecommendedSlice = "REDDIRT-ADDITIVE-SCHEMA-CLONE-PROOF-1.0";
  }

  const json = {
    schemaVersion: "1.0",
    slice: SLICE,
    packet: "REDDIRT-ADDITIVE-SCHEMA-CLONE-PROOF-HARDENING-1.0",
    generatedAt: new Date().toISOString(),
    mode: "production_execution_review_draft",
    disclaimer:
      "Draft only. Does not execute SQL, does not mutate production, does not baseline _prisma_migrations, does not approve Netlify retry or live send.",
    productionExecutionBlocked: {
      ifCloneProofDidNotPass: !cloneProofMeaningful,
      ifCloneProofFalsePositive: cloneProofFalsePositive,
      ifCandidateValidationDidNotPass: !validationPass,
      ifBeforePublicTableCountBelow100: cloneConfigured && !beforePublicCountOk,
      ifBeforeHighValueTablesMissing: cloneConfigured && (!beforeContactsOk || !beforeAr02Ok || !beforeAuthUsersOk),
      ifAfterHighValueProtectionFailed: cloneConfigured && cloneSaysPass && !highValueOk,
      backupAndPitrProofStillRequired: true,
      steveApprovalStillRequired: true,
      netlifyBlockedUntilAdditiveAndMigrationStrategyComplete: true,
      liveSendBlocked: true,
    },
    cloneProofGates: {
      cloneSaysPass,
      productionLikePrecheckPassed: productionLikePrecheck,
      productionLikeCloneProofFlag: productionLikeFlag,
      beforePublicTableCountOk: beforePublicCountOk,
      beforeContactsExists: beforeContactsOk,
      beforeAr02VotersExists: beforeAr02Ok,
      beforeAuthUsersExists: beforeAuthUsersOk,
      afterHighValueProtectionOk: highValueOk,
      afterPublicTableCountOk: highValuePublicCountOk,
      cloneProofMeaningful,
    },
    eligibility: {
      unsafeDiffDocumented: Boolean(unsafe),
      candidatePresent: candidateExists,
      validationPass,
      cloneConfigured,
      cloneProofPassed: cloneProofMeaningful,
      productionExecutionAllowed: false,
    },
    nextRecommendedSlice,
    inputs: {
      unsafeAnalysis: path.relative(ROOT, PATHS.unsafeAnalysis),
      plan: path.relative(ROOT, PATHS.plan),
      validation: path.relative(ROOT, PATHS.validation),
      cloneResult: path.relative(ROOT, PATHS.cloneResult),
      candidateSql: path.relative(ROOT, PATHS.candidateSql),
    },
  };

  fs.mkdirSync(path.dirname(PATHS.outJson), { recursive: true });
  fs.writeFileSync(PATHS.outJson, JSON.stringify(json, null, 2), "utf8");

  const md = `# Additive schema production execution review (draft)

**Slice:** \`${SLICE}\` · **Hardening:** \`REDDIRT-ADDITIVE-SCHEMA-CLONE-PROOF-HARDENING-1.0\`  
**Generated:** ${json.generatedAt}  
**Machine JSON:** [\`data/additive-schema-production-execution-review.json\`](../data/additive-schema-production-execution-review.json)

## Critical safety statement

**The raw Prisma diff is not safe to execute.** This review covers only the **additive candidate** path and governance gates.

## Clone proof quality (hardened)

| Gate | Met |
|------|-----|
| Clone configured | **${cloneConfigured ? "yes" : "no"}** |
| Runner \`ok\` + \`cloneProofPassed\` | **${cloneSaysPass ? "yes" : "no"}** |
| \`productionLikeCloneProof\` + precheck | **${cloneProofMeaningful ? "yes" : "no"}** |
| Before: \`publicTableCount\` ≥ ${MIN_PUBLIC_TABLE_COUNT} | **${beforePublicCountOk ? "yes" : "no"}** |
| Before: \`contacts\` / \`ar02_voters\` / \`auth.users\` | **${beforeContactsOk && beforeAr02Ok && beforeAuthUsersOk ? "yes" : "no"}** |
| After: high-value preservation flags | **${highValueOk ? "yes" : "no"}** |
| After: public table count still ≥ ${MIN_PUBLIC_TABLE_COUNT} | **${highValuePublicCountOk ? "yes" : "no"}** |

**${cloneProofFalsePositive ? "WARNING: Stale or false-positive clone artifact detected — treat clone proof as NOT valid until a production-like clone passes the hardened runner." : ""}**

## Production execution posture

| Rule | Status |
|------|--------|
| **Blocked unless clone proof is meaningful (hardened)** | **${cloneProofMeaningful ? "Passed hardened gates — still not auto-approved" : "YES — blocked"}** |
| **Blocked if candidate validation did not pass** | **${!validationPass ? "YES — blocked" : "Validation pass — execution still gated"}** |
| **Backup / PITR proof still required** | **YES** |
| **Steve approval still required** | **YES** |
| **Netlify blocked** until additive install **and** migration-history strategy are complete | **YES** |
| **Live send blocked** | **YES** |

## Next recommended slice

**\`${nextRecommendedSlice}\`**

## Disclaimer

${json.disclaimer}
`;

  fs.mkdirSync(path.dirname(PATHS.outMd), { recursive: true });
  fs.writeFileSync(PATHS.outMd, md, "utf8");

  console.log("OK build-additive-schema-production-execution-review.mjs");
  console.log(" ", path.relative(ROOT, PATHS.outJson));
}

main();
