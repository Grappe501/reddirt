import { loadKimHammerKh4Workbench } from "@/lib/opposition/kimHammerKh4Workbench";

export default async function KimHammerAttackSurfacePage() {
  const data = loadKimHammerKh4Workbench();
  const rows = [...data.riskRegister.risks].sort((a, b) => b.overallThreatIndex - a.overallThreatIndex);

  return (
    <div className="mx-auto max-w-7xl text-kelly-text">
      <header className="mb-6 border-b border-kelly-text/10 pb-4">
        <p className="font-body text-[10px] font-bold uppercase tracking-[0.22em] text-kelly-subtle">KH-4 Attack Surface</p>
        <h1 className="font-heading text-2xl font-bold">Risk-ranked Evidence Exposure Map</h1>
      </header>
      <section className="grid gap-4">
        {rows.map((row) => (
          <article key={row.id} className="rounded-xl border border-kelly-text/10 bg-white p-4 text-xs">
            <h2 className="font-semibold text-kelly-navy">{row.id}</h2>
            <p className="mt-1 text-kelly-muted">
              Threat {row.overallThreatIndex.toFixed(2)} · Narrative risk {row.narrativeRiskScore.toFixed(2)} · Counterattack {row.counterattackRisk.toFixed(2)}
            </p>
            <p className="mt-1 text-kelly-muted">{row.notes}</p>
          </article>
        ))}
      </section>
    </div>
  );
}

