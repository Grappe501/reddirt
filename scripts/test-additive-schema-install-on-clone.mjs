/**
 * REDDIRT-ADDITIVE-SCHEMA-CLONE-PROOF-HARDENING-1.0
 * REDDIRT-PRODUCTION-ADDITIVE-SCHEMA-INSTALL-PLAN-1.0 — Phase 4
 * Clone/shadow test runner. Does not mutate production.
 *
 * Clone proof only passes against a production-like database (required public + auth tables, min public count).
 */
import { spawnSync } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const SLICE = "REDDIRT-PRODUCTION-ADDITIVE-SCHEMA-INSTALL-PLAN-1.0";
const PACKET = "REDDIRT-ADDITIVE-SCHEMA-CLONE-PROOF-HARDENING-1.0";
const ENV_KEY = "REDDIRT_SCHEMA_INSTALL_TEST_DATABASE_URL";
/** Hosted production Supabase project ref — clone target must NOT be this project. */
const FORBIDDEN_CLONE_SUPABASE_REF = "giozeoqulfojhxpywjil";
const CANDIDATE = path.join(ROOT, "data/sql/additive-schema-install-candidate.sql");
const VALIDATION = path.join(ROOT, "data/additive-schema-install-validation.json");
const OUT = path.join(ROOT, "data/additive-schema-clone-test-result.json");

const REQUIRED_PUBLIC_TABLES = [
  "ar02_voters",
  "contacts",
  "counties",
  "event_requests",
  "message_audiences",
  "path_to_victory",
  "people",
  "person_profiles",
];

const MIN_PUBLIC_TABLE_COUNT = 100;

function extractSupabaseRef(url) {
  if (!url || typeof url !== "string") return null;
  const m = url.match(/db\.([a-z0-9]{15,25})\.supabase\.co/i);
  return m ? m[1].toLowerCase() : null;
}

function runNodeValidate() {
  const script = path.join(ROOT, "scripts/validate-additive-schema-install-candidate.mjs");
  const r = spawnSync(process.execPath, [script], { cwd: ROOT, encoding: "utf8" });
  return { code: r.status ?? 1 };
}

function runPrismaExecute(url) {
  return spawnSync(
    "npx",
    ["prisma", "db", "execute", "--file", path.relative(ROOT, CANDIDATE), "--url", url],
    { cwd: ROOT, encoding: "utf8", shell: process.platform === "win32", env: { ...process.env, PRISMA_DISABLE_WARNINGS: "1" } }
  );
}

function sqlIdent(s) {
  if (!/^[a-z0-9_]+$/i.test(s)) throw new Error("invalid identifier");
  return s;
}

/** JSON keys on before/after for each required public table (camelCase). */
const TABLE_PROBE_KEYS = {
  ar02_voters: "ar02VotersExists",
  contacts: "contactsExists",
  counties: "countiesExists",
  event_requests: "eventRequestsExists",
  message_audiences: "messageAudiencesExists",
  path_to_victory: "pathToVictoryExists",
  people: "peopleExists",
  person_profiles: "personProfilesExists",
};

async function probeDb(url) {
  const { PrismaClient } = await import("@prisma/client");
  const prisma = new PrismaClient({ datasourceUrl: url });
  const existsCols = REQUIRED_PUBLIC_TABLES.map((t) => {
    const safe = sqlIdent(t);
    return `EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = '${safe}') AS ${safe}_exists`;
  }).join(",\n");

  const sql = `
    SELECT
      (SELECT COUNT(*)::int FROM information_schema.tables WHERE table_schema = 'public') AS public_table_count,
      (SELECT COUNT(*)::int FROM information_schema.tables WHERE table_schema = 'auth') AS auth_table_count,
      EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'auth' AND table_name = 'users') AS auth_users_exists,
      ${existsCols}
  `;
  try {
    const rows = await prisma.$queryRawUnsafe(sql);
    const row = Array.isArray(rows) ? rows[0] : rows;
    const r = row || {};
    const out = {
      publicTableCount: r.public_table_count ?? null,
      authTableCount: r.auth_table_count ?? null,
      authUsersExists: Boolean(r.auth_users_exists),
    };
    for (const t of REQUIRED_PUBLIC_TABLES) {
      const snake = `${t}_exists`;
      const jk = TABLE_PROBE_KEYS[t];
      out[jk] = Boolean(r[snake]);
    }
    out.requiredPublicTablesPresent = REQUIRED_PUBLIC_TABLES.every((t) => Boolean(r[`${t}_exists`]));
    return out;
  } finally {
    await prisma.$disconnect().catch(() => {});
  }
}

