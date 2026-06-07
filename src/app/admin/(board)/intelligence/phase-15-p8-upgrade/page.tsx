import Link from "next/link";
import { Phase15P8UpgradePassPanel } from "@/components/admin/intelligence/Phase15P8UpgradePassPanel";
import { V4BackLinks, V4PageHeader } from "@/components/admin/intelligence/v4/V4PageHeader";
import {
  assertPhase15P8Bar,
  computePhase15P8UpgradePass,
  STAFF_BACKSTAGE_HUB_HREF,
} from "@/lib/intelligence/v4/phase15P8Closure";
import { listStaffBackstageGuardSurfaces } from "@/lib/intelligence/v4/phase15P8StaffBackstage";

export const dynamic = "force-dynamic";

export default function Phase15P8UpgradePage() {
  const report = computePhase15P8UpgradePass();
  const bar = assertPhase15P8Bar();
  const surfaces = listStaffBackstageGuardSurfaces();

  return (
    <div className="mx-auto max-w-7xl text-kelly-text">
      <V4PageHeader
        eyebrow="Intelligence upgrade · Phase 15 P8"
        title="Staff backstage route guards"
        description="STAFF profile enforcement on builder and operations routes — route-level redirect, not nav-only hiding."
      >
        <V4BackLinks />
        <Link
          href={STAFF_BACKSTAGE_HUB_HREF}
          className="rounded-full border border-violet-400 bg-violet-50 px-3 py-1 text-xs font-bold text-violet-950"
        >
          Staff backstage hub
        </Link>
        <Link
          href="/admin/intelligence"
          className="rounded-full border border-indigo-400 bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-950"
        >
          Command home
        </Link>
      </V4PageHeader>

      <Phase15P8UpgradePassPanel report={report} />

      <section className="mb-8 rounded-xl border border-kelly-text/10 bg-white p-5">
        <h2 className="font-heading text-lg font-bold text-kelly-navy">Exit gate</h2>
        <p className={`mt-2 text-sm font-semibold ${bar.ok ? "text-emerald-700" : "text-rose-700"}`}>
          {bar.ok ? "Phase 15 P8 bar met" : bar.message}
        </p>
        {!bar.ok ? (
          <p className="mt-2 text-xs text-kelly-muted">
            Run: <code>npx tsx scripts/test-phase15-p8-staff-backstage.ts</code>
          </p>
        ) : null}
      </section>

      <section className="space-y-3">
        <h2 className="font-heading text-lg font-bold text-kelly-navy">Guard categories ({surfaces.length})</h2>
        {surfaces.map((surface) => (
          <article key={surface.surfaceId} className="rounded-xl border border-violet-100 bg-white p-4 text-sm">
            <Link href={surface.href} className="font-bold text-kelly-navy underline">
              {surface.title}
            </Link>
            <p className="mt-1 text-[10px] text-kelly-muted">{surface.kind}</p>
          </article>
        ))}
      </section>
    </div>
  );
}
