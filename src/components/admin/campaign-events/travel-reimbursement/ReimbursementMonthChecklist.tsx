import Link from "next/link";
import { buildReimbursementMonthChecklist } from "@/lib/campaign-events/travel-reimbursement/reimbursement-checklist";
import type { ReimbursementMonthStatusContext } from "@/lib/campaign-events/travel-reimbursement/reimbursement-month-status-shared";

export function ReimbursementMonthChecklist({ ctx }: { ctx: ReimbursementMonthStatusContext }) {
  const items = buildReimbursementMonthChecklist(ctx);
  const complete = items.filter((i) => i.status === "complete").length;

  return (
    <section className="rounded-2xl border border-kelly-text/10 bg-kelly-page p-5 print:hidden">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="font-heading text-base font-bold">Month completion checklist</h2>
        <p className="font-body text-xs font-bold text-kelly-slate">
          {complete} / {items.length} complete
        </p>
      </div>
      <ul className="mt-4 space-y-2">
        {items.map((item) => (
          <li
            key={item.id}
            className={`flex flex-wrap items-start justify-between gap-2 rounded-lg border px-3 py-2 font-body text-sm ${
              item.status === "complete"
                ? "border-emerald-700/20 bg-emerald-50/40"
                : "border-amber-700/25 bg-amber-50/30"
            }`}
          >
            <div>
              <p className="font-semibold">
                {item.status === "complete" ? "✓" : "○"} {item.label}
              </p>
              {item.detail ? <p className="mt-0.5 text-xs text-kelly-text/60">{item.detail}</p> : null}
            </div>
            {item.href && item.status === "needs_attention" ? (
              <Link href={item.href} className="text-xs font-bold text-kelly-navy underline">
                Fix →
              </Link>
            ) : null}
          </li>
        ))}
      </ul>
    </section>
  );
}
