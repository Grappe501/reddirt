import Link from "next/link";
import { CandidateDemoModePanel } from "@/components/admin/intelligence/CandidateDemoModePanel";
import { Phase15P6UpgradePassPanel } from "@/components/admin/intelligence/Phase15P6UpgradePassPanel";
import { V4BackLinks, V4PageHeader } from "@/components/admin/intelligence/v4/V4PageHeader";
import { DEMO_MODE_DEPLOY_HINT, isIntelligenceDemoMode } from "@/lib/intelligence/v4/intelligenceDemoMode";
import {
  buildDemoModeSummary,
  getDemoTonightScenario,
  listDemoScriptSteps,
} from "@/lib/intelligence/v4/phase15P6DemoMode";
import { computePhase15P6UpgradePass } from "@/lib/intelligence/v4/phase15P6Closure";

export const dynamic = "force-dynamic";

export default function DemoModeHubPage() {
  const report = computePhase15P6UpgradePass();
  const steps = listDemoScriptSteps();
  const scenario = getDemoTonightScenario();
  const summary = buildDemoModeSummary(isIntelligenceDemoMode());

  return (
    <div className="mx-auto max-w-7xl text-kelly-text">
      <V4PageHeader
        eyebrow="Intelligence · Phase 15 · P6"
        title="Demo mode"
        description="Purchase-ready walkthrough — seeded tonight scenario and 15-minute script linking command home, trap lane, philosophy, opposition, clerk pocket card, and iPad deploy."
      >
        <V4BackLinks />
        <Link
          href="/admin/intelligence"
          className="rounded-full border border-indigo-400 bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-950"
        >
          Command home
        </Link>
        <Link
          href="/admin/intelligence/county-clerk-week/acca-summer-conference"
          className="rounded-full border border-rose-400 bg-rose-50 px-3 py-1 text-xs font-bold text-rose-950"
        >
          ACCA panel prep
        </Link>
      </V4PageHeader>

      <Phase15P6UpgradePassPanel report={report} compact />

      <section className="mb-8 rounded-xl border border-teal-100 bg-white p-5 text-sm">
        <p className="font-bold text-kelly-navy">{scenario.title}</p>
        <p className="mt-2 text-kelly-muted">
          {scenario.venue} · {scenario.eventDate} · {scenario.audience}
        </p>
        <p className="mt-3 text-kelly-text">{scenario.pitchLine}</p>
        <p className="mt-3 text-xs text-kelly-muted">
          {summary.stepCount} script steps · ~{summary.totalMinutes} minutes · readiness target{" "}
          {scenario.readinessTargetPct}%
        </p>
        <p className="mt-3 rounded-lg border border-teal-100 bg-teal-50/40 p-3 text-[10px] text-teal-950">
          {DEMO_MODE_DEPLOY_HINT}
        </p>
      </section>

      <section className="mb-4">
        <h2 className="mb-3 font-heading text-lg font-bold text-kelly-navy">15-minute purchase script</h2>
        <CandidateDemoModePanel steps={steps} showStaffNotes />
      </section>

      <section id="close" className="rounded-xl border border-kelly-text/10 bg-kelly-page/30 p-5 text-sm">
        <h2 className="font-heading text-lg font-bold text-kelly-navy">Close</h2>
        <p className="mt-2 text-kelly-muted">{scenario.closeLine}</p>
      </section>
    </div>
  );
}
