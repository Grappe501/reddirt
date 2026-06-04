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
import { V4DebateWarRoomPanel } from "@/components/admin/intelligence/v4/V4DebateWarRoomPanel";
import { loadDebateWarRoomP4Packet } from "@/lib/intelligence/v4/debateWarRoomP4";
import { V4OpponentContrastPlaybookPanel } from "@/components/admin/intelligence/v4/V4OpponentContrastPlaybookPanel";
import { KellyDebateCoachingPanel } from "@/components/admin/intelligence/KellyDebateCoachingPanel";
import { buildVideoArchiveRoomPacket } from "@/lib/legislature/videoArchiveRoom";

/** Intelligence v4 — 28-section debate prep (v3 base + structured JSON layers). */
export default function DebatePrepV3Page() {
  const v4 = loadDebateIntelligenceV4Packet();
  const warRoom = loadDebateWarRoomP4Packet();
  const archive = buildVideoArchiveRoomPacket();

  return (
    <div className="mx-auto max-w-7xl text-kelly-text">
      <V4PageHeader
        eyebrow="Debate prep · v4"
        title="Full debate prep packet — 28 deep drill-downs"
        description="Kelly's first debate vs a 25+ year legislator: every section has a full drill-down (setup traps, rebuttals, sample scripts, zingers, first-timer mistakes). Open each section's drill-down, rehearse standing out loud, then day-of focus sections 4, 6–8, 19, and 28. Claims gate before any public line."
        guide={getSurfaceGuide("debatePrepPage")}
      >
        <V4BackLinks />
        <Link href="/admin/intelligence/debate-command" className="rounded-full border border-kelly-navy/30 px-3 py-1 text-xs font-bold text-kelly-navy">
          Debate command
        </Link>
        <Link href="/admin/intelligence/kelly-debate-coaching" className="rounded-full border border-violet-300 bg-violet-50 px-3 py-1 text-xs font-bold text-violet-950">
          Coaching &amp; scripts
        </Link>
        <Link href="/admin/intelligence/video-archive-room" className="rounded-full border border-kelly-navy/30 px-3 py-1 text-xs font-bold text-kelly-navy">
          Video archive
        </Link>
      </V4PageHeader>

      <article className="mb-6 rounded-xl border-2 border-amber-200 bg-amber-50/40 p-4 text-sm text-amber-950">
        <p className="font-bold uppercase tracking-wide text-amber-900">First debate readiness</p>
        <p className="mt-2">
          You have not debated on stage before; Senator Hammer has 25+ years of public argument habit. Use each section&apos;s{" "}
          <strong>full drill-down</strong> — rebuttal scripts, setup traps, sample lines, and zingers — then rehearse{" "}
          <strong>standing, out loud</strong>. Short beats clever. Claims gate before any public line.
        </p>
      </article>

      <V4KellyNarrativeFrame />

      <KellyDebateCoachingPanel suggestions={archive.opponentMedia.kellySuggestions} compact />

      <V4OpponentContrastPlaybookPanel />
      <V4DebateWarRoomPanel packet={warRoom} variant="compact" />
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
