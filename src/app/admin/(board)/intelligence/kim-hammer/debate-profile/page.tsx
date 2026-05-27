import { loadKimHammerKh2Workbench } from "@/lib/opposition/kimHammerKh2Workbench";

export default async function KimHammerDebateProfilePage() {
  const data = loadKimHammerKh2Workbench();

  return (
    <div className="mx-auto max-w-7xl text-kelly-text">
      <header className="mb-6 border-b border-kelly-text/10 pb-4">
        <p className="font-body text-[10px] font-bold uppercase tracking-[0.22em] text-kelly-subtle">Debate Profile</p>
        <h1 className="font-heading text-2xl font-bold">Likely Arguments + Response Frames</h1>
      </header>

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
    </div>
  );
}

