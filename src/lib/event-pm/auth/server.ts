import "server-only";

import { randomUUID } from "node:crypto";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { KELLY_SOS_TENANT_ID } from "@/lib/campaign-tenancy/single-campaign-mode";
import { createClient } from "@/utils/supabase/server";
import { assertActorPermission, permissionsForRole, type Permission } from "./permissions";
import type { CampaignRole, CurrentActor, MembershipStatus } from "./types";
import { EventPmAuthError } from "./types";

export const EVENT_PM_CAMPAIGN_KEY = KELLY_SOS_TENANT_ID;

type ActorRow = {
  userId: string;
  email: string;
  displayName: string | null;
  authUserId: string | null;
  membershipId: string;
  campaignKey: string;
  role: CampaignRole;
  status: MembershipStatus;
};

type Tx = Prisma.TransactionClient;

async function loadByAuthUserId(tx: Tx, authUserId: string): Promise<ActorRow | null> {
  const rows = await tx.$queryRaw<ActorRow[]>(Prisma.sql`
    SELECT
      u."id" AS "userId",
      u."email" AS "email",
      u."name" AS "displayName",
      u."supabaseUserId" AS "authUserId",
      m."id" AS "membershipId",
      m."tenantId" AS "campaignKey",
      m."role"::text AS "role",
      m."status"::text AS "status"
    FROM "User" u
    JOIN "CampaignMembership" m ON m."userId" = u."id"
    WHERE u."supabaseUserId" = ${authUserId}
      AND m."tenantId" = ${EVENT_PM_CAMPAIGN_KEY}
    LIMIT 1
  `);
  return rows[0] ?? null;
}

async function bindVerifiedEmailIdentity(tx: Tx, authUserId: string, email: string): Promise<ActorRow | null> {
  const candidates = await tx.$queryRaw<ActorRow[]>(Prisma.sql`
    SELECT
      u."id" AS "userId",
      u."email" AS "email",
      u."name" AS "displayName",
      u."supabaseUserId" AS "authUserId",
      m."id" AS "membershipId",
      m."tenantId" AS "campaignKey",
      m."role"::text AS "role",
      m."status"::text AS "status"
    FROM "User" u
    JOIN "CampaignMembership" m ON m."userId" = u."id"
    WHERE lower(u."email") = lower(${email})
      AND m."tenantId" = ${EVENT_PM_CAMPAIGN_KEY}
    LIMIT 1
  `);
  const candidate = candidates[0];
  if (!candidate) return null;

  if (candidate.authUserId && candidate.authUserId !== authUserId) {
    throw new EventPmAuthError(403, "identity_conflict", "This campaign account is already linked to another authenticated identity.");
  }

  await tx.$executeRaw(Prisma.sql`
    UPDATE "User"
    SET "supabaseUserId" = ${authUserId}, "updatedAt" = CURRENT_TIMESTAMP
    WHERE "id" = ${candidate.userId}
      AND ("supabaseUserId" IS NULL OR "supabaseUserId" = ${authUserId})
  `);

  return { ...candidate, authUserId };
}

export async function resolveCurrentActor(): Promise<CurrentActor> {
  let authUser: { id: string; email?: string | null } | null = null;
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.getUser();
    if (error) throw new EventPmAuthError(401, "invalid_session", "The authentication session is invalid or expired.");
    authUser = data.user;
  } catch (error) {
    if (error instanceof EventPmAuthError) throw error;
    throw new EventPmAuthError(503, "auth_unavailable", "Authentication is not configured or temporarily unavailable.");
  }

  if (!authUser) throw new EventPmAuthError(401, "not_authenticated", "Authentication is required.");
  const email = authUser.email?.trim();
  if (!email) throw new EventPmAuthError(403, "email_required", "A verified email address is required for campaign access.");

  let row: ActorRow | null;
  try {
    row = await prisma.$transaction(async (tx) => {
      const existing = await loadByAuthUserId(tx, authUser!.id);
      if (existing) return existing;
      return bindVerifiedEmailIdentity(tx, authUser!.id, email);
    });
  } catch (error) {
    if (error instanceof EventPmAuthError) throw error;
    throw new EventPmAuthError(503, "authorization_store_unavailable", "Campaign authorization data is temporarily unavailable.");
  }

  if (!row) throw new EventPmAuthError(403, "not_a_campaign_member", "This account is not authorized for campaign operations.");

  return {
    userId: row.userId,
    authUserId: authUser.id,
    email: row.email,
    displayName: row.displayName,
    campaignKey: row.campaignKey,
    membershipId: row.membershipId,
    role: row.role,
    status: row.status,
    permissions: permissionsForRole(row.role),
  };
}

export async function requireEventPmPermission(permission: Permission): Promise<CurrentActor> {
  const actor = await resolveCurrentActor();
  assertActorPermission(actor, permission);
  return actor;
}

export async function logEventPmAudit(
  actor: CurrentActor,
  input: { action: string; entityType: string; entityId?: string | null; metadata?: Record<string, unknown> },
): Promise<string> {
  const id = randomUUID();
  const metadata = JSON.stringify(input.metadata ?? {});
  await prisma.$executeRaw(Prisma.sql`
    INSERT INTO "EventPmAuditLog" (
      "id", "tenantId", "actorUserId", "action", "entityType", "entityId", "metadataJson", "createdAt"
    ) VALUES (
      ${id}, ${actor.campaignKey}, ${actor.userId}, ${input.action}, ${input.entityType}, ${input.entityId ?? null}, CAST(${metadata} AS jsonb), CURRENT_TIMESTAMP
    )
  `);
  return id;
}

export function authErrorResponse(error: unknown): Response {
  if (error instanceof EventPmAuthError) {
    return Response.json({ error: error.code, message: error.message }, { status: error.status });
  }
  return Response.json({ error: "internal_error", message: "Unable to authorize this request." }, { status: 500 });
}
