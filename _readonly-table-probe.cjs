const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  const identity = await prisma.$queryRawUnsafe(`
    SELECT
      current_database() AS database,
      current_user AS user,
      current_schema() AS current_schema
  `);

  const tables = await prisma.$queryRawUnsafe(`
    SELECT table_schema, table_name
    FROM information_schema.tables
    WHERE table_type = 'BASE TABLE'
      AND table_schema IN ('public', 'auth')
    ORDER BY table_schema, table_name
  `);

  console.log("IDENTITY");
  console.table(identity);

  console.log("TABLE COUNTS");
  const counts = tables.reduce((acc, row) => {
    acc[row.table_schema] = (acc[row.table_schema] || 0) + 1;
    return acc;
  }, {});
  console.table(counts);

  console.log("PUBLIC CAMPAIGN TABLE MATCHES");
  const wanted = /ar02_voters|contacts|counties|event_requests|message_audiences|path_to_victory|people|person_profiles/i;
  console.table(tables.filter((row) => row.table_schema === "public" && wanted.test(row.table_name)));

  console.log("FIRST 80 PUBLIC TABLES");
  console.table(tables.filter((row) => row.table_schema === "public").slice(0, 80));
}

main()
  .catch((error) => {
    console.error("READ_ONLY_PROBE_FAILED");
    console.error(error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
