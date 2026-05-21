import Link from "next/link";
import { LEDGER_PERIOD_QUICK_LINKS } from "@/lib/campaign-events/constants";
import { monthLabel } from "@/lib/campaign-events/travel-reimbursement/travel-reimbursement-links";

export type TravelMonthNavBase =
  | "travel-log"
  | "travel-report"
  | "reimbursement"
  | "review"
  | "workbench"
  | "month-readiness";

const BASE_HREF: Record<TravelMonthNavBase, (month: string) => string> = {
  "travel-log": (m) => `/admin/campaign-events/travel-log?month=${m}`,
  "travel-report": (m) => `/admin/campaign-events/travel-report?month=${m}`,
  reimbursement: (m) => `/admin/campaign-events/reimbursement?month=${m}`,
  review: (m) => `/admin/campaign-events/review?month=${m}&mode=travel_needs_approval`,
  workbench: (m) => `/admin/campaign-events/workbench?month=${m}`,
  "month-readiness": (m) => `/admin/campaign-events/month-readiness?month=${m}`,
};

export function TravelReimbursementMonthNav({
  activeMonth,
  activeBase,
}: {
  activeMonth: string;
  activeBase: TravelMonthNavBase;
}) {
  return (
    <nav
      className="flex flex-wrap items-center gap-2 rounded-2xl border border-kelly-text/10 bg-kelly-wash px-3 py-2 print:hidden"
      aria-label="Reimbursement month"
    >
      <span className="font-body text-xs font-bold uppercase tracking-wider text-kelly-slate">Month</span>
      {LEDGER_PERIOD_QUICK_LINKS.map((month) => {
        const href = BASE_HREF[activeBase](month);
        const active = month === activeMonth;
        return (
          <Link
            key={month}
            href={href}
            className={`rounded-full px-3 py-1.5 font-body text-xs font-bold transition ${
              active ? "border border-kelly-navy bg-kelly-navy text-white" : "border border-kelly-text/10 bg-kelly-page text-kelly-text/75 hover:border-kelly-navy/30"
            }`}
          >
            {monthLabel(month)}
          </Link>
        );
      })}
    </nav>
  );
}
