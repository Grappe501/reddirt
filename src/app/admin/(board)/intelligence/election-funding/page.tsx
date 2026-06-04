import { V4ElectionFundingIntelligencePanel } from "@/components/admin/intelligence/v4/V4ElectionFundingIntelligencePanel";
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

      <V4ElectionFundingIntelligencePanel />
    </div>
  );
}
