import { loadKimHammerProfileWorkbench } from "@/lib/opposition/kimHammerProfileWorkbench";

export default async function KimHammerPublicTimelinePage() {
  const data = loadKimHammerProfileWorkbench();
  return (
    <div className="mx-auto max-w-6xl text-kelly-text">
      <header className="mb-6 border-b border-kelly-text/10 pb-4">
        <p className="font-body text-[10px] font-bold uppercase tracking-[0.22em] text-kelly-subtle">Public Timeline</p>
        <h1 className="font-heading text-2xl font-bold">Kim Hammer Timeline</h1>
      </header>
      <section className="rounded-xl border border-kelly-text/10 bg-white p-4">
        <ul className="list-inside list-disc text-xs text-kelly-muted">
          {data.publicTimeline.events.map((event) => (
            <li key={`${event.year}-${event.label}`}>
              {event.year}: {event.label} ({event.evidenceStatus}, {event.confidence})
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

