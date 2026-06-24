import Link from "next/link";

import {
  markVolunteerIntakeActivatedAction,
  markVolunteerIntakeAwaitingInfoAction,
  markVolunteerIntakeDeclinedAction,
  markVolunteerIntakeInReviewAction,
} from "@/app/election-plan/operators/volunteer-intake-actions";
import type {
  VolunteerIntakeDashboardPayload,
  VolunteerIntakeQueueRow,
} from "@/lib/volunteers/load-volunteer-intake-dashboard";

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
  if (status === "DECLINED" || status === "ARCHIVED") return "bg-[var(--ep-cream)] text-[var(--ep-navy-muted)] ring-[var(--ep-navy)]/10";
  return "bg-[var(--ep-cream)] text-[var(--ep-navy-muted)] ring-[var(--ep-navy)]/10";
}

function formatWhen(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("en-US", { dateStyle: "short", timeStyle: "short" });
}

function sourceLabel(source: string | null): string {
  if (source === "volunteer") return "Volunteer form";
  if (source === "join_movement") return "Join movement";
  if (source === "local_team") return "Local team";
  return source ?? "—";
}

function DetailPanel({ row }: { row: VolunteerIntakeQueueRow }) {
  return (
    <section className="mt-8 rounded-xl border border-[var(--ep-gold)]/45 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-[var(--ep-gold)]">Intake detail</p>
          <h2 className="mt-1 font-heading text-xl font-bold text-[var(--ep-navy)]">
            {row.title ?? row.userName ?? "Volunteer intake"}
          </h2>
          <p className="mt-1 text-sm text-[var(--ep-navy-muted)]">
            {sourceLabel(row.source)} · submitted {formatWhen(row.createdAt)}
          </p>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-bold uppercase ring-1 ${statusBadgeClass(row.status)}`}>
          {STATUS_LABEL[row.status] ?? row.status}
        </span>
      </div>

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
          {row.preferredLanguage ? (
            <dd className="text-xs text-[var(--ep-navy-muted)]">Language: {row.preferredLanguage}</dd>
          ) : null}
        </div>
        <div>
          <dt className="text-xs font-bold uppercase tracking-wide text-[var(--ep-navy-muted)]">Signals</dt>
          <dd className="mt-1 text-[var(--ep-navy-muted)]">
            {[
              row.leadershipInterest ? "Leadership interest" : null,
              row.student ? "Student" : null,
              row.hostingInterest ? "Hosting" : null,
              row.fundraisingInterest ? "Fundraising" : null,
            ]
              .filter(Boolean)
              .join(" · ") || "—"}
          </dd>
          {row.schoolCampus ? <dd className="text-xs text-[var(--ep-navy-muted)]">{row.schoolCampus}</dd> : null}
        </div>
        <div>
          <dt className="text-xs font-bold uppercase tracking-wide text-[var(--ep-navy-muted)]">Activation path</dt>
          <dd className="mt-1 text-[var(--ep-navy)]">
            {row.hasVolunteerProfile ? "Volunteer profile ✓" : "No profile yet"}
          </dd>
          {row.volunteerTeamSlug ? (
            <dd className="text-xs text-[var(--ep-navy-muted)]">Team: {row.volunteerTeamSlug}</dd>
          ) : null}
        </div>
        <div>
          <dt className="text-xs font-bold uppercase tracking-wide text-[var(--ep-navy-muted)]">Interests</dt>
          <dd className="mt-1 text-[var(--ep-navy-muted)]">{row.interests.length ? row.interests.join(", ") : "—"}</dd>
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
        <form action={markVolunteerIntakeDeclinedAction}>
          <input type="hidden" name="intakeId" value={row.id} />
          <button
            type="submit"
            className="rounded-full border border-red-200 bg-red-50 px-4 py-2 text-xs font-bold uppercase tracking-wide text-red-900"
          >
            Decline
          </button>
        </form>
      </div>

      <div className="mt-6 flex flex-wrap gap-4 text-xs font-semibold">
        <Link href="/election-plan/operators/leaders/command" className="text-[var(--ep-blue)] hover:underline">
          Leader command — assign placement →
        </Link>
        <Link href="/election-plan/workbenches" className="text-[var(--ep-blue)] hover:underline">
          Community workbenches →
        </Link>
        <Link href="/admin/volunteers/intake" className="text-[var(--ep-blue)] hover:underline">
          Signup sheet intake (admin) →
        </Link>
        {row.submissionId ? (
          <Link href="/admin/workbench" className="text-[var(--ep-blue)] hover:underline">
            Admin workbench review →
          </Link>
        ) : null}
      </div>
    </section>
  );
}

type Props = {
  payload: VolunteerIntakeDashboardPayload;
  selectedIntakeId?: string;
  notice?: string;
  error?: string;
};

export function VolunteerIntakeActivationDashboard({ payload, selectedIntakeId, notice, error }: Props) {
  const selected = payload.queue.find((r) => r.id === selectedIntakeId);

  return (
    <div className="ep-chapter-body px-6 py-10 lg:px-10">
      <div className="mx-auto max-w-6xl">
        {!payload.dbAvailable ? (
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
            Database not configured in this environment — queue stats unavailable. Connect{" "}
            <code className="text-xs">DATABASE_URL</code> to load live intakes.
          </div>
        ) : null}

        {notice ? (
          <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-950">
            Intake updated.
          </div>
        ) : null}
        {error ? (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900">
            {error === "auth"
              ? "You need Election Plan operator access or Volunteer Manager login to update intakes."
              : "Could not complete that action — try again or use admin workbench."}
          </div>
        ) : null}

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {payload.pipeline.map((step) => (
            <div
              key={step.stage}
              className="rounded-xl border border-[var(--ep-navy)]/10 bg-white p-4 shadow-sm"
            >
              <p className="text-xs font-bold uppercase tracking-wide text-[var(--ep-navy-muted)]">{step.label}</p>
              <p className="mt-2 font-heading text-3xl font-bold text-[var(--ep-navy)]">{step.count}</p>
              <p className="mt-2 text-xs leading-relaxed text-[var(--ep-navy-muted)]">{step.description}</p>
            </div>
          ))}
        </div>

        <div className="mt-6 flex flex-wrap gap-6 text-sm text-[var(--ep-navy-muted)]">
          <p>
            <span className="font-semibold text-[var(--ep-navy)]">{payload.stats.signupSheetPending}</span> signup sheet
            rows pending OCR review
          </p>
          <p>
            <span className="font-semibold text-[var(--ep-navy)]">{payload.stats.profilesTotal}</span> volunteer profiles
            in Kelly DB
          </p>
        </div>

        <div className="mt-10 overflow-x-auto rounded-xl border border-[var(--ep-navy)]/10 bg-white shadow-sm">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-[var(--ep-navy)]/10 bg-[var(--ep-cream)]/60 text-xs uppercase tracking-wide text-[var(--ep-navy-muted)]">
              <tr>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Name</th>
                <th className="px-4 py-3 font-semibold">Source</th>
                <th className="px-4 py-3 font-semibold">County / city</th>
                <th className="px-4 py-3 font-semibold">Role</th>
                <th className="px-4 py-3 font-semibold">Profile</th>
                <th className="px-4 py-3 font-semibold">Submitted</th>
                <th className="px-4 py-3 font-semibold">Open</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--ep-navy)]/10">
              {payload.queue.map((row) => (
                <tr key={row.id} className={selectedIntakeId === row.id ? "bg-[var(--ep-gold)]/10" : "hover:bg-[var(--ep-cream)]/30"}>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ring-1 ${statusBadgeClass(row.status)}`}
                    >
                      {STATUS_LABEL[row.status] ?? row.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-semibold text-[var(--ep-navy)]">{row.userName ?? row.title ?? "—"}</td>
                  <td className="px-4 py-3 text-xs text-[var(--ep-navy-muted)]">{sourceLabel(row.source)}</td>
                  <td className="px-4 py-3 text-xs text-[var(--ep-navy-muted)]">
                    {[row.county, row.city].filter(Boolean).join(" · ") || "—"}
                  </td>
                  <td className="px-4 py-3 text-xs text-[var(--ep-navy-muted)]">{row.preferredRole ?? "—"}</td>
                  <td className="px-4 py-3 text-xs">
                    {row.hasVolunteerProfile ? (
                      <span className="font-semibold text-emerald-800">Yes</span>
                    ) : (
                      <span className="text-[var(--ep-navy-muted)]">—</span>
                    )}
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
          {payload.queue.length === 0 && payload.dbAvailable ? (
            <p className="px-4 py-8 text-center text-sm text-[var(--ep-navy-muted)]">
              No volunteer intakes yet — public form submissions will appear here.
            </p>
          ) : null}
        </div>

        {selected ? <DetailPanel row={selected} /> : null}

        <section className="mt-10 rounded-xl border border-dashed border-[var(--ep-navy)]/20 bg-[var(--ep-cream)]/50 p-6">
          <h2 className="font-heading text-lg font-bold text-[var(--ep-navy)]">Activation playbook</h2>
          <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-[var(--ep-navy-muted)]">
            <li>Public form POST creates User, Submission, WorkflowIntake, and VolunteerProfile (volunteer form).</li>
            <li>Review geography and preferred role — mark <strong>In review</strong> on first operator touch.</li>
            <li>Place on a county or city workbench via Leader command; confirm solo team slug when provisioned.</li>
            <li>Mark <strong>Activated</strong> when the volunteer can access their workbench path.</li>
            <li>Paper signup sheets use the separate admin OCR path — link above when applicable.</li>
          </ol>
        </section>
      </div>
    </div>
  );
}
