import Link from "next/link";
import { notFound } from "next/navigation";
import { CampaignEventStatus, CampaignEventType, CampaignEventVisibility } from "@prisma/client";
import { createEventSignupAction, updateCampaignEventAction } from "@/app/admin/ops-actions";
import { prisma } from "@/lib/db";

type Props = { params: Promise<{ id: string }> };

export default async function AdminEventDetailPage({ params }: Props) {
  const { id } = await params;
  const event = await prisma.campaignEvent.findUnique({
    where: { id },
    include: {
      county: { select: { id: true, displayName: true } },
      tasks: { orderBy: { dueAt: "asc" }, take: 40 },
      signups: { orderBy: { createdAt: "desc" }, take: 20 },
    },
  });
  if (!event) notFound();

  const taskRunLinks = await prisma.campaignTask.findMany({
    where: { eventId: id, workflowRunId: { not: null } },
    select: { workflowRunId: true },
  });
  const runIds = [...new Set(taskRunLinks.map((t) => t.workflowRunId).filter(Boolean))] as string[];
  const workflowRuns = await prisma.workflowRun.findMany({
    where: { id: { in: runIds } },
    include: { workflowTemplate: { select: { key: true, title: true } } },
    orderBy: { startedAt: "desc" },
  });

  const counties = await prisma.county.findMany({ orderBy: { sortOrder: "asc" }, select: { id: true, displayName: true } });

  const startLocal = toInputDateTime(event.startAt);
  const endLocal = toInputDateTime(event.endAt);

  return (
    <div className="mx-auto max-w-4xl">
      <p className="font-body text-xs text-deep-soil/55">
        <Link href="/admin/events" className="text-civic-slate hover:underline">
          ← Events
        </Link>
      </p>
      <h1 className="mt-2 font-heading text-3xl font-bold text-deep-soil">{event.title}</h1>
      <p className="mt-1 font-mono text-xs text-deep-soil/45">{event.slug}</p>

      <form
        action={updateCampaignEventAction}
        className="mt-8 space-y-4 rounded-card border border-deep-soil/10 bg-cream-canvas p-6 shadow-[var(--shadow-soft)]"
      >
        <input type="hidden" name="id" value={event.id} />
        <h2 className="font-heading text-lg font-bold text-deep-soil">Edit event</h2>
        <label className="block text-sm">
          <span className="text-xs font-semibold uppercase tracking-wider text-deep-soil/55">Title</span>
          <input name="title" defaultValue={event.title} required className="mt-1 w-full rounded-md border border-deep-soil/15 bg-white px-3 py-2 text-sm" />
        </label>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="block text-sm">
            <span className="text-xs font-semibold uppercase tracking-wider text-deep-soil/55">Type</span>
            <select name="eventType" defaultValue={event.eventType} className="mt-1 w-full rounded-md border border-deep-soil/15 bg-white px-3 py-2 text-sm">
              {Object.values(CampaignEventType).map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm">
            <span className="text-xs font-semibold uppercase tracking-wider text-deep-soil/55">County</span>
            <select name="countyId" defaultValue={event.countyId ?? ""} className="mt-1 w-full rounded-md border border-deep-soil/15 bg-white px-3 py-2 text-sm">
              <option value="">—</option>
              {counties.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.displayName}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="block text-sm">
            <span className="text-xs font-semibold uppercase tracking-wider text-deep-soil/55">Start</span>
            <input name="startAt" type="datetime-local" defaultValue={startLocal} required className="mt-1 w-full rounded-md border border-deep-soil/15 bg-white px-3 py-2 text-sm" />
          </label>
          <label className="block text-sm">
            <span className="text-xs font-semibold uppercase tracking-wider text-deep-soil/55">End</span>
            <input name="endAt" type="datetime-local" defaultValue={endLocal} required className="mt-1 w-full rounded-md border border-deep-soil/15 bg-white px-3 py-2 text-sm" />
          </label>
        </div>
        <label className="block text-sm">
          <span className="text-xs font-semibold uppercase tracking-wider text-deep-soil/55">Description</span>
          <textarea name="description" rows={3} defaultValue={event.description ?? ""} className="mt-1 w-full rounded-md border border-deep-soil/15 bg-white px-3 py-2 text-sm" />
        </label>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="block text-sm">
            <span className="text-xs font-semibold uppercase tracking-wider text-deep-soil/55">Location</span>
            <input name="locationName" defaultValue={event.locationName ?? ""} className="mt-1 w-full rounded-md border border-deep-soil/15 bg-white px-3 py-2 text-sm" />
          </label>
          <label className="block text-sm">
            <span className="text-xs font-semibold uppercase tracking-wider text-deep-soil/55">Address</span>
            <input name="address" defaultValue={event.address ?? ""} className="mt-1 w-full rounded-md border border-deep-soil/15 bg-white px-3 py-2 text-sm" />
          </label>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="block text-sm">
            <span className="text-xs font-semibold uppercase tracking-wider text-deep-soil/55">Visibility</span>
            <select name="visibility" defaultValue={event.visibility} className="mt-1 w-full rounded-md border border-deep-soil/15 bg-white px-3 py-2 text-sm">
              {Object.values(CampaignEventVisibility).map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm">
            <span className="text-xs font-semibold uppercase tracking-wider text-deep-soil/55">Status</span>
            <select name="status" defaultValue={event.status} className="mt-1 w-full rounded-md border border-deep-soil/15 bg-white px-3 py-2 text-sm">
              {Object.values(CampaignEventStatus).map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </label>
        </div>
        <label className="block text-sm">
          <span className="text-xs font-semibold uppercase tracking-wider text-deep-soil/55">Notes (internal)</span>
          <textarea name="notes" rows={2} defaultValue={event.notes ?? ""} className="mt-1 w-full rounded-md border border-deep-soil/15 bg-white px-3 py-2 text-sm" />
        </label>
        <button type="submit" className="rounded-btn bg-red-dirt px-5 py-2.5 text-sm font-bold text-cream-canvas">
          Save changes
        </button>
      </form>

      <section className="mt-10 rounded-card border border-deep-soil/10 bg-cream-canvas p-6">
        <h2 className="font-heading text-lg font-bold text-deep-soil">Tasks for this event</h2>
        <ul className="mt-3 space-y-2 text-sm">
          {event.tasks.length === 0 ? (
            <li className="text-deep-soil/55">No tasks yet (workflows create them on create/signup).</li>
          ) : (
            event.tasks.map((t) => (
              <li key={t.id} className="rounded-md border border-deep-soil/10 bg-white/70 px-3 py-2">
                <span className="font-medium">{t.title}</span>
                <span className="ml-2 text-xs text-deep-soil/55">
                  {t.status} {t.dueAt ? `· due ${t.dueAt.toLocaleString()}` : ""}
                </span>
              </li>
            ))
          )}
        </ul>
      </section>

      <section className="mt-8 rounded-card border border-deep-soil/10 bg-cream-canvas p-6">
        <h2 className="font-heading text-lg font-bold text-deep-soil">Workflow history</h2>
        <ul className="mt-3 space-y-2 text-sm">
          {workflowRuns.length === 0 ? (
            <li className="text-deep-soil/55">No workflow runs linked yet.</li>
          ) : (
            workflowRuns.map((r) => (
              <li key={r.id} className="font-mono text-xs">
                {r.workflowTemplate.key} · {r.triggerType} · {r.status} · {r.startedAt.toLocaleString()}
              </li>
            ))
          )}
        </ul>
      </section>

      <section className="mt-8 rounded-card border border-deep-soil/10 bg-cream-canvas p-6">
        <h2 className="font-heading text-lg font-bold text-deep-soil">Signups</h2>
        <ul className="mt-3 space-y-2 text-sm">
          {event.signups.map((s) => (
            <li key={s.id} className="rounded-md border border-deep-soil/10 bg-white/70 px-3 py-2">
              {s.firstName} {s.lastName} · {s.email} · {s.status}
            </li>
          ))}
        </ul>

        <form action={createEventSignupAction} className="mt-6 space-y-3 border-t border-deep-soil/10 pt-6">
          <input type="hidden" name="eventId" value={event.id} />
          <h3 className="font-heading text-base font-bold text-deep-soil">Add signup</h3>
          <div className="grid gap-3 md:grid-cols-2">
            <input name="firstName" required placeholder="First name" className="rounded-md border border-deep-soil/15 bg-white px-3 py-2 text-sm" />
            <input name="lastName" required placeholder="Last name" className="rounded-md border border-deep-soil/15 bg-white px-3 py-2 text-sm" />
          </div>
          <input name="email" type="email" required placeholder="Email" className="w-full rounded-md border border-deep-soil/15 bg-white px-3 py-2 text-sm" />
          <input name="mobilePhone" placeholder="Mobile (optional)" className="w-full rounded-md border border-deep-soil/15 bg-white px-3 py-2 text-sm" />
          <button type="submit" className="rounded-btn border border-deep-soil/20 bg-white px-4 py-2 text-sm font-semibold text-deep-soil">
            Add signup (runs signup workflow)
          </button>
        </form>
      </section>
    </div>
  );
}

function toInputDateTime(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
