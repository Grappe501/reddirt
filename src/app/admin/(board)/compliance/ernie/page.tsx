import Link from "next/link";
import { ComplianceCard, ComplianceNav, CompliancePageHeader, ComplianceStatusBadge } from "../components";
import { ComplianceDoThisNext, ComplianceWhatThisMeans } from "../compliance-ux";
import { buildErnieWorkflowSnapshot } from "@/lib/compliance/audit/build-ernie-workflow";

export const dynamic = "force-dynamic";

function statusTone(status: string): "green" | "yellow" | "red" | "neutral" {
  if (status === "complete") return "green";
  if (status === "in_progress") return "yellow";
  if (status === "blocked") return "red";
  return "neutral";
}

export default async function ErnieWorkflowPage() {
  const snapshot = await buildErnieWorkflowSnapshot();

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 pb-12">
      <CompliancePageHeader
        eyebrow="Start here"
        title="Ernie — April 2026 compliance workflow"
        description="Focused path for checks, in-kind auction, bank matching, addresses, and filing. Use the audit spreadsheet — not the generic approval queue first."
        actions={
          <a
            href="/api/admin/compliance/audit-spreadsheet?file=docs/compliance/audit/april-2026-compliance-audit.csv"
            className="rounded-full bg-[#0f2744] px-5 py-2.5 text-sm font-bold text-white"
            download
          >
            Download audit CSV
          </a>
        }
      />
      <ComplianceNav />
      <ComplianceDoThisNext
        title="Complete the April audit spreadsheet first"
        description={snapshot.avoidGenericQueue.message}
        href="#spreadsheet"
        actionLabel="Spreadsheet paths below"
        secondaryHref="/admin/compliance/command-center"
        secondaryLabel="Command center"
      />
      <ComplianceWhatThisMeans title="What done looks like">
        <p>
          Checks entered in SOS, Ozark auction rows in SOS, bank lines reconciled, addresses filled from source only,
          rule topics reviewed, then filing readiness reviewed with treasurer. Filing may stay <strong>red</strong> until
          sign-off — that is honest.
        </p>
      </ComplianceWhatThisMeans>
      <section id="spreadsheet" className="rounded-2xl border border-[#0f2744]/20 bg-slate-50 p-5">
        <h2 className="font-heading text-lg font-bold text-[#0f2744]">Definitive audit spreadsheet package</h2>
        <p className="mt-2 text-sm text-slate-700">
          Regenerate: <code className="rounded bg-white px-1">npm run compliance:april-audit-spreadsheet</code>
        </p>
        <ul className="mt-3 list-disc space-y-1 pl-5 text-sm font-mono">
          <li>docs/compliance/audit/april-2026-compliance-audit.csv</li>
          <li>docs/compliance/audit/april-2026-compliance-audit.xlsx</li>
          <li>docs/compliance/audit/april-2026-checks.csv</li>
          <li>docs/compliance/audit/april-2026-ledger-expenditures.csv</li>
          <li>docs/compliance/audit/april-2026-missing-addresses.csv</li>
          <li>docs/compliance/audit/april-2026-unmatched-items.csv</li>
          <li>docs/compliance/audit/april-2026-in-kind-auction.csv</li>
          <li>docs/compliance/audit/april-2026-reconciliation-exceptions.csv</li>
        </ul>
        <p className="mt-3 text-sm">
          After filling <code className="rounded bg-white px-1">human_answer</code> columns:{" "}
          <code className="rounded bg-white px-1">npm run compliance:april-audit-import-preview</code> (preview only — no writes).
        </p>
      </section>
      <section className="grid gap-4">
        {snapshot.sections.map((section) => (
          <article key={section.step} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Step {section.step}</p>
                <h2 className="font-heading text-xl font-bold text-[#0f2744]">{section.title}</h2>
              </div>
              <ComplianceStatusBadge label={section.status.replace(/_/g, " ")} tone={statusTone(section.status)} />
            </div>
            <p className="mt-2 text-sm font-semibold text-slate-800">{section.countRemaining} remaining</p>
            <p className="mt-2 text-sm text-slate-700">{section.whatThisMeans}</p>
            <p className="mt-2 text-sm text-slate-600">
              <strong>Done:</strong> {section.doneLooksLike}
            </p>
            <Link
              href={section.href}
              className="mt-4 inline-block rounded-full bg-[#0f2744] px-5 py-2.5 text-sm font-bold text-white"
            >
              {section.primaryAction}
            </Link>
          </article>
        ))}
      </section>
      <ComplianceCard title="Full progress report">
        <p className="text-sm">
          See <code className="rounded bg-slate-100 px-1">docs/compliance/COMPLIANCE_PROGRESS_REPORT_FOR_ERNIE.md</code> and{" "}
          <code className="rounded bg-slate-100 px-1">COMPLIANCE_APRIL_AUDIT_SPREADSHEET_GUIDE.md</code>.
        </p>
      </ComplianceCard>
    </div>
  );
}
