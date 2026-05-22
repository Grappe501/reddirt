import Link from "next/link";
import type { CampaignFinanceSnapshot } from "@/lib/campaign-events/finance/load-campaign-finance-snapshot";
import { DashboardSection } from "../dashboard/CampaignDashboardShell";

export function CampaignManagerFinancePanel({ snapshot, month }: { snapshot: CampaignFinanceSnapshot; month: string }) {
  return (
    <DashboardSection title="Campaign finance operations">
      <dl className="grid gap-3 font-body text-sm sm:grid-cols-2">
        <div>
          <dt className="text-xs text-kelly-text/50">Month pipeline</dt>
          <dd className="font-bold">{snapshot.pipelineLabel}</dd>
        </div>
        <div>
          <dt className="text-xs text-kelly-text/50">Finance exceptions</dt>
          <dd className="font-bold">{snapshot.exceptionCount}</dd>
        </div>
        <div>
          <dt className="text-xs text-kelly-text/50">Missing mileage rows</dt>
          <dd>{snapshot.missingMileage}</dd>
        </div>
        <div>
          <dt className="text-xs text-kelly-text/50">Receipts pending</dt>
          <dd>{snapshot.pendingReceipts}</dd>
        </div>
      </dl>
      {snapshot.countySpendNotes.length ? (
        <p className="mt-3 font-body text-xs">
          <span className="font-bold">County spend (travel reimbursement):</span> {snapshot.countySpendNotes.join(" · ")}
        </p>
      ) : null}
      <div className="mt-3 flex flex-wrap gap-3 text-xs font-bold">
        <Link href={`/admin/campaign-events/reimbursement?month=${month}`} className="text-kelly-navy underline">
          Reimbursement packet
        </Link>
        <Link href={`/admin/campaign-events/month-readiness?month=${month}`} className="underline">
          Month readiness
        </Link>
      </div>
    </DashboardSection>
  );
}
