import type { CountyHotWashImpactV2 } from "@/lib/agents/county-intelligence/county-hotwash-impact";
import Link from "next/link";

export function HotWashCountyImpactPanel({ impact }: { impact: CountyHotWashImpactV2 }) {
  return (
    <div className="rounded-xl border border-kelly-text/15 bg-kelly-page/50 p-4">
      <p className="text-xs font-bold text-kelly-navy">County goal impact V2 · {impact.countyName}</p>
      <p className="mt-2 text-sm text-kelly-muted">{impact.goalAdvanced}</p>
      <dl className="mt-3 grid gap-2 text-xs sm:grid-cols-2">
        <div>
          <dt className="text-kelly-muted">Registration goals</dt>
          <dd className="font-semibold">{impact.helpedRegistration}</dd>
        </div>
        <div>
          <dt className="text-kelly-muted">Power of 5</dt>
          <dd className="font-semibold">{impact.helpedPowerOfFive}</dd>
        </div>
        <div>
          <dt className="text-kelly-muted">PO5 impact</dt>
          <dd>{impact.powerOfFiveImpact}</dd>
        </div>
        <div>
          <dt className="text-kelly-muted">Volunteer prospects</dt>
          <dd>{impact.volunteerProspects}</dd>
        </div>
        <div>
          <dt className="text-kelly-muted">Leaders</dt>
          <dd>{impact.leadersIdentified}</dd>
        </div>
        <div>
          <dt className="text-kelly-muted">Momentum</dt>
          <dd className="capitalize">{impact.momentumDelta}</dd>
        </div>
      </dl>
      {impact.scheduleAnotherEvent ? (
        <p className="mt-2 text-xs font-bold text-amber-800">{impact.scheduleAnotherEventReason}</p>
      ) : null}
      <p className="mt-3 text-xs">
        <strong className="text-kelly-navy">Recommended next county action:</strong> {impact.recommendedNextCountyAction}
      </p>
      <ul className="mt-2 list-inside list-disc text-[10px] text-kelly-muted">
        {impact.followUpActions.map((a) => (
          <li key={a}>{a}</li>
        ))}
      </ul>
      <Link href="/admin/county-intelligence" className="mt-2 inline-block text-[10px] font-bold text-kelly-navy underline">
        Open county command center
      </Link>
    </div>
  );
}
