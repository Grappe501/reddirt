import Link from "next/link";
import { redirect } from "next/navigation";
import { loadSupremeWorkbenchPacket } from "@/lib/intelligence/v4/supremeWorkbench";
import { diligenceHubSummary } from "@/lib/intelligence/v4/kellyCourtDiligenceLog";
import { computePhaseAUpgradePass } from "@/lib/intelligence/v4/phaseAUpgradePass";
import { computePhase3UpgradePass, getCommandSurfaceFiveLayer } from "@/lib/intelligence/v4/phase3DebateSpineDepth";
import { V4SupremeWorkbenchPanel } from "@/components/admin/intelligence/v4/V4SupremeWorkbenchPanel";
import { PhaseAUpgradePassPanel } from "@/components/admin/intelligence/PhaseAUpgradePassPanel";
import { Phase3UpgradePassPanel } from "@/components/admin/intelligence/Phase3UpgradePassPanel";
import { DebateSpineFiveLayerChrome } from "@/components/admin/intelligence/DebateSpineFiveLayerChrome";
import { NsiStaffResearchNavPanel } from "@/components/admin/intelligence/NsiStaffResearchNavPanel";
import { DebatePrepDepthNavPanel } from "@/components/admin/intelligence/DebatePrepDepthNavPanel";
import { KimHammerModuleNavPanel } from "@/components/admin/intelligence/KimHammerModuleNavPanel";
import { Tier4CoreSpineNavPanel } from "@/components/admin/intelligence/Tier4CoreSpineNavPanel";
import { V4BackLinks, V4PageHeader } from "@/components/admin/intelligence/v4/V4PageHeader";
import { isCountyClerkPrimaryAudience } from "@/lib/intelligence/v4/debateAudienceMode";
import { resolveIntelligenceNavProfileClient } from "@/lib/intelligence/v4/roleBasedNavProfile";
import { CANDIDATE_COMMAND_HOME_HREF } from "@/lib/intelligence/v4/phase15CandidateCommandDepth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default function SupremeWorkbenchPage() {
  const profile = resolveIntelligenceNavProfileClient(isCountyClerkPrimaryAudience());
  if (profile !== "STAFF") {
    redirect(CANDIDATE_COMMAND_HOME_HREF);
  }

  const packet = loadSupremeWorkbenchPacket();
  const clerkWeek = isCountyClerkPrimaryAudience();
  const diligenceSummary = diligenceHubSummary();
  const kellyRow = diligenceSummary.find((r) => r.subjectId === "kelly-grappe");
  const phaseA = computePhaseAUpgradePass();
  const phase3 = computePhase3UpgradePass();
  const fiveLayer = getCommandSurfaceFiveLayer("supreme-workbench");

  return (
    <div className="mx-auto max-w-7xl text-kelly-text">
      <V4PageHeader
        eyebrow={clerkWeek ? "Supreme workbench · county clerks week" : "Supreme workbench · debate intelligence v6"}
        title="Campaign debate prep & opposition strategy command"
        description="The unified operator surface: live readiness from every intelligence module, debate-day sequences, trap lanes, priority actions, and build gaps — one screen before stage."
      >
        <V4BackLinks />
        <Link
          href="/admin/intelligence/debate-command"
          className="rounded-full border border-kelly-navy/30 px-3 py-1 text-xs font-bold text-kelly-navy"
        >
          Debate command
        </Link>
        <Link
          href="/admin/intelligence/strategy-philosophy-hub"
          className="rounded-full border border-indigo-300 bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-950"
        >
          Strategy & philosophy
        </Link>
        <Link
          href="/admin/intelligence/debate-prep/psychology-manual"
          className="rounded-full border border-fuchsia-300 bg-fuchsia-50 px-3 py-1 text-xs font-bold text-fuchsia-950"
        >
          Psychology manual
        </Link>
        <Link
          href="/admin/intelligence/diligence"
          className="rounded-full border border-rose-300 bg-rose-50 px-3 py-1 text-xs font-bold text-rose-950"
        >
          Diligence hub
        </Link>
        <Link
          href="/admin/intelligence/field-book"
          className="rounded-full border border-kelly-gold/60 px-3 py-1 text-xs font-bold text-kelly-navy"
        >
          The Field Book
        </Link>
        <Link
          href="/admin/intelligence/phase-3-upgrade"
          className="rounded-full border border-violet-300 bg-violet-50 px-3 py-1 text-xs font-bold text-violet-950"
        >
          Phase 3 waves
        </Link>
      </V4PageHeader>

      {fiveLayer ? (
        <div className="mb-6">
          <DebateSpineFiveLayerChrome depth={fiveLayer} />
        </div>
      ) : null}

      <V4SupremeWorkbenchPanel packet={packet} variant="full" />

      <Phase3UpgradePassPanel report={phase3} compact />

      <PhaseAUpgradePassPanel report={phaseA} compact />

      <section className="mt-8 rounded-xl border border-amber-200 bg-amber-50/40 p-5 text-xs">
        <h2 className="text-sm font-bold uppercase text-amber-950">
          Phase A diligence ({kellyRow?.pct ?? 0}% Kelly searches complete)
        </h2>
        <p className="mt-2 text-kelly-muted">
          Court/financial five-search checklists for Kelly, Hammer, and Pakko — log with counsel review flags.
        </p>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {diligenceSummary.map((row) => (
            <Link
              key={row.subjectId}
              href={`/admin/intelligence/diligence/${row.subjectId}`}
              className="rounded-lg border border-kelly-text/10 bg-white p-3 hover:border-kelly-navy/30"
            >
              <p className="font-bold text-kelly-navy">{row.displayName}</p>
              <p className="mt-1 text-lg font-bold text-amber-900">{row.pct}%</p>
              <p className="text-[10px] text-kelly-muted">{row.incomplete} remaining</p>
            </Link>
          ))}
        </div>
        <Link href="/admin/intelligence/diligence" className="mt-4 inline-block font-bold text-kelly-navy underline">
          Open diligence hub — log searches →
        </Link>
      </section>

      <NsiStaffResearchNavPanel compact />
      <DebatePrepDepthNavPanel compact />
      <KimHammerModuleNavPanel compact />
      <Tier4CoreSpineNavPanel compact />
    </div>
  );
}
