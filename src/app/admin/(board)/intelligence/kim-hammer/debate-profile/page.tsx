import { loadKimHammerKh2Workbench } from "@/lib/opposition/kimHammerKh2Workbench";
import { KimHammerBriefingPageShell } from "../KimHammerBriefingPageShell";

export default async function KimHammerDebateProfilePage() {
  const data = loadKimHammerKh2Workbench();

  return (
    <KimHammerBriefingPageShell moduleId="debate-profile">
<section className="grid gap-4">
        {data.debateProfile.entries.map((entry) => (
          <div key={entry.topic} className="rounded-xl border border-kelly-text/10 bg-white p-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-kelly-navy">{entry.topic.replaceAll("_", " ")}</h2>
            <ul className="mt-2 list-inside list-disc text-xs text-kelly-muted">
              <li>Likely Hammer argument: {entry.likelyHammerArgument}</li>
              <li>Kelly response frame: {entry.kellyResponseFrame}</li>
              <li>Bridge line: {entry.bridgeLine}</li>
              <li>Practice question: {entry.practiceQuestion}</li>
              <li>30-second response: {entry.answer30}</li>
              <li>60-second response: {entry.answer60}</li>
              <li>Risky wording to avoid: {entry.riskyPhrasingToAvoid}</li>
              <li>Evidence status: {entry.evidenceStatus} ({entry.sourceConfidence})</li>
            </ul>
          </div>
        ))}
      </section>
    </KimHammerBriefingPageShell>
  );
}

