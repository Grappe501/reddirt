import {
  ConversationClusterStatus,
  ConversationItemStatus,
  ConversationOpportunityStatus,
  ConversationWatchlistStatus,
} from "@prisma/client";
import { prisma } from "@/lib/db";
import type {
  ConversationClusterListRow,
  ConversationItemDetail,
  ConversationItemListRow,
  ConversationMonitoringSummary,
  ConversationOpportunityListRow,
} from "./conversation-monitoring-dto";

const previewLen = 180;

function preview(s: string) {
  const t = s.replace(/\s+/g, " ").trim();
  return t.length <= previewLen ? t : t.slice(0, previewLen) + "…";
}

export async function getConversationMonitoringSummary(): Promise<ConversationMonitoringSummary> {
  try {
    const [itemCount, newItems, openOpportunities, activeClusters, watchlistCount, countyRows] = await Promise.all([
      prisma.conversationItem.count(),
      prisma.conversationItem.count({ where: { status: ConversationItemStatus.NEW } }),
      prisma.conversationOpportunity.count({ where: { status: { in: [ConversationOpportunityStatus.OPEN, ConversationOpportunityStatus.ROUTED] } } }),
      prisma.conversationCluster.count({ where: { status: ConversationClusterStatus.ACTIVE } }),
      prisma.conversationWatchlist.count({ where: { status: ConversationWatchlistStatus.ACTIVE } }),
      prisma.conversationItem.groupBy({
        by: ["countyId"],
        where: { countyId: { not: null } },
        _count: { id: true },
        orderBy: { _count: { id: "desc" } },
        take: 5,
      }),
    ]);
    const countyIds = countyRows.map((c) => c.countyId).filter(Boolean) as string[];
    const counties =
      countyIds.length > 0
        ? await prisma.county.findMany({ where: { id: { in: countyIds } }, select: { id: true, displayName: true } })
        : [];
    const nameById = Object.fromEntries(counties.map((c) => [c.id, c.displayName]));
    const topCounties = countyRows
      .map((r) => ({
        countyId: r.countyId!,
        displayName: nameById[r.countyId!] ?? r.countyId!,
        count: r._count.id,
      }))
      .filter((r) => r.count > 0);
    return { itemCount, newItems, openOpportunities, activeClusters, watchlistCount, topCounties };
  } catch {
    return { itemCount: 0, newItems: 0, openOpportunities: 0, activeClusters: 0, watchlistCount: 0, topCounties: [] };
  }
}

export async function listConversationItems(take: number, status?: ConversationItemStatus): Promise<ConversationItemListRow[]> {
  try {
    const rows = await prisma.conversationItem.findMany({
      where: status ? { status } : undefined,
      orderBy: { publishedAt: "desc" },
      take: Math.min(100, Math.max(1, take)),
      include: {
        county: { select: { displayName: true } },
        analysis: {
          select: {
            summary: true,
            classification: true,
            urgency: true,
            sentiment: true,
            analyzedAt: true,
            updatedAt: true,
          },
        },
      },
    });
    return rows.map((r) => ({
      id: r.id,
      channel: r.channel,
      sourceKind: r.sourceKind,
      title: r.title,
      bodyPreview: preview(r.bodyText),
      status: r.status,
      publishedAt: r.publishedAt ? r.publishedAt.toISOString() : null,
      countyId: r.countyId,
      countyName: r.county?.displayName ?? null,
      analyzedAt: r.analysis?.analyzedAt ? r.analysis.analyzedAt.toISOString() : null,
      analysisSummary: r.analysis?.summary ?? null,
      classification: r.analysis ? String(r.analysis.classification) : null,
      urgency: r.analysis?.urgency ?? null,
      sentiment: r.analysis ? String(r.analysis.sentiment) : null,
      updatedAt: r.updatedAt.toISOString(),
    }));
  } catch {
    return [];
  }
}

export async function getConversationItemDetail(id: string): Promise<ConversationItemDetail | null> {
  try {
    const r = await prisma.conversationItem.findUnique({
      where: { id },
      include: {
        county: { select: { displayName: true } },
        watchlist: { select: { name: true } },
        analysis: true,
      },
    });
    if (!r) return null;
    const a = r.analysis;
    return {
      id: r.id,
      channel: r.channel,
      sourceKind: r.sourceKind,
      title: r.title,
      bodyPreview: preview(r.bodyText),
      bodyText: r.bodyText,
      publicPermalink: r.publicPermalink,
      status: r.status,
      publishedAt: r.publishedAt ? r.publishedAt.toISOString() : null,
      countyId: r.countyId,
      countyName: r.county?.displayName ?? null,
      watchlistName: r.watchlist?.name ?? null,
      analysisSummary: a?.summary ?? null,
      classification: a ? String(a.classification) : null,
      urgency: a?.urgency ?? null,
      sentiment: a ? String(a.sentiment) : null,
      issueTags: a?.issueTags ?? [],
      suggestedAction: a?.suggestedAction ?? null,
      suggestedTone: a ? String(a.suggestedTone) : null,
      countyInferenceNote: a?.countyInferenceNote ?? null,
      analyzerVersion: a?.analyzerVersion ?? null,
      analyzedAt: a?.analyzedAt ? a.analyzedAt.toISOString() : null,
      updatedAt: r.updatedAt.toISOString(),
    };
  } catch {
    return null;
  }
}

export async function listConversationClusters(take: number): Promise<ConversationClusterListRow[]> {
  try {
    const rows = await prisma.conversationCluster.findMany({
      where: { status: ConversationClusterStatus.ACTIVE },
      orderBy: { updatedAt: "desc" },
      take: Math.min(50, take),
      include: {
        _count: { select: { items: true } },
        county: { select: { displayName: true } },
      },
    });
    return rows.map((r) => ({
      id: r.id,
      title: r.title,
      itemCount: r._count.items,
      status: r.status,
      countyName: r.county?.displayName ?? null,
      updatedAt: r.updatedAt.toISOString(),
    }));
  } catch {
    return [];
  }
}

export async function listConversationOpportunities(take: number): Promise<ConversationOpportunityListRow[]> {
  try {
    const rows = await prisma.conversationOpportunity.findMany({
      where: { status: { in: [ConversationOpportunityStatus.OPEN, ConversationOpportunityStatus.ROUTED] } },
      orderBy: { updatedAt: "desc" },
      take: Math.min(50, take),
      include: { county: { select: { displayName: true } } },
    });
    return rows.map((r) => ({
      id: r.id,
      title: r.title,
      status: r.status,
      urgency: r.urgency,
      countyName: r.county?.displayName ?? null,
      hasIntake: r.workflowIntakeId != null,
      hasSocial: r.socialContentItemId != null,
      updatedAt: r.updatedAt.toISOString(),
    }));
  } catch {
    return [];
  }
}
