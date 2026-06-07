import Link from "next/link";
import { Phase16P7UpgradePassPanel } from "@/components/admin/intelligence/Phase16P7UpgradePassPanel";
import { V4BackLinks, V4PageHeader } from "@/components/admin/intelligence/v4/V4PageHeader";
import {
  assertPhase16P7Bar,
  computePhase16P7UpgradePass,
  REHEARSAL_COACH_HUB_HREF,
} from "@/lib/intelligence/v4/phase16P7Closure";
import { COACH_OVERLAY_FIELD_IDS } from "@/lib/intelligence/v4/phase16P7StaffCoachDepth";

export const dynamic = "force-dynamic";

export default function Phase16P7UpgradePage() {
  const report = computePhase16P7UpgradePass();
  const bar = assertPhase16P7Bar();

  return (
    <div className="mx-auto max-w-7xl text-kelly-text">
      <V4PageHeader
        eyebrow="Intelligence upgrade · Phase 16 P7"
        title="Staff coach overlay"
        description="STAFF-only coach hub — assign scenario and pin drills surfaced on command home for Kelly."
      >
        <V4BackLinks />
        <Link
          href={REHEARSAL_COACH_HUB_HREF}
          className="rounded-full border border-violet-400 bg-violet-50 px-3 py-1 text-xs font-bold text-violet-950"
        >
          Rehearsal coach hub
        </Link>
        <Link
          href="/admin/intelligence/rehearsal-history"
          className="rounded-full border border-sky-400 bg-sky-50 px-3 py-1 text-xs font-bold text-sky-950"
        >
          Session memory (P6)
        </Link>
      </V4PageHeader>

      <Phase16P7UpgradePassPanel report={report} />

      <section className="mb-8 rounded-xl border border-kelly-text/10 bg-white p-5">
        <h2 className="font-heading text-lg font-bold text-kelly-navy">Exit gate</h2>
        <p className={`mt-2 text-sm font-semibold ${bar.ok ? "text-emerald-700" : "text-rose-700"}`}>
          {bar.ok ? "Phase 16 P7 bar met" : bar.message}
        </p>
        {!bar.ok ? (
          <p className="mt-2 text-xs text-kelly-muted">
            Run: <code>npx tsx scripts/test-phase16-p7-staff-coach.ts</code>
          </p>
        ) : null}
      </section>

      <section className="space-y-3">
        <h2 className="font-heading text-lg font-bold text-kelly-navy">Coach overlay fields ({COACH_OVERLAY_FIELD_IDS.length})</h2>
        {COACH_OVERLAY_FIELD_IDS.map((fieldId) => (
          <article key={fieldId} className="rounded-xl border border-violet-100 bg-white p-4 text-sm">
            <p className="font-bold text-kelly-navy">{fieldId}</p>
          </article>
        ))}
      </section>
    </div>
  );
}
