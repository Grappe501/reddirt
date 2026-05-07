/**
 * REDDIRT-SHADOW-PROOF-ARTIFACT-CONSOLIDATION-1.0 — migration dependency repair (offline file inspection + prisma validate).
 * Does not connect to production or read .env files.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { spawnSync } from "child_process";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const SLICE = "REDDIRT-SHADOW-PROOF-ARTIFACT-CONSOLIDATION-1.0";
const OUT = path.join(ROOT, "data/migration-dependency-repair-validation.json");

const GRAPH = path.join(ROOT, "prisma/migrations/20260505203000_email_contact_profile_graph/migration.sql");
const REL2 = path.join(ROOT, "prisma/migrations/20260515120000_rel2_relational_contact_foundation/migration.sql");
const FKEY = path.join(ROOT, "prisma/migrations/20260515121000_email_contact_profile_relational_contact_fkey/migration.sql");
const MIGRATIONS = path.join(ROOT, "prisma/migrations");

function stripLineComments(sql) {
  return sql
    .split(/\r?\n/)
    .map((line) => {
      const t = line.trim();
      if (t.startsWith("--")) return "";
      const idx = line.indexOf("--");
      if (idx === -1) return line;
      return line.slice(0, idx);
    })
    .join("\n");
}

function push(checks, id, ok, detail) {
  checks.push({ id, ok, detail: ok ? "ok" : detail });
  return ok;
}

function listMigrationDirs() {
  return fs
    .readdirSync(MIGRATIONS, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .filter((name) => fs.existsSync(path.join(MIGRATIONS, name, "migration.sql")))
    .sort();
}

function main() {
  const checks = [];
  const violations = [];

  if (!fs.existsSync(GRAPH)) violations.push(`Missing ${GRAPH}`);
  if (!fs.existsSync(REL2)) violations.push(`Missing ${REL2}`);
  if (!fs.existsSync(FKEY)) violations.push(`Missing ${FKEY}`);

  const graphSql = violations.length ? "" : fs.readFileSync(GRAPH, "utf8");
  const graphNoComments = stripLineComments(graphSql);
  const hasRefToRelationalContact = /REFERENCES\s+"RelationalContact"/i.test(graphNoComments);
  const hasPrematureEcpRcFk = /EmailContactProfile_relationalContactId_fkey/i.test(graphNoComments);
  push(
    checks,
    "graph_no_relational_contact_fk",
    !hasRefToRelationalContact && !hasPrematureEcpRcFk,
    "20260505203000 must not add FK to RelationalContact before that table exists"
  );

  const fkeySql = violations.length ? "" : fs.readFileSync(FKEY, "utf8");
  const hasEcpRcFk =
    fkeySql.includes("EmailContactProfile_relationalContactId_fkey") &&
    /REFERENCES\s+"RelationalContact"\s*\(\s*"id"\s*\)/i.test(fkeySql);
  push(checks, "fkey_migration_adds_constraint", hasEcpRcFk, "FKEY migration must add EmailContactProfile_relationalContactId_fkey -> RelationalContact(id)");

  const dirs = violations.length ? [] : listMigrationDirs();
  const iRel = dirs.indexOf("20260515120000_rel2_relational_contact_foundation");
  const iFkey = dirs.indexOf("20260515121000_email_contact_profile_relational_contact_fkey");
  push(checks, "lexical_order_rel2_before_fkey", iRel >= 0 && iFkey >= 0 && iRel < iFkey, `rel2 index ${iRel}, fkey index ${iFkey}`);

  const destructive = /DROP\s+TABLE|TRUNCATE|DROP\s+SCHEMA/i;
  for (const label of [
    ["graph", GRAPH, graphSql],
    ["rel2", REL2, violations.length ? "" : fs.readFileSync(REL2, "utf8")],
    ["fkey", FKEY, fkeySql],
  ]) {
    const [name, p, sql] = label;
    if (!sql) continue;
    const bad = destructive.test(sql);
    push(checks, `no_destructive_ddl_${name}`, !bad, `destructive pattern in ${p}`);
  }

  const pv = spawnSync(process.platform === "win32" ? "npx.cmd" : "npx", ["prisma", "validate"], {
    cwd: ROOT,
    shell: true,
    encoding: "utf8",
  });
  const pvOk = pv.status === 0;
  push(checks, "prisma_validate", pvOk, pv.stderr?.slice(0, 500) || `exit ${pv.status}`);

  const status = checks.every((c) => c.ok) && violations.length === 0 ? "pass" : "fail";
  const rootCauseRepaired =
    status === "pass" &&
    checks.filter((c) => c.id === "graph_no_relational_contact_fk" || c.id === "fkey_migration_adds_constraint").every((c) => c.ok) &&
    iRel >= 0 &&
    iFkey >= 0 &&
    iRel < iFkey;

  const out = {
    schemaVersion: "1.0",
    slice: SLICE,
    generatedAt: new Date().toISOString(),
    status,
    checks,
    violations,
    rootCauseRepaired: status === "pass" && rootCauseRepaired,
    safeForShadowDeploy: status === "pass",
    safeForProductionDeploy: false,
  };
  fs.writeFileSync(OUT, JSON.stringify(out, null, 2), "utf8");

  console.log(status === "pass" ? "PASS validate-migration-dependency-repair.mjs" : "FAIL validate-migration-dependency-repair.mjs");
  console.log(" ", path.relative(ROOT, OUT));
  if (status === "fail") {
    for (const v of violations) console.error(" violation:", v);
    for (const c of checks.filter((x) => !x.ok)) console.error(" ", c.id, c.detail);
    process.exit(1);
  }
}

main();
