import Link from "next/link";
import { IntelligenceNavLink } from "@/components/admin/intelligence/IntelligenceNavLink";
import type { BriefingPaperAttachLaneSurface } from "@/lib/intelligence/v4/phase11P7Closure";
import { getBriefingPaperAttachOverlay } from "@/lib/intelligence/v4/phase11P7BriefingPapersChunkAttachDepth";
import { getFieldBookArticle } from "@/lib/intelligence/fieldBookRegistry";

export function BriefingPapersChunkAttachQueuePanel({
  lanes,
}: {
  lanes: BriefingPaperAttachLaneSurface[];
}) {
  return (
    <section className="rounded-xl border border-teal-200 bg-teal-50/30 p-6 text-sm">
      <h2 className="font-bold uppercase text-teal-950">Briefing paper attach queue</h2>
      <p className="mt-2 text-kelly-muted">
        Eight attach lanes map P6 chunk previews to governed briefing paper deep sections — claim-review gated before
        Field Book promotion.
      </p>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[720px] border-collapse text-left text-xs">
          <thead>
            <tr className="border-b border-teal-200 text-[10px] uppercase text-teal-900">
              <th className="py-2 pr-3">Lane · paperId</th>
              <th className="py-2 pr-3">Chunks</th>
              <th className="py-2 pr-3">P6 lanes</th>
              <th className="py-2 pr-3">P7 overlay</th>
              <th className="py-2">Field Book targets</th>
            </tr>
          </thead>
          <tbody>
            {lanes.map((lane) => {
              const overlay = getBriefingPaperAttachOverlay(lane.laneId);
              return (
                <tr key={lane.laneId} className="border-b border-teal-100 align-top">
                  <td className="py-3 pr-3">
                    <IntelligenceNavLink href={lane.href} variant="chip" className="font-bold text-kelly-navy underline">
                      {lane.label}
                    </IntelligenceNavLink>
                    <p className="mt-1 font-mono text-[10px] text-kelly-subtle">{lane.paperId}</p>
                  </td>
                  <td className="py-3 pr-3 font-mono text-kelly-muted">
                    {lane.attachableChunkCount.toLocaleString()}
                  </td>
                  <td className="py-3 pr-3 text-[10px] text-kelly-muted">
                    {overlay.linkedPreviewLanes.join(", ") || "Claims gate"}
                  </td>
                  <td className="py-3 pr-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        lane.phase11P7Enriched ? "bg-emerald-100 text-emerald-900" : "bg-rose-100 text-rose-900"
                      }`}
                    >
                      {lane.phase11P7Enriched ? "At bar" : "Gap"}
                    </span>
                  </td>
                  <td className="py-3">
                    <ul className="flex flex-wrap gap-1">
                      {overlay.targetFieldBookSlugs.map((slug) => (
                        <li key={slug}>
                          <Link
                            href={`/admin/intelligence/field-book/${slug}`}
                            className="rounded-full border border-teal-200 bg-white px-2 py-0.5 text-[10px] font-bold text-teal-950"
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
