import Link from "next/link";
import { ComplianceCard, ComplianceNav, CompliancePageHeader, ComplianceMetricCard, ComplianceWarningPanel, StorageModeNotice } from "../components";
import { getCurrentFilingPeriod } from "@/lib/compliance/filing-readiness/arkansas-filing-periods";
import { checkComplianceStorageHealth } from "@/lib/compliance/storage/storage-health";

export const dynamic = "force-dynamic";

export default async function ComplianceSettingsPage() {
  const [filingPeriod, storage] = await Promise.all([Promise.resolve(getCurrentFilingPeriod()), checkComplianceStorageHealth()]);
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 pt-6">
      <CompliancePageHeader
        eyebrow="Settings"
        title="Compliance settings & storage"
        description="Import paths, filing period, and private document storage health."
      />
      <ComplianceNav />
      <StorageModeNotice />
      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <ComplianceMetricCard label="Storage ready" value={storage.ready ? "yes" : "no"} tone={storage.ready ? "green" : "red"} />
        <ComplianceMetricCard label="Supabase env" value={storage.envPresent ? "set" : "missing"} tone={storage.envPresent ? "green" : "yellow"} />
        <ComplianceMetricCard label="Local fallback" value={storage.localFallbackActive ? "active" : "off"} tone={storage.localFallbackActive ? "yellow" : "green"} />
        <ComplianceMetricCard label="RLS verified" value={storage.rlsConfiguredManual ? "yes" : "not verified"} tone={storage.rlsConfiguredManual ? "green" : "yellow"} />
      </section>
      <ComplianceWarningPanel title="Storage status">
        <p>{storage.summary}</p>
        <ul className="mt-2 list-disc pl-5 text-sm">
          <li>Bucket reachable: {storage.bucketReachable ? "yes" : "no"}</li>
          <li>Signed URLs: {storage.signedUrlCapable ? "yes" : "no (use server download)"}</li>
        </ul>
        <p className="mt-3 text-sm">
          See <code>docs/compliance/SUPABASE_PRIVATE_STORAGE_SETUP.md</code> for bucket name, env vars, RLS SQL, and Netlify checklist.
        </p>
      </ComplianceWarningPanel>
      <section className="grid gap-4 md:grid-cols-2">
        <ComplianceCard title="GoodChange storage">Analyses under <code>data/compliance/imports/goodchange</code> (gitignored).</ComplianceCard>
        <ComplianceCard title="Bank storage">Analyses under <code>data/compliance/imports/bank</code> (gitignored).</ComplianceCard>
        <ComplianceCard title="Netlify checklist">Set SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, COMPLIANCE_STORAGE_BUCKET, COMPLIANCE_STORAGE_RLS_VERIFIED — never commit values.</ComplianceCard>
        <ComplianceCard title="Privacy">Do not commit real donor or bank CSVs, receipt images, or approval JSON with PII.</ComplianceCard>
      </section>
      <ComplianceCard title="Filing period settings">
        <p>Current filing period: {filingPeriod.label}</p>
        <p>Period: {filingPeriod.startDate} → {filingPeriod.endDate}</p>
        <p>Due date: {filingPeriod.dueDate ?? "not verified"}</p>
        <p>Source status: {filingPeriod.sourceStatus}</p>
        <p className="mt-2">{filingPeriod.sourceNote}</p>
      </ComplianceCard>
    </div>
  );
}
