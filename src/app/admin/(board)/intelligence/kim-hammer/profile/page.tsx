import { loadKimHammerProfileWorkbench } from "@/lib/opposition/kimHammerProfileWorkbench";

export default async function KimHammerProfilePage() {
  const data = loadKimHammerProfileWorkbench();
  return (
    <div className="mx-auto max-w-6xl text-kelly-text">
      <header className="mb-6 border-b border-kelly-text/10 pb-4">
        <p className="font-body text-[10px] font-bold uppercase tracking-[0.22em] text-kelly-subtle">Candidate Profile</p>
        <h1 className="font-heading text-2xl font-bold">Kim Hammer Public Profile</h1>
      </header>
      <section className="rounded-xl border border-kelly-text/10 bg-white p-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-kelly-navy">Public Biography Summary</h2>
        <ul className="mt-2 list-inside list-disc text-xs text-kelly-muted">
          {data.profileHighlights.map((x) => (
            <li key={x}>{x}</li>
          ))}
        </ul>
      </section>
    </div>
  );
}

