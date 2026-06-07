import Link from "next/link";
import { Phase16P1UpgradePassPanel } from "@/components/admin/intelligence/Phase16P1UpgradePassPanel";
import { V4BackLinks, V4PageHeader } from "@/components/admin/intelligence/v4/V4PageHeader";
import {
  assertPhase16P1Bar,
  computePhase16P1UpgradePass,
  RUN_OF_SHOW_HUB_HREF,
} from "@/lib/intelligence/v4/phase16P1Closure";
import { listRunOfShowPresets } from "@/lib/intelligence/v4/phase16P1RunOfShow";

export const dynamic = "force-dynamic";

export default function Phase16P1UpgradePage() {
  const report = computePhase16P1UpgradePass();
  const bar = assertPhase16P1Bar();
  const presets = listRunOfShowPresets();

  return (
    <div className="mx-auto max-w-7xl text-kelly-text">
      <V4PageHeader
        eyebrow="Intelligence upgrade · Phase 16 P1"
        title="Timed run-of-show"
        description="Four duration presets with step lists linking existing prep depth — 15, 30, 45, and 60 minute rehearsal blocks."
      >
        <V4BackLinks />
        <Link
          href={RUN_OF_SHOW_HUB_HREF}
          className="rounded-full border border-orange-400 bg-orange-50 px-3 py-1 text-xs font-bold text-orange-950"
        >
          Run-of-show hub
        </Link>
        <Link
          href="/admin/intelligence/rehearsal"
          className="rounded-full border border-amber-400 bg-amber-50 px-3 py-1 text-xs font-bold text-amber-950"
        >
          Session launcher (P0)
        </Link>
      </V4PageHeader>

      <Phase16P1UpgradePassPanel report={report} />

      <section className="mb-8 rounded-xl border border-kelly-text/10 bg-white p-5">
        <h2 className="font-heading text-lg font-bold text-kelly-navy">Exit gate</h2>
        <p className={`mt-2 text-sm font-semibold ${bar.ok ? "text-emerald-700" : "text-rose-700"}`}>
          {bar.ok ? "Phase 16 P1 bar met" : bar.message}
        </p>
        {!bar.ok ? (
          <p className="mt-2 text-xs text-kelly-muted">
            Run: <code>npx tsx scripts/test-phase16-p1-run-of-show.ts</code>
          </p>
        ) : null}
      </section>

      <section className="space-y-3">
        <h2 className="font-heading text-lg font-bold text-kelly-navy">Presets ({presets.length})</h2>
        {presets.map((preset) => (
          <article key={preset.presetId} className="rounded-xl border border-orange-100 bg-white p-4 text-sm">
            <Link href={preset.launchHref} className="font-bold text-kelly-navy underline">
              {preset.title}
            </Link>
            <p className="mt-1 text-[10px] text-kelly-muted">
              {preset.durationLabel} · {preset.stepCount} steps
            </p>
          </article>
        ))}
      </section>
    </div>
  );
}
