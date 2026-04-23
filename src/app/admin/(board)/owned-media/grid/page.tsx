import Link from "next/link";
import { OwnedMediaKind, OwnedMediaSourceType } from "@prisma/client";
import type { OwnedMediaColorLabel, OwnedMediaPickStatus } from "@prisma/client";
import { getOwnedFilePublicPath } from "@/lib/owned-media/storage";
import { getMediaLibraryRowById, queryMediaLibrary } from "@/lib/media-library/queries";
import { MediaCenterInspector } from "@/components/admin/owned-media/media-center-inspector";
import { MediaCenterSidebar } from "@/components/admin/owned-media/media-center-sidebar";
import { listMediaCenterCollections } from "@/lib/owned-media/collections";
import { prisma } from "@/lib/db";
import { COMMUNITY_TRAINING_TAG } from "@/lib/campaign-briefings/briefing-queries";
import { OwnedMediaGridToolbar } from "./toolbar";

type Props = {
  searchParams: Promise<{
    q?: string;
    size?: string;
    view?: string;
    sort?: string;
    tag?: string;
    batch?: string;
    kind?: string;
    inspect?: string;
    unreviewed?: string;
    approvedForSocial?: string;
    pick?: string;
    fav?: string;
    collection?: string;
    color?: string;
    county?: string;
    event?: string;
    tr?: string;
    apPress?: string;
    apSite?: string;
    reviewed?: string;
    src?: string;
    df?: string;
    dt?: string;
    dateField?: string;
  }>;
};

const SIZE = new Set(["sm", "md", "lg"]);

const PICK_SET = new Set<OwnedMediaPickStatus>(["UNRATED", "PICK", "REJECT"]);
const COLOR_SET = new Set<OwnedMediaColorLabel>(["NONE", "RED", "YELLOW", "GREEN", "BLUE", "PURPLE"]);
const SORT_SET = new Set(["UPDATED", "CAPTURED", "CREATED", "RATING", "TITLE"]);
const VIEW_SET = new Set(["grid", "list"]);

function buildPreservedQuery(sp: Record<string, string | undefined>): string {
  const u = new URLSearchParams();
  for (const [k, v] of Object.entries(sp)) {
    if (v) u.set(k, v);
  }
  return u.toString();
}

