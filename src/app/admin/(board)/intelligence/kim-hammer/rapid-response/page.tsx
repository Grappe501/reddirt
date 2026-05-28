import { loadKimHammerKh3Workbench } from "@/lib/opposition/kimHammerKh3Workbench";

export default async function KimHammerRapidResponsePage() {
  const data = loadKimHammerKh3Workbench();

  return (
    <div className="mx-auto max-w-7xl text-kelly-text">
      <header className="mb-6 border-b border-kelly-text/10 pb-4">
        <p className="font-body text-[10px] font-bold uppercase tracking-[0.22em] text-kelly-subtle">KH-3 Rapid Response</p>
        <h1 className="font-heading text-2xl font-bold">Rapid Response Appendix</h1>
      </header>
      <section className="mb-4 rounded-xl border border-kelly-text/10 bg-white p-4 text-xs">
        <h2 className="font-semibold text-kelly-navy">Evidence Locker</h2>
        <ul className="mt-2 list-inside list-disc text-kelly-muted">
          {data.rapidResponseAppendix.evidenceLocker.map((item) => (
            <li key={item.id}>{item.category}: {item.asset} ({item.verificationStatus})</li>
          ))}
        </ul>
      </section>
      <section className="rounded-xl border border-kelly-text/10 bg-white p-4 text-xs">
        <h2 className="font-semibold text-kelly-navy">Quote Verification Rules</h2>
        <ul className="mt-2 list-inside list-disc text-kelly-muted">
          {data.rapidResponseAppendix.quoteVerificationRules.map((rule) => (
            <li key={rule}>{rule}</li>
          ))}
        </ul>
      </section>
    </div>
  );
}

