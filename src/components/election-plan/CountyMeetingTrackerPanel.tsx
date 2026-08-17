import Link from "next/link";

import {
  getCountyMeetingAssignments,
  getUpcomingCountyMeetingsWithAssignments,
  type CountyMeetingAssignment,
} from "@/lib/election-plan/load-county-meeting-assignments";
import { countyPartyDetailHref } from "@/lib/election-plan/load-county-party-intelligence";
import { getDpaChairForCounty } from "@/lib/election-plan/load-dpa-county-officers";

function assignmentBadge(plan: string, label: string) {
  const colors: Record<string, string> = {
    candidate_can_attend: "bg-emerald-700 text-white",
    surrogate_should_attend: "bg-blue-700 text-white",
    virtual_appearance: "bg-indigo-600 text-white",
    letter_or_video: "bg-violet-600 text-white",
    county_team_follow_up: "bg-slate-600 text-white",
    needs_confirmation: "bg-amber-600 text-white",
  };
  return (
    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${colors[plan] ?? "bg-slate-200"}`}>
      {label}
    </span>
  );
}

function AssignmentRow({ row }: { row: CountyMeetingAssignment }) {
  return (
    <tr className="border-b border-[var(--ep-border)] last:border-0">
      <td className="py-2 pr-3 font-medium">
        <Link href={countyPartyDetailHref(row.countySlug)} className="hover:underline">
          {row.county}
        </Link>
      </td>
      <td className="py-2 pr-3 text-sm">{getDpaChairForCounty(row.countySlug)?.displayName ?? row.countyChair ?? "—"}</td>
      <td className="py-2 pr-3 text-sm">{row.countyMissionHeadline ?? "—"}</td>
      <td className="py-2 pr-3 text-sm">{row.volunteerCaptain}</td>
      <td className="py-2 pr-3">{assignmentBadge(row.meetingAttendancePlan, row.meetingAttendanceLabel)}</td>
      <td className="py-2 pr-3 text-sm tabular-nums">{row.nextMeetingCandidateDate ?? "—"}</td>
      <td className="py-2 text-xs text-[var(--ep-navy-muted)]">{row.notes ?? "—"}</td>
    </tr>
  );
}

export function CountyMeetingTrackerPanel() {
  const assignments = getCountyMeetingAssignments();
  const upcoming = getUpcomingCountyMeetingsWithAssignments(12);

  return (
    <section className="mt-10">
      <p className="text-xs font-bold uppercase tracking-[0.15em] text-[var(--ep-gold)]">County meeting tracker</p>
      <h2 className="font-heading text-xl font-bold text-[var(--ep-navy)]">Can Kelly attend every county Dem meeting?</h2>
      <p className="mt-1 max-w-3xl text-sm text-[var(--ep-navy-muted)]">
        Public ArkDems data + assignment plan. Kelly · surrogate · virtual · letter when she cannot attend. Confirm every
        date by phone before locking calendar.
      </p>

      <div className="my-6 ep-card">
        <h3 className="font-heading font-bold text-[var(--ep-navy)]">Next county meetings (assigned counties)</h3>
        <ul className="mt-3 space-y-2 text-sm">
          {upcoming.map((m) => (
            <li key={`${m.countySlug}-${m.date}`} className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--ep-border)] pb-2 last:border-0">
              <span>
                <Link href={countyPartyDetailHref(m.countySlug)} className="font-semibold hover:underline">
                  {m.county}
                </Link>
                {" · "}
                <strong>{m.date}</strong>
                {m.timeLocal ? ` · ${m.timeLocal}` : ""}
                {m.location ? ` · ${m.location}` : ""}
              </span>
              {m.assignment ? assignmentBadge(m.assignment.meetingAttendancePlan, m.assignment.meetingAttendanceLabel) : null}
            </li>
          ))}
        </ul>
      </div>

      <div className="overflow-x-auto ep-card">
        <h3 className="mb-3 font-heading font-bold text-[var(--ep-navy)]">County leadership intelligence registry (priority counties)</h3>
        <table className="w-full min-w-[720px] text-sm">
          <thead>
            <tr className="border-b border-[var(--ep-border)] text-left text-xs uppercase text-[var(--ep-navy-muted)]">
              <th className="py-2 pr-3">County</th>
              <th className="py-2 pr-3">Chair</th>
              <th className="py-2 pr-3">Mission</th>
              <th className="py-2 pr-3">Captain</th>
              <th className="py-2 pr-3">Plan</th>
              <th className="py-2 pr-3">Next meeting</th>
              <th className="py-2">Notes</th>
            </tr>
          </thead>
          <tbody>
            {assignments.map((row) => (
              <AssignmentRow key={row.countySlug} row={row} />
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
