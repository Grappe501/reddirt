import Link from "next/link";
import { Phase16P9UpgradePassPanel } from "@/components/admin/intelligence/Phase16P9UpgradePassPanel";
import { V4BackLinks, V4PageHeader } from "@/components/admin/intelligence/v4/V4PageHeader";
import {
  assertPhase16P9Bar,
  computePhase16P9UpgradePass,
  SRE_CLOSURE_HUB_HREF,
} from "@/lib/intelligence/v4/phase16P9Closure";
import { PHASE16_SRE_CHECKPOINT_IDS } from "@/lib/intelligence/v4/phase16P9SreClosureDepth";

export const dynamic = "force-dynamic";

export default function Phase16P9UpgradePage() {
  const report = computePhase16P9UpgradePass();
  const bar = assertPhase16P9Bar();

  return (
    <div className="mx-auto max-w-7xl text-kelly-text">
      <V4PageHeader
        eyebrow="Intelligence upgrade · Phase 16 P9"
        title="SRE stack closure"
        description="Nine checkpoints aggregating P0–P8 — stack average ≥90%, staff coach STAFF-only, iPad player wired, nav cap enforced."
      >
        <V4BackLinks />
        <Link
          href={SRE_CLOSURE_HUB_HREF}
          className="rounded-full border border-amber-400 bg-amber-50 px-3 py-1 text-xs font-bold text-amber-950"
        >
          SRE closure hub
        </Link>
        <Link
          href="/admin/intelligence/live-event"
          className="rounded-full border border-orange-400 bg-orange-50 px-3 py-1 text-xs font-bold text-orange-950"
        >
          Live event (P8)
        </Link>
      </V4PageHeader>

      <Phase16P9UpgradePassPanel report={report} />

      <section className="mb-8 rounded-xl border border-kelly-text/10 bg-white p-5">
        <h2 className="font-heading text-lg font-bold text-kelly-navy">Exit gate</h2>
        <p className={`mt-2 text-sm font-semibold ${bar.ok ? "text-emerald-700" : "text-rose-700"}`}>
          {bar.ok ? "Phase 16 P9 bar met — SRE stack closed" : bar.message}
        </p>
        {!bar.ok ? (
          <p className="mt-2 text-xs text-kelly-muted">
            Run: <code>npx tsx scripts/test-phase16-sre-closure.ts</code>
          </p>
        ) : null}
      </section>

      <section className="space-y-3">
        <h2 className="font-heading text-lg font-bold text-kelly-navy">SRE checkpoints ({PHASE16_SRE_CHECKPOINT_IDS.length})</h2>
        {PHASE16_SRE_CHECKPOINT_IDS.map((checkpointId) => (
          <article key={checkpointId} className="rounded-xl border border-amber-100 bg-white p-4 text-sm">
            <p className="font-bold text-kelly-navy">{checkpointId}</p>
          </article>
        ))}
      </section>
    </div>
  );
}
