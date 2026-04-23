import Link from "next/link";
import { notFound } from "next/navigation";
import { COST_BEARING_WIRE_OPTIONS } from "@/lib/campaign-engine/budget";
import { getBudgetVarianceByLine } from "@/lib/campaign-engine/budget-queries";
import { CAMPAIGN_POLICY_V1 } from "@/lib/campaign-engine/policy";
import { createBudgetLineAction } from "../budget-actions";

export const dynamic = "force-dynamic";

export default async function BudgetPlanDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const q = await searchParams;
  const snapshot = await getBudgetVarianceByLine(id);
  if (!snapshot) notFound();

  const { plan, lines, duplicateWireKinds, notes, actualsByWire } = snapshot;
  const spend = CAMPAIGN_POLICY_V1.spendBudget;

  return (
    <div className="max-w-5xl text-deep-soil">
      <p className="font-body text-xs font-bold uppercase tracking-[0.2em] text-red-dirt/80">
        <Link href="/admin/budgets" className="text-red-dirt/80 underline">
          Budgets
        </Link>{" "}
        · BUDGET-2
      </p>
      <h1 className="mt-2 font-heading text-3xl font-bold">{plan.name}</h1>
      <p className="mt-1 text-sm text-deep-soil/70">
        {plan.periodLabel} · <span className="font-mono text-xs">{plan.status}</span>
      </p>
      {plan.startDate || plan.endDate ? (
        <p className="mt-1 text-xs text-deep-soil/55">
          Actuals filter: transactions with date in{" "}
          {plan.startDate ? plan.startDate.toISOString().slice(0, 10) : "…"} → {plan.endDate ? plan.endDate.toISOString().slice(0, 10) : "…"}{" "}
          (UTC day comparison; see docs).
        </p>
      ) : (
        <p className="mt-1 text-xs text-deep-soil/55">No plan dates — all CONFIRMED ledger rows count toward actuals (by category → wire).</p>
      )}
      {plan.notes ? <p className="mt-3 max-w-2xl text-sm text-deep-soil/80">{plan.notes}</p> : null}

      {q.error === "line" ? (
        <p className="mt-4 rounded border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">Check line label and wire kind.</p>
      ) : null}
      {q.error === "amount" ? (
        <p className="mt-4 rounded border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">Planned amount must be a non-negative number.</p>
      ) : null}

      {duplicateWireKinds.length > 0 ? (
        <div className="mt-6 rounded border border-amber-300/80 bg-amber-50/90 px-3 py-2 text-sm text-amber-950">
          <strong>Mapping caveat:</strong> multiple lines use the same wire kind ({duplicateWireKinds.join(", ")}). Each line shows the{" "}
          <strong>full</strong> actual total for that wire — not a split. Splitting actuals per line needs future attribution (BUDGET-3+).
        </div>
      ) : null}

      <section className="mt-8 grid gap-6 lg:grid-cols-[1fr_280px]">
        <div>
          <h2 className="font-heading text-lg font-bold">Lines · planned vs actual</h2>
          <p className="mt-1 text-xs text-deep-soil/60">
            Variance = actual − planned (positive = over). Remaining = planned − actual. Ledger: {notes.confirmedTransactionsOnly ? "CONFIRMED only" : ""}
            ; category → wire is {notes.categoryToWireImperfect ? "best-effort" : ""} (
            <Link href="/admin/financial-transactions" className="underline">
              transactions
            </Link>
            ).
          </p>

          {lines.length === 0 ? (
            <p className="mt-4 text-sm text-deep-soil/60">No lines yet. Add one below.</p>
          ) : (
            <div className="mt-4 overflow-x-auto rounded border border-deep-soil/10 bg-cream-canvas">
              <table className="w-full min-w-[720px] border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-deep-soil/15 bg-deep-soil/5">
                    <th className="px-3 py-2 font-heading text-xs uppercase tracking-wider">Label</th>
                    <th className="px-3 py-2 font-heading text-xs uppercase tracking-wider">Wire</th>
                    <th className="px-3 py-2 font-heading text-xs uppercase tracking-wider">Planned</th>
                    <th className="px-3 py-2 font-heading text-xs uppercase tracking-wider">Actual</th>
                    <th className="px-3 py-2 font-heading text-xs uppercase tracking-wider">Remaining</th>
                    <th className="px-3 py-2 font-heading text-xs uppercase tracking-wider">Variance</th>
                  </tr>
                </thead>
                <tbody>
                  {lines.map((row) => (
                    <tr key={row.lineId} className="border-b border-deep-soil/10 last:border-0">
                      <td className="px-3 py-2">{row.label}</td>
                      <td className="px-3 py-2 font-mono text-xs text-deep-soil/80">{row.costBearingWireKind}</td>
                      <td className="whitespace-nowrap px-3 py-2 font-mono">{row.planned.toFixed(2)}</td>
                      <td className="whitespace-nowrap px-3 py-2 font-mono">{row.actual.toFixed(2)}</td>
                      <td className="whitespace-nowrap px-3 py-2 font-mono">{row.remaining.toFixed(2)}</td>
                      <td className="whitespace-nowrap px-3 py-2 font-mono">{row.variance.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <details className="mt-4 text-xs text-deep-soil/55">
            <summary className="cursor-pointer font-heading tracking-wide">Raw actuals by wire (debug)</summary>
            <pre className="mt-2 overflow-x-auto rounded bg-deep-soil/5 p-2 font-mono">{JSON.stringify(actualsByWire, null, 2)}</pre>
          </details>
        </div>

        <aside className="rounded border border-deep-soil/10 bg-deep-soil/5 p-4 text-sm">
          <h3 className="font-heading text-xs font-bold uppercase tracking-wider text-deep-soil/70">Governance defaults (POLICY-1)</h3>
          <p className="mt-2 text-xs text-deep-soil/65">
            Posture: <strong>{spend.posture}</strong>. Mileage / reimbursement scope live in{" "}
            <code className="rounded bg-deep-soil/10 px-1">CAMPAIGN_POLICY_V1.expense</code>.
          </p>
          <ul className="mt-3 space-y-2 text-xs text-deep-soil/80">
            {spend.approvalThresholds.map((t) => (
              <li key={t.tier}>
                <strong className="capitalize">{t.tier}</strong> (≤ {t.maxUsdInclusive} USD): {t.defaultPosture}
              </li>
            ))}
          </ul>
          <p className="mt-3 text-[10px] text-deep-soil/55">
            {spend.budgetStructureChangeOnActivePlanRequiresHumanApproval
              ? "Structural changes on ACTIVE plans: use SOP — not software rules."
              : null}
          </p>
        </aside>
      </section>

      <section className="mt-10 rounded border border-deep-soil/10 bg-cream-canvas p-4">
        <h2 className="font-heading text-lg font-bold">Add budget line</h2>
        <form action={createBudgetLineAction} className="mt-4 grid max-w-xl gap-3 font-body text-sm">
          <input type="hidden" name="budgetPlanId" value={plan.id} />
          <label className="grid gap-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-deep-soil/55">Cost-bearing wire</span>
            <select name="costBearingWireKind" required className="rounded border border-deep-soil/20 px-2 py-1.5">
              {COST_BEARING_WIRE_OPTIONS.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-deep-soil/55">Label</span>
            <input name="label" required className="rounded border border-deep-soil/20 px-2 py-1.5" placeholder="e.g. Festival booths" />
          </label>
          <label className="grid gap-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-deep-soil/55">Planned amount (USD)</span>
            <input name="plannedAmount" type="number" step="0.01" min="0" required className="rounded border border-deep-soil/20 px-2 py-1.5" />
          </label>
          <label className="grid gap-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-deep-soil/55">Notes</span>
            <textarea name="notes" rows={2} className="rounded border border-deep-soil/20 px-2 py-1.5" />
          </label>
          <button type="submit" className="w-fit rounded bg-deep-soil px-4 py-2 text-cream-canvas">
            Add line
          </button>
        </form>
      </section>
    </div>
  );
}
