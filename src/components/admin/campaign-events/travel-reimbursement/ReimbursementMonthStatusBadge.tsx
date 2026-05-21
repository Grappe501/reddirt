import Link from "next/link";
import {
  REIMBURSEMENT_STATUS_LABELS,
  type ReimbursementMonthStatusValue,
} from "@/lib/campaign-events/travel-reimbursement/reimbursement-month-status-shared";
import { reimbursementHref } from "@/lib/campaign-events/travel-reimbursement/travel-reimbursement-links";

const STATUS_STYLE: Record<ReimbursementMonthStatusValue, string> = {
  draft: "border-amber-700/30 bg-amber-50 text-amber-950",
  needs_review: "border-orange-700/30 bg-orange-50 text-orange-950",
  ready: "border-emerald-700/30 bg-emerald-50 text-emerald-950",
  finalized: "border-kelly-navy/30 bg-kelly-navy/10 text-kelly-navy",
};

export function ReimbursementMonthStatusBadge({
  month,
  status,
  compact,
}: {
  month: string;
  status: ReimbursementMonthStatusValue;
  compact?: boolean;
}) {
  if (compact) {
    return (
      <Link
        href={reimbursementHref(month)}
        className={`inline-block rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase ${STATUS_STYLE[status]}`}
      >
        {REIMBURSEMENT_STATUS_LABELS[status]}
      </Link>
    );
  }
  return (
    <section className="rounded-xl border border-kelly-text/10 bg-kelly-page px-4 py-3 font-body text-sm">
      <p className="text-xs font-bold uppercase text-kelly-slate">Month reimbursement status</p>
      <p className="mt-1">
        <Link href={reimbursementHref(month)} className={`inline-block rounded-full border px-3 py-1 text-xs font-bold uppercase ${STATUS_STYLE[status]}`}>
          {REIMBURSEMENT_STATUS_LABELS[status]} — official request →
        </Link>
      </p>
    </section>
  );
}
