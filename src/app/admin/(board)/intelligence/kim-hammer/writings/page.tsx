import { loadKimHammerKh3Workbench } from "@/lib/opposition/kimHammerKh3Workbench";
import { KimHammerBriefingPageShell } from "../KimHammerBriefingPageShell";

export default async function KimHammerWritingsPage() {
  const data = loadKimHammerKh3Workbench();

  return (
    <KimHammerBriefingPageShell moduleId="writings">
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
    </KimHammerBriefingPageShell>
  );
}

