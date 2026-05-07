/**
 * Draft production baseline execution packet — generate only; never executes commands.
 * No secrets, no .env reads.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const SLICE = "REDDIRT-PRISMA-SCHEMA-MAP-PATCH-PLAN-AND-SHADOW-PROOF-1.0";

const OUT_JSON = path.join(ROOT, "data/production-baseline-execution-packet-draft.json");
const OUT_MD = path.join(ROOT, "docs/production-baseline-execution-packet-draft.md");

const DISCLAIMER = `This is a draft execution packet. Do not execute until shadow proof passes and Steve explicitly approves.`;

function main() {
  const packet = {
    schemaVersion: "1.0",
    slice: SLICE,
    generatedAt: new Date().toISOString(),
    disclaimer: DISCLAIMER,
    prerequisites: [
      "Shadow / clone proof completed per docs/production-db-shadow-proof-plan.md.",
      "PITR or full logical backup of production confirmed by operator.",
      "Steve explicit written approval for any production migration or baseline action.",
      "DATABASE_URL / DIRECT_URL reviewed for correct Supabase project (no secret values in tickets).",
    ],
    requiredShadowArtifacts: [
      "data/prisma-schema-map-patch-validation.json with status pass",
      "Archived prisma migrate diff output from shadow database",
      "Operator sign-off on column-level compatibility for each @@map applied",
    ],
    forbiddenBeforeApproval: [
      "npx prisma migrate deploy (production)",
      "npx prisma migrate resolve (production)",
      "npx prisma db push (production)",
      "npx prisma migrate reset",
      "INSERT/UPDATE/DELETE/TRUNCATE/DROP against production",
    ],
    candidateBaselineCommandPatternForHumanReviewOnly: [
      "# Example pattern only — NOT an instruction to run:",
      "# (shadow) DATABASE_URL=<shadow> DIRECT_URL=<shadow-direct> npx prisma migrate deploy",
      "# (production) — blocked until disclaimer removed and approval recorded",
    ],
    rollbackRestorePlan: [
      "Restore from Supabase PITR or verified backup if post-deploy verification fails.",
      "Do not delete backups until successful smoke test window closes.",
    ],
    netlifyDeployRetryPlan: [
      "Confirm build env DATABASE_URL targets intended database (staging vs production).",
      "Re-run Netlify build after prisma migrate status is green on target DB.",
      "If build fails on prisma generate only, fix schema drift on shadow first.",
    ],
    hostedDbProofRouteTestPlan: [
      "Point diagnostic route at shadow URL in staging.",
      "Verify read-only metadata and health checks; no voter row export.",
    ],
    secretsPolicy: "No API keys, connection strings, or tokens belong in this JSON or markdown.",
  };

  fs.writeFileSync(OUT_JSON, JSON.stringify(packet, null, 2), "utf8");

  const md = `# Production baseline execution packet (DRAFT)

${DISCLAIMER}

## Prerequisites

${packet.prerequisites.map((s) => `- ${s}`).join("\n")}

## Required shadow proof artifacts

${packet.requiredShadowArtifacts.map((s) => `- ${s}`).join("\n")}

## Forbidden commands before approval

${packet.forbiddenBeforeApproval.map((s) => `- \`${s}\``).join("\n")}

## Candidate baseline command pattern (human review only)

\`\`\`text
${packet.candidateBaselineCommandPatternForHumanReviewOnly.join("\n")}
\`\`\`

## Rollback / restore

${packet.rollbackRestorePlan.map((s) => `- ${s}`).join("\n")}

## Netlify deploy retry

${packet.netlifyDeployRetryPlan.map((s) => `- ${s}`).join("\n")}

## Hosted DB proof route

${packet.hostedDbProofRouteTestPlan.map((s) => `- ${s}`).join("\n")}

---

Artifact: \`data/production-baseline-execution-packet-draft.json\`
`;

  fs.writeFileSync(OUT_MD, md, "utf8");
  console.log("OK generate-production-baseline-execution-packet.mjs");
  console.log(" ", path.relative(ROOT, OUT_JSON));
  console.log(" ", path.relative(ROOT, OUT_MD));
}

main();
