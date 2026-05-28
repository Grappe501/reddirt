import { loadKimHammerKh3Workbench } from "@/lib/opposition/kimHammerKh3Workbench";

export default async function KimHammerWritingsPage() {
  const data = loadKimHammerKh3Workbench();

  return (
    <div className="mx-auto max-w-7xl text-kelly-text">
      <header className="mb-6 border-b border-kelly-text/10 pb-4">
        <p className="font-body text-[10px] font-bold uppercase tracking-[0.22em] text-kelly-subtle">KH-3 Writings Archive</p>
        <h1 className="font-heading text-2xl font-bold">Authored Essays, Op-Eds, and Letters</h1>
      </header>
      <section className="grid gap-4">
        {data.authoredWritings.items.map((item) => (
          <article key={item.id} className="rounded-xl border border-kelly-text/10 bg-white p-4 text-xs">
            <h2 className="font-semibold text-kelly-navy">{item.title}</h2>
            <p className="mt-1 text-kelly-muted">{item.type} · {item.date} · {item.publisher}</p>
            <p className="mt-1 text-kelly-muted">{item.summary}</p>
            <p className="mt-1 text-kelly-muted">Themes: {item.themes.join(", ")}</p>
            <p className="mt-1 text-kelly-muted">Status: {item.evidenceStatus} ({item.sourceConfidence})</p>
            <a href={item.url} target="_blank" rel="noreferrer" className="mt-2 inline-block font-semibold underline text-kelly-navy">
              open source
            </a>
          </article>
        ))}
      </section>
    </div>
  );
}

