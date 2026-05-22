import Link from "next/link";
import { LEDGER_PERIOD_QUICK_LINKS } from "@/lib/campaign-events/constants";

const MONTH_LABELS: Record<string, string> = {
  "2026-03": "March 2026",
  "2026-04": "April 2026",
  "2026-05": "May 2026 MTD",
};

export function CampaignEventsMonthNav({
  activeMonth,
  basePath,
  showReadiness = true,
}: {
  activeMonth: string;
  basePath:
    | "workbench"
    | "review"
    | "travel-report"
    | "travel-log"
    | "reimbursement"
    | "candidate-dashboard"
    | "campaign-manager-dashboard";
  showReadiness?: boolean;
}) {
  return (
    <nav className="flex flex-wrap items-center gap-2 rounded-2xl border border-kelly-text/10 bg-kelly-wash px-3 py-2" aria-label="Ledger month">
      <span className="font-body text-xs font-bold uppercase tracking-wider text-kelly-slate">Month</span>
      {showReadiness ? (
        <Link
          href={`/admin/campaign-events/month-readiness?month=${activeMonth}`}
          className="rounded-full border border-amber-700/30 bg-amber-50 px-3 py-1.5 font-body text-xs font-bold text-amber-950"
        >
          Readiness
        </Link>
      ) : null}
      {LEDGER_PERIOD_QUICK_LINKS.map((month) => {
        const href =
          basePath === "review"
            ? `/admin/campaign-events/review?month=${month}&mode=chronological`
            : basePath === "travel-report"
              ? `/admin/campaign-events/travel-report?month=${month}`
              : basePath === "travel-log"
                ? `/admin/campaign-events/travel-log?month=${month}`
                : basePath === "reimbursement"
                  ? `/admin/campaign-events/reimbursement?month=${month}`
                  : basePath === "workbench"
                ? `/admin/campaign-events/workbench?month=${month}`
                : `/admin/${basePath}?month=${month}`;
        const active = month === activeMonth;
        return (
          <Link
            key={month}
            href={href}
            className={`rounded-full px-3 py-1.5 font-body text-xs font-bold transition ${
              active ? "border border-kelly-navy bg-kelly-navy text-white" : "border border-kelly-text/10 bg-kelly-page text-kelly-text/75 hover:border-kelly-navy/30"
            }`}
          >
            {MONTH_LABELS[month] ?? month}
          </Link>
        );
      })}
    </nav>
  );
}
