import Link from "next/link";

import type {
  RealLeaderDashboardPayload,
  LeaderFollowUpRow,
  LeaderPo5GapRow,
} from "@/lib/volunteers/load-real-leader-dashboard";

function statusBadgeClass(status: string): string {
  if (status === "committed") return "bg-emerald-50 text-emerald-950 ring-emerald-200";
  if (status === "open") return "bg-[var(--ep-cream)] text-[var(--ep-navy-muted)] ring-[var(--ep-navy)]/10";
  if (status === "contacted" || status === "warming") return "bg-amber-50 text-amber-950 ring-amber-200";
  return "bg-sky-50 text-sky-950 ring-sky-200";
}

function dueBucketStyles(bucket: LeaderFollowUpRow["dueBucket"]): string {
  if (bucket === "overdue") return "bg-rose-50 text-rose-950 ring-rose-200";
  if (bucket === "today") return "bg-amber-50 text-amber-950 ring-amber-200";
  return "bg-[var(--ep-cream)] text-[var(--ep-navy-muted)] ring-[var(--ep-navy)]/10";
}

function dueBucketLabel(bucket: LeaderFollowUpRow["dueBucket"]): string {
  if (bucket === "overdue") return "Overdue";
  if (bucket === "today") return "Today";
  return "This week";
}

function activityStyles(activity: LeaderPo5GapRow["activity"]): string {
  if (activity === "active") return "bg-emerald-50 text-emerald-900 ring-emerald-200";
  if (activity === "warming") return "bg-amber-50 text-amber-950 ring-amber-200";
  return "bg-[var(--ep-cream)] text-[var(--ep-navy-muted)] ring-[var(--ep-navy)]/10";
}

type Props = {
  payload: RealLeaderDashboardPayload;
};

