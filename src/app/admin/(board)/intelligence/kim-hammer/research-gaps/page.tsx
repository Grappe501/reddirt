import { loadKimHammerWorkbench } from "@/lib/opposition/kimHammerWorkbench";

export default async function KimHammerResearchGapsPage() {
  const data = loadKimHammerWorkbench();

  const gapRows = [
    "act text review",
    "amendment review",
    "fiscal notes",
    "committee testimony",
    "county clerk reaction",
    "direct democracy advocate reaction",
    "sponsor rationale",
    "roll-call votes",
    "implementation costs",
  ];

  return (
    <div className="mx-auto max-w-6xl text-kelly-text">
      <header className="mb-6 border-b border-kelly-text/10 pb-4">
        <p className="font-body text-[10px] font-bold uppercase tracking-[0.22em] text-kelly-subtle">Research Gap Prioritizer</p>
        <h1 className="font-heading text-2xl font-bold">Research Gaps</h1>
      </header>

      <section className="mb-4 rounded-xl border border-kelly-text/10 bg-white p-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-kelly-navy">Priority Gap Queue</h2>
        <ul className="mt-2 list-inside list-disc text-xs text-kelly-muted">
          {gapRows.map((gap) => (
            <li key={gap}>{gap}</li>
          ))}
        </ul>
      </section>

      <section className="rounded-xl border border-kelly-text/10 bg-white p-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-kelly-navy">Next Research Pass Recommendations</h2>
        <ul className="mt-2 list-inside list-disc text-xs text-kelly-muted">
          {data.recommendedNextPass.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>
    </div>
  );
}

