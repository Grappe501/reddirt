import { loadKimHammerWorkbench } from "@/lib/opposition/kimHammerWorkbench";

export default async function KimHammerTimelinePage() {
  const data = loadKimHammerWorkbench();

  return (
    <div className="mx-auto max-w-6xl text-kelly-text">
      <header className="mb-6 border-b border-kelly-text/10 pb-4">
        <p className="font-body text-[10px] font-bold uppercase tracking-[0.22em] text-kelly-subtle">Timeline Narrative Builder</p>
        <h1 className="font-heading text-2xl font-bold">Timeline</h1>
      </header>

      <section className="rounded-xl border border-kelly-text/10 bg-white p-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-kelly-navy">Year-by-Year Record</h2>
        <div className="mt-2 overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr className="border-b border-kelly-text/10 text-kelly-muted">
                <th className="py-1.5 pr-3 font-semibold">Year</th>
                <th className="py-1.5 pr-3 font-semibold">Bill/Act</th>
                <th className="py-1.5 pr-3 font-semibold">Themes</th>
                <th className="py-1.5 pr-3 font-semibold">Debate milestone</th>
                <th className="py-1.5 font-semibold">Confidence</th>
              </tr>
            </thead>
            <tbody>
              {data.timeline.map((row) => (
                <tr key={`${row.year}-${row.billOrAct}`} className="border-b border-kelly-text/5">
                  <td className="py-1.5 pr-3">{row.year}</td>
                  <td className="py-1.5 pr-3">{row.billOrAct}</td>
                  <td className="py-1.5 pr-3">{row.impactCategory.join(", ")}</td>
                  <td className="py-1.5 pr-3">Use as accumulation evidence in values contrast.</td>
                  <td className="py-1.5">{row.sourceConfidence}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

