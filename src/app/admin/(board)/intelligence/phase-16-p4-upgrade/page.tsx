import Link from "next/link";
import { Phase16P4UpgradePassPanel } from "@/components/admin/intelligence/Phase16P4UpgradePassPanel";
import { V4BackLinks, V4PageHeader } from "@/components/admin/intelligence/v4/V4PageHeader";
import {
  assertPhase16P4Bar,
  computePhase16P4UpgradePass,
  SESSION_DEBRIEF_HUB_HREF,
} from "@/lib/intelligence/v4/phase16P4Closure";
import { buildPreStageChecklist } from "@/lib/intelligence/v4/phase16P4SessionDebrief";

export const dynamic = "force-dynamic";

export default function Phase16P4UpgradePage() {
  const report = computePhase16P4UpgradePass();
  const bar = assertPhase16P4Bar();
  const checklist = buildPreStageChecklist();

  return (
    <div className="mx-auto max-w-7xl text-kelly-text">
      <V4PageHeader
        eyebrow="Intelligence upgrade · Phase 16 P4"
        title="Session debrief"
        description="Five-item pre-stage checklist and post-session capture API wired to human action queue review."
      >
        <V4BackLinks />
        <Link
          href={SESSION_DEBRIEF_HUB_HREF}
          className="rounded-full border border-indigo-400 bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-950"
        >
          Session debrief hub
        </Link>
        <Link
          href="/admin/intelligence/drill-queue"
          className="rounded-full border border-teal-400 bg-teal-50 px-3 py-1 text-xs font-bold text-teal-950"
        >
          Drill queue (P3)
        </Link>
      </V4PageHeader>

      <Phase16P4UpgradePassPanel report={report} />

      <section className="mb-8 rounded-xl border border-kelly-text/10 bg-white p-5">
        <h2 className="font-heading text-lg font-bold text-kelly-navy">Exit gate</h2>
        <p className={`mt-2 text-sm font-semibold ${bar.ok ? "text-emerald-700" : "text-rose-700"}`}>
          {bar.ok ? "Phase 16 P4 bar met" : bar.message}
        </p>
        {!bar.ok ? (
          <p className="mt-2 text-xs text-kelly-muted">
            Run: <code>npx tsx scripts/test-phase16-p4-session-debrief.ts</code>
          </p>
        ) : null}
      </section>

      <section className="space-y-3">
        <h2 className="font-heading text-lg font-bold text-kelly-navy">Pre-stage checklist ({checklist.length})</h2>
        {checklist.map((item) => (
          <article key={item.itemId} className="rounded-xl border border-indigo-100 bg-white p-4 text-sm">
            <p className="font-bold text-kelly-navy">{item.title}</p>
            <p className="mt-1 text-[10px] text-kelly-muted">{item.statusLabel}</p>
          </article>
        ))}
      </section>
    </div>
  );
}
