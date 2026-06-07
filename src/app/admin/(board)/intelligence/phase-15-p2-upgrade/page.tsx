import Link from "next/link";
import { Phase15P2UpgradePassPanel } from "@/components/admin/intelligence/Phase15P2UpgradePassPanel";
import { V4BackLinks, V4PageHeader } from "@/components/admin/intelligence/v4/V4PageHeader";
import {
  assertPhase15P2Bar,
  computePhase15P2UpgradePass,
  listKellyPrepWeekDaySurfaces,
  KELLY_PREP_WEEK_HUB_HREF,
} from "@/lib/intelligence/v4/phase15P2Closure";
import { getKellyPrepWeekDayOverlay } from "@/lib/intelligence/v4/phase15P2KellyPrepWeekDepth";

export const dynamic = "force-dynamic";

export default function Phase15P2UpgradePage() {
  const report = computePhase15P2UpgradePass();
  const bar = assertPhase15P2Bar();
  const days = listKellyPrepWeekDaySurfaces();

  return (
    <div className="mx-auto max-w-7xl text-kelly-text">
      <V4PageHeader
        eyebrow="Intelligence upgrade · Phase 15 P2"
        title="Kelly prep week"
        description="Seven-day orchestrated candidate journey — philosophy, traps, SOS, opposition, three-way, simulation, and claims-only rest day."
      >
        <V4BackLinks />
        <Link
          href={KELLY_PREP_WEEK_HUB_HREF}
          className="rounded-full border border-indigo-400 bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-950"
        >
          Prep week hub
        </Link>
        <Link
          href="/admin/intelligence"
          className="rounded-full border border-indigo-400 bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-950"
        >
          Command home
        </Link>
      </V4PageHeader>

      <Phase15P2UpgradePassPanel report={report} />

      <section className="mb-8 rounded-xl border border-kelly-text/10 bg-white p-5">
        <h2 className="font-heading text-lg font-bold text-kelly-navy">Exit gate</h2>
        <p className={`mt-2 text-sm font-semibold ${bar.ok ? "text-emerald-700" : "text-rose-700"}`}>
          {bar.ok ? "Phase 15 P2 bar met" : bar.message}
        </p>
        {!bar.ok ? (
          <p className="mt-2 text-xs text-kelly-muted">
            Run: <code>npx tsx scripts/test-phase15-p2-kelly-prep-week.ts</code>
          </p>
        ) : null}
      </section>

      <section className="space-y-3">
        {days.map((d) => {
          const overlay = getKellyPrepWeekDayOverlay(d.dayId);
          return (
            <article key={d.dayId} className="rounded-xl border border-indigo-100 bg-white p-4 text-sm">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <Link href={d.href} className="font-bold text-kelly-navy underline">
                  {d.weekdayLabel} — {d.title}
                </Link>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                    d.phase15P2Enriched ? "bg-emerald-100 text-emerald-900" : "bg-rose-100 text-rose-900"
                  }`}
                >
                  {d.phase15P2Enriched ? "At bar" : "Gap"}
                </span>
              </div>
              <p className="mt-1 text-xs text-kelly-muted">{overlay.closureSteps[0]}</p>
            </article>
          );
        })}
      </section>
    </div>
  );
}
