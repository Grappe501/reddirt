import { loadKimHammerKh3Workbench } from "@/lib/opposition/kimHammerKh3Workbench";

export default async function KimHammerNarrativeTestingPage() {
  const data = loadKimHammerKh3Workbench();

  return (
    <div className="mx-auto max-w-7xl text-kelly-text">
      <header className="mb-6 border-b border-kelly-text/10 pb-4">
        <p className="font-body text-[10px] font-bold uppercase tracking-[0.22em] text-kelly-subtle">KH-3 Narrative Testing</p>
        <h1 className="font-heading text-2xl font-bold">Opposition Narrative Frame Testing</h1>
      </header>
      <section className="grid gap-4">
        {data.narrativeTesting.frames.map((frame) => (
          <article key={frame.id} className="rounded-xl border border-kelly-text/10 bg-white p-4 text-xs">
            <h2 className="font-semibold text-kelly-navy">{frame.label}</h2>
            <p className="mt-1 text-kelly-muted"><strong>Likely rebuttal:</strong> {frame.likelyRebuttal}</p>
            <p className="mt-1 text-kelly-muted"><strong>Defensive counter:</strong> {frame.defensiveCounter}</p>
          </article>
        ))}
      </section>
    </div>
  );
}

