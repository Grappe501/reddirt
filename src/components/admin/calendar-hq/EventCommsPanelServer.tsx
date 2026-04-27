import Link from "next/link";
import { EventReadinessStatus, EventWorkflowState } from "@prisma/client";
import { isOpenAIConfigured } from "@/lib/openai/client";
import { commsModeForStage } from "@/lib/calendar/event-comms-policy";
import { updateEventCommsStatusFieldsAction, recordEventCommsMilestoneAction, enqueueEventCalendarCommsNudgeAction } from "@/app/admin/event-comms-actions";
import type { CalendarHqEventDetail } from "@/lib/calendar/hq-data";
import { EventCommsDraftsClient } from "./EventCommsDraftsClient";

const h2 = "font-heading text-[9px] font-bold uppercase tracking-wider text-kelly-text/50";

function lastSentLine(e: {
  lastReminderSentAt: Date | null;
  lastAttendeeNoticeAt: Date | null;
  lastCancellationNoticeAt: Date | null;
  thankYouQueuedAt: Date | null;
}) {
  const parts: string[] = [];
  if (e.lastReminderSentAt) parts.push(`Reminder: ${e.lastReminderSentAt.toLocaleString()}`);
  if (e.lastAttendeeNoticeAt) parts.push(`Attendees: ${e.lastAttendeeNoticeAt.toLocaleString()}`);
  if (e.lastCancellationNoticeAt) parts.push(`Cancel: ${e.lastCancellationNoticeAt.toLocaleString()}`);
  if (e.thankYouQueuedAt) parts.push(`Thank-you queued: ${e.thankYouQueuedAt.toLocaleString()}`);
  return parts.length ? parts.join(" · ") : "No sends logged in system yet (use milestones below or wire sends).";
}

