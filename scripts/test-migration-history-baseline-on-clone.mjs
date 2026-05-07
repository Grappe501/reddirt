/**
 * Clone-only migration history baseline proof.
 * Mutates ONLY REDDIRT_MIGRATION_HISTORY_TEST_DATABASE_URL when set and safe.
 * REDDIRT-MIGRATION-HISTORY-BASELINE-EXECUTION-PACKET-1.0
 */
import { spawnSync } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const SLICE = "REDDIRT-MIGRATION-HISTORY-BASELINE-EXECUTION-PACKET-1.0";
const ENV_KEY = "REDDIRT_MIGRATION_HISTORY_TEST_DATABASE_URL";
const FORBIDDEN_REF = "giozeoqulfojhxpywjil";
const OUT_JSON = path.join(ROOT, "data/migration-history-baseline-clone-proof.json");
const OUT_MD = path.join(ROOT, "docs/migration-history-baseline-clone-proof.md");
const PRISMA_MIGRATIONS = path.join(ROOT, "prisma/migrations");

const LEGACY = [
  "ar02_voters",
  "contacts",
  "counties",
  "event_requests",
  "message_audiences",
  "path_to_victory",
  "people",
  "person_profiles",
];
const NEW_APP = [
  "ContentItemOverride",
  "HomepageConfig",
  "InboundContentItem",
  "CampaignEvent",
  "AdminContentBlock",
  "OwnedMediaAsset",
  "SearchChunk",
  "WorkflowIntake",
  "EmailContactProfile",
  "EmailWorkflowItem",
];
const MIN_PUBLIC = 200;

function extractSupabaseRef(url) {
  if (!url || typeof url !== "string") return null;
  const m = url.match(/db\.([a-z0-9]{15,25})\.supabase\.co/i);
  return m ? m[1].toLowerCase() : null;
}

function listMigrations() {
  return fs
    .readdirSync(PRISMA_MIGRATIONS)
    .filter((n) => fs.statSync(path.join(PRISMA_MIGRATIONS, n)).isDirectory() && fs.existsSync(path.join(PRISMA_MIGRATIONS, n, "migration.sql")))
    .sort();
}

function sqlIdent(s) {
  if (!/^[a-zA-Z0-9_]+$/.test(String(s))) throw new Error("invalid identifier");
  return String(s);
}

async function probe(url) {
  const { PrismaClient } = await import("@prisma/client");
  const prisma = new PrismaClient({ datasourceUrl: url });
  try {
    const c = await prisma.$queryRaw`SELECT COUNT(*)::int AS c FROM information_schema.tables WHERE table_schema = 'public'`;
    const publicTableCount = (Array.isArray(c) ? c[0] : c)?.c ?? 0;
    const legacy = {};
    for (const t of LEGACY) {
      const safe = sqlIdent(t);
      const q = await prisma.$queryRawUnsafe(
        `SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = '${safe}') AS e`
      );
      legacy[t] = Boolean((Array.isArray(q) ? q[0] : q)?.e);
    }
    const apps = {};
    for (const t of NEW_APP) {
      const safe = sqlIdent(t);
      const q = await prisma.$queryRawUnsafe(
        `SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = '${safe}') AS e`
      );
      apps[t] = Boolean((Array.isArray(q) ? q[0] : q)?.e);
    }
    const au = await prisma.$queryRaw`
      SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'auth' AND table_name = 'users') AS e`;
    const authUsersStillPresent = Boolean((Array.isArray(au) ? au[0] : au)?.e);
    return {
      publicTableCount,
      legacy,
      apps,
      authUsersStillPresent,
      productionLikeOk:
        publicTableCount >= MIN_PUBLIC &&
        Object.values(legacy).every(Boolean) &&
        Object.values(apps).every(Boolean) &&
        authUsersStillPresent,
    };
  } finally {
    await prisma.$disconnect().catch(() => {});
  }
}

function runPrisma(args, url) {
  return spawnSync(process.platform === "win32" ? "npx.cmd" : "npx", ["prisma", ...args], {
    cwd: ROOT,
    shell: true,
    encoding: "utf8",
    env: { ...process.env, DATABASE_URL: url, DIRECT_URL: url, PRISMA_DISABLE_WARNINGS: "1" },
  });
}

