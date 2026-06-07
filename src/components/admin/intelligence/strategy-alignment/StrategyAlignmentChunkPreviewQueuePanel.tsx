import Link from "next/link";
import { IntelligenceNavLink } from "@/components/admin/intelligence/IntelligenceNavLink";
import type { AlignmentChunkPreviewLaneSurface } from "@/lib/intelligence/v4/phase11P6Closure";
import { getFieldBookArticle } from "@/lib/intelligence/fieldBookRegistry";
import { getStrategyAlignmentChunkPreviewOverlay } from "@/lib/intelligence/v4/phase11P6StrategyAlignmentChunkPreviewDepth";

export function StrategyAlignmentChunkPreviewQueuePanel({
  lanes,
}: {
  lanes: AlignmentChunkPreviewLaneSurface[];
}) {
  return (
    <section className="rounded-xl border border-purple-200 bg-purple-50/30 p-6 text-sm">
      <h2 className="font-bold uppercase text-purple-950">SDI-1 preview lane queue</h2>
      <p className="mt-2 text-kelly-muted">
        Eight alignment crosswalk lanes — filter strategy manual chunks against doctrine signals before Field Book
        promotion via P5 batches.
      </p>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[720px] border-collapse text-left text-xs">
          <thead>
            <tr className="border-b border-purple-200 text-[10px] uppercase text-purple-900">
              <th className="py-2 pr-3">Lane</th>
              <th className="py-2 pr-3">Chunks</th>
              <th className="py-2 pr-3">Doctrines</th>
              <th className="py-2 pr-3">P6 overlay</th>
              <th className="py-2">Field Book targets</th>
            </tr>
          </thead>
          <tbody>
            {lanes.map((lane) => {
              const overlay = getStrategyAlignmentChunkPreviewOverlay(lane.laneId);
              return (
                <tr key={lane.laneId} className="border-b border-purple-100 align-top">
                  <td className="py-3 pr-3">
                    <IntelligenceNavLink href={lane.href} variant="chip" className="font-bold text-kelly-navy underline">
                      {lane.label}
                    </IntelligenceNavLink>
                  </td>
                  <td className="py-3 pr-3 font-mono text-kelly-muted">
                    {lane.matchingChunkCount.toLocaleString()}
                  </td>
                  <td className="py-3 pr-3 text-kelly-muted">
                    {lane.alignmentDoctrineIds.length > 0
                      ? lane.alignmentDoctrineIds.slice(0, 2).join(", ")
                      : "Claims gate"}
                  </td>
                  <td className="py-3 pr-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        lane.phase11P6Enriched ? "bg-emerald-100 text-emerald-900" : "bg-rose-100 text-rose-900"
                      }`}
                    >
                      {lane.phase11P6Enriched ? "At bar" : "Gap"}
                    </span>
                  </td>
                  <td className="py-3">
                    <ul className="flex flex-wrap gap-1">
                      {overlay.targetFieldBookSlugs.map((slug) => (
                        <li key={slug}>
                          <Link
                            href={`/admin/intelligence/field-book/${slug}`}
                            className="rounded-full border border-purple-200 bg-white px-2 py-0.5 text-[10px] font-bold text-purple-950"
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
