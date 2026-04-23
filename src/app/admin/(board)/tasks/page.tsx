import Link from "next/link";
import { CampaignTaskStatus } from "@prisma/client";
import { createCampaignTaskAction, updateTaskStatusAction } from "@/app/admin/ops-actions";
import { prisma } from "@/lib/db";
import { CAMPAIGN_ROLE_KEYS, formatRoleLabel } from "@/lib/ops/roles";

export default async function AdminTasksPage() {
  const [tasks, events] = await Promise.all([
    prisma.campaignTask.findMany({
      orderBy: [{ dueAt: "asc" }, { createdAt: "desc" }],
      take: 100,
      include: { event: { select: { id: true, title: true } } },
    }),
    prisma.campaignEvent.findMany({
      orderBy: { startAt: "desc" },
      take: 60,
      select: { id: true, title: true, startAt: true },
    }),
  ]);

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="font-heading text-3xl font-bold text-deep-soil">Tasks</h1>
      <p className="mt-2 font-body text-sm text-deep-soil/75">Internal work items, including workflow-generated tasks.</p>

      <form
        action={createCampaignTaskAction}
        className="mt-8 space-y-3 rounded-card border border-deep-soil/10 bg-cream-canvas p-6 shadow-[var(--shadow-soft)]"
      >
        <h2 className="font-heading text-lg font-bold text-deep-soil">New task</h2>
        <input name="title" required placeholder="Title" className="w-full rounded-md border border-deep-soil/15 bg-white px-3 py-2 text-sm" />
        <textarea name="description" rows={2} placeholder="Description (optional)" className="w-full rounded-md border border-deep-soil/15 bg-white px-3 py-2 text-sm" />
        <label className="block text-sm">
          <span className="text-xs font-semibold uppercase tracking-wider text-deep-soil/55">Link to event (optional)</span>
          <select name="eventId" className="mt-1 w-full rounded-md border border-deep-soil/15 bg-white px-3 py-2 text-sm">
            <option value="">—</option>
            {events.map((e) => (
              <option key={e.id} value={e.id}>
                {e.title} ({e.startAt.toLocaleDateString()})
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm">
          <span className="text-xs font-semibold uppercase tracking-wider text-deep-soil/55">Due (optional)</span>
          <input name="dueAt" type="datetime-local" className="mt-1 w-full rounded-md border border-deep-soil/15 bg-white px-3 py-2 text-sm" />
        </label>
        <button type="submit" className="rounded-btn bg-red-dirt px-5 py-2.5 text-sm font-bold text-cream-canvas">
          Create task
        </button>
      </form>

      <div className="mt-10 overflow-x-auto">
        <table className="w-full min-w-[640px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-deep-soil/15 text-xs uppercase tracking-wider text-deep-soil/55">
              <th className="py-2 pr-2">Task</th>
              <th className="py-2 pr-2">Event</th>
              <th className="py-2 pr-2">Due</th>
              <th className="py-2 pr-2">Comms</th>
              <th className="py-2 pr-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((t) => (
              <tr key={t.id} className="border-b border-deep-soil/10">
                <td className="py-2 pr-2 align-top">
                  <span className="font-medium text-deep-soil">{t.title}</span>
                  {t.assignedRole ? (
                    <span className="ml-1 text-xs text-deep-soil/50">({formatRoleLabel(t.assignedRole)})</span>
                  ) : null}
                </td>
                <td className="py-2 pr-2 align-top text-xs">
                  {t.event ? (
                    <Link href={`/admin/events/${t.event.id}`} className="text-civic-slate hover:underline">
                      {t.event.title}
                    </Link>
                  ) : (
                    "—"
                  )}
                </td>
                <td className="py-2 pr-2 align-top text-xs text-deep-soil/70">{t.dueAt ? t.dueAt.toLocaleString() : "—"}</td>
                <td className="py-2 pr-2 align-top text-xs">
                  <Link
                    href={`/admin/workbench/comms/plans/new?taskId=${t.id}`}
                    className="font-semibold text-civic-slate hover:underline"
                  >
                    New plan
                  </Link>
                </td>
                <td className="py-2 align-top">
                  <form action={updateTaskStatusAction} className="flex flex-col gap-1 sm:flex-row sm:items-center">
                    <input type="hidden" name="id" value={t.id} />
                    <select name="status" defaultValue={t.status} className="rounded-md border border-deep-soil/15 bg-white px-2 py-1 text-xs">
                      {Object.values(CampaignTaskStatus).map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                    <input name="completionNotes" placeholder="notes" className="max-w-[10rem] rounded-md border border-deep-soil/15 px-2 py-1 text-xs" />
                    <button type="submit" className="rounded-md bg-deep-soil px-2 py-1 text-xs font-semibold text-cream-canvas">
                      Update
                    </button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {tasks.length === 0 ? <p className="mt-4 text-sm text-deep-soil/55">No tasks yet.</p> : null}
      </div>

      <p className="mt-6 text-xs text-deep-soil/50">
        Role target keys: {CAMPAIGN_ROLE_KEYS.join(", ")}
      </p>
    </div>
  );
}

