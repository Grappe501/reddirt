import {
  publishedMediaEarlier,
  publishedMediaSince2025_11,
  type ExternalMediaItem,
} from "@/content/editorial/external-media";
import { listPublicPressMentions } from "./public-queries";

export type PressCoverageDisplayItem = {
  id: string;
  outletName: string;
  sourceRegion: string | null;
  publishedAt: Date | null;
  url: string;
  title: string;
  summary: string | null;
  campaignSummary: string | null;
  isEditorial: boolean;
  isOpinion: boolean;
  /** True when mentionType is TV_WEB_STORY (earned TV / video web piece). */
  isTvWebStory: boolean;
  relatedCountyDisplayName: string | null;
  additionalLinks?: { label: string; href: string }[];
};

function normalizeUrlForDedupe(raw: string): string {
  try {
    const u = new URL(raw.trim());
    const path = u.pathname.replace(/\/+$/, "") || "/";
    return `${u.hostname.toLowerCase()}${path}${u.search}`;
  } catch {
    return raw.trim();
  }
}

function fromDbRow(
  m: Awaited<ReturnType<typeof listPublicPressMentions>>[number],
): PressCoverageDisplayItem {
  return {
    id: m.id,
    outletName: m.source.name,
    sourceRegion: m.sourceRegion,
    publishedAt: m.publishedAt,
    url: m.url,
    title: m.title,
    summary: m.summary,
    campaignSummary: m.campaignSummary,
    isEditorial: m.isEditorial,
    isOpinion: m.isOpinion,
    isTvWebStory: m.mentionType === "TV_WEB_STORY",
    relatedCountyDisplayName: m.relatedCounty?.displayName ?? null,
  };
}

function fromCuratedItem(item: ExternalMediaItem): PressCoverageDisplayItem | null {
  const primary = item.links[0];
  if (!primary?.href) return null;
  const rest = item.links.slice(1);
  const publishedAt = new Date(`${item.publishedAt}T12:00:00`);
  const isOpEd = item.kind === "op-ed";
  const isInterview = item.kind === "interview";

  return {
    id: `curated:${item.id}`,
    outletName: item.outlet,
    sourceRegion: null,
    publishedAt: Number.isNaN(publishedAt.getTime()) ? null : publishedAt,
    url: primary.href,
    title: item.title,
    summary: item.summary,
    campaignSummary: null,
    isEditorial: isOpEd,
    isOpinion: isOpEd || isInterview,
    isTvWebStory: false,
    relatedCountyDisplayName: null,
    additionalLinks: rest.length > 0 ? rest : undefined,
  };
}

/**
 * Staff-approved DB mentions plus curated links in `content/editorial/external-media.ts`
 * (same set as the Editorial page). DB URLs win on duplicate.
 */
export async function getPressCoverageFeed(limit = 80): Promise<PressCoverageDisplayItem[]> {
  const [dbRows, curatedItems] = await Promise.all([
    listPublicPressMentions(Math.max(limit * 2, limit)),
    Promise.resolve([...publishedMediaSince2025_11, ...publishedMediaEarlier] as ExternalMediaItem[]),
  ]);

  const takenUrls = new Set(dbRows.map((r) => normalizeUrlForDedupe(r.url)));
  const curatedRows: PressCoverageDisplayItem[] = [];

  for (const item of curatedItems) {
    const row = fromCuratedItem(item);
    if (!row) continue;
    const key = normalizeUrlForDedupe(row.url);
    if (takenUrls.has(key)) continue;
    takenUrls.add(key);
    for (const l of item.links) {
      takenUrls.add(normalizeUrlForDedupe(l.href));
    }
    curatedRows.push(row);
  }

  const fromDb = dbRows.map(fromDbRow);
  const merged = [...fromDb, ...curatedRows].sort((a, b) => {
    const ta = a.publishedAt?.getTime() ?? 0;
    const tb = b.publishedAt?.getTime() ?? 0;
    if (tb !== ta) return tb - ta;
    return a.id.localeCompare(b.id);
  });

  return merged.slice(0, limit);
}

/** Code-defined clips only (no Prisma). Used when the DB is unreachable but the page should still list curated links. */
export function getPressCoverageCuratedOnly(limit = 80): PressCoverageDisplayItem[] {
  const curatedItems = [...publishedMediaSince2025_11, ...publishedMediaEarlier] as ExternalMediaItem[];
  const rows = curatedItems
    .map(fromCuratedItem)
    .filter((r): r is PressCoverageDisplayItem => r != null)
    .sort((a, b) => {
      const ta = a.publishedAt?.getTime() ?? 0;
      const tb = b.publishedAt?.getTime() ?? 0;
      if (tb !== ta) return tb - ta;
      return a.id.localeCompare(b.id);
    });
  return rows.slice(0, limit);
}
