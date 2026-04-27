import Link from "next/link";
import { CampaignTaskPriority, CommunicationObjective } from "@prisma/client";
import { prisma } from "@/lib/db";
import { CommsWorkbenchSubnav } from "@/components/admin/comms-workbench/CommsWorkbenchSubnav";
import {
  submitDirectCommunicationPlanForm,
  submitEventCommunicationPlanForm,
  submitIntakeCommunicationPlanForm,
  submitSocialCommunicationPlanForm,
  submitTaskCommunicationPlanForm,
} from "@/app/admin/comms-workbench-plan-actions";
import { COMMS_APP_PATHS } from "@/lib/comms-workbench/comms-nav";
import { formatCommsFieldLabel } from "@/lib/comms-workbench/ui-labels";

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const card = "mt-4 space-y-3 rounded-card border border-kelly-text/10 bg-kelly-page p-6 shadow-[var(--shadow-soft)]";
const label = "text-xs font-semibold uppercase tracking-wider text-kelly-text/55";
const field = "mt-1 w-full rounded-md border border-kelly-text/15 bg-white px-3 py-2 text-sm";

function firstParam(v: string | string[] | undefined): string | undefined {
  if (v == null) return undefined;
  return typeof v === "string" ? v.trim() || undefined : v[0]?.trim() || undefined;
}

