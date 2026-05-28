import { loadKimHammerKh3Workbench } from "@/lib/opposition/kimHammerKh3Workbench";
import { KimHammerBriefingPageShell } from "../KimHammerBriefingPageShell";

export default async function KimHammerDebateArchivePage() {
  const data = loadKimHammerKh3Workbench();

  return (
    <KimHammerBriefingPageShell moduleId="debate-archive">
<section className="mb-4 rounded-xl border border-kelly-text/10 bg-white p-4 text-xs">
        <h2 className="font-semibold text-kelly-navy">Direct Kim Hammer Assets</h2>
        <ul className="mt-2 list-inside list-disc text-kelly-muted">
          {data.debateArchive.kimHammerDirectDebateAssets.map((row) => (
            <li key={row.id}>
              <a href={row.url} target="_blank" rel="noreferrer" className="underline text-kelly-navy">{row.title}</a> ({row.assetType})
            </li>
          ))}
        </ul>
      </section>

      <section className="mb-4 rounded-xl border border-kelly-text/10 bg-white p-4 text-xs">
        <h2 className="font-semibold text-kelly-navy">Arkansas SOS Debate Archive</h2>
        <ul className="mt-2 list-inside list-disc text-kelly-muted">
          {data.debateArchive.secretaryOfStateDebateArchive.map((row) => (
            <li key={row.id}>
              <a href={row.url} target="_blank" rel="noreferrer" className="underline text-kelly-navy">{row.title}</a>
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-xl border border-kelly-text/10 bg-white p-4 text-xs">
        <h2 className="font-semibold text-kelly-navy">Likely SOS Debate Question Themes</h2>
        <ul className="mt-2 list-inside list-disc text-kelly-muted">
          {data.debateArchive.likelySosDebateQuestionThemes.map((theme) => (
            <li key={theme}>{theme}</li>
          ))}
        </ul>
      </section>
    </KimHammerBriefingPageShell>
  );
}

