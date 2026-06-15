import Link from "next/link";

import {
  getMeetingAccountability,
  getMeetingAccountabilityRollup,
  getMeetingById,
  meetingHref,
  meetingsHubHref,
  type CampaignMeeting,
  type MeetingActionItem,
} from "@/lib/election-plan/load-meeting-accountability";
import { campaignOrganizationHref } from "@/lib/election-plan/load-campaign-organization";
import { leadershipHubHref } from "@/lib/election-plan/load-phase-18-7b-ownership";

function ActionStatusBadge({ status }: { status: MeetingActionItem["status"] }) {
  const styles: Record<MeetingActionItem["status"], string> = {
    open: "bg-slate-100 text-slate-800",
    in_progress: "bg-amber-100 text-amber-900",
    done: "bg-emerald-100 text-emerald-900",
    blocked: "bg-red-100 text-red-900",
  };
  return (
    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${styles[status]}`}>
      {status.replace(/_/g, " ")}
    </span>
  );
}

function FourQuestionsStrip() {
  const model = getMeetingAccountability();
  return (
    <div className="ep-card border-l-4 border-[var(--ep-gold)]">
      <p className="text-xs font-bold uppercase text-[var(--ep-navy-muted)]">Every meeting answers four questions</p>
      <ol className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {model.fourQuestions.map((q, i) => (
          <li key={q.id} className="rounded-lg bg-slate-50 px-3 py-2 text-sm">
            <span className="font-bold text-[var(--ep-gold)]">{i + 1}.</span> {q.question}
          </li>
        ))}
      </ol>
    </div>
  );
}

function ActionItemsTable({ items }: { items: MeetingActionItem[] }) {
  if (items.length === 0) {
    return <p className="text-sm italic text-[var(--ep-navy-muted)]">No action items logged yet.</p>;
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[36rem] text-sm">
        <thead>
          <tr className="border-b border-[var(--ep-border)] text-left text-xs uppercase text-[var(--ep-navy-muted)]">
            <th className="py-2 pr-3">Action</th>
            <th className="py-2 pr-3">Owner</th>
            <th className="py-2 pr-3">Due</th>
            <th className="py-2">Status</th>
          </tr>
        </thead>
        <tbody>
          {items.map((row) => (
            <tr key={row.id} className="border-b border-[var(--ep-border)] last:border-0">
              <td className="py-2 pr-3 font-medium">{row.item}</td>
              <td className="py-2 pr-3">{row.owner}</td>
              <td className="py-2 pr-3 tabular-nums">{row.dueDate}</td>
              <td className="py-2">
                <ActionStatusBadge status={row.status} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function MeetingDetailPanel({ meeting }: { meeting: CampaignMeeting }) {
  return (
    <>
      <div className="mb-4 flex flex-wrap gap-2 text-xs">
        <Link href={meetingsHubHref()} className="font-semibold text-[var(--ep-navy-muted)] hover:text-[var(--ep-navy)]">
          ← Meetings hub
        </Link>
        <span className="text-[var(--ep-navy-muted)]">·</span>
        <Link href={campaignOrganizationHref()} className="font-semibold text-[var(--ep-navy-muted)] hover:text-[var(--ep-navy)]">
          Org chart
        </Link>
      </div>

      <p className="text-xs font-bold uppercase tracking-[0.15em] text-[var(--ep-gold)]">Phase 18.7E</p>
      <h1 className="font-heading text-2xl font-bold text-[var(--ep-navy)]">{meeting.title}</h1>
      <p className="mt-1 text-sm text-[var(--ep-navy-muted)]">
        {meeting.day} · {meeting.durationMinutes} min · {meeting.purpose}
      </p>

      <div className="my-6">
        <FourQuestionsStrip />
      </div>

      <div className="mb-6 ep-card">
        <h2 className="font-heading font-bold text-[var(--ep-navy)]">Attendees</h2>
        <ul className="mt-3 flex flex-wrap gap-2">
          {meeting.attendees.map((a) => (
            <li key={a} className="rounded-full bg-slate-100 px-3 py-1 text-sm">
              {a}
            </li>
          ))}
        </ul>
      </div>

      <div className="mb-6 ep-card">
        <h2 className="font-heading font-bold text-[var(--ep-navy)]">Dashboard metrics</h2>
        <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {meeting.dashboardMetrics.map((m) => (
            <div key={m.id} className="rounded-lg border border-[var(--ep-border)] p-3">
              <p className="font-semibold text-[var(--ep-navy)]">{m.label}</p>
              <p className="mt-1 text-xs text-[var(--ep-navy-muted)]">{m.source}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mb-6 ep-card">
        <h2 className="font-heading font-bold text-[var(--ep-navy)]">Agenda</h2>
        <table className="mt-3 w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--ep-border)] text-left text-xs uppercase text-[var(--ep-navy-muted)]">
              <th className="py-2 pr-3">Segment</th>
              <th className="py-2 pr-3">Min</th>
              <th className="py-2">Owner</th>
            </tr>
          </thead>
          <tbody>
            {meeting.agenda.map((row) => (
              <tr key={row.segment} className="border-b border-[var(--ep-border)] last:border-0">
                <td className="py-2 pr-3">{row.segment}</td>
                <td className="py-2 pr-3 tabular-nums">{row.minutes}</td>
                <td className="py-2">{row.owner}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mb-6 ep-card bg-[var(--ep-cream)]">
        <h2 className="font-heading font-bold text-[var(--ep-navy)]">{meeting.requiredOutput.label}</h2>
        <ul className="mt-3 list-disc space-y-1 pl-5 text-sm">
          {meeting.requiredOutput.items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>

      <div className="mb-6 ep-card">
        <h2 className="font-heading font-bold text-[var(--ep-navy)]">Action items</h2>
        <div className="mt-3">
          <ActionItemsTable items={meeting.actionItems} />
        </div>
      </div>

      <div className="ep-card border border-dashed border-[var(--ep-border)]">
        <h2 className="font-heading font-bold text-[var(--ep-navy)]">Meeting notes</h2>
        <p className="mt-2 text-sm italic text-[var(--ep-navy-muted)]">
          {meeting.notes || "No notes for this week yet. Capture commitments, blockers, and next steps after each call."}
        </p>
      </div>
    </>
  );
}

export function MeetingAccountabilityHubPanel() {
  const model = getMeetingAccountability();
  const rollup = getMeetingAccountabilityRollup();

  return (
    <section>
      <div className="mb-4 flex flex-wrap gap-2 text-xs">
        <Link href={leadershipHubHref()} className="font-semibold text-[var(--ep-navy-muted)] hover:text-[var(--ep-navy)]">
          ← Leadership hub
        </Link>
        <span className="text-[var(--ep-navy-muted)]">·</span>
        <Link href={campaignOrganizationHref()} className="font-semibold text-[var(--ep-navy-muted)] hover:text-[var(--ep-navy)]">
          Org chart
        </Link>
      </div>

      <p className="text-xs font-bold uppercase tracking-[0.15em] text-[var(--ep-gold)]">Phase 18.7E</p>
      <h1 className="font-heading text-2xl font-bold text-[var(--ep-navy)]">Meeting & Accountability System</h1>
      <p className="mt-1 text-sm text-[var(--ep-navy-muted)]">How do we know they&apos;re actually doing it?</p>
      <p className="mt-3 text-sm italic text-[var(--ep-navy-muted)]">{model.doctrine}</p>
      <p className="mt-2 text-xs text-[var(--ep-navy-muted)]">{model.underTenMinutes}</p>

      <div className="my-6">
        <FourQuestionsStrip />
      </div>

      <div className="my-6 ep-stat-grid">
        <div className="ep-stat">
          <div className="ep-stat-value">{rollup.meetingCount}</div>
          <div className="ep-stat-label">Weekly rhythms</div>
        </div>
        <div className="ep-stat">
          <div className="ep-stat-value text-amber-700">{rollup.inProgressActions}</div>
          <div className="ep-stat-label">In progress</div>
        </div>
        <div className="ep-stat">
          <div className="ep-stat-value">{rollup.openActions}</div>
          <div className="ep-stat-label">Open actions</div>
        </div>
        <div className="ep-stat">
          <div className="ep-stat-value text-red-700">{rollup.blockedActions}</div>
          <div className="ep-stat-label">Blocked</div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {model.meetings.map((meeting) => (
          <Link
            key={meeting.id}
            href={meetingHref(meeting.id)}
            className="ep-card block transition hover:ring-2 hover:ring-[var(--ep-gold-soft)]"
          >
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <h2 className="font-heading font-bold text-[var(--ep-navy)]">{meeting.title}</h2>
                <p className="mt-1 text-sm text-[var(--ep-navy-muted)]">
                  {meeting.day} · {meeting.durationMinutes} min
                </p>
              </div>
              <span className="rounded-full bg-[var(--ep-cream)] px-2 py-0.5 text-xs font-semibold">
                {meeting.actionItems.filter((a) => a.status !== "done").length} open
              </span>
            </div>
            <p className="mt-3 text-sm text-[var(--ep-navy-muted)]">{meeting.purpose}</p>
            <p className="mt-2 text-xs font-medium text-[var(--ep-gold)]">Open meeting →</p>
          </Link>
        ))}
      </div>
    </section>
  );
}

export function MeetingDetailPagePanel({ meetingId }: { meetingId: string }) {
  const meeting = getMeetingById(meetingId);
  if (!meeting) {
    return (
      <section>
        <Link href={meetingsHubHref()} className="text-xs font-semibold text-[var(--ep-navy-muted)] hover:text-[var(--ep-navy)]">
          ← Meetings hub
        </Link>
        <p className="mt-4 text-sm text-red-700">Meeting not found.</p>
      </section>
    );
  }
  return (
    <section>
      <MeetingDetailPanel meeting={meeting} />
    </section>
  );
}

export function MeetingsSummaryStrip() {
  const rollup = getMeetingAccountabilityRollup();
  return (
    <Link
      href={meetingsHubHref()}
      className="block ep-card transition hover:ring-2 hover:ring-[var(--ep-gold-soft)]"
    >
      <p className="text-xs font-bold uppercase text-[var(--ep-gold)]">Phase 18.7E · Accountability</p>
      <p className="mt-1 font-heading font-bold text-[var(--ep-navy)]">Meeting rhythm</p>
      <p className="mt-1 text-sm text-[var(--ep-navy-muted)]">
        {rollup.meetingCount} weekly meetings · {rollup.openActions + rollup.inProgressActions} active action items
      </p>
    </Link>
  );
}
