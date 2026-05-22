import Link from "next/link";
import type { TravelReportTotals } from "@/lib/campaign-events/travel-report/travel-report-types";

function fmtUsd(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);
}

export function MonthlyTravelSummaryCard({
  month,
  monthLabel,
  totals,
  reportHref,
  compact,
}: {
  month: string;
  monthLabel?: string;
  totals: TravelReportTotals;
  reportHref: string;
  compact?: boolean;
}) {
  const label =
    monthLabel ??
    new Date(Number(month.split("-")[0]), Number(month.split("-")[1]) - 1, 1).toLocaleString("en-US", {
      month: "long",
      year: "numeric",
    });

  return (
    <section
      className={`rounded-2xl border border-kelly-navy/20 bg-kelly-navy/[0.04] ${compact ? "p-4" : "p-5"}`}
      aria-labelledby={`travel-summary-${month}`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-body text-xs font-bold uppercase tracking-wider text-kelly-slate">Monthly travel</p>
          <h2 id={`travel-summary-${month}`} className="mt-1 font-heading text-lg font-bold text-kelly-text">
            {label}
          </h2>
        </div>
        <Link
          href={reportHref}
          className="rounded-full border border-kelly-navy/30 bg-kelly-page px-3 py-1.5 font-body text-xs font-bold text-kelly-navy"
        >
          Full report →
        </Link>
      </div>

      <dl className={`mt-4 grid gap-3 ${compact ? "grid-cols-2" : "sm:grid-cols-3 lg:grid-cols-4"}`}>
        <div>
          <dt className="font-body text-[10px] font-bold uppercase text-kelly-slate">Travel events</dt>
          <dd className="font-heading text-xl font-bold">{totals.lineCount}</dd>
        </div>
        <div>
          <dt className="font-body text-[10px] font-bold uppercase text-kelly-slate">Total miles</dt>
          <dd className="font-heading text-xl font-bold">{totals.totalMiles.toFixed(1)}</dd>
        </div>
        <div>
          <dt className="font-body text-[10px] font-bold uppercase text-kelly-slate">Est. reimbursement</dt>
          <dd className="font-heading text-xl font-bold">{fmtUsd(totals.totalReimbursement)}</dd>
        </div>
        <div>
          <dt className="font-body text-[10px] font-bold uppercase text-kelly-slate">Approved reimbursement</dt>
          <dd className="font-heading text-xl font-bold">{fmtUsd(totals.approvedReimbursement)}</dd>
        </div>
        <div>
          <dt className="font-body text-[10px] font-bold uppercase text-kelly-slate">Needs review</dt>
          <dd className="font-heading text-xl font-bold text-amber-900">{totals.needsReviewCount}</dd>
        </div>
        <div>
          <dt className="font-body text-[10px] font-bold uppercase text-kelly-slate">Missing mileage</dt>
          <dd className="font-heading text-xl font-bold">{totals.missingMileage}</dd>
        </div>
      </dl>
    </section>
  );
}
