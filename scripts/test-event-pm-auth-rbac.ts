import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { Prisma } from "@prisma/client";
import { prisma } from "../src/lib/db";
import { assertActorPermission, assertActiveMembership, PERMISSIONS, permissionsForRole } from "../src/lib/event-pm/auth/permissions";
import type { CurrentActor } from "../src/lib/event-pm/auth/types";
import { EventPmAuthError } from "../src/lib/event-pm/auth/types";

function expectAuthError(fn: () => void, status: number, code: string) {
  assert.throws(fn, (error: unknown) => error instanceof EventPmAuthError && error.status === status && error.code === code);
}

function actor(role: CurrentActor["role"], status: CurrentActor["status"] = "ACTIVE"): CurrentActor {
  return {
    userId: "test-user",
    authUserId: "auth-user",
    email: "test@example.com",
    displayName: "Test",
    campaignKey: "test-tenant",
    membershipId: "membership",
    role,
    status,
    permissions: permissionsForRole(role),
  };
}

async function main() {
  assert(permissionsForRole("OWNER").includes(PERMISSIONS.ROLE_MANAGE));
  assert(permissionsForRole("CAMPAIGN_MANAGER").includes(PERMISSIONS.EVENT_PROJECT_UPDATE));
  assert(!permissionsForRole("VIEWER").includes(PERMISSIONS.EVENT_UPDATE));
  assert(!permissionsForRole("VOLUNTEER").includes(PERMISSIONS.EVENT_VIEW_ALL));
  expectAuthError(() => assertActorPermission(null, PERMISSIONS.EVENT_VIEW_ALL), 401, "not_authenticated");
  expectAuthError(() => assertActorPermission(actor("VIEWER"), PERMISSIONS.EVENT_UPDATE), 403, "permission_denied");
  expectAuthError(() => assertActorPermission(actor("VOLUNTEER"), PERMISSIONS.EVENT_VIEW_ALL), 403, "permission_denied");
  expectAuthError(() => assertActiveMembership("INVITED"), 403, "membership_pending");
  expectAuthError(() => assertActiveMembership("SUSPENDED"), 403, "membership_suspended");
  expectAuthError(() => assertActiveMembership("DISABLED"), 403, "membership_disabled");
  assertActorPermission(actor("CAMPAIGN_MANAGER"), PERMISSIONS.EVENT_PROJECT_UPDATE);

  const suffix = randomUUID().slice(0, 8);
  const tenantId = `p0s5-${suffix}`;
  const userA = await prisma.user.create({ data: { email: `p0s5-a-${suffix}@example.invalid`, name: "P0 S5 A" } });
  const userB = await prisma.user.create({ data: { email: `p0s5-b-${suffix}@example.invalid`, name: "P0 S5 B" } });

  try {
    await prisma.$executeRaw(Prisma.sql`
      INSERT INTO "CampaignTenant" ("id", "slug", "displayName", "archetype", "isActive", "createdAt", "updatedAt")
      VALUES (${tenantId}, ${tenantId}, 'P0-S5 Test Tenant', 'CANDIDATE_CAMPAIGN'::"CampaignArchetype", true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `);

    await prisma.$executeRaw(Prisma.sql`UPDATE "User" SET "supabaseUserId" = ${`supabase-${suffix}`} WHERE "id" = ${userA.id}`);
    await assert.rejects(() => prisma.$executeRaw(Prisma.sql`UPDATE "User" SET "supabaseUserId" = ${`supabase-${suffix}`} WHERE "id" = ${userB.id}`));

    await prisma.$executeRaw(Prisma.sql`
      INSERT INTO "CampaignMembership" ("id", "tenantId", "userId", "role", "status", "createdAt", "updatedAt")
      VALUES (${randomUUID()}, ${tenantId}, ${userA.id}, 'CAMPAIGN_MANAGER'::"CampaignTenantRole", 'ACTIVE'::"CampaignMembershipStatus", CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `);
    await assert.rejects(() => prisma.$executeRaw(Prisma.sql`
      INSERT INTO "CampaignMembership" ("id", "tenantId", "userId", "role", "status", "createdAt", "updatedAt")
      VALUES (${randomUUID()}, ${tenantId}, ${userA.id}, 'VIEWER'::"CampaignTenantRole", 'ACTIVE'::"CampaignMembershipStatus", CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `));

    const auditId = randomUUID();
    await prisma.$executeRaw(Prisma.sql`
      INSERT INTO "EventPmAuditLog" ("id", "tenantId", "actorUserId", "action", "entityType", "metadataJson", "createdAt")
      VALUES (${auditId}, ${tenantId}, ${userA.id}, 'p0_s5.test', 'auth_test', '{}'::jsonb, CURRENT_TIMESTAMP)
    `);
    const audit = await prisma.$queryRaw<Array<{ actorUserId: string | null }>>(Prisma.sql`SELECT "actorUserId" FROM "EventPmAuditLog" WHERE "id" = ${auditId}`);
    assert.equal(audit[0]?.actorUserId, userA.id);
    console.log("P0-S5 auth/RBAC integrity: PASS");
  } finally {
    await prisma.$executeRaw(Prisma.sql`DELETE FROM "EventPmAuditLog" WHERE "tenantId" = ${tenantId}`);
    await prisma.$executeRaw(Prisma.sql`DELETE FROM "CampaignMembership" WHERE "tenantId" = ${tenantId}`);
    await prisma.$executeRaw(Prisma.sql`DELETE FROM "CampaignTenant" WHERE "id" = ${tenantId}`);
    await prisma.user.deleteMany({ where: { id: { in: [userA.id, userB.id] } } });
  }
}

main().catch((error) => { console.error(error); process.exitCode = 1; }).finally(async () => prisma.$disconnect());
