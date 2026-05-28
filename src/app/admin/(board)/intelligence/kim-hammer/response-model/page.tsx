import { loadKimHammerKh3Workbench } from "@/lib/opposition/kimHammerKh3Workbench";

export default async function KimHammerResponseModelPage() {
  const data = loadKimHammerKh3Workbench();

  return (
    <div className="mx-auto max-w-7xl text-kelly-text">
      <header className="mb-6 border-b border-kelly-text/10 pb-4">
        <p className="font-body text-[10px] font-bold uppercase tracking-[0.22em] text-kelly-subtle">KH-3 Response Model</p>
        <h1 className="font-heading text-2xl font-bold">What He Likely Says + What We Say Back</h1>
      </header>
      <section className="grid gap-4">
        {data.responseModel.scenarios.map((row) => (
          <article key={row.theme} className="rounded-xl border border-kelly-text/10 bg-white p-4 text-xs">
            <h2 className="font-semibold text-kelly-navy">{row.theme}</h2>
            <p className="mt-1 text-kelly-muted"><strong>Expected response:</strong> {row.expectedHammerResponse}</p>
            <p className="mt-1 text-kelly-muted"><strong>Likely evidence anchor:</strong> {row.likelyEvidenceAnchor.join(" | ")}</p>
            <p className="mt-1 text-kelly-muted"><strong>Kelly response path:</strong> {row.kellyResponsePath}</p>
            <p className="mt-1 text-kelly-muted"><strong>Bridge line:</strong> {row.bridgeLine}</p>
            <p className="mt-1 text-kelly-muted"><strong>Risk to avoid:</strong> {row.riskToAvoid}</p>
          </article>
        ))}
      </section>
    </div>
  );
}

