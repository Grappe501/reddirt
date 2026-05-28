import { loadKimHammerKh4Workbench } from "@/lib/opposition/kimHammerKh4Workbench";
import { KimHammerBriefingPageShell } from "../KimHammerBriefingPageShell";

export default async function KimHammerIntelHeatMapPage() {
  const data = loadKimHammerKh4Workbench();

  return (
    <KimHammerBriefingPageShell moduleId="intel-heat-map">
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
    </KimHammerBriefingPageShell>
  );
}

