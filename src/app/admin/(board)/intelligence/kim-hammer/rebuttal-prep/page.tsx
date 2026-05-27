import { loadKimHammerKh2Workbench } from "@/lib/opposition/kimHammerKh2Workbench";

export default async function KimHammerRebuttalPrepPage() {
  const data = loadKimHammerKh2Workbench();

  return (
    <div className="mx-auto max-w-7xl text-kelly-text">
      <header className="mb-6 border-b border-kelly-text/10 pb-4">
        <p className="font-body text-[10px] font-bold uppercase tracking-[0.22em] text-kelly-subtle">Rebuttal Prep</p>
        <h1 className="font-heading text-2xl font-bold">Structured Rebuttal Builder</h1>
      </header>

      <section className="grid gap-4">
        {data.rebuttalPrep.rebuttals.map((item) => (
          <div key={item.prompt} className="rounded-xl border border-kelly-text/10 bg-white p-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-kelly-navy">{item.prompt}</h2>
            <ul className="mt-2 list-inside list-disc text-xs text-kelly-muted">
              <li>Agree where valid: {item.agreeWhereValid}</li>
              <li>Contrast method: {item.contrastMethod}</li>
              <li>Bridge line: {item.kellyBridge}</li>
              <li>Source category: {item.sourceCategory}</li>
              <li>Evidence status: {item.evidenceStatus}</li>
            </ul>
          </div>
        ))}
      </section>
    </div>
  );
}

