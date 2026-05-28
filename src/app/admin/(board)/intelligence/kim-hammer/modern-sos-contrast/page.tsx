import { loadKimHammerKh3Workbench } from "@/lib/opposition/kimHammerKh3Workbench";

export default async function KimHammerModernSosContrastPage() {
  const data = loadKimHammerKh3Workbench();

  return (
    <div className="mx-auto max-w-7xl text-kelly-text">
      <header className="mb-6 border-b border-kelly-text/10 pb-4">
        <p className="font-body text-[10px] font-bold uppercase tracking-[0.22em] text-kelly-subtle">KH-3 Contrast Layer</p>
        <h1 className="font-heading text-2xl font-bold">Contrast With Modern Secretary of State Model</h1>
      </header>
      <section className="grid gap-4">
        {data.modernSosContrast.contrastRows.map((row) => (
          <article key={`${row.hammerLane}-${row.kellyLane}`} className="rounded-xl border border-kelly-text/10 bg-white p-4 text-xs">
            <p className="font-semibold text-kelly-navy">Hammer: {row.hammerLane}</p>
            <p className="mt-1 text-kelly-muted">Kelly: {row.kellyLane}</p>
            <p className="mt-1 text-kelly-muted">Use case: {row.useCase.join(", ")}</p>
          </article>
        ))}
      </section>
    </div>
  );
}

