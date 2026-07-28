/**
 * Phase 1C — safe DB identity / parity audit (read-only).
 * Usage: node scripts/run-with-h-drive-env.cjs node scripts/phase1c-db-identity-audit.cjs
 */
const { PrismaClient } = require("@prisma/client");

function redactUrl(u) {
  if (!u) return { present: false };
  try {
    const url = new URL(u);
    const host = url.hostname;
    const port = url.port || "(default)";
    const db = url.pathname.replace(/^\//, "") || "(none)";
    const projectHint = host.includes("pooler.supabase.com")
      ? "supabase-pooler"
      : host.includes("supabase.co")
        ? "supabase-direct"
        : host.includes("neon")
          ? "neon"
          : host.includes("localhost") || host === "127.0.0.1"
            ? "local"
            : "other";
    return { present: true, host, port, db, projectHint, userPrefix: (url.username || "").split(".")[0] || "(none)" };
  } catch {
    return { present: true, parseError: true };
  }
}

async function main() {
  const prisma = new PrismaClient();
  try {
    const tables = await prisma.$queryRawUnsafe(`
      SELECT table_schema, table_name
      FROM information_schema.tables
      WHERE table_schema IN ('public', 'auth')
        AND table_type = 'BASE TABLE'
      ORDER BY table_schema, table_name
    `);

    const reddirtAnchors = [
      "User",
      "WorkflowIntake",
      "WorkflowAction",
      "ContactPreference",
      "OwnedMediaAsset",
      "PublicMediaPlacement",
      "VolunteerProfile",
      "VoterRecord",
      "Submission",
      "submissions",
      "users",
      "County",
      "CampaignEvent",
      "MediaIngestBatch",
    ];

    const names = new Set(tables.map((t) => t.table_name));
    const anchorPresence = Object.fromEntries(reddirtAnchors.map((n) => [n, names.has(n)]));

    const submissionCols = await prisma.$queryRawUnsafe(`
      SELECT table_name, column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name IN ('submissions', 'Submission')
      ORDER BY table_name, ordinal_position
    `);

    const userCols = await prisma.$queryRawUnsafe(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'User'
      ORDER BY ordinal_position
    `);

    const submissionStats = await prisma.$queryRawUnsafe(`
      SELECT
        (SELECT COUNT(*)::bigint FROM public.submissions) AS legacy_submissions_count,
        (SELECT MIN(created_at)::text FROM public.submissions) AS legacy_oldest,
        (SELECT MAX(created_at)::text FROM public.submissions) AS legacy_newest
    `).catch((e) => [{ error: String(e.message || e).slice(0, 200) }]);

    const sampleLegacy = await prisma.$queryRawUnsafe(`
      SELECT module_id, source, processed,
             LEFT(COALESCE(raw_data::text, ''), 120) AS raw_preview
      FROM public.submissions
      ORDER BY created_at DESC NULLS LAST
      LIMIT 5
    `).catch((e) => [{ error: String(e.message || e).slice(0, 200) }]);

    const moduleIds = await prisma.$queryRawUnsafe(`
      SELECT module_id, COUNT(*)::int AS n
      FROM public.submissions
      GROUP BY module_id
      ORDER BY n DESC
      LIMIT 20
    `).catch((e) => [{ error: String(e.message || e).slice(0, 200) }]);

    const voterRecord = await prisma.$queryRawUnsafe(`
      SELECT EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = 'VoterRecord'
      ) AS has_voter_record
    `);

    const linkedCol = userCols.some((c) => c.column_name === "linkedVoterRecordId");

    const migrationMarkers = await prisma.$queryRawUnsafe(`
      SELECT COUNT(*)::int AS applied_finished
      FROM _prisma_migrations
      WHERE finished_at IS NOT NULL AND rolled_back_at IS NULL
    `);

    const searchPath = await prisma.$queryRawUnsafe(`SHOW search_path`);

    console.log(
      JSON.stringify(
        {
          databaseUrl: redactUrl(process.env.DATABASE_URL),
          directUrl: redactUrl(process.env.DIRECT_URL),
          searchPath,
          tableCount: tables.length,
          tableNames: tables.map((t) => `${t.table_schema}.${t.table_name}`),
          anchorPresence,
          submissionCols,
          userCols,
          submissionStats,
          sampleLegacy,
          moduleIds,
          voterRecord,
          linkedVoterRecordIdPresent: linkedCol,
          migrationMarkers,
        },
        (_, v) => (typeof v === "bigint" ? v.toString() : v),
        2,
      ),
    );
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
