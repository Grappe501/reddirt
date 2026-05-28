import { loadKimHammerKh4Workbench } from "@/lib/opposition/kimHammerKh4Workbench";

export default async function KimHammerNarrativeDriftMonitorPage() {
  const data = loadKimHammerKh4Workbench();

  return (
    <div className="mx-auto max-w-7xl text-kelly-text">
      <header className="mb-6 border-b border-kelly-text/10 pb-4">
        <p className="font-body text-[10px] font-bold uppercase tracking-[0.22em] text-kelly-subtle">KH-4 Narrative Drift Monitor</p>
        <h1 className="font-heading text-2xl font-bold">Contradiction + Drift Signals</h1>
      </header>
      <section className="rounded-xl border border-kelly-text/10 bg-white p-4 text-xs">
        <ul className="list-inside list-disc text-kelly-muted">
          {data.claimGraph.contradictions.map((item) => (
            <li key={item.id}>
              {item.id}: severity {item.contradictionSeverity} — {item.notes}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

