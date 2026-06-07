import Link from "next/link";
import { Phase15P6UpgradePassPanel } from "@/components/admin/intelligence/Phase15P6UpgradePassPanel";
import { V4BackLinks, V4PageHeader } from "@/components/admin/intelligence/v4/V4PageHeader";
import {
  assertPhase15P6Bar,
  computePhase15P6UpgradePass,
  DEMO_MODE_HUB_HREF,
} from "@/lib/intelligence/v4/phase15P6Closure";
import { listDemoScriptSteps } from "@/lib/intelligence/v4/phase15P6DemoMode";

export const dynamic = "force-dynamic";

export default function Phase15P6UpgradePage() {
  const report = computePhase15P6UpgradePass();
  const bar = assertPhase15P6Bar();
  const steps = listDemoScriptSteps();

  return (
    <div className="mx-auto max-w-7xl text-kelly-text">
      <V4PageHeader
        eyebrow="Intelligence upgrade · Phase 15 P6"
        title="Demo mode"
        description="Purchase-ready demo with seeded tonight scenario and 15-minute walkthrough script — buyer sees command home, not builder clutter."
      >
        <V4BackLinks />
        <Link
          href={DEMO_MODE_HUB_HREF}
          className="rounded-full border border-teal-400 bg-teal-50 px-3 py-1 text-xs font-bold text-teal-950"
        >
          Demo mode hub
        </Link>
        <Link
          href="/admin/intelligence"
          className="rounded-full border border-indigo-400 bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-950"
        >
          Command home
        </Link>
      </V4PageHeader>

      <Phase15P6UpgradePassPanel report={report} />

      <section className="mb-8 rounded-xl border border-kelly-text/10 bg-white p-5">
        <h2 className="font-heading text-lg font-bold text-kelly-navy">Exit gate</h2>
        <p className={`mt-2 text-sm font-semibold ${bar.ok ? "text-emerald-700" : "text-rose-700"}`}>
          {bar.ok ? "Phase 15 P6 bar met" : bar.message}
        </p>
        {!bar.ok ? (
          <p className="mt-2 text-xs text-kelly-muted">
            Run: <code>npx tsx scripts/test-phase15-p6-demo-mode.ts</code>
          </p>
        ) : null}
      </section>

      <section className="space-y-3">
        <h2 className="font-heading text-lg font-bold text-kelly-navy">Script steps ({steps.length})</h2>
        {steps.map((step) => (
          <article key={step.stepId} className="rounded-xl border border-teal-100 bg-white p-4 text-sm">
            <Link href={step.href} className="font-bold text-kelly-navy underline">
              {step.order}. {step.title}
            </Link>
            <p className="mt-1 text-[10px] text-kelly-muted">
              {step.durationLabel} · {step.demoBeat.slice(0, 100)}…
            </p>
          </article>
        ))}
      </section>
    </div>
  );
}
