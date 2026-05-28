import { loadKimHammerKh3Workbench } from "@/lib/opposition/kimHammerKh3Workbench";
import { KimHammerBriefingPageShell } from "../KimHammerBriefingPageShell";

export default async function KimHammerCountyExposurePage() {
  const data = loadKimHammerKh3Workbench();

  return (
    <KimHammerBriefingPageShell moduleId="county-exposure">
<section className="grid gap-4">
        {data.countyExposureMap.countyExposure.map((segment) => (
          <article key={segment.segment} className="rounded-xl border border-kelly-text/10 bg-white p-4 text-xs">
            <h2 className="font-semibold text-kelly-navy">{segment.segment}</h2>
            <p className="mt-1 text-kelly-muted">{segment.workingHypothesis}</p>
            <p className="mt-1 text-kelly-muted">Priority: {segment.priority}</p>
          </article>
        ))}
      </section>
    </KimHammerBriefingPageShell>
  );
}

