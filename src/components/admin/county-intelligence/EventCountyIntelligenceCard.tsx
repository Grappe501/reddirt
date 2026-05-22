import Link from "next/link";
import type { CountyIntelligenceSummary } from "@/lib/agents/county-intelligence/county-kpi-types";
import type { EventCountyPlanningGuidance } from "@/lib/agents/county-intelligence/county-kpi-types";
import { buildEventCountyPlanningGuidance } from "@/lib/agents/county-intelligence/county-event-strategy";

export function EventCountyIntelligenceCard({
  context,
  planning,
}: {
  context: CountyIntelligenceSummary;
  planning?: EventCountyPlanningGuidance | null;
}) {
  const { county } = context;
  const guide = planning ?? buildEventCountyPlanningGuidance(county.countyName);

  return (
    <section className="rounded-2xl border border-kelly-navy/15 bg-kelly-navy/[0.03] p-5">
      <p className="text-[10px] font-bold uppercase tracking-wider text-kelly-slate">County intelligence · {county.countyName}</p>
      <h3 className="mt-1 font-heading text-base font-bold text-kelly-navy">Why this county matters</h3>
      <ul className="mt-2 list-inside list-disc text-xs text-kelly-text/75">
        {(guide?.whyCountyMatters ?? context.whyHere).map((line) => (
          <li key={line}>{line}</li>
        ))}
      </ul>

      {guide ? (
        <>
          <h4 className="mt-4 text-xs font-bold text-kelly-navy">What this event should accomplish</h4>
          <ul className="mt-1 list-inside list-disc text-xs text-kelly-muted">
            {guide.eventPurpose.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
          <h4 className="mt-3 text-xs font-bold text-kelly-navy">Power of 5 ask</h4>
          <ul className="mt-1 list-inside list-disc text-xs text-kelly-muted">
            {guide.powerOfFiveAsk.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
          <h4 className="mt-3 text-xs font-bold text-kelly-navy">Volunteer recruitment ask</h4>
          <ul className="mt-1 list-inside list-disc text-xs text-kelly-muted">
            {guide.volunteerRecruitmentAsk.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
          <h4 className="mt-3 text-xs font-bold text-kelly-navy">Candidate: say / listen</h4>
          <ul className="mt-1 list-inside list-disc text-xs text-kelly-muted">
            {guide.candidateTalkingPoints.map((p) => (
              <li key={`s-${p}`}>{p}</li>
            ))}
            {guide.candidateListeningPoints.map((p) => (
              <li key={`l-${p}`} className="italic">
                Listen: {p}
              </li>
            ))}
          </ul>
          <h4 className="mt-3 text-xs font-bold text-kelly-navy">Suggested follow-up</h4>
          <ul className="mt-1 list-inside list-disc text-xs text-kelly-muted">
            {guide.suggestedFollowUp.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
        </>
      ) : null}

      <dl className="mt-4 grid gap-2 text-xs sm:grid-cols-2">
        <div>
          <dt className="font-bold">Registration goal (planning)</dt>
          <dd>{county.registrationGoal?.toLocaleString() ?? "—"}</dd>
        </div>
        <div>
          <dt className="font-bold">Power of 5 goal (planning)</dt>
          <dd>{county.powerOfFiveGoal?.toLocaleString() ?? "—"}</dd>
        </div>
        <div>
          <dt className="font-bold">Readiness</dt>
          <dd>{county.countyReadinessScore}/100</dd>
        </div>
        <div>
          <dt className="font-bold">Field strength</dt>
          <dd>{county.fieldStrengthScore}/100</dd>
        </div>
      </dl>

      <div className="mt-3 flex flex-wrap gap-2">
        {(guide?.routes ?? county.sourceLinks).slice(0, 4).map((l) => (
          <Link key={l.href} href={l.href} className="rounded-full border border-kelly-navy/20 px-3 py-1 text-[10px] font-bold text-kelly-navy">
            {l.label}
          </Link>
        ))}
        <Link href="/admin/county-intelligence" className="rounded-full bg-kelly-navy px-3 py-1 text-[10px] font-bold text-white">
          County command center
        </Link>
      </div>
    </section>
  );
}
