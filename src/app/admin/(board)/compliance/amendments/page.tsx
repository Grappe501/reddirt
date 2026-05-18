import { ComplianceCard, ComplianceNav, CompliancePageHeader } from "../components";
import { buildAmendmentCandidates } from "@/lib/compliance/amendments/amendment-assistant";

export const dynamic = "force-dynamic";

export default async function ComplianceAmendmentsPage() {
  const candidates = await buildAmendmentCandidates();
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <CompliancePageHeader eyebrow="Amendments" title="Amendment Assistant" description="Detect changes that may affect previously certified/filed packages. AI may draft explanations, but human compliance review decides." />
      <ComplianceNav />
      <section className="grid gap-4 md:grid-cols-3">
        <ComplianceCard title="Candidates">{candidates.length}</ComplianceCard>
        <ComplianceCard title="Human review">Required for every amendment candidate.</ComplianceCard>
        <ComplianceCard title="Status">No amendment is auto-filed.</ComplianceCard>
      </section>
      <section className="grid gap-3">
        {candidates.map((candidate) => (
          <ComplianceCard key={candidate.id} title={candidate.impact}>
            Filing: {candidate.filingId}. Record: {candidate.recordId}. {candidate.draftAmendmentExplanation}
          </ComplianceCard>
        ))}
        {!candidates.length ? <p className="font-body text-sm text-kelly-text/70">No amendment candidates detected.</p> : null}
      </section>
    </div>
  );
}
