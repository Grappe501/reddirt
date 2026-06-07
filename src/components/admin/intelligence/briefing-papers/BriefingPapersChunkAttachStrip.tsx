import Link from "next/link";
import { computePhase11P7UpgradePass } from "@/lib/intelligence/v4/phase11P7Closure";
import { BRIEFING_PAPERS_CHUNK_ATTACH_HUB_HREF } from "@/lib/intelligence/v4/phase11P7BriefingPapersChunkAttachDepth";

export function BriefingPapersChunkAttachStrip() {
  const pass = computePhase11P7UpgradePass();
  const p = pass.progress;

  return (
    <section className="mb-4 rounded-xl border border-teal-200/60 bg-teal-50/40 p-4 text-xs text-teal-950">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-bold uppercase tracking-wider">Phase 11 P7 · Chunk attach bridge</p>
          <p className="mt-1 text-kelly-muted">
            {p.lanesAtBar}/{p.laneTotal} attach lanes · {p.totalAttachableChunks.toLocaleString()} attachable chunks —
            merge P6 previews into briefing paper deep sections before Field Book promotion.
          </p>
        </div>
        <Link
          href={BRIEFING_PAPERS_CHUNK_ATTACH_HUB_HREF}
          className="rounded-full border border-teal-300 bg-white px-3 py-1 text-[10px] font-bold text-teal-950"
        >
          Open chunk attach hub
        </Link>
      </div>
    </section>
  );
}
