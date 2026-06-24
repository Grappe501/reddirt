import Link from "next/link";

import {
  markVolunteerIntakeActivatedAction,
  markVolunteerIntakeAwaitingInfoAction,
  markVolunteerIntakeInReviewAction,
} from "@/app/election-plan/operators/volunteer-intake-actions";
import type {
  StatewideVrDashboardPayload,
  VrCountyGoalRow,
  VrIntakeQueueRow,
  VrUpcomingDriveRow,
} from "@/lib/voter-registration/load-statewide-vr-dashboard";

const STATUS_LABEL: Record<string, string> = {
  PENDING: "Pending",
  IN_REVIEW: "In review",
  AWAITING_INFO: "Awaiting info",
  READY_FOR_CALENDAR: "Ready",
  CONVERTED: "Activated",
  DECLINED: "Declined",
  ARCHIVED: "Archived",
};

function statusBadgeClass(status: string): string {
  if (status === "PENDING") return "bg-amber-50 text-amber-950 ring-amber-200";
  if (status === "IN_REVIEW" || status === "AWAITING_INFO") return "bg-sky-50 text-sky-950 ring-sky-200";
  if (status === "CONVERTED") return "bg-emerald-50 text-emerald-950 ring-emerald-200";
  return "bg-[var(--ep-cream)] text-[var(--ep-navy-muted)] ring-[var(--ep-navy)]/10";
}

function formatWhen(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("en-US", { dateStyle: "short", timeStyle: "short" });
}

function formatGoal(n: number): string {
  return n.toLocaleString("en-US");
}

