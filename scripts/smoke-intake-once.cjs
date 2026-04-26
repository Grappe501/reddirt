/**
 * One-off: list latest WorkflowIntake after a form smoke test.
 * Usage: node scripts/smoke-intake-once.cjs
 */
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
async function main() {
  const row = await prisma.workflowIntake.findFirst({
    orderBy: { createdAt: "desc" },
    select: { id: true, status: true, title: true, source: true, createdAt: true, metadata: true },
  });
  console.log(JSON.stringify(row, null, 2));
  await prisma.$disconnect();
}
main().catch((e) => {
  console.error(e);
  process.exit(1);
});
