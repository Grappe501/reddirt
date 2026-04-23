import Link from "next/link";
import { listBudgetPlans } from "@/lib/campaign-engine/budget-queries";
import { createBudgetPlanAction } from "./budget-actions";

export const dynamic = "force-dynamic";

export default async function BudgetPlansListPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  const plans = await listBudgetPlans();

  return (
    <div className="max-w-5xl text-deep-soil">
      <p className="font-body text-xs font-bold uppercase tracking-[0.2em] text-red-dirt/80">Foundation · BUDGET-2</p>
      <h1 className="mt-2 font-heading text-3xl font-bold">Budget plans</h1>
      <p className="mt-2 max-w-2xl font-body text-sm text-deep-soil/70">
        Internal <strong>planned vs actual</strong> view. Plans and lines are <strong>not</strong> the ledger (
        <Link href="/admin/financial-transactions" className="underline">
          financial transactions
        </Link>
        ) and <strong>not</strong> filings. Actuals use <strong>CONFIRMED</strong> ledger rows mapped by category → cost wire.
      </p>

      {params.error === "required" ? (
        <p className="mt-4 rounded border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">Name and period label are required.</p>
      ) : null}
      {params.error === "line" ? (
        <p className="mt-4 rounded border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">Line create failed — open a plan detail page and try again.</p>
      ) : null}

      <section className="mt-8 rounded border border-deep-soil/10 bg-cream-canvas p-4">
        <h2 className="font-heading text-lg font-bold">Create plan</h2>
        <p className="mt-1 text-xs text-deep-soil/60">Draft by default. Activating or changing an active plan is human / SOP — not enforced here.</p>
        <form action={createBudgetPlanAction} className="mt-4 grid max-w-xl gap-3 font-body text-sm">
          <label className="grid gap-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-deep-soil/55">Name</span>
            <input name="name" required className="rounded border border-deep-soil/20 px-2 py-1.5" placeholder="e.g. General Q2" />
          </label>
          <label className="grid gap-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-deep-soil/55">Period label</span>
            <input name="periodLabel" required className="rounded border border-deep-soil/20 px-2 py-1.5" placeholder="e.g. Apr–Jun 2026" />
          </label>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="grid gap-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-deep-soil/55">Start (optional)</span>
              <input type="date" name="startDate" className="rounded border border-deep-soil/20 px-2 py-1.5" />
            </label>
            <label className="grid gap-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-deep-soil/55">End (optional)</span>
              <input type="date" name="endDate" className="rounded border border-deep-soil/20 px-2 py-1.5" />
            </label>
          </div>
          <label className="grid gap-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-deep-soil/55">Status</span>
            <select name="status" className="rounded border border-deep-soil/20 px-2 py-1.5" defaultValue="DRAFT">
              <option value="DRAFT">DRAFT</option>
              <option value="ACTIVE">ACTIVE</option>
              <option value="ARCHIVED">ARCHIVED</option>
            </select>
          </label>
          <label className="grid gap-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-deep-soil/55">Notes</span>
            <textarea name="notes" rows={2} className="rounded border border-deep-soil/20 px-2 py-1.5" />
          </label>
          <button type="submit" className="mt-1 w-fit rounded bg-deep-soil px-4 py-2 text-cream-canvas">
            Create plan
          </button>
        </form>
      </section>

      <section className="mt-10">
        <h2 className="font-heading text-lg font-bold">All plans</h2>
        {plans.length === 0 ? (
          <p className="mt-3 text-sm text-deep-soil/60">No budget plans yet.</p>
        ) : (
          <ul className="mt-3 divide-y divide-deep-soil/10 rounded border border-deep-soil/10 bg-cream-canvas">
            {plans.map((p) => (
              <li key={p.id} className="flex flex-wrap items-baseline justify-between gap-2 px-4 py-3">
                <div>
                  <Link href={`/admin/budgets/${p.id}`} className="font-heading font-semibold text-deep-soil underline">
                    {p.name}
                  </Link>
                  <p className="text-xs text-deep-soil/60">
                    {p.periodLabel} · {p.status} · {p._count.lines} line(s)
                  </p>
                </div>
                <span className="text-[10px] uppercase tracking-wider text-deep-soil/45">{p.id.slice(0, 8)}…</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
