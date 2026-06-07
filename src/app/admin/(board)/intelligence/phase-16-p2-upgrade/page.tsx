import Link from "next/link";
import { Phase16P2UpgradePassPanel } from "@/components/admin/intelligence/Phase16P2UpgradePassPanel";
import { V4BackLinks, V4PageHeader } from "@/components/admin/intelligence/v4/V4PageHeader";
import {
  assertPhase16P2Bar,
  computePhase16P2UpgradePass,
  ENCOUNTERS_HUB_HREF,
} from "@/lib/intelligence/v4/phase16P2Closure";
import { listEncounterScenarios } from "@/lib/intelligence/v4/phase16P2EncounterScenarios";

export const dynamic = "force-dynamic";

export default function Phase16P2UpgradePage() {
  const report = computePhase16P2UpgradePass();
  const bar = assertPhase16P2Bar();
  const scenarios = listEncounterScenarios();

  return (
    <div className="mx-auto max-w-7xl text-kelly-text">
      <V4PageHeader
        eyebrow="Intelligence upgrade · Phase 16 P2"
        title="Encounter scenarios"
        description="Scenario registry with primary route binds, evidence honesty rules, and ACCA summer conference anchor."
      >
        <V4BackLinks />
        <Link
          href={ENCOUNTERS_HUB_HREF}
          className="rounded-full border border-violet-400 bg-violet-50 px-3 py-1 text-xs font-bold text-violet-950"
        >
          Encounters hub
        </Link>
        <Link
          href="/admin/intelligence/rehearsal"
          className="rounded-full border border-amber-400 bg-amber-50 px-3 py-1 text-xs font-bold text-amber-950"
        >
          Session launcher (P0)
        </Link>
        <Link
          href="/admin/intelligence/run-of-show"
          className="rounded-full border border-orange-400 bg-orange-50 px-3 py-1 text-xs font-bold text-orange-950"
        >
          Run-of-show (P1)
        </Link>
      </V4PageHeader>

      <Phase16P2UpgradePassPanel report={report} />

      <section className="mb-8 rounded-xl border border-kelly-text/10 bg-white p-5">
        <h2 className="font-heading text-lg font-bold text-kelly-navy">Exit gate</h2>
        <p className={`mt-2 text-sm font-semibold ${bar.ok ? "text-emerald-700" : "text-rose-700"}`}>
          {bar.ok ? "Phase 16 P2 bar met" : bar.message}
        </p>
        {!bar.ok ? (
          <p className="mt-2 text-xs text-kelly-muted">
            Run: <code>npx tsx scripts/test-phase16-p2-encounters.ts</code>
          </p>
        ) : null}
      </section>

      <section className="space-y-3">
        <h2 className="font-heading text-lg font-bold text-kelly-navy">Scenarios ({scenarios.length})</h2>
        {scenarios.map((scenario) => (
          <article key={scenario.scenarioId} className="rounded-xl border border-violet-100 bg-white p-4 text-sm">
            <Link href={scenario.launchHref} className="font-bold text-kelly-navy underline">
              {scenario.title}
            </Link>
            <p className="mt-1 text-[10px] text-kelly-muted">
              {scenario.durationLabel} · bind: {scenario.primaryBindHref}
            </p>
          </article>
        ))}
      </section>
    </div>
  );
}
