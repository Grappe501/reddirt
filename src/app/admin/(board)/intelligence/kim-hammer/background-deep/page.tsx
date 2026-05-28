import { loadKimHammerKh3Workbench } from "@/lib/opposition/kimHammerKh3Workbench";
import { KimHammerBriefingPageShell } from "../KimHammerBriefingPageShell";

export default async function KimHammerBackgroundDeepPage() {
  const data = loadKimHammerKh3Workbench();

  return (
    <KimHammerBriefingPageShell moduleId="background-deep">
<section className="mb-4 rounded-xl border border-kelly-text/10 bg-white p-4 text-xs">
        <h2 className="font-semibold text-kelly-navy">Education</h2>
        {data.deepProfile.education.college.map((row) => (
          <p key={row.institution} className="mt-1 text-kelly-muted">
            {row.institution} ({row.credential}) — {row.evidenceStatus} ({row.sourceConfidence})
          </p>
        ))}
        {data.deepProfile.education.highSchool.map((row) => (
          <p key={row.notes} className="mt-1 text-kelly-muted">
            High school: {row.status} — {row.notes}
          </p>
        ))}
      </section>

      <section className="mb-4 rounded-xl border border-kelly-text/10 bg-white p-4 text-xs">
        <h2 className="font-semibold text-kelly-navy">Community + Civic</h2>
        <ul className="mt-2 list-inside list-disc text-kelly-muted">
          {data.deepProfile.communityAndCivicWork.map((row) => (
            <li key={row.topic}>{row.topic}: {row.detail} ({row.evidenceStatus})</li>
          ))}
        </ul>
      </section>

      <section className="rounded-xl border border-kelly-text/10 bg-white p-4 text-xs">
        <h2 className="font-semibold text-kelly-navy">Awards + Business Background</h2>
        <ul className="mt-2 list-inside list-disc text-kelly-muted">
          {data.deepProfile.awardsAndRecognition.map((row) => (
            <li key={row.title}>{row.title} ({row.evidenceStatus})</li>
          ))}
          {data.deepProfile.businessBackground.map((row) => (
            <li key={row.item}>{row.item}: {row.detail} ({row.evidenceStatus})</li>
          ))}
        </ul>
      </section>
    </KimHammerBriefingPageShell>
  );
}

