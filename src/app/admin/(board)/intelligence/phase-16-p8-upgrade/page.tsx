import Link from "next/link";
import { Phase16P8UpgradePassPanel } from "@/components/admin/intelligence/Phase16P8UpgradePassPanel";
import { V4BackLinks, V4PageHeader } from "@/components/admin/intelligence/v4/V4PageHeader";
import {
  assertPhase16P8Bar,
  computePhase16P8UpgradePass,
  LIVE_EVENT_HUB_HREF,
} from "@/lib/intelligence/v4/phase16P8Closure";
import { LIVE_EVENT_FIELD_IDS } from "@/lib/intelligence/v4/phase16P8LiveEventDepth";

export const dynamic = "force-dynamic";

export default function Phase16P8UpgradePage() {
  const report = computePhase16P8UpgradePass();
  const bar = assertPhase16P8Bar();

  return (
    <div className="mx-auto max-w-7xl text-kelly-text">
      <V4PageHeader
        eyebrow="Intelligence upgrade · Phase 16 P8"
        title="Live event mode"
        description="ACCA countdown card and shortest stage-safe day-of run-of-show for clerk week and live env."
      >
        <V4BackLinks />
        <Link
          href={LIVE_EVENT_HUB_HREF}
          className="rounded-full border border-orange-400 bg-orange-50 px-3 py-1 text-xs font-bold text-orange-950"
        >
          Live event hub
        </Link>
        <Link
          href="/admin/intelligence/rehearsal-coach"
          className="rounded-full border border-violet-400 bg-violet-50 px-3 py-1 text-xs font-bold text-violet-950"
        >
          Staff coach (P7)
        </Link>
      </V4PageHeader>

      <Phase16P8UpgradePassPanel report={report} />

      <section className="mb-8 rounded-xl border border-kelly-text/10 bg-white p-5">
        <h2 className="font-heading text-lg font-bold text-kelly-navy">Exit gate</h2>
        <p className={`mt-2 text-sm font-semibold ${bar.ok ? "text-emerald-700" : "text-rose-700"}`}>
          {bar.ok ? "Phase 16 P8 bar met" : bar.message}
        </p>
        {!bar.ok ? (
          <p className="mt-2 text-xs text-kelly-muted">
            Run: <code>npx tsx scripts/test-phase16-p8-live-event.ts</code>
          </p>
        ) : null}
      </section>

      <section className="space-y-3">
        <h2 className="font-heading text-lg font-bold text-kelly-navy">Live event fields ({LIVE_EVENT_FIELD_IDS.length})</h2>
        {LIVE_EVENT_FIELD_IDS.map((fieldId) => (
          <article key={fieldId} className="rounded-xl border border-orange-100 bg-white p-4 text-sm">
            <p className="font-bold text-kelly-navy">{fieldId}</p>
          </article>
        ))}
      </section>
    </div>
  );
}
