import { loadKimHammerProfileWorkbench } from "@/lib/opposition/kimHammerProfileWorkbench";

export default async function KimHammerPublicControversiesPage() {
  const data = loadKimHammerProfileWorkbench();
  return (
    <div className="mx-auto max-w-6xl text-kelly-text">
      <header className="mb-6 border-b border-kelly-text/10 pb-4">
        <p className="font-body text-[10px] font-bold uppercase tracking-[0.22em] text-kelly-subtle">Public Controversies</p>
        <h1 className="font-heading text-2xl font-bold">Controversy Review</h1>
      </header>
      <section className="rounded-xl border border-kelly-text/10 bg-white p-4">
        <ul className="list-inside list-disc text-xs text-kelly-muted">
          {data.publicControversies.items.map((item) => (
            <li key={item.id}>
              {item.title} - {item.evidenceStatus} ({item.confidence})
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

