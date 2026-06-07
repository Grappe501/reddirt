import Link from "next/link";
import { Phase15P3UpgradePassPanel } from "@/components/admin/intelligence/Phase15P3UpgradePassPanel";
import { V4BackLinks, V4PageHeader } from "@/components/admin/intelligence/v4/V4PageHeader";
import {
  assertPhase15P3Bar,
  computePhase15P3UpgradePass,
  listStageSafeFilterSurfaces,
  PHASE15_P3_STAGE_SAFE_FILTER_HUB_HREF,
} from "@/lib/intelligence/v4/phase15P3Closure";

export const dynamic = "force-dynamic";

export default function Phase15P3UpgradePage() {
  const report = computePhase15P3UpgradePass();
  const bar = assertPhase15P3Bar();
  const gated = listStageSafeFilterSurfaces().filter((s) => s.candidateBlocked);

  return (
    <div className="mx-auto max-w-7xl text-kelly-text">
      <V4PageHeader
        eyebrow="Intelligence upgrade · Phase 15 P3"
        title="Stage-safe filter"
        description="Claims-gated rendering on trap lanes, SOS questions, and coaching — candidate profile never rehearses NEEDS_REVIEW lines."
      >
        <V4BackLinks />
        <Link
          href={PHASE15_P3_STAGE_SAFE_FILTER_HUB_HREF}
          className="rounded-full border border-rose-400 bg-rose-50 px-3 py-1 text-xs font-bold text-rose-950"
        >
          Filter hub
        </Link>
        <Link
          href="/admin/intelligence/claims"
          className="rounded-full border border-rose-400 bg-rose-50 px-3 py-1 text-xs font-bold text-rose-950"
        >
          Claims ledger
        </Link>
      </V4PageHeader>

      <Phase15P3UpgradePassPanel report={report} />

      <section className="mb-8 rounded-xl border border-kelly-text/10 bg-white p-5">
        <h2 className="font-heading text-lg font-bold text-kelly-navy">Exit gate</h2>
        <p className={`mt-2 text-sm font-semibold ${bar.ok ? "text-emerald-700" : "text-rose-700"}`}>
          {bar.ok ? "Phase 15 P3 bar met" : bar.message}
        </p>
        {!bar.ok ? (
          <p className="mt-2 text-xs text-kelly-muted">
            Run: <code>npx tsx scripts/test-phase15-p3-stage-safe-filter.ts</code>
          </p>
        ) : null}
      </section>

      <section className="space-y-3">
        <h2 className="font-heading text-lg font-bold text-kelly-navy">Candidate-gated surfaces ({gated.length})</h2>
        {gated.slice(0, 12).map((s) => (
          <article key={s.surfaceId} className="rounded-xl border border-rose-100 bg-white p-4 text-sm">
            <Link href={s.href} className="font-bold text-kelly-navy underline">
              {s.title}
            </Link>
            <p className="mt-1 text-[10px] text-amber-950">{s.claimsGate}</p>
          </article>
        ))}
      </section>
    </div>
  );
}
