import { loadKimHammerWorkbench } from "@/lib/opposition/kimHammerWorkbench";
import { KimHammerBriefingPageShell } from "../KimHammerBriefingPageShell";
import { loadKimHammerKh2Workbench } from "@/lib/opposition/kimHammerKh2Workbench";

export default async function KimHammerResearchGapsPage() {
  const data = loadKimHammerWorkbench();
  const kh2 = loadKimHammerKh2Workbench();

  const gapRows = [
    "act text review",
    "amendment review",
    "fiscal notes",
    "committee testimony",
    "county clerk reaction",
    "direct democracy advocate reaction",
    "sponsor rationale",
    "roll-call votes",
    "implementation costs",
  ];

  return (
    <KimHammerBriefingPageShell moduleId="research-gaps">
<section className="mb-4 rounded-xl border border-kelly-text/10 bg-white p-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-kelly-navy">Priority Gap Queue</h2>
        <ul className="mt-2 list-inside list-disc text-xs text-kelly-muted">
          {gapRows.map((gap) => (
            <li key={gap}>{gap}</li>
          ))}
          {kh2.intelligenceGaps.gaps
            .filter((gap) => gap.priority === "HIGH")
            .map((gap) => (
              <li key={gap.id}>{gap.description}</li>
            ))}
        </ul>
      </section>

      <section className="rounded-xl border border-kelly-text/10 bg-white p-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-kelly-navy">Next Research Pass Recommendations</h2>
        <ul className="mt-2 list-inside list-disc text-xs text-kelly-muted">
          {data.recommendedNextPass.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>
    </KimHammerBriefingPageShell>
  );
}

