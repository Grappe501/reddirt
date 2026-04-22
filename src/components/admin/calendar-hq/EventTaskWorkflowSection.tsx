import Link from "next/link";
import {
  CampaignTaskPriority,
  CampaignTaskStatus,
  CampaignTaskType,
} from "@prisma/client";
import {
  applyEventWorkflowTemplateAction,
  assignEventTaskAction,
  completeEventTaskAction,
  createEventQuickTaskAction,
  reapplyEventWorkflowsAction,
} from "@/app/admin/event-task-actions";
import { computeEventExecutionReadiness, isTaskOpen } from "@/lib/calendar/event-readiness";
import type { CalendarHqEventDetail } from "@/lib/calendar/hq-data";

const h2 = "font-heading text-[9px] font-bold uppercase tracking-wider text-deep-soil/50";

type ExecutionReadiness = ReturnType<typeof computeEventExecutionReadiness>;

type AssignUser = { id: string; name: string | null; email: string | null };

export function EventTaskWorkflowSection({
  detail,
  readiness,
  templateChoices,
  workflowRuns,
  assignUsers,
}: {
  detail: CalendarHqEventDetail;
  readiness: ExecutionReadiness;
  templateChoices: Array<{
    id: string;
    key: string;
    title: string;
    description: string | null;
    campaignEventType: CalendarHqEventDetail["eventType"] | null;
  }>;
  workflowRuns: Array<{
    id: string;
    status: string;
    workflowTemplate: { id: string; key: string; title: string };
  }>;
  assignUsers: AssignUser[];
}) {
  const openTasks = detail.tasks.filter(isTaskOpen);
  const blocked = readiness.blockingTasks;
  const overdue = readiness.overdueTasks;
  const terminal = detail.eventWorkflowState === "CANCELED" || detail.eventWorkflowState === "COMPLETED";

  return (
    <div className="space-y-2 border-t border-deep-soil/10 pt-2">
      <div>
        <p className={h2}>Execution readiness (Slice 4)</p>
        <div className="mt-1 flex flex-wrap items-center gap-1">
          <span
            className={`rounded border px-1.5 py-0.5 text-[9px] font-bold ${readiness.badgeClass}`}
            title="Blends lane readiness + blocking / overdue tasks"
          >
            {readiness.label} · {readiness.score0to100}/100
          </span>
          <span className="text-[8px] text-deep-soil/55">
            Blockers {readiness.blockerCount} · Overdue {readiness.overdueCount}
          </span>
        </div>
        {readiness.nextRequiredAction ? (
          <p className="mt-0.5 text-[9px] font-medium text-deep-soil/85">Next: {readiness.nextRequiredAction}</p>
        ) : null}
      </div>

      <div>
        <p className={h2}>Workflow templates</p>
        {workflowRuns.length > 0 ? (
          <ul className="mt-0.5 text-[8px] text-deep-soil/65">
            {workflowRuns.map((r) => (
              <li key={r.id}>
                {r.workflowTemplate.title} · {r.status}
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-0.5 text-[8px] text-deep-soil/45">No workflow pack applied yet.</p>
        )}
        {!terminal ? (
          <form action={applyEventWorkflowTemplateAction} className="mt-1 flex flex-col gap-0.5">
            <input type="hidden" name="eventId" value={detail.id} />
            <label className="text-[7px] uppercase text-deep-soil/40">Apply / refresh pack</label>
            <select name="templateId" className="w-full border border-deep-soil/15 bg-white text-[8px]">
              <option value="">— choose template —</option>
              {templateChoices.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.title}
                  {t.campaignEventType ? ` (${t.campaignEventType})` : " (extra)"}
                </option>
              ))}
            </select>
            <button
              type="submit"
              className="w-full rounded border border-washed-denim/40 bg-cream-canvas py-0.5 text-[9px] font-bold text-civic-slate"
            >
              Apply workflow to event
            </button>
          </form>
        ) : null}
        {!terminal && workflowRuns.length > 0 ? (
          <form action={reapplyEventWorkflowsAction} className="mt-1">
            <input type="hidden" name="eventId" value={detail.id} />
            <button
              type="submit"
              className="w-full rounded border border-deep-soil/20 py-0.5 text-[8px] font-semibold text-deep-soil/80"
              title="Updates due dates and missing lines from all packs already applied; does not duplicate completed work."
            >
              Re-sync tasks from applied packs
            </button>
          </form>
        ) : null}
      </div>

      <div>
        <p className={h2}>Blocking & overdue (event)</p>
        {blocked.length === 0 && overdue.length === 0 ? (
          <p className="text-[8px] text-field-green/90">No blocking or overdue open tasks.</p>
        ) : null}
        {blocked.length > 0 ? (
          <ul className="mb-0.5 list-inside list-disc text-[8px] text-rose-900/95">
            {blocked.slice(0, 8).map((t) => (
              <li key={t.id}>{t.title}</li>
            ))}
          </ul>
        ) : null}
        {overdue.length > 0 ? (
          <ul className="list-inside list-disc text-[8px] text-amber-950/90">
            {overdue
              .filter((o) => !blocked.find((b) => b.id === o.id))
              .slice(0, 6)
              .map((t) => (
                <li key={t.id}>
                  {t.title} {t.dueAt ? <span className="text-deep-soil/50">· was {t.dueAt.toLocaleString()}</span> : null}
                </li>
              ))}
          </ul>
        ) : null}
      </div>

      <div>
        <p className={h2}>All linked tasks</p>
        <ul className="mt-0.5 max-h-36 space-y-0.5 overflow-y-auto">
          {openTasks.length === 0 && detail.tasks.every((t) => !isTaskOpen(t)) ? (
            <li className="text-[8px] text-deep-soil/40">— (all done or cancelled)</li>
          ) : null}
          {detail.tasks.map((t) => (
            <li key={t.id} className="rounded border border-deep-soil/8 bg-white/50 px-1 py-0.5 text-[8px] text-deep-soil/88">
              <div className="font-semibold">
                {t.title}
                {t.blocksReadiness ? <span className="ml-1 text-[7px] text-rose-800">· blocks</span> : null}
              </div>
              <div className="text-deep-soil/50">
                {t.status}
                {t.taskType ? ` · ${t.taskType}` : ""}
                {t.dueAt ? ` · due ${t.dueAt.toLocaleString()}` : ""}
                {t.assignee ? ` · ${t.assignee.name || t.assignee.email}` : ""}
                {t.assignedRole ? ` · role: ${t.assignedRole}` : ""}
              </div>
              {isTaskOpen(t) && !terminal ? (
                <div className="mt-0.5 flex flex-wrap items-center gap-0.5">
                  <form action={assignEventTaskAction} className="flex flex-wrap items-center gap-0.5">
                    <input type="hidden" name="taskId" value={t.id} />
                    <select
                      name="assignedUserId"
                      defaultValue={t.assignedUserId ?? "__none"}
                      className="max-w-[160px] border border-deep-soil/12 text-[7px]"
                    >
                      <option value="__none">Assign…</option>
                      {assignUsers.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.name || u.email}
                        </option>
                      ))}
                    </select>
                    <button type="submit" className="rounded border border-deep-soil/15 px-0.5 text-[7px] font-bold">
                      Set
                    </button>
                  </form>
                  <form action={completeEventTaskAction}>
                    <input type="hidden" name="taskId" value={t.id} />
                    <button type="submit" className="rounded border border-field-green/40 bg-field-green/10 px-0.5 text-[7px] font-bold text-field-green/95">
                      Done
                    </button>
                  </form>
                </div>
              ) : null}
            </li>
          ))}
        </ul>
        <Link className="mt-0.5 inline-block text-[8px] text-civic-slate underline" href="/admin/tasks">
          All campaign tasks →
        </Link>
      </div>

      {!terminal ? (
        <div>
          <p className={h2}>Quick-create task</p>
          <form action={createEventQuickTaskAction} className="mt-0.5 space-y-0.5">
            <input type="hidden" name="eventId" value={detail.id} />
            <input
              name="title"
              className="w-full border border-deep-soil/12 bg-white px-1 text-[8px]"
              placeholder="Title"
              required
            />
            <div className="grid grid-cols-2 gap-0.5">
              <label className="text-[7px] text-deep-soil/45">
                Type
                <select name="taskType" defaultValue={CampaignTaskType.PREP} className="mt-0.5 w-full border text-[7px]">
                  {Object.values(CampaignTaskType).map((x) => (
                    <option key={x} value={x}>
                      {x}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-[7px] text-deep-soil/45">
                Priority
                <select name="priority" defaultValue={CampaignTaskPriority.MEDIUM} className="mt-0.5 w-full border text-[7px]">
                  {Object.values(CampaignTaskPriority).map((x) => (
                    <option key={x} value={x}>
                      {x}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <label className="text-[7px] text-deep-soil/45">
              Due offset (minutes from event start, negative = before)
              <input
                name="dueOffsetMinutes"
                type="number"
                className="mt-0.5 w-full border text-[7px]"
                defaultValue={-1440}
              />
            </label>
            <label className="flex items-center gap-1 text-[7px] text-deep-soil/55">
              <input type="checkbox" name="blocksReadiness" className="h-2.5 w-2.5" />
              Blocks readiness when open
            </label>
            <button type="submit" className="w-full rounded border border-deep-soil/20 py-0.5 text-[8px] font-bold">
              Add task
            </button>
          </form>
        </div>
      ) : null}
    </div>
  );
}

