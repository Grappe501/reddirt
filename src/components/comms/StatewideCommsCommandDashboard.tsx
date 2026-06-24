import Link from "next/link";

import {
  markCommsDraftApprovedAction,
  markCommsDraftInReviewAction,
  markCommsDraftNeedsEditsAction,
} from "@/app/election-plan/operators/comms-command-actions";
import type {
  CommsEditorialQueueRow,
  CommsEmailQueueRow,
  CommsEventAlignmentRow,
  StatewideCommsDashboardPayload,
} from "@/lib/comms/load-statewide-comms-dashboard";
import { EMAIL_WORKFLOW_STATUS_LABELS } from "@/lib/email-workflow/governance";

const DRAFT_STATUS_LABEL: Record<string, string> = {
  NEEDS_REVIEW: "Needs review",
  IN_REVIEW: "In review",
  APPROVED_FOR_SEND_GOVERNANCE: "Approved",
  DRAFT: "Draft",
  ARCHIVED: "Archived",
};

function draftBadgeClass(status: string): string {
  if (status === "NEEDS_REVIEW") return "bg-amber-50 text-amber-950 ring-amber-200";
  if (status === "IN_REVIEW") return "bg-sky-50 text-sky-950 ring-sky-200";
  if (status === "APPROVED_FOR_SEND_GOVERNANCE") return "bg-emerald-50 text-emerald-950 ring-emerald-200";
  return "bg-[var(--ep-cream)] text-[var(--ep-navy-muted)] ring-[var(--ep-navy)]/10";
}

function formatWhen(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("en-US", { dateStyle: "short", timeStyle: "short" });
}

