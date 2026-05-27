import { loadKimHammerKh2Workbench } from "@/lib/opposition/kimHammerKh2Workbench";

export default async function KimHammerContrastVsKellyPage() {
  const data = loadKimHammerKh2Workbench();

  return (
    <div className="mx-auto max-w-6xl text-kelly-text">
      <header className="mb-6 border-b border-kelly-text/10 pb-4">
        <p className="font-body text-[10px] font-bold uppercase tracking-[0.22em] text-kelly-subtle">Contrast vs Kelly</p>
        <h1 className="font-heading text-2xl font-bold">Source-backed Contrast Frames</h1>
      </header>

      <section className="rounded-xl border border-kelly-text/10 bg-white p-4 text-xs text-kelly-muted">
        <ul className="list-inside list-disc">
          {data.contrast.contrastFrames.map((frame) => (
            <li key={frame.frame}>
              <span className="font-semibold">{frame.frame.replaceAll("_", " ")}:</span> {frame.hammerPositionSummary} vs{" "}
              {frame.kellyContrast} ({frame.evidenceStatus}; {frame.sourceConfidence})
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

