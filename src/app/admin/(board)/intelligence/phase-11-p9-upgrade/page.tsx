import Link from "next/link";
import { Phase11P9UpgradePassPanel } from "@/components/admin/intelligence/Phase11P9UpgradePassPanel";
import { V4BackLinks, V4PageHeader } from "@/components/admin/intelligence/v4/V4PageHeader";
import {
  assertPhase11P9Bar,
  computePhase11P9UpgradePass,
  listPhase11StackCheckpointSurfaces,
  PHASE_11_STACK_CLOSURE_HUB_HREF,
} from "@/lib/intelligence/v4/phase11P9Closure";
import { getPhase11StackCheckpointOverlay } from "@/lib/intelligence/v4/phase11P9StackClosureDepth";

export const dynamic = "force-dynamic";

export default function Phase11P9UpgradePage() {
  const report = computePhase11P9UpgradePass();
  const bar = assertPhase11P9Bar();
  const checkpoints = listPhase11StackCheckpointSurfaces();

  return (
    <div className="mx-auto max-w-7xl text-kelly-text">
      <V4PageHeader
        eyebrow="Intelligence upgrade · Phase 11 P9"
        title="Phase 11 stack closure"
        description="Exit gate for all nine P0–P8 sub-passes — stack average ≥90%, promotion pipeline ready, and Phase 11 strategy-manual canon workflow complete."
      >
        <V4BackLinks />
        <Link
          href={PHASE_11_STACK_CLOSURE_HUB_HREF}
          className="rounded-full border border-indigo-400 bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-950"
        >
          Stack closure hub
        </Link>
        <Link
          href="/admin/intelligence/field-book-promotion-execution"
          className="rounded-full border border-indigo-400 bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-950"
        >
          Promotion execution (P8)
        </Link>
      </V4PageHeader>

      <Phase11P9UpgradePassPanel report={report} />

      <section className="mb-8 rounded-xl border border-kelly-text/10 bg-white p-5">
        <h2 className="font-heading text-lg font-bold text-kelly-navy">Exit gate</h2>
        <p className={`mt-2 text-sm font-semibold ${bar.ok ? "text-emerald-700" : "text-rose-700"}`}>
          {bar.ok ? "Phase 11 P9 bar met — stack closure complete" : bar.message}
        </p>
        {!bar.ok ? (
          <p className="mt-2 text-xs text-kelly-muted">
            Run: <code>npx tsx scripts/test-phase11-p9-stack-closure.ts</code>
          </p>
        ) : null}
      </section>

      <section className="space-y-3">
        {checkpoints.map((cp) => {
          const overlay = getPhase11StackCheckpointOverlay(cp.checkpointId);
          return (
            <article key={cp.checkpointId} className="rounded-xl border border-indigo-100 bg-white p-4 text-sm">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <Link href={cp.upgradeHref} className="font-bold text-kelly-navy underline">
                  {cp.passLabel}
                </Link>
                <span className="font-mono text-xs text-kelly-muted">{cp.completionPct}%</span>
              </div>
              <p className="mt-1 text-xs text-kelly-muted">{overlay.closureSteps[0]}</p>
            </article>
          );
        })}
      </section>
    </div>
  );
}
