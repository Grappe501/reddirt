import Link from "next/link";
import type { MonthQuickAction } from "@/lib/campaign-events/month-readiness/month-readiness-quick-actions";

export function MonthReadinessQuickActions({ actions, period }: { actions: MonthQuickAction[]; period: string }) {
  return (
    <section className="rounded-2xl border border-kelly-navy/20 bg-kelly-navy/[0.03] p-5">
      <h2 className="font-heading text-lg font-bold text-kelly-text">Quick-fix queues</h2>
      <p className="mt-1 font-body text-sm text-kelly-muted">
        Start a focused review queue for {period}. Each card opens Month Review with the right filter and auto-starts the queue.
      </p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {actions.map((a) => (
          <article
            key={a.id}
            className={`flex flex-col rounded-xl border bg-kelly-page p-4 ${a.count > 0 ? "border-kelly-navy/20" : "border-kelly-text/10 opacity-75"}`}
          >
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-heading text-sm font-bold">{a.title}</h3>
              <span className={`rounded-full px-2 py-0.5 font-body text-xs font-bold ${a.count > 0 ? "bg-kelly-navy text-white" : "bg-kelly-wash text-kelly-subtle"}`}>
                {a.count}
              </span>
            </div>
            <p className="mt-2 flex-1 font-body text-xs text-kelly-muted">{a.description}</p>
            <p className="mt-2 font-body text-xs font-semibold text-emerald-800">{a.impactLabel}</p>
            <Link
              href={a.href}
              className={`mt-3 inline-flex justify-center rounded-full px-4 py-2 text-center text-xs font-bold ${
                a.count > 0 ? "bg-kelly-navy text-white" : "pointer-events-none border border-kelly-text/15 text-kelly-text/40"
              }`}
            >
              Start this queue
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}
