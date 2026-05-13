const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const tables = [
  "User",
  "VolunteerProfile",
  "County",
  "CampaignEvent",
  "CalendarSource",
  "ContactPreference",
  "StaffGmailAccount",
  "EmailContactProfile",
  "RelationalContact",
  "VoterRecord",
  "EmailContactImportBatch",
  "EmailSendExecution",
  "ExternalIngestRun",
];

const migrations = [
  "00000000000000_existing_supabase_legacy_baseline",
  "20260421120000_init",
  "20260422120000_comms_tier1_contact_preferences",
  "20260423120000_tier25_webhooks_gmail",
  "20260505203000_email_contact_profile_graph",
  "20260507180000_email_contact_import_staging",
  "20260510140000_email_send_execution",
  "20260516143000_communication_intelligence_ingest",
];

async function tableExists(name) {
  const rows = await prisma.$queryRawUnsafe(
    `SELECT EXISTS (
      SELECT 1
      FROM information_schema.tables
      WHERE table_schema = 'public'
        AND table_name = $1
    ) AS ok`,
    name
  );
  return rows[0]?.ok === true;
}

async function main() {
  console.log("\n=== TABLE CHECK ===");
  for (const t of tables) {
    console.log(`${(await tableExists(t)) ? "YES" : "NO "}  public."${t}"`);
  }

  console.log("\n=== MIGRATION CHECK ===");
  const rows = await prisma.$queryRawUnsafe(
    `SELECT migration_name, started_at, finished_at, rolled_back_at, applied_steps_count, logs
     FROM public._prisma_migrations
     WHERE migration_name = ANY($1)
     ORDER BY migration_name`,
    migrations
  );

  for (const row of rows) {
    console.log("\n" + row.migration_name);
    console.log("  started_at:", row.started_at);
    console.log("  finished_at:", row.finished_at);
    console.log("  rolled_back_at:", row.rolled_back_at);
    console.log("  applied_steps_count:", row.applied_steps_count);
    if (row.logs) console.log("  logs:", String(row.logs).slice(0, 500));
  }

  console.log("\n=== PUBLIC TABLE SAMPLE ===");
  const live = await prisma.$queryRawUnsafe(
    `SELECT table_name
     FROM information_schema.tables
     WHERE table_schema = 'public'
     ORDER BY table_name
     LIMIT 80`
  );
  for (const r of live) console.log("  " + r.table_name);
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
