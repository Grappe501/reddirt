/**
 * Validates prisma/schema.prisma against data/prisma-schema-map-patch-plan.json (offline).
 * Runs `npx prisma validate` from RedDirt root (no DB writes).
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { spawnSync } from "child_process";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const SLICE = "REDDIRT-PRISMA-SCHEMA-MAP-PATCH-PLAN-AND-SHADOW-PROOF-1.0";

const PATHS = {
  patchPlan: path.join(ROOT, "data/prisma-schema-map-patch-plan.json"),
  schema: path.join(ROOT, "prisma/schema.prisma"),
  patchPlanMd: path.join(ROOT, "docs/prisma-schema-map-patch-plan.md"),
  shadowMd: path.join(ROOT, "docs/production-db-shadow-proof-plan.md"),
  out: path.join(ROOT, "data/prisma-schema-map-patch-validation.json"),
};

const FORBIDDEN_MAPPED = new Set(["User", "VoterRecord", "WorkflowIntake", "RelationalContact", "CampaignEvent"]);

function parseModelMaps(schemaText) {
  const maps = new Map();
  const lines = schemaText.split(/\r?\n/);
  let current = null;
  let depth = 0;
  for (const line of lines) {
    const start = line.match(/^model\s+(\w+)\s*\{/);
    if (start) {
      current = start[1];
      depth = 1;
      continue;
    }
    if (current) {
      const open = (line.match(/\{/g) || []).length;
      const close = (line.match(/\}/g) || []).length;
      const mapm = line.match(/@@map\("([^"]+)"\)/);
      if (mapm) maps.set(current, mapm[1]);
      depth += open - close;
      if (depth <= 0) current = null;
    }
  }
  return maps;
}

function main() {
  const checks = [];
  const violations = [];
  const patchPlan = JSON.parse(fs.readFileSync(PATHS.patchPlan, "utf8"));
  const schemaText = fs.readFileSync(PATHS.schema, "utf8");
  const modelMaps = parseModelMaps(schemaText);

  const push = (id, ok, detail) => {
    checks.push({ id, ok, detail: String(detail).slice(0, 2000) });
    if (!ok) violations.push({ id, detail: String(detail).slice(0, 2000) });
  };

  push("patch_plan_exists", fs.existsSync(PATHS.patchPlan), PATHS.patchPlan);
  push("patch_plan_md_exists", fs.existsSync(PATHS.patchPlanMd), PATHS.patchPlanMd);

  const auto = patchPlan.sectionA_autoEligibleSafeMappings || [];
  const appliedMaps = [];
  for (const row of auto) {
    const m = modelMaps.get(row.modelName);
    const ok = m === row.proposedMap;
    push(`map_${row.modelName}`, ok, `expected @@map("${row.proposedMap}") got ${m === undefined ? "(none)" : JSON.stringify(m)}`);
    if (ok) appliedMaps.push({ modelName: row.modelName, map: m });
  }

  const blockedForbiddenMaps = [];
  for (const name of FORBIDDEN_MAPPED) {
    if (modelMaps.has(name)) {
      violations.push({ id: `forbidden_map_${name}`, detail: `Model ${name} must not be @@mapped in this packet.` });
      blockedForbiddenMaps.push({ modelName: name, map: modelMaps.get(name) });
    }
  }
  push("no_forbidden_mapped", blockedForbiddenMaps.length === 0, blockedForbiddenMaps.map((b) => `${b.modelName}->${b.map}`).join(", ") || "ok");

  const vr = modelMaps.get("VoterRecord");
  const badVr =
    vr &&
    /ar02_voters|voter_vote_history|voters|voter_registry|voter_profiles/i.test(vr);
  push("voterrecord_not_warehouse", !badVr, vr ? `VoterRecord @@map("${vr}")` : "ok");

  const authOwned = [...modelMaps.entries()].filter(([, tbl]) => /^auth\./.test(tbl) || tbl.startsWith("auth."));
  push("no_auth_table_maps", authOwned.length === 0, authOwned.map(([a, b]) => `${a}->${b}`).join(", ") || "ok");

  const absolute = patchPlan.absoluteDoNotRunYet || [];
  push("absolute_do_not_run_documented", absolute.length >= 3, `count=${absolute.length}`);

  push("shadow_doc_exists", fs.existsSync(PATHS.shadowMd), PATHS.shadowMd);

  const prisma = spawnSync("npx", ["prisma", "validate"], {
    cwd: ROOT,
    encoding: "utf8",
    shell: true,
    env: { ...process.env },
  });
  const pvOk = prisma.status === 0;
  push("prisma_validate", pvOk, (prisma.stderr || prisma.stdout || "").slice(0, 1500));

  const status = violations.length === 0 && checks.every((c) => c.ok) ? "pass" : "fail";
  const safeForShadowProof = status === "pass";

  const out = {
    schemaVersion: "1.0",
    slice: SLICE,
    generatedAt: new Date().toISOString(),
    status,
    checks,
    violations,
    appliedMaps,
    blockedForbiddenMaps,
    safeForShadowProof,
    prismaValidateExitCode: prisma.status,
  };

  fs.writeFileSync(PATHS.out, JSON.stringify(out, null, 2), "utf8");

  console.log(status === "pass" ? "PASS" : "FAIL", "validate-prisma-schema-map-patch.mjs");
  if (violations.length) console.log(JSON.stringify(violations, null, 2));
  process.exit(status === "pass" ? 0 : 1);
}

main();
