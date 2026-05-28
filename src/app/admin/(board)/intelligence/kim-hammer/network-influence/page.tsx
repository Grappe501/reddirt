import { loadKimHammerKh3Workbench } from "@/lib/opposition/kimHammerKh3Workbench";
import { KimHammerBriefingPageShell } from "../KimHammerBriefingPageShell";

export default async function KimHammerNetworkInfluencePage() {
  const data = loadKimHammerKh3Workbench();

  return (
    <KimHammerBriefingPageShell moduleId="network-influence">
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
    </KimHammerBriefingPageShell>
  );
}