function evaluateProductionLikeBefore(before) {
  const missing = [];
  if (!before || typeof before.publicTableCount !== "number") {
    return { ok: false, missing: ["probe_incomplete"], detail: "before probe incomplete" };
  }
  if (before.publicTableCount < MIN_PUBLIC_TABLE_COUNT) {
    missing.push(`public_table_count_lt_${MIN_PUBLIC_TABLE_COUNT}`);
  }
  if (!before.authUsersExists) missing.push("auth.users");
  for (const t of REQUIRED_PUBLIC_TABLES) {
    const k = TABLE_PROBE_KEYS[t];
    if (!before[k]) missing.push(`public.${t}`);
  }
  return {
    ok: missing.length === 0,
    missing,
    detail:
      missing.length === 0
        ? "production_like_precheck_ok"
        : `missing_or_insufficient_clone: ${missing.join(", ")}`,
  };
}

function evaluateAfterProtection(before, after) {
  const voterOk = Boolean(before?.ar02VotersExists && after?.ar02VotersExists);
  const legacyOk =
    Boolean(before?.contactsExists && after?.contactsExists) &&
    REQUIRED_PUBLIC_TABLES.every((t) => {
      const k = TABLE_PROBE_KEYS[t];
      return Boolean(before?.[k] && after?.[k]);
    });
  const authOk = Boolean(before?.authUsersExists && after?.authUsersExists);
  const countOk =
    typeof after?.publicTableCount === "number" && after.publicTableCount >= MIN_PUBLIC_TABLE_COUNT;
  return {
    voterTablesStillPresent: voterOk,
    legacyTablesStillPresent: legacyOk,
    authTablesStillPresent: authOk,
    publicTableCountStillAdequate: countOk,
    allPassed: voterOk && legacyOk && authOk && countOk,
  };
}