export default async function OwnedMediaGridPage({ searchParams }: Props) {
  const sp = await searchParams;
  const q = sp.q?.trim() ?? "";
  const size = SIZE.has(sp.size ?? "") ? (sp.size as "sm" | "md" | "lg") : "sm";
  const tag = sp.tag?.trim() || undefined;
  const batch = sp.batch?.trim() || undefined;
  const kind =
    sp.kind && Object.values(OwnedMediaKind).includes(sp.kind as OwnedMediaKind) ? (sp.kind as OwnedMediaKind) : undefined;
  const inspect = sp.inspect?.trim() || undefined;
  const unreviewed = sp.unreviewed === "1";
  const approvedForSocial = sp.approvedForSocial === "1" ? true : undefined;
  const pick = sp.pick && PICK_SET.has(sp.pick as OwnedMediaPickStatus) ? (sp.pick as OwnedMediaPickStatus) : undefined;
  const isFavorite = sp.fav === "1" ? true : undefined;
  const collection = sp.collection?.trim() || undefined;
  const color = sp.color && COLOR_SET.has(sp.color as OwnedMediaColorLabel) ? (sp.color as OwnedMediaColorLabel) : undefined;
  const view = VIEW_SET.has(sp.view ?? "") ? (sp.view as "grid" | "list") : "grid";
  const sortRaw = sp.sort?.trim().toUpperCase();
  const sort = sortRaw && SORT_SET.has(sortRaw) ? (sortRaw as "UPDATED" | "CAPTURED" | "CREATED" | "RATING" | "TITLE") : "UPDATED";
  const countyId = sp.county?.trim() || undefined;
  const campaignEventId = sp.event?.trim() || undefined;
  const tr = sp.tr === "1" ? true : sp.tr === "0" ? false : undefined;
  const approvedForPress = sp.apPress === "1" ? true : undefined;
  const approvedForPublicSite = sp.apSite === "1" ? true : undefined;
  const isReviewed = sp.reviewed === "1" ? true : sp.reviewed === "0" ? false : undefined;
  const srcRaw = sp.src?.trim();
  const sourceTypes =
    srcRaw && Object.values(OwnedMediaSourceType).includes(srcRaw as OwnedMediaSourceType)
      ? ([srcRaw] as OwnedMediaSourceType[])
      : undefined;
  const dateFrom = sp.df?.trim() || undefined;
  const dateTo = sp.dt?.trim() || undefined;
  const dateField = sp.dateField === "created" ? ("created" as const) : ("captured" as const);

  const { items: assets, total: resultTotal } = await queryMediaLibrary({
    q: q || undefined,
    issueTag: tag,
    mediaIngestBatchId: batch,
    kind,
    isUnreviewed: unreviewed,
    approvedForSocial,
    pickStatus: pick,
    isFavorite,
    collectionId: collection,
    colorLabel: color === "NONE" ? undefined : color,
    countyId,
    campaignEventId,
    hasTranscript: tr,
    approvedForPress,
    approvedForPublicSite,
    isReviewed,
    sourceTypes,
    dateFrom,
    dateTo,
    dateField,
    sort,
    take: 500,
  });

  const [collections, batches, counties, events, inspectRow] = await Promise.all([
    listMediaCenterCollections(),
    prisma.mediaIngestBatch.findMany({ orderBy: { createdAt: "desc" }, take: 40 }).catch(() => []),
    prisma.county.findMany({ orderBy: { displayName: "asc" }, take: 300, select: { id: true, displayName: true } }).catch(() => []),
    prisma.campaignEvent
      .findMany({ orderBy: { startAt: "desc" }, take: 200, select: { id: true, title: true } })
      .catch(() => []),
    inspect ? getMediaLibraryRowById(inspect) : Promise.resolve(null),
  ]);
  const inspectMissing = Boolean(inspect) && !inspectRow;

  const minCell =
    size === "lg" ? "minmax(10rem, 1fr)" : size === "md" ? "minmax(6.5rem, 1fr)" : "minmax(4.25rem, 1fr)";

  const preserved: Record<string, string | undefined> = {
    q: q || undefined,
    size,
    view,
    sort,
    tag,
    batch,
    kind,
    unreviewed: unreviewed ? "1" : undefined,
    approvedForSocial: approvedForSocial ? "1" : undefined,
    pick,
    fav: isFavorite ? "1" : undefined,
    collection,
    color,
    county: countyId,
    event: campaignEventId,
    tr: tr === true ? "1" : tr === false ? "0" : undefined,
    apPress: approvedForPress ? "1" : undefined,
    apSite: approvedForPublicSite ? "1" : undefined,
    reviewed: isReviewed === true ? "1" : isReviewed === false ? "0" : undefined,
    src: srcRaw || undefined,
    df: dateFrom,
    dt: dateTo,
    dateField: sp.dateField === "created" ? "created" : undefined,
    inspect: undefined,
  };

  return (
    <div className="mx-auto max-w-[1920px] px-2 pb-8 pt-2 md:px-4">
      <div className="border-b border-deep-soil/10 pb-3">
        <h1 className="font-heading text-2xl font-bold text-deep-soil">Media Center</h1>
        <p className="mt-1 max-w-3xl font-body text-sm text-deep-soil/70">
          Campaign digital asset manager — <strong>one `OwnedMediaAsset` spine</strong>, Lightroom-style triage, safe previews
          only (no raw paths).
        </p>
        <p className="mt-2 text-sm">
          <Link href="/admin/owned-media" className="font-semibold text-civic-slate underline">
            List view
          </Link>
          <span className="text-deep-soil/35"> · </span>
          <Link href="/admin/owned-media/batches" className="font-semibold text-civic-slate underline">
            Batches
          </Link>
        </p>
      </div>

      <div className="mt-2 flex min-h-[60vh] flex-col gap-0 md:flex-row">
        <MediaCenterSidebar
          basePath="/admin/owned-media/grid"
          preserved={preserved}
          activeHint={
            unreviewed
              ? { key: "unreviewed", value: "1" }
              : approvedForSocial
                ? { key: "approvedForSocial", value: "1" }
                : isReviewed === true
                  ? { key: "reviewed", value: "1" }
                  : pick
                    ? { key: "pick", value: pick }
                    : isFavorite
                      ? { key: "fav", value: "1" }
                      : batch
                        ? { key: "batch", value: batch }
                        : undefined
          }
          collections={collections}
          batches={batches.map((b) => ({ id: b.id, label: b.sourceLabel, started: b.startedAt.toISOString() }))}
        />

        <div className="min-w-0 flex-1">
          <OwnedMediaGridToolbar
            defaultQ={q}
            size={size}
            view={view}
            sort={sort}
            tag={tag ?? null}
            batch={batch ?? null}
            kind={kind ?? null}
            countyId={countyId ?? null}
            campaignEventId={campaignEventId ?? null}
            tr={tr ?? null}
            approvedForPress={approvedForPress ?? null}
            approvedForPublicSite={approvedForPublicSite ?? null}
            isReviewed={isReviewed ?? null}
            sourceType={srcRaw && Object.values(OwnedMediaSourceType).includes(srcRaw as OwnedMediaSourceType) ? (srcRaw as OwnedMediaSourceType) : null}
            dateFrom={dateFrom ?? null}
            dateTo={dateTo ?? null}
            dateFieldIsCreated={sp.dateField === "created"}
            batches={batches.map((b) => ({ id: b.id, label: b.sourceLabel, started: b.startedAt.toISOString() }))}
            counties={counties}
            events={events}
            resultCount={resultTotal}
            extraPreserved={preserved}
            communityTag={COMMUNITY_TRAINING_TAG}
          />

          {view === "list" ? (
            <div className="mt-4 overflow-x-auto rounded-md border border-deep-soil/10">
              <table className="w-full min-w-[48rem] border-collapse text-left text-xs">
                <thead className="border-b border-deep-soil/10 bg-deep-soil/[0.04] font-semibold text-deep-soil/70">
                  <tr>
                    <th className="p-2">Preview</th>
                    <th className="p-2">Title</th>
                    <th className="p-2">Kind</th>
                    <th className="p-2">Source</th>
                    <th className="p-2">Pick</th>
                    <th className="p-2">Rating</th>
                    <th className="p-2">Tr</th>
                    <th className="p-2">Ingested</th>
                  </tr>
                </thead>
                <tbody>
                  {assets.map((a) => {
                    const qs = buildPreservedQuery({ ...preserved, inspect: a.id, size, q: q || undefined, view, sort });
                    const href = `/admin/owned-media/grid${qs ? `?${qs}` : ""}`;
                    return (
                      <tr key={a.id} className="border-b border-deep-soil/5 odd:bg-cream-canvas/50">
                        <td className="p-1">
                          <Link href={href} scroll={false} className="block h-10 w-14 overflow-hidden rounded bg-deep-soil/5">
                            {a.kind === "IMAGE" ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={getOwnedFilePublicPath(a.id)} alt="" className="h-10 w-full object-cover" />
                            ) : (
                              <div className="flex h-10 items-center justify-center text-[8px] text-deep-soil/50">—</div>
                            )}
                          </Link>
                        </td>
                        <td className="max-w-[14rem] p-2">
                          <Link href={href} scroll={false} className="font-semibold text-civic-slate hover:underline">
                            {a.title}
                          </Link>
                        </td>
                        <td className="p-2 font-mono text-[10px]">{a.kind}</td>
                        <td className="p-2 font-mono text-[10px]">{a.sourceType}</td>
                        <td className="p-2">{a.pickStatus}</td>
                        <td className="p-2">{a.rating ?? "—"}</td>
                        <td className="p-2">{a.hasTranscript ? "Y" : "N"}</td>
                        <td className="p-2 text-deep-soil/60">
                          {new Date(a.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <ul
              className="mt-4 grid list-none gap-1.5 md:gap-2"
              style={{ gridTemplateColumns: `repeat(auto-fill, ${minCell})` }}
            >
              {assets.map((a) => {
                const isHeic = a.mimeType?.toLowerCase().includes("heic") || a.mimeType?.toLowerCase().includes("heif");
                const canImgThumb = a.kind === "IMAGE" && a.mimeType && !isHeic;
                const src = canImgThumb ? getOwnedFilePublicPath(a.id) : null;
                const qs = buildPreservedQuery({ ...preserved, inspect: a.id, size, q: q || undefined, view, sort });
                const href = `/admin/owned-media/grid${qs ? `?${qs}` : ""}`;
                return (
                  <li key={a.id}>
                    <Link
                      href={href}
                      scroll={false}
                      className="group flex h-full min-h-0 flex-col overflow-hidden rounded-md border border-deep-soil/10 bg-cream-canvas shadow-sm transition hover:border-red-dirt/30 hover:shadow"
                    >
                      <div
                        className={`relative aspect-square w-full ${
                          size === "sm" ? "min-h-[3.5rem]" : size === "md" ? "min-h-[5.5rem]" : "min-h-[8rem]"
                        } overflow-hidden bg-deep-soil/5`}
                      >
                        {src ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={src} alt="" className="h-full w-full object-cover" loading="lazy" />
                        ) : (
                          <div className="flex h-full w-full flex-col items-center justify-center p-1 text-center">
                            <span className="font-mono text-[9px] font-bold uppercase text-deep-soil/70">{a.kind}</span>
                            {isHeic ? <span className="mt-0.5 text-[8px] text-deep-soil/50">HEIC — open file</span> : null}
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 border-t border-deep-soil/10 p-1.5">
                        <p
                          className={`font-body font-semibold leading-snug text-deep-soil ${
                            size === "sm" ? "line-clamp-2 text-[9px]" : size === "md" ? "line-clamp-2 text-[10px]" : "line-clamp-3 text-xs"
                          }`}
                          title={a.title}
                        >
                          {a.title}
                        </p>
                        {a.colorLabel && a.colorLabel !== "NONE" ? (
                          <span
                            className="mt-0.5 inline-block rounded px-0.5 text-[7px] font-bold uppercase text-deep-soil/60"
                            title="Color label"
                          >
                            {a.colorLabel}
                          </span>
                        ) : null}
                        {a.approvedForSocial ? (
                          <span className="ml-0.5 text-[7px] font-bold uppercase text-emerald-700" title="Approved for social">
                            Soc
                          </span>
                        ) : null}
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}

          {assets.length === 0 ? (
            <p className="mt-8 rounded-lg border border-dashed border-deep-soil/20 p-8 text-center text-sm text-deep-soil/60">
              No assets match. Clear filters or run folder ingest:{" "}
              <code className="rounded bg-deep-soil/5 px-1 text-xs">npm run ingest:campaign-info-folder</code>
            </p>
          ) : null}
        </div>

        <MediaCenterInspector
          asset={inspectRow}
          missing={inspectMissing}
          collections={collections}
        />
      </div>
    </div>
  );
}
