import { prisma } from "@/lib/db";

import { filterHubSummaries, listCommunityWorkbenchHubSummaries } from "./hub-summary";
import { getCoalitionWorkbenchRegistry } from "./load-coalition-workbench-profile";
import type { CommunityWorkbenchHubSummary } from "./types";

export type CoalitionCommandWorkbenchCard = CommunityWorkbenchHubSummary & {
  frameworkSectionCount: number;
  pathwayCount: number;
  locale: string;
  leadRole: string | null;
  intelPagesFilled: number;
  relationshipCount: number;
};

export type CoalitionCommandHubView = {
  heroLine: string;
  workbenches: CoalitionCommandWorkbenchCard[];
  rollup: {
    total: number;
    withOwner: number;
    withUpcomingEvent: number;
    avgReadinessPct: number;
    missingOwnerSlugs: string[];
  };
};

async function loadCoalitionRecordCounts(
  slugs: string[],
): Promise<Map<string, { intelPagesFilled: number; relationshipCount: number }>> {
  const map = new Map<string, { intelPagesFilled: number; relationshipCount: number }>();
  if (slugs.length === 0) return map;

  try {
    const rows = await prisma.communityWorkbench.findMany({
      where: { slug: { in: slugs }, active: true },
      select: {
        slug: true,
        _count: { select: { intelPages: true, relationships: true } },
      },
    });
    for (const row of rows) {
      map.set(row.slug, {
        intelPagesFilled: row._count.intelPages,
        relationshipCount: row._count.relationships,
      });
    }
  } catch {
    // registry-only fallback — counts stay zero
  }

  return map;
}

export async function loadCoalitionCommandHub(): Promise<CoalitionCommandHubView> {
  const [summaries, recordCounts] = await Promise.all([
    listCommunityWorkbenchHubSummaries(),
    loadCoalitionRecordCounts(getCoalitionWorkbenchRegistry().map((w) => w.slug)),
  ]);

  const coalitionSummaries = filterHubSummaries(summaries, { kind: "coalition" });
  const profileBySlug = new Map(getCoalitionWorkbenchRegistry().map((p) => [p.slug, p]));

  const workbenches: CoalitionCommandWorkbenchCard[] = coalitionSummaries.map((wb) => {
    const profile = profileBySlug.get(wb.slug);
    const counts = recordCounts.get(wb.slug);
    return {
      ...wb,
      frameworkSectionCount: profile?.intelSections.length ?? 0,
      pathwayCount: profile?.volunteerPathways.length ?? 0,
      locale: profile?.locale ?? "en",
      leadRole: profile?.leadRole ?? null,
      intelPagesFilled: counts?.intelPagesFilled ?? 0,
      relationshipCount: counts?.relationshipCount ?? 0,
    };
  });

  const withOwner = workbenches.filter((w) => w.hasOwner).length;
  const withUpcomingEvent = workbenches.filter((w) => w.hasUpcomingEvent).length;
  const avgReadinessPct =
    workbenches.length > 0
      ? Math.round(workbenches.reduce((sum, w) => sum + w.readinessPct, 0) / workbenches.length)
      : 0;

  return {
    heroLine:
      "Twelve coalition workbenches — same operating system as Sherwood and Jacksonville. Record-backed readiness, not snapshot KPI cards.",
    workbenches,
    rollup: {
      total: workbenches.length,
      withOwner,
      withUpcomingEvent,
      avgReadinessPct,
      missingOwnerSlugs: workbenches.filter((w) => !w.hasOwner).map((w) => w.slug),
    },
  };
}
