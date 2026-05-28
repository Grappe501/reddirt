import { loadKimHammerKh3Workbench } from "@/lib/opposition/kimHammerKh3Workbench";
import { KimHammerBriefingPageShell } from "../KimHammerBriefingPageShell";

export default async function KimHammerManagementCapacityPage() {
  const data = loadKimHammerKh3Workbench();

  return (
    <KimHammerBriefingPageShell moduleId="management-capacity">
<section className="grid gap-4">
        {data.managementCapacity.capacitySignals.map((row) => (
          <article key={row.signal} className="rounded-xl border border-kelly-text/10 bg-white p-4 text-xs">
            <h2 className="font-semibold text-kelly-navy">{row.signal}</h2>
            <p className="mt-1 text-kelly-muted">{row.evidence}</p>
            <p className="mt-1 text-kelly-muted">
              {row.evidenceStatus} ({row.sourceConfidence}) · Relevance: {row.relevanceToSosOperations}
            </p>
          </article>
        ))}
      </section>
    </KimHammerBriefingPageShell>
  );
}

