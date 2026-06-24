import { loadApril26GoodChangeRows } from "@/lib/compliance/approval/april26-source";
import { mapGoodChangeRowToContribution } from "@/lib/compliance/april26/parse-goodchange";
import type { GoodChangeRow } from "@/lib/compliance/april26/types";
import { communityWorkbenchHref } from "@/lib/election-plan/community-workbench/links";
import { leaderWorkbenchHref } from "@/lib/volunteers/build-leader-workbench-v2";
import {
  computeDirectCommissionCents,
  computeOverrideCommissionCents,
  getGrassrootsFundraisingCommissionConfig,
  listGrassrootsFundraisingCommissionLeaders,
  matchGrassrootsFundraisingAttribution,
  resolveGrassrootsFundraisingCommission,
  type GrassrootsFundraisingCommissionProfile,
  type GrassrootsFundraisingCommissionTier,
} from "@/lib/volunteers/grassroots-fundraising-commission";
import { getVolunteerLeaderRoster } from "@/lib/volunteers/leader-roster";
import type { VolunteerLeader } from "@/lib/volunteers/types";

import settlementFile from "../../../data/volunteers/grassroots-fundraising-settlement.source.json";

type SettlementSource = {
  internalOnly: boolean;
  legalBanner: string;
  downlineLinks: Array<{ fieldAttributionKey: string; uplineLeaderSlug: string }>;
  stagingGifts: Array<{
    id: string;
    attributionKey: string;
    grossCents: number;
    netCents: number;
    feeCents?: number;
    receivedAt: string;
    payoutId?: string | null;
    sourceLabel?: string;
    isExample?: boolean;
  }>;
};

const settlementSource = settlementFile as SettlementSource;

export type GrassrootsSettlementGiftRow = {
  id: string;
  attributionKey: string;
  leaderSlug: string | null;
  leaderName: string | null;
  tier: GrassrootsFundraisingCommissionTier | null;
  grossCents: number;
  netCents: number;
  feeCents: number;
  directPercent: number | null;
  directCommissionCents: number;
  uplineLeaderSlug: string | null;
  uplineLeaderName: string | null;
  uplineOverridePercent: number | null;
  uplineCommissionCents: number;
  receivedAt: string;
  payoutId: string | null;
  source: "goodchange" | "staging";
  matchStatus: "matched" | "unmatched" | "example";
};

export type GrassrootsCommissionLeadRow = {
  slug: string;
  displayName: string;
  initials: string;
  tier: GrassrootsFundraisingCommissionTier;
  directPercent: number;
  downlineOverridePercent: number | null;
  attributionKey: string;
  campusSlug: string | null;
  campusLabel: string | null;
  isOpenSlot: boolean;
  workbenchHref: string | null;
  leaderWorkbenchHref: string;
  trackedLinkHint: string;
};

export type GrassrootsSettlementRollupRow = {
  leaderSlug: string;
  displayName: string;
  initials: string;
  directGiftCount: number;
  directNetCents: number;
  directCommissionCents: number;
  overrideGiftCount: number;
  overrideNetCents: number;
  overrideCommissionCents: number;
  totalCommissionCents: number;
};

export type GrassrootsFundraisingSettlementPayload = {
  legalBanner: string;
  config: ReturnType<typeof getGrassrootsFundraisingCommissionConfig>;
  stats: {
    commissionLeads: number;
    openLeadSlots: number;
    attributedGifts: number;
    unmatchedGifts: number;
    totalNetCents: number;
    totalDirectCommissionCents: number;
    totalOverrideCommissionCents: number;
    goodChangeAvailable: boolean;
    stagingGiftCount: number;
  };
  commissionLeads: GrassrootsCommissionLeadRow[];
  gifts: GrassrootsSettlementGiftRow[];
  unmatchedGifts: GrassrootsSettlementGiftRow[];
  rollups: GrassrootsSettlementRollupRow[];
  weeklyRhythm: Array<{ id: string; label: string; description: string; href?: string }>;
};

