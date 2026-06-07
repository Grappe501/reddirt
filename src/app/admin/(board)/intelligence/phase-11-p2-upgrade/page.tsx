import Link from "next/link";
import { Phase11P2UpgradePassPanel } from "@/components/admin/intelligence/Phase11P2UpgradePassPanel";
import { DebatePhilosophyReadinessPanel } from "@/components/admin/intelligence/DebatePhilosophyReadinessPanel";
import { V4BackLinks, V4PageHeader } from "@/components/admin/intelligence/v4/V4PageHeader";
import {
  assertPhase11P2Bar,
  computePhase11P2UpgradePass,
  listMovementPhilosophyDocSurfaces,
  listStaffStrategySurfaceSummaries,
} from "@/lib/intelligence/v4/phase11P2Closure";
import { computeDebateCommandPhilosophyReadiness } from "@/lib/intelligence/v4/debateCommandPhilosophyReadiness";
import { getMovementPhilosophyDocOverlay } from "@/lib/intelligence/v4/phase11P2MovementPhilosophyDepth";
import { getStaffStrategySurfaceOverlay } from "@/lib/intelligence/v4/phase11P2StaffStrategyDepth";

export const dynamic = "force-dynamic";

export default function Phase11P2UpgradePage() {
  const report = computePhase11P2UpgradePass();
  const bar = assertPhase11P2Bar();
  const philosophyFeed = computeDebateCommandPhilosophyReadiness();
  const docs = listMovementPhilosophyDocSurfaces();
  const staff = listStaffStrategySurfaceSummaries();

  return (
    <div className="mx-auto max-w-7xl text-kelly-text">
      <V4PageHeader
        eyebrow="Intelligence upgrade · Phase 11 P2"
        title="Movement philosophy + staff strategy command"
        description="Exit gate for wiring docs/philosophy, VOL-CORE-1, morning brief, briefing papers, writing toolbox, and NSI pathway/graph/simulation into strategy migration bridge and debate philosophy readiness."
      >
        <V4BackLinks />
        <Link
          href={report.movementHubHref}
          className="rounded-full border border-indigo-300 bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-950"
        >
          Movement philosophy hub
        </Link>
        <Link
          href={report.staffHubHref}
          className="rounded-full border border-violet-300 bg-violet-50 px-3 py-1 text-xs font-bold text-violet-950"
        >
          Staff strategy command
        </Link>
      </V4PageHeader>

      <Phase11P2UpgradePassPanel report={report} />

      <DebatePhilosophyReadinessPanel feed={philosophyFeed} />

      <section className="mb-8 rounded-xl border border-kelly-text/10 bg-white p-5">
        <h2 className="font-heading text-lg font-bold text-kelly-navy">Exit gate</h2>
        <p className={`mt-2 text-sm font-semibold ${bar.ok ? "text-emerald-700" : "text-rose-700"}`}>
          {bar.ok ? "Phase 11 P2 bar met" : bar.message}
        </p>
      </section>

      <section className="mb-8 grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-indigo-100 bg-white p-5">
          <h2 className="font-heading text-lg font-bold text-kelly-navy">Philosophy docs</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {docs.map((doc) => {
              const overlay = getMovementPhilosophyDocOverlay(doc.pathKey);
              return (
                <li key={doc.pathKey} className="rounded-lg border border-kelly-text/10 px-3 py-2">
                  <Link href={doc.href} className="font-semibold text-kelly-navy underline">
                    {doc.title}
                  </Link>
                  <p className="mt-0.5 text-xs text-kelly-muted">{overlay.movementRole.slice(0, 120)}…</p>
                </li>
              );
            })}
          </ul>
        </div>
        <div className="rounded-xl border border-violet-100 bg-white p-5">
          <h2 className="font-heading text-lg font-bold text-kelly-navy">Staff surfaces</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {staff.map((s) => {
              const overlay = getStaffStrategySurfaceOverlay(s.id);
              return (
                <li key={s.id} className="rounded-lg border border-kelly-text/10 px-3 py-2">
                  <Link href={s.href} className="font-semibold text-kelly-navy underline">
                    {s.title}
                  </Link>
                  <p className="mt-0.5 text-xs text-kelly-muted">{overlay.strategicRole.slice(0, 120)}…</p>
                </li>
              );
            })}
          </ul>
        </div>
      </section>
    </div>
  );
}