async function main() {
  const testUrl = process.env[ENV_KEY] || "";
  const dbUrl = process.env.DATABASE_URL || "";

  const base = {
    schemaVersion: "1.0",
    slice: SLICE,
    packet: PACKET,
    generatedAt: new Date().toISOString(),
    mode: "clone_shadow_test",
    configured: Boolean(testUrl),
    attempted: false,
    attemptedPhase: null,
    ok: false,
    productionMutated: false,
    candidateSqlExecutedOnProduction: false,
    candidateSqlExecutedOnClone: false,
    productionLikePrecheckPassed: false,
    before: {},
    after: {},
    highValueProtection: {
      voterTablesStillPresent: false,
      legacyTablesStillPresent: false,
      authTablesStillPresent: false,
    },
    recommendation: {
      cloneProofPassed: false,
      safeForProductionExecutionReview: false,
      nextRecommendedSlice: "REDDIRT-ADDITIVE-SCHEMA-CLONE-PROOF-1.0",
    },
    warnings: [],
  };

  const writeOut = () => {
    fs.mkdirSync(path.dirname(OUT), { recursive: true });
    fs.writeFileSync(OUT, JSON.stringify(base, null, 2), "utf8");
  };

  if (!testUrl) {
    base.warnings.push(`${ENV_KEY} not set — clone execution skipped (packet not failed).`);
    writeOut();
    console.log("BLOCKED test-additive-schema-install-on-clone.mjs (no test URL)");
    console.log(" ", path.relative(ROOT, OUT));
    return;
  }

  const refTest = extractSupabaseRef(testUrl);
  const refProd = extractSupabaseRef(dbUrl);

  if (refTest === FORBIDDEN_CLONE_SUPABASE_REF) {
    base.warnings.push(
      `Clone URL targets forbidden production Supabase project ref (${FORBIDDEN_CLONE_SUPABASE_REF}) — refused.`
    );
    base.recommendation.nextRecommendedSlice = "REDDIRT-RESTORE-PRODUCTION-LIKE-CLONE-1.0";
    base.attemptedPhase = "ref_forbidden_production_project";
    writeOut();
    console.error("FAIL clone URL must not be the production Supabase project ref");
    process.exit(1);
  }

  if (refTest && refProd && refTest === refProd) {
    base.warnings.push("Test URL Supabase project ref matches DATABASE_URL ref — refused (production collision).");
    base.recommendation.nextRecommendedSlice = "REDDIRT-RESTORE-PRODUCTION-LIKE-CLONE-1.0";
    base.attemptedPhase = "ref_matches_database_url";
    writeOut();
    console.error("FAIL test-additive-schema-install-on-clone.mjs — same Supabase project ref as DATABASE_URL");
    process.exit(1);
  }

  if (dbUrl && testUrl === dbUrl) {
    base.warnings.push("Test URL equals DATABASE_URL — refused.");
    base.recommendation.nextRecommendedSlice = "REDDIRT-RESTORE-PRODUCTION-LIKE-CLONE-1.0";
    base.attemptedPhase = "url_equals_database_url";
    writeOut();
    console.error("FAIL test-additive-schema-install-on-clone.mjs — test URL must not equal DATABASE_URL");
    process.exit(1);
  }

  if (!fs.existsSync(CANDIDATE)) {
    base.warnings.push("Candidate SQL missing.");
    writeOut();
    console.error("FAIL candidate missing");
    process.exit(1);
  }

  const v = runNodeValidate();
  if (v.code !== 0) {
    base.warnings.push("Candidate validation failed — clone apply refused.");
    writeOut();
    console.error("FAIL validation must pass before clone test");
    process.exit(1);
  }

  let val = null;
  try {
    val = JSON.parse(fs.readFileSync(VALIDATION, "utf8"));
  } catch {
    val = null;
  }
  if (!val || val.status !== "pass" || !val.safeForCloneTest) {
    base.warnings.push("additive-schema-install-validation.json not pass / not safe for clone test.");
    writeOut();
    console.error("FAIL validation artifact");
    process.exit(1);
  }

  base.attempted = true;
  base.attemptedPhase = "precheck_probe";

  try {
    base.before = await probeDb(testUrl);
  } catch (e) {
    base.warnings.push(`before probe failed: ${String(e.message || e)}`);
    base.before = { error: "probe_failed" };
    base.attempted = false;
    base.attemptedPhase = "precheck_probe_failed";
    base.recommendation.nextRecommendedSlice = "REDDIRT-RESTORE-PRODUCTION-LIKE-CLONE-1.0";
    writeOut();
    console.error("FAIL before probe");
    process.exit(1);
  }

  const pre = evaluateProductionLikeBefore(base.before);
  base.productionLikePrecheckPassed = pre.ok;

  if (!pre.ok) {
    base.attempted = false;
    base.attemptedPhase = "false_precondition_failed";
    base.ok = false;
    base.recommendation.cloneProofPassed = false;
    base.recommendation.safeForProductionExecutionReview = false;
    base.recommendation.nextRecommendedSlice = "REDDIRT-RESTORE-PRODUCTION-LIKE-CLONE-1.0";
    base.warnings.push(
      "Clone is empty, auth-only, or otherwise not production-like — candidate SQL was NOT executed. " +
        "Restore a fork/backup or schema-level copy that includes the required public warehouse tables and auth.users, " +
        `then re-run. Detail: ${pre.detail}`
    );
    base.warnings.push(`Missing or insufficient signals: ${pre.missing.join("; ")}`);
    writeOut();
    console.error("FAIL production-like clone precheck — not executing candidate SQL");
    process.exit(1);
  }

  base.attemptedPhase = "execute_candidate";
  base.candidateSqlExecutedOnClone = false;
  const ex = runPrismaExecute(testUrl);
  const okExec = ex.status === 0;
  if (!okExec) {
    base.warnings.push(`prisma db execute failed: ${(ex.stderr || "").slice(0, 500)}`);
    base.ok = false;
    base.recommendation.cloneProofPassed = false;
    base.recommendation.nextRecommendedSlice = "REDDIRT-ADDITIVE-SCHEMA-CANDIDATE-REPAIR-1.0";
    writeOut();
    console.error("FAIL prisma db execute");
    process.exit(1);
  }
  base.candidateSqlExecutedOnClone = true;

  base.attemptedPhase = "postcheck_probe";
  try {
    base.after = await probeDb(testUrl);
  } catch (e) {
    base.warnings.push(`after probe failed: ${String(e.message || e)}`);
    base.after = { error: "probe_failed" };
    base.ok = false;
    base.recommendation.cloneProofPassed = false;
    base.recommendation.nextRecommendedSlice = "REDDIRT-ADDITIVE-SCHEMA-CANDIDATE-REPAIR-1.0";
    writeOut();
    console.error("FAIL after probe");
    process.exit(1);
  }

  base.productionMutated = false;
  base.candidateSqlExecutedOnProduction = false;

  const prot = evaluateAfterProtection(base.before, base.after);
  base.highValueProtection.voterTablesStillPresent = prot.voterTablesStillPresent;
  base.highValueProtection.legacyTablesStillPresent = prot.legacyTablesStillPresent;
  base.highValueProtection.authTablesStillPresent = prot.authTablesStillPresent;
  base.highValueProtection.publicTableCountStillAdequate = prot.publicTableCountStillAdequate;

  const postOk = prot.allPassed;
  if (!postOk) {
    base.ok = false;
    base.recommendation.cloneProofPassed = false;
    base.recommendation.safeForProductionExecutionReview = false;
    base.recommendation.nextRecommendedSlice = "REDDIRT-ADDITIVE-SCHEMA-CANDIDATE-REPAIR-1.0";
    base.warnings.push(
      "Post-apply high-value / table-count checks failed — cloneProofPassed remains false (tables may have been dropped or counts fell below threshold)."
    );
    writeOut();
    console.error("FAIL post-apply production-like verification");
    process.exit(1);
  }

  base.ok = true;
  base.recommendation.cloneProofPassed = true;
  base.productionLikeCloneProof = true;
  base.recommendation.safeForProductionExecutionReview = false;
  base.recommendation.nextRecommendedSlice = "REDDIRT-ADDITIVE-SCHEMA-PRODUCTION-EXECUTION-PACKET-1.0";

  writeOut();
  console.log("PASS test-additive-schema-install-on-clone.mjs");
  console.log(" ", path.relative(ROOT, OUT));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
