import Link from "next/link";
import { Phase16P5UpgradePassPanel } from "@/components/admin/intelligence/Phase16P5UpgradePassPanel";
import { V4BackLinks, V4PageHeader } from "@/components/admin/intelligence/v4/V4PageHeader";
import {
  assertPhase16P5Bar,
  computePhase16P5UpgradePass,
  IPAD_DRILL_PLAYER_HREF,
} from "@/lib/intelligence/v4/phase16P5Closure";
import { IPAD_DRILL_PLAYER_CONTROLS } from "@/lib/intelligence/v4/phase16P5IpadDrillPlayer";

export const dynamic = "force-dynamic";

export default function Phase16P5UpgradePage() {
  const report = computePhase16P5UpgradePass();
  const bar = assertPhase16P5Bar();

  return (
    <div className="mx-auto max-w-7xl text-kelly-text">
      <V4PageHeader
        eyebrow="Intelligence upgrade · Phase 16 P5"
        title="iPad drill player"
        description="Full-screen stepper in candidate iPad shell with Exit · Prev · Next · Timer bottom nav."
      >
        <V4BackLinks />
        <Link
          href={IPAD_DRILL_PLAYER_HREF}
          className="rounded-full border border-cyan-400 bg-cyan-50 px-3 py-1 text-xs font-bold text-cyan-950"
        >
          iPad drill player
        </Link>
        <Link
          href="/admin/intelligence/drill-queue"
          className="rounded-full border border-teal-400 bg-teal-50 px-3 py-1 text-xs font-bold text-teal-950"
        >
          Drill queue (P3)
        </Link>
      </V4PageHeader>

      <Phase16P5UpgradePassPanel report={report} />

      <section className="mb-8 rounded-xl border border-kelly-text/10 bg-white p-5">
        <h2 className="font-heading text-lg font-bold text-kelly-navy">Exit gate</h2>
        <p className={`mt-2 text-sm font-semibold ${bar.ok ? "text-emerald-700" : "text-rose-700"}`}>
          {bar.ok ? "Phase 16 P5 bar met" : bar.message}
        </p>
        {!bar.ok ? (
          <p className="mt-2 text-xs text-kelly-muted">
            Run: <code>npx tsx scripts/test-phase16-p5-ipad-drill-player.ts</code>
          </p>
        ) : null}
      </section>

      <section className="space-y-3">
        <h2 className="font-heading text-lg font-bold text-kelly-navy">Player controls ({IPAD_DRILL_PLAYER_CONTROLS.length})</h2>
        {IPAD_DRILL_PLAYER_CONTROLS.map((control) => (
          <article key={control.controlId} className="rounded-xl border border-cyan-100 bg-white p-4 text-sm">
            <p className="font-bold text-kelly-navy">{control.label}</p>
            <p className="mt-1 text-xs text-kelly-muted">{control.description}</p>
          </article>
        ))}
      </section>
    </div>
  );
}
