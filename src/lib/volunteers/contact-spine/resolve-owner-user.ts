import { prisma } from "@/lib/db";
import { getVolunteerLeaderByInitials, getVolunteerLeaderBySlug } from "@/lib/volunteers/leader-roster";
import type { VolunteerLeader } from "@/lib/volunteers/types";

const PROXY_EMAIL_DOMAIN = "contact-spine.reddirt.local";

/** Resolve a User id that owns RelationalContact rows for this leader. */
export async function resolveLeaderOwnerUserId(leader: VolunteerLeader): Promise<string> {
  const op = await prisma.electionPlanOperator.findFirst({
    where: { initials: leader.initials.toUpperCase(), active: true },
    select: { email: true },
  });
  if (op?.email?.trim()) {
    const byEmail = await prisma.user.findUnique({
      where: { email: op.email.trim().toLowerCase() },
      select: { id: true },
    });
    if (byEmail) return byEmail.id;
  }

  const envFallback = process.env.CONTACT_SPINE_PROXY_OWNER_USER_ID?.trim();
  if (envFallback) {
    const exists = await prisma.user.findUnique({ where: { id: envFallback }, select: { id: true } });
    if (exists) return exists.id;
  }

  return ensureLeaderProxyUser(leader);
}

export async function resolveLeaderOwnerUserIdBySlug(leaderSlug: string): Promise<string | null> {
  const leader = getVolunteerLeaderBySlug(leaderSlug);
  if (!leader) return null;
  return resolveLeaderOwnerUserId(leader);
}

export async function resolveLeaderOwnerUserIdByInitials(initials: string): Promise<string | null> {
  const leader = getVolunteerLeaderByInitials(initials);
  if (!leader) return null;
  return resolveLeaderOwnerUserId(leader);
}

/** Synthetic User per leader — CRM owner until real auth is linked. Idempotent. */
export async function ensureLeaderProxyUser(leader: VolunteerLeader): Promise<string> {
  const email = `leader+${leader.slug}@${PROXY_EMAIL_DOMAIN}`.toLowerCase();
  const user = await prisma.user.upsert({
    where: { email },
    create: {
      email,
      name: leader.displayName,
      county: leader.connections.find((c) => c.kind === "county")?.county ?? undefined,
    },
    update: {
      name: leader.displayName,
    },
    select: { id: true },
  });
  return user.id;
}

export async function resolveCountyIdFromSlug(countySlug: string | null | undefined): Promise<string | null> {
  const slug = countySlug?.trim().toLowerCase();
  if (!slug) return null;
  const county = await prisma.county.findFirst({
    where: { slug },
    select: { id: true },
  });
  return county?.id ?? null;
}
