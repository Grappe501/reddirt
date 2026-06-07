import Link from "next/link";
import { Phase15P4UpgradePassPanel } from "@/components/admin/intelligence/Phase15P4UpgradePassPanel";
import { V4BackLinks, V4PageHeader } from "@/components/admin/intelligence/v4/V4PageHeader";
import {
  assertPhase15P4Bar,
  computePhase15P4UpgradePass,
  TOP_TIER_PREP_HUB_HREF,
} from "@/lib/intelligence/v4/phase15P4Closure";
import { listTopTierPrepTonight } from "@/lib/intelligence/v4/phase15P4TopTierSurfacing";

export const dynamic = "force-dynamic";

export default function Phase15P4UpgradePage() {
  const report = computePhase15P4UpgradePass();
  const bar = assertPhase15P4Bar();
  const tonight = listTopTierPrepTonight();

  return (
    <div className="mx-auto max-w-7xl text-kelly-text">
      <V4PageHeader
        eyebrow="Intelligence upgrade · Phase 15 P4"
        title="Top-tier surfacing"
        description="Promote briefings, depth guides, and psychology to command home — stop hiding Kelly's best prep behind builder nav."
      >
        <V4BackLinks />
        <Link
          href={TOP_TIER_PREP_HUB_HREF}
          className="rounded-full border border-violet-400 bg-violet-50 px-3 py-1 text-xs font-bold text-violet-950"
        >
          Top-tier hub
        </Link>
        <Link
          href="/admin/intelligence"
          className="rounded-full border border-indigo-400 bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-950"
        >
          Command home
        </Link>
      </V4PageHeader>

      <Phase15P4UpgradePassPanel report={report} />

      <section className="mb-8 rounded-xl border border-kelly-text/10 bg-white p-5">
        <h2 className="font-heading text-lg font-bold text-kelly-navy">Exit gate</h2>
        <p className={`mt-2 text-sm font-semibold ${bar.ok ? "text-emerald-700" : "text-rose-700"}`}>
          {bar.ok ? "Phase 15 P4 bar met" : bar.message}
        </p>
        {!bar.ok ? (
          <p className="mt-2 text-xs text-kelly-muted">
            Run: <code>npx tsx scripts/test-phase15-p4-top-tier-surfacing.ts</code>
          </p>
        ) : null}
      </section>

      <section className="space-y-3">
        <h2 className="font-heading text-lg font-bold text-kelly-navy">Command home strip ({tonight.length})</h2>
        {tonight.map((item) => (
          <article key={item.id} className="rounded-xl border border-violet-100 bg-white p-4 text-sm">
            <Link href={item.href} className="font-bold text-kelly-navy underline">
              {item.title}
            </Link>
            <p className="mt-1 text-[10px] text-kelly-muted">{item.kind} · tier {item.tier}</p>
          </article>
        ))}
      </section>
    </div>
  );
}
