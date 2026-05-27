import { loadKimHammerKh2Workbench } from "@/lib/opposition/kimHammerKh2Workbench";

export default async function KimHammerStrengthsWeaknessesPage() {
  const data = loadKimHammerKh2Workbench();

  return (
    <div className="mx-auto max-w-7xl text-kelly-text">
      <header className="mb-6 border-b border-kelly-text/10 pb-4">
        <p className="font-body text-[10px] font-bold uppercase tracking-[0.22em] text-kelly-subtle">Strengths + Weaknesses</p>
        <h1 className="font-heading text-2xl font-bold">Political Strength/Weakness Matrix</h1>
      </header>

      <section className="mb-4 grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-kelly-text/10 bg-white p-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-kelly-navy">Strengths (Source-backed)</h2>
          <ul className="mt-2 list-inside list-disc text-xs text-kelly-muted">
            {data.strengths.strengths.map((item) => (
              <li key={item.id}>
                {item.strength} ({item.evidenceStatus}; {item.sourceConfidence})
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-xl border border-kelly-text/10 bg-white p-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-kelly-navy">Weaknesses (Source-backed + Safer Wording)</h2>
          <ul className="mt-2 list-inside list-disc text-xs text-kelly-muted">
            {data.vulnerabilities.weaknesses.map((item) => (
              <li key={item.id}>
                {item.saferWording} (risk {item.riskLevel}; debate {item.debateUsefulness}; {item.sourceConfidence})
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}

