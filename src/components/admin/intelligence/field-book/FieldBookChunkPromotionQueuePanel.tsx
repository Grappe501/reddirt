import Link from "next/link";
import { IntelligenceNavLink } from "@/components/admin/intelligence/IntelligenceNavLink";
import type { PromotionBatchSurface } from "@/lib/intelligence/v4/phase11P5Closure";
import { getFieldBookArticle } from "@/lib/intelligence/fieldBookRegistry";

export function FieldBookChunkPromotionQueuePanel({
  batches,
  promotionGateOpen,
}: {
  batches: PromotionBatchSurface[];
  promotionGateOpen: boolean;
}) {
  const totalChunks = batches.reduce((s, b) => s + b.chunkCount, 0);

  return (
    <section className="rounded-xl border border-amber-200 bg-amber-50/30 p-6 text-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-bold uppercase text-amber-950">Promotion batch queue</h2>
          <p className="mt-2 text-kelly-muted">
            {totalChunks.toLocaleString()} strategy manual chunks across {batches.length} batches — catalogued from
            Kelly SOS strategic plan and campaign-system-manual corpora.
          </p>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase ${
            promotionGateOpen
              ? "border border-emerald-300 bg-emerald-50 text-emerald-900"
              : "border border-amber-300 bg-white text-amber-900"
          }`}
        >
          {promotionGateOpen ? "Gate open" : "Gate locked"}
        </span>
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[720px] border-collapse text-left text-xs">
          <thead>
            <tr className="border-b border-amber-200 text-[10px] uppercase text-amber-900">
              <th className="py-2 pr-3">Batch</th>
              <th className="py-2 pr-3">Chunks</th>
              <th className="py-2 pr-3">Status</th>
              <th className="py-2 pr-3">P5 overlay</th>
              <th className="py-2">Field Book targets</th>
            </tr>
          </thead>
          <tbody>
            {batches.map((batch) => (
              <tr key={batch.batchId} className="border-b border-amber-100 align-top">
                <td className="py-3 pr-3">
                  <IntelligenceNavLink href={batch.href} variant="chip" className="font-bold text-kelly-navy underline">
                    {batch.label}
                  </IntelligenceNavLink>
                </td>
                <td className="py-3 pr-3 font-mono text-kelly-muted">{batch.chunkCount.toLocaleString()}</td>
                <td className="py-3 pr-3 capitalize text-kelly-muted">{batch.status.replace(/_/g, " ")}</td>
                <td className="py-3 pr-3">
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      batch.phase11P5Enriched
                        ? "bg-emerald-100 text-emerald-900"
                        : "bg-rose-100 text-rose-900"
                    }`}
                  >
                    {batch.phase11P5Enriched ? "At bar" : "Gap"}
                  </span>
                </td>
                <td className="py-3">
                  <ul className="flex flex-wrap gap-1">
                    {batch.targetFieldBookSlugs.map((slug) => (
                      <li key={slug}>
                        <Link
                          href={`/admin/intelligence/field-book/${slug}`}
                          className="rounded-full border border-amber-200 bg-white px-2 py-0.5 text-[10px] font-bold text-amber-950"
                        >
                          {getFieldBookArticle(slug)?.title ?? slug}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-4 text-xs text-kelly-subtle">
        Chunk index:{" "}
        <code className="rounded bg-white px-1">GET /api/admin/campaign-strategy/chunks</code> · Refresh state:{" "}
        <code className="rounded bg-white px-1">npx tsx scripts/test-phase11-p5-field-book-chunk-promotion.ts</code>
      </p>
    </section>
  );
}
