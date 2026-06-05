import Link from "next/link";
import { composeIntelligenceCommandCenter } from "@/lib/intelligence/commandCenter/intelligenceCommandCenter";
import { isIntelligenceOppositionDebateLaunchMode } from "@/lib/intelligence/intelligenceLaunchMode";
import { tryIntelligenceLoad } from "@/lib/intelligence/safeIntelligenceLoad";
import { loadDebateIntelligenceV4HubPacket } from "@/lib/intelligence/v4/debateIntelligenceV4";
import { V4ExecutiveBriefPanel } from "@/components/admin/intelligence/v4/V4ExecutiveBrief";
import { V4BackLinks, V4PageHeader } from "@/components/admin/intelligence/v4/V4PageHeader";
import { CommandCenterDashboard } from "./CommandCenterDashboard";
import { NsiStaffResearchNavPanel } from "@/components/admin/intelligence/NsiStaffResearchNavPanel";
import { Tier4CoreSpineNavPanel } from "@/components/admin/intelligence/Tier4CoreSpineNavPanel";

export const dynamic = "force-dynamic";
export const maxDuration = 26;

export default async function IntelligenceCommandCenterPage() {
  const launchMode = isIntelligenceOppositionDebateLaunchMode();
  const snapshot = launchMode
    ? null
    : tryIntelligenceLoad(
        "command-center",
        () =>
          composeIntelligenceCommandCenter(undefined, {
            syncActionQueue: true,
          }),
        null,
      );
  if (!snapshot) {
    const v4 = loadDebateIntelligenceV4HubPacket();
    return (
      <div className="mx-auto max-w-7xl text-kelly-text">
        <V4PageHeader
          eyebrow="Intel command center · v4 fallback"
          title="Lightweight debate overview"
          description="Full NSI-16 command center snapshot did not load within launch limits. Use v4 executive brief and primary debate routes below."
        >
          <V4BackLinks />
          <Link href="/admin/intelligence/debate-command" className="rounded-full border border-kelly-navy/30 px-3 py-1 text-xs font-bold text-kelly-navy">
            Debate command
          </Link>
        </V4PageHeader>
        <V4ExecutiveBriefPanel brief={v4.executiveBrief} scorecard={v4.readinessScorecard} />
        <NsiStaffResearchNavPanel />
        <Tier4CoreSpineNavPanel compact />
        <p className="mt-4 text-xs text-kelly-muted">
          Staff: retry command center off-peak or disable launch mode after debate week for the full war-room dashboard.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl text-kelly-text">
      <header className="mb-6 border-b border-kelly-text/10 pb-4">
        <p className="font-body text-[10px] font-bold uppercase tracking-[0.22em] text-kelly-subtle">
          NSI-16 · Campaign Operations Command Center
        </p>
        <h1 className="font-heading text-2xl font-bold">Intelligence Command Center</h1>
        <p className="mt-2 max-w-4xl font-body text-sm leading-relaxed text-kelly-muted">
          Daily operator war room — one surface for what changed, what matters, what is blocked, and what requires human
          review. Composes NSI-1–15 systems; does not execute actions or publish content.
        </p>
        <div className="mt-3 flex flex-wrap gap-2 text-xs">
          <Link
            href="/admin/intelligence"
            className="rounded border px-2 py-1 font-semibold text-kelly-navy"
          >
            Intelligence hub
          </Link>
          <Link
            href={snapshot.sourceLinks.morningBrief}
            className="rounded border px-2 py-1 font-semibold text-kelly-navy"
          >
            Morning brief
          </Link>
          <Link
            href={snapshot.sourceLinks.actionQueue}
            className="rounded border border-teal-700/30 bg-teal-50 px-2 py-1 font-semibold text-teal-900"
          >
            Action queue
          </Link>
          <Link
            href={snapshot.sourceLinks.evidenceCommand}
            className="rounded border px-2 py-1 font-semibold text-kelly-navy"
          >
            Evidence Command
          </Link>
          <Link
            href={snapshot.sourceLinks.campaignMemory}
            className="rounded border border-violet-700/30 bg-violet-50 px-2 py-1 font-semibold text-violet-900"
          >
            Campaign memory
          </Link>
        </div>
      </header>

      <CommandCenterDashboard snapshot={snapshot} />
    </div>
  );
}