function toInputDateTime(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function ObjectiveSelect({ name, defaultValue }: { name: string; defaultValue?: CommunicationObjective }) {
  return (
    <label className="block text-sm">
      <span className={label}>Objective</span>
      <select name={name} required defaultValue={defaultValue} className={field}>
        {Object.values(CommunicationObjective).map((o) => (
          <option key={o} value={o}>
            {formatCommsFieldLabel(o)}
          </option>
        ))}
      </select>
    </label>
  );
}

function PrioritySelect({ name }: { name: string }) {
  return (
    <label className="block text-sm">
      <span className={label}>Priority (optional)</span>
      <select name={name} className={field} defaultValue="">
        <option value="">Default (medium)</option>
        {Object.values(CampaignTaskPriority).map((p) => (
          <option key={p} value={p}>
            {formatCommsFieldLabel(p)}
          </option>
        ))}
      </select>
    </label>
  );
}

function DateRow({ defaultDue }: { defaultDue?: string }) {
  return (
    <div className="grid gap-3 md:grid-cols-2">
      <label className="block text-sm">
        <span className={label}>Due (optional)</span>
        <input name="dueAt" type="datetime-local" className={field} defaultValue={defaultDue ?? ""} />
      </label>
      <label className="block text-sm">
        <span className={label}>Scheduled (optional)</span>
        <input name="scheduledAt" type="datetime-local" className={field} />
      </label>
    </div>
  );
}

export default async function NewCommunicationPlanPage({ searchParams }: Props) {
  const sp = await searchParams;
  const err = firstParam(sp.error);

  const intakeId = firstParam(sp.intakeId);
  const taskId = firstParam(sp.taskId);
  const eventId = firstParam(sp.eventId);
  const socialItemId = firstParam(sp.socialItemId);

  /** If multiple ids are present in the query, use a single primary: intake → task → event → social. */
  const sourceMode =
    intakeId != null ? "intake" : taskId != null ? "task" : eventId != null ? "event" : socialItemId != null ? "social" : "none";

  const intake =
    sourceMode === "intake" && intakeId
      ? await prisma.workflowIntake.findUnique({
          where: { id: intakeId },
          select: { id: true, title: true, status: true, source: true },
        })
      : null;
  const task =
    sourceMode === "task" && taskId
      ? await prisma.campaignTask.findUnique({
          where: { id: taskId },
          select: { id: true, title: true, description: true, status: true, dueAt: true, priority: true },
        })
      : null;
  const event =
    sourceMode === "event" && eventId
      ? await prisma.campaignEvent.findUnique({
          where: { id: eventId },
          select: { id: true, title: true, startAt: true, status: true, eventType: true },
        })
      : null;
  const social =
    sourceMode === "social" && socialItemId
      ? await prisma.socialContentItem.findUnique({
          where: { id: socialItemId },
          select: { id: true, title: true, kind: true, status: true },
        })
      : null;

  return (
    <div className="min-w-0 p-1">
      <CommsWorkbenchSubnav />
      <p className="mt-2 font-body text-xs text-kelly-text/55">
        <Link href={COMMS_APP_PATHS.plans} className="text-kelly-slate hover:underline">
          ← All message plans
        </Link>
      </p>
      <h1 className="mt-1 font-heading text-xl font-bold text-kelly-text">New message plan</h1>
      <p className="mt-1 max-w-2xl font-body text-sm text-kelly-text/70">
        Create a <strong>CommunicationPlan</strong> with a clear upstream source when applicable. The plan is created in
        draft; add and edit message drafts on the plan detail.
      </p>

      {err ? (
        <p className="mt-3 rounded border border-amber-200 bg-amber-50 px-3 py-2 font-body text-sm text-amber-900">{err}</p>
      ) : null}

      {sourceMode === "intake" && intakeId && !intake ? (
        <p className="mt-3 text-sm text-amber-800">Could not find workflow intake for this id. Use a blank plan below.</p>
      ) : null}
      {sourceMode === "task" && taskId && !task ? (
        <p className="mt-3 text-sm text-amber-800">Could not find task for this id. Use a blank plan below.</p>
      ) : null}
      {sourceMode === "event" && eventId && !event ? (
        <p className="mt-3 text-sm text-amber-800">Could not find event for this id. Use a blank plan below.</p>
      ) : null}
      {sourceMode === "social" && socialItemId && !social ? (
        <p className="mt-3 text-sm text-amber-800">Could not find social work item for this id. Use a blank plan below.</p>
      ) : null}

      {intake ? (
        <form action={submitIntakeCommunicationPlanForm} className={card}>
          <h2 className="font-heading text-lg font-bold text-kelly-text">From workflow intake</h2>
          <input type="hidden" name="workflowIntakeId" value={intake.id} />
          <p className="text-xs text-kelly-text/60">
            Intake: <span className="font-mono">{intake.id}</span>
            {intake.status ? <span> · {formatCommsFieldLabel(intake.status)}</span> : null}
            {intake.source ? <span> · {intake.source}</span> : null}
          </p>
          <label className="block text-sm">
            <span className={label}>Title (optional—defaults to intake label)</span>
            <input
              name="title"
              className={field}
              defaultValue={intake.title?.trim() ? `Comms: ${intake.title.trim()}` : ""}
              placeholder="Comms: …"
            />
          </label>
          <label className="block text-sm">
            <span className={label}>Summary (optional)</span>
            <textarea
              name="summary"
              rows={2}
              className={field}
              placeholder="Optional; defaults to status and source if empty"
            />
          </label>
          <ObjectiveSelect name="objective" defaultValue={CommunicationObjective.GENERAL_UPDATE} />
          <PrioritySelect name="priority" />
          <DateRow />
          <button type="submit" className="rounded-btn bg-kelly-navy px-5 py-2.5 text-sm font-bold text-kelly-page">
            Create plan from intake
          </button>
        </form>
      ) : null}

      {task ? (
        <form action={submitTaskCommunicationPlanForm} className={card}>
          <h2 className="font-heading text-lg font-bold text-kelly-text">From campaign task</h2>
          <input type="hidden" name="campaignTaskId" value={task.id} />
          <p className="text-xs text-kelly-text/60">
            Task: <span className="font-semibold">{task.title}</span> · {formatCommsFieldLabel(task.status)} · plan priority
            matches task priority ({formatCommsFieldLabel(task.priority)}).
          </p>
          <label className="block text-sm">
            <span className={label}>Title (optional)</span>
            <input name="title" className={field} defaultValue={`Comms: ${task.title}`} placeholder="Comms: …" />
          </label>
          <label className="block text-sm">
            <span className={label}>Summary (optional—defaults to description or status)</span>
            <textarea name="summary" rows={2} className={field} defaultValue={task.description?.trim() ?? ""} />
          </label>
          <ObjectiveSelect name="objective" defaultValue={CommunicationObjective.INTERNAL_COORDINATION} />
          <DateRow defaultDue={task.dueAt ? toInputDateTime(task.dueAt) : undefined} />
          <p className="text-[11px] text-kelly-text/50">Pre-filled with the task due when available; clear it if the plan should not have a due date.</p>
          <button type="submit" className="rounded-btn bg-kelly-navy px-5 py-2.5 text-sm font-bold text-kelly-page">
            Create plan from task
          </button>
        </form>
      ) : null}

      {event ? (
        <form action={submitEventCommunicationPlanForm} className={card}>
          <h2 className="font-heading text-lg font-bold text-kelly-text">From campaign event</h2>
          <input type="hidden" name="eventId" value={event.id} />
          <p className="text-xs text-kelly-text/60">
            Event: <span className="font-semibold">{event.title}</span> · {formatCommsFieldLabel(event.status)} ·{" "}
            {formatCommsFieldLabel(event.eventType)}
          </p>
          <label className="block text-sm">
            <span className={label}>Title (optional)</span>
            <input name="title" className={field} defaultValue={`Comms: ${event.title}`} placeholder="Comms: …" />
          </label>
          <label className="block text-sm">
            <span className={label}>Summary (optional)</span>
            <textarea name="summary" rows={2} className={field} />
          </label>
          <ObjectiveSelect name="objective" defaultValue={CommunicationObjective.EVENT_PROMOTION} />
          <PrioritySelect name="priority" />
          <DateRow />
          <p className="text-[11px] text-kelly-text/50">Pick an objective that matches this plan (reminder, promotion, follow-up, etc.).</p>
          <button type="submit" className="rounded-btn bg-kelly-navy px-5 py-2.5 text-sm font-bold text-kelly-page">
            Create plan from event
          </button>
        </form>
      ) : null}

      {social ? (
        <form action={submitSocialCommunicationPlanForm} className={card}>
          <h2 className="font-heading text-lg font-bold text-kelly-text">From social work item</h2>
          <input type="hidden" name="socialContentItemId" value={social.id} />
          <p className="text-xs text-kelly-text/60">
            Item: <span className="font-mono">{social.id}</span> · {formatCommsFieldLabel(social.kind)} ·{" "}
            {formatCommsFieldLabel(social.status)}
          </p>
          <label className="block text-sm">
            <span className={label}>Title (optional)</span>
            <input
              name="title"
              className={field}
              defaultValue={social.title?.trim() ? `Comms: ${social.title.trim()}` : ""}
              placeholder="Comms: …"
            />
          </label>
          <label className="block text-sm">
            <span className={label}>Summary (optional)</span>
            <textarea name="summary" rows={2} className={field} placeholder="Defaults to kind and status" />
          </label>
          <ObjectiveSelect name="objective" defaultValue={CommunicationObjective.GENERAL_UPDATE} />
          <PrioritySelect name="priority" />
          <DateRow />
          <p className="text-[11px] text-kelly-text/50">Does not change the social item; only sets provenance on the new plan.</p>
          <button type="submit" className="rounded-btn bg-kelly-navy px-5 py-2.5 text-sm font-bold text-kelly-page">
            Create plan from social item
          </button>
        </form>
      ) : null}

      {intake || task || event || social ? (
        <p className="mt-4 text-sm text-kelly-text/70">
          Want a different flow?{" "}
          <Link className="font-semibold text-kelly-slate hover:underline" href={COMMS_APP_PATHS.plansNew}>
            Open the blank / generic creator
          </Link>
        </p>
      ) : null}

      {!(intake || task || event || social) ? (
        <form action={submitDirectCommunicationPlanForm} className={card}>
        <h2 className="font-heading text-lg font-bold text-kelly-text">Blank plan (or optional single source link)</h2>
        <p className="text-sm text-kelly-text/65">
          Start from scratch, or set at most <strong>one</strong> upstream id if you are wiring provenance from an existing row.
        </p>
        <label className="block text-sm">
          <span className={label}>Title</span>
          <input name="title" required className={field} placeholder="e.g. County-wide volunteer reminder" />
        </label>
        <ObjectiveSelect name="objective" defaultValue={CommunicationObjective.GENERAL_UPDATE} />
        <PrioritySelect name="priority" />
        <label className="block text-sm">
          <span className={label}>Summary (optional)</span>
          <textarea name="summary" rows={2} className={field} />
        </label>
        <div className="grid gap-3 md:grid-cols-2">
          <label className="block text-sm">
            <span className={label}>Owner user id (optional)</span>
            <input name="ownerUserId" className={field} placeholder="cuid" />
          </label>
          <label className="block text-sm">
            <span className={label}>Requester user id (optional)</span>
            <input name="requestedByUserId" className={field} placeholder="cuid" />
          </label>
        </div>
        <DateRow />
        <p className="text-xs font-bold uppercase text-kelly-text/55">Link at most one source (optional)</p>
        <div className="grid gap-3 md:grid-cols-2">
          <label className="block text-sm">
            <span className={label}>Workflow intake id</span>
            <input name="sourceWorkflowIntakeId" className={field} autoComplete="off" />
          </label>
          <label className="block text-sm">
            <span className={label}>Campaign task id</span>
            <input name="sourceCampaignTaskId" className={field} autoComplete="off" />
          </label>
          <label className="block text-sm">
            <span className={label}>Campaign event id</span>
            <input name="sourceEventId" className={field} autoComplete="off" />
          </label>
          <label className="block text-sm">
            <span className={label}>Social content item id</span>
            <input name="sourceSocialContentItemId" className={field} autoComplete="off" />
          </label>
        </div>
        <label className="block text-sm">
          <span className={label}>Source type label (only if no id above, optional)</span>
          <input name="sourceType" className={field} placeholder="e.g. NOTEBOOK_IMPORT" />
        </label>
        <button type="submit" className="rounded-btn bg-kelly-text px-5 py-2.5 text-sm font-bold text-kelly-page">
          Create plan
        </button>
        </form>
      ) : null}
    </div>
  );
}