function campusLabelFromSlug(slug: string | null | undefined): string | null {
  if (!slug) return null;
  const labels: Record<string, string> = {
    "university-of-central-arkansas": "UCA",
    "philander-smith": "Philander Smith",
    ualr: "UALR",
    "university-of-arkansas": "UA Fayetteville",
    "arkansas-state-university": "Arkansas State",
  };
  return labels[slug] ?? slug.replace(/-/g, " ");
}

function campusWorkbenchSlug(leader: VolunteerLeader): string | null {
  const program = leader.connections.find(
    (c): c is Extract<typeof c, { kind: "program" }> =>
      c.kind === "program" && c.programSlug.includes("campus"),
  );
  return program?.programSlug ?? null;
}

function buildCommissionLeadRows(leaders: VolunteerLeader[]): GrassrootsCommissionLeadRow[] {
  return listGrassrootsFundraisingCommissionLeaders(leaders).map(({ leader, profile, isOpenSlot }) => {
    const campusSlug = leader.campusLeadCampusSlug ?? null;
    const wbSlug = campusWorkbenchSlug(leader);
    return {
      slug: leader.slug,
      displayName: leader.displayName,
      initials: leader.initials,
      tier: profile.tier,
      directPercent: profile.directPercent,
      downlineOverridePercent: profile.downlineOverridePercent ?? null,
      attributionKey: profile.attributionKey,
      campusSlug,
      campusLabel: campusLabelFromSlug(campusSlug),
      isOpenSlot,
      workbenchHref: wbSlug ? communityWorkbenchHref(wbSlug) : null,
      leaderWorkbenchHref: leaderWorkbenchHref(leader.slug),
      trackedLinkHint: `Donate ref / QR code: ${profile.attributionKey}`,
    };
  });
}

function uplineForFieldGift(
  attributionKey: string,
  profile: GrassrootsFundraisingCommissionProfile,
  leader: VolunteerLeader,
  leaders: VolunteerLeader[],
): { slug: string; name: string; percent: number } | null {
  if (profile.tier === "grassroots_fundraising_lead") return null;

  const manual = settlementSource.downlineLinks.find(
    (link) => link.fieldAttributionKey.toLowerCase() === attributionKey.toLowerCase(),
  );
  if (manual) {
    const upline = leaders.find((l) => l.slug === manual.uplineLeaderSlug);
    const uplineProfile = upline ? resolveGrassrootsFundraisingCommission(upline) : null;
    if (upline && uplineProfile?.downlineOverridePercent) {
      return {
        slug: upline.slug,
        name: upline.displayName,
        percent: uplineProfile.downlineOverridePercent,
      };
    }
  }

  const campusSlug = leader.campusLeadCampusSlug;
  if (!campusSlug) return null;

  const coChair = leaders.find(
    (l) =>
      l.campusLeadCampusSlug === campusSlug &&
      l.slug !== leader.slug &&
      resolveGrassrootsFundraisingCommission(l).tier === "grassroots_fundraising_lead",
  );
  if (!coChair) return null;

  const coProfile = resolveGrassrootsFundraisingCommission(coChair);
  if (!coProfile.downlineOverridePercent) return null;

  return {
    slug: coChair.slug,
    name: coChair.displayName,
    percent: coProfile.downlineOverridePercent,
  };
}

