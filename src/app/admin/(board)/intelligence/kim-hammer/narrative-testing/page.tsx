import { loadKimHammerKh3Workbench } from "@/lib/opposition/kimHammerKh3Workbench";
import { KimHammerBriefingPageShell } from "../KimHammerBriefingPageShell";

export default async function KimHammerNarrativeTestingPage() {
  const data = loadKimHammerKh3Workbench();

  return (
    <KimHammerBriefingPageShell moduleId="narrative-testing">
<section className="grid gap-4">
        {data.narrativeTesting.frames.map((frame) => (
          <article key={frame.id} className="rounded-xl border border-kelly-text/10 bg-white p-4 text-xs">
            <h2 className="font-semibold text-kelly-navy">{frame.label}</h2>
            <p className="mt-1 text-kelly-muted"><strong>Likely rebuttal:</strong> {frame.likelyRebuttal}</p>
            <p className="mt-1 text-kelly-muted"><strong>Defensive counter:</strong> {frame.defensiveCounter}</p>
          </article>
        ))}
      </section>
    </KimHammerBriefingPageShell>
  );
}