function EditorialDetailPanel({ row }: { row: CommsEditorialQueueRow }) {
  return (
    <section className="mt-8 rounded-xl border border-[var(--ep-gold)]/45 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-[var(--ep-gold)]">Editorial review</p>
          <h2 className="mt-1 font-heading text-xl font-bold text-[var(--ep-navy)]">{row.title}</h2>
          <p className="mt-1 text-sm text-[var(--ep-navy-muted)]">
            {row.draftType || "Message draft"} · updated {formatWhen(row.updatedAt)}
          </p>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-bold uppercase ring-1 ${draftBadgeClass(row.status)}`}>
          {DRAFT_STATUS_LABEL[row.status] ?? row.status}
        </span>
      </div>

      {row.subject ? (
        <p className="mt-4 text-sm text-[var(--ep-navy)]">
          <span className="font-semibold">Subject:</span> {row.subject}
        </p>
      ) : null}
      {row.editorialReviewOwner ? (
        <p className="mt-2 text-xs text-[var(--ep-navy-muted)]">
          Suggested reviewer role: <span className="font-semibold">{row.editorialReviewOwner}</span>
        </p>
      ) : null}

      <div className="mt-6 flex flex-wrap gap-2">
        <form action={markCommsDraftInReviewAction}>
          <input type="hidden" name="draftId" value={row.id} />
          <button
            type="submit"
            className="rounded-full bg-[var(--ep-navy)] px-4 py-2 text-xs font-bold uppercase tracking-wide text-white"
          >
            In review
          </button>
        </form>
        <form action={markCommsDraftNeedsEditsAction}>
          <input type="hidden" name="draftId" value={row.id} />
          <button
            type="submit"
            className="rounded-full border border-[var(--ep-navy)]/20 bg-white px-4 py-2 text-xs font-bold uppercase tracking-wide text-[var(--ep-navy)]"
          >
            Needs edits
          </button>
        </form>
        <form action={markCommsDraftApprovedAction}>
          <input type="hidden" name="draftId" value={row.id} />
          <button
            type="submit"
            className="rounded-full bg-emerald-700 px-4 py-2 text-xs font-bold uppercase tracking-wide text-white"
          >
            Approve for send governance
          </button>
        </form>
      </div>

      <div className="mt-6 flex flex-wrap gap-4 text-xs font-semibold">
        <Link href={row.adminStudioHref} className="text-[var(--ep-blue)] hover:underline">
          Open in Message Studio (admin) →
        </Link>
        <Link href="/messages" className="text-[var(--ep-blue)] hover:underline">
          Conversations & Stories hub →
        </Link>
        <Link href="/admin/workbench/email-command-center" className="text-[var(--ep-blue)] hover:underline">
          Email Command Center →
        </Link>
      </div>
    </section>
  );
}

type Props = {
  payload: StatewideCommsDashboardPayload;
  selectedDraftId?: string;
  notice?: string;
  error?: string;
};

export function StatewideCommsCommandDashboard({ payload, selectedDraftId, notice, error }: Props) {
  const selectedDraft = payload.editorialQueue.find((r) => r.id === selectedDraftId);

  return (
    <div className="ep-chapter-body px-6 py-10 lg:px-10">
      <div className="mx-auto max-w-6xl">
        {!payload.dbAvailable ? (
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
            Database not configured — editorial and email queues need <code className="text-xs">DATABASE_URL</code>.
            Event alignment and county comms roster still load from campaign data.
          </div>
        ) : null}

        {notice ? (
          <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-950">
            Draft workflow updated.
          </div>
        ) : null}
        {error ? (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900">
            {error === "auth"
              ? "You need Election Plan operator access or comms lead login to update drafts."
              : "Could not complete that action — try Message Studio in admin or ask campaign ops."}
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
            Mass email posture:{" "}
            <span className="font-semibold text-[var(--ep-navy)]">{payload.stats.massEmailStatus}</span>
          </p>
          <p>
            Calendar month: <span className="font-semibold text-[var(--ep-navy)]">{payload.period}</span>
          </p>
        </div>

        {payload.readinessRisks.length > 0 ? (
          <div className="mt-6 rounded-xl border border-amber-200/80 bg-amber-50/60 px-4 py-3 text-sm text-amber-950">
            <p className="text-xs font-bold uppercase tracking-wide">Provider readiness</p>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-xs">
              {payload.readinessRisks.map((risk) => (
                <li key={risk}>{risk}</li>
              ))}
            </ul>
          </div>
        ) : null}

        <section className="mt-10">
          <h2 className="font-heading text-lg font-bold text-[var(--ep-navy)]">Weekly comms rhythm</h2>
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
              <h2 className="font-heading text-lg font-bold text-[var(--ep-navy)]">Editorial review queue</h2>
              <p className="mt-1 text-sm text-[var(--ep-navy-muted)]">
                Message Studio shared drafts — comms lead signoff before send governance.
              </p>
            </div>
            <Link
              href="/admin/workbench/email-command-center/message-studio"
              className="text-xs font-semibold text-[var(--ep-blue)] hover:underline"
            >
              Full Message Studio →
            </Link>
          </div>

          <div className="mt-4 overflow-x-auto rounded-xl border border-[var(--ep-navy)]/10 bg-white shadow-sm">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-[var(--ep-navy)]/10 bg-[var(--ep-cream)]/60 text-xs uppercase tracking-wide text-[var(--ep-navy-muted)]">
                <tr>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Title</th>
                  <th className="px-4 py-3 font-semibold">Type</th>
                  <th className="px-4 py-3 font-semibold">Updated</th>
                  <th className="px-4 py-3 font-semibold">Review</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--ep-navy)]/10">
                {payload.editorialQueue.map((row) => (
                  <tr
                    key={row.id}
                    className={selectedDraftId === row.id ? "bg-[var(--ep-gold)]/10" : "hover:bg-[var(--ep-cream)]/30"}
                  >
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ring-1 ${draftBadgeClass(row.status)}`}
                      >
                        {DRAFT_STATUS_LABEL[row.status] ?? row.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-semibold text-[var(--ep-navy)]">{row.title}</td>
                    <td className="px-4 py-3 text-xs text-[var(--ep-navy-muted)]">{row.draftType || "—"}</td>
                    <td className="px-4 py-3 text-xs text-[var(--ep-navy-muted)]">{formatWhen(row.updatedAt)}</td>
                    <td className="px-4 py-3">
                      <Link href={row.detailHref} className="text-xs font-semibold text-[var(--ep-blue)] hover:underline">
                        Review →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {payload.editorialQueue.length === 0 && payload.dbAvailable ? (
              <p className="px-4 py-8 text-center text-sm text-[var(--ep-navy-muted)]">
                No drafts in editorial queue — clear for the week.
              </p>
            ) : null}
          </div>
        </section>

        {selectedDraft ? <EditorialDetailPanel row={selectedDraft} /> : null}

        <section className="mt-10">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="font-heading text-lg font-bold text-[var(--ep-navy)]">Event comms alignment (72h)</h2>
              <p className="mt-1 text-sm text-[var(--ep-navy-muted)]">
                Copy and photos ready before each stop — coordinate with events lane.
              </p>
            </div>
            <Link
              href={`/admin/campaign-events/review?month=${payload.period}&mode=chronological`}
              className="text-xs font-semibold text-[var(--ep-blue)] hover:underline"
            >
              Campaign calendar →
            </Link>
          </div>

          {payload.eventAlignment.length === 0 ? (
            <p className="mt-4 rounded-xl border border-[var(--ep-navy)]/10 bg-white px-4 py-6 text-sm text-[var(--ep-navy-muted)]">
              No stops in the next 72 hours — check back as the field calendar fills.
            </p>
          ) : (
            <ul className="mt-4 grid gap-3">
              {payload.eventAlignment.map((event) => (
                <EventRow key={event.recordId} event={event} />
              ))}
            </ul>
          )}
        </section>

        <section className="mt-10">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="font-heading text-lg font-bold text-[var(--ep-navy)]">Email workflow triage</h2>
              <p className="mt-1 text-sm text-[var(--ep-navy-muted)]">
                Inbound and enriched items needing attention — full triage in Email Command Center.
              </p>
            </div>
            <Link href="/admin/workbench/email-command-center" className="text-xs font-semibold text-[var(--ep-blue)] hover:underline">
              Email Command Center →
            </Link>
          </div>

          <div className="mt-4 overflow-x-auto rounded-xl border border-[var(--ep-navy)]/10 bg-white shadow-sm">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-[var(--ep-navy)]/10 bg-[var(--ep-cream)]/60 text-xs uppercase tracking-wide text-[var(--ep-navy-muted)]">
                <tr>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Title</th>
                  <th className="px-4 py-3 font-semibold">Who</th>
                  <th className="px-4 py-3 font-semibold">Assigned</th>
                  <th className="px-4 py-3 font-semibold">Open</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--ep-navy)]/10">
                {payload.emailQueue.map((row) => (
                  <EmailRow key={row.id} row={row} />
                ))}
              </tbody>
            </table>
            {payload.emailQueue.length === 0 && payload.dbAvailable ? (
              <p className="px-4 py-8 text-center text-sm text-[var(--ep-navy-muted)]">
                Email workflow queue clear — no items needing attention.
              </p>
            ) : null}
          </div>
        </section>

        <section className="mt-10">
          <h2 className="font-heading text-lg font-bold text-[var(--ep-navy)]">County comms coverage</h2>
          <p className="mt-1 text-sm text-[var(--ep-navy-muted)]">
            Leaders with comms lane on their workbench — drill into each lane for weekly checklist.
          </p>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {payload.commsLeaders.map((leader) => (
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
                  Comms lane drill-down →
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-10 rounded-xl border border-dashed border-[var(--ep-navy)]/20 bg-[var(--ep-cream)]/50 p-6">
          <h2 className="font-heading text-lg font-bold text-[var(--ep-navy)]">Comms command playbook</h2>
          <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-[var(--ep-navy-muted)]">
            <li>
              Pull the county message packet from{" "}
              <Link href="/messages" className="font-semibold text-[var(--ep-blue)] hover:underline">
                Conversations & Stories
              </Link>{" "}
              — one core line per week statewide.
            </li>
            <li>Clear editorial review before any shared draft moves to send governance.</li>
            <li>Align event copy and photos 72 hours before each Kelly stop.</li>
            <li>County comms leads log offline conversation reach in their field log.</li>
            <li>
              Mass sends stay gated — campaign manager and treasurer paths in{" "}
              <Link href="/admin/communications" className="font-semibold text-[var(--ep-blue)] hover:underline">
                admin communications
              </Link>
              .
            </li>
          </ol>
        </section>
      </div>
    </div>
  );
}

function EventRow({ event }: { event: CommsEventAlignmentRow }) {
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
        <span className="rounded-full bg-sky-50 px-3 py-1 text-xs font-bold uppercase text-sky-950 ring-1 ring-sky-200">
          {event.daysUntil === 0 ? "Today" : event.daysUntil === 1 ? "Tomorrow" : `${event.daysUntil}d`}
        </span>
        <Link href={event.calendarHref} className="text-xs font-semibold text-[var(--ep-blue)] hover:underline">
          Calendar →
        </Link>
      </div>
    </li>
  );
}

function EmailRow({ row }: { row: CommsEmailQueueRow }) {
  return (
    <tr className="hover:bg-[var(--ep-cream)]/30">
      <td className="px-4 py-3 text-xs font-semibold uppercase text-[var(--ep-navy-muted)]">
        {EMAIL_WORKFLOW_STATUS_LABELS[row.status as keyof typeof EMAIL_WORKFLOW_STATUS_LABELS] ?? row.status}
      </td>
      <td className="px-4 py-3 font-semibold text-[var(--ep-navy)]">{row.title ?? row.whatSummary ?? "—"}</td>
      <td className="px-4 py-3 text-xs text-[var(--ep-navy-muted)]">{row.whoSummary ?? "—"}</td>
      <td className="px-4 py-3 text-xs text-[var(--ep-navy-muted)]">{row.assignedTo ?? "Unassigned"}</td>
      <td className="px-4 py-3">
        <Link href={row.adminHref} className="text-xs font-semibold text-[var(--ep-blue)] hover:underline">
          Triage →
        </Link>
      </td>
    </tr>
  );
}
