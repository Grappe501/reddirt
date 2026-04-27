import type { ReactNode } from "react";
import Link from "next/link";
import {
  ExternalMediaMatchTier,
  ExternalMediaReviewStatus,
  ExternalMediaSourceType,
  type Prisma,
} from "@prisma/client";
import { prisma } from "@/lib/db";
import { updateExternalMediaMentionAction } from "@/app/admin/media-monitor-actions";
import { ARKANSAS_MEDIA_SOURCE_SEEDS } from "@/lib/media-monitor/sources";

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<{
    source?: string;
    review?: string;
    tier?: string;
    type?: string;
    flags?: string;
  }>;
};

const card = "rounded-md border border-kelly-text/10 bg-kelly-page px-3 py-2 text-sm";

export default async function MediaMonitorPage({ searchParams }: Props) {
  const sp = await searchParams;
  const sourceSlug = sp.source?.trim() || null;
  const review = sp.review?.trim() as ExternalMediaReviewStatus | undefined;
  const tier = sp.tier?.trim() as ExternalMediaMatchTier | undefined;
  const sourceType = sp.type?.trim() as ExternalMediaSourceType | undefined;
  const flags = sp.flags?.trim() || null;

  const where: Prisma.ExternalMediaMentionWhereInput = {};
  if (sourceSlug) where.source = { slug: sourceSlug };
  if (review && Object.values(ExternalMediaReviewStatus).includes(review)) {
    where.reviewStatus = review;
  }
  if (tier && Object.values(ExternalMediaMatchTier).includes(tier)) {
    where.matchTier = tier;
  }
  if (sourceType && Object.values(ExternalMediaSourceType).includes(sourceType)) {
    where.sourceType = sourceType;
  }
  if (flags === "response") where.responseNeeded = true;
  if (flags === "amplify") where.needsAmplification = true;
  if (flags === "editorial") where.OR = [{ isEditorial: true }, { isOpinion: true }];

  const [mentions, counties, events, lastRun] = await Promise.all([
    prisma.externalMediaMention.findMany({
      where,
      orderBy: [{ publishedAt: "desc" }, { discoveredAt: "desc" }],
      take: 120,
      include: { source: true, relatedCounty: true, relatedEvent: true },
    }),
    prisma.county.findMany({ orderBy: { displayName: "asc" }, select: { id: true, displayName: true } }),
    prisma.campaignEvent.findMany({
      where: { startAt: { gte: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000) } },
      orderBy: { startAt: "desc" },
      take: 80,
      select: { id: true, title: true, startAt: true },
    }),
    prisma.externalMediaIngestRun.findFirst({ orderBy: { startedAt: "desc" } }),
  ]);

  const q = (extra: Record<string, string | null | undefined>) => {
    const u = new URLSearchParams();
    if (sourceSlug) u.set("source", sourceSlug);
    if (review) u.set("review", review);
    if (tier) u.set("tier", tier);
    if (sourceType) u.set("type", sourceType);
    if (flags) u.set("flags", flags);
    for (const [k, v] of Object.entries(extra)) {
      if (v) u.set(k, v);
      else u.delete(k);
    }
    const s = u.toString();
    return s ? `?${s}` : "";
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 text-kelly-text">
      <header className="mb-6 border-b border-kelly-text/10 pb-4">
        <p className="font-body text-[10px] font-bold uppercase tracking-[0.22em] text-kelly-text/45">
          Campaign intelligence
        </p>
        <h1 className="font-heading text-2xl font-bold">Press monitor</h1>
        <p className="mt-2 max-w-3xl font-body text-sm leading-relaxed text-kelly-text/70">
          Earned-media mentions from the Arkansas registry (RSS-first, robots-aware). Approve items for the public{" "}
          <Link href="/press-coverage" className="text-kelly-slate underline">
            Press coverage
          </Link>{" "}
          page. Schedule weekly runs via{" "}
          <code className="rounded bg-kelly-text/5 px-1 text-xs">GET /api/cron/media-monitor?key=…</code>.
        </p>
        {lastRun ? (
          <p className="mt-2 font-mono text-[11px] text-kelly-text/55">
            Last run: {lastRun.startedAt.toISOString()} · inserted {lastRun.itemsInserted} · updated {lastRun.itemsUpdated}{" "}
            · discovered {lastRun.itemsDiscovered}
            {lastRun.error ? ` · error: ${lastRun.error}` : ""}
          </p>
        ) : (
          <p className="mt-2 font-body text-xs text-amber-900">No ingest runs yet. Run `npm run ingest:external-media`.</p>
        )}
      </header>

      <div className={`mb-4 flex flex-wrap gap-2 ${card}`}>
        <span className="text-[10px] font-bold uppercase text-kelly-text/45">Filters</span>
        <FilterLink href={`/admin/media-monitor${q({ source: null })}`} active={!sourceSlug}>
          All sources
        </FilterLink>
        {ARKANSAS_MEDIA_SOURCE_SEEDS.slice(0, 12).map((s) => (
          <FilterLink key={s.slug} href={`/admin/media-monitor${q({ source: s.slug })}`} active={sourceSlug === s.slug}>
            {s.name}
          </FilterLink>
        ))}
        <Link href="/admin/media-monitor" className="text-[11px] text-kelly-slate underline">
          Clear
        </Link>
      </div>

      <div className={`mb-4 flex flex-wrap gap-2 ${card}`}>
        <FilterLink href={`/admin/media-monitor${q({ review: null })}`} active={!review}>
          Review: any
        </FilterLink>
        {Object.values(ExternalMediaReviewStatus).map((r) => (
          <FilterLink key={r} href={`/admin/media-monitor${q({ review: r })}`} active={review === r}>
            {r}
          </FilterLink>
        ))}
        <FilterLink href={`/admin/media-monitor${q({ tier: ExternalMediaMatchTier.DEFINITE })}`} active={tier === "DEFINITE"}>
          Definite
        </FilterLink>
        <FilterLink href={`/admin/media-monitor${q({ type: ExternalMediaSourceType.TV })}`} active={sourceType === "TV"}>
          TV
        </FilterLink>
        <FilterLink href={`/admin/media-monitor${q({ flags: "editorial" })}`} active={flags === "editorial"}>
          Editorial/opinion
        </FilterLink>
        <FilterLink href={`/admin/media-monitor${q({ flags: "response" })}`} active={flags === "response"}>
          Response needed
        </FilterLink>
        <FilterLink href={`/admin/media-monitor${q({ flags: "amplify" })}`} active={flags === "amplify"}>
          Amplify
        </FilterLink>
      </div>

      <div className="overflow-x-auto rounded-md border border-kelly-text/10 bg-white">
        <table className="w-full min-w-[880px] border-collapse text-left text-[11px]">
          <thead className="border-b border-kelly-text/10 bg-kelly-page/80 font-bold uppercase tracking-wider text-kelly-text/55">
            <tr>
              <th className="p-2">Published</th>
              <th className="p-2">Outlet</th>
              <th className="p-2">Headline</th>
              <th className="p-2">Match</th>
              <th className="p-2">Staff actions</th>
            </tr>
          </thead>
          <tbody>
            {mentions.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-6 text-kelly-text/55">
                  No mentions match. Run ingestion, or widen filters.
                </td>
              </tr>
            ) : (
              mentions.map((m) => (
                <tr key={m.id} className="border-b border-kelly-text/5 align-top">
                  <td className="p-2 font-mono text-[10px] text-kelly-text/70">
                    {m.publishedAt ? m.publishedAt.toISOString().slice(0, 10) : "—"}
                  </td>
                  <td className="p-2">
                    <div className="font-semibold">{m.source.name}</div>
                    <div className="text-[10px] text-kelly-text/50">{m.sourceType}</div>
                  </td>
                  <td className="p-2 max-w-[280px]">
                    <a
                      href={m.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-kelly-slate underline"
                    >
                      {m.title}
                    </a>
                    {m.summary ? (
                      <p className="mt-1 line-clamp-3 text-[10px] leading-snug text-kelly-text/65">{m.summary}</p>
                    ) : null}
                    <p className="mt-1 text-[9px] text-kelly-text/45">
                      {m.transcriptMissing ? "Transcript n/a · " : ""}
                      {m.fullText ? "Full text captured" : "Link + snippet only"}
                    </p>
                  </td>
                  <td className="p-2 text-[10px]">
                    <div>{m.matchTier}</div>
                    <div className="text-kelly-text/55">{m.mentionType}</div>
                    {m.confidenceScore != null ? <div>score {m.confidenceScore.toFixed(2)}</div> : null}
                  </td>
                  <td className="p-2 min-w-[200px]">
                    <form action={updateExternalMediaMentionAction} className="grid gap-1">
                      <input type="hidden" name="id" value={m.id} />
                      <select
                        name="reviewStatus"
                        defaultValue={m.reviewStatus}
                        className="w-full border border-kelly-text/15 bg-white px-1 py-0.5 text-[10px]"
                      >
                        {Object.values(ExternalMediaReviewStatus).map((r) => (
                          <option key={r} value={r}>
                            {r}
                          </option>
                        ))}
                      </select>
                      <label className="flex items-center gap-1 text-[10px]">
                        <input type="checkbox" name="showOnPublicSite" defaultChecked={m.showOnPublicSite} />
                        Public press page
                      </label>
                      <label className="flex items-center gap-1 text-[10px]">
                        <input type="checkbox" name="responseNeeded" defaultChecked={m.responseNeeded} />
                        Response
                      </label>
                      <label className="flex items-center gap-1 text-[10px]">
                        <input type="checkbox" name="needsAmplification" defaultChecked={m.needsAmplification} />
                        Amplify
                      </label>
                      <label className="flex items-center gap-1 text-[10px]">
                        <input type="checkbox" name="markForSocialShare" defaultChecked={m.markForSocialShare} />
                        Social
                      </label>
                      <label className="flex items-center gap-1 text-[10px]">
                        <input type="checkbox" name="markForEmailRoundup" defaultChecked={m.markForEmailRoundup} />
                        Email rnd
                      </label>
                      <label className="flex items-center gap-1 text-[10px]">
                        <input
                          type="checkbox"
                          name="markForSurrogateAmplification"
                          defaultChecked={m.markForSurrogateAmplification}
                        />
                        Surrogate
                      </label>
                      <label className="mt-1 block text-[9px] text-kelly-text/45">County</label>
                      <select
                        name="relatedCountyId"
                        defaultValue={m.relatedCountyId ?? ""}
                        className="w-full border border-kelly-text/15 bg-white px-1 text-[10px]"
                      >
                        <option value="">—</option>
                        {counties.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.displayName}
                          </option>
                        ))}
                      </select>
                      <label className="mt-1 block text-[9px] text-kelly-text/45">Event</label>
                      <select
                        name="relatedEventId"
                        defaultValue={m.relatedEventId ?? ""}
                        className="w-full border border-kelly-text/15 bg-white px-1 text-[10px]"
                      >
                        <option value="">—</option>
                        {events.map((e) => (
                          <option key={e.id} value={e.id}>
                            {e.startAt.toISOString().slice(0, 10)} · {e.title}
                          </option>
                        ))}
                      </select>
                      <label className="mt-1 block text-[9px] text-kelly-text/45">Campaign summary</label>
                      <textarea
                        name="campaignSummary"
                        rows={2}
                        defaultValue={m.campaignSummary ?? ""}
                        className="w-full border border-kelly-text/15 bg-white p-1 text-[10px]"
                      />
                      <button
                        type="submit"
                        className="mt-1 rounded border border-kelly-text/20 bg-kelly-text px-2 py-1 text-[10px] font-bold text-kelly-page"
                      >
                        Save
                      </button>
                    </form>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function FilterLink({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`rounded px-2 py-0.5 text-[11px] font-semibold ${
        active ? "bg-kelly-text text-kelly-page" : "border border-kelly-text/15 bg-white text-kelly-text"
      }`}
    >
      {children}
    </Link>
  );
}
