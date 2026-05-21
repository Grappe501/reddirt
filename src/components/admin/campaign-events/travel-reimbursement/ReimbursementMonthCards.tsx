import Link from "next/link";
import { LEDGER_PERIOD_QUICK_LINKS } from "@/lib/campaign-events/constants";
import { REIMBURSEMENT_STATUS_LABELS } from "@/lib/campaign-events/travel-reimbursement/reimbursement-month-status-shared";
import type { ReimbursementMonthSummary } from "@/lib/campaign-events/travel-reimbursement/load-reimbursement-summaries";
import { monthLabel } from "@/lib/campaign-events/travel-reimbursement/travel-reimbursement-links";

const STATUS_STYLE: Record<string, string> = {
  draft: "bg-amber-100 text-amber-950",
  needs_review: "bg-orange-100 text-orange-950",
  ready: "bg-emerald-100 text-emerald-950",
  finalized: "bg-kelly-navy/15 text-kelly-navy",
};

function fmtUsd(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
}

export function ReimbursementMonthCards({
  title,
  summaries,
}: {
  title: string;
  summaries?: ReimbursementMonthSummary[];
}) {
  const byMonth = new Map(summaries?.map((s) => [s.month, s]) ?? []);

  return (
    <section className="rounded-2xl border border-kelly-navy/20 bg-kelly-navy/[0.04] p-5">
      <h2 className="font-heading text-base font-bold">{title}</h2>
      <p className="mt-1 font-body text-xs text-kelly-text/60">
        Tentative log → approve travel → official print request ·{" "}
        <Link href="/admin/campaign-events/reimbursement?month=2026-05" className="font-semibold text-kelly-navy underline">
          open reimbursement
        </Link>
      </p>
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        {LEDGER_PERIOD_QUICK_LINKS.map((month) => {
          const s = byMonth.get(month);
          const status = s?.effectiveStatus ?? "draft";
          return (
            <div key={month} className="rounded-xl border border-kelly-text/10 bg-kelly-page p-4 font-body text-sm">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-bold">{monthLabel(month)}</p>
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${STATUS_STYLE[status] ?? STATUS_STYLE.draft}`}>
                  {REIMBURSEMENT_STATUS_LABELS[status]}
                </span>
              </div>
              {s ? (
                <p className="mt-2 text-xs text-kelly-text/60">
                  {s.approvedCount} approved · {fmtUsd(s.totalReimbursement)}
                  {s.needsApproval > 0 ? ` · ${s.needsApproval} need approval` : ""}
                </p>
              ) : null}
              <p className="mt-1 text-xs font-semibold text-kelly-navy">{s?.nextAction ?? "Open month"}</p>
              <div className="mt-3 flex flex-col gap-1.5 text-xs">
                <Link href={`/admin/campaign-events/travel-log?month=${month}`} className="font-semibold text-kelly-navy underline">
                  Tentative log
                </Link>
                <Link
                  href={`/admin/campaign-events/review?month=${month}&mode=travel_needs_approval&autostart=1`}
                  className="underline"
                >
                  Review / correct
                </Link>
                <Link href={`/admin/campaign-events/reimbursement?month=${month}`} className="underline">
                  View / print request
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
