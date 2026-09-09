import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { DECISION_SIMULATION_TABLES } from "../src/lib/agents/decision-simulation/persistence";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.join(__dirname, "..");
const migrationPath = path.join(
  repoRoot,
  "prisma",
  "migrations",
  "20260908213500_decision_simulation_core",
  "migration.sql",
);

function requireTrue(label: string, value: boolean) {
  console.log(`  ${label}:`, value);
  if (!value) throw new Error(`Decision simulation persistence gate failed: ${label}`);
}

function main() {
  const sql = fs.readFileSync(migrationPath, "utf8");

  console.log("Decision Simulation Phase 2 persistence checks");

  requireTrue(
    "all canonical tables created",
    DECISION_SIMULATION_TABLES.every((table) => sql.includes(`CREATE TABLE \"${table}\"`)),
  );
  requireTrue("seven canonical tables", DECISION_SIMULATION_TABLES.length === 7);
  requireTrue("six-move bound enforced", sql.includes('CHECK (\"ply\" >= 0 AND \"ply\" <= 6)'));
  requireTrue("operator/counterpart sides enforced", sql.includes("'OPERATOR','COUNTERPART'"));
  requireTrue("probability bounded 0..1", sql.includes('\"probability\" >= 0 AND \"probability\" <= 1'));
  requireTrue("confidence bounded 0..1", sql.includes('\"confidence\" >= 0 AND \"confidence\" <= 1'));
  requireTrue("outcome accuracy bounded", sql.includes('\"overall_accuracy_score\" >= 0 AND \"overall_accuracy_score\" <= 1'));
  requireTrue("actual response supported", sql.includes("'ACTUAL_RESPONSE'"));
  requireTrue("alternative future branches supported", ["EXPECTED", "HOSTILE", "BEST_CASE", "ALTERNATIVE"].every((x) => sql.includes(`'${x}'`)));
  requireTrue("assumptions explicitly persisted", sql.includes('CREATE TABLE \"decision_simulation_assumption\"'));
  requireTrue("evidence explicitly persisted", sql.includes('CREATE TABLE \"decision_simulation_evidence\"'));
  requireTrue("outcomes explicitly persisted", sql.includes('CREATE TABLE \"decision_simulation_outcome\"'));
  requireTrue("simulation children cascade", sql.includes('REFERENCES \"decision_simulation_run\"(\"id\") ON DELETE CASCADE'));
  requireTrue("no send execution table", !sql.toLowerCase().includes("decision_simulation_send"));
  requireTrue("no social posting execution table", !sql.toLowerCase().includes("decision_simulation_post"));
  requireTrue("no existing campaign table mutation", !/ALTER\s+TABLE\s+(?!\"decision_simulation_)/i.test(sql));

  console.log("OK — Decision Simulation Phase 2 persistence checks passed");
}

main();
