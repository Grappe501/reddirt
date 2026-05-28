import { loadKimHammerKh3Workbench } from "@/lib/opposition/kimHammerKh3Workbench";

export default async function KimHammerNetworkInfluencePage() {
  const data = loadKimHammerKh3Workbench();

  return (
    <div className="mx-auto max-w-7xl text-kelly-text">
      <header className="mb-6 border-b border-kelly-text/10 pb-4">
        <p className="font-body text-[10px] font-bold uppercase tracking-[0.22em] text-kelly-subtle">KH-3 Network Map</p>
        <h1 className="font-heading text-2xl font-bold">Network + Influence Map</h1>
      </header>
      <section className="grid gap-4">
        {data.networkInfluence.clusters.map((cluster) => (
          <article key={cluster.id} className="rounded-xl border border-kelly-text/10 bg-white p-4 text-xs">
            <h2 className="font-semibold text-kelly-navy">{cluster.label}</h2>
            <p className="mt-1 text-kelly-muted">{cluster.description}</p>
            <p className="mt-1 text-kelly-muted">Nodes: {cluster.nodes.join(", ")}</p>
            <p className="mt-1 text-kelly-muted">{cluster.evidenceStatus} ({cluster.sourceConfidence})</p>
          </article>
        ))}
      </section>
    </div>
  );
}

