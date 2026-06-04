import Link from "next/link";
import { loadDebateIntelligenceV4Packet } from "@/lib/intelligence/v4/debateIntelligenceV4";
import { getSurfaceGuide } from "@/lib/intelligence/v4/debateOperatorNarratives";
import { V4BackLinks, V4PageHeader } from "@/components/admin/intelligence/v4/V4PageHeader";
import { V4ExecutiveBriefPanel } from "@/components/admin/intelligence/v4/V4ExecutiveBrief";
import { V4RehearsalDeck } from "@/components/admin/intelligence/v4/V4RehearsalDeck";
import { V4ArgumentMap } from "@/components/admin/intelligence/v4/V4ArgumentMap";
import { V4DebatePrepWithNav } from "@/components/admin/intelligence/v4/V4DebatePrepWithNav";
import { V4AnchorBillsPlaybookIndex } from "@/components/admin/intelligence/v4/V4AnchorBillsPlaybookIndex";
import { V4KellyNarrativeFrame } from "@/components/admin/intelligence/v4/V4KellyNarrativeFrame";
import { V4OpponentContrastPlaybookPanel } from "@/components/admin/intelligence/v4/V4OpponentContrastPlaybookPanel";

/** Intelligence v4 — 28-section debate prep (v3 base + structured JSON layers). */
export default function DebatePrepV3Page() {
  const v4 = loadDebateIntelligenceV4Packet();

  return (
    <div className="mx-auto max-w-7xl text-kelly-text">
      <V4PageHeader
        eyebrow="Debate prep · v4"
        title="Kim Hammer rehearsal briefing"
        description="Primary rehearsal surface: each numbered section opens with an operator guide (why, setup, in-debate use, trail use, ties). Work top-to-bottom once, then day-of focus on sections 4, 6–8, 19, and 28. Stand-and-deliver the rehearsal deck before reading paragraphs aloud."
        guide={getSurfaceGuide("debatePrepPage")}
      >
        <V4BackLinks />
        <Link href="/admin/intelligence/debate-command" className="rounded-full border border-kelly-navy/30 px-3 py-1 text-xs font-bold text-kelly-navy">
          Debate command
        </Link>
      </V4PageHeader>

      <V4KellyNarrativeFrame />

      <V4OpponentContrastPlaybookPanel />
      <V4AnchorBillsPlaybookIndex showFullPanels />

      <p className="mb-4 rounded-lg border border-amber-200/50 bg-amber-50/50 px-3 py-2 text-xs text-amber-950">
        {v4.hub.claims.supported.length} supported · {v4.hub.claims.partial.length} partial ·{" "}
        {v4.hub.claims.needsResearch.length} need more research · archive confidence {v4.executiveBrief.archiveConfidenceScore}
        /100
      </p>

      <V4ExecutiveBriefPanel brief={v4.executiveBrief} scorecard={v4.readinessScorecard} />

      <section className="mb-8">
        <h2 className="mb-3 text-sm font-bold uppercase text-kelly-navy">Rehearsal deck</h2>
        <V4RehearsalDeck cards={v4.rehearsalDeck} />
      </section>

      <section className="mb-8">
        <h2 className="mb-3 text-sm font-bold uppercase text-kelly-navy">Likely arguments + rebuttal bridges</h2>
        <V4ArgumentMap arguments={v4.likelyArguments} rebuttals={v4.rebuttalPlaybook} />
      </section>

      <section className="mb-4">
        <h2 className="mb-3 text-sm font-bold uppercase text-kelly-navy">Full prep packet</h2>
        <V4DebatePrepWithNav sections={v4.debatePrepSectionsV4} />
      </section>
    </div>
  );
}
