import Link from "next/link";
import { notFound } from "next/navigation";
import { findKimHammerBill } from "@/lib/opposition/kimHammerWorkbench";

type Props = {
  params: Promise<{ billNumber: string }>;
};

export default async function KimHammerBillDetailPage({ params }: Props) {
  const { billNumber } = await params;
  const bill = findKimHammerBill(billNumber);
  if (!bill) notFound();

  return (
    <div className="mx-auto max-w-6xl text-kelly-text">
      <header className="mb-6 border-b border-kelly-text/10 pb-4">
        <div className="mb-2">
          <Link href="/admin/intelligence/kim-hammer" className="text-xs font-semibold text-kelly-navy underline">
            ← Back to Kim Hammer command center
          </Link>
        </div>
        <p className="font-body text-[10px] font-bold uppercase tracking-[0.22em] text-kelly-subtle">Bill Detail</p>
        <h1 className="font-heading text-2xl font-bold">{bill.billNumber} {bill.actNumber ? `/ Act ${bill.actNumber}` : ""}</h1>
        <p className="mt-2 text-sm text-kelly-muted">{bill.title}</p>
      </header>

      <section className="mb-4 rounded-xl border border-kelly-text/10 bg-white p-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-kelly-navy">1) Bill Identity</h2>
        <ul className="mt-2 list-inside list-disc text-xs text-kelly-muted">
          <li>Bill number: {bill.billNumber}</li>
          <li>Act number: {bill.actNumber ?? "MISSING"}</li>
          <li>Session/year: {bill.sessionYear}</li>
          <li>Status/final disposition: {bill.status}; {bill.finalDisposition}</li>
          <li>Hammer role: {bill.hammerRole}</li>
          <li>Source confidence: {bill.confidenceLevel}</li>
        </ul>
      </section>

      <section className="mb-4 rounded-xl border border-kelly-text/10 bg-white p-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-kelly-navy">2) Plain-English Summary</h2>
        <ul className="mt-2 list-inside list-disc text-xs text-kelly-muted">
          <li>What bill did: {bill.keyProvisions.join(" ")}</li>
          <li>Who it affects: {bill.affectedGroups.join(", ")}.</li>
          <li>What changed: {bill.finalDisposition}</li>
          <li>Needs confirmation: line-by-line act text and amendments for legal precision.</li>
        </ul>
      </section>

      <section className="mb-4 grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-kelly-text/10 bg-white p-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-kelly-navy">3) Voter / Citizen Impact</h2>
          <ul className="mt-2 list-inside list-disc text-xs text-kelly-muted">
            <li>Ballot access: {bill.ballotAccessImpact}</li>
            <li>Direct democracy: {bill.directDemocracyImpact}</li>
            <li>Absentee voting / voter process: {bill.voterAccessImpact}</li>
            <li>County administration touchpoint: {bill.countyAdministrationImpact}</li>
          </ul>
        </div>
        <div className="rounded-xl border border-kelly-text/10 bg-white p-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-kelly-navy">4) County Impact</h2>
          <ul className="mt-2 list-inside list-disc text-xs text-kelly-muted">
            <li>County clerk/election commissioner impact: {bill.countyAdministrationImpact}</li>
            <li>Staffing/training burden: NEEDS_REVIEW.</li>
            <li>Rural county burden: NEEDS_REVIEW.</li>
            <li>Unknowns: county official interviews and implementation evidence.</li>
          </ul>
        </div>
      </section>

      <section className="mb-4 grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-kelly-text/10 bg-white p-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-kelly-navy">5) Secretary of State Impact</h2>
          <ul className="mt-2 list-inside list-disc text-xs text-kelly-muted">
            <li>Direct SOS duty impact: {bill.secretaryOfStateDutyImpact}</li>
            <li>Indirect workflow impact: NEEDS_REVIEW.</li>
            <li>Statutory confirmation required: YES.</li>
          </ul>
        </div>
        <div className="rounded-xl border border-kelly-text/10 bg-white p-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-kelly-navy">6) Philosophy Alignment / Conflict</h2>
          <ul className="mt-2 list-inside list-disc text-xs text-kelly-muted">
            <li>Trust/transparency: compare implementation evidence with process clarity outcomes.</li>
            <li>Participation/access: compare with ballot and petition process effects.</li>
            <li>County support: check operational burden and support resources.</li>
            <li>Neutral administration: keep evaluation source-grounded and non-personal.</li>
          </ul>
        </div>
      </section>

      <section className="mb-4 rounded-xl border border-kelly-text/10 bg-white p-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-kelly-navy">7) "Stacking the Office?" Research Question</h2>
        <ul className="mt-2 list-inside list-disc text-xs text-kelly-muted">
          <li>This raises a research question about whether this bill expanded authority relevant to the office later sought.</li>
          <li>This may indicate shifts toward state-level election-body control, but further source review is needed.</li>
          <li>Confidence level for this question: {bill.confidenceLevel} with statutory confirmation still needed.</li>
        </ul>
      </section>

      <section className="mb-4 rounded-xl border border-kelly-text/10 bg-white p-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-kelly-navy">8) Debate Use</h2>
        <ul className="mt-2 list-inside list-disc text-xs text-kelly-muted">
          <li>Best question: How does this law build trust while preserving participation?</li>
          <li>Likely defense: integrity / accountability framing.</li>
          <li>Response frame: agree with integrity goals, then test whether county support and access were preserved.</li>
          <li>Bridge line: Election integrity and participation should work together under transparent rules.</li>
          <li>Risky wording to avoid: motive claims without source evidence.</li>
        </ul>
      </section>

      <section className="rounded-xl border border-kelly-text/10 bg-white p-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-kelly-navy">9) Source Appendix</h2>
        <ul className="mt-2 list-inside list-disc text-xs text-kelly-muted">
          {bill.sourceLinks.map((source) => (
            <li key={source}>
              {source.startsWith("http") ? (
                <a className="text-kelly-navy underline" href={source} target="_blank" rel="noreferrer">
                  {source}
                </a>
              ) : (
                source
              )}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