function writeOut(obj) {
  fs.mkdirSync(path.dirname(OUT_JSON), { recursive: true });
  fs.writeFileSync(OUT_JSON, JSON.stringify(obj, null, 2), "utf8");
  const md = `# Migration history baseline clone proof

**Slice:** \`${SLICE}\`  
**Machine JSON:** [\`data/migration-history-baseline-clone-proof.json\`](../data/migration-history-baseline-clone-proof.json)

## Status

- **configured:** ${obj.configured}
- **ok:** ${obj.ok}
- **cloneMutated:** ${obj.cloneMutated}
- **nextRecommendedSlice:** \`${obj.recommendation?.nextRecommendedSlice || ""}\`

## Warnings

${(obj.warnings || []).map((w) => `- ${w}`).join("\n") || "(none)"}
`;
  fs.writeFileSync(OUT_MD, md, "utf8");
}

async function main() {
  const generatedAt = new Date().toISOString();
  const testUrl = process.env[ENV_KEY] || "";
  const prodUrl = process.env.DATABASE_URL || "";

  const base = {
    schemaVersion: "1.0",
    slice: SLICE,
    generatedAt,
    mode: "clone_only_migration_history_baseline_proof",
    configured: Boolean(testUrl),
    attempted: false,
    ok: false,
    productionMutated: false,
    cloneMutated: false,
    productionProjectRefBlocked: true,
    before: {},
    after: {},
    resolveAppliedCount: 0,
    migrateDeployAfterResolve: { attempted: false, exitCode: null, summary: "" },
    highValueProtection: {
      legacyTablesStillPresent: false,
      newAppTablesStillPresent: false,
      authUsersStillPresent: false,
    },
    recommendation: {
      cloneBaselineProofPassed: false,
      safeForProductionBaselineReview: false,
      nextRecommendedSlice: "REDDIRT-MIGRATION-HISTORY-BASELINE-CLONE-PROOF-1.0",
    },
    warnings: [],
  };

  if (!testUrl) {
    base.warnings.push(`${ENV_KEY} not set — clone proof skipped (blocked).`);
    writeOut(base);
    console.log("BLOCKED test-migration-history-baseline-on-clone.mjs (no clone URL)");
    console.log(" ", path.relative(ROOT, OUT_JSON));
    process.exit(0);
  }

  const refTest = extractSupabaseRef(testUrl);
  const refProd = extractSupabaseRef(prodUrl);

  if (refTest === FORBIDDEN_REF) {
    base.warnings.push("Clone URL targets forbidden production Supabase ref.");
    writeOut(base);
    console.error("FAIL clone URL must not be production ref");
    process.exit(1);
  }

  if (testUrl === prodUrl && prodUrl) {
    base.warnings.push("Test URL equals DATABASE_URL — refused.");
    writeOut(base);
    console.error("FAIL test URL must not equal DATABASE_URL");
    process.exit(1);
  }

  if (refTest && refProd && refTest === refProd) {
    base.warnings.push("Test URL Supabase ref matches DATABASE_URL ref — refused.");
    writeOut(base);
    console.error("FAIL same Supabase ref as DATABASE_URL");
    process.exit(1);
  }

  base.attempted = true;

  try {
    base.before = await probe(testUrl);
  } catch (e) {
    base.warnings.push(`before probe: ${String(e.message || e)}`);
    base.recommendation.nextRecommendedSlice = "REDDIRT-MIGRATION-HISTORY-BASELINE-REPAIR-1.0";
    writeOut(base);
    console.error("FAIL before probe");
    process.exit(1);
  }

  if (!base.before.productionLikeOk) {
    base.warnings.push("Clone not production-like post-additive (public count / tables).");
    base.recommendation.nextRecommendedSlice = "REDDIRT-MIGRATION-HISTORY-BASELINE-REPAIR-1.0";
    writeOut(base);
    console.error("FAIL production-like precheck");
    process.exit(1);
  }

  const migrations = listMigrations();
  let applied = 0;
  for (const name of migrations) {
    const r = runPrisma(["migrate", "resolve", "--applied", name], testUrl);
    const msg = `${r.stderr || ""}\n${r.stdout || ""}`.toLowerCase();
    if (r.status === 0) {
      applied++;
      continue;
    }
    if (/already applied|already recorded|migration .* not found|could not find migration/i.test(msg)) {
      if (/not found|could not find migration/i.test(msg) && !/already/i.test(msg)) {
        base.warnings.push(`resolve failed for ${name}: ${(r.stderr || r.stdout || "").slice(0, 400)}`);
        base.recommendation.nextRecommendedSlice = "REDDIRT-MIGRATION-HISTORY-BASELINE-REPAIR-1.0";
        base.cloneMutated = applied > 0;
        writeOut(base);
        console.error("FAIL migrate resolve", name);
        process.exit(1);
      }
      applied++;
      continue;
    }
    base.warnings.push(`resolve failed for ${name}: ${(r.stderr || r.stdout || "").slice(0, 400)}`);
    base.recommendation.nextRecommendedSlice = "REDDIRT-MIGRATION-HISTORY-BASELINE-REPAIR-1.0";
    base.cloneMutated = applied > 0;
    writeOut(base);
    console.error("FAIL migrate resolve", name);
    process.exit(1);
  }
  base.resolveAppliedCount = applied;
  base.cloneMutated = true;

  const st1 = runPrisma(["migrate", "status"], testUrl);
  if (st1.status !== 0) base.warnings.push(`migrate status (mid): ${(st1.stderr || "").slice(0, 300)}`);

  const dep = runPrisma(["migrate", "deploy"], testUrl);
  base.migrateDeployAfterResolve.attempted = true;
  base.migrateDeployAfterResolve.exitCode = dep.status ?? null;
  base.migrateDeployAfterResolve.summary = `${(dep.stdout || "").slice(0, 2000)}\n${(dep.stderr || "").slice(0, 2000)}`.trim();

  if (dep.status !== 0) {
    base.warnings.push("migrate deploy on clone failed after resolve");
    base.recommendation.nextRecommendedSlice = "REDDIRT-MIGRATION-HISTORY-BASELINE-REPAIR-1.0";
    writeOut(base);
    console.error("FAIL migrate deploy on clone");
    process.exit(1);
  }

  const st2 = runPrisma(["migrate", "status"], testUrl);
  if (st2.status !== 0) base.warnings.push(`migrate status (final): ${(st2.stderr || "").slice(0, 300)}`);

  try {
    base.after = await probe(testUrl);
  } catch (e) {
    base.warnings.push(`after probe: ${String(e.message || e)}`);
    base.recommendation.nextRecommendedSlice = "REDDIRT-MIGRATION-HISTORY-BASELINE-REPAIR-1.0";
    writeOut(base);
    console.error("FAIL after probe");
    process.exit(1);
  }

  const legOk = LEGACY.every((t) => base.after.legacy?.[t]);
  const appOk = NEW_APP.every((t) => base.after.apps?.[t]);
  const authOk = base.after.authUsersStillPresent;
  base.highValueProtection.legacyTablesStillPresent = legOk;
  base.highValueProtection.newAppTablesStillPresent = appOk;
  base.highValueProtection.authUsersStillPresent = authOk;

  if (!legOk || !appOk || !authOk) {
    base.recommendation.nextRecommendedSlice = "REDDIRT-MIGRATION-HISTORY-BASELINE-REPAIR-1.0";
    writeOut(base);
    console.error("FAIL high-value protection after clone ops");
    process.exit(1);
  }

  base.ok = true;
  base.productionProjectRefBlocked = false;
  base.recommendation.cloneBaselineProofPassed = true;
  base.recommendation.safeForProductionBaselineReview = false;
  base.recommendation.nextRecommendedSlice = "REDDIRT-MIGRATION-HISTORY-BASELINE-OPERATOR-GATE-1.0";

  writeOut(base);
  console.log("PASS test-migration-history-baseline-on-clone.mjs");
  console.log(" ", path.relative(ROOT, OUT_JSON));
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
