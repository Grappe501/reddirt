import { prisma } from "@/lib/db";

/**
 * When `ADMIN_ACTOR_USER_EMAIL` matches a `User` row, calendar / comms server actions
 * can attribute `actorUserId`, `approvedByUserId`, and queue `createdByUserId`.
 */
export async function getAdminActorUserId(): Promise<string | null> {
  const raw = process.env.ADMIN_ACTOR_USER_EMAIL?.trim();
  if (!raw) return null;
  const u = await prisma.user.findUnique({ where: { email: raw }, select: { id: true } });
  return u?.id ?? null;
}
