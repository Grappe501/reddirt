import { loadKimHammerKh3Workbench } from "@/lib/opposition/kimHammerKh3Workbench";
import { KimHammerBriefingPageShell } from "../KimHammerBriefingPageShell";

export default async function KimHammerPatternAnalysisPage() {
  const data = loadKimHammerKh3Workbench();

  return (
    <KimHammerBriefingPageShell moduleId="pattern-analysis">
<section className="grid gap-4">
        {data.legislationPatterns.patternLanes.map((lane) => (
          <article key={lane.id} className="rounded-xl border border-kelly-text/10 bg-white p-4 text-xs">
            <h2 className="font-semibold text-kelly-navy">{lane.label}</h2>
            <p className="mt-1 text-kelly-muted">{lane.description}</p>
            <p className="mt-1 text-kelly-muted">{lane.evidenceStatus} ({lane.sourceConfidence})</p>
          </article>
        ))}
      </section>
    </KimHammerBriefingPageShell>
  );
}

