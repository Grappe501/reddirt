import Link from "next/link";
import { prisma } from "@/lib/db";
import { confirmFinancialTransactionAction, createFinancialTransactionAction } from "@/app/admin/financial-transaction-actions";

export const dynamic = "force-dynamic";

/**
 * FIN-1 + FIN-2: List + **minimal** create / confirm (admin actions). Not a finance workbench; no import/reconciliation.
 */
export default async function FinancialTransactionsListPage({
  searchParams,
}: {
  searchParams: Promise<{
    error?: string;
    created?: string;
    confirmed?: string;
  }>;
}) {
  const sp = await searchParams;
  const rows = await prisma.financialTransaction.findMany({
    orderBy: { transactionDate: "desc" },
    take: 200,
    include: {
      confirmedBy: { select: { name: true, email: true } },
    },
  });

  return (
    <div className="max-w-5xl text-kelly-text">
      <p className="font-body text-xs font-bold uppercase tracking-[0.2em] text-kelly-navy/80">Foundation · FIN-1 + FIN-2</p>
      <h1 className="mt-2 font-heading text-3xl font-bold">Financial transactions</h1>
      <p className="mt-2 max-w-2xl font-body text-sm text-kelly-text/70">
        Internal ledger (draft vs confirmed in DB). <strong>Not</strong> a bank statement, <strong>not</strong> a filing.{" "}
        <strong>Confirm</strong> requires human affirm; actor is <code className="rounded bg-kelly-text/5 px-1">ADMIN_ACTOR_USER_EMAIL</code> when set. Planned vs actual
        (spend only):{" "}
        <Link href="/admin/budgets" className="font-semibold underline">
          budget plans (BUDGET-2)
        </Link>
        .
      </p>

      {sp.error === "create" ? (
        <p className="mt-4 rounded border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">Create failed — check amount, type, category, description, and date.</p>
      ) : null}
      {sp.error?.startsWith("confirm_") ? (
        <p className="mt-4 rounded border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
          Confirm could not run ({sp.error.replace("confirm_", "")}).
        </p>
      ) : null}
      {sp.created === "1" ? (
        <p className="mt-4 rounded border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900">Draft row created.</p>
      ) : null}
      {sp.confirmed === "1" ? (
        <p className="mt-4 rounded border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900">Transaction confirmed.</p>
      ) : null}

      <section className="mt-8 rounded border border-kelly-text/10 bg-kelly-page p-4">
        <h2 className="font-heading text-lg font-bold">Create draft (admin)</h2>
        <p className="mt-1 text-xs text-kelly-text/60">
          <strong>DRAFT</strong> by default. Use <strong>Confirm</strong> in the table to set <strong>CONFIRMED</strong> plus auditable <code>confirmedBy</code> / <code>confirmedAt</code>.
        </p>
        <form action={createFinancialTransactionAction} className="mt-4 grid max-w-2xl gap-3 font-body text-sm">
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="grid gap-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-kelly-text/55">Amount (USD)</span>
              <input name="amount" required className="rounded border border-kelly-text/20 px-2 py-1.5" placeholder="0.00" />
            </label>
            <label className="grid gap-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-kelly-text/55">Transaction date</span>
              <input type="date" name="transactionDate" required className="rounded border border-kelly-text/20 px-2 py-1.5" />
            </label>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="grid gap-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-kelly-text/55">Type</span>
              <select name="transactionType" className="rounded border border-kelly-text/20 px-2 py-1.5" defaultValue="EXPENSE">
                <option value="EXPENSE">EXPENSE</option>
                <option value="REIMBURSEMENT">REIMBURSEMENT</option>
                <option value="CONTRIBUTION">CONTRIBUTION</option>
                <option value="OTHER">OTHER</option>
              </select>
            </label>
            <label className="grid gap-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-kelly-text/55">Source</span>
              <select name="sourceType" className="rounded border border-kelly-text/20 px-2 py-1.5" defaultValue="MANUAL">
                <option value="MANUAL">MANUAL</option>
                <option value="SUBMISSION">SUBMISSION</option>
                <option value="DOCUMENT">DOCUMENT</option>
                <option value="FUTURE_INTEGRATION">FUTURE_INTEGRATION</option>
              </select>
            </label>
          </div>
          <label className="grid gap-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-kelly-text/55">Category (slug/label for budget wire map)</span>
            <input name="category" required className="rounded border border-kelly-text/20 px-2 py-1.5" placeholder="e.g. event_cost" />
          </label>
          <label className="grid gap-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-kelly-text/55">Description</span>
            <textarea name="description" required rows={2} className="rounded border border-kelly-text/20 px-2 py-1.5" />
          </label>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="grid gap-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-kelly-text/55">Source id (optional)</span>
              <input name="sourceId" className="rounded border border-kelly-text/20 px-2 py-1.5" />
            </label>
            <label className="grid gap-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-kelly-text/55">Related user id (optional)</span>
              <input name="relatedUserId" className="rounded border border-kelly-text/20 px-2 py-1.5" />
            </label>
            <label className="grid gap-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-kelly-text/55">Related event id (optional)</span>
              <input name="relatedEventId" className="rounded border border-kelly-text/20 px-2 py-1.5" />
            </label>
            <label className="grid gap-1 sm:col-span-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-kelly-text/55">Notes (optional)</span>
              <textarea name="notes" rows={2} className="rounded border border-kelly-text/20 px-2 py-1.5" />
            </label>
          </div>
          <button type="submit" className="mt-1 w-fit rounded bg-kelly-text px-4 py-2 text-kelly-page">
            Create draft
          </button>
        </form>
      </section>

      {rows.length === 0 ? (
        <p className="mt-6 text-sm text-kelly-text/60">No rows yet. Create a draft above or seed via SQL.</p>
      ) : (
        <div className="mt-8 overflow-x-auto rounded border border-kelly-text/10 bg-kelly-page">
          <table className="w-full min-w-[800px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-kelly-text/15 bg-kelly-text/5">
                <th className="px-3 py-2 font-heading text-xs uppercase tracking-wider">Date</th>
                <th className="px-3 py-2 font-heading text-xs uppercase tracking-wider">Amount</th>
                <th className="px-3 py-2 font-heading text-xs uppercase tracking-wider">Category</th>
                <th className="px-3 py-2 font-heading text-xs uppercase tracking-wider">Type</th>
                <th className="px-3 py-2 font-heading text-xs uppercase tracking-wider">Source</th>
                <th className="px-3 py-2 font-heading text-xs uppercase tracking-wider">Status</th>
                <th className="px-3 py-2 font-heading text-xs uppercase tracking-wider">Confirmed</th>
                <th className="px-3 py-2 font-heading text-xs uppercase tracking-wider">Description</th>
                <th className="px-3 py-2 font-heading text-xs uppercase tracking-wider" />
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-b border-kelly-text/10 last:border-0">
                  <td className="whitespace-nowrap px-3 py-2 text-kelly-text/90">{r.transactionDate.toISOString().slice(0, 10)}</td>
                  <td className="whitespace-nowrap px-3 py-2 font-mono text-kelly-text">{r.amount.toString()}</td>
                  <td className="px-3 py-2">{r.category}</td>
                  <td className="px-3 py-2">{r.transactionType}</td>
                  <td className="px-3 py-2">
                    {r.sourceType}
                    {r.sourceId ? (
                      <span className="block text-[10px] text-kelly-text/50" title="source id (opaque per source)">
                        {r.sourceId}
                      </span>
                    ) : null}
                  </td>
                  <td className="px-3 py-2">{r.status}</td>
                  <td className="max-w-[10rem] px-3 py-2 text-xs text-kelly-text/80">
                    {r.confirmedAt
                      ? `${r.confirmedAt.toISOString().slice(0, 10)}${
                          r.confirmedBy ? ` · ${r.confirmedBy.name ?? r.confirmedBy.email}` : " · (no actor user id)"
                        }`
                      : "—"}
                  </td>
                  <td className="max-w-sm truncate px-3 py-2 text-xs text-kelly-text/80" title={r.description}>
                    {r.description}
                  </td>
                  <td className="whitespace-nowrap px-2 py-2 text-right text-xs">
                    {r.status === "DRAFT" ? (
                      <form action={confirmFinancialTransactionAction} className="inline">
                        <input type="hidden" name="id" value={r.id} />
                        <button type="submit" className="rounded border border-kelly-text/25 px-2 py-1 font-heading text-[10px] uppercase tracking-wider text-kelly-text hover:bg-kelly-text/5">
                          Confirm
                        </button>
                      </form>
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
