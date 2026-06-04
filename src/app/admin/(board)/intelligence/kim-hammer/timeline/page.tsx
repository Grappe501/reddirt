import Link from "next/link";
import { loadDebateIntelligenceV4SurfacePacket } from "@/lib/intelligence/v4/debateIntelligenceV4";
import { getSurfaceGuide } from "@/lib/intelligence/v4/debateOperatorNarratives";
import { V4BackLinks, V4PageHeader } from "@/components/admin/intelligence/v4/V4PageHeader";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 26;

/** v4 legislative timeline — no full workbench load (Netlify-safe). */
export default function KimHammerTimelinePage() {
  const v4 = loadDebateIntelligenceV4SurfacePacket();

  return (
    <div className="mx-auto max-w-7xl text-kelly-text">
      <V4PageHeader
        eyebrow="Election record · v4 timeline"
        title="Legislative timeline"
        description="Continuity proof for debate: when Hammer says 2025 is a new direction, cite 2021 cluster rows with verified act numbers. Scan by year before stage; mark three rows to cite with HIGH confidence only."
        guide={getSurfaceGuide("timeline")}
      >
        <V4BackLinks />
        <Link
          href="/admin/intelligence/kim-hammer/debate-prep"
          className="rounded-full border border-violet-800/30 px-3 py-1 text-xs font-bold text-violet-950"
        >
          Debate prep
        </Link>
      </V4PageHeader>

      <section className="rounded-xl border border-kelly-text/10 bg-white p-4">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr className="border-b border-kelly-text/10 text-kelly-muted">
                <th className="py-1.5 pr-3 font-semibold">Year</th>
                <th className="py-1.5 pr-3 font-semibold">Bill/Act</th>
                <th className="py-1.5 pr-3 font-semibold">Role</th>
                <th className="py-1.5 pr-3 font-semibold">Impact</th>
                <th className="py-1.5 font-semibold">Confidence</th>
              </tr>
            </thead>
            <tbody>
              {v4.timeline.map((row) => (
                <tr key={`${row.year}-${row.billOrAct}`} className="border-b border-kelly-text/5">
                  <td className="py-1.5 pr-3">{row.year}</td>
                  <td className="py-1.5 pr-3">{row.billOrAct}</td>
                  <td className="py-1.5 pr-3">{row.hammerRole}</td>
                  <td className="py-1.5 pr-3 max-w-md">{row.whatChanged}</td>
                  <td className="py-1.5">{row.sourceConfidence}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
