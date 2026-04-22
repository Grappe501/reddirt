import { type CommunicationChannel, CommunicationCampaignChannel, type Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { normalizeUsPhone } from "./phone";
import { canSendEmail, canSendSms, getEffectivePreferenceByIdentity } from "./preferences";
import { type AudienceDefinition, pickRecipientChannel } from "./audience-definition";

export type ResolvedAudienceRow = {
  userId: string | null;
  volunteerProfileId: string | null;
  email: string | null;
  phone: string | null;
  countyId: string | null;
  threadId: string | null;
  channel: CommunicationChannel;
  dedupeKey: string;
  suppressed: boolean;
  suppressionReason: string | null;
};

const prefParam = { userId: null as string | null, volunteerProfileId: null as string | null };

function dedupeKeyOf(r: { userId: string | null; email: string | null; phone: string | null }): string {
  if (r.userId) return `u:${r.userId}`;
  const e = r.email?.trim().toLowerCase();
  if (e) return `e:${e}`;
  const p = r.phone ? normalizeUsPhone(r.phone) : null;
  if (p) return `p:${p}`;
  return `n:${Date.now()}-${Math.random()}`;
}

async function getThreadIdForUser(userId: string): Promise<string | null> {
  const t = await prisma.communicationThread.findFirst({
    where: { userId },
    select: { id: true },
    orderBy: { updatedAt: "desc" },
  });
  return t?.id ?? null;
}

/** Whether user appears to belong to the selected counties. */
async function userMatchesCounties(
  u: { id: string; county: string | null; teamRoleAssignments: { countyId: string | null }[] },
  countyIds: string[]
): Promise<boolean> {
  if (u.teamRoleAssignments.some((a) => a.countyId && countyIds.includes(a.countyId))) {
    return true;
  }
  if (u.county) {
    const c = await prisma.county.findFirst({
      where: {
        id: { in: countyIds },
        OR: [
          { displayName: { equals: u.county, mode: "insensitive" } },
          { slug: { equals: u.county.toLowerCase().replace(/\s+/g, "-"), mode: "insensitive" } },
        ],
      },
    });
    if (c) return true;
  }
  const th = await prisma.communicationThread.findFirst({
    where: { userId: u.id, countyId: { in: countyIds } },
  });
  return Boolean(th);
}

/**
 * Resolves a preview list with dedupe, eligibility, and (optional) contact-preference gates.
 */
export async function resolveAudience(
  def: AudienceDefinition,
  channel: CommunicationCampaignChannel
): Promise<{
  rows: ResolvedAudienceRow[];
  rawCount: number;
  afterDedupe: number;
  suppressedCount: number;
}> {
  const out: ResolvedAudienceRow[] = [];
  const applyPref = def.applyPreferenceSuppression !== false;
  const exclude = new Set((def.excludeUserIds ?? []).filter(Boolean));

  if (def.eventIdForSignups) {
    const signups = await prisma.eventSignup.findMany({
      where: {
        eventId: def.eventIdForSignups,
        status: { in: ["REGISTERED", "CONFIRMED", "ATTENDED"] },
      },
    });
    for (const s of signups) {
      const email = s.email?.trim() || null;
      const phone = normalizeUsPhone(s.mobilePhone);
      const userId = s.userId ?? null;
      const volunteerProfileId = s.volunteerProfileId ?? null;
      if (userId && exclude.has(userId)) continue;
      if (def.requireLeadership && !volunteerProfileId) continue;
      if (def.requireEmail && !email) continue;
      if (def.requirePhone && !phone) continue;
      if (def.countyIds?.length) {
        if (!s.countyId || !def.countyIds.includes(s.countyId)) continue;
      }
      const ch = pickRecipientChannel(Boolean(email), Boolean(phone), channel);
      if (!ch) continue;
      if (def.emailEligible && ch === "EMAIL" && !email) continue;
      if (def.smsEligible && ch === "SMS" && !phone) continue;
      const dkey = dedupeKeyOf({ userId, email, phone: phone || null });
      const threadId = userId ? await getThreadIdForUser(userId) : null;
      if (applyPref) {
        prefParam.userId = userId;
        prefParam.volunteerProfileId = volunteerProfileId;
        const pref = await getEffectivePreferenceByIdentity(prefParam);
        const g = ch === "EMAIL" ? canSendEmail(pref) : canSendSms(pref);
        const suppressed = !g.ok;
        out.push({
          userId,
          volunteerProfileId,
          email,
          phone: phone || null,
          countyId: s.countyId,
          threadId,
          channel: ch,
          dedupeKey: dkey,
          suppressed: Boolean(suppressed),
          suppressionReason: suppressed ? (g as { ok: false; reason: string }).reason : null,
        });
        continue;
      }
      out.push({
        userId,
        volunteerProfileId,
        email,
        phone: phone || null,
        countyId: s.countyId,
        threadId,
        channel: ch,
        dedupeKey: dkey,
        suppressed: false,
        suppressionReason: null,
      });
    }
  } else {
    const where: Prisma.UserWhereInput = {};
    if (def.requireEmail) {
      where.email = { not: "" };
    }
    const users = await prisma.user.findMany({
      where,
      include: {
        volunteerProfile: { select: { id: true, leadershipInterest: true } },
        teamRoleAssignments: { select: { countyId: true, roleKey: true } },
        commitments: def.commitmentTypes?.length
          ? { where: { type: { in: def.commitmentTypes } } }
          : { take: 0 },
      },
      take: 5000,
    });
    for (const u of users) {
      if (exclude.has(u.id)) continue;
      if (def.requirePhone && !normalizeUsPhone(u.phone)) continue;
      if (def.requireLeadership && !u.volunteerProfile?.leadershipInterest) continue;
      if (def.commitmentTypes?.length) {
        const n = await prisma.commitment.count({
          where: { userId: u.id, type: { in: def.commitmentTypes } },
        });
        if (n === 0) continue;
      }
      if (def.teamRoleKeys?.length) {
        if (!u.teamRoleAssignments.some((a) => def.teamRoleKeys!.includes(a.roleKey))) continue;
      }
      if (def.countyIds?.length) {
        const okC = await userMatchesCounties(
          { id: u.id, county: u.county, teamRoleAssignments: u.teamRoleAssignments },
          def.countyIds
        );
        if (!okC) continue;
      }
      if (def.tagKeys?.length) {
        const tagged = await prisma.communicationThread.findFirst({
          where: {
            userId: u.id,
            tagAssignments: { some: { tag: { key: { in: def.tagKeys } } } },
          },
          select: { id: true },
        });
        if (!tagged) continue;
      }
      const email = u.email?.trim() || null;
      const phone = normalizeUsPhone(u.phone);
      if (def.requireEmail && !email) continue;
      if (def.requirePhone && !phone) continue;
      const ch = pickRecipientChannel(Boolean(email), Boolean(phone), channel);
      if (!ch) continue;
      if (def.lastContactedAfter || def.lastContactedBefore) {
        const thread = await prisma.communicationThread.findFirst({
          where: { userId: u.id, lastTouchedAt: { not: null } },
          orderBy: { lastTouchedAt: "desc" },
        });
        if (!thread?.lastTouchedAt) continue;
        if (def.lastContactedAfter && thread.lastTouchedAt < new Date(def.lastContactedAfter)) continue;
        if (def.lastContactedBefore && thread.lastTouchedAt > new Date(def.lastContactedBefore)) continue;
      }
      const volunteerProfileId = u.volunteerProfile?.id ?? null;
      const threadId = def.tagKeys?.length
        ? (await prisma.communicationThread.findFirst({
            where: {
              userId: u.id,
              tagAssignments: { some: { tag: { key: { in: def.tagKeys } } } },
            },
            orderBy: { updatedAt: "desc" },
            select: { id: true },
          }))?.id ?? null
        : await getThreadIdForUser(u.id);
      const dkey = dedupeKeyOf({ userId: u.id, email, phone });
      const countyId =
        u.teamRoleAssignments.find((a) => a.countyId && def.countyIds?.includes(a.countyId))?.countyId ?? null;
      if (applyPref) {
        prefParam.userId = u.id;
        prefParam.volunteerProfileId = volunteerProfileId;
        const pref = await getEffectivePreferenceByIdentity(prefParam);
        const g = ch === "EMAIL" ? canSendEmail(pref) : canSendSms(pref);
        const suppressed = !g.ok;
        out.push({
          userId: u.id,
          volunteerProfileId,
          email,
          phone: phone || null,
          countyId,
          threadId,
          channel: ch,
          dedupeKey: dkey,
          suppressed: Boolean(suppressed),
          suppressionReason: suppressed ? (g as { ok: false; reason: string }).reason : null,
        });
        continue;
      }
      out.push({
        userId: u.id,
        volunteerProfileId,
        email,
        phone: phone || null,
        countyId,
        threadId,
        channel: ch,
        dedupeKey: dkey,
        suppressed: false,
        suppressionReason: null,
      });
    }
  }

  const seen = new Set<string>();
  const deduped: ResolvedAudienceRow[] = [];
  for (const r of out) {
    if (seen.has(r.dedupeKey)) continue;
    seen.add(r.dedupeKey);
    deduped.push(r);
  }

  const suppressedCount = deduped.filter((x) => x.suppressed).length;
  return {
    rows: deduped,
    rawCount: out.length,
    afterDedupe: deduped.length,
    suppressedCount,
  };
}
