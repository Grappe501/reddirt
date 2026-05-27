import { loadKimHammerWorkbench } from "@/lib/opposition/kimHammerWorkbench";
import { loadKimHammerKh2Workbench } from "@/lib/opposition/kimHammerKh2Workbench";

export default async function KimHammerDebatePrepPage() {
  const data = loadKimHammerWorkbench();
  const kh2 = loadKimHammerKh2Workbench();

  return (
    <div className="mx-auto max-w-7xl text-kelly-text">
      <header className="mb-6 border-b border-kelly-text/10 pb-4">
        <p className="font-body text-[10px] font-bold uppercase tracking-[0.22em] text-kelly-subtle">Debate Prep Command Center</p>
        <h1 className="font-heading text-2xl font-bold">Kim Hammer Debate Prep</h1>
      </header>

      <section className="mb-4 rounded-xl border border-kelly-text/10 bg-white p-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-kelly-navy">1) Debate Strategy Overview</h2>
        <ul className="mt-2 list-inside list-disc text-xs text-kelly-muted">
          <li>Objective: educate voters on record, impact, and Secretary of State office philosophy.</li>
          <li>Study own positions and opponent bill record; rehearse mock debate and opening/closing.</li>
          <li>Answer the question first, then bridge to core values and sourced record.</li>
        </ul>
      </section>

      <section className="mb-4 grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-kelly-text/10 bg-white p-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-kelly-navy">2) Candidate Core Frame</h2>
          <p className="mt-2 text-xs text-kelly-muted">
            This race is about whether the Secretary of State office is used for more political control or rebuilt around trust,
            transparency, participation, county support, and election integrity.
          </p>
        </div>
        <div className="rounded-xl border border-kelly-text/10 bg-white p-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-kelly-navy">3) Three Core Debate Pillars</h2>
          <ul className="mt-2 list-inside list-disc text-xs text-kelly-muted">
            <li>Trust and transparency.</li>
            <li>Support counties and election workers.</li>
            <li>Protect participation and direct democracy while maintaining integrity.</li>
          </ul>
        </div>
      </section>

      <section className="mb-4 rounded-xl border border-kelly-text/10 bg-white p-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-kelly-navy">Likely Hammer Arguments + Evidence He May Cite</h2>
        <ul className="mt-2 list-inside list-disc text-xs text-kelly-muted">
          {kh2.likelyArguments.arguments.map((arg) => (
            <li key={arg.id}>
              {arg.argument} (anchors: {arg.sourceAnchors.slice(0, 2).join(" | ")})
            </li>
          ))}
        </ul>
      </section>

      <section className="mb-4 grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-kelly-text/10 bg-white p-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-kelly-navy">4) Bill-to-Question Bank</h2>
          <ul className="mt-2 list-inside list-disc text-xs text-kelly-muted">
            {data.topQuestions.map((q) => (
              <li key={q}>{q}</li>
            ))}
          </ul>
        </div>
        <div className="rounded-xl border border-kelly-text/10 bg-white p-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-kelly-navy">5) Answer Builder</h2>
          <ul className="mt-2 list-inside list-disc text-xs text-kelly-muted">
            <li>Direct answer</li>
            <li>Sourced fact with bill/act reference</li>
            <li>Values contrast</li>
            <li>Voter/county process impact</li>
            <li>Solution + bridge line</li>
          </ul>
        </div>
      </section>

      <section className="mb-4 grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-kelly-text/10 bg-white p-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-kelly-navy">6) Rebuttal Builder</h2>
          <ul className="mt-2 list-inside list-disc text-xs text-kelly-muted">
            <li>Acknowledge integrity goal where appropriate.</li>
            <li>Distinguish means and implementation effects.</li>
            <li>Return to trust/access/county-support frame.</li>
          </ul>
        </div>
        <div className="rounded-xl border border-kelly-text/10 bg-white p-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-kelly-navy">7) Mock Debate Drill Mode</h2>
          <ul className="mt-2 list-inside list-disc text-xs text-kelly-muted">
            {data.debateDrillQueue.map((card) => (
              <li key={card.billNumber}>
                {card.billNumber}: 30s + 60s + rebuttal + follow-up (risk {card.risk})
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mb-4 grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-kelly-text/10 bg-white p-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-kelly-navy">8) Opening Statement Builder</h2>
          <p className="mt-2 text-xs text-kelly-muted">
            Include office philosophy, unity, trust, county support, integrity-through-transparency, and service-over-culture-war.
          </p>
        </div>
        <div className="rounded-xl border border-kelly-text/10 bg-white p-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-kelly-navy">9) Closing Statement Builder</h2>
          <p className="mt-2 text-xs text-kelly-muted">
            Include voter trust, county support, participation, competence, and why this office matters to daily Arkansas life.
          </p>
        </div>
      </section>

      <section className="mb-4 grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-kelly-text/10 bg-white p-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-kelly-navy">10) Attack/Defense Risk Meter</h2>
          <ul className="mt-2 list-inside list-disc text-xs text-kelly-muted">
            <li>Unsourced claim</li>
            <li>Motive claim</li>
            <li>Overstatement</li>
            <li>Legal claim needing review</li>
            <li>Personal attack / partisan overreach</li>
          </ul>
        </div>
        <div className="rounded-xl border border-kelly-text/10 bg-white p-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-kelly-navy">11) Reporter Question Prep</h2>
          <ul className="mt-2 list-inside list-disc text-xs text-kelly-muted">
            {data.reportQuestions.map((q) => (
              <li key={q}>{q}</li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mb-4 grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-kelly-text/10 bg-white p-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-kelly-navy">12) County Clerk / Election Worker Angle</h2>
          <ul className="mt-2 list-inside list-disc text-xs text-kelly-muted">
            {data.countyOfficialConcerns.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
        <div className="rounded-xl border border-kelly-text/10 bg-white p-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-kelly-navy">13) Direct Democracy Angle</h2>
          <ul className="mt-2 list-inside list-disc text-xs text-kelly-muted">
            {data.directDemocracyConcerns.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </section>

      <section className="rounded-xl border border-kelly-text/10 bg-white p-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-kelly-navy">14) Debate Evidence Locker</h2>
        <ul className="mt-2 list-inside list-disc text-xs text-kelly-muted">
          <li>Bill and act links from source packet.</li>
          <li>Claims review + safe wording rows.</li>
          <li>Research gaps queue for fiscal notes, testimony, and county implementation evidence.</li>
        </ul>
      </section>
    </div>
  );
}

