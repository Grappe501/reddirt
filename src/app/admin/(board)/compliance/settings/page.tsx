import { ComplianceCard, ComplianceNav, CompliancePageHeader, StorageModeNotice } from "../components";
import { getCurrentFilingPeriod } from "@/lib/compliance/filing-readiness/arkansas-filing-periods";

export default function ComplianceSettingsPage() {
  const filingPeriod = getCurrentFilingPeriod();
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <CompliancePageHeader
        eyebrow="Settings"
        title="Compliance import settings"
        description="Pass 1 settings are intentionally read-only. Pass 2 should promote these into database-backed reviewer controls."
      />
      <ComplianceNav />
      <StorageModeNotice />
      <section className="grid gap-4 md:grid-cols-2">
        <ComplianceCard title="GoodChange storage">Uploaded analyses are stored under <code>data/compliance/imports/goodchange</code>.</ComplianceCard>
        <ComplianceCard title="Bank storage">Uploaded analyses are stored under <code>data/compliance/imports/bank</code>.</ComplianceCard>
        <ComplianceCard title="Privacy">Do not commit real donor or bank CSVs. Local upload and analysis folders are ignored by git.</ComplianceCard>
        <ComplianceCard title="Pass 2">Move to database-backed batches, immutable source-file hashes, attachment storage, and human approval workflow.</ComplianceCard>
      </section>
      <ComplianceCard title="Filing period settings">
        <p>Current filing period: {filingPeriod.label}</p>
        <p>Period start: {filingPeriod.startDate}</p>
        <p>Period end: {filingPeriod.endDate}</p>
        <p>Due date: {filingPeriod.dueDate ?? "not verified"}</p>
        <p>Source verification status: {filingPeriod.sourceStatus}</p>
        <p className="mt-2">{filingPeriod.sourceNote}</p>
      </ComplianceCard>
    </div>
  );
}
