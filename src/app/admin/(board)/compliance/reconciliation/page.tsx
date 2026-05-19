import Link from "next/link";
import { ComplianceCard, ComplianceNav, CompliancePageHeader, ComplianceWarningPanel, StorageModeNotice } from "../components";
import { ComplianceWhatThisMeans } from "../compliance-ux";
import { buildReconciliationReviewBoard } from "@/lib/compliance/reconciliation/build-reconciliation-review-board";
import { buildReconciliationProgress } from "@/lib/compliance/reconciliation/build-reconciliation-progress";
import { buildReconciliationWorkbench } from "@/lib/compliance/reconciliation/reconciliation-workbench-storage";
import { loadStagedReceipts } from "@/lib/compliance/receipts/receipt-storage";
import { buildReconciliationAnalysis } from "@/lib/compliance/storage";
import {
  AmbiguousReviewPanel,
  HighConfidenceReviewPanel,
  UnmatchedBankReviewPanel,
} from "./reconciliation-review-panels";

export const dynamic = "force-dynamic";

export default async function ComplianceReconciliationPage() {
  const [analysis, receipts, workbench, board, progress] = await Promise.all([
    buildReconciliationAnalysis(),
    loadStagedReceipts(),
    buildReconciliationWorkbench(),
    buildReconciliationReviewBoard(),
    buildReconciliationProgress(),
  ]);
  const unmatchedReceipts = receipts.filter((receipt) => receipt.reconciliationStatus === "awaiting_bank_match" && receipt.approvalStatus === "approved");
  const savedIds = [...board.savedMatchIds];

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 pb-12">
      <CompliancePageHeader
        eyebrow="Reconciliation"
        title="Bank reconciliation workbench"
        description="Treasurer-guided review for April 2026 bank credits. Create drafts, approve, and lock — nothing auto-resolves."
        actions={
          <Link href="/admin/compliance/imports/bank" className="rounded-full border border-slate-300 bg-white px-5 py-2.5 text-sm font-bold text-[#0f2744]">
            Bank import
          </Link>
        }
      />
      <ComplianceNav />
      <StorageModeNotice />

      <ComplianceWhatThisMeans title="How to work this page">
        <ol className="list-decimal space-y-1 pl-5 text-sm">
          <li>High-confidence rows: create a draft, then open the match to approve and lock.</li>
          <li>Ambiguous rows: pick the correct payout batch — system will not guess.</li>
          <li>Unmatched rows: create an investigation draft or ignore after documenting why.</li>
        </ol>
        <p className="mt-2 text-xs text-slate-500">{board.operatorSummary}</p>
      </ComplianceWhatThisMeans>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <ComplianceCard title="Review progress">{progress.percentReviewed}% drafted or decided</ComplianceCard>
        <ComplianceCard title="Remaining">{progress.remainingReviewItems} rehearsal item(s)</ComplianceCard>
        <ComplianceCard title="Locked">{progress.lockedMatches}</ComplianceCard>
        <ComplianceCard title="Saved drafts">{progress.savedMatches}</ComplianceCard>
        <ComplianceCard title="Ambiguous">{progress.ambiguousTotal} groups</ComplianceCard>
        <ComplianceCard title="Unmatched credits">{progress.unmatchedTotal}</ComplianceCard>
        <ComplianceCard title="High confidence">{progress.highConfidenceTotal}</ComplianceCard>
        <ComplianceCard title="Analysis candidates">{analysis.summary.highConfidence + analysis.summary.mediumConfidence} preview</ComplianceCard>
      </section>

      {!board.ready ? (
        <ComplianceWarningPanel title="Bank source not ready" tone="amber">
          <p className="text-sm">{board.operatorSummary}</p>
          <Link href="/admin/compliance/april26" className="mt-2 inline-block text-sm font-bold underline">
            April26 desk
          </Link>
        </ComplianceWarningPanel>
      ) : null}

      <ComplianceCard title="High-confidence matches (create draft → approve → lock)">
        <HighConfidenceReviewPanel rows={board.highConfidence} savedMatchIds={savedIds} />
      </ComplianceCard>

      <ComplianceCard title="Ambiguous bank credits (treasurer must pick payout)">
        <p className="text-sm text-slate-600">Multiple GoodChange payout batches share the same deposit amount. Pick one — no auto-resolve.</p>
        <AmbiguousReviewPanel groups={board.ambiguousGroups} savedMatchIds={savedIds} />
      </ComplianceCard>

      <ComplianceCard title="Unmatched bank credits (no payout batch)">
        <p className="text-sm text-slate-600">These bank credits did not match any payout batch by amount. Investigate or document.</p>
        <UnmatchedBankReviewPanel rows={board.unmatchedBank} savedMatchIds={savedIds} />
      </ComplianceCard>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="font-heading text-xl font-bold text-[#0f2744]">Saved matches — approve & lock</h2>
        <div className="mt-3 grid gap-2">
          {workbench.matches.map((match) => (
            <article key={match.id} className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm">
              <p className="font-semibold">
                {match.id} · {match.status} · {match.matchType}
              </p>
              <p>
                Bank ${match.bankAmount?.toFixed(2) ?? "n/a"} · ledger ${match.ledgerAmount?.toFixed(2) ?? "n/a"} · variance{" "}
                {match.variance != null ? `$${match.variance.toFixed(2)}` : "n/a"}
              </p>
              <Link className="font-semibold text-[#0f2744] underline" href={`/admin/compliance/reconciliation/${match.id}`}>
                Open match → approve / lock / unlock
              </Link>
            </article>
          ))}
          {!workbench.matches.length ? <p className="text-slate-600">No saved matches yet. Use the panels above to create drafts.</p> : null}
        </div>
      </section>

      <ComplianceCard title="Unmatched receipts (expense side)">
        <div className="mt-1 grid gap-2">
          {unmatchedReceipts.slice(0, 10).map((receipt) => (
            <p key={receipt.id} className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-sm">
              {receipt.vendorName ?? "Vendor"} · ${receipt.total.toFixed(2)} · {receipt.receiptDate ?? "date missing"}
            </p>
          ))}
          {!unmatchedReceipts.length ? <p className="text-sm text-slate-600">No approved receipt expenses awaiting bank match.</p> : null}
        </div>
      </ComplianceCard>
    </div>
  );
}
