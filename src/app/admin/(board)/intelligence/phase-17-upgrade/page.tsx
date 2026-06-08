import Link from "next/link";
import { Phase17UpgradePassPanel } from "@/components/admin/intelligence/Phase17UpgradePassPanel";
import { V4BackLinks, V4PageHeader } from "@/components/admin/intelligence/v4/V4PageHeader";
import {
  assertPhase17Bar,
  computePhase17UpgradePass,
  SEARCH_AI_PREP_HUB_HREF,
} from "@/lib/intelligence/v4/phase17SearchAiPrepClosure";
import { PHASE17_CHECKPOINT_IDS } from "@/lib/intelligence/v4/phase17SearchAiPrepDepth";

export const dynamic = "force-dynamic";

export default function Phase17UpgradePage() {
  const report = computePhase17UpgradePass();
  const bar = assertPhase17Bar();

  return (
    <div className="mx-auto max-w-7xl text-kelly-text">
      <V4PageHeader
        eyebrow="Intelligence upgrade · Phase 17"
        title="Search v4 + AI prep v4"
        description="Unified smart search fuses SRE rehearsal stack and 37 copilot tools; AI prep dock expands with search bridge and governed briefs."
      >
        <V4BackLinks />
        <Link
          href={SEARCH_AI_PREP_HUB_HREF}
          className="rounded-full border border-indigo-400 bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-950"
        >
          Search & AI prep hub
        </Link>
      </V4PageHeader>

      <Phase17UpgradePassPanel report={report} />

      <section className="mb-8 rounded-xl border border-kelly-text/10 bg-white p-5">
        <h2 className="font-heading text-lg font-bold text-kelly-navy">Exit gate</h2>
        <p className={`mt-2 text-sm font-semibold ${bar.ok ? "text-emerald-700" : "text-rose-700"}`}>
          {bar.ok ? "Phase 17 bar met — ready for main merge" : bar.message}
        </p>
        {!bar.ok ? (
          <p className="mt-2 text-xs text-kelly-muted">
            Run: <code>npx tsx scripts/test-phase17-search-ai-prep.ts</code>
          </p>
        ) : null}
      </section>

      <section className="space-y-3">
        <h2 className="font-heading text-lg font-bold text-kelly-navy">Checkpoints ({PHASE17_CHECKPOINT_IDS.length})</h2>
        {PHASE17_CHECKPOINT_IDS.map((checkpointId) => (
          <article key={checkpointId} className="rounded-xl border border-indigo-100 bg-white p-4 text-sm">
            <p className="font-bold text-kelly-navy">{checkpointId}</p>
          </article>
        ))}
      </section>
    </div>
  );
}
