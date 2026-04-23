import Link from "next/link";
import type { OwnedMediaKind, OwnedMediaSourceType } from "@prisma/client";
import { MediaCenterSelectAllOnPage } from "@/components/admin/owned-media/media-center-bulk";

type BatchOpt = { id: string; label: string; started: string };
type CountyOpt = { id: string; displayName: string };
type EventOpt = { id: string; title: string };

type Props = {
  defaultQ: string;
  size: "sm" | "md" | "lg";
  view: "grid" | "list";
  sort: "UPDATED" | "CAPTURED" | "CREATED" | "RATING" | "TITLE";
  tag: string | null;
  batch: string | null;
  kind: OwnedMediaKind | null;
  countyId: string | null;
  campaignEventId: string | null;
  tr: boolean | null;
  approvedForPress: boolean | null;
  approvedForPublicSite: boolean | null;
  isReviewed: boolean | null;
  sourceType: OwnedMediaSourceType | null;
  dateFrom: string | null;
  dateTo: string | null;
  dateFieldIsCreated: boolean;
  batches: BatchOpt[];
  counties: CountyOpt[];
  events: EventOpt[];
  resultCount: number;
  extraPreserved?: Record<string, string | undefined>;
  communityTag: string;
  pageAssetIds?: string[];
};

function buildSearchParams(
  next: Record<string, string | null | undefined>,
  base?: Record<string, string | undefined>
): string {
  const u = new URLSearchParams();
  const merged = { ...base, ...next };
  for (const [k, v] of Object.entries(merged)) {
    if (v && String(v).length > 0) u.set(k, String(v));
  }
  return u.toString();
}

function gridHref(qs: string) {
  return qs ? `/admin/owned-media/grid?${qs}` : "/admin/owned-media/grid";
}

