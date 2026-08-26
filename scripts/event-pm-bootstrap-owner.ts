import { randomUUID } from "node:crypto";
import { Prisma } from "@prisma/client";
import { prisma } from "../src/lib/db";

const email = process.argv[2]?.trim().toLowerCase();
const supabaseUserId = process.argv[3]?.trim() || null;

if (!email) {
  console.error("Usage: npx tsx scripts/event-pm-bootstrap-owner.ts owner@example.com [supabase-user-uuid]");
  process.exit(2);
}

async function main() {
  const user = await prisma.user.findUnique({ where: { email }, select: { id: true, email: true } });
  if (!user) throw new Error(`No canonical User row exists for ${email}. Create/verify the campaign user first.`);

  if (supabaseUserId) {
    await prisma.$executeRaw(Prisma.sql`
      UPDATE "User"
      SET "supabaseUserId" = ${supabaseUserId}, "updatedAt" = CURRENT_TIMESTAMP
      WHERE "id" = ${user.id}
        AND ("supabaseUserId" IS NULL OR "supabaseUserId" = ${supabaseUserId})
    `);
  }

  await prisma.$executeRaw(Prisma.sql`
    INSERT INTO "CampaignMembership" (
      "id", "userId", "campaignKey", "role", "status", "invitedAt", "acceptedAt", "createdAt", "updatedAt"
    ) VALUES (
      ${randomUUID()}, ${user.id}, 'kelly-grappe-sos', 'OWNER'::"CampaignAccessRole", 'ACTIVE'::"CampaignMembershipStatus",
      CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    )
    ON CONFLICT ("userId", "campaignKey") DO UPDATE SET
      "role" = 'OWNER'::"CampaignAccessRole",
      "status" = 'ACTIVE'::"CampaignMembershipStatus",
      "acceptedAt" = COALESCE("CampaignMembership"."acceptedAt", CURRENT_TIMESTAMP),
      "updatedAt" = CURRENT_TIMESTAMP
  `);

  console.log(`OWNER membership ready for ${user.email}.`);
}

main()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
