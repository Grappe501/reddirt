import { notFound } from "next/navigation";
import { ComplianceCard, ComplianceNav, CompliancePageHeader } from "../../components";
import { loadFilingSnapshots } from "@/lib/compliance/filings/filing-storage";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

export default async function FilingDetailPage({ params }: Params) {
  const { id } = await params;
  const filing = (await loadFilingSnapshots()).find((item) => item.id === id);
  if (!filing) notFound();
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <CompliancePageHeader eyebrow="Filing detail" title={filing.label} description="Immutable filing snapshot detail. Certification and filed status require human approval outside this draft foundation." />
      <ComplianceNav />
      <section className="grid gap-4 md:grid-cols-4">
        <ComplianceCard title="Status">{filing.status}</ComplianceCard>
        <ComplianceCard title="Included records">{filing.includedRecordIds.length}</ComplianceCard>
        <ComplianceCard title="Documents">{filing.supportingDocumentIds.length}</ComplianceCard>
        <ComplianceCard title="Readiness">{filing.readiness.overallStatus}</ComplianceCard>
      </section>
      <ComplianceCard title="Audit hash manifest">
        {filing.auditHashManifest.map((item) => <p key={item.path}>{item.path}: {item.sha256}</p>)}
      </ComplianceCard>
      <ComplianceCard title="Blockers">
        {filing.readiness.blockers.length ? filing.readiness.blockers.map((blocker) => <p key={blocker}>{blocker}</p>) : "None"}
      </ComplianceCard>
    </div>
  );
}
