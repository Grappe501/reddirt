import type { KimHammerBillCivicIntelligence } from "@/lib/intelligence/types/campaignIntelligenceGraph";
import type { CampaignCivicSignal } from "@/lib/intelligence/types/campaignIntelligenceGraph";
import { CAMPAIGN_CIVIC_SIGNALS } from "@/lib/intelligence/types/campaignIntelligenceGraph";

type KimHammerBillCivicIntelligencePanelProps = {
  civic: KimHammerBillCivicIntelligence;
};

const signalBadge: Record<CampaignCivicSignal, string> = {
  CIVICALLY_ALIGNED: "bg-emerald-100 text-emerald-900",
  CIVICALLY_TENSE: "bg-amber-100 text-amber-900",
  CIVICALLY_FRAGILE: "bg-orange-100 text-orange-900",
  CIVICALLY_CENTRALIZING: "bg-rose-100 text-rose-900",
  CIVICALLY_EMPOWERING: "bg-sky-100 text-sky-900",
  CIVICALLY_OPAQUE: "bg-violet-100 text-violet-900",
  CIVICALLY_ACCOUNTABLE: "bg-teal-100 text-teal-900",
};

function BulletSection({ title, items }: { title: string; items: string[] }) {
  if (items.length === 0) return null;
  return (
    <section className="mb-4 rounded-xl border border-kelly-text/10 bg-white p-4">
      <h2 className="text-sm font-bold uppercase tracking-wider text-kelly-navy">{title}</h2>
      <ul className="mt-2 list-inside list-disc text-xs text-kelly-muted">
        {items.map((item) => (
          <li key={item.slice(0, 64)}>{item}</li>
        ))}
      </ul>
    </section>
  );
}

export function KimHammerBillCivicIntelligencePanel({ civic }: KimHammerBillCivicIntelligencePanelProps) {
  return (
    <div className="mb-6">
      <section className="mb-4 rounded-xl border border-cyan-200/50 bg-cyan-50/40 p-4 text-xs text-cyan-950">
        <p className="font-bold uppercase tracking-wider">NSI-4 · Bill civic intelligence (read-only)</p>
        <p className="mt-1">
          Doctrine-aware civic interpretation — not legal conclusions. All fields remain review-aware and governed.
        </p>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <span className={`rounded px-2 py-0.5 text-[10px] font-bold ${signalBadge[civic.civicSignal]}`}>
            {civic.civicSignal.replaceAll("_", " ")}
          </span>
          <span className="text-[10px]">Graph: {civic.graphEntityId}</span>
          <span className="text-[10px]">Review: {civic.reviewStatus}</span>
        </div>
        <p className="mt-2 rounded border border-cyan-900/10 bg-white p-2 font-medium text-cyan-950">
          {civic.civicSignalText}
        </p>
      </section>

      <section className="mb-4 rounded-xl border border-kelly-text/10 bg-white p-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-kelly-navy">Civic impact Q&A</h2>
        <dl className="mt-2 space-y-2 text-xs">
          {civic.civicQuestions.map((row) => (
            <div key={row.question} className="rounded border border-kelly-text/10 bg-kelly-page/30 p-2">
              <dt className="font-semibold text-kelly-navy">{row.question}</dt>
              <dd className="mt-1 text-kelly-muted">{row.answer}</dd>
              <dd className="mt-1 text-[10px] text-kelly-subtle">{row.evidenceStatus}</dd>
            </div>
          ))}
        </dl>
      </section>

      <BulletSection title="Civic impact analysis" items={civic.civicImpactAnalysis} />
      <BulletSection title="Democracy & participation analysis" items={civic.democracyParticipationAnalysis} />
      <BulletSection title="Transparency & accountability analysis" items={civic.transparencyAccountabilityAnalysis} />
      <BulletSection title="County operations impact" items={civic.countyOperationsImpact} />

      <section className="mb-4 rounded-xl border border-kelly-text/10 bg-white p-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-kelly-navy">Governing philosophy alignment</h2>
        <div className="mt-2 grid gap-3 lg:grid-cols-2 text-xs text-kelly-muted">
          <div>
            <p className="font-semibold text-kelly-navy">Aligned</p>
            <ul className="mt-1 list-inside list-disc">
              {civic.governingPhilosophyAlignment.aligned.map((row) => (
                <li key={row}>{row}</li>
              ))}
            </ul>
          </div>
          <div>
            <p className="font-semibold text-kelly-navy">Tensions</p>
            <ul className="mt-1 list-inside list-disc">
              {civic.governingPhilosophyAlignment.tense.length > 0
                ? civic.governingPhilosophyAlignment.tense.map((row) => <li key={row}>{row}</li>)
                : [<li key="none">No doctrine tensions flagged.</li>]}
            </ul>
          </div>
        </div>
        <p className="mt-2 text-[10px] text-kelly-subtle">
          Doctrine links: {civic.governingPhilosophyAlignment.doctrineIds.join(", ") || "—"}
        </p>
      </section>

      <BulletSection title="Strategic messaging guidance" items={civic.strategicMessagingGuidance} />
      <BulletSection title="Public explanation layer" items={civic.publicExplanationLayer} />

      <section className="mb-4 rounded-xl border border-kelly-text/10 bg-white p-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-kelly-navy">Debate framing layer</h2>
        <div className="mt-2 grid gap-3 lg:grid-cols-2 text-xs text-kelly-muted">
          <div>
            <p className="font-semibold text-kelly-navy">Best contrast</p>
            <ul className="mt-1 list-inside list-disc">{civic.debateFramingLayer.bestContrast.map((row) => <li key={row}>{row}</li>)}</ul>
          </div>
          <div>
            <p className="font-semibold text-kelly-navy">Bridge lines</p>
            <ul className="mt-1 list-inside list-disc">{civic.debateFramingLayer.bridgeLines.map((row) => <li key={row}>{row}</li>)}</ul>
          </div>
          <div>
            <p className="font-semibold text-kelly-navy">Counterarguments</p>
            <ul className="mt-1 list-inside list-disc">{civic.debateFramingLayer.counterarguments.map((row) => <li key={row}>{row}</li>)}</ul>
          </div>
          <div>
            <p className="font-semibold text-kelly-navy">Traps / opponent setups</p>
            <ul className="mt-1 list-inside list-disc">{civic.debateFramingLayer.traps.map((row) => <li key={row}>{row}</li>)}</ul>
          </div>
        </div>
      </section>

      <BulletSection title="Risk & counterattack analysis" items={civic.riskCounterattackAnalysis} />
      <BulletSection title="Civic environment impact" items={civic.civicEnvironmentImpact} />

      <section className="rounded-xl border border-kelly-text/10 bg-white p-4 text-[10px] text-kelly-subtle">
        <p>Linked graph entities: {civic.linkedEntityIds.slice(0, 8).join(", ")}{civic.linkedEntityIds.length > 8 ? "…" : ""}</p>
        <p className="mt-1">Civic signals tracked: {CAMPAIGN_CIVIC_SIGNALS.join(", ")}</p>
      </section>
    </div>
  );
}
