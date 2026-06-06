import Link from "next/link";
import { ClaimsReviewWavePanel } from "@/components/admin/intelligence/ClaimsReviewWavePanel";
import { Phase6UpgradePassPanel } from "@/components/admin/intelligence/Phase6UpgradePassPanel";
import { V4BackLinks, V4PageHeader } from "@/components/admin/intelligence/v4/V4PageHeader";
import { listClaimsForAdmin } from "@/lib/intelligence/claims/claimLedgerSummary";
import { PHASE6_PROMOTED_KH_MODULE_IDS } from "@/lib/intelligence/kimHammerV4ModuleRegistry";
import { computePhase6UpgradePass } from "@/lib/intelligence/v4/phase6DebateReadyGovernance";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default function Phase6UpgradePage() {
  const report = computePhase6UpgradePass();
  const needsReview = listClaimsForAdmin().filter(
    (c) => c.classification === "NEEDS_REVIEW" || c.verificationStatus === "NEEDS_REVIEW",
  );

  return (
    <div className="mx-auto max-w-7xl text-kelly-text">
      <V4PageHeader
        eyebrow="Intelligence upgrade · Phase 6"
        title="Debate-ready governance"
        description="Prep encounter depth on all 28 sections, trap lane rebuttal completion, claims review wave, and priority Hammer module promotion."
      >
        <V4BackLinks />
        <Link
          href="/admin/intelligence/kim-hammer/debate-prep"
          className="rounded-full border border-violet-300 bg-violet-50 px-3 py-1 text-xs font-bold text-violet-950"
        >
          Debate prep
        </Link>
        <Link
          href="/admin/intelligence/claims"
          className="rounded-full border border-rose-300 bg-rose-50 px-3 py-1 text-xs font-bold text-rose-950"
        >
          Claims ledger
        </Link>
      </V4PageHeader>

      <Phase6UpgradePassPanel report={report} />

      <ClaimsReviewWavePanel needsReview={needsReview} />

      <section className="mb-8 rounded-xl border border-kelly-navy/15 bg-white p-6 text-sm leading-relaxed">
        <h2 className="font-heading text-xl font-bold text-kelly-navy">Phase 6 deliverables</h2>
        <ol className="mt-4 list-inside list-decimal space-y-2 text-kelly-muted">
          <li>Section-specific encounter depth on all 28 debate prep drill-downs.</li>
          <li>Default rebuttal + rehearsal completion for checklist-style prep sections.</li>
          <li>Trap lanes fraud-dare and experience-equals-sos-ready at full rebuttal bar.</li>
          <li>Ten priority Kim Hammer modules promoted from staff-stub to live render specs.</li>
          <li>Claims review wave panel wired to /api/admin/intelligence/claim-review.</li>
        </ol>
      </section>

      <section>
        <h2 className="text-sm font-bold uppercase text-kelly-navy">Promoted KH modules ({PHASE6_PROMOTED_KH_MODULE_IDS.length})</h2>
        <ul className="mt-3 grid gap-2 md:grid-cols-2">
          {PHASE6_PROMOTED_KH_MODULE_IDS.map((id) => (
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
