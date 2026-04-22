import Link from "next/link";
import { EventWorkflowState, CampaignEventVisibility } from "@prisma/client";
import { EventReadinessStatus } from "@prisma/client";
import {
  approveEventAction,
  cancelEventAction,
  completeEventAction,
  publishEventAction,
  sendEventBackToDraftAction,
  setEventWorkflowStateAction,
  submitEventForReviewAction,
  updateEventExecutionFieldsAction,
  updateEventContextFieldsAction,
  startGoogleCalendarOAuthAction,
} from "@/app/admin/calendar-hq-actions";
import { isGoogleCalendarConfigured } from "@/lib/calendar/env";
import { type ExecutionChecklist } from "@/lib/calendar/event-intelligence";
import { EVENT_STAGE_LABEL } from "@/lib/calendar/event-lifecycle";
import type { CalendarHqEventDetail } from "@/lib/calendar/hq-data";
import { ChecklistItemForm as ItemForm } from "./ChecklistItemForm";
import { EventCommsPanelServer } from "./EventCommsPanelServer";
import { GoogleCalendarSyncBlock } from "./GoogleCalendarSyncBlock";
import { EventTaskWorkflowSection } from "./EventTaskWorkflowSection";
import { computeEventExecutionReadiness } from "@/lib/calendar/event-readiness";

const h2 = "font-heading text-[9px] font-bold uppercase tracking-wider text-deep-soil/50";

type ExecutionReadiness = ReturnType<typeof computeEventExecutionReadiness>;

type Detail = CalendarHqEventDetail;

const visShort: Record<CampaignEventVisibility, string> = {
  INTERNAL: "Internal",
  STAFF: "Staff",
  PUBLIC_STAFF: "Public+staff",
};

