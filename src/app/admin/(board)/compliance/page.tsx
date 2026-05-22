import Link from "next/link";
import {
  ComplianceCard,
  ComplianceHeroActions,
  ComplianceMetricCard,
  ComplianceNav,
  CompliancePageHeader,
  ComplianceStatusBadge,
  ComplianceWarningPanel,
  StorageModeNotice,
} from "./components";
import { buildComplianceExecutiveScore } from "@/lib/compliance/scoring/compliance-score";
import { buildFilingReadinessReport } from "@/lib/compliance/filing-readiness/build-filing-readiness-report";
import { buildComplianceTasks } from "@/lib/compliance/tasks/build-compliance-tasks";
import { loadBankAnalyses, loadGoodChangeAnalyses } from "@/lib/compliance/storage";
import { loadApprovalQueues, loadApprovalItems } from "@/lib/compliance/approval/approval-storage";
import { computeQueueStats } from "@/lib/compliance/approval/load-approval-queue";
import { APRIL_2026_QUEUE_ID } from "@/lib/compliance/approval/build-approval-queue";
import { buildApril26ImportStatus } from "@/lib/compliance/imports/april26-import-status";

export const dynamic = "force-dynamic";

export default async function ComplianceCommandCenterPage() {
  const [goodChange, bank, score, readiness, tasks, queues, items, april26] = await Promise.all([
    loadGoodChangeAnalyses(),
    loadBankAnalyses(),
    buildComplianceExecutiveScore(),
    buildFilingReadinessReport(),
    buildComplianceTasks(),
    loadApprovalQueues(),
    loadApprovalItems(),
    buildApril26ImportStatus(),
  ]);
  const aprilStats = computeQueueStats(items.filter((item) => item.queueId === APRIL_2026_QUEUE_ID));
  const urgentTasks = tasks.filter((task) => task.priority === "urgent").length;
  const readinessTone = readiness.overallStatus === "green" ? "green" : readiness.overallStatus === "yellow" ? "yellow" : "red";

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 pt-6">
      <CompliancePageHeader
        eyebrow="Compliance"
        title="Compliance Command Center"
        description="Stage contributions, receipts, and expenses; reconcile bank activity; approve records; check filing readiness. Human review required — not legal certification."
        actions={
          <Link href="/admin/compliance/filing-readiness" className="rounded-full bg-[#0f2744] px-5 py-2.5 text-sm font-bold text-white">
            Can we file?
          </Link>
        }
      />
      <ComplianceNav />
      <StorageModeNotice />
      <ComplianceHeroActions />
      <ComplianceWarningPanel title="April 2026 import checklist (local folder — not committed)">
        <ul className="mt-2 grid gap-1 text-sm sm:grid-cols-2">
          <li>Folder: {april26.folderExists ? "found" : "missing"}</li>
          <li>GoodChange CSV: {april26.goodChangeCsvFound ? "yes" : "no"} ({april26.goodChangeRows} rows)</li>
          <li>Bank CSV: {april26.bankCsvFound ? "yes" : "no"}</li>
          <li>Receipt images: {april26.receiptImagesFound}</li>
          <li>In-kind pages: {april26.inKindPagesFound}</li>
          <li>Check images: {april26.checkImagesFound}</li>
          <li>Needs approval: {april26.stagedNeedingApproval}</li>
          <li>Needs reconciliation: {april26.stagedNeedingReconciliation}</li>
        </ul>
        <p className="mt-2 text-xs opacity-80">Path: {april26.folderPath}</p>
      </ComplianceWarningPanel>
      <section className="grid gap-4 md:grid-cols-4">
        <ComplianceMetricCard label="Completion" value={`${score.score}%`} tone={score.status === "green" ? "green" : score.status === "yellow" ? "yellow" : "red"} />
        <ComplianceMetricCard label="Commercial readiness" value={`${score.commercialReadinessPct}%`} tone="navy" />
        <ComplianceMetricCard label="Filing readiness" value={readiness.overallStatus} tone={readinessTone} />
        <ComplianceMetricCard label="Approval remaining" value={aprilStats.remaining} tone={aprilStats.remaining ? "yellow" : "green"} />
      </section>
      <ComplianceWarningPanel title="What should I do next?" tone={urgentTasks ? "red" : "amber"}>
        <ol className="mt-2 list-decimal space-y-1 pl-5">
          {aprilStats.remaining > 0 ? <li>Clear {aprilStats.remaining} item(s) in the <Link className="font-bold underline" href="/admin/compliance/approval">Lightning Approval Workbench</Link>.</li> : null}
          {readiness.blockers.length ? <li>Resolve {readiness.blockers.length} filing blocker(s) on <Link className="font-bold underline" href="/admin/compliance/filing-readiness">Filing Readiness</Link>.</li> : null}
          {urgentTasks ? <li>Work {urgentTasks} urgent task(s) in the <Link className="font-bold underline" href="/admin/compliance/tasks">Task Center</Link>.</li> : null}
          {!aprilStats.remaining && !readiness.blockers.length && !urgentTasks ? (
            <li>Run imports, reconcile bank lines, then build a draft filing package — still requires treasurer sign-off.</li>
          ) : null}
        </ol>
      </ComplianceWarningPanel>
      <section className="flex flex-wrap items-center gap-2">
        <ComplianceStatusBadge label={`Executive ${score.status}`} tone={score.status} />
        <ComplianceStatusBadge label={`${tasks.length} open tasks`} tone={tasks.length ? "yellow" : "green"} />
        <ComplianceStatusBadge label={`${queues.length} approval queues`} tone="neutral" />
      </section>
      <section className="grid gap-4 md:grid-cols-2">
        <ComplianceCard eyebrow="Receipts" title="Receipt Intake Wizard" href="/admin/compliance/receipts/new">
          Upload a receipt, verify OCR or enter manually, confirm tip, approve, and stage for bank match.
        </ComplianceCard>
        <ComplianceCard eyebrow="Tasks" title="Compliance Task Center" href="/admin/compliance/tasks">
          Missing donor fields, receipts, W-9s, bank matches, duplicates, rule gaps, and filing blockers.
        </ComplianceCard>
        <ComplianceCard eyebrow="Filing" title="Filing Packages" href="/admin/compliance/filings">
          Draft packages with hash manifests. Unapproved records are excluded from export.
        </ComplianceCard>
        <ComplianceCard eyebrow="Reconciliation" title="Bank matching workspace" href="/admin/compliance/reconciliation">
          Match GoodChange payouts, receipts, cash, and checks to bank lines before locking.
        </ComplianceCard>
        <ComplianceCard eyebrow="April 2026" title="April26 compliance ingest" href="/admin/compliance/april26" highlight>
          GoodChange CSV, Ethics workbook, receipt/check images, payout batches, and bank CSV blocker status.
        </ComplianceCard>
        <ComplianceCard eyebrow="GoodChange" title="Fundraising import" href="/admin/compliance/imports/goodchange">
          {goodChange.length} analyzed batch(es). Stage rows, then approve in the workbench.
        </ComplianceCard>
        <ComplianceCard eyebrow="Bank" title="Bank CSV import" href="/admin/compliance/imports/bank">
          {bank.length} analyzed batch(es). Unmatched lines appear in reconciliation.
        </ComplianceCard>
        <ComplianceCard eyebrow="Cash" title="Cash Contribution Intake" href="/admin/compliance/cash">
          Donor slips, over-limit warnings, batch deposit, and review queue.
        </ComplianceCard>
        <ComplianceCard eyebrow="Checks" title="Check contributions" href="/admin/compliance/checks">
          Check number, donor info, deposit status, and review.
        </ComplianceCard>
        <ComplianceCard eyebrow="Money" title="Money Movement Center" href="/admin/compliance/money">
          All money in/out with review, documentation, and reconciliation status.
        </ComplianceCard>
        <ComplianceCard eyebrow="Rules" title="Rule Coverage" href="/admin/compliance/rules">
          Arkansas SOS/Ethics topics — needs legal review where marked.
        </ComplianceCard>
        <ComplianceCard eyebrow="Reports" title="Assessment reports" href="/admin/compliance/reports">
          Coverage, blockers, and operator reports. No private donor data in git.
        </ComplianceCard>
        <ComplianceCard eyebrow="Executive" title="Completion dashboard" href="/admin/compliance/executive">
          Subsystem scores, blockers, and recommended next actions.
        </ComplianceCard>
      </section>
    </div>
  );
}
