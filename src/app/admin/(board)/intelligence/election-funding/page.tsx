import { V4ElectionFundingIntelligencePanel } from "@/components/admin/intelligence/v4/V4ElectionFundingIntelligencePanel";
import { V4ElectionFundingDepthHub } from "@/components/admin/intelligence/v4/V4ElectionFundingDepthPanel";
import { V4BackLinks, V4PageHeader } from "@/components/admin/intelligence/v4/V4PageHeader";
import { getSurfaceGuide } from "@/lib/intelligence/v4/debateOperatorNarratives";
import Link from "next/link";

export const dynamic = "force-dynamic";

/** County Voting System Grant Fund + HAVA — statutory evidence, appropriations, county ledger research, debate strategy. */
export default function ElectionFundingIntelligencePage() {
  return (
    <div className="mx-auto max-w-7xl text-kelly-text">
      <V4PageHeader
        eyebrow="Election funding intelligence · v5"
        title="County Voting System Grant Fund — full funding picture"
        description="Statutory authority, SOS appropriations, UCC fee flow, county budget breadcrumbs, missing statewide ledger, records request, and debate traps. Verify enrolled acts before public use."
        guide={getSurfaceGuide("countyClerkWeek")}
      >
        <V4BackLinks />
        <Link
          href="/admin/intelligence/election-equipment-vvsg"
          className="rounded-full border border-indigo-300/60 px-3 py-1 text-xs font-bold text-indigo-950"
        >
          VVSG 2.0 education
        </Link>
        <Link
          href="/admin/intelligence/trap-lanes/county-champion"
          className="rounded-full border border-kelly-gold/60 px-3 py-1 text-xs font-bold text-kelly-navy"
        >
          County champion trap
        </Link>
        <Link
          href="/admin/intelligence/claims"
          className="rounded-full border border-amber-300/60 px-3 py-1 text-xs font-bold text-amber-950"
        >
          Claims gate
        </Link>
      </V4PageHeader>

      <div className="mb-8 rounded-xl border border-indigo-200 bg-indigo-50/30 p-4 text-xs">
        <p className="font-bold uppercase text-indigo-950">VVSG 2.0 — candidate briefing (EAC May 2026)</p>
        <p className="mt-2 text-kelly-muted">
          Federal certification takes years; equipment nationwide is aging; sustained funding — not slogans — drives modernization.{" "}
          <Link href="/admin/intelligence/election-equipment-vvsg" className="font-bold text-kelly-navy underline">
            Open full VVSG 2.0 education module →
          </Link>
        </p>
      </div>

      <V4ElectionFundingDepthHub />

      <div className="my-10 border-t border-kelly-text/10 pt-8">
        <p className="mb-6 text-[10px] font-bold uppercase tracking-[0.2em] text-kelly-navy">Evidence tables &amp; claims ledger</p>
        <V4ElectionFundingIntelligencePanel />
      </div>
    </div>
  );
}
