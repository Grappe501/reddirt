import Link from "next/link";
import { Phase16P6UpgradePassPanel } from "@/components/admin/intelligence/Phase16P6UpgradePassPanel";
import { V4BackLinks, V4PageHeader } from "@/components/admin/intelligence/v4/V4PageHeader";
import {
  assertPhase16P6Bar,
  computePhase16P6UpgradePass,
  REHEARSAL_HISTORY_HUB_HREF,
} from "@/lib/intelligence/v4/phase16P6Closure";
import { ACTIVE_SESSION_FIELD_IDS } from "@/lib/intelligence/v4/phase16P6SessionMemoryDepth";

export const dynamic = "force-dynamic";

export default function Phase16P6UpgradePage() {
  const report = computePhase16P6UpgradePass();
  const bar = assertPhase16P6Bar();

  return (
    <div className="mx-auto max-w-7xl text-kelly-text">
      <V4PageHeader
        eyebrow="Intelligence upgrade · Phase 16 P6"
        title="Session memory"
        description="Rehearsal session state persistence with continue CTA on command home and staff reset API."
      >
        <V4BackLinks />
        <Link
          href={REHEARSAL_HISTORY_HUB_HREF}
          className="rounded-full border border-sky-400 bg-sky-50 px-3 py-1 text-xs font-bold text-sky-950"
        >
          Rehearsal history hub
        </Link>
        <Link
          href="/admin/intelligence/ipad-drill-player"
          className="rounded-full border border-cyan-400 bg-cyan-50 px-3 py-1 text-xs font-bold text-cyan-950"
        >
          iPad drill player (P5)
        </Link>
      </V4PageHeader>

      <Phase16P6UpgradePassPanel report={report} />

      <section className="mb-8 rounded-xl border border-kelly-text/10 bg-white p-5">
        <h2 className="font-heading text-lg font-bold text-kelly-navy">Exit gate</h2>
        <p className={`mt-2 text-sm font-semibold ${bar.ok ? "text-emerald-700" : "text-rose-700"}`}>
          {bar.ok ? "Phase 16 P6 bar met" : bar.message}
        </p>
        {!bar.ok ? (
          <p className="mt-2 text-xs text-kelly-muted">
            Run: <code>npx tsx scripts/test-phase16-p6-session-memory.ts</code>
          </p>
        ) : null}
      </section>

      <section className="space-y-3">
        <h2 className="font-heading text-lg font-bold text-kelly-navy">Active session fields ({ACTIVE_SESSION_FIELD_IDS.length})</h2>
        {ACTIVE_SESSION_FIELD_IDS.map((fieldId) => (
          <article key={fieldId} className="rounded-xl border border-sky-100 bg-white p-4 text-sm">
            <p className="font-bold text-kelly-navy">{fieldId}</p>
          </article>
        ))}
      </section>
    </div>
  );
}
