import { loadKimHammerKh3Workbench } from "@/lib/opposition/kimHammerKh3Workbench";
import { KimHammerBriefingPageShell } from "../KimHammerBriefingPageShell";

export default async function KimHammerBillRelationshipGraphPage() {
  const data = loadKimHammerKh3Workbench();

  return (
    <KimHammerBriefingPageShell moduleId="bill-relationship-graph">
<section className="rounded-xl border border-kelly-text/10 bg-white p-4 text-xs">
        <p className="text-kelly-muted">Nodes: {data.billRelationshipGraph.nodes.length}</p>
        <p className="text-kelly-muted">Edges: {data.billRelationshipGraph.edges.length}</p>
        <ul className="mt-2 list-inside list-disc text-kelly-muted">
          {data.billRelationshipGraph.edges.map((edge, idx) => (
            <li key={`${edge.from}-${edge.to}-${idx}`}>{edge.from} → {edge.to} ({edge.relationship})</li>
          ))}
        </ul>
      </section>
    </KimHammerBriefingPageShell>
  );
}

