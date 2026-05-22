import Link from "next/link";
import {
  ComplianceCard,
  ComplianceNav,
  CompliancePageHeader,
  ComplianceStatusBadge,
  ComplianceWarningPanel,
} from "../components";
import { APRIL_2026_QUEUE_ID } from "@/lib/compliance/approval/build-approval-queue";
import { loadApril26Dashboard } from "@/lib/compliance/april26/load-april26-dashboard";

export const dynamic = "force-dynamic";

const REVIEW_LINKS = [
  { label: "Review Contributions", href: `/admin/compliance/approval/${APRIL_2026_QUEUE_ID}?filter=goodchange` },
  { label: "Review Expenses", href: "/admin/compliance/money" },
  { label: "Review Receipts", href: "/admin/compliance/receipts/review" },
  { label: "Review Checks/Cash", href: "/admin/compliance/checks/review" },
  { label: "Review In-Kind", href: `/admin/compliance/approval/${APRIL_2026_QUEUE_ID}` },
  { label: "Review Payout Batches", href: "/admin/compliance/reconciliation" },
  { label: "Open Lightning Approval Workbench", href: `/admin/compliance/approval/${APRIL_2026_QUEUE_ID}` },
] as const;

export default async function April26CompliancePage() {
  const data = await loadApril26Dashboard();
  const summary = data.summary;

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 pt-6">
      <CompliancePageHeader
        eyebrow="April 2026"
        title="April26 Compliance Dashboard"
        description="Authoritative RedDirt interface for April 2026 ingest, review, reconciliation, and filing readiness. All AI extractions are draft; treasurer/counsel approval required before filing."
        actions={
          <Link href="/admin/compliance" className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700">
            Command Center
          </Link>
        }
      />
      <ComplianceNav />

      {!data.bankCsvPresent ? (
        <ComplianceWarningPanel title="Bank CSV required to complete reconciliation" tone="red">
          <p className="mt-2 font-body text-sm text-slate-700">
            Expected file: <code className="text-xs">{data.bankCsvPath}</code>
          </p>
          <p className="mt-2 font-body text-sm text-slate-700">
            Required headers: <strong>date, amount, memo</strong> (credits positive). Deposit matching and payout reconciliation stay blocked until this file is added and ingest is re-run.
          </p>
        </ComplianceWarningPanel>
      ) : (
        <ComplianceWarningPanel title="Bank CSV detected" tone="amber">
          <p className="mt-2 font-body text-sm text-slate-700">
            Bank file present. Re-run <code className="text-xs">npm run compliance:april26:ingest</code> after updates, then reconcile in the workbench.
          </p>
        </ComplianceWarningPanel>
      )}

      <section className="flex flex-wrap gap-2">
        {REVIEW_LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="rounded-full bg-[#0f2744] px-4 py-2 font-body text-xs font-bold text-white"
          >
            {link.label}
          </Link>
        ))}
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <ComplianceMetric label="GoodChange rows" value={String(summary?.goodChangeRows ?? "—")} />
        <ComplianceMetric label="Contributions staged" value={String(summary?.contributionsStaged ?? data.aprilMovements.contributions)} />
        <ComplianceMetric label="Expenses staged" value={String(summary?.expensesStaged ?? data.aprilMovements.expenses)} />
        <ComplianceMetric label="Receipt images" value={String(summary?.receiptImageCount ?? data.inventory.receiptImageCount)} />
        <ComplianceMetric label="Check images" value={String(summary?.checkImageCount ?? data.inventory.checkImageCount)} />
        <ComplianceMetric label="In-kind images" value={String(summary?.inKindImageCount ?? data.inventory.inKindImageCount)} />
        <ComplianceMetric label="AI chunks" value={String(summary?.aiChunkCount ?? data.chunks.count)} />
        <ComplianceMetric label="Payout batches" value={String(summary?.payoutBatchCount ?? data.payoutBatches.length)} />
        <ComplianceMetric label="Approval remaining" value={String(data.approval.stats.remaining)} />
      </section>

      <section className="flex flex-wrap gap-2">
        <ComplianceStatusBadge label={summary ? "Ingest complete" : "Run ingest"} tone={summary ? "green" : "yellow"} />
        <ComplianceStatusBadge label={`Bank CSV: ${data.bankCsvPresent ? "present" : "missing"}`} tone={data.bankCsvPresent ? "green" : "red"} />
        <ComplianceStatusBadge label={`Vision: ${summary?.visionEnabled ? "on" : "dry/skipped"}`} tone="neutral" />
        <ComplianceStatusBadge label={`${data.registrySummary.total} source docs`} tone="neutral" />
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <ComplianceCard eyebrow="Ingest" title="Source inventory" href="/admin/compliance/imports">
          Folder: {data.inventory.sourceDir}. GoodChange CSV {data.inventory.goodChangeCsvFound ? "found" : "missing"}; Ethics workbook{" "}
          {data.inventory.ethicsWorkbookFound ? "found" : "missing"}.
        </ComplianceCard>
        <ComplianceCard eyebrow="Reports" title="April26 reports" href="/admin/compliance/reports/april26">
          Ingest summary, payout expectations, OCR reports, reconciliation candidates, filing impact.
        </ComplianceCard>
        <ComplianceCard eyebrow="Reconciliation" title="Reconciliation workspace" href="/admin/compliance/reconciliation">
          {data.workbench.unmatchedBank} unmatched bank lines · {data.workbench.unmatchedMoney} unmatched money movements · {data.reconciliationCandidates.length}{" "}
          candidates from April26 ingest.
        </ComplianceCard>
        <ComplianceCard eyebrow="Approval" title={data.approval.queueLabel} href={`/admin/compliance/approval/${APRIL_2026_QUEUE_ID}`}>
          {data.approval.stats.remaining} item(s) need review. Human approval required before filing export.
        </ComplianceCard>
      </section>

      {data.reconciliationBlockers.length ? (
        <ComplianceWarningPanel title="Reconciliation blockers" tone="amber">
          <ul className="mt-2 list-disc space-y-1 pl-5 font-body text-sm text-slate-700">
            {data.reconciliationBlockers.map((blocker) => (
              <li key={blocker}>{blocker}</li>
            ))}
          </ul>
        </ComplianceWarningPanel>
      ) : null}
    </div>
  );
}

function ComplianceMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="font-body text-xs font-bold uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-2 font-heading text-2xl font-bold text-[#0f2744]">{value}</p>
    </div>
  );
}
