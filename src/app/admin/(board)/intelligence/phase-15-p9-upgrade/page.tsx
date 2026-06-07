import Link from "next/link";
import { Phase15P9UpgradePassPanel } from "@/components/admin/intelligence/Phase15P9UpgradePassPanel";
import { V4BackLinks, V4PageHeader } from "@/components/admin/intelligence/v4/V4PageHeader";
import {
  assertPhase15P9Bar,
  computePhase15P9UpgradePass,
  listPhase15CceCheckpointSurfaces,
  CCE_CLOSURE_HUB_HREF,
} from "@/lib/intelligence/v4/phase15P9Closure";
import { getPhase15CceCheckpointOverlay } from "@/lib/intelligence/v4/phase15P9CceClosureDepth";

export const dynamic = "force-dynamic";

export default function Phase15P9UpgradePage() {
  const report = computePhase15P9UpgradePass();
  const bar = assertPhase15P9Bar();
  const checkpoints = listPhase15CceCheckpointSurfaces();

  return (
    <div className="mx-auto max-w-7xl text-kelly-text">
      <V4PageHeader
        eyebrow="Intelligence upgrade · Phase 15 P9"
        title="CCE closure"
        description="Exit gate for all eight P0+P1–P8 sub-passes — stack average ≥90%, staff backstage enforced, candidate nav ≤25 links, and Phase 15 Candidate Command Experience complete."
      >
        <V4BackLinks />
        <Link
          href={CCE_CLOSURE_HUB_HREF}
          className="rounded-full border border-indigo-400 bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-950"
        >
          CCE closure hub
        </Link>
        <Link
          href="/admin/intelligence/staff-backstage"
          className="rounded-full border border-violet-400 bg-violet-50 px-3 py-1 text-xs font-bold text-violet-950"
        >
          Staff backstage (P8)
        </Link>
      </V4PageHeader>

      <Phase15P9UpgradePassPanel report={report} />

      <section className="mb-8 rounded-xl border border-kelly-text/10 bg-white p-5">
        <h2 className="font-heading text-lg font-bold text-kelly-navy">Exit gate</h2>
        <p className={`mt-2 text-sm font-semibold ${bar.ok ? "text-emerald-700" : "text-rose-700"}`}>
          {bar.ok ? "Phase 15 P9 bar met — CCE closure complete" : bar.message}
        </p>
        {!bar.ok ? (
          <p className="mt-2 text-xs text-kelly-muted">
            Run: <code>npx tsx scripts/test-phase15-cce-closure.ts</code>
          </p>
        ) : null}
      </section>

      <section className="space-y-3">
        {checkpoints.map((cp) => {
          const overlay = getPhase15CceCheckpointOverlay(cp.checkpointId);
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
