import Link from "next/link";
import { loadDebateIntelligenceV3Packet } from "@/lib/intelligence/v3/debateIntelligenceV3";
import { V3BackLinks, V3PageHeader } from "@/components/admin/intelligence/v3/V3PageHeader";
import { V3DebatePrepSectionList } from "@/components/admin/intelligence/v3/V3SectionStack";

/** Intelligence v3 — full 14-section debate prep from JSON + markdown research packet. */
export default function DebatePrepV3Page() {
  const v3 = loadDebateIntelligenceV3Packet();

  return (
    <div className="mx-auto max-w-7xl text-kelly-text">
      <V3PageHeader
        eyebrow="Debate prep · v3"
        title="Kim Hammer rehearsal briefing"
        description="All fourteen prep sections pull from the election-law index, legislative narratives (KH-0B), debate profile (KH-2), and message guidance. Verify bill/act numbers before public use."
      >
        <V3BackLinks />
        <Link href="/admin/intelligence/debate-command" className="rounded-full border border-kelly-navy/30 px-3 py-1 text-xs font-bold text-kelly-navy">
          Debate command
        </Link>
      </V3PageHeader>

      <p className="mb-4 rounded-lg border border-amber-200/50 bg-amber-50/50 px-3 py-2 text-xs text-amber-950">
        {v3.hub.claims.supported.length} supported · {v3.hub.claims.partial.length} partial ·{" "}
        {v3.hub.claims.needsResearch.length} need more research · {v3.billNarratives.length} narrative cards loaded
      </p>

      <V3DebatePrepSectionList sections={v3.debatePrepSections} />
    </div>
  );
}
