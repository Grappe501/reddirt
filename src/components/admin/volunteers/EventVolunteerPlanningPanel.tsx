import type { EventVolunteerContext } from "@/lib/campaign-events/volunteers/load-event-volunteer-context";

export function EventVolunteerPlanningPanel({ context }: { context: EventVolunteerContext }) {
  return (
    <section className="rounded-2xl border border-kelly-navy/12 bg-kelly-page/40 p-4">
      <p className="text-[10px] font-bold uppercase tracking-wider text-kelly-slate">Volunteer plan</p>
      <h3 className="font-heading text-base font-bold text-kelly-navy">Event staffing (recommendations only)</h3>
      <dl className="mt-2 grid gap-1 text-xs sm:grid-cols-2">
        <div>
          <dt className="font-bold">Needed</dt>
          <dd>{context.volunteersNeeded}</dd>
        </div>
        <div>
          <dt className="font-bold">Assigned</dt>
          <dd>{context.staffingGap.assigned}</dd>
        </div>
        <div>
          <dt className="font-bold">Trained in county</dt>
          <dd>{context.trainedInCounty}</dd>
        </div>
        <div>
          <dt className="font-bold">Leadership prospects</dt>
          <dd>{context.leadershipProspects}</dd>
        </div>
      </dl>
      {context.gapWarning ? <p className="mt-2 text-xs font-bold text-amber-800">{context.gapWarning}</p> : null}
      <p className="mt-2 text-[10px] text-kelly-muted">Roles: {context.rolesSuggested.join(", ")} · Reminders: {context.reminderStatus}</p>
      {context.recommendations.length > 0 ? (
        <ul className="mt-3 space-y-2 text-[10px]">
          {context.recommendations.slice(0, 5).map((r) => (
            <li key={`${r.volunteerId}-${r.role}`} className="rounded border border-kelly-text/10 p-2">
              <span className="font-bold">{r.displayName}</span> — {r.role} (score {Math.round(r.score)})
              <span className="block text-kelly-muted">{r.reasons.join(" · ")}</span>
              <span className="block text-amber-800">Human approval required — not auto-assigned</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-2 text-xs text-kelly-muted">No recommendations — add volunteers in command center or sync from intake.</p>
      )}
    </section>
  );
}
