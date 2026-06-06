import Link from "next/link";
import { AccaPanelPrepPanel } from "@/components/admin/intelligence/AccaPanelPrepPanel";
import { Phase8UpgradePassPanel } from "@/components/admin/intelligence/Phase8UpgradePassPanel";
import { V4BackLinks, V4PageHeader } from "@/components/admin/intelligence/v4/V4PageHeader";
import { PHASE8_PROMOTED_KH_MODULE_IDS } from "@/lib/intelligence/kimHammerV4ModuleRegistry";
import { computePhase8UpgradePass } from "@/lib/intelligence/v4/phase8DossierResearchAccaClosure";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default function Phase8UpgradePage() {
  const report = computePhase8UpgradePass();

  return (
    <div className="mx-auto max-w-7xl text-kelly-text">
      <V4PageHeader
        eyebrow="Intelligence upgrade · Phase 8"
        title="Dossier research depth + ACCA panel closure"
        description="Sourced research corpus on all candidate dossier sections, ACCA Mountain View panel operator runbook, and third-wave Kim Hammer module promotions."
      >
        <V4BackLinks />
        <Link
          href="/admin/intelligence/candidate-dossiers"
          className="rounded-full border border-violet-300 bg-violet-50 px-3 py-1 text-xs font-bold text-violet-950"
        >
          Dossier briefing book
        </Link>
        <Link
          href="/admin/intelligence/county-clerk-week/acca-summer-conference"
          className="rounded-full border border-amber-300 bg-amber-50 px-3 py-1 text-xs font-bold text-amber-950"
        >
          ACCA conference
        </Link>
      </V4PageHeader>

      <Phase8UpgradePassPanel report={report} />

      <AccaPanelPrepPanel />

      <section className="mb-8 rounded-xl border border-kelly-navy/15 bg-white p-6 text-sm leading-relaxed">
        <h2 className="font-heading text-xl font-bold text-kelly-navy">Phase 8 deliverables</h2>
        <ol className="mt-4 list-inside list-decimal space-y-2 text-kelly-muted">
          <li>Research depth corpus — kellyDossierResearchDepth + opponentDossierResearchDepth overlays on all sections.</li>
          <li>Three new Kelly sections + two Hammer + one Pakko deep-dive sections with sourced facts.</li>
          <li>ACCA panel enrichment + eight-step operator runbook for Thu Jun 11 Mountain View panel.</li>
          <li>Ten third-wave Kim Hammer modules promoted from staff-stub to live render specs.</li>
          <li>Field Book article dossier-research-acca-closure + canon binding on phase-8-upgrade.</li>
        </ol>
      </section>

      <section>
        <h2 className="text-sm font-bold uppercase text-kelly-navy">Wave 3 KH modules ({PHASE8_PROMOTED_KH_MODULE_IDS.length})</h2>
        <ul className="mt-3 grid gap-2 md:grid-cols-2">
          {PHASE8_PROMOTED_KH_MODULE_IDS.map((id) => (
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
