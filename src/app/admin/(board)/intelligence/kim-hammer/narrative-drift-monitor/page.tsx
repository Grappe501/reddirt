import { loadKimHammerKh4Workbench } from "@/lib/opposition/kimHammerKh4Workbench";
import { KimHammerBriefingPageShell } from "../KimHammerBriefingPageShell";

export default async function KimHammerNarrativeDriftMonitorPage() {
  const data = loadKimHammerKh4Workbench();

  return (
    <KimHammerBriefingPageShell moduleId="narrative-drift-monitor">
<section className="rounded-xl border border-kelly-text/10 bg-white p-4 text-xs">
        <ul className="list-inside list-disc text-kelly-muted">
          {data.claimGraph.contradictions.map((item) => (
            <li key={item.id}>
              {item.id}: severity {item.contradictionSeverity} — {item.notes}
            </li>
          ))}
        </ul>
      </section>
    </KimHammerBriefingPageShell>
  );
}