export function EventExecutionPanel({
  detail,
  checklist,
  health,
  firstSourceId,
  readiness,
  templateChoices,
  workflowRuns,
  assignUsers,
}: {
  detail: Detail;
  checklist: ExecutionChecklist;
  health: { score0to100: number; factors: string[] };
  firstSourceId: string | null;
  readiness: ExecutionReadiness;
  templateChoices: Array<{
    id: string;
    key: string;
    title: string;
    description: string | null;
    campaignEventType: Detail["eventType"] | null;
  }>;
  workflowRuns: Array<{
    id: string;
    status: string;
    workflowTemplate: { id: string; key: string; title: string };
  }>;
  assignUsers: Array<{ id: string; name: string | null; email: string | null }>;
}) {
  const pendingPrep = (["prep", "comms", "staffing", "followUp"] as const).reduce(
    (n, s) => n + checklist[s].filter((i) => !i.done).length,
    0
  );

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="shrink-0 border-b border-deep-soil/10 bg-deep-soil/5 px-2 py-1.5">
        <p className="font-heading text-[10px] font-bold uppercase tracking-wide text-deep-soil/55">Execution / selection</p>
        <p className="line-clamp-2 font-heading text-sm font-bold text-deep-soil">{detail.title}</p>
        <p className="text-[10px] text-deep-soil/60">
          {detail.startAt.toLocaleString()} → {detail.endAt.toLocaleString()} · {detail.timezone}
        </p>
        <div className="mt-1 flex flex-wrap items-center gap-1">
          <span
            className="rounded border border-red-dirt/30 bg-red-dirt/10 px-1.5 py-0.5 text-[9px] font-bold text-red-dirt/95"
            title="Operational workflow stage"
          >
            {EVENT_STAGE_LABEL[detail.eventWorkflowState]}
          </span>
          <span className="rounded bg-deep-soil/10 px-1.5 py-0.5 text-[9px] font-bold text-deep-soil/80">{detail.eventType}</span>
          {detail.county ? (
            <span className="rounded border border-washed-denim/30 bg-cream-canvas px-1.5 text-[9px] text-civic-slate">
              {detail.county.displayName}
            </span>
          ) : (
            <span className="text-[9px] text-amber-800/90">No county</span>
          )}
          {detail.isBigRock ? (
            <span className="rounded border border-amber-800/50 bg-amber-50/80 px-1.5 text-[9px] font-bold text-amber-900">Big rock</span>
          ) : null}
        </div>
        <p className="mt-1 text-[9px] text-deep-soil/55">
          Owner: {detail.ownerUser ? detail.ownerUser.name || detail.ownerUser.email : "—"} · {visShort[detail.visibility]}{" "}
          {detail.eventWorkflowState === "PUBLISHED" && detail.isPublicOnWebsite ? "· On public site" : "· Not on public site"}{" "}
          · {detail.signups.length} signups · {detail.tasks.length} tasks
        </p>
        <p className="mt-0.5 text-[8px] text-deep-soil/45">
          Comms {String(detail.commsReadiness)} · Staffing {String(detail.staffingReadiness)} · Prep {String(detail.prepReadiness)} · F/U {String(detail.followupReadiness)}
        </p>
        <div className="mt-1 flex items-baseline justify-between border-t border-deep-soil/10 pt-1">
          <p className={h2}>Health</p>
          <p className="font-heading text-lg font-bold text-deep-soil">
            {health.score0to100}
            <span className="text-[10px] font-normal text-deep-soil/50">/100</span>
          </p>
        </div>
        {health.factors.length > 0 ? (
          <ul className="mt-0.5 list-inside list-disc text-[9px] text-amber-900/90">
            {health.factors.slice(0, 5).map((x) => (
              <li key={x}>{x}</li>
            ))}
          </ul>
        ) : null}
        <p className="mt-1 text-[9px] text-deep-soil/45">
          {pendingPrep > 0 ? `${pendingPrep} checklist item(s) open —` : "Checklists in shape —"}{" "}
          <Link className="text-civic-slate underline" href={`/admin/events/${detail.id}`}>
            open full event
          </Link>
        </p>
      </div>

      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-2 text-[10px]">
        <div>
          <p className={h2}>Intent & time matrix</p>
          <form action={updateEventExecutionFieldsAction} className="mt-1 space-y-1.5">
            <input type="hidden" name="eventId" value={detail.id} />
            <div>
              <label className="text-[8px] uppercase text-deep-soil/40">Why this event exists</label>
              <textarea
                name="campaignIntent"
                className="mt-0.5 min-h-[48px] w-full resize-y border border-deep-soil/15 bg-white p-1.5 text-[10px] text-deep-soil/90"
                defaultValue={detail.campaignIntent ?? ""}
                placeholder="Strategic purpose; success criteria…"
              />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <label className="text-[8px] uppercase text-deep-soil/40">Quadrant</label>
              <select
                name="timeMatrixQuadrant"
                defaultValue={detail.timeMatrixQuadrant}
                className="border border-deep-soil/15 bg-white text-[9px]"
              >
                {["Q1", "Q2", "Q3", "Q4"].map((q) => (
                  <option key={q} value={q}>
                    {q} {q === "Q1" ? "· urgent+important" : q === "Q2" ? "· important" : q === "Q3" ? "· urgent" : "· neither"}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-1.5">
              <input
                type="checkbox"
                name="isBigRock"
                value="on"
                defaultChecked={detail.isBigRock}
                className="h-3.5 w-3.5"
                id="isBigRock"
              />
              <label htmlFor="isBigRock" className="text-[9px] text-deep-soil/80">
                Big rock (protected priority in the week)
              </label>
            </div>
            <div>
              <label className="text-[8px] uppercase text-deep-soil/40">Content opportunity</label>
              <textarea
                name="contentOpportunityNotes"
                className="mt-0.5 min-h-[40px] w-full resize-y border border-deep-soil/15 bg-white p-1.5 text-[10px]"
                defaultValue={detail.contentOpportunityNotes ?? ""}
                placeholder="Clips, local press, owned media…"
              />
            </div>
            <button type="submit" className="w-full rounded border border-deep-soil/25 bg-deep-soil py-1 text-[9px] font-bold text-cream-canvas">
              Save execution
            </button>
          </form>
        </div>

        <div>
          <p className={h2}>Internal & readiness (ops spine)</p>
          <form action={updateEventContextFieldsAction} className="mt-1 space-y-1">
            <input type="hidden" name="eventId" value={detail.id} />
            <label className="text-[8px] uppercase text-deep-soil/40">Internal summary</label>
            <textarea
              name="internalSummary"
              defaultValue={detail.internalSummary ?? ""}
              className="min-h-[40px] w-full border border-deep-soil/15 bg-white p-1 text-[9px]"
              placeholder="Staff-only — strategy, landmines, who must know…"
            />
            <div className="grid grid-cols-2 gap-1">
              {(
                [
                  ["commsReadiness", detail.commsReadiness],
                  ["staffingReadiness", detail.staffingReadiness],
                  ["prepReadiness", detail.prepReadiness],
                  ["followupReadiness", detail.followupReadiness],
                ] as const
              ).map(([field, value]) => (
                <label key={field} className="block text-[8px]">
                  <span className="text-deep-soil/45">{field.replace("Readiness", "")}</span>
                  <select
                    name={field}
                    defaultValue={String(value ?? "UNKNOWN")}
                    className="mt-0.5 w-full border border-deep-soil/15 bg-white text-[8px]"
                  >
                    {Object.values(EventReadinessStatus).map((v) => (
                      <option key={v} value={v}>
                        {v}
                      </option>
                    ))}
                  </select>
                </label>
              ))}
            </div>
            <button type="submit" className="w-full rounded border border-deep-soil/20 py-0.5 text-[9px] font-bold">
              Save context
            </button>
          </form>
        </div>

        <div>
          <EventCommsPanelServer detail={detail} />
        </div>

        <div>
          <GoogleCalendarSyncBlock detail={detail} />
        </div>

        <EventTaskWorkflowSection
          detail={detail}
          readiness={readiness}
          templateChoices={templateChoices}
          workflowRuns={workflowRuns}
          assignUsers={assignUsers}
        />

        <div>
          <p className={h2}>Workflow & approvals</p>
          {detail.cancellationReason && detail.eventWorkflowState === "CANCELED" ? (
            <p className="mt-0.5 rounded border border-rose-800/30 bg-rose-50/80 px-1.5 py-1 text-[9px] text-rose-950">
              <span className="font-bold">Cancel reason: </span>
              {detail.cancellationReason}
            </p>
          ) : null}
          {detail.stageChangeLogs[0] ? (
            <p className="mt-1 text-[8px] text-deep-soil/55">
              Last change: {detail.stageChangeLogs[0]!.createdAt.toLocaleString()} —{" "}
              {detail.stageChangeLogs[0]!.fromState != null
                ? `${EVENT_STAGE_LABEL[detail.stageChangeLogs[0]!.fromState!]} → `
                : ""}
              {EVENT_STAGE_LABEL[detail.stageChangeLogs[0]!.toState]}
            </p>
          ) : (
            <p className="mt-1 text-[8px] text-deep-soil/40">No stage history yet (new event).</p>
          )}
          {detail.eventApprovals[0] ? (
            <p className="mt-0.5 text-[8px] text-deep-soil/60">
              Latest approval row: {detail.eventApprovals[0]!.state}
              {detail.eventApprovals[0]!.note ? ` — ${detail.eventApprovals[0]!.note}` : ""}
            </p>
          ) : null}
          {detail.approvedAt ? (
            <p className="text-[8px] text-deep-soil/50">
              Approved {detail.approvedAt.toLocaleString()}
              {detail.approvedByUser ? ` · ${detail.approvedByUser.name || detail.approvedByUser.email}` : ""}
            </p>
          ) : null}
          {detail.submittedForReviewAt ? (
            <p className="text-[8px] text-deep-soil/50">Submitted for review {detail.submittedForReviewAt.toLocaleString()}</p>
          ) : null}
          {detail.completedAt ? (
            <p className="text-[8px] text-deep-soil/50">Completed (lifecycle) {detail.completedAt.toLocaleString()}</p>
          ) : null}

          {detail.eventWorkflowState === "DRAFT" ? (
            <form action={submitEventForReviewAction} className="mt-1 space-y-0.5">
              <input type="hidden" name="eventId" value={detail.id} />
              <label className="text-[7px] uppercase text-deep-soil/40">Note (optional)</label>
              <input name="note" className="w-full border border-deep-soil/12 bg-white px-1 text-[9px]" placeholder="Context for reviewers" />
              <button type="submit" className="w-full rounded border border-washed-denim/40 bg-cream-canvas py-0.5 text-[9px] font-bold text-deep-soil">
                Submit for review
              </button>
            </form>
          ) : null}
          {detail.eventWorkflowState === "PENDING_APPROVAL" ? (
            <div className="mt-1 space-y-1">
              <form action={approveEventAction} className="space-y-0.5">
                <input type="hidden" name="eventId" value={detail.id} />
                <label className="text-[7px] uppercase text-deep-soil/40">Approval note</label>
                <input name="approvalNote" className="w-full border border-deep-soil/12 bg-white px-1 text-[9px]" placeholder="Staff note" />
                <button type="submit" className="w-full rounded border border-field-green/50 bg-field-green/20 py-0.5 text-[9px] font-bold text-field-green/95">
                  Approve
                </button>
              </form>
              <form action={sendEventBackToDraftAction} className="space-y-0.5">
                <input type="hidden" name="eventId" value={detail.id} />
                <input name="note" className="w-full border border-deep-soil/12 bg-white px-1 text-[9px]" placeholder="Why sending back" />
                <button type="submit" className="w-full rounded border border-amber-800/30 bg-amber-50/80 py-0.5 text-[9px] font-bold text-amber-950">
                  Send back to draft
                </button>
              </form>
            </div>
          ) : null}
          {detail.eventWorkflowState === "APPROVED" ? (
            <div className="mt-1 space-y-1">
              <form action={publishEventAction} className="space-y-0.5">
                <input type="hidden" name="eventId" value={detail.id} />
                <input name="note" className="w-full border border-deep-soil/12 bg-white px-1 text-[9px]" placeholder="Note (e.g. go-live check)" />
                <button type="submit" className="w-full rounded border border-red-dirt/40 bg-red-dirt/15 py-0.5 text-[9px] font-bold text-red-dirt">
                  Publish to public site
                </button>
              </form>
              <form action={completeEventAction} className="space-y-0.5">
                <input type="hidden" name="eventId" value={detail.id} />
                <input name="note" className="w-full border border-deep-soil/12 bg-white px-1 text-[9px]" />
                <button type="submit" className="w-full rounded border border-deep-soil/25 py-0.5 text-[9px] font-bold">
                  Mark complete
                </button>
              </form>
              <form action={cancelEventAction} className="space-y-0.5">
                <input type="hidden" name="eventId" value={detail.id} />
                <label className="text-[7px] uppercase text-deep-soil/40">Cancellation reason (required)</label>
                <input
                  name="cancellationReason"
                  required
                  className="w-full border border-rose-800/20 bg-white px-1 text-[9px]"
                  placeholder="Required to cancel from this stage"
                />
                <button type="submit" className="w-full rounded border border-rose-800/30 bg-rose-50/90 py-0.5 text-[9px] font-bold text-rose-900">
                  Cancel event
                </button>
              </form>
            </div>
          ) : null}
          {detail.eventWorkflowState === "PUBLISHED" ? (
            <div className="mt-1 space-y-1">
              <form action={completeEventAction} className="space-y-0.5">
                <input type="hidden" name="eventId" value={detail.id} />
                <input name="note" className="w-full border border-deep-soil/12 bg-white px-1 text-[9px]" placeholder="Wrap-up note" />
                <button type="submit" className="w-full rounded border border-deep-soil/25 py-0.5 text-[9px] font-bold">
                  Mark complete
                </button>
              </form>
              <form action={cancelEventAction} className="space-y-0.5">
                <input type="hidden" name="eventId" value={detail.id} />
                <input
                  name="cancellationReason"
                  required
                  className="w-full border border-rose-800/20 bg-white px-1 text-[9px]"
                  placeholder="Why pulling from the field / site"
                />
                <button type="submit" className="w-full rounded border border-rose-800/30 bg-rose-50/90 py-0.5 text-[9px] font-bold text-rose-900">
                  Cancel (remove from public)
                </button>
              </form>
            </div>
          ) : null}
          {detail.eventWorkflowState === "CANCELED" || detail.eventWorkflowState === "COMPLETED" ? (
            <p className="mt-1 text-[8px] text-deep-soil/50">No further stage transitions. Edit details on the full event page if policy allows.</p>
          ) : null}
          <details className="mt-1.5 text-[8px] text-deep-soil/45">
            <summary className="cursor-pointer font-bold">Emergency legacy setter</summary>
            <p className="mb-0.5">Use only for repair; most moves should use the buttons above. Draft → Public is blocked.</p>
            <form action={setEventWorkflowStateAction} className="mt-0.5 space-y-0.5">
              <input type="hidden" name="eventId" value={detail.id} />
              <select name="workflowState" defaultValue={detail.eventWorkflowState} className="w-full border border-deep-soil/15 bg-white text-[8px]">
                {Object.values(EventWorkflowState).map((s) => (
                  <option key={s} value={s}>
                    {EVENT_STAGE_LABEL[s]}
                  </option>
                ))}
              </select>
              <button type="submit" className="w-full rounded border border-deep-soil/15 py-0.5 text-[8px] font-bold">
                Apply (validated subset)
              </button>
            </form>
          </details>

          <p className={h2 + " mt-2"}>Stage history</p>
          <ul className="mt-0.5 max-h-40 space-y-0.5 overflow-y-auto text-[8px] text-deep-soil/75">
            {detail.stageChangeLogs.length === 0 ? <li className="text-deep-soil/40">—</li> : null}
            {detail.stageChangeLogs.map((log) => (
              <li key={log.id} className="border-l-2 border-deep-soil/15 pl-1">
                <span className="text-deep-soil/45">{log.createdAt.toLocaleString()}</span>{" "}
                {log.fromState != null ? (
                  <span>
                    {EVENT_STAGE_LABEL[log.fromState]} → {EVENT_STAGE_LABEL[log.toState]}
                  </span>
                ) : (
                  <span>{EVENT_STAGE_LABEL[log.toState]}</span>
                )}
                {log.actor ? <span className="text-deep-soil/50"> · {log.actor.name || log.actor.email}</span> : null}
                {log.note ? <span className="block text-deep-soil/60">“{log.note}”</span> : null}
              </li>
            ))}
          </ul>
        </div>

        {(["prep", "comms", "staffing", "followUp"] as const).map((section) => (
          <div key={section}>
            <p className={h2}>
              {section === "followUp" ? "Follow-up" : section[0]!.toUpperCase() + section.slice(1)} checklist
            </p>
            <ul className="mt-0.5 space-y-0.5">
              {checklist[section].map((item) => (
                <li key={item.id}>
                  <ItemForm eventId={detail.id} section={section} item={item} />
                </li>
              ))}
            </ul>
          </div>
        ))}

        <p className="text-[8px] text-deep-soil/40">
          Public campaign calendar lists only events at workflow Public (published) with the public flag. Google sync state unchanged.
        </p>
        {firstSourceId ? (
          <form action={startGoogleCalendarOAuthAction}>
            <input type="hidden" name="sourceId" value={firstSourceId} />
            <button
              type="submit"
              disabled={!isGoogleCalendarConfigured()}
              className="w-full rounded border border-deep-soil/25 bg-deep-soil/90 py-1 text-[9px] font-bold text-cream-canvas disabled:opacity-40"
            >
              Google Calendar connect
            </button>
          </form>
        ) : null}
      </div>
    </div>
  );
}

