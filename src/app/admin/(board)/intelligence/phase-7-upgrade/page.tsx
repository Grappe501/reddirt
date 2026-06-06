import Link from "next/link";
import { DiligenceRunbookPanel } from "@/components/admin/intelligence/DiligenceRunbookPanel";
import { Phase7UpgradePassPanel } from "@/components/admin/intelligence/Phase7UpgradePassPanel";
import { V4BackLinks, V4PageHeader } from "@/components/admin/intelligence/v4/V4PageHeader";
import { PHASE7_PROMOTED_KH_MODULE_IDS } from "@/lib/intelligence/kimHammerV4ModuleRegistry";
import { buildDiligenceSubjectRunbooks } from "@/lib/intelligence/v4/diligenceOperatorRunbook";
import { computePhase7UpgradePass } from "@/lib/intelligence/v4/phase7DossierDiligenceClosure";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default function Phase7UpgradePage() {
  const report = computePhase7UpgradePass();
  const runbookSubjects = buildDiligenceSubjectRunbooks();

  return (
    <div className="mx-auto max-w-7xl text-kelly-text">
      <V4PageHeader
        eyebrow="Intelligence upgrade · Phase 7"
        title="Dossier briefing closure + diligence runbook"
        description="Briefing-book bar on all dossier sections, five-search operator runbook, CVSGF transparency frame, and second-wave Kim Hammer module promotions."
      >
        <V4BackLinks />
        <Link
          href="/admin/intelligence/candidate-dossiers"
          className="rounded-full border border-sky-300 bg-sky-50 px-3 py-1 text-xs font-bold text-sky-950"
        >
          Dossier briefing book
        </Link>
        <Link
          href="/admin/intelligence/diligence"
          className="rounded-full border border-kelly-navy/20 px-3 py-1 text-xs font-bold text-kelly-navy"
        >
          Diligence hub
        </Link>
      </V4PageHeader>

      <Phase7UpgradePassPanel report={report} />

      <DiligenceRunbookPanel subjects={runbookSubjects} />

      <section className="mb-8 rounded-xl border border-kelly-navy/15 bg-white p-6 text-sm leading-relaxed">
        <h2 className="font-heading text-xl font-bold text-kelly-navy">Phase 7 deliverables</h2>
        <ol className="mt-4 list-inside list-decimal space-y-2 text-kelly-muted">
          <li>Read-time dossier enrichment to briefing-book bar (Kelly, Hammer, Pakko).</li>
          <li>Five-search diligence operator runbook with counsel-safe incomplete pivots.</li>
          <li>Election funding transparency frame — no fabricated county ledger totals.</li>
          <li>Ten second-wave Kim Hammer modules promoted from staff-stub to live render specs.</li>
          <li>Field Book article dossier-diligence-closure + canon binding on phase-7-upgrade.</li>
        </ol>
      </section>

      <section>
        <h2 className="text-sm font-bold uppercase text-kelly-navy">Wave 2 KH modules ({PHASE7_PROMOTED_KH_MODULE_IDS.length})</h2>
        <ul className="mt-3 grid gap-2 md:grid-cols-2">
          {PHASE7_PROMOTED_KH_MODULE_IDS.map((id) => (
            <li key={id}>
              <Link
                href={`/admin/intelligence/kim-hammer/${id}`}
                className="block rounded-lg border border-kelly-navy/10 bg-white px-3 py-2 text-sm font-semibold text-kelly-navy underline"
              >
                {id}
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