export function EventCommsPanelServer({ detail }: { detail: CalendarHqEventDetail }) {
  const mode = commsModeForStage(detail.eventWorkflowState);
  const rsvpN = detail.signups.length;
  return (
    <div>
      <p className={h2}>Communications (calendar)</p>
      <p className="mt-0.5 text-[8px] text-kelly-text/55">
        Stage mode: <span className="font-bold text-kelly-text/80">{mode}</span> · Comms badge:{" "}
        <span className="font-mono text-[8px]">{String(detail.commsReadiness)}</span> · plan / attendee / F/U:{" "}
        {String(detail.reminderPlanStatus)} / {String(detail.attendeeCommsStatus)} / {String(detail.followupCommsStatus)}
      </p>
      <p className="mt-0.5 text-[8px] text-kelly-text/60">Next comm due: {detail.nextReminderDueAt ? detail.nextReminderDueAt.toLocaleString() : "— (set below or publish)"}</p>
      <p className="text-[8px] text-kelly-text/50">Last: {lastSentLine(detail)}</p>
      <p className="mt-0.5 text-[8px] text-kelly-text/55">
        Audience: {rsvpN} signups{detail.publicSummary ? " · has public blurb" : ""} · {detail.visibility} visibility
      </p>
      {detail.commsQueueItems.length > 0 ? (
        <ul className="mt-0.5 max-h-20 overflow-y-auto text-[7px] text-kelly-text/60">
          {detail.commsQueueItems.map((q) => (
            <li key={q.id}>
              {q.actionType}
              {q.scheduledAt ? ` · ${q.scheduledAt.toLocaleString()}` : ""}
              {q.createdBy ? ` · by ${q.createdBy.name || q.createdBy.email}` : ""}
            </li>
          ))}
        </ul>
      ) : null}
      <p className="mt-0.5 text-[7px] text-kelly-text/40">
        {detail.eventWorkflowState === EventWorkflowState.DRAFT || detail.eventWorkflowState === EventWorkflowState.PENDING_APPROVAL
          ? "Outward attendee comms are restricted — internal prep and queue items only."
          : null}
        {detail.eventWorkflowState === EventWorkflowState.PUBLISHED
          ? "Outward invite/reminder flows allowed. Calendar queue links below."
          : null}
        {detail.eventWorkflowState === EventWorkflowState.CANCELED ? "Send cancellation notice — high priority." : null}
        {detail.eventWorkflowState === EventWorkflowState.COMPLETED ? "Thank-you & volunteer follow-up." : null}
      </p>

      {isOpenAIConfigured() ? (
        <>
          <p className="mt-1 text-[7px] font-bold uppercase text-kelly-text/45">AI drafts (OpenAI)</p>
          <EventCommsDraftsClient eventId={detail.id} />
        </>
      ) : (
        <p className="mt-0.5 text-[8px] text-amber-900/80">Set OPENAI_API_KEY for message drafts.</p>
      )}

      <p className={h2 + " mt-1.5"}>Queue nudges (workbench)</p>
      <div className="mt-0.5 flex flex-wrap gap-0.5">
        {(
          [
            ["reminder", "Reminder due"],
            ["rsvp", "RSVP follow-up"],
            ["event_changed", "Event changed"],
            ["cancel", "Cancel notice"],
            ["county", "County lead"],
            ["thankyou", "Thank-you"],
            ["nocomms", "No comms plan"],
          ] as const
        ).map(([key, label]) => (
          <form key={key} action={enqueueEventCalendarCommsNudgeAction}>
            <input type="hidden" name="eventId" value={detail.id} />
            <input type="hidden" name="queue" value={key} />
            <button type="submit" className="rounded border border-kelly-text/12 bg-kelly-page px-1 py-0.5 text-[7px] font-bold text-kelly-text/85">
              + {label}
            </button>
          </form>
        ))}
      </div>
      <Link className="mt-0.5 inline-block text-[7px] text-kelly-slate underline" href="/admin/workbench?lane=calendar">
        Open calendar comms queue →
      </Link>

      <p className={h2 + " mt-1.5"}>Status & schedule</p>
      <form action={updateEventCommsStatusFieldsAction} className="mt-0.5 space-y-0.5">
        <input type="hidden" name="eventId" value={detail.id} />
        <div className="grid grid-cols-3 gap-0.5 text-[7px]">
          {(
            [
              ["reminderPlanStatus", "Rem. plan", detail.reminderPlanStatus],
              ["attendeeCommsStatus", "Attend.", detail.attendeeCommsStatus],
              ["followupCommsStatus", "F/U", detail.followupCommsStatus],
            ] as const
          ).map(([name, short, v]) => (
            <label key={name} className="block">
              {short}
              <select name={name} defaultValue={String(v)} className="mt-0.5 w-full border border-kelly-text/12 bg-white text-[7px]">
                {Object.values(EventReadinessStatus).map((x) => (
                  <option key={x} value={x}>
                    {x}
                  </option>
                ))}
              </select>
            </label>
          ))}
        </div>
        <label className="text-[7px] text-kelly-text/50">
          Next reminder due (local)
          <input
            type="datetime-local"
            name="nextReminderDueAt"
            defaultValue={detail.nextReminderDueAt ? toLocal(detail.nextReminderDueAt) : ""}
            className="mt-0.5 w-full border border-kelly-text/12 bg-white text-[7px]"
          />
        </label>
        <button type="submit" className="w-full rounded border border-kelly-text/15 py-0.5 text-[8px] font-bold">
          Save comms status
        </button>
      </form>

      <p className={h2 + " mt-1.5"}>Milestones (after send in Twilio / Sendgrid)</p>
      <div className="mt-0.5 flex flex-wrap gap-0.5">
        {(
          [
            ["reminder_sent", "Reminder sent"],
            ["attendee_notice", "Attendee notice"],
            ["cancellation_notice", "Cancel notice sent"],
          ] as const
        ).map(([m, label]) => (
          <form key={m} action={recordEventCommsMilestoneAction}>
            <input type="hidden" name="eventId" value={detail.id} />
            <input type="hidden" name="milestone" value={m} />
            <button type="submit" className="rounded border border-amber-800/20 bg-amber-50/60 px-1 py-0.5 text-[7px] font-bold text-amber-950">
              Log: {label}
            </button>
          </form>
        ))}
      </div>
    </div>
  );
}

function toLocal(d: Date) {
  return d.toISOString().slice(0, 16);
}

