/**
 * Offline machine report for Communication Command Center hosted diagnostics slice.
 * REDDIRT-COMMUNICATION-COMMAND-CENTER-HOSTED-DIAGNOSTICS-1.0
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const CONTRACT = path.join(ROOT, "data/communication-command-center-readiness-contract.json");
const OUT = path.join(ROOT, "data/communication-command-center-launch-report.json");

function main() {
  const generatedAt = new Date().toISOString();
  const contract = JSON.parse(fs.readFileSync(CONTRACT, "utf8"));

  const report = {
    schemaVersion: "1.0",
    slice: "REDDIRT-COMMUNICATION-COMMAND-CENTER-HOSTED-DIAGNOSTICS-1.0",
    generatedAt,
    mode: "communication_command_center_launch_report",
    productionMutationByThisScript: false,
    liveSendTriggeredByThisScript: false,
    summary:
      "Bearer GET /api/admin/communication-command-center/readiness returns DB canonical flags, comms table presence, webhook route file contract, and explicit no-send safety booleans. Admin UI: /admin/workbench/communication-command-center/readiness.",
    contractPath: path.relative(ROOT, CONTRACT),
    operatorDocs: ["docs/communication-command-center-readiness.md", "docs/email-command-center-launch-hardening.md"],
    validateScript: "node scripts/validate-communication-command-center-readiness.mjs",
    tableKeyCount: Array.isArray(contract.tableKeys) ? contract.tableKeys.length : 0,
    routeKeyCount: Array.isArray(contract.routeKeys) ? contract.routeKeys.length : 0,
  };

  fs.writeFileSync(OUT, JSON.stringify(report, null, 2), "utf8");
  console.log("Wrote", path.relative(ROOT, OUT));
}

main();
