/**
 * Writes and validates migration-history postcheck plan (read-only template).
 * REDDIRT-MIGRATION-HISTORY-BASELINE-EXECUTION-PACKET-1.0
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const SLICE = "REDDIRT-MIGRATION-HISTORY-BASELINE-EXECUTION-PACKET-1.0";
const OUT_JSON = path.join(ROOT, "data/migration-history-postcheck-plan.json");
const OUT_MD = path.join(ROOT, "docs/migration-history-postcheck-plan.md");

function main() {
  const generatedAt = new Date().toISOString();
  const plan = {
    schemaVersion: "1.0",
    slice: SLICE,
    generatedAt,
    mode: "migration_history_postcheck_plan",
    disclaimer:
      "After future production migration-history baseline, operator runs these checks on hosted DB. This script does not run migrate deploy or connect to a database.",
    checks: [
      {
        id: "prisma_migrations_exists",
        description: "public._prisma_migrations exists",
        how: "information_schema or \\dt",
      },
      {
        id: "prisma_migrations_count",
        description: "Row count in _prisma_migrations matches expected applied migration count (71 unless repo changed)",
        how: "SELECT COUNT(*) FROM public._prisma_migrations",
      },
      {
        id: "migrate_status_clean",
        description: "npx prisma migrate status reports no pending migrations",
        how: "Run on operator machine with hosted DATABASE_URL",
      },
      {
        id: "no_deploy_in_postcheck",
        description: "This postcheck plan does not require migrate deploy to validate itself",
        how: "Policy",
      },
      {
        id: "legacy_app_auth_tables",
        description: "Required legacy public + new app + auth.users tables still present",
        how: "information_schema probes (same list as preflight)",
      },
      {
        id: "netlify_reconsider",
        description: "Netlify retry only in a separate packet after this plan passes",
        how: "Governance",
      },
    ],
    netlifyRetry: "Blocked until all checks pass and Steve approves a Netlify-specific slice.",
    liveSend: "Remains blocked until explicit future packet.",
  };

  fs.mkdirSync(path.dirname(OUT_JSON), { recursive: true });
  fs.writeFileSync(OUT_JSON, JSON.stringify(plan, null, 2), "utf8");

  fs.writeFileSync(
    OUT_MD,
    `# Migration history postcheck plan

**Slice:** \`${SLICE}\`  
**Machine JSON:** [\`data/migration-history-postcheck-plan.json\`](../data/migration-history-postcheck-plan.json)

After production baseline execution, operators verify \`_prisma_migrations\`, migration counts, \`prisma migrate status\`, and table preservation **without** using this repo script to run \`migrate deploy\`.

Netlify retry is a **separate** Steve-gated step after this plan passes.
`,
    "utf8"
  );

  const ok = plan.checks.length >= 5 && plan.schemaVersion === "1.0";
  if (!ok) {
    console.error("FAIL plan shape");
    process.exit(1);
  }
  console.log("PASS verify-migration-history-postcheck.mjs");
  console.log(" ", path.relative(ROOT, OUT_JSON));
  process.exit(0);
}

main();
