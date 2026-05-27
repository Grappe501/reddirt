import { loadKimHammerProfileWorkbench } from "@/lib/opposition/kimHammerProfileWorkbench";

export default async function KimHammerMediaFootprintPage() {
  const data = loadKimHammerProfileWorkbench();
  return (
    <div className="mx-auto max-w-6xl text-kelly-text">
      <header className="mb-6 border-b border-kelly-text/10 pb-4">
        <p className="font-body text-[10px] font-bold uppercase tracking-[0.22em] text-kelly-subtle">Media Footprint</p>
        <h1 className="font-heading text-2xl font-bold">Public Media and Channel Index</h1>
      </header>
      <section className="rounded-xl border border-kelly-text/10 bg-white p-4">
        <ul className="list-inside list-disc text-xs text-kelly-muted">
          {data.mediaFootprint.channels.map((channel) => (
            <li key={channel.url}>
              {channel.type}:{" "}
              <a className="text-kelly-navy underline" href={channel.url} target="_blank" rel="noreferrer">
                {channel.label}
              </a>{" "}
              ({channel.evidenceStatus}, {channel.sourceConfidence})
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

