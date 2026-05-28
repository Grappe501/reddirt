import { loadKimHammerKh3Workbench } from "@/lib/opposition/kimHammerKh3Workbench";

export default async function KimHammerPatternAnalysisPage() {
  const data = loadKimHammerKh3Workbench();

  return (
    <div className="mx-auto max-w-7xl text-kelly-text">
      <header className="mb-6 border-b border-kelly-text/10 pb-4">
        <p className="font-body text-[10px] font-bold uppercase tracking-[0.22em] text-kelly-subtle">KH-3 Pattern Layer</p>
        <h1 className="font-heading text-2xl font-bold">Legislation Pattern Analysis</h1>
      </header>
      <section className="grid gap-4">
        {data.legislationPatterns.patternLanes.map((lane) => (
          <article key={lane.id} className="rounded-xl border border-kelly-text/10 bg-white p-4 text-xs">
            <h2 className="font-semibold text-kelly-navy">{lane.label}</h2>
            <p className="mt-1 text-kelly-muted">{lane.description}</p>
            <p className="mt-1 text-kelly-muted">{lane.evidenceStatus} ({lane.sourceConfidence})</p>
          </article>
        ))}
      </section>
    </div>
  );
}

