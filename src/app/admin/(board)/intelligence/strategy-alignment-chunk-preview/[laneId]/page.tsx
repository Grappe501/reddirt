import Link from "next/link";
import { notFound } from "next/navigation";
import { V4BackLinks, V4PageHeader } from "@/components/admin/intelligence/v4/V4PageHeader";
import { getFieldBookArticle } from "@/lib/intelligence/fieldBookRegistry";
import {
  getChunksForLane,
} from "@/lib/intelligence/v4/strategyAlignmentChunkPreviewInventory";
import { loadStrategyAlignmentChunkPreviewState } from "@/lib/intelligence/v4/strategyAlignmentChunkPreviewState";
import {
  ALIGNMENT_CHUNK_PREVIEW_LANE_IDS,
  getStrategyAlignmentChunkPreviewOverlay,
  STRATEGY_ALIGNMENT_CHUNK_PREVIEW_HUB_HREF,
  type AlignmentChunkPreviewLaneId,
} from "@/lib/intelligence/v4/phase11P6StrategyAlignmentChunkPreviewDepth";
import { loadAllStrategyManualChunks } from "@/lib/campaign-strategy/strategy-chunking";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ laneId: string }> };

export default async function StrategyAlignmentChunkPreviewLanePage({ params }: Props) {
  const { laneId: raw } = await params;
  if (!ALIGNMENT_CHUNK_PREVIEW_LANE_IDS.includes(raw as AlignmentChunkPreviewLaneId)) notFound();
  const laneId = raw as AlignmentChunkPreviewLaneId;

  const overlay = getStrategyAlignmentChunkPreviewOverlay(laneId);
  const state = loadStrategyAlignmentChunkPreviewState();
  const laneState = state?.lanes.find((l) => l.laneId === laneId);

  const allChunks = await loadAllStrategyManualChunks();
  const sampleChunks = getChunksForLane(allChunks, laneId, 8);

  return (
    <div className="mx-auto max-w-4xl text-kelly-text">
      <V4PageHeader eyebrow="SDI-1 chunk preview · P6 lane" title={overlay.label} description={overlay.summary}>
        <V4BackLinks />
        <Link
          href={STRATEGY_ALIGNMENT_CHUNK_PREVIEW_HUB_HREF}
          className="rounded-full border border-purple-300 bg-purple-50 px-3 py-1 text-xs font-bold text-purple-950"
        >
          Preview hub
        </Link>
        <Link
          href="/admin/intelligence/strategy-alignment"
          className="rounded-full border border-purple-300 bg-purple-50 px-3 py-1 text-xs font-bold text-purple-950"
        >
          Strategy alignment
        </Link>
      </V4PageHeader>

      <section className="mb-6 rounded-xl border border-kelly-text/10 bg-white p-5 text-sm">
        <dl className="grid grid-cols-2 gap-3 text-xs md:grid-cols-3">
          <div>
            <dt className="font-bold uppercase text-kelly-subtle">Matching chunks</dt>
            <dd className="mt-1 font-mono text-kelly-navy">
              {(laneState?.matchingChunkCount ?? 0).toLocaleString()}
            </dd>
          </div>
          <div>
            <dt className="font-bold uppercase text-kelly-subtle">Doctrines</dt>
            <dd className="mt-1 text-kelly-navy">
              {overlay.alignmentDoctrineIds.length > 0
                ? overlay.alignmentDoctrineIds.join(", ")
                : "Claims gate lane"}
            </dd>
          </div>
          <div>
            <dt className="font-bold uppercase text-kelly-subtle">Batches</dt>
            <dd className="mt-1 font-mono text-[10px] text-kelly-navy">
              {overlay.chunkFilter.promotionBatchIds.join(", ")}
            </dd>
          </div>
        </dl>
      </section>

      <section className="mb-6 space-y-4">
        <article className="rounded-xl border border-emerald-100 bg-emerald-50/30 p-5 text-sm">
          <h2 className="font-bold uppercase text-emerald-950">Operator preview steps</h2>
          <ol className="mt-3 list-decimal space-y-2 pl-5 text-kelly-muted">
            {overlay.operatorSteps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </article>

        <article className="rounded-xl border border-violet-100 bg-violet-50/30 p-5 text-sm">
          <h2 className="font-bold uppercase text-violet-950">Claims preview gate</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-kelly-muted">
            {overlay.claimsPreviewSteps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ul>
        </article>
      </section>

      <section className="mb-6 rounded-xl border border-kelly-text/10 bg-white p-5 text-sm">
        <h2 className="font-bold uppercase text-kelly-navy">Sample chunks</h2>
        <ul className="mt-3 space-y-3">
          {sampleChunks.map((chunk) => (
            <li key={chunk.id} className="rounded-lg border border-purple-100 bg-purple-50/20 p-3 text-xs">
              <p className="font-bold text-kelly-navy">{chunk.heading ?? chunk.navLabel}</p>
              <p className="mt-1 font-mono text-[10px] text-kelly-subtle">{chunk.id}</p>
              <p className="mt-2 line-clamp-3 text-kelly-muted">{chunk.plainText.slice(0, 280)}…</p>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-[10px] text-kelly-subtle">
          Full index:{" "}
          <code className="rounded bg-kelly-page px-1">GET /api/admin/campaign-strategy/chunks</code>
        </p>
      </section>

      <section className="mb-8 rounded-xl border border-kelly-text/10 bg-white p-5 text-sm">
        <h2 className="font-bold uppercase text-kelly-navy">Field Book targets</h2>
        <ul className="mt-3 flex flex-wrap gap-2">
          {overlay.targetFieldBookSlugs.map((slug) => (
            <li key={slug}>
              <Link
                href={`/admin/intelligence/field-book/${slug}`}
                className="rounded-full border border-purple-200 bg-purple-50 px-3 py-1 text-xs font-bold text-purple-950"
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
