import Link from "next/link";
import { Phase16P0UpgradePassPanel } from "@/components/admin/intelligence/Phase16P0UpgradePassPanel";
import { V4BackLinks, V4PageHeader } from "@/components/admin/intelligence/v4/V4PageHeader";
import {
  assertPhase16P0Bar,
  computePhase16P0UpgradePass,
  REHEARSAL_HUB_HREF,
} from "@/lib/intelligence/v4/phase16P0Closure";
import { listRehearsalEncounterOptions } from "@/lib/intelligence/v4/phase16P0SessionLauncher";

export const dynamic = "force-dynamic";

export default function Phase16P0UpgradePage() {
  const report = computePhase16P0UpgradePass();
  const bar = assertPhase16P0Bar();
  const encounters = listRehearsalEncounterOptions();

  return (
    <div className="mx-auto max-w-7xl text-kelly-text">
      <V4PageHeader
        eyebrow="Intelligence upgrade · Phase 16 P0"
        title="Session launcher"
        description="Stage Rehearsal Engine entry — four encounter types and default 30-minute debate-prep run-of-show linking existing prep depth."
      >
        <V4BackLinks />
        <Link
          href={REHEARSAL_HUB_HREF}
          className="rounded-full border border-amber-400 bg-amber-50 px-3 py-1 text-xs font-bold text-amber-950"
        >
          Session launcher hub
        </Link>
        <Link
          href="/admin/intelligence"
          className="rounded-full border border-indigo-400 bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-950"
        >
          Command home
        </Link>
      </V4PageHeader>

      <Phase16P0UpgradePassPanel report={report} />

      <section className="mb-8 rounded-xl border border-kelly-text/10 bg-white p-5">
        <h2 className="font-heading text-lg font-bold text-kelly-navy">Exit gate</h2>
        <p className={`mt-2 text-sm font-semibold ${bar.ok ? "text-emerald-700" : "text-rose-700"}`}>
          {bar.ok ? "Phase 16 P0 bar met" : bar.message}
        </p>
        {!bar.ok ? (
          <p className="mt-2 text-xs text-kelly-muted">
            Run: <code>npx tsx scripts/test-phase16-p0-session-launcher.ts</code>
          </p>
        ) : null}
      </section>

      <section className="space-y-3">
        <h2 className="font-heading text-lg font-bold text-kelly-navy">Encounters ({encounters.length})</h2>
        {encounters.map((encounter) => (
          <article key={encounter.encounterId} className="rounded-xl border border-amber-100 bg-white p-4 text-sm">
            <Link href={encounter.launchHref} className="font-bold text-kelly-navy underline">
              {encounter.title}
            </Link>
            <p className="mt-1 text-[10px] text-kelly-muted">{encounter.durationLabel}</p>
          </article>
        ))}
      </section>
    </div>
  );
}