function giftRowFromParts(
  parts: {
    id: string;
    attributionRaw: string;
    grossCents: number;
    netCents: number;
    feeCents: number;
    receivedAt: string;
    payoutId: string | null;
    source: "goodchange" | "staging";
    isExample?: boolean;
  },
  leaders: VolunteerLeader[],
): GrassrootsSettlementGiftRow {
  const match = matchGrassrootsFundraisingAttribution(parts.attributionRaw, leaders);
  const attributionKey = parts.attributionRaw.trim().toLowerCase() || "—";

  if (!match) {
    return {
      id: parts.id,
      attributionKey,
      leaderSlug: null,
      leaderName: null,
      tier: null,
      grossCents: parts.grossCents,
      netCents: parts.netCents,
      feeCents: parts.feeCents,
      directPercent: null,
      directCommissionCents: 0,
      uplineLeaderSlug: null,
      uplineLeaderName: null,
      uplineOverridePercent: null,
      uplineCommissionCents: 0,
      receivedAt: parts.receivedAt,
      payoutId: parts.payoutId,
      source: parts.source,
      matchStatus: parts.isExample ? "example" : "unmatched",
    };
  }

  const { leader, profile } = match;
  const directCommissionCents = computeDirectCommissionCents(parts.netCents, profile.directPercent);
  const upline = uplineForFieldGift(profile.attributionKey, profile, leader, leaders);
  const uplineCommissionCents = upline
    ? computeOverrideCommissionCents(parts.netCents, upline.percent)
    : 0;

  return {
    id: parts.id,
    attributionKey: profile.attributionKey,
    leaderSlug: leader.slug,
    leaderName: leader.displayName,
    tier: profile.tier,
    grossCents: parts.grossCents,
    netCents: parts.netCents,
    feeCents: parts.feeCents,
    directPercent: profile.directPercent,
    directCommissionCents,
    uplineLeaderSlug: upline?.slug ?? null,
    uplineLeaderName: upline?.name ?? null,
    uplineOverridePercent: upline?.percent ?? null,
    uplineCommissionCents,
    receivedAt: parts.receivedAt,
    payoutId: parts.payoutId,
    source: parts.source,
    matchStatus: parts.isExample ? "example" : "matched",
  };
}

async function loadGoodChangeGiftRows(leaders: VolunteerLeader[]): Promise<{
  rows: GrassrootsSettlementGiftRow[];
  available: boolean;
}> {
  try {
    const rawRows = await loadApril26GoodChangeRows();
    if (!rawRows.length) return { rows: [], available: false };

    const rows = rawRows
      .map((row, index) => {
        const gcRow = row as unknown as GoodChangeRow;
        if (!gcRow.fundraiser?.trim()) return null;
        const mapped = mapGoodChangeRowToContribution(gcRow);
        return giftRowFromParts(
          {
            id: `gc-${gcRow.transfer_id || index}`,
            attributionRaw: gcRow.fundraiser,
            grossCents: mapped.grossCents,
            netCents: mapped.netCents,
            feeCents: mapped.feeCents,
            receivedAt: mapped.receivedAt,
            payoutId: mapped.payoutId,
            source: "goodchange",
          },
          leaders,
        );
      })
      .filter((row): row is GrassrootsSettlementGiftRow => row != null);

    return { rows, available: true };
  } catch {
    return { rows: [], available: false };
  }
}

function loadStagingGiftRows(leaders: VolunteerLeader[]): GrassrootsSettlementGiftRow[] {
  return settlementSource.stagingGifts.map((gift) =>
    giftRowFromParts(
      {
        id: gift.id,
        attributionRaw: gift.attributionKey,
        grossCents: gift.grossCents,
        netCents: gift.netCents,
        feeCents: gift.feeCents ?? gift.grossCents - gift.netCents,
        receivedAt: gift.receivedAt,
        payoutId: gift.payoutId ?? null,
        source: "staging",
        isExample: gift.isExample,
      },
      leaders,
    ),
  );
}

