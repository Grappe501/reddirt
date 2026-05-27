import { loadKimHammerKh2Workbench } from "@/lib/opposition/kimHammerKh2Workbench";

export default async function KimHammerIntelligenceGapsPage() {
  const data = loadKimHammerKh2Workbench();

  return (
    <div className="mx-auto max-w-6xl text-kelly-text">
      <header className="mb-6 border-b border-kelly-text/10 pb-4">
        <p className="font-body text-[10px] font-bold uppercase tracking-[0.22em] text-kelly-subtle">Intelligence Gap Prioritizer</p>
        <h1 className="font-heading text-2xl font-bold">Intelligence Gaps</h1>
      </header>

      <section className="rounded-xl border border-kelly-text/10 bg-white p-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-kelly-navy">Priority Queue</h2>
        <div className="mt-2 overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr className="border-b border-kelly-text/10 text-kelly-muted">
                <th className="py-1.5 pr-3 font-semibold">Gap</th>
                <th className="py-1.5 pr-3 font-semibold">Priority</th>
                <th className="py-1.5 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {data.intelligenceGaps.gaps.map((gap) => (
                <tr key={gap.id} className="border-b border-kelly-text/5">
                  <td className="py-1.5 pr-3">{gap.description}</td>
                  <td className="py-1.5 pr-3">{gap.priority}</td>
                  <td className="py-1.5">{gap.evidenceStatus}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

