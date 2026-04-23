import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

/**
 * FIN-1: Read-only list — no create/edit; no "official" reporting. Staff sanity check.
 */
export default async function FinancialTransactionsListPage() {
  const rows = await prisma.financialTransaction.findMany({
    orderBy: { transactionDate: "desc" },
    take: 200,
  });

  return (
    <div className="max-w-5xl text-deep-soil">
      <p className="font-body text-xs font-bold uppercase tracking-[0.2em] text-red-dirt/80">Foundation · FIN-1</p>
      <h1 className="mt-2 font-heading text-3xl font-bold">Financial transactions</h1>
      <p className="mt-2 max-w-2xl font-body text-sm text-deep-soil/70">
        Internal ledger (draft vs confirmed in DB). <strong>Not</strong> a bank statement, <strong>not</strong> a filing. No
        edits here; population is via future admin flows or data migration.
      </p>

      {rows.length === 0 ? (
        <p className="mt-6 text-sm text-deep-soil/60">No rows yet. Create `FinancialTransaction` records via a future tool or import.</p>
      ) : (
        <div className="mt-6 overflow-x-auto rounded border border-deep-soil/10 bg-cream-canvas">
          <table className="w-full min-w-[640px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-deep-soil/15 bg-deep-soil/5">
                <th className="px-3 py-2 font-heading text-xs uppercase tracking-wider">Date</th>
                <th className="px-3 py-2 font-heading text-xs uppercase tracking-wider">Amount</th>
                <th className="px-3 py-2 font-heading text-xs uppercase tracking-wider">Category</th>
                <th className="px-3 py-2 font-heading text-xs uppercase tracking-wider">Type</th>
                <th className="px-3 py-2 font-heading text-xs uppercase tracking-wider">Source</th>
                <th className="px-3 py-2 font-heading text-xs uppercase tracking-wider">Status</th>
                <th className="px-3 py-2 font-heading text-xs uppercase tracking-wider">Description</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-b border-deep-soil/10 last:border-0">
                  <td className="whitespace-nowrap px-3 py-2 text-deep-soil/90">
                    {r.transactionDate.toISOString().slice(0, 10)}
                  </td>
                  <td className="whitespace-nowrap px-3 py-2 font-mono text-deep-soil">
                    {r.amount.toString()}
                  </td>
                  <td className="px-3 py-2">{r.category}</td>
                  <td className="px-3 py-2">{r.transactionType}</td>
                  <td className="px-3 py-2">
                    {r.sourceType}
                    {r.sourceId ? (
                      <span className="block text-[10px] text-deep-soil/50" title="source id (opaque per source)">
                        {r.sourceId}
                      </span>
                    ) : null}
                  </td>
                  <td className="px-3 py-2">{r.status}</td>
                  <td className="max-w-sm truncate px-3 py-2 text-xs text-deep-soil/80" title={r.description}>
                    {r.description}
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
