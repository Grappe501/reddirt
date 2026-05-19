import Link from "next/link";
import {
  ComplianceActionButton,
  ComplianceCard,
  ComplianceMetricCard,
  ComplianceNav,
  CompliancePageHeader,
  ComplianceWarningPanel,
} from "../components";
import { buildApril26ImportStatus } from "@/lib/compliance/imports/april26-import-status";
import { rebuildApprovalQueuesAction } from "../approval/actions";

export const dynamic = "force-dynamic";

export default async function April26ImportPage() {
  const status = await buildApril26ImportStatus();
  const bank = status.bankReadiness;

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 pb-12">
      <CompliancePageHeader
        eyebrow="April 2026"
        title="April26 import status"
        description="Operator view of staged April 2026 compliance sources on disk. Staged for review — not filed. Not legal certification."
        actions={
          <form action={rebuildApprovalQueuesAction}>
            <button type="submit" className="rounded-full bg-[#0f2744] px-5 py-2.5 text-sm font-bold text-white">
              Rebuild approval queues
            </button>
          </form>
        }
      />
      <ComplianceNav />
      {!bank.readyForReconciliation ? (
        <ComplianceWarningPanel title="Bank CSV required to complete reconciliation" tone="red">
          <p className="font-semibold">Expected file:</p>
          <p className="mt-1 font-mono text-xs break-all">{bank.expectedPath}</p>
          <p className="mt-3 text-sm">Headers: date, amount, memo — credits positive.</p>
          {bank.issues.length ? (
            <ul className="mt-3 list-disc pl-5 text-sm">
              {bank.issues.map((issue) => (
                <li key={`${issue.code}-${issue.row ?? 0}`}>{issue.message}</li>
              ))}
            </ul>
          ) : null}
        </ComplianceWarningPanel>
      ) : (
        <ComplianceWarningPanel title="Bank CSV validated" tone="amber">
          <p>{bank.reconciliationHint}</p>
          <p className="mt-2 text-sm">
            Valid rows: {bank.validRowCount} · Duplicates flagged: {bank.duplicateMemoCount}
          </p>
          <Link href="/admin/compliance/reconciliation" className="mt-2 inline-block font-semibold underline">
            Open reconciliation workbench
          </Link>
        </ComplianceWarningPanel>
      )}
      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <ComplianceMetricCard label="Folder" value={status.folderExists ? "found" : "missing"} tone={status.folderExists ? "green" : "red"} />
        <ComplianceMetricCard label="GoodChange CSV" value={status.goodChangeCsvFound ? "yes" : "no"} tone={status.goodChangeCsvFound ? "green" : "red"} />
        <ComplianceMetricCard label="Ethics workbook" value={status.ethicsWorkbookFound ? "yes" : "no"} tone={status.ethicsWorkbookFound ? "green" : "yellow"} />
        <ComplianceMetricCard label="Bank CSV" value={bank.found ? "yes" : "no"} tone={bank.readyForReconciliation ? "green" : "red"} />
        <ComplianceMetricCard label="Check images" value={status.checkImagesFound} tone="navy" />
        <ComplianceMetricCard label="Receipt images" value={status.receiptImagesFound} tone="navy" />
        <ComplianceMetricCard label="In-kind images" value={status.inKindPagesFound} tone="navy" />
        <ComplianceMetricCard label="Payout batches" value={status.payoutBatches} tone="navy" />
        <ComplianceMetricCard label="Staged contributions" value={status.stagedContributions} tone="navy" />
        <ComplianceMetricCard label="Staged expenses" value={status.stagedExpenses} tone="navy" />
        <ComplianceMetricCard label="Approval queue items" value={status.approvalQueueItems} tone="yellow" />
        <ComplianceMetricCard label="Reconciliation blockers" value={status.reconciliationBlockers} tone={status.reconciliationBlockers ? "red" : "green"} />
      </section>
      <ComplianceCard title="Bank CSV readiness checks">
        <p className="text-sm">{bank.reconciliationHint}</p>
        {bank.issues.length ? (
          <ul className="mt-2 list-disc pl-5 text-sm">
            {bank.issues.map((issue) => (
              <li key={`${issue.code}-${issue.message}`}>
                <span className="font-mono text-xs">{issue.code}</span> — {issue.message}
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-sm text-slate-600">No issues once file is present and valid.</p>
        )}
      </ComplianceCard>
      <p className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 font-mono text-xs text-slate-700">{status.folderPath}</p>
      <div className="flex flex-wrap gap-3">
        <ComplianceActionButton href="/admin/compliance/approval/april-2026-compliance-review" label="Open April queue" />
        <ComplianceActionButton href="/admin/compliance/reconciliation" label="Reconciliation" variant="secondary" />
        <ComplianceActionButton href="/admin/compliance/filing-readiness" label="Filing readiness" variant="secondary" />
      </div>
    </div>
  );
}
