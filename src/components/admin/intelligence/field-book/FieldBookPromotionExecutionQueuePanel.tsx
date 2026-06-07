import Link from "next/link";
import { IntelligenceNavLink } from "@/components/admin/intelligence/IntelligenceNavLink";
import type { PromotionExecutionWaveSurface } from "@/lib/intelligence/v4/phase11P8Closure";
import { getFieldBookArticle } from "@/lib/intelligence/fieldBookRegistry";
import { getFieldBookPromotionExecutionOverlay } from "@/lib/intelligence/v4/phase11P8FieldBookPromotionExecutionDepth";

export function FieldBookPromotionExecutionQueuePanel({
  waves,
  promotionPipelineReady,
}: {
  waves: PromotionExecutionWaveSurface[];
  promotionPipelineReady: boolean;
}) {
  return (
    <section className="rounded-xl border border-amber-200 bg-amber-50/30 p-6 text-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-bold uppercase text-amber-950">Promotion execution wave queue</h2>
          <p className="mt-2 text-kelly-muted">
            Eight execution waves complete the P5→P8 canon pipeline — staff merges approved chunk summaries into Field
            Book article bodies after P6 preview and P7 briefing attach.
          </p>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase ${
            promotionPipelineReady
              ? "border border-emerald-300 bg-emerald-50 text-emerald-900"
              : "border border-amber-300 bg-white text-amber-900"
          }`}
        >
          {promotionPipelineReady ? "Pipeline ready" : "Pipeline partial"}
        </span>
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[720px] border-collapse text-left text-xs">
          <thead>
            <tr className="border-b border-amber-200 text-[10px] uppercase text-amber-900">
              <th className="py-2 pr-3">Wave</th>
              <th className="py-2 pr-3">Chunks</th>
              <th className="py-2 pr-3">Status</th>
              <th className="py-2 pr-3">P8 overlay</th>
              <th className="py-2">Field Book targets</th>
            </tr>
          </thead>
          <tbody>
            {waves.map((w) => {
              const overlay = getFieldBookPromotionExecutionOverlay(w.waveId);
              return (
                <tr key={w.waveId} className="border-b border-amber-100 align-top">
                  <td className="py-3 pr-3">
                    <IntelligenceNavLink href={w.href} variant="chip" className="font-bold text-kelly-navy underline">
                      {w.label}
                    </IntelligenceNavLink>
                  </td>
                  <td className="py-3 pr-3 font-mono text-kelly-muted">{w.linkedChunkCount.toLocaleString()}</td>
                  <td className="py-3 pr-3 capitalize text-kelly-muted">{w.status.replace(/_/g, " ")}</td>
                  <td className="py-3 pr-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        w.phase11P8Enriched ? "bg-emerald-100 text-emerald-900" : "bg-rose-100 text-rose-900"
                      }`}
                    >
                      {w.phase11P8Enriched ? "At bar" : "Gap"}
                    </span>
                  </td>
                  <td className="py-3">
                    <ul className="flex flex-wrap gap-1">
                      {overlay.targetFieldBookSlugs.map((slug) => (
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
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
