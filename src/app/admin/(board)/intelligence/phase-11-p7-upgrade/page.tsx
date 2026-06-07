import Link from "next/link";
import { Phase11P7UpgradePassPanel } from "@/components/admin/intelligence/Phase11P7UpgradePassPanel";
import { V4BackLinks, V4PageHeader } from "@/components/admin/intelligence/v4/V4PageHeader";
import {
  assertPhase11P7Bar,
  BRIEFING_PAPERS_CHUNK_ATTACH_HUB_HREF,
  computePhase11P7UpgradePass,
  listBriefingPaperAttachLaneSurfaces,
} from "@/lib/intelligence/v4/phase11P7Closure";
import { getBriefingPaperAttachOverlay } from "@/lib/intelligence/v4/phase11P7BriefingPapersChunkAttachDepth";

export const dynamic = "force-dynamic";

export default function Phase11P7UpgradePage() {
  const report = computePhase11P7UpgradePass();
  const bar = assertPhase11P7Bar();
  const lanes = listBriefingPaperAttachLaneSurfaces();

  return (
    <div className="mx-auto max-w-7xl text-kelly-text">
      <V4PageHeader
        eyebrow="Intelligence upgrade · Phase 11 P7"
        title="Briefing papers chunk attach"
        description="Exit gate for eight briefing paper attach lanes wiring P6 chunk previews into governed paper deep sections with claim-review API gate."
      >
        <V4BackLinks />
        <Link
          href={BRIEFING_PAPERS_CHUNK_ATTACH_HUB_HREF}
          className="rounded-full border border-teal-300 bg-teal-50 px-3 py-1 text-xs font-bold text-teal-950"
        >
          Chunk attach hub
        </Link>
        <Link
          href="/admin/intelligence/briefing-papers"
          className="rounded-full border border-teal-300 bg-teal-50 px-3 py-1 text-xs font-bold text-teal-950"
        >
          Briefing papers
        </Link>
      </V4PageHeader>

      <Phase11P7UpgradePassPanel report={report} />

      <section className="mb-8 rounded-xl border border-kelly-text/10 bg-white p-5">
        <h2 className="font-heading text-lg font-bold text-kelly-navy">Exit gate</h2>
        <p className={`mt-2 text-sm font-semibold ${bar.ok ? "text-emerald-700" : "text-rose-700"}`}>
          {bar.ok ? "Phase 11 P7 bar met" : bar.message}
        </p>
        {!bar.ok ? (
          <p className="mt-2 text-xs text-kelly-muted">
            Run: <code>npx tsx scripts/test-phase11-p7-briefing-papers-chunk-attach.ts</code>
          </p>
        ) : null}
      </section>

      <section className="space-y-3">
        {lanes.map((lane) => {
          const overlay = getBriefingPaperAttachOverlay(lane.laneId);
          return (
            <article key={lane.laneId} className="rounded-xl border border-teal-100 bg-white p-4 text-sm">
              <Link href={lane.href} className="font-bold text-kelly-navy underline">
                {lane.label}
              </Link>
              <p className="mt-1 text-xs text-kelly-muted">
                paperId: {lane.paperId} · {lane.attachableChunkCount.toLocaleString()} chunks ·{" "}
                {overlay.attachSteps[0]}
              </p>
            </article>
          );
        })}
      </section>
    </div>
  );
}