export function OwnedMediaGridToolbar(props: Props) {
  const {
    defaultQ,
    size,
    view,
    sort,
    tag,
    batch,
    kind,
    countyId,
    campaignEventId,
    tr,
    approvedForPress,
    approvedForPublicSite,
    isReviewed,
    sourceType,
    dateFrom,
    dateTo,
    dateFieldIsCreated,
    batches,
    counties,
    events,
    resultCount,
    extraPreserved,
    communityTag,
    pageAssetIds = [],
  } = props;
  const base: Record<string, string | undefined> = {
    q: defaultQ || undefined,
    tag: tag || undefined,
    batch: batch || undefined,
    kind: kind || undefined,
    size,
    view,
    sort,
    county: countyId || undefined,
    event: campaignEventId || undefined,
    tr: tr === true ? "1" : tr === false ? "0" : undefined,
    apPress: approvedForPress ? "1" : undefined,
    apSite: approvedForPublicSite ? "1" : undefined,
    reviewed: isReviewed === true ? "1" : isReviewed === false ? "0" : undefined,
    src: sourceType || undefined,
    df: dateFrom || undefined,
    dt: dateTo || undefined,
    dateField: dateFieldIsCreated ? "created" : undefined,
    unreviewed: extraPreserved?.unreviewed,
    approvedForSocial: extraPreserved?.approvedForSocial,
    pick: extraPreserved?.pick,
    fav: extraPreserved?.fav,
    collection: extraPreserved?.collection,
    color: extraPreserved?.color,
    viewUnreviewed: extraPreserved?.viewUnreviewed,
    viewFav: extraPreserved?.viewFav,
    viewNeedPress: extraPreserved?.viewNeedPress,
    viewNeedSite: extraPreserved?.viewNeedSite,
    viewApPress: extraPreserved?.viewApPress,
    viewApSite: extraPreserved?.viewApSite,
    viewImport: extraPreserved?.viewImport,
    viewDeriv: extraPreserved?.viewDeriv,
    viewVidNoTr: extraPreserved?.viewVidNoTr,
    viewLowPick: extraPreserved?.viewLowPick,
    viewRevNoAp: extraPreserved?.viewRevNoAp,
    viewPickQueue: extraPreserved?.viewPickQueue,
  };

  return (
    <div className="mt-2 space-y-3">
      <form method="get" action="/admin/owned-media/grid" className="flex flex-wrap items-end gap-2">
        <label className="font-body text-sm">
          <span className="block text-[10px] font-bold uppercase tracking-wider text-deep-soil/55">Search</span>
          <input
            name="q"
            defaultValue={defaultQ}
            placeholder="Title, filename, canonical…"
            className="mt-0.5 w-[min(100vw-2rem,18rem)] rounded-md border border-deep-soil/15 bg-white px-2 py-1.5 text-sm"
          />
        </label>
        <label className="font-body text-sm">
          <span className="block text-[10px] font-bold uppercase tracking-wider text-deep-soil/55">Tag</span>
          <input
            name="tag"
            defaultValue={tag ?? ""}
            placeholder={communityTag}
            className="mt-0.5 w-40 rounded-md border border-deep-soil/15 bg-white px-2 py-1.5 font-mono text-xs"
          />
        </label>
        <label className="font-body text-sm">
          <span className="block text-[10px] font-bold uppercase tracking-wider text-deep-soil/55">Ingest</span>
          <select
            name="batch"
            defaultValue={batch ?? ""}
            className="mt-0.5 max-w-[10rem] rounded-md border border-deep-soil/15 bg-white px-2 py-1.5 text-xs"
          >
            <option value="">Any</option>
            {batches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.label.slice(0, 20)}… {new Date(b.started).toLocaleDateString()}
              </option>
            ))}
          </select>
        </label>
        <label className="font-body text-sm">
          <span className="block text-[10px] font-bold uppercase tracking-wider text-deep-soil/55">County</span>
          <select
            name="county"
            defaultValue={countyId ?? ""}
            className="mt-0.5 max-w-[9rem] rounded-md border border-deep-soil/15 bg-white px-2 py-1.5 text-xs"
          >
            <option value="">Any</option>
            {counties.map((c) => (
              <option key={c.id} value={c.id}>
                {c.displayName}
              </option>
            ))}
          </select>
        </label>
        <label className="font-body text-sm">
          <span className="block text-[10px] font-bold uppercase tracking-wider text-deep-soil/55">Event</span>
          <select
            name="event"
            defaultValue={campaignEventId ?? ""}
            className="mt-0.5 max-w-[11rem] rounded-md border border-deep-soil/15 bg-white px-2 py-1.5 text-xs"
          >
            <option value="">Any</option>
            {events.map((e) => (
              <option key={e.id} value={e.id}>
                {e.title.slice(0, 32)}
                {e.title.length > 32 ? "…" : ""}
              </option>
            ))}
          </select>
        </label>
        <label className="font-body text-sm">
          <span className="block text-[10px] font-bold uppercase tracking-wider text-deep-soil/55">Kind</span>
          <select
            name="kind"
            defaultValue={kind ?? ""}
            className="mt-0.5 rounded-md border border-deep-soil/15 bg-white px-2 py-1.5 text-xs"
          >
            <option value="">Any</option>
            {(["IMAGE", "VIDEO", "AUDIO", "DOCUMENT", "OTHER"] as const).map((k) => (
              <option key={k} value={k}>
                {k}
              </option>
            ))}
          </select>
        </label>
        <label className="font-body text-sm">
          <span className="block text-[10px] font-bold uppercase tracking-wider text-deep-soil/55">Source</span>
          <select
            name="src"
            defaultValue={sourceType ?? ""}
            className="mt-0.5 max-w-[8rem] rounded-md border border-deep-soil/15 bg-white px-2 py-1.5 text-xs"
          >
            <option value="">Any</option>
            {(
              [
                "DIRECT_UPLOAD",
                "UPLOADED_CAMPAIGN",
                "LOCAL_INDEXED",
                "IMPORT",
                "MIGRATED",
                "SUPPORTER_UPLOAD",
                "OTHER",
              ] as const
            ).map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>
        <label className="font-body text-sm">
          <span className="block text-[10px] font-bold uppercase tracking-wider text-deep-soil/55">Transcript</span>
          <select name="tr" defaultValue={tr === true ? "1" : tr === false ? "0" : ""} className="mt-0.5 rounded-md border border-deep-soil/15 bg-white px-2 py-1.5 text-xs">
            <option value="">Any</option>
            <option value="1">Has</option>
            <option value="0">None</option>
          </select>
        </label>
        <label className="font-body text-sm">
          <span className="block text-[10px] font-bold uppercase tracking-wider text-deep-soil/55">Press</span>
          <select
            name="apPress"
            defaultValue={approvedForPress ? "1" : ""}
            className="mt-0.5 rounded-md border border-deep-soil/15 bg-white px-1 py-1.5 text-xs"
          >
            <option value="">Any</option>
            <option value="1">Yes</option>
          </select>
        </label>
        <label className="font-body text-sm">
          <span className="block text-[10px] font-bold uppercase tracking-wider text-deep-soil/55">Site</span>
          <select
            name="apSite"
            defaultValue={approvedForPublicSite ? "1" : ""}
            className="mt-0.5 rounded-md border border-deep-soil/15 bg-white px-1 py-1.5 text-xs"
          >
            <option value="">Any</option>
            <option value="1">Yes</option>
          </select>
        </label>
        <label className="font-body text-sm">
          <span className="block text-[10px] font-bold uppercase tracking-wider text-deep-soil/55">Reviewed</span>
          <select
            name="reviewed"
            defaultValue={isReviewed === true ? "1" : isReviewed === false ? "0" : ""}
            className="mt-0.5 rounded-md border border-deep-soil/15 bg-white px-1 py-1.5 text-xs"
          >
            <option value="">Any</option>
            <option value="1">Yes</option>
            <option value="0">No</option>
          </select>
        </label>
        <label className="font-body text-sm">
          <span className="block text-[10px] font-bold uppercase tracking-wider text-deep-soil/55">From</span>
          <input
            name="df"
            type="date"
            defaultValue={dateFrom ?? ""}
            className="mt-0.5 rounded-md border border-deep-soil/15 bg-white px-2 py-1.5 text-xs"
          />
        </label>
        <label className="font-body text-sm">
          <span className="block text-[10px] font-bold uppercase tracking-wider text-deep-soil/55">To</span>
          <input
            name="dt"
            type="date"
            defaultValue={dateTo ?? ""}
            className="mt-0.5 rounded-md border border-deep-soil/15 bg-white px-2 py-1.5 text-xs"
          />
        </label>
        <label className="font-body text-sm">
          <span className="block text-[10px] font-bold uppercase tracking-wider text-deep-soil/55">Date on</span>
          <select
            name="dateField"
            defaultValue={dateFieldIsCreated ? "created" : "captured"}
            className="mt-0.5 rounded-md border border-deep-soil/15 bg-white px-1 py-1.5 text-xs"
          >
            <option value="captured">Capture</option>
            <option value="created">Imported</option>
          </select>
        </label>
        <input type="hidden" name="size" value={size} />
        <input type="hidden" name="view" value={view} />
        <input type="hidden" name="sort" value={sort} />
        {extraPreserved?.unreviewed ? <input type="hidden" name="unreviewed" value={extraPreserved.unreviewed} /> : null}
        {extraPreserved?.approvedForSocial ? (
          <input type="hidden" name="approvedForSocial" value={extraPreserved.approvedForSocial} />
        ) : null}
        {extraPreserved?.pick ? <input type="hidden" name="pick" value={extraPreserved.pick} /> : null}
        {extraPreserved?.fav ? <input type="hidden" name="fav" value={extraPreserved.fav} /> : null}
        {extraPreserved?.collection ? <input type="hidden" name="collection" value={extraPreserved.collection} /> : null}
        {extraPreserved?.color ? <input type="hidden" name="color" value={extraPreserved.color} /> : null}
        {extraPreserved?.viewUnreviewed ? (
          <input type="hidden" name="viewUnreviewed" value={extraPreserved.viewUnreviewed} />
        ) : null}
        {extraPreserved?.viewFav ? <input type="hidden" name="viewFav" value={extraPreserved.viewFav} /> : null}
        {extraPreserved?.viewNeedPress ? (
          <input type="hidden" name="viewNeedPress" value={extraPreserved.viewNeedPress} />
        ) : null}
        {extraPreserved?.viewNeedSite ? (
          <input type="hidden" name="viewNeedSite" value={extraPreserved.viewNeedSite} />
        ) : null}
        {extraPreserved?.viewApPress ? (
          <input type="hidden" name="viewApPress" value={extraPreserved.viewApPress} />
        ) : null}
        {extraPreserved?.viewApSite ? (
          <input type="hidden" name="viewApSite" value={extraPreserved.viewApSite} />
        ) : null}
        {extraPreserved?.viewImport ? (
          <input type="hidden" name="viewImport" value={extraPreserved.viewImport} />
        ) : null}
        {extraPreserved?.viewDeriv ? (
          <input type="hidden" name="viewDeriv" value={extraPreserved.viewDeriv} />
        ) : null}
        {extraPreserved?.viewVidNoTr ? (
          <input type="hidden" name="viewVidNoTr" value={extraPreserved.viewVidNoTr} />
        ) : null}
        {extraPreserved?.viewLowPick ? (
          <input type="hidden" name="viewLowPick" value={extraPreserved.viewLowPick} />
        ) : null}
        {extraPreserved?.viewRevNoAp ? (
          <input type="hidden" name="viewRevNoAp" value={extraPreserved.viewRevNoAp} />
        ) : null}
        {extraPreserved?.viewPickQueue ? (
          <input type="hidden" name="viewPickQueue" value={extraPreserved.viewPickQueue} />
        ) : null}
        <button
          type="submit"
          className="rounded-md bg-deep-soil px-3 py-1.5 font-body text-sm font-semibold text-cream-canvas"
        >
          Apply
        </button>
        <MediaCenterSelectAllOnPage pageIds={pageAssetIds} />
      </form>

      <div className="flex flex-wrap items-center gap-2 text-deep-soil/70">
        <span className="font-body text-xs">Matching: {resultCount} (max 500) ·</span>
        {(
          [
            ["sm", "Small"],
            ["md", "Medium"],
            ["lg", "Large"],
          ] as const
        ).map(([s, label]) => (
          <Link
            key={s}
            href={gridHref(buildSearchParams({ size: s, inspect: "" }, { ...base, inspect: undefined }))}
            className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
              size === s ? "bg-red-dirt text-cream-canvas" : "border border-deep-soil/20 text-deep-soil"
            }`}
            scroll={false}
          >
            {label}
          </Link>
        ))}
        <span className="text-xs">·</span>
        {(
          [
            ["grid", "Grid"],
            ["list", "List"],
          ] as const
        ).map(([v, label]) => (
          <Link
            key={v}
            href={gridHref(buildSearchParams({ view: v, inspect: "" }, { ...base, inspect: undefined }))}
            className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
              view === v ? "bg-deep-soil text-cream-canvas" : "border border-deep-soil/20 text-deep-soil"
            }`}
            scroll={false}
          >
            {label}
          </Link>
        ))}
        <span className="text-xs">·</span>
        {(
          [
            ["UPDATED", "Updated"],
            ["CAPTURED", "Capture"],
            ["CREATED", "Imported"],
            ["RATING", "Rating"],
            ["TITLE", "Title"],
          ] as const
        ).map(([s, label]) => (
          <Link
            key={s}
            href={gridHref(buildSearchParams({ sort: s, inspect: "" }, { ...base, inspect: undefined }))}
            className={`rounded px-1.5 py-0.5 text-[10px] font-semibold ${
              sort === s ? "bg-civic-slate/15 text-civic-slate" : "text-deep-soil/60 hover:underline"
            }`}
            scroll={false}
          >
            {label}
          </Link>
        ))}
        <Link
          href={gridHref(
            buildSearchParams({ tag: communityTag, inspect: "" }, { ...base, tag: communityTag, inspect: undefined })
          )}
          className="text-xs font-semibold text-civic-slate underline"
          scroll={false}
        >
          {communityTag}
        </Link>
        <Link href="/admin/workbench/social" className="ml-1 text-xs font-semibold text-civic-slate underline" scroll={false}>
          Workbench
        </Link>
      </div>
    </div>
  );
}
