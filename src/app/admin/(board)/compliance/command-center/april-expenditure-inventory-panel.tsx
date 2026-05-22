import Link from "next/link";
import { ComplianceCard, ComplianceMetricCard } from "../components";
import { loadAprilExpenditureInventorySummary } from "@/lib/compliance/inventory/build-april-expenditure-inventory";

export async function AprilExpenditureInventoryPanel() {
  const summary = await loadAprilExpenditureInventorySummary();
  if (!summary) return null;

  const matched = summary.exactMatchCount + summary.likelyMatchCount;

  return (
    <ComplianceCard title="April expenditure inventory" href="/admin/compliance/april26">
      <p className="mb-3 text-sm text-slate-600">
        Uploaded checks vs April bank ledger debits — compare to physical files before entering addresses.
      </p>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <ComplianceMetricCard label="Uploaded checks" value={String(summary.uploadedCheckCount)} />
        <ComplianceMetricCard label="Ledger expenditures" value={String(summary.ledgerExpenditureCount)} />
        <ComplianceMetricCard label="Matched (exact+likely)" value={String(matched)} />
        <ComplianceMetricCard label="Unmatched ledger" value={String(summary.unmatchedLedgerExpenditures)} tone="yellow" />
        <ComplianceMetricCard label="Missing addresses" value={String(summary.missingAddressCount)} tone="yellow" />
      </div>
      <p className="mt-3 text-sm text-slate-600">
        Regenerate:{" "}
        <code className="rounded bg-slate-100 px-1">npm run compliance:april-expenditure-inventory</code>. Report:{" "}
        <Link href="/admin/compliance/april26" className="font-semibold text-[#0f2744] underline">
          April26 hub
        </Link>{" "}
        ·{" "}
        <span className="font-mono text-xs">docs/compliance/COMPLIANCE_APRIL_EXPENDITURE_INVENTORY.md</span>
      </p>
    </ComplianceCard>
  );
}
