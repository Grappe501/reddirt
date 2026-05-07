/**
 * Read-only production preflight for additive schema execution packet.
 * May read DATABASE_URL / DIRECT_URL — never prints them or passwords.
 * REDDIRT-ADDITIVE-SCHEMA-PRODUCTION-EXECUTION-PACKET-1.0
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import {
  analyzeCandidateSql,
  evaluateCloneProofHardened,
  extractSupabaseRef,
  PRODUCTION_SUPABASE_PROJECT_REF,
} from "./lib/additive-candidate-sql-guards.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const SLICE = "REDDIRT-ADDITIVE-SCHEMA-PRODUCTION-EXECUTION-PACKET-1.0";
const VALIDATION = path.join(ROOT, "data/additive-schema-install-validation.json");
const CLONE = path.join(ROOT, "data/additive-schema-clone-test-result.json");
const CANDIDATE = path.join(ROOT, "data/sql/additive-schema-install-candidate.sql");
const OUT = path.join(ROOT, "data/additive-schema-production-preflight.json");

function urlShapeValid(name, value) {
  if (!value || typeof value !== "string") return { ok: false, detail: `${name} missing or not string` };
  const t = value.trim();
  if (t.length < 24) return { ok: false, detail: `${name} too short` };
  if (!/^postgres(ql)?:\/\//i.test(t)) return { ok: false, detail: `${name} must start with postgres:// or postgresql://` };
  if (!t.includes("@")) return { ok: false, detail: `${name} expected @ host part` };
  if (/YOUR_|PLACEHOLDER|CHANGEME|example\.com\/fake/i.test(t)) return { ok: false, detail: `${name} looks like placeholder` };
  return { ok: true, detail: "ok" };
}

async function tableExists(prisma, schema, name) {
  if (!/^[a-z_]+$/.test(schema) || !/^[a-z0-9_]+$/.test(name)) throw new Error("invalid schema/table identifier");
  const rows = await prisma.$queryRawUnsafe(
    `SELECT EXISTS (
       SELECT 1 FROM information_schema.tables
       WHERE table_schema = '${schema}' AND table_name = '${name}'
     ) AS e`
  );
  const row = Array.isArray(rows) ? rows[0] : rows;
  return Boolean(row?.e);
}

async function publicTableCount(prisma) {
  const rows = await prisma.$queryRawUnsafe(
    `SELECT COUNT(*)::int AS c FROM information_schema.tables WHERE table_schema = 'public'`
  );
  const row = Array.isArray(rows) ? rows[0] : rows;
  return typeof row?.c === "number" ? row.c : null;
}

async function main() {
  const generatedAt = new Date().toISOString();
  const warnings = [];

  const du = process.env.DATABASE_URL;
  const dir = process.env.DIRECT_URL;
  const databaseUrlPresent = !!(du && String(du).trim());
  const directUrlPresent = !!(dir && String(dir).trim());
  const su = urlShapeValid("DATABASE_URL", du);
  const sd = urlShapeValid("DIRECT_URL", dir);
  if (!su.ok) warnings.push(su.detail);
  if (!sd.ok) warnings.push(sd.detail);

  const refFromUrl = extractSupabaseRef(du || "");
  const productionProjectRefConfirmed = refFromUrl === PRODUCTION_SUPABASE_PROJECT_REF;

  if (databaseUrlPresent && refFromUrl && !productionProjectRefConfirmed) {
    warnings.push(
      `DATABASE_URL Supabase ref mismatch: expected ${PRODUCTION_SUPABASE_PROJECT_REF}, parsed ${refFromUrl || "(none)"}`
    );
  }

  const candidateSqlPresent = fs.existsSync(CANDIDATE);
  let candidateValidationPassed = false;
  let cloneProofPassed = false;
  let cloneProofDetail = null;
  try {
    const v = JSON.parse(fs.readFileSync(VALIDATION, "utf8"));
    candidateValidationPassed =
      v?.status === "pass" && v?.safeForCloneTest === true && v?.safeForProduction === false;
  } catch {
    candidateValidationPassed = false;
  }
  let clone = null;
  try {
    clone = JSON.parse(fs.readFileSync(CLONE, "utf8"));
    const ev = evaluateCloneProofHardened(clone);
    cloneProofPassed = ev.passed;
    cloneProofDetail = ev.gates;
    if (ev.claimsPassButHardenedFails) {
      warnings.push("clone JSON claims pass but fails hardened gates — refresh clone artifact.");
    }
  } catch {
    cloneProofPassed = false;
  }

  let candidateSqlDestructiveScanOk = false;
  if (candidateSqlPresent) {
    const raw = fs.readFileSync(CANDIDATE, "utf8");
    const a = analyzeCandidateSql(raw);
    candidateSqlDestructiveScanOk =
      a.noDestructiveViolations &&
      a.dropCount === 0 &&
      a.truncateCount === 0 &&
      a.deleteCount === 0 &&
      a.insertCount === 0 &&
      a.updateCount === 0;
    if (!candidateSqlDestructiveScanOk) warnings.push("candidate SQL failed destructive / extension-schema scan");
  }

  const requiredSpecs = [
    { schema: "public", name: "ar02_voters" },
    { schema: "public", name: "contacts" },
    { schema: "public", name: "counties" },
    { schema: "public", name: "event_requests" },
    { schema: "public", name: "message_audiences" },
    { schema: "public", name: "path_to_victory" },
    { schema: "public", name: "people" },
    { schema: "public", name: "person_profiles" },
    { schema: "auth", name: "users" },
  ];

  let requiredTablesPresent = false;
  let authUsersPresent = false;
  let publicTableCountVal = 0;
  let prismaMigrationsTableExists = false;
  const tableProbeDetail = {};

  if (databaseUrlPresent && su.ok && productionProjectRefConfirmed) {
    try {
      const { PrismaClient } = await import("@prisma/client");
      const prisma = new PrismaClient({ datasourceUrl: du });
      try {
        publicTableCountVal = (await publicTableCount(prisma)) ?? 0;
        prismaMigrationsTableExists = await tableExists(prisma, "public", "_prisma_migrations");
        let allOk = true;
        for (const { schema, name } of requiredSpecs) {
          const ex = await tableExists(prisma, schema, name);
          tableProbeDetail[`${schema}.${name}`] = ex;
          if (!ex) allOk = false;
        }
        requiredTablesPresent = allOk;
        authUsersPresent = tableProbeDetail["auth.users"] === true;
      } finally {
        await prisma.$disconnect().catch(() => {});
      }
    } catch (e) {
      warnings.push(`read-only probe error: ${String(e.message || e)}`);
      requiredTablesPresent = false;
      authUsersPresent = false;
    }
  } else {
    warnings.push("Skipping DB probes: DATABASE_URL missing, invalid shape, or project ref not confirmed.");
  }

  const readyForManualExecution =
    databaseUrlPresent &&
    directUrlPresent &&
    su.ok &&
    sd.ok &&
    productionProjectRefConfirmed &&
    candidateSqlPresent &&
    candidateValidationPassed &&
    cloneProofPassed &&
    candidateSqlDestructiveScanOk &&
    requiredTablesPresent &&
    authUsersPresent;

  let reason = "";
  if (!databaseUrlPresent) reason = "DATABASE_URL not set.";
  else if (!directUrlPresent) reason = "DIRECT_URL not set.";
  else if (!su.ok) reason = su.detail;
  else if (!sd.ok) reason = sd.detail;
  else if (!productionProjectRefConfirmed) reason = "DATABASE_URL does not resolve to production Supabase project ref.";
  else if (!candidateSqlPresent) reason = "Candidate SQL file missing.";
  else if (!candidateValidationPassed) reason = "Candidate validation JSON not pass / safe flags wrong.";
  else if (!cloneProofPassed) reason = "Clone proof hardened gates failed.";
  else if (!candidateSqlDestructiveScanOk) reason = "Candidate SQL destructive scan failed.";
  else if (!requiredTablesPresent) reason = "One or more required tables missing on target (see tableProbeDetail).";
  else if (!authUsersPresent) reason = "auth.users not found.";
  else reason = "All read-only preflight gates passed (still requires human approval for execution).";

  const payload = {
    schemaVersion: "1.0",
    slice: SLICE,
    generatedAt,
    mode: "safe_read_only_production_preflight",
    databaseUrlPresent,
    databaseUrlShapeValid: su.ok,
    directUrlPresent,
    directUrlShapeValid: sd.ok,
    productionProjectRefConfirmed,
    productionProjectRefExpected: PRODUCTION_SUPABASE_PROJECT_REF,
    productionProjectRefParsed: refFromUrl || null,
    candidateSqlPresent,
    candidateValidationPassed,
    cloneProofPassed,
    cloneProofDetail,
    candidateSqlDestructiveScanOk,
    requiredTablesPresent,
    authUsersPresent,
    publicTableCount: publicTableCountVal,
    prismaMigrationsTableExists,
    tableProbeDetail,
    secretsPrinted: false,
    productionMutationAttempted: false,
    readyForManualExecution,
    reason,
    warnings,
  };

  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, JSON.stringify(payload, null, 2), "utf8");

  console.log("=== run-additive-schema-production-preflight.mjs ===");
  console.log("Report:", path.relative(ROOT, OUT));
  console.log(readyForManualExecution ? "PASS read-only preflight" : "BLOCKED read-only preflight — see reason in JSON");
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
