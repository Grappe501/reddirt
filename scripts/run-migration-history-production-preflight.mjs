/**
 * Read-only migration history preflight against DATABASE_URL.
 * Never prints DATABASE_URL, DIRECT_URL, or passwords.
 * REDDIRT-MIGRATION-HISTORY-BASELINE-EXECUTION-PACKET-1.0
 * HOTFIX: REDDIRT-MIGRATION-HISTORY-PREFLIGHT-POOLER-REF-PARSE-FIX-1.0 — pooler URLs use postgres.<projectRef> username.
 */
import { spawnSync } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const SLICE = "REDDIRT-MIGRATION-HISTORY-BASELINE-EXECUTION-PACKET-1.0";
const REQUIRED_PRODUCTION_REF = "giozeoqulfojhxpywjil";
const OUT = path.join(ROOT, "data/migration-history-production-preflight.json");

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

/**
 * Supabase project ref from DATABASE_URL without logging secrets.
 * Supports: (1) URI userinfo postgres.<ref> before @ (pooler / transaction mode)
 * (2) host db.<ref>.supabase.co
 * @returns {{ ref: string | null, hint: string | null }}
 */
function extractSupabaseRef(url) {
  if (!url || typeof url !== "string") return { ref: null, hint: null };
  const u = url.trim();

  const authMatch = u.match(/^postgres(?:ql)?:\/\/([^/?#]*)@/i);
  if (authMatch) {
    const userinfo = authMatch[1];
    const colonIdx = userinfo.indexOf(":");
    const userPartRaw = colonIdx === -1 ? userinfo : userinfo.slice(0, colonIdx);
    let userPart = userPartRaw;
    try {
      userPart = decodeURIComponent(userPartRaw);
    } catch {
      /* keep raw */
    }
    const poolerUser = userPart.match(/^postgres\.([a-z0-9]{15,25})$/i);
    if (poolerUser) return { ref: poolerUser[1].toLowerCase(), hint: "username_postgres_dot_ref" };
  }

  const hostMatch = u.match(/db\.([a-z0-9]{15,25})\.supabase\.co/i);
  if (hostMatch) return { ref: hostMatch[1].toLowerCase(), hint: "host_db_dot_ref" };

  return { ref: null, hint: null };
}

function urlShapeOk(url) {
  if (!url || typeof url !== "string") return false;
  const t = url.trim();
  if (t.length < 24) return false;
  if (!/^postgres(ql)?:\/\//i.test(t)) return false;
  return t.includes("@");
}

function sqlIdent(s) {
  if (!/^[a-zA-Z0-9_]+$/.test(String(s))) throw new Error("invalid identifier");
  return String(s);
}

async function main() {
  const generatedAt = new Date().toISOString();
  const warnings = [];
  const blockers = [];

  const du = process.env.DATABASE_URL;
  const databaseUrlPresent = !!(du && String(du).trim());
  const databaseUrlShapeValid = urlShapeOk(du);

  const base = {
    schemaVersion: "1.0",
    slice: SLICE,
    generatedAt,
    mode: "read_only_migration_history_preflight",
    databaseUrlPresent,
    databaseUrlShapeValid,
    productionProjectRefConfirmed: false,
    requiredLegacyTablesPresent: false,
    requiredNewAppTablesPresent: false,
    authUsersPresent: false,
    publicTableCount: 0,
    prismaMigrationsTableExists: false,
    prismaMigrationsCount: 0,
    prismaMigrationNamesSample: [],
    migrateStatusAttempted: false,
    migrateStatusExitCode: null,
    migrateStatusSummary: "",
    pendingMigrationCount: null,
    secretsPrinted: false,
    productionMutationAttempted: false,
    readyForManualBaselineReview: false,
    /** How ref was derived; never includes hostname/password. */
    supabaseProjectRefParseHint: null,
    warnings,
    blockers,
  };

  const write = () => {
    fs.mkdirSync(path.dirname(OUT), { recursive: true });
    fs.writeFileSync(OUT, JSON.stringify(base, null, 2), "utf8");
  };

  if (!databaseUrlPresent) {
    blockers.push("DATABASE_URL is required for production preflight");
    write();
    console.log("WARN run-migration-history-production-preflight.mjs — DATABASE_URL missing (artifact written)");
    process.exit(0);
  }
  if (!databaseUrlShapeValid) {
    blockers.push("DATABASE_URL shape invalid");
    write();
    console.log("WARN DATABASE_URL shape");
    process.exit(0);
  }

  const { ref, hint } = extractSupabaseRef(du);
  if (hint) base.supabaseProjectRefParseHint = hint;
  if (ref !== REQUIRED_PRODUCTION_REF) {
    blockers.push(`Expected Supabase db project ref ${REQUIRED_PRODUCTION_REF}, got ${ref || "unparsed"}`);
    warnings.push("Ref mismatch — not canonical production for this packet");
    write();
    console.log("WARN production ref mismatch — see blockers in", path.relative(ROOT, OUT));
    process.exit(0);
  }
  base.productionProjectRefConfirmed = true;

  const { PrismaClient } = await import("@prisma/client");
  const prisma = new PrismaClient({ datasourceUrl: du });

  try {
    const pc = await prisma.$queryRaw`SELECT COUNT(*)::int AS c FROM information_schema.tables WHERE table_schema = 'public'`;
    const row = Array.isArray(pc) ? pc[0] : pc;
    base.publicTableCount = row?.c ?? 0;

    const legacyChecks = [];
    for (const t of LEGACY) {
      const safe = sqlIdent(t);
      const q = await prisma.$queryRawUnsafe(
        `SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = '${safe}') AS e`
      );
      const r = Array.isArray(q) ? q[0] : q;
      legacyChecks.push(Boolean(r?.e));
    }
    base.requiredLegacyTablesPresent = legacyChecks.every(Boolean);

    const appChecks = [];
    for (const t of NEW_APP) {
      const safe = sqlIdent(t);
      const q = await prisma.$queryRawUnsafe(
        `SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = '${safe}') AS e`
      );
      const r = Array.isArray(q) ? q[0] : q;
      appChecks.push(Boolean(r?.e));
    }
    base.requiredNewAppTablesPresent = appChecks.every(Boolean);

    const au = await prisma.$queryRaw`
      SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'auth' AND table_name = 'users') AS e`;
    const aur = Array.isArray(au) ? au[0] : au;
    base.authUsersPresent = Boolean(aur?.e);

    const pmExists = await prisma.$queryRaw`
      SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = '_prisma_migrations') AS e`;
    const pmr = Array.isArray(pmExists) ? pmExists[0] : pmExists;
    base.prismaMigrationsTableExists = Boolean(pmr?.e);

    if (base.prismaMigrationsTableExists) {
      const cnt = await prisma.$queryRaw`SELECT COUNT(*)::int AS c FROM public._prisma_migrations`;
      const cr = Array.isArray(cnt) ? cnt[0] : cnt;
      base.prismaMigrationsCount = cr?.c ?? 0;
      const names = await prisma.$queryRaw`
        SELECT migration_name FROM public._prisma_migrations ORDER BY migration_name ASC LIMIT 200`;
      base.prismaMigrationNamesSample = Array.isArray(names) ? names.map((x) => x.migration_name).filter(Boolean) : [];
    }
  } catch (e) {
    blockers.push(`probe_error: ${String(e.message || e).slice(0, 200)}`);
    warnings.push("Prisma probe failed — check connectivity and URL (do not paste URL into logs)");
  } finally {
    await prisma.$disconnect().catch(() => {});
  }

  if (!base.requiredLegacyTablesPresent) blockers.push("one or more required legacy public tables missing");
  if (!base.requiredNewAppTablesPresent) blockers.push("one or more required new app tables missing");
  if (!base.authUsersPresent) blockers.push("auth.users missing");

  const ms = spawnSync(process.platform === "win32" ? "npx.cmd" : "npx", ["prisma", "migrate", "status"], {
    cwd: ROOT,
    shell: true,
    encoding: "utf8",
    env: { ...process.env, DATABASE_URL: du, PRISMA_DISABLE_WARNINGS: "1" },
  });
  base.migrateStatusAttempted = true;
  base.migrateStatusExitCode = ms.status ?? null;
  const out = `${ms.stdout || ""}\n${ms.stderr || ""}`.trim();
  base.migrateStatusSummary = out.slice(0, 4000);
  const pendingMatch = out.match(/Following migrations have not yet been applied:\s*([\s\S]*?)(?:\n\n|\nDatabase migrations|$)/i);
  if (pendingMatch) {
    const lines = pendingMatch[1].split("\n").map((l) => l.trim()).filter(Boolean);
    base.pendingMigrationCount = lines.length;
  } else if (/Database schema is up to date/i.test(out) || /No pending migrations/i.test(out)) {
    base.pendingMigrationCount = 0;
  }

  if (base.migrateStatusExitCode !== 0) warnings.push("prisma migrate status exited non-zero — review summary (no secrets)");

  base.readyForManualBaselineReview =
    base.productionProjectRefConfirmed &&
    base.requiredLegacyTablesPresent &&
    base.requiredNewAppTablesPresent &&
    base.authUsersPresent &&
    blockers.length === 0;

  write();
  console.log(base.readyForManualBaselineReview ? "PASS run-migration-history-production-preflight.mjs" : "WARN run-migration-history-production-preflight.mjs");
  console.log(" ", path.relative(ROOT, OUT));
  process.exit(blockers.length ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
