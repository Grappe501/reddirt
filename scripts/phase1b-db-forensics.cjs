/**
 * Phase 1B forensic helpers — redacted DB inspection. Do not commit secrets.
 */
const { PrismaClient } = require("@prisma/client");

function redactUrl(u) {
  if (!u) return "(unset)";
  try {
    const url = new URL(u);
    return `${url.protocol}//${url.hostname}:${url.port || "(default)"}/${url.pathname.split("/").filter(Boolean).slice(-1)[0] || ""}?schema=redacted`;
  } catch {
    return "(unparseable)";
  }
}

async function main() {
  const cmd = process.argv[2] || "baseline";
  const prisma = new PrismaClient();
  try {
    if (cmd === "baseline") {
      console.log(
        JSON.stringify(
          {
            databaseUrl: redactUrl(process.env.DATABASE_URL),
            directUrl: redactUrl(process.env.DIRECT_URL),
            poolerHint: String(process.env.DATABASE_URL || "").includes("pooler"),
            portHint: (() => {
              try {
                return new URL(process.env.DIRECT_URL || process.env.DATABASE_URL || "").port || "5432";
              } catch {
                return "unknown";
              }
            })(),
          },
          null,
          2,
        ),
      );
      return;
    }

    if (cmd === "failed-migration") {
      const rows = await prisma.$queryRawUnsafe(`
        SELECT migration_name, started_at, finished_at, rolled_back_at,
               applied_steps_count,
               LEFT(COALESCE(logs, ''), 2000) AS logs
        FROM _prisma_migrations
        WHERE migration_name = '20260719160000_google_oauth_and_routes'
        ORDER BY started_at
      `);
      console.log(JSON.stringify(rows, (_, v) => (typeof v === "bigint" ? v.toString() : v), 2));
      return;
    }

    if (cmd === "oauth-objects") {
      const enums = await prisma.$queryRawUnsafe(`
        SELECT t.typname FROM pg_type t
        JOIN pg_namespace n ON n.oid = t.typnamespace
        WHERE n.nspname = 'public'
          AND (t.typname ILIKE '%GoogleConnection%' OR t.typname ILIKE '%OAuth%' OR t.typname = 'GoogleConnectionStatus')
        ORDER BY 1
      `);
      const tables = await prisma.$queryRawUnsafe(`
        SELECT table_name FROM information_schema.tables
        WHERE table_schema = 'public'
          AND (table_name ILIKE '%GoogleOAuth%' OR table_name ILIKE '%OAuthToken%'
               OR table_name ILIKE '%GoogleConnection%' OR table_name = 'GoogleAccount')
        ORDER BY 1
      `);
      const cols = await prisma.$queryRawUnsafe(`
        SELECT table_name, column_name, data_type
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND column_name ILIKE '%oauth%'
        ORDER BY 1, 2
      `);
      console.log(JSON.stringify({ enums, tables, oauthishColumns: cols }, null, 2));
      return;
    }

    if (cmd === "phase1-objects") {
      const focal = await prisma.$queryRawUnsafe(`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'OwnedMediaAsset'
          AND column_name IN ('focalX', 'focalY')
        ORDER BY 1
      `);
      const placement = await prisma.$queryRawUnsafe(`
        SELECT table_name FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = 'PublicMediaPlacement'
      `);
      const kind = await prisma.$queryRawUnsafe(`
        SELECT t.typname FROM pg_type t
        JOIN pg_namespace n ON n.oid = t.typnamespace
        WHERE n.nspname = 'public' AND t.typname = 'PublicMediaPlacementKind'
      `);
      const openFail = await prisma.$queryRawUnsafe(`
        SELECT COUNT(*)::int AS open_failed
        FROM _prisma_migrations
        WHERE finished_at IS NULL AND rolled_back_at IS NULL
      `);
      console.log(JSON.stringify({ focal, placement, kind, openFail }, null, 2));
      return;
    }

    console.error("Unknown command", cmd);
    process.exit(2);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
