/**
 * REDDIRT-PRODUCTION-ADDITIVE-SCHEMA-INSTALL-PLAN-1.0 — Phase 3
 * Offline validator for additive-schema-install-candidate.sql
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const SLICE = "REDDIRT-PRODUCTION-ADDITIVE-SCHEMA-INSTALL-PLAN-1.0";
const CANDIDATE = path.join(ROOT, "data/sql/additive-schema-install-candidate.sql");
const AUDIT_PATH = path.join(ROOT, "data/production-db-baseline-audit.json");
const ALLOWLIST_PATH = path.join(ROOT, "data/additive-schema-manual-allowlists.json");
const OUT = path.join(ROOT, "data/additive-schema-install-validation.json");

const EXPLICIT_HIGH_RISK = new Set(
  [
    "voterrecord",
    "voterinteraction",
    "votersignal",
    "votervoteplan",
    "votersnapshotchange",
    "voterfilesnapshot",
    "votermodelclassification",
    "countyvotermetrics",
  ]
);

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

function buildExistingPublicSet(tables) {
  const s = new Set();
  for (const t of tables) {
    const low = String(t).toLowerCase();
    if (!low.startsWith("public.")) continue;
    s.add(low.slice("public.".length));
  }
  return s;
}

function loadAllowlists() {
  if (!fs.existsSync(ALLOWLIST_PATH)) return { highRiskVoterTables: [] };
  try {
    const j = JSON.parse(fs.readFileSync(ALLOWLIST_PATH, "utf8"));
    return { highRiskVoterTables: Array.isArray(j.highRiskVoterTables) ? j.highRiskVoterTables : [] };
  } catch {
    return { highRiskVoterTables: [] };
  }
}

function isHighRiskVoter(name, allow) {
  const low = name.toLowerCase();
  if (allow.has(low)) return false;
  if (EXPLICIT_HIGH_RISK.has(low)) return true;
  if (low.startsWith("voter")) return true;
  if (low.includes("voter")) return true;
  return false;
}

function main() {
  const checks = [];
  const violations = [];
  const push = (id, ok, detail) => checks.push({ id, ok, detail: ok ? "ok" : detail });

  if (!fs.existsSync(CANDIDATE)) {
    push("candidate_exists", false, "missing file");
    const out = {
      schemaVersion: "1.0",
      slice: SLICE,
      generatedAt: new Date().toISOString(),
      status: "fail",
      checks,
      violations: [{ rule: "missing_candidate", detail: path.relative(ROOT, CANDIDATE) }],
      safeForCloneTest: false,
      safeForProduction: false,
    };
    fs.mkdirSync(path.dirname(OUT), { recursive: true });
    fs.writeFileSync(OUT, JSON.stringify(out, null, 2), "utf8");
    console.error("FAIL validate-additive-schema-install-candidate.mjs — candidate missing");
    process.exit(1);
  }

  const raw = fs.readFileSync(CANDIDATE, "utf8");
  push("header_do_not_run", raw.includes("DO NOT RUN ON PRODUCTION"), "candidate must contain DO NOT RUN ON PRODUCTION");
  if (!raw.includes("DO NOT RUN ON PRODUCTION")) {
    violations.push({ rule: "missing_header_do_not_run", detail: "Required header token missing" });
  }

  const allow = loadAllowlists();
  const allowVoter = new Set(allow.highRiskVoterTables.map((x) => String(x).toLowerCase()));

  let existingPublic = new Set();
  if (fs.existsSync(AUDIT_PATH)) {
    const audit = JSON.parse(fs.readFileSync(AUDIT_PATH, "utf8"));
    existingPublic = buildExistingPublicSet(audit?.observed?.tables || []);
    push("audit_loaded", true, `${existingPublic.size} public tables`);
  } else {
    push("audit_loaded", false, "audit missing");
    violations.push({ rule: "audit_missing", detail: "production-db-baseline-audit.json required" });
  }

  const stmts = splitSqlStatements(raw).map(stripLeadingLineComments).filter((s) => s.length > 0);

  for (let idx = 0; idx < stmts.length; idx++) {
    const s = stmts[idx];
    const low = s.toLowerCase();
    if (/\bdrop\b/.test(low) && !/alter\s+table[\s\S]*alter\s+column[\s\S]*drop\s+(not\s+null|default)\b/.test(low)) {
      violations.push({ rule: "forbidden_drop", idx, preview: s.slice(0, 160) });
    }
    if (/\btruncate\b/.test(low)) violations.push({ rule: "forbidden_truncate", idx, preview: s.slice(0, 160) });
    if (/\bdelete\s+from\b/.test(low)) violations.push({ rule: "forbidden_delete", idx, preview: s.slice(0, 160) });
    if (/\binsert\s+into\b/.test(low)) violations.push({ rule: "forbidden_insert", idx, preview: s.slice(0, 160) });
    if (/\bupdate\s+/.test(low) && !/update\s+statistics/.test(low)) violations.push({ rule: "forbidden_update", idx, preview: s.slice(0, 160) });
    if (/alter\s+table[\s\S]*\bdrop\b/.test(low) && !/alter\s+column[\s\S]*drop\s+(not\s+null|default)\b/.test(low)) {
      violations.push({ rule: "forbidden_alter_drop", idx, preview: s.slice(0, 160) });
    }
    if (/"auth"\./i.test(s) || /alter\s+table\s+"auth"/i.test(s)) violations.push({ rule: "forbidden_auth", idx, preview: s.slice(0, 160) });
    if (/"storage"\./i.test(s) || /"realtime"\./i.test(s) || /"vault"\./i.test(s)) {
      violations.push({ rule: "forbidden_provider", idx, preview: s.slice(0, 160) });
    }

    const ctm = s.match(/^\s*create\s+table\s+(?:(?:"public")\.)?"([^"]+)"\s*\(/i);
    if (ctm) {
      const name = ctm[1];
      const nl = name.toLowerCase();
      if (existingPublic.has(nl)) violations.push({ rule: "create_table_observed_existing", idx, detail: name });
      if (isHighRiskVoter(name, allowVoter)) violations.push({ rule: "high_risk_voter_table", idx, detail: name });
    }

    const cim = s.match(/^\s*create\s+(unique\s+)?index[\s\S]+\bon\s+(?:(?:"public")\.)?"([^"]+)"/i);
    if (cim) {
      const on = cim[2].toLowerCase();
      if (existingPublic.has(on)) violations.push({ rule: "index_on_existing_public", idx, detail: on });
    }
  }

  const hasViolations = violations.length > 0 || checks.some((c) => !c.ok);
  push("safe_for_production_false", true, "policy: always false in artifact");
  const status = hasViolations ? "fail" : "pass";
  const safeForCloneTest = status === "pass";

  const out = {
    schemaVersion: "1.0",
    slice: SLICE,
    generatedAt: new Date().toISOString(),
    status,
    checks,
    violations,
    safeForCloneTest,
    safeForProduction: false,
  };

  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, JSON.stringify(out, null, 2), "utf8");

  console.log(status === "pass" ? "PASS validate-additive-schema-install-candidate.mjs" : "FAIL validate-additive-schema-install-candidate.mjs");
  console.log(" ", path.relative(ROOT, OUT));
  if (status === "fail") process.exit(1);
}

main();
