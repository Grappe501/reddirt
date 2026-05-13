const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const migrationName = "20260516143000_communication_intelligence_ingest";

const enums = [
  "ExternalIngestSource",
  "ExternalIngestRunStatus",
  "ExternalIngestRunMode",
  "GmailMessageParticipantRole",
  "CommunicationIdentityReviewStatus",
  "CommunicationIdentitySignalSource",
  "CommunicationMatchTargetType",
  "CommunicationMatchCandidateStatus",
  "GoogleContactSourceKind",
  "GoogleCalendarEventParticipantRole",
];

const tables = [
  "ExternalIngestRun",
  "CommunicationIdentity",
  "GmailMessageRecord",
  "GmailMessageParticipant",
  "GoogleContactRecord",
  "GoogleCalendarEventRecord",
  "GoogleCalendarEventParticipant",
  "CommunicationIdentitySignal",
  "CommunicationProfileMatchCandidate",
];

const indexes = [
  "CommunicationIdentity_normalizedEmail_key",
  "GmailMessageRecord_staffUserId_googleMessageId_key",
  "GoogleContactRecord_googleResourceName_key",
  "GoogleCalendarEventRecord_calendarSourceId_googleEventId_key",
  "ExternalIngestRun_source_status_createdAt_idx",
  "ExternalIngestRun_staffUserId_idx",
  "GmailMessageRecord_ingestRunId_idx",
  "GmailMessageRecord_staffUserId_internalDate_idx",
  "GmailMessageParticipant_normalizedEmail_idx",
  "GmailMessageParticipant_gmailMessageRecordId_idx",
  "GoogleContactRecord_primaryEmail_idx",
  "GoogleContactRecord_ingestRunId_idx",
  "GoogleCalendarEventRecord_startAt_idx",
  "GoogleCalendarEventRecord_ingestRunId_idx",
  "GoogleCalendarEventParticipant_normalizedEmail_idx",
  "GoogleCalendarEventParticipant_googleCalendarEventRecordId_idx",
  "CommunicationIdentity_reviewStatus_idx",
  "CommunicationIdentitySignal_communicationIdentityId_idx",
  "CommunicationProfileMatchCandidate_communicationIdentityId_status_idx",
];

const constraints = [
  "ExternalIngestRun_staffUserId_fkey",
  "ExternalIngestRun_requestedByUserId_fkey",
  "CommunicationIdentity_emailContactProfileId_fkey",
  "CommunicationIdentity_relationalContactId_fkey",
  "CommunicationIdentity_voterRecordId_fkey",
  "GmailMessageRecord_staffUserId_fkey",
  "GmailMessageRecord_ingestRunId_fkey",
  "GmailMessageParticipant_gmailMessageRecordId_fkey",
  "GmailMessageParticipant_emailContactProfileId_fkey",
  "GmailMessageParticipant_communicationIdentityId_fkey",
  "GoogleContactRecord_ingestRunId_fkey",
  "GoogleContactRecord_communicationIdentityId_fkey",
  "GoogleContactRecord_emailContactProfileId_fkey",
  "GoogleCalendarEventRecord_calendarSourceId_fkey",
  "GoogleCalendarEventRecord_ingestRunId_fkey",
  "GoogleCalendarEventRecord_campaignEventId_fkey",
  "GoogleCalendarEventParticipant_googleCalendarEventRecordId_fkey",
  "GoogleCalendarEventParticipant_communicationIdentityId_fkey",
  "GoogleCalendarEventParticipant_emailContactProfileId_fkey",
  "CommunicationIdentitySignal_communicationIdentityId_fkey",
  "CommunicationProfileMatchCandidate_communicationIdentityId_fkey",
  "CommunicationProfileMatchCandidate_reviewedByUserId_fkey",
];

async function existsEnum(name) {
  const rows = await prisma.$queryRawUnsafe(
    `SELECT EXISTS (
      SELECT 1
      FROM pg_type t
      JOIN pg_namespace n ON n.oid = t.typnamespace
      WHERE n.nspname = 'public'
        AND t.typtype = 'e'
        AND t.typname = $1
    ) AS ok`,
    name
  );
  return rows[0]?.ok === true;
}

async function existsTable(name) {
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

async function existsIndex(name) {
  const rows = await prisma.$queryRawUnsafe(
    `SELECT EXISTS (
      SELECT 1
      FROM pg_indexes
      WHERE schemaname = 'public'
        AND indexname = $1
    ) AS ok`,
    name
  );
  return rows[0]?.ok === true;
}

async function existsConstraint(name) {
  const rows = await prisma.$queryRawUnsafe(
    `SELECT EXISTS (
      SELECT 1
      FROM information_schema.table_constraints
      WHERE constraint_schema = 'public'
        AND constraint_name = $1
    ) AS ok`,
    name
  );
  return rows[0]?.ok === true;
}

async function main() {
  const migrationRows = await prisma.$queryRawUnsafe(
    `SELECT migration_name, started_at, finished_at, rolled_back_at, applied_steps_count, logs
     FROM public._prisma_migrations
     WHERE migration_name = $1`,
    migrationName
  );

  console.log("\n=== MIGRATION RECORD ===");
  console.dir(migrationRows, { depth: null });

  const enumResults = [];
  for (const name of enums) enumResults.push([name, await existsEnum(name)]);

  const tableResults = [];
  for (const name of tables) tableResults.push([name, await existsTable(name)]);

  const indexResults = [];
  for (const name of indexes) indexResults.push([name, await existsIndex(name)]);

  const constraintResults = [];
  for (const name of constraints) constraintResults.push([name, await existsConstraint(name)]);

  function print(title, rows) {
    console.log(`\n=== ${title} ===`);
    for (const [name, ok] of rows) {
      console.log(`${ok ? "YES" : "NO "}  ${name}`);
    }
  }

  print("ENUMS", enumResults);
  print("TABLES", tableResults);
  print("INDEXES", indexResults);
  print("CONSTRAINTS", constraintResults);

  const allRows = [...enumResults, ...tableResults, ...indexResults, ...constraintResults];
  const yes = allRows.filter(([, ok]) => ok).length;
  const no = allRows.length - yes;

  console.log("\n=== SUMMARY ===");
  console.log(`present=${yes}`);
  console.log(`missing=${no}`);
  console.log(`total=${allRows.length}`);

  if (yes === 0) {
    console.log("\nRECOMMENDATION: SAFE_TO_RESOLVE_ROLLED_BACK");
    console.log(`Next commands:`);
    console.log(`npx prisma migrate resolve --rolled-back "${migrationName}"`);
    console.log(`npx prisma migrate deploy`);
  } else if (no === 0) {
    console.log("\nRECOMMENDATION: SAFE_TO_RESOLVE_APPLIED");
    console.log(`Next command:`);
    console.log(`npx prisma migrate resolve --applied "${migrationName}"`);
  } else {
    console.log("\nRECOMMENDATION: PARTIAL_MANUAL_REPAIR_REQUIRED");
    console.log("Stop here. Do not resolve yet. Some objects exist and some are missing.");
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
