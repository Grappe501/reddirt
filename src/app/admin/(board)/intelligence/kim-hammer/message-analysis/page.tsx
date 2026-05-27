import { loadKimHammerKh2Workbench } from "@/lib/opposition/kimHammerKh2Workbench";

export default async function KimHammerMessageAnalysisPage() {
  const data = loadKimHammerKh2Workbench();

  return (
    <div className="mx-auto max-w-6xl text-kelly-text">
      <header className="mb-6 border-b border-kelly-text/10 pb-4">
        <p className="font-body text-[10px] font-bold uppercase tracking-[0.22em] text-kelly-subtle">Candidate Frame Analyzer</p>
        <h1 className="font-heading text-2xl font-bold">Message Analysis</h1>
      </header>

      <section className="mb-4 rounded-xl border border-kelly-text/10 bg-white p-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-kelly-navy">Likely Campaign Frame</h2>
        <p className="mt-2 text-xs text-kelly-muted">Primary: {data.messageAnalysis.candidateFrame.primary}</p>
        <p className="mt-1 text-xs text-kelly-muted">Secondary: {data.messageAnalysis.candidateFrame.secondary}</p>
      </section>

      <section className="mb-4 rounded-xl border border-kelly-text/10 bg-white p-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-kelly-navy">Message Themes</h2>
        <ul className="mt-2 list-inside list-disc text-xs text-kelly-muted">
          {data.messageAnalysis.messageThemes.map((theme) => (
            <li key={theme.theme}>
              {theme.theme} ({theme.strength}; {theme.evidenceStatus})
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-xl border border-kelly-text/10 bg-white p-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-kelly-navy">Risk Areas + Source Confidence</h2>
        <ul className="mt-2 list-inside list-disc text-xs text-kelly-muted">
          {data.messageAnalysis.riskyMessagingAreas.map((risk) => (
            <li key={risk.risk}>
              {risk.risk} ({risk.evidenceStatus}; {risk.sourceConfidence})
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

