import { loadKimHammerProfileWorkbench } from "@/lib/opposition/kimHammerProfileWorkbench";

export default async function KimHammerElectoralHistoryPage() {
  const data = loadKimHammerProfileWorkbench();
  return (
    <div className="mx-auto max-w-6xl text-kelly-text">
      <header className="mb-6 border-b border-kelly-text/10 pb-4">
        <p className="font-body text-[10px] font-bold uppercase tracking-[0.22em] text-kelly-subtle">Electoral History</p>
        <h1 className="font-heading text-2xl font-bold">Kim Hammer Election Record</h1>
      </header>
      <section className="rounded-xl border border-kelly-text/10 bg-white p-4">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr className="border-b border-kelly-text/10 text-kelly-muted">
                <th className="py-1.5 pr-3 font-semibold">Year</th>
                <th className="py-1.5 pr-3 font-semibold">Office</th>
                <th className="py-1.5 pr-3 font-semibold">District</th>
                <th className="py-1.5 pr-3 font-semibold">Stage</th>
                <th className="py-1.5 pr-3 font-semibold">Result</th>
                <th className="py-1.5 font-semibold">Confidence</th>
              </tr>
            </thead>
            <tbody>
              {data.electoralHistory.rows.map((row) => (
                <tr key={`${row.year}-${row.office}-${row.stage}`} className="border-b border-kelly-text/5">
                  <td className="py-1.5 pr-3">{row.year}</td>
                  <td className="py-1.5 pr-3">{row.office}</td>
                  <td className="py-1.5 pr-3">{row.district}</td>
                  <td className="py-1.5 pr-3">{row.stage}</td>
                  <td className="py-1.5 pr-3">{row.result}</td>
                  <td className="py-1.5">{row.confidence}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