function buildRollups(gifts: GrassrootsSettlementGiftRow[], leaders: VolunteerLeader[]): GrassrootsSettlementRollupRow[] {
  const bySlug = new Map<string, GrassrootsSettlementRollupRow>();

  const ensure = (slug: string): GrassrootsSettlementRollupRow => {
    const existing = bySlug.get(slug);
    if (existing) return existing;
    const leader = leaders.find((l) => l.slug === slug);
    const row: GrassrootsSettlementRollupRow = {
      leaderSlug: slug,
      displayName: leader?.displayName ?? slug,
      initials: leader?.initials ?? "—",
      directGiftCount: 0,
      directNetCents: 0,
      directCommissionCents: 0,
      overrideGiftCount: 0,
      overrideNetCents: 0,
      overrideCommissionCents: 0,
      totalCommissionCents: 0,
    };
    bySlug.set(slug, row);
    return row;
  };

  for (const gift of gifts) {
    if (gift.matchStatus === "unmatched") continue;

    if (gift.leaderSlug && gift.directCommissionCents > 0) {
      const row = ensure(gift.leaderSlug);
      row.directGiftCount += 1;
      row.directNetCents += gift.netCents;
      row.directCommissionCents += gift.directCommissionCents;
    }

    if (gift.uplineLeaderSlug && gift.uplineCommissionCents > 0) {
      const row = ensure(gift.uplineLeaderSlug);
      row.overrideGiftCount += 1;
      row.overrideNetCents += gift.netCents;
      row.overrideCommissionCents += gift.uplineCommissionCents;
    }
  }

  return [...bySlug.values()]
    .map((row) => ({
      ...row,
      totalCommissionCents: row.directCommissionCents + row.overrideCommissionCents,
    }))
    .filter((row) => row.totalCommissionCents > 0 || row.directGiftCount > 0 || row.overrideGiftCount > 0)
    .sort((a, b) => b.totalCommissionCents - a.totalCommissionCents);
}

export async function loadGrassrootsFundraisingSettlementDashboard(): Promise<GrassrootsFundraisingSettlementPayload> {
  const leaders = getVolunteerLeaderRoster();
  const config = getGrassrootsFundraisingCommissionConfig();
  const commissionLeads = buildCommissionLeadRows(leaders);

  const [{ rows: goodChangeRows, available: goodChangeAvailable }, stagingRows] = await Promise.all([
    loadGoodChangeGiftRows(leaders),
    Promise.resolve(loadStagingGiftRows(leaders)),
  ]);

  const gifts = [...goodChangeRows, ...stagingRows].sort(
    (a, b) => new Date(b.receivedAt).getTime() - new Date(a.receivedAt).getTime(),
  );
  const unmatchedGifts = gifts.filter((g) => g.matchStatus === "unmatched");
  const matchedGifts = gifts.filter((g) => g.matchStatus === "matched" || g.matchStatus === "example");
  const rollups = buildRollups(gifts, leaders);

  return {
    legalBanner: settlementSource.legalBanner,
    config,
    stats: {
      commissionLeads: commissionLeads.length,
      openLeadSlots: commissionLeads.filter((l) => l.isOpenSlot).length,
      attributedGifts: matchedGifts.length,
      unmatchedGifts: unmatchedGifts.length,
      totalNetCents: matchedGifts.reduce((sum, g) => sum + g.netCents, 0),
      totalDirectCommissionCents: matchedGifts.reduce((sum, g) => sum + g.directCommissionCents, 0),
      totalOverrideCommissionCents: matchedGifts.reduce((sum, g) => sum + g.uplineCommissionCents, 0),
      goodChangeAvailable: goodChangeAvailable,
      stagingGiftCount: stagingRows.length,
    },
    commissionLeads,
    gifts,
    unmatchedGifts,
    rollups,
    weeklyRhythm: [
      {
        id: "match-unattributed",
        label: "Clear unmatched attribution",
        description: "GoodChange fundraiser column must match leader initials — fix tracked links before payout.",
      },
      {
        id: "treasurer-review",
        label: "Treasurer review queue",
        description: "No commission moves until counsel-approved structure is signed.",
        href: "/admin/compliance/reconciliation",
      },
      {
        id: "campus-recruit",
        label: "Recruit campus field fundraisers",
        description: "Co-chairs issue attribution keys — downline override rolls up automatically.",
        href: "/election-plan/operators/lane-coverage?view=campus",
      },
      {
        id: "finance-budget",
        label: "Finance budget dashboard",
        description: "Cross-check settlement totals against FOS county rollups.",
        href: "/election-plan/executive-book/budget",
      },
    ],
  };
}
