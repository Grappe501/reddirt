import { ComplianceCard, ComplianceNav, CompliancePageHeader, StorageModeNotice } from "../components";
import { loadFilingSnapshots } from "@/lib/compliance/filings/filing-storage";

export const dynamic = "force-dynamic";

export default async function ComplianceFilingsPage() {
  const filings = await loadFilingSnapshots();
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <CompliancePageHeader eyebrow="Filings" title="Filing Packages" description="Immutable draft filing snapshots with included records, supporting document index, hash manifest, and human certification gate." />
      <ComplianceNav />
      <StorageModeNotice />
      <section className="grid gap-4 md:grid-cols-4">
        <ComplianceCard title="New Filing Package" href="/admin/compliance/filings/new">Generate a draft snapshot from currently approved records and readiness gates.</ComplianceCard>
        <ComplianceCard title="Drafts">{filings.filter((filing) => filing.status === "draft").length}</ComplianceCard>
        <ComplianceCard title="Certified">{filings.filter((filing) => filing.status === "certified").length}</ComplianceCard>
        <ComplianceCard title="Filed">{filings.filter((filing) => filing.status === "filed").length}</ComplianceCard>
      </section>
      <section className="grid gap-3">
        {filings.map((filing) => (
          <ComplianceCard key={filing.id} title={filing.label} href={`/admin/compliance/filings/${filing.id}`}>
            Status: {filing.status}. Records: {filing.includedRecordIds.length}. Package hash: {filing.packageHash.slice(0, 16)}...
          </ComplianceCard>
        ))}
        {!filings.length ? <p className="font-body text-sm text-kelly-text/70">No filing packages yet.</p> : null}
      </section>
    </div>
  );
}
