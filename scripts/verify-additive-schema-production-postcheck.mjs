/**
 * Post-additive schema verification: offline plan shape, or read-only DB probes when DATABASE_URL is set.
 * Never prints DATABASE_URL. Never mutates the database.
 * REDDIRT-ADDITIVE-SCHEMA-PRODUCTION-EXECUTION-PACKET-1.0
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { extractSupabaseRef, PRODUCTION_SUPABASE_PROJECT_REF } from "./lib/additive-candidate-sql-guards.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const PLAN = path.join(ROOT, "data/additive-schema-production-postcheck-plan.json");
const OUT_RUN = path.join(ROOT, "data/additive-schema-production-postcheck-result.json");

const NEW_APP_TABLES = [
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

const LEGACY_TABLES = [
  "ar02_voters",
  "contacts",
  "counties",
  "event_requests",
  "message_audiences",
  "path_to_victory",
  "people",
  "person_profiles",
];

function assertRelName(s) {
  if (!/^[A-Za-z0-9_]+$/.test(s)) throw new Error("invalid relname");
}

async function existsRel(prisma, schema, relname) {
  assertRelName(schema);
  assertRelName(relname);
  const rows = await prisma.$queryRawUnsafe(
    `SELECT EXISTS (
       SELECT 1 FROM pg_catalog.pg_class c
       JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
       WHERE n.nspname = '${schema}' AND c.relkind IN ('r','p','v','m') AND c.relname = '${relname}'
     ) AS e`
  );
  const row = Array.isArray(rows) ? rows[0] : rows;
  return Boolean(row?.e);
}

function verifyPlanShape() {
  if (!fs.existsSync(PLAN)) {
    console.error("FAIL missing data/additive-schema-production-postcheck-plan.json — run build script first");
    process.exit(1);
  }
  let j;
  try {
    j = JSON.parse(fs.readFileSync(PLAN, "utf8"));
  } catch {
    console.error("FAIL invalid JSON");
    process.exit(1);
  }
  const ok =
    j.schemaVersion === "1.0" &&
    typeof j.slice === "string" &&
    Array.isArray(j.phases) &&
    j.phases.length > 0 &&
    j.phases.every((p) => p.id && p.title && Array.isArray(p.checks));

  if (!ok) {
    console.error("FAIL postcheck plan shape");
    process.exit(1);
  }
  return j;
}

async function main() {
  const plan = verifyPlanShape();
  const du = process.env.DATABASE_URL;
  if (!du || !String(du).trim()) {
    console.log("PASS verify-additive-schema-production-postcheck.mjs (offline plan shape only)");
    console.log(" ", path.relative(ROOT, PLAN));
    console.log("Hint: set DATABASE_URL for read-only table probes →", path.relative(ROOT, OUT_RUN));
    process.exit(0);
  }

  const ref = extractSupabaseRef(du);
  if (ref !== PRODUCTION_SUPABASE_PROJECT_REF) {
    console.error("FAIL DATABASE_URL does not resolve to expected production Supabase ref (refusing probes)");
    process.exit(1);
  }

  const { PrismaClient } = await import("@prisma/client");
  const prisma = new PrismaClient({ datasourceUrl: du });
  const generatedAt = new Date().toISOString();
  const newApp = {};
  const legacy = {};
  let authUsers = false;
  try {
    for (const t of NEW_APP_TABLES) {
      newApp[t] = await existsRel(prisma, "public", t);
    }
    for (const t of LEGACY_TABLES) {
      legacy[t] = await existsRel(prisma, "public", t);
    }
    authUsers = await existsRel(prisma, "auth", "users");
  } finally {
    await prisma.$disconnect().catch(() => {});
  }

  const newAppOk = Object.values(newApp).every(Boolean);
  const legacyOk = Object.values(legacy).every(Boolean);
  const allOk = newAppOk && legacyOk && authUsers;

  const payload = {
    schemaVersion: "1.0",
    slice: plan.slice,
    generatedAt,
    mode: "read_only_postcheck_probe",
    productionMutationAttempted: false,
    secretsPrinted: false,
    newAppTables: newApp,
    legacyTables: legacy,
    authUsersPresent: authUsers,
    allChecksPassed: allOk,
  };
  fs.mkdirSync(path.dirname(OUT_RUN), { recursive: true });
  fs.writeFileSync(OUT_RUN, JSON.stringify(payload, null, 2), "utf8");

  if (!allOk) {
    console.error("FAIL postcheck probes — see", path.relative(ROOT, OUT_RUN));
    process.exit(1);
  }
  console.log("PASS verify-additive-schema-production-postcheck.mjs (read-only probes)");
  console.log(" ", path.relative(ROOT, OUT_RUN));
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
