import { randomUUID } from "node:crypto";
import { Prisma } from "@prisma/client";
import { prisma } from "../src/lib/db";
import { KELLY_SOS_DISPLAY_NAME, KELLY_SOS_TENANT_ID } from "../src/lib/campaign-tenancy/single-campaign-mode";

const email = process.argv[2]?.trim().toLowerCase();
const supabaseUserId = process.argv[3]?.trim() || null;

if (!email) {
  console.error("Usage: npx tsx scripts/event-pm-bootstrap-owner.ts owner@example.com [supabase-user-uuid]");
  process.exit(2);
}

async function main() {
  const user = await prisma.user.findUnique({ where: { email }, select: { id: true, email: true } });
  if (!user) throw new Error(`No canonical User row exists for ${email}. Create/verify the campaign user first.`);

  await prisma.$executeRaw(Prisma.sql`
    INSERT INTO "CampaignTenant" (
      "id", "slug", "displayName", "archetype", "electionType", "geography", "isActive", "createdAt", "updatedAt"
    ) VALUES (
      ${KELLY_SOS_TENANT_ID}, 'kelly-grappe-sos-2026', ${KELLY_SOS_DISPLAY_NAME}, 'CANDIDATE_CAMPAIGN'::"CampaignArchetype",
      'Arkansas Secretary of State 2026', 'Arkansas', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    )
    ON CONFLICT ("id") DO UPDATE SET "isActive" = true, "updatedAt" = CURRENT_TIMESTAMP
  `);

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
      "id", "tenantId", "userId", "role", "status", "invitedAt", "acceptedAt", "createdAt", "updatedAt"
    ) VALUES (
      ${randomUUID()}, ${KELLY_SOS_TENANT_ID}, ${user.id}, 'OWNER'::"CampaignTenantRole", 'ACTIVE'::"CampaignMembershipStatus",
      CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    )
    ON CONFLICT ("tenantId", "userId") DO UPDATE SET
      "role" = 'OWNER'::"CampaignTenantRole",
      "status" = 'ACTIVE'::"CampaignMembershipStatus",
      "acceptedAt" = COALESCE("CampaignMembership"."acceptedAt", CURRENT_TIMESTAMP),
      "updatedAt" = CURRENT_TIMESTAMP
  `);

  console.log(`OWNER membership ready for ${user.email} in ${KELLY_SOS_TENANT_ID}.`);
}

main()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
