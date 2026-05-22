import type { CountyHotWashImpactAnalysis } from "@/lib/agents/county-intelligence/county-hotwash-impact";

export function HotWashCountyImpactPanel({ impact }: { impact: CountyHotWashImpactAnalysis }) {
  return (
    <div className="rounded-xl border border-kelly-text/15 bg-kelly-page/50 p-4">
      <p className="text-xs font-bold text-kelly-navy">County goal impact · {impact.countyName}</p>
      <dl className="mt-2 grid gap-1 text-xs sm:grid-cols-2">
        <div>
          <dt className="text-kelly-muted">Registration goals</dt>
          <dd className="font-semibold">{impact.helpedRegistration}</dd>
        </div>
        <div>
          <dt className="text-kelly-muted">Power of 5</dt>
          <dd className="font-semibold">{impact.helpedPowerOfFive}</dd>
        </div>
        <div>
          <dt className="text-kelly-muted">Leaders surfaced</dt>
          <dd>{impact.revealedLeaders ? "Yes" : "Not yet"}</dd>
        </div>
        <div>
          <dt className="text-kelly-muted">Volunteers recruited</dt>
          <dd>{impact.recruitedVolunteers ? "Yes" : "Not yet"}</dd>
        </div>
      </dl>
      {impact.scheduleAnotherEvent ? (
        <p className="mt-2 text-xs font-bold text-amber-800">Consider scheduling another event in this county within 30 days.</p>
      ) : null}
      <ul className="mt-2 list-inside list-disc text-[10px] text-kelly-muted">
        {impact.followUpActions.map((a) => (
          <li key={a}>{a}</li>
        ))}
      </ul>
    </div>
  );
}
