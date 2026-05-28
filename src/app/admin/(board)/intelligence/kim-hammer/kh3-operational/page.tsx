import { loadKimHammerKh3Workbench } from "@/lib/opposition/kimHammerKh3Workbench";
import { KimHammerBriefingPageShell } from "../KimHammerBriefingPageShell";

export default async function KimHammerKh3OperationalPage() {
  const data = loadKimHammerKh3Workbench();

  return (
    <KimHammerBriefingPageShell moduleId="kh3-operational">
<section className="mb-4 rounded-xl border border-kelly-text/10 bg-white p-4 text-xs">
        <h2 className="font-semibold text-kelly-navy">Operational Modules</h2>
        <ul className="mt-2 list-inside list-disc text-kelly-muted">
          <li>Network clusters: {data.summary.networkClusters}</li>
          <li>Legislation patterns: {data.summary.legislationPatterns}</li>
          <li>Vulnerability rows: {data.summary.vulnerabilityRows}</li>
          <li>Narrative frames: {data.summary.narrativeFrames}</li>
          <li>Media archive entries: {data.summary.mediaArchiveEntries}</li>
          <li>County exposure segments: {data.summary.countyExposureSegments}</li>
          <li>Rapid response assets: {data.summary.rapidResponseAssets}</li>
        </ul>
      </section>

      <section className="rounded-xl border border-kelly-text/10 bg-white p-4 text-xs">
        <h2 className="font-semibold text-kelly-navy">Top Operational Gaps</h2>
        <ul className="mt-2 list-inside list-disc text-kelly-muted">
          {data.summary.topOpenGaps.map((gap) => (
            <li key={gap}>{gap}</li>
          ))}
        </ul>
      </section>
    </KimHammerBriefingPageShell>
  );
}

