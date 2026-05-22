"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { CalendarSurfaceRow } from "@/lib/campaign-events/load-campaign-calendar-events";
import type { EventFinanceData, EventExpenseLine } from "@/lib/campaign-events/finance/finance-types";
import type { FinanceDocumentRecord } from "@/lib/campaign-events/finance/finance-document-types";
import { Field, PlanningSection } from "../planning/PlanningSection";
import { refreshEventFinanceAction, saveEventFinanceAction } from "@/app/admin/(board)/campaign-events/event-finance-actions";
import { uploadFinanceDocumentAction } from "@/app/admin/(board)/campaign-events/finance-document-actions";
import { reimbursementHref } from "@/lib/campaign-events/travel-reimbursement/travel-reimbursement-links";

const WARN_STYLE = {
  low: "bg-emerald-50 text-emerald-950 border-emerald-200",
  medium: "bg-amber-50 text-amber-950 border-amber-200",
  high: "bg-red-50 text-red-950 border-red-200",
};

export function EventFinancialOperationsWorkspace({
  row,
  initial,
  documents,
}: {
  row: CalendarSurfaceRow;
  initial: EventFinanceData;
  documents: FinanceDocumentRecord[];
}) {
  const router = useRouter();
  const [finance, setFinance] = useState(initial);
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const month = row.dateYmd.slice(0, 7);

  const save = () => {
    startTransition(async () => {
      const res = await saveEventFinanceAction(row.recordId, finance);
      setFinance(res.finance);
      setMessage("Financial operations saved.");
      router.refresh();
    });
  };

  const refresh = () => {
    startTransition(async () => {
      const res = await refreshEventFinanceAction(row.recordId);
      setFinance(res.finance);
      setMessage("Readiness refreshed from ledger + receipts.");
      router.refresh();
    });
  };

  const uploadReceipt = () => {
    const file = fileRef.current?.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.set("recordId", row.recordId);
    fd.set("file", file);
    fd.set("uploaderName", "Campaign admin");
    startTransition(async () => {
      await uploadFinanceDocumentAction(fd);
      setMessage("Receipt uploaded (pending approval).");
      router.refresh();
    });
  };

  const addExpense = () => {
    const line: EventExpenseLine = {
      id: `exp-${Date.now()}`,
      category: "miscellaneous",
      description: "",
      amount: "",
      paid: false,
      reimbursementStatus: "pending",
    };
    setFinance((p) => ({ ...p, expenses: [...p.expenses, line] }));
  };

  return (
    <div className="flex flex-col gap-4">
      <header className="rounded-2xl border border-kelly-navy/20 bg-kelly-navy/[0.04] p-5">
        <p className="text-[10px] font-bold uppercase tracking-widest text-kelly-slate">Financial operations</p>
        <p className="mt-2 font-body text-sm text-kelly-text/70">
          Campaign-native finance traceability — budget, expenses, receipts, and compliance readiness. Not general bookkeeping;
          human-gated saves only.
        </p>
        {finance.executiveSummary ? <p className="mt-3 rounded-lg bg-white/80 p-3 font-body text-sm">{finance.executiveSummary}</p> : null}
        <div className={`mt-3 inline-flex rounded-full border px-3 py-1 text-xs font-bold ${WARN_STYLE[finance.compliance.warningLevel]}`}>
          Compliance: {finance.compliance.warningLevel} · {finance.compliance.documentationCompleteness || "—"}
        </div>
      </header>

      {message ? <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-950">{message}</p> : null}

      <PlanningSection title="1. Event budget" subtitle="Estimates, exposure, in-kind support." defaultOpen>
        <div className="grid gap-3 sm:grid-cols-2">
          {(
            [
              ["estimatedSpend", "Estimated spend"],
              ["actualSpend", "Actual spend"],
              ["categoryBreakdown", "Category breakdown"],
              ["hostContributions", "Host contributions"],
              ["donatedItems", "Donated items"],
              ["volunteerSupportValue", "Volunteer support value"],
              ["reimbursementExposure", "Reimbursement exposure"],
              ["notes", "Notes"],
            ] as const
          ).map(([key, label]) => (
            <Field
              key={key}
              label={label}
              value={finance.budget[key]}
              onChange={(v) => setFinance((p) => ({ ...p, budget: { ...p.budget, [key]: v } }))}
              multiline={key === "notes" || key === "categoryBreakdown"}
            />
          ))}
        </div>
      </PlanningSection>

      <PlanningSection title="2. Expense tracking" defaultOpen={false}>
        <ul className="mb-3 space-y-2">
          {finance.expenses.map((exp, idx) => (
            <li key={exp.id} className="rounded-lg border border-kelly-text/10 p-3 text-xs">
              <div className="grid gap-2 sm:grid-cols-3">
                <input
                  className="rounded border px-2 py-1"
                  value={exp.description}
                  placeholder="Description"
                  onChange={(e) => {
                    const expenses = [...finance.expenses];
                    expenses[idx] = { ...exp, description: e.target.value };
                    setFinance((p) => ({ ...p, expenses }));
                  }}
                />
                <input
                  className="rounded border px-2 py-1"
                  value={exp.amount}
                  placeholder="Amount"
                  onChange={(e) => {
                    const expenses = [...finance.expenses];
                    expenses[idx] = { ...exp, amount: e.target.value };
                    setFinance((p) => ({ ...p, expenses }));
                  }}
                />
                <select
                  className="rounded border px-2 py-1"
                  value={exp.reimbursementStatus}
                  onChange={(e) => {
                    const expenses = [...finance.expenses];
                    expenses[idx] = { ...exp, reimbursementStatus: e.target.value as EventExpenseLine["reimbursementStatus"] };
                    setFinance((p) => ({ ...p, expenses }));
                  }}
                >
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="reimbursed">Reimbursed</option>
                  <option value="not_applicable">N/A</option>
                  <option value="denied">Denied</option>
                </select>
              </div>
              <label className="mt-2 flex items-center gap-2">
                <input type="checkbox" checked={exp.paid} onChange={(e) => {
                  const expenses = [...finance.expenses];
                  expenses[idx] = { ...exp, paid: e.target.checked };
                  setFinance((p) => ({ ...p, expenses }));
                }} />
                Paid out of pocket
              </label>
            </li>
          ))}
        </ul>
        <button type="button" className="text-xs font-bold text-kelly-navy underline" onClick={addExpense}>
          + Add expense line
        </button>
      </PlanningSection>

      <PlanningSection title="3. Receipt tracking" defaultOpen={false}>
        <p className="mb-2 font-body text-xs text-kelly-text/60">Travel line: {row.travelLine}</p>
        <input ref={fileRef} type="file" className="font-body text-xs" accept="image/*,.pdf" />
        <button type="button" disabled={pending} className="ml-2 rounded-full border px-3 py-1 text-xs font-bold" onClick={uploadReceipt}>
          Upload receipt
        </button>
        <ul className="mt-3 space-y-1 font-body text-xs">
          {documents.length === 0 ? <li className="text-amber-900">No receipts on file — upload or mark missing in compliance.</li> : null}
          {documents.map((d) => (
            <li key={d.id} className="rounded border px-2 py-1">
              {d.documentType} · {d.approvalStatus} · {d.originalFilename}
            </li>
          ))}
        </ul>
      </PlanningSection>

      <PlanningSection title="4. Compliance readiness" defaultOpen={false}>
        {finance.compliance.gaps.length ? (
          <ul className="mb-3 list-disc pl-5 font-body text-xs text-amber-900">
            {finance.compliance.gaps.map((g) => (
              <li key={g}>{g}</li>
            ))}
          </ul>
        ) : (
          <p className="mb-2 text-xs text-emerald-900">No documentation gaps flagged.</p>
        )}
        <div className="grid gap-3 sm:grid-cols-2">
          {(
            [
              ["receiptCompleteness", "Receipt completeness"],
              ["reimbursementCompleteness", "Reimbursement completeness"],
              ["travelCompleteness", "Travel completeness"],
              ["documentationCompleteness", "Documentation completeness"],
              ["reportingCompleteness", "Reporting completeness"],
            ] as const
          ).map(([key, label]) => (
            <Field
              key={key}
              label={label}
              value={finance.compliance[key]}
              onChange={(v) => setFinance((p) => ({ ...p, compliance: { ...p.compliance, [key]: v } }))}
            />
          ))}
        </div>
      </PlanningSection>

      <PlanningSection
        title="5. Approval chain"
        defaultOpen={false}
        footer={
          <>
            <button type="button" disabled={pending} className="rounded-full border px-4 py-2 text-xs font-bold" onClick={refresh}>
              Refresh readiness
            </button>
            <button type="button" disabled={pending} className="rounded-full bg-kelly-navy px-4 py-2 text-xs font-bold text-white" onClick={save}>
              Save financial operations
            </button>
            <Link href={reimbursementHref(month)} className="rounded-full border px-4 py-2 text-xs font-bold">
              Month reimbursement →
            </Link>
          </>
        }
      >
        <div className="grid gap-3 sm:grid-cols-2">
          {(
            [
              ["eventApprovedBy", "Event approved by"],
              ["eventApprovedAt", "Event approved at"],
              ["reimbursementReview", "Reimbursement review"],
              ["complianceReview", "Compliance review"],
              ["treasurerReview", "Treasurer review (placeholder)"],
            ] as const
          ).map(([key, label]) => (
            <Field
              key={key}
              label={label}
              value={finance.approvalChain[key]}
              onChange={(v) => setFinance((p) => ({ ...p, approvalChain: { ...p.approvalChain, [key]: v } }))}
            />
          ))}
        </div>
      </PlanningSection>
    </div>
  );
}