function IntakeDetailPanel({ row }: { row: VrIntakeQueueRow }) {
  return (
    <section className="mt-8 rounded-xl border border-[var(--ep-gold)]/45 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-[var(--ep-gold)]">Registration intake</p>
          <h2 className="mt-1 font-heading text-xl font-bold text-[var(--ep-navy)]">
            {row.title ?? row.userName ?? "Volunteer intake"}
          </h2>
          <p className="mt-1 text-sm text-[var(--ep-navy-muted)]">Submitted {formatWhen(row.createdAt)}</p>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-bold uppercase ring-1 ${statusBadgeClass(row.status)}`}>
          {STATUS_LABEL[row.status] ?? row.status}
        </span>
      </div>

      {row.registrationSignals.length > 0 ? (
        <p className="mt-4 text-sm text-[var(--ep-navy)]">
          <span className="font-semibold">Registration signals:</span> {row.registrationSignals.join(" · ")}
        </p>
      ) : null}

      <dl className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 text-sm">
        <div>
          <dt className="text-xs font-bold uppercase tracking-wide text-[var(--ep-navy-muted)]">Contact</dt>
          <dd className="mt-1 text-[var(--ep-navy)]">{row.userName ?? "—"}</dd>
          <dd className="text-[var(--ep-navy-muted)]">{row.userEmail ?? "—"}</dd>
        </div>
        <div>
          <dt className="text-xs font-bold uppercase tracking-wide text-[var(--ep-navy-muted)]">Geography</dt>
          <dd className="mt-1 text-[var(--ep-navy)]">
            {[row.city, row.county, row.zip].filter(Boolean).join(" · ") || "—"}
          </dd>
        </div>
        <div>
          <dt className="text-xs font-bold uppercase tracking-wide text-[var(--ep-navy-muted)]">Preferred role</dt>
          <dd className="mt-1 text-[var(--ep-navy)]">{row.preferredRole ?? "—"}</dd>
        </div>
      </dl>

      <div className="mt-6 flex flex-wrap gap-2">
        <form action={markVolunteerIntakeInReviewAction}>
          <input type="hidden" name="intakeId" value={row.id} />
          <button
            type="submit"
            className="rounded-full bg-[var(--ep-navy)] px-4 py-2 text-xs font-bold uppercase tracking-wide text-white"
          >
            In review
          </button>
        </form>
        <form action={markVolunteerIntakeAwaitingInfoAction}>
          <input type="hidden" name="intakeId" value={row.id} />
          <button
            type="submit"
            className="rounded-full border border-[var(--ep-navy)]/20 bg-white px-4 py-2 text-xs font-bold uppercase tracking-wide text-[var(--ep-navy)]"
          >
            Awaiting info
          </button>
        </form>
        <form action={markVolunteerIntakeActivatedAction}>
          <input type="hidden" name="intakeId" value={row.id} />
          <button
            type="submit"
            className="rounded-full bg-emerald-700 px-4 py-2 text-xs font-bold uppercase tracking-wide text-white"
          >
            Mark activated
          </button>
        </form>
      </div>

      <div className="mt-6 flex flex-wrap gap-4 text-xs font-semibold">
        <Link href={`/election-plan/operators/volunteer-intake?intake=${row.id}`} className="text-[var(--ep-blue)] hover:underline">
          Full volunteer intake queue →
        </Link>
        <Link href="/election-plan/operators/leaders/command" className="text-[var(--ep-blue)] hover:underline">
          Leader command — assign placement →
        </Link>
        <Link href="/election-plan/workbenches/students-for-arkansas" className="text-[var(--ep-blue)] hover:underline">
          Students for Arkansas →
        </Link>
      </div>
    </section>
  );
}

type Props = {
  payload: StatewideVrDashboardPayload;
  selectedIntakeId?: string;
};

export function StatewideVoterRegistrationDashboard({ payload, selectedIntakeId }: Props) {
  const selected = payload.registrationIntake.find((r) => r.id === selectedIntakeId);

  return (
    <div className="ep-chapter-body px-6 py-10 lg:px-10">
      <div className="mx-auto max-w-6xl">
        {!payload.dbAvailable ? (
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
            Database not configured — intake queue and live county progress need{" "}
            <code className="text-xs">DATABASE_URL</code>. Calendar, goals snapshot, and lane roster still load.
          </div>
        ) : null}

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {payload.pipeline.map((step) => (
            <div key={step.stage} className="rounded-xl border border-[var(--ep-navy)]/10 bg-white p-4 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-wide text-[var(--ep-navy-muted)]">{step.label}</p>
              <p className="mt-2 font-heading text-3xl font-bold text-[var(--ep-navy)]">{step.count}</p>
              <p className="mt-2 text-xs leading-relaxed text-[var(--ep-navy-muted)]">{step.description}</p>
            </div>
          ))}
        </div>

        <div className="mt-4 flex flex-wrap gap-4 text-sm text-[var(--ep-navy-muted)]">
          <p>
            Statewide goal:{" "}
            <span className="font-semibold text-[var(--ep-navy)]">{formatGoal(payload.stats.statewideGoal)}</span>
          </p>
          <p>
            VR lane leaders:{" "}
            <span className="font-semibold text-[var(--ep-navy)]">{payload.stats.vrLaneLeaders}</span>
          </p>
        </div>

        <section className="mt-10">
          <h2 className="font-heading text-lg font-bold text-[var(--ep-navy)]">Weekly registration rhythm</h2>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {payload.weeklyRhythm.map((item) => (
              <li key={item.id} className="rounded-xl border border-[var(--ep-navy)]/10 bg-white p-4 shadow-sm">
                {item.href ? (
                  <Link href={item.href} className="font-semibold text-[var(--ep-navy)] hover:underline">
                    {item.label} →
                  </Link>
                ) : (
                  <p className="font-semibold text-[var(--ep-navy)]">{item.label}</p>
                )}
                <p className="mt-1 text-xs leading-relaxed text-[var(--ep-navy-muted)]">{item.description}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-10">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="font-heading text-lg font-bold text-[var(--ep-navy)]">Registration intake queue</h2>
              <p className="mt-1 text-sm text-[var(--ep-navy-muted)]">
                Website sign-ups with campus, student, or registration signals — placement on county or campus workbench.
              </p>
            </div>
            <Link
              href="/election-plan/operators/volunteer-intake"
              className="text-xs font-semibold text-[var(--ep-blue)] hover:underline"
            >
              Full volunteer intake →
            </Link>
          </div>

          <div className="mt-4 overflow-x-auto rounded-xl border border-[var(--ep-navy)]/10 bg-white shadow-sm">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-[var(--ep-navy)]/10 bg-[var(--ep-cream)]/60 text-xs uppercase tracking-wide text-[var(--ep-navy-muted)]">
                <tr>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Name</th>
                  <th className="px-4 py-3 font-semibold">Signals</th>
                  <th className="px-4 py-3 font-semibold">County / city</th>
                  <th className="px-4 py-3 font-semibold">Submitted</th>
                  <th className="px-4 py-3 font-semibold">Open</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--ep-navy)]/10">
                {payload.registrationIntake.map((row) => (
                  <tr
                    key={row.id}
                    className={selectedIntakeId === row.id ? "bg-[var(--ep-gold)]/10" : "hover:bg-[var(--ep-cream)]/30"}
                  >
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ring-1 ${statusBadgeClass(row.status)}`}
                      >
                        {STATUS_LABEL[row.status] ?? row.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-semibold text-[var(--ep-navy)]">{row.userName ?? row.title ?? "—"}</td>
                    <td className="px-4 py-3 text-xs text-[var(--ep-navy-muted)]">
                      {row.registrationSignals.join(" · ") || "—"}
                    </td>
                    <td className="px-4 py-3 text-xs text-[var(--ep-navy-muted)]">
                      {[row.county, row.city].filter(Boolean).join(" · ") || "—"}
                    </td>
                    <td className="px-4 py-3 text-xs text-[var(--ep-navy-muted)]">{formatWhen(row.createdAt)}</td>
                    <td className="px-4 py-3">
                      <Link href={row.detailHref} className="text-xs font-semibold text-[var(--ep-blue)] hover:underline">
                        Review →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {payload.registrationIntake.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-[var(--ep-navy-muted)]">
                No registration-signal intakes in queue — new campus and student sign-ups appear here automatically.
              </p>
            ) : null}
          </div>
        </section>

        {selected ? <IntakeDetailPanel row={selected} /> : null}

        <section className="mt-10">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="font-heading text-lg font-bold text-[var(--ep-navy)]">Upcoming drives (14 days)</h2>
              <p className="mt-1 text-sm text-[var(--ep-navy-muted)]">
                Field calendar stops — confirm tabling, registration materials, and Help 10 follow-up.
              </p>
            </div>
            <Link
              href={`/admin/campaign-events/review?month=${payload.period}&mode=chronological`}
              className="text-xs font-semibold text-[var(--ep-blue)] hover:underline"
            >
              Campaign calendar →
            </Link>
          </div>

          {payload.upcomingDrives.length === 0 ? (
            <p className="mt-4 rounded-xl border border-[var(--ep-navy)]/10 bg-white px-4 py-6 text-sm text-[var(--ep-navy-muted)]">
              No field stops in the next two weeks — coordinate with events lane when drives are scheduled.
            </p>
          ) : (
            <ul className="mt-4 grid gap-3">
              {payload.upcomingDrives.map((event) => (
                <DriveRow key={event.recordId} event={event} />
              ))}
            </ul>
          )}
        </section>

        <section className="mt-10">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="font-heading text-lg font-bold text-[var(--ep-navy)]">County registration goals</h2>
              <p className="mt-1 text-sm text-[var(--ep-navy-muted)]">
                Top counties by goal — live progress when voter-file pipeline syncs.
              </p>
            </div>
            <Link href="/election-plan/registration-goals" className="text-xs font-semibold text-[var(--ep-blue)] hover:underline">
              All 75 counties →
            </Link>
          </div>

          <div className="mt-4 overflow-x-auto rounded-xl border border-[var(--ep-navy)]/10 bg-white shadow-sm">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-[var(--ep-navy)]/10 bg-[var(--ep-cream)]/60 text-xs uppercase tracking-wide text-[var(--ep-navy-muted)]">
                <tr>
                  <th className="px-4 py-3 font-semibold">County</th>
                  <th className="px-4 py-3 font-semibold">Goal</th>
                  <th className="px-4 py-3 font-semibold">So far</th>
                  <th className="px-4 py-3 font-semibold">Progress</th>
                  <th className="px-4 py-3 font-semibold">Playbook</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--ep-navy)]/10">
                {payload.countyGoals.map((row) => (
                  <CountyGoalRow key={row.countySlug} row={row} />
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mt-10">
          <h2 className="font-heading text-lg font-bold text-[var(--ep-navy)]">Field reporting rollups</h2>
          <p className="mt-1 text-sm text-[var(--ep-navy-muted)]">
            Statewide field log quantities — conversations proxy Help 10; log registrations on county workbenches.
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {payload.fieldReporting.map((row) => (
              <div key={row.category} className="rounded-xl border border-[var(--ep-navy)]/10 bg-white p-4 shadow-sm">
                <p className="text-xs font-bold uppercase tracking-wide text-[var(--ep-navy-muted)]">{row.label}</p>
                <p className="mt-2 font-heading text-2xl font-bold text-[var(--ep-navy)]">{row.totalQuantity}</p>
                <p className="mt-1 text-xs text-[var(--ep-navy-muted)]">{row.entryCount} entries</p>
              </div>
            ))}
            {payload.fieldReporting.length === 0 ? (
              <p className="text-sm text-[var(--ep-navy-muted)] sm:col-span-2">No field entries logged yet statewide.</p>
            ) : null}
          </div>
        </section>

        <section className="mt-10">
          <h2 className="font-heading text-lg font-bold text-[var(--ep-navy)]">Registration lane leaders</h2>
          <p className="mt-1 text-sm text-[var(--ep-navy-muted)]">
            County and campus captains with voter registration on their workbench.
          </p>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {payload.vrLeaders.map((leader) => (
              <li key={leader.slug} className="rounded-xl border border-[var(--ep-navy)]/10 bg-white p-4 shadow-sm">
                <div className="flex items-start justify-between gap-2">
                  <Link href={leader.workbenchHref} className="font-semibold text-[var(--ep-navy)] hover:underline">
                    {leader.displayName}
                  </Link>
                  <span className="font-mono text-xs font-bold text-[var(--ep-blue)]">{leader.initials}</span>
                </div>
                <p className="mt-1 text-xs text-[var(--ep-navy-muted)]">{leader.roleLabel}</p>
                {leader.counties.length > 0 ? (
                  <p className="mt-2 text-xs text-[var(--ep-navy-muted)]">{leader.counties.join(" · ")}</p>
                ) : null}
                <Link
                  href={leader.laneDrillDownHref}
                  className="mt-3 inline-block text-xs font-semibold text-[var(--ep-blue)] hover:underline"
                >
                  VR lane drill-down →
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-10 rounded-xl border border-dashed border-[var(--ep-navy)]/20 bg-[var(--ep-cream)]/50 p-6">
          <h2 className="font-heading text-lg font-bold text-[var(--ep-navy)]">Registration command playbook</h2>
          <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-[var(--ep-navy-muted)]">
            <li>Filter volunteer intakes for campus and registration signals — place on county or SfA workbench.</li>
            <li>Confirm next tabling drive on workbench calendar at least one week ahead.</li>
            <li>Run Help 10 conversations before blast messaging — log in field log.</li>
            <li>Track county goals against voter-file sync — no unsourced procedural claims on deadlines.</li>
            <li>
              Clerk resources and public VR center live at{" "}
              <Link href="/voter-registration" className="font-semibold text-[var(--ep-blue)] hover:underline">
                /voter-registration
              </Link>{" "}
              — operators use Election Plan for field coordination only.
            </li>
          </ol>
        </section>
      </div>
    </div>
  );
}

function DriveRow({ event }: { event: VrUpcomingDriveRow }) {
  return (
    <li className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[var(--ep-navy)]/10 bg-white px-4 py-3 shadow-sm">
      <div>
        <p className="font-semibold text-[var(--ep-navy)]">{event.title}</p>
        <p className="mt-1 text-xs text-[var(--ep-navy-muted)]">
          {event.dateYmd} · {event.timeLabel}
          {[event.city, event.county].filter(Boolean).length > 0
            ? ` · ${[event.city, event.county].filter(Boolean).join(", ")}`
            : ""}
        </p>
      </div>
      <div className="flex items-center gap-3">
        <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-bold uppercase text-teal-950 ring-1 ring-teal-200">
          {event.daysUntil === 0 ? "Today" : event.daysUntil === 1 ? "Tomorrow" : `${event.daysUntil}d`}
        </span>
        <Link href={event.calendarHref} className="text-xs font-semibold text-[var(--ep-blue)] hover:underline">
          Calendar →
        </Link>
      </div>
    </li>
  );
}

function CountyGoalRow({ row }: { row: VrCountyGoalRow }) {
  return (
    <tr className="hover:bg-[var(--ep-cream)]/30">
      <td className="px-4 py-3 font-semibold text-[var(--ep-navy)]">{row.countyName}</td>
      <td className="px-4 py-3 tabular-nums text-[var(--ep-navy-muted)]">{formatGoal(row.registrationGoal)}</td>
      <td className="px-4 py-3 tabular-nums text-[var(--ep-navy-muted)]">
        {row.registrationsSoFar != null ? formatGoal(row.registrationsSoFar) : "—"}
      </td>
      <td className="px-4 py-3 text-xs text-[var(--ep-navy-muted)]">
        {row.progressPct != null ? `${row.progressPct}%` : "Pending sync"}
      </td>
      <td className="px-4 py-3">
        <Link href={row.playbookHref} className="text-xs font-semibold text-[var(--ep-blue)] hover:underline">
          Playbook →
        </Link>
      </td>
    </tr>
  );
}