export function RealLeaderDashboard({ payload }: Props) {
  const { personal, command } = payload;

  return (
    <div className="ep-chapter-body px-6 py-10 lg:px-10">
      <div className="mx-auto max-w-6xl space-y-12">
        {personal ? (
          <section>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-[var(--ep-gold)]">Your leader dashboard</p>
                <h2 className="mt-1 font-heading text-2xl font-bold text-[var(--ep-navy)]">{personal.leader.displayName}</h2>
                <p className="font-mono text-sm font-bold text-[var(--ep-blue)]">{personal.leader.initials}</p>
                <p className="mt-2 text-sm text-[var(--ep-navy-muted)]">
                  {personal.recordSource === "live"
                    ? "Live My Five, team roster, and field log — tied to your leader slug."
                    : "Roster slots are ready — zeros are honest until you map contacts and log field results."}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Link href={personal.workbenchHref} className="ep-btn ep-btn-primary ep-btn-sm">
                  Full workbench →
                </Link>
                <Link href={`${personal.workbenchHref}#power-of-5`} className="ep-btn ep-btn-ghost ep-btn-sm">
                  Edit My Five
                </Link>
                <Link href={`${personal.workbenchHref}#field-log`} className="ep-btn ep-btn-ghost ep-btn-sm">
                  Field log
                </Link>
              </div>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              {personal.stats.map((stat) => (
                <div key={stat.label} className="rounded-xl border border-[var(--ep-navy)]/10 bg-white p-4 shadow-sm">
                  <p className="text-xs font-bold uppercase tracking-wide text-[var(--ep-navy-muted)]">{stat.label}</p>
                  <p className="mt-2 font-heading text-2xl font-bold text-[var(--ep-navy)]">{stat.value}</p>
                  <p className="mt-2 text-xs leading-relaxed text-[var(--ep-navy-muted)]">{stat.hint}</p>
                  {stat.source === "live" ? (
                    <p className="mt-2 text-[10px] font-semibold uppercase tracking-wide text-emerald-700">Live</p>
                  ) : null}
                </div>
              ))}
            </div>

            {personal.nextActions.length ? (
              <div className="mt-8">
                <h3 className="font-heading text-lg font-bold text-[var(--ep-navy)]">Next actions</h3>
                <ul className="mt-4 divide-y divide-[var(--ep-navy)]/10 rounded-xl border border-[var(--ep-navy)]/10 bg-white shadow-sm">
                  {personal.nextActions.map((action) => (
                    <li key={action.id} className="flex flex-wrap items-start justify-between gap-3 px-4 py-3">
                      <div>
                        <p className="font-semibold text-[var(--ep-navy)]">{action.title}</p>
                        <p className="mt-1 text-xs text-[var(--ep-navy-muted)]">
                          {action.lane} · {action.dueLabel}
                        </p>
                      </div>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ring-1 ${
                          action.priority === "high"
                            ? "bg-rose-50 text-rose-950 ring-rose-200"
                            : "bg-[var(--ep-cream)] text-[var(--ep-navy-muted)] ring-[var(--ep-navy)]/10"
                        }`}
                      >
                        {action.priority}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            <div className="mt-8 grid gap-8 lg:grid-cols-2">
              <div>
                <h3 className="font-heading text-lg font-bold text-[var(--ep-navy)]">My Five</h3>
                <p className="mt-1 text-sm text-[var(--ep-navy-muted)]">
                  Five trusted contacts — live roster from your workbench, not demo data.
                </p>
                <ul className="mt-4 divide-y divide-[var(--ep-navy)]/10 rounded-xl border border-[var(--ep-navy)]/10 bg-white shadow-sm">
                  {personal.myFive.map((member, i) => (
                    <li key={`${member.slotIndex ?? i}-${member.displayName}`} className="px-4 py-3">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div>
                          <p className="font-semibold text-[var(--ep-navy)]">
                            {member.slotIndex ? `Slot ${member.slotIndex}` : "Slot"} — {member.displayName}
                          </p>
                          {member.category ? (
                            <p className="text-xs text-[var(--ep-navy-muted)]">{member.category}</p>
                          ) : null}
                          {member.lastTouchNote ? (
                            <p className="mt-1 text-sm text-[var(--ep-navy)]/80">{member.lastTouchNote}</p>
                          ) : null}
                          {member.branchCount > 0 ? (
                            <p className="mt-1 text-xs text-[var(--ep-blue)]">{member.branchCount} branch contacts</p>
                          ) : null}
                        </div>
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ring-1 ${statusBadgeClass(member.status)}`}
                        >
                          {member.status}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="font-heading text-lg font-bold text-[var(--ep-navy)]">Follow-up queue</h3>
                <p className="mt-1 text-sm text-[var(--ep-navy-muted)]">
                  Contacts not yet committed — clear within 48 hours when possible.
                </p>
                {personal.followUps.length ? (
                  <ul className="mt-4 divide-y divide-[var(--ep-navy)]/10 rounded-xl border border-[var(--ep-navy)]/10 bg-white shadow-sm">
                    {personal.followUps.map((row) => (
                      <li key={row.id} className="px-4 py-3">
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <div>
                            <p className="font-semibold text-[var(--ep-navy)]">{row.personName}</p>
                            <p className="text-xs text-[var(--ep-navy-muted)]">
                              {row.context} · {row.status}
                            </p>
                            <p className="mt-1 text-sm text-[var(--ep-navy)]/80">{row.note}</p>
                          </div>
                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ring-1 ${dueBucketStyles(row.dueBucket)}`}
                          >
                            {dueBucketLabel(row.dueBucket)}
                          </span>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-4 rounded-xl border border-[var(--ep-navy)]/10 bg-[var(--ep-cream)]/50 px-4 py-3 text-sm text-[var(--ep-navy-muted)]">
                    No open follow-ups — map My Five slots or add team members in your workbench.
                  </p>
                )}

                {personal.teamMembers.length ? (
                  <div className="mt-8">
                    <h4 className="font-heading text-base font-bold text-[var(--ep-navy)]">Team roster</h4>
                    <ul className="mt-3 divide-y divide-[var(--ep-navy)]/10 rounded-xl border border-[var(--ep-navy)]/10 bg-white shadow-sm">
                      {personal.teamMembers.map((member) => (
                        <li
                          key={member.displayName}
                          className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 text-sm"
                        >
                          <span className="font-semibold text-[var(--ep-navy)]">{member.displayName}</span>
                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ring-1 ${statusBadgeClass(member.status)}`}
                          >
                            {member.status}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </div>
            </div>
          </section>
        ) : null}

        {command ? (
          <section className={personal ? "border-t border-[var(--ep-navy)]/10 pt-10" : ""}>
            <h2 className="font-heading text-xl font-bold text-[var(--ep-navy)]">Statewide leader health</h2>
            <p className="mt-2 max-w-3xl text-sm text-[var(--ep-navy-muted)]">
              My Five completion, field activity, and quiet leaders across the field roster — for HQ, Volunteer
              Manager, and command access.
            </p>

            {!command.dbAvailable ? (
              <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
                Database not configured — Po5 rollup needs <code className="text-xs">DATABASE_URL</code>. Command
                heatmap still loads from workbench records.
              </div>
            ) : null}

            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {command.pipeline.map((step) => (
                <div key={step.stage} className="rounded-xl border border-[var(--ep-navy)]/10 bg-white p-4 shadow-sm">
                  <p className="text-xs font-bold uppercase tracking-wide text-[var(--ep-navy-muted)]">{step.label}</p>
                  <p className="mt-2 font-heading text-3xl font-bold text-[var(--ep-navy)]">{step.count}</p>
                  <p className="mt-2 text-xs leading-relaxed text-[var(--ep-navy-muted)]">{step.description}</p>
                </div>
              ))}
            </div>

            <div className="mt-4 flex flex-wrap gap-4 text-sm text-[var(--ep-navy-muted)]">
              <p>
                Field leaders:{" "}
                <span className="font-semibold text-[var(--ep-navy)]">{command.stats.fieldLeaders}</span>
              </p>
              <p>
                Active: <span className="font-semibold text-emerald-800">{command.stats.activeLeaders}</span>
              </p>
              <p>
                Quiet: <span className="font-semibold text-[var(--ep-navy)]">{command.stats.quietLeaders}</span>
              </p>
            </div>

            <section className="mt-10">
              <h3 className="font-heading text-lg font-bold text-[var(--ep-navy)]">Weekly leader rhythm</h3>
              <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                {command.weeklyRhythm.map((item) => (
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
                  <h3 className="font-heading text-lg font-bold text-[var(--ep-navy)]">My Five gaps by leader</h3>
                  <p className="mt-1 text-sm text-[var(--ep-navy-muted)]">
                    Sorted by fewest mapped slots — coach leaders under 5/5 first.
                  </p>
                </div>
                <Link
                  href="/election-plan/operators/leaders/command"
                  className="text-xs font-semibold text-[var(--ep-blue)] hover:underline"
                >
                  Full command heatmap →
                </Link>
              </div>
              <div className="mt-4 overflow-x-auto rounded-xl border border-[var(--ep-navy)]/10 bg-white shadow-sm">
                <table className="min-w-full text-left text-sm">
                  <thead className="border-b border-[var(--ep-navy)]/10 bg-[var(--ep-cream)]/60 text-xs uppercase tracking-wide text-[var(--ep-navy-muted)]">
                    <tr>
                      <th className="px-4 py-3 font-semibold">Status</th>
                      <th className="px-4 py-3 font-semibold">Leader</th>
                      <th className="px-4 py-3 font-semibold">My Five</th>
                      <th className="px-4 py-3 font-semibold">Team</th>
                      <th className="px-4 py-3 font-semibold">Committed</th>
                      <th className="px-4 py-3 font-semibold">Workbench</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--ep-navy)]/10">
                    {command.po5Gaps.slice(0, 24).map((row) => (
                      <tr key={row.slug} className="hover:bg-[var(--ep-cream)]/30">
                        <td className="px-4 py-3">
                          <span
                            className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ring-1 ${activityStyles(row.activity)}`}
                          >
                            {row.activity}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <p className="font-semibold text-[var(--ep-navy)]">{row.displayName}</p>
                          <p className="font-mono text-xs text-[var(--ep-blue)]">{row.initials}</p>
                        </td>
                        <td className="px-4 py-3 tabular-nums font-semibold text-[var(--ep-navy)]">
                          {row.myFiveFilled}/5
                        </td>
                        <td className="px-4 py-3 tabular-nums text-[var(--ep-navy-muted)]">{row.teamCount}</td>
                        <td className="px-4 py-3 tabular-nums text-[var(--ep-navy-muted)]">{row.committedCount}</td>
                        <td className="px-4 py-3">
                          <Link href={row.workbenchHref} className="text-xs font-semibold text-[var(--ep-blue)] hover:underline">
                            Open →
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </section>
        ) : null}

        {!personal && !command ? (
          <p className="rounded-xl border border-[var(--ep-navy)]/10 bg-[var(--ep-cream)]/50 px-4 py-6 text-sm text-[var(--ep-navy-muted)]">
            Sign in as a volunteer leader to see your dashboard, or use an Election Plan operator session for the
            statewide rollup.
          </p>
        ) : null}
      </div>
    </div>
  );
}
