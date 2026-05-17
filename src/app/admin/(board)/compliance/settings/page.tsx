import { ComplianceCard, ComplianceNav, CompliancePageHeader, StorageModeNotice } from "../components";

export default function ComplianceSettingsPage() {
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
    </div>
  );
}
