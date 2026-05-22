import Link from "next/link";
import type { VolunteerSystemBundle } from "@/lib/campaign-events/volunteers/load-volunteer-bundle";

export function VolunteerIntelligencePanel({ bundle }: { bundle: VolunteerSystemBundle }) {
  return (
    <section className="rounded-2xl border border-kelly-navy/15 bg-white/80 p-5">
      <p className="text-[10px] font-bold uppercase tracking-wider text-kelly-slate">Volunteer OS</p>
      <h2 className="mt-1 font-heading text-lg font-bold text-kelly-navy">Statewide volunteer intelligence</h2>
      <dl className="mt-3 grid gap-2 text-xs sm:grid-cols-2">
        <div>
          <dt className="font-bold">Volunteers (V1)</dt>
          <dd>{bundle.volunteerCount}</dd>
        </div>
        <div>
          <dt className="font-bold">Training gaps</dt>
          <dd>{bundle.trainingGaps}</dd>
        </div>
        <div>
          <dt className="font-bold">County gaps</dt>
          <dd>{bundle.countyCoverageGaps.length}</dd>
        </div>
        <div>
          <dt className="font-bold">Retention risks</dt>
          <dd>{bundle.retentionRisks}</dd>
        </div>
        <div>
          <dt className="font-bold">Leadership prospects</dt>
          <dd>{bundle.leadershipProspects}</dd>
        </div>
        <div>
          <dt className="font-bold">Event staffing recs</dt>
          <dd>{bundle.eventStaffingGaps}</dd>
        </div>
      </dl>
      {bundle.recommendedActions[0] ? (
        <p className="mt-2 text-[10px] text-kelly-text/55">Next: {bundle.recommendedActions[0]}</p>
      ) : null}
      <Link href="/admin/volunteers" className="mt-3 inline-block text-xs font-bold text-kelly-navy underline">
        Open volunteer command center →
      </Link>
    </section>
  );
}
