import { loadKimHammerKh4Workbench } from "@/lib/opposition/kimHammerKh4Workbench";

export default async function KimHammerIntelHeatMapPage() {
  const data = loadKimHammerKh4Workbench();

  return (
    <div className="mx-auto max-w-7xl text-kelly-text">
      <header className="mb-6 border-b border-kelly-text/10 pb-4">
        <p className="font-body text-[10px] font-bold uppercase tracking-[0.22em] text-kelly-subtle">KH-4 Intel Heat Map</p>
        <h1 className="font-heading text-2xl font-bold">Evidence Readiness + Risk Heat Map</h1>
      </header>

      <section className="mb-4 grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-kelly-text/10 bg-white p-4 text-xs">
          <h2 className="font-semibold text-kelly-navy">Publication Safety Rules</h2>
          <ul className="mt-2 list-inside list-disc text-kelly-muted">
            {data.publicationSafety.rules.map((rule) => (
              <li key={rule.id}>{rule.severity}: {rule.description}</li>
            ))}
          </ul>
        </div>
        <div className="rounded-xl border border-kelly-text/10 bg-white p-4 text-xs">
          <h2 className="font-semibold text-kelly-navy">Retrieval Suggestions</h2>
          <ul className="mt-2 list-inside list-disc text-kelly-muted">
            {data.claimGraph.retrievalSuggestions.map((item) => (
              <li key={item.id}>
                {item.suggestion} (confidence {item.retrievalConfidence.toFixed(2)})
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}

