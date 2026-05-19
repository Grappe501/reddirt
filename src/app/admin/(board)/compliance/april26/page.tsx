import Link from "next/link";
import {
  ComplianceActionButton,
  ComplianceCard,
  ComplianceMetricCard,
  ComplianceNav,
  CompliancePageHeader,
} from "../components";
import { buildApril26ImportStatus } from "@/lib/compliance/imports/april26-import-status";
import { buildBankReconciliationRehearsal } from "@/lib/compliance/imports/bank-reconciliation-rehearsal";
import { buildBankCsvOperatorGuide } from "@/lib/compliance/imports/bank-csv-operator-state";
import { ComplianceDoThisNext, ComplianceWhatThisMeans } from "../compliance-ux";
import { rebuildApprovalQueuesAction } from "../approval/actions";
import { AprilExpenditureInventoryPanel } from "../command-center/april-expenditure-inventory-panel";

export const dynamic = "force-dynamic";

export default async function April26ImportPage() {
  const [status, rehearsal] = await Promise.all([buildApril26ImportStatus(), buildBankReconciliationRehearsal()]);
  const bank = status.bankReadiness;
  const bankGuide = buildBankCsvOperatorGuide(bank, {
    unmatchedBank: rehearsal.unmatchedBank.length,
    ambiguous: rehearsal.ambiguous.length,
    highConfidence: rehearsal.highConfidence.length,
  });

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
      <ComplianceDoThisNext
        title={bankGuide.headline}
        description={bankGuide.nextAction}
        href={bankGuide.href}
        actionLabel="Take action"
        secondaryHref="/admin/compliance/command-center"
        secondaryLabel="Command center"
      />
      <ComplianceWhatThisMeans title="Bank CSV status explained">
        <p>{bankGuide.meaning}</p>
        <p className="mt-2 font-mono text-xs">State: {bankGuide.state} · Command: {bankGuide.command}</p>
        {bankGuide.issueSummary.length ? (
          <ul className="mt-2 list-disc pl-5">
            {bankGuide.issueSummary.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        ) : null}
      </ComplianceWhatThisMeans>
      <AprilExpenditureInventoryPanel />
      <ComplianceCard title="Standing by to audit — definitive checklist">
        <p className="text-sm text-slate-700">
          Open <strong>docs/compliance/COMPLIANCE_APRIL_AUDIT_CHECKLIST.md</strong> (or run{" "}
          <code className="rounded bg-slate-100 px-1">npm run compliance:april-audit-checklist</code>). Part A = every check record with{" "}
          <strong>what we have</strong> vs <strong>what we need</strong>. Part B = every April bank debit the same way.
        </p>
      </ComplianceCard>
      <ComplianceCard title="Bank source status">
        <p className="text-sm font-semibold text-[#0f2744]">{bankGuide.headline}</p>
        <p className="mt-2 text-sm">{bank.operatorSummary}</p>
        <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-slate-500">Source type</dt>
            <dd className="font-mono">{bankGuide.sourceType}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Reconciliation status</dt>
            <dd className="font-mono">{bank.reconciliationStatus}</dd>
          </div>
          <div>
            <dt className="text-slate-500">File rows</dt>
            <dd>{bank.rowCount}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Database chunks</dt>
            <dd>
              {bank.databaseBatchCount} batch(es) · {bank.databaseTransactionCount} txn(s)
            </dd>
          </div>
          <div>
            <dt className="text-slate-500">Valid credits</dt>
            <dd>{bank.validRowCount}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Can reconcile</dt>
            <dd>{bank.readyForReconciliation ? "yes" : "no"}</dd>
          </div>
        </dl>
        {!bank.readyForReconciliation ? (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm">
            <p className="font-semibold">Next action</p>
            <p className="mt-1">{bankGuide.nextAction}</p>
            <p className="mt-2 font-mono text-xs break-all">Optional file: {bank.expectedPath}</p>
          </div>
        ) : (
          <p className="mt-4 text-sm">
            <Link href="/admin/compliance/reconciliation" className="font-semibold underline">
              Open reconciliation workbench
            </Link>
          </p>
        )}
      </ComplianceCard>
      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <ComplianceMetricCard label="Folder" value={status.folderExists ? "found" : "missing"} tone={status.folderExists ? "green" : "red"} />
        <ComplianceMetricCard label="GoodChange CSV" value={status.goodChangeCsvFound ? "yes" : "no"} tone={status.goodChangeCsvFound ? "green" : "red"} />
        <ComplianceMetricCard label="Ethics workbook" value={status.ethicsWorkbookFound ? "yes" : "no"} tone={status.ethicsWorkbookFound ? "green" : "yellow"} />
        <ComplianceMetricCard
          label="Bank source"
          value={bank.canSatisfyBankRequirement ? "ready" : bank.databaseTransactionCount > 0 ? "chunks" : "missing"}
          tone={bank.readyForReconciliation ? "green" : bank.databaseTransactionCount > 0 ? "yellow" : "red"}
        />
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
        {rehearsal.columnDiagnostics.headers.length ? (
          <p className="mt-2 text-xs text-slate-600">Detected columns: {rehearsal.columnDiagnostics.headers.join(", ")}</p>
        ) : null}
      </ComplianceCard>
      <ComplianceCard title="Reconciliation rehearsal (source-backed)">
        <p className="text-sm">
          High-confidence: {rehearsal.highConfidence.length} · Ambiguous: {rehearsal.ambiguous.length} · Unmatched bank:{" "}
          {rehearsal.unmatchedBank.length} · Unmatched payouts: {rehearsal.unmatchedPayouts.length}
        </p>
        <p className="mt-2 text-sm font-semibold text-[#0f2744]">What to fix next</p>
        <ul className="mt-1 list-disc pl-5 text-sm">
          {rehearsal.operatorNextSteps.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ul>
        {rehearsal.highConfidence.length ? (
          <ul className="mt-3 max-h-40 overflow-y-auto text-xs">
            {rehearsal.highConfidence.slice(0, 8).map((m) => (
              <li key={`${m.bankRowNumber}-${m.payoutKey}`}>
                Row {m.bankRowNumber} ${m.bankAmount.toFixed(2)} → payout {m.payoutKey.slice(0, 12)}… ({m.confidenceReason})
              </li>
            ))}
          </ul>
        ) : null}
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
