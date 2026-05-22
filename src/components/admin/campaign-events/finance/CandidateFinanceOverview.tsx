import Link from "next/link";
import type { CampaignFinanceSnapshot } from "@/lib/campaign-events/finance/load-campaign-finance-snapshot";
import { DashboardSection, DashboardStatGrid, StatCard } from "../dashboard/CampaignDashboardShell";

export function CandidateFinanceOverview({ snapshot, month }: { snapshot: CampaignFinanceSnapshot; month: string }) {
  return (
    <DashboardSection title="Financial overview">
      <p className="mb-3 font-body text-xs text-kelly-muted">
        Reimbursement pipeline: <strong>{snapshot.pipelineLabel}</strong> · Documentation health for {month}
      </p>
      <DashboardStatGrid>
        <StatCard label="Approved reimbursement" value={fmt(snapshot.approvedReimbursement)} href={`/admin/campaign-events/reimbursement?month=${month}`} />
        <StatCard label="Pending travel approvals" value={snapshot.pendingApprovals} href={`/admin/campaign-events/travel-log?month=${month}`} />
        <StatCard label="Receipts on file" value={snapshot.receiptCount} />
        <StatCard label="Pending receipts" value={snapshot.pendingReceipts} hint={snapshot.pendingReceipts ? "Upload or link on event drilldown" : undefined} />
      </DashboardStatGrid>
      {snapshot.topBlockers.length ? (
        <ul className="mt-3 list-disc pl-5 font-body text-xs text-amber-900">
          {snapshot.topBlockers.map((b) => (
            <li key={b}>{b}</li>
          ))}
        </ul>
      ) : null}
      <Link href={`/admin/campaign-events/reimbursement?month=${month}`} className="mt-3 inline-block text-xs font-bold text-kelly-navy underline">
        Open reimbursement operations →
      </Link>
    </DashboardSection>
  );
}

function fmt(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);
}
