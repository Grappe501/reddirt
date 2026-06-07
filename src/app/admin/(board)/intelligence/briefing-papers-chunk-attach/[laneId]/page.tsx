import Link from "next/link";
import { notFound } from "next/navigation";
import { V4BackLinks, V4PageHeader } from "@/components/admin/intelligence/v4/V4PageHeader";
import { loadAllStrategyManualChunks } from "@/lib/campaign-strategy/strategy-chunking";
import { getAttachLaneSampleChunks } from "@/lib/intelligence/v4/briefingPapersChunkAttachInventory";
import { loadBriefingPapersChunkAttachState } from "@/lib/intelligence/v4/briefingPapersChunkAttachState";
import { getFieldBookArticle } from "@/lib/intelligence/fieldBookRegistry";
import {
  BRIEFING_PAPER_ATTACH_LANE_IDS,
  BRIEFING_PAPERS_CHUNK_ATTACH_HUB_HREF,
  getBriefingPaperAttachOverlay,
  type BriefingPaperAttachLaneId,
} from "@/lib/intelligence/v4/phase11P7BriefingPapersChunkAttachDepth";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ laneId: string }> };

export default async function BriefingPapersChunkAttachLanePage({ params }: Props) {
  const { laneId: raw } = await params;
  if (!BRIEFING_PAPER_ATTACH_LANE_IDS.includes(raw as BriefingPaperAttachLaneId)) notFound();
  const laneId = raw as BriefingPaperAttachLaneId;

  const overlay = getBriefingPaperAttachOverlay(laneId);
  const state = loadBriefingPapersChunkAttachState();
  const laneState = state?.lanes.find((l) => l.laneId === laneId);

  const allChunks = await loadAllStrategyManualChunks();
  const sampleChunks = getAttachLaneSampleChunks(allChunks, laneId, 8);

  return (
    <div className="mx-auto max-w-4xl text-kelly-text">
      <V4PageHeader eyebrow="Briefing papers · P7 attach lane" title={overlay.label} description={overlay.summary}>
        <V4BackLinks />
        <Link
          href={BRIEFING_PAPERS_CHUNK_ATTACH_HUB_HREF}
          className="rounded-full border border-teal-300 bg-teal-50 px-3 py-1 text-xs font-bold text-teal-950"
        >
          Attach hub
        </Link>
        <Link
          href="/admin/intelligence/briefing-papers"
          className="rounded-full border border-teal-300 bg-teal-50 px-3 py-1 text-xs font-bold text-teal-950"
        >
          Briefing papers
        </Link>
      </V4PageHeader>

      <section className="mb-6 rounded-xl border border-kelly-text/10 bg-white p-5 text-sm">
        <dl className="grid grid-cols-2 gap-3 text-xs md:grid-cols-3">
          <div>
            <dt className="font-bold uppercase text-kelly-subtle">paperId</dt>
            <dd className="mt-1 font-mono text-kelly-navy">{overlay.paperId}</dd>
          </div>
          <div>
            <dt className="font-bold uppercase text-kelly-subtle">Attachable chunks</dt>
            <dd className="mt-1 font-mono text-kelly-navy">
              {(laneState?.attachableChunkCount ?? 0).toLocaleString()}
            </dd>
          </div>
          <div>
            <dt className="font-bold uppercase text-kelly-subtle">P6 lanes</dt>
            <dd className="mt-1 text-[10px] text-kelly-navy">
              {overlay.linkedPreviewLanes.join(", ") || "Claims gate"}
            </dd>
          </div>
        </dl>
      </section>

      <section className="mb-6 space-y-4">
        <article className="rounded-xl border border-emerald-100 bg-emerald-50/30 p-5 text-sm">
          <h2 className="font-bold uppercase text-emerald-950">Attach steps</h2>
          <ol className="mt-3 list-decimal space-y-2 pl-5 text-kelly-muted">
            {overlay.attachSteps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </article>

        <article className="rounded-xl border border-violet-100 bg-violet-50/30 p-5 text-sm">
          <h2 className="font-bold uppercase text-violet-950">Claims attach gate</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-kelly-muted">
            {overlay.claimsAttachSteps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ul>
          <p className="mt-3 text-[10px] text-kelly-subtle">
            API: <code className="rounded bg-white px-1">POST /api/admin/intelligence/claim-review</code>
          </p>
        </article>
      </section>

      <section className="mb-6 rounded-xl border border-kelly-text/10 bg-white p-5 text-sm">
        <h2 className="font-bold uppercase text-kelly-navy">Sample chunks for attach</h2>
        <ul className="mt-3 space-y-3">
          {sampleChunks.map((chunk) => (
            <li key={chunk.id} className="rounded-lg border border-teal-100 bg-teal-50/20 p-3 text-xs">
              <p className="font-bold text-kelly-navy">{chunk.heading ?? chunk.navLabel}</p>
              <p className="mt-1 font-mono text-[10px] text-kelly-subtle">{chunk.id}</p>
              <p className="mt-2 line-clamp-3 text-kelly-muted">{chunk.plainText.slice(0, 280)}…</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="mb-8 rounded-xl border border-kelly-text/10 bg-white p-5 text-sm">
        <h2 className="font-bold uppercase text-kelly-navy">Field Book targets</h2>
        <ul className="mt-3 flex flex-wrap gap-2">
          {overlay.targetFieldBookSlugs.map((slug) => (
            <li key={slug}>
              <Link
                href={`/admin/intelligence/field-book/${slug}`}
                className="rounded-full border border-teal-200 bg-teal-50 px-3 py-1 text-xs font-bold text-teal-950"
              >
                {getFieldBookArticle(slug)?.title ?? slug}
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
