import { loadKimHammerKh3Workbench } from "@/lib/opposition/kimHammerKh3Workbench";
import { KimHammerBriefingPageShell } from "../KimHammerBriefingPageShell";

export default async function KimHammerDirectDemocracyPage() {
  const data = loadKimHammerKh3Workbench();

  return (
    <KimHammerBriefingPageShell moduleId="direct-democracy">
<section className="rounded-xl border border-kelly-text/10 bg-white p-4 text-xs">
        <p className="text-kelly-muted">{data.directDemocracyFile.summary}</p>
        <ul className="mt-2 list-inside list-disc text-kelly-muted">
          {data.directDemocracyFile.lanes.map((lane) => (
            <li key={lane.lane}>{lane.lane}: {lane.status} ({lane.evidenceStatus})</li>
          ))}
        </ul>
      </section>
    </KimHammerBriefingPageShell>
  );
}

