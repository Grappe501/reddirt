import Link from "next/link";
import { notFound } from "next/navigation";
import { CampaignEventAttendanceType, CampaignEventPurpose, CampaignEventStatus, CampaignEventType, CampaignEventVisibility } from "@prisma/client";
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
      <p className="font-body text-xs text-kelly-muted">
        <Link href="/admin/events" className="text-kelly-slate hover:underline">
          ← Events
        </Link>
      </p>
      <h1 className="mt-2 font-heading text-3xl font-bold text-kelly-text">{event.title}</h1>
      <p className="mt-1 font-mono text-xs text-kelly-subtle">{event.slug}</p>

      <p className="mt-3">
        <Link
          href={`/admin/workbench/comms/plans/new?eventId=${event.id}`}
          className="inline-flex rounded border border-kelly-slate/30 bg-kelly-slate/5 px-3 py-1.5 text-sm font-bold text-kelly-slate hover:bg-kelly-slate/10"
        >
          Create comms plan from this event
        </Link>
        <span className="ml-2 font-body text-xs text-kelly-subtle">
          Pre-fills a CommunicationPlan with this event as provenance.
        </span>
      </p>

      <form
        action={updateCampaignEventAction}
        className="mt-8 space-y-4 rounded-card border border-kelly-text/10 bg-kelly-page p-6 shadow-[var(--shadow-soft)]"
      >
        <input type="hidden" name="id" value={event.id} />
        <h2 className="font-heading text-lg font-bold text-kelly-text">Edit event</h2>
        <label className="block text-sm">
          <span className="text-xs font-semibold uppercase tracking-wider text-kelly-muted">Title</span>
          <input name="title" defaultValue={event.title} required className="mt-1 w-full rounded-md border border-kelly-text/15 bg-white px-3 py-2 text-sm" />
        </label>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="block text-sm">
            <span className="text-xs font-semibold uppercase tracking-wider text-kelly-muted">Type</span>
            <select name="eventType" defaultValue={event.eventType} className="mt-1 w-full rounded-md border border-kelly-text/15 bg-white px-3 py-2 text-sm">
              {Object.values(CampaignEventType).map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm">
            <span className="text-xs font-semibold uppercase tracking-wider text-kelly-muted">County</span>
            <select name="countyId" defaultValue={event.countyId ?? ""} className="mt-1 w-full rounded-md border border-kelly-text/15 bg-white px-3 py-2 text-sm">
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
            <span className="text-xs font-semibold uppercase tracking-wider text-kelly-muted">Start</span>
            <input name="startAt" type="datetime-local" defaultValue={startLocal} required className="mt-1 w-full rounded-md border border-kelly-text/15 bg-white px-3 py-2 text-sm" />
          </label>
          <label className="block text-sm">
            <span className="text-xs font-semibold uppercase tracking-wider text-kelly-muted">End</span>
            <input name="endAt" type="datetime-local" defaultValue={endLocal} required className="mt-1 w-full rounded-md border border-kelly-text/15 bg-white px-3 py-2 text-sm" />
          </label>
        </div>
        <label className="block text-sm">
          <span className="text-xs font-semibold uppercase tracking-wider text-kelly-muted">Description</span>
          <textarea name="description" rows={3} defaultValue={event.description ?? ""} className="mt-1 w-full rounded-md border border-kelly-text/15 bg-white px-3 py-2 text-sm" />
        </label>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="block text-sm">
            <span className="text-xs font-semibold uppercase tracking-wider text-kelly-muted">Location</span>
            <input name="locationName" defaultValue={event.locationName ?? ""} className="mt-1 w-full rounded-md border border-kelly-text/15 bg-white px-3 py-2 text-sm" />
          </label>
          <label className="block text-sm">
            <span className="text-xs font-semibold uppercase tracking-wider text-kelly-muted">City / town (public)</span>
            <input name="city" defaultValue={event.city ?? ""} className="mt-1 w-full rounded-md border border-kelly-text/15 bg-white px-3 py-2 text-sm" />
          </label>
        </div>
        <label className="block text-sm">
          <span className="text-xs font-semibold uppercase tracking-wider text-kelly-muted">Address</span>
          <input name="address" defaultValue={event.address ?? ""} className="mt-1 w-full rounded-md border border-kelly-text/15 bg-white px-3 py-2 text-sm" />
        </label>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="block text-sm">
            <span className="text-xs font-semibold uppercase tracking-wider text-kelly-muted">Attendance (public copy)</span>
            <select name="attendanceType" defaultValue={event.attendanceType} className="mt-1 w-full rounded-md border border-kelly-text/15 bg-white px-3 py-2 text-sm">
              {Object.values(CampaignEventAttendanceType).map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm">
            <span className="text-xs font-semibold uppercase tracking-wider text-kelly-muted">Visibility</span>
            <select name="visibility" defaultValue={event.visibility} className="mt-1 w-full rounded-md border border-kelly-text/15 bg-white px-3 py-2 text-sm">
              {Object.values(CampaignEventVisibility).map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
          </label>
        </div>
        <fieldset className="rounded-md border border-kelly-text/10 p-4">
          <legend className="px-1 text-xs font-semibold uppercase tracking-wider text-kelly-muted">
            Campaign purposes (internal — never public)
          </legend>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            {Object.values(CampaignEventPurpose).map((p) => (
              <label key={p} className="flex items-center gap-2 text-sm text-kelly-text">
                <input
                  type="checkbox"
                  name="campaignPurposes"
                  value={p}
                  defaultChecked={event.campaignPurposes.includes(p)}
                />
                {p.replaceAll("_", " ")}
              </label>
            ))}
          </div>
        </fieldset>
        <div className="space-y-2 rounded-md border border-kelly-text/10 p-4">
          <label className="flex items-center gap-2 text-sm text-kelly-text">
            <input type="checkbox" name="isTravelLeg" value="1" defaultChecked={event.isTravelLeg} />
            Travel / repositioning leg (never public; not a visited-county appearance)
          </label>
          <label className="flex items-center gap-2 text-sm text-kelly-text">
            <input type="checkbox" name="isPublicOnWebsite" value="1" defaultChecked={event.isPublicOnWebsite} />
            Show on public website (also requires PUBLISHED workflow in Calendar HQ)
          </label>
          <p className="text-xs text-kelly-subtle">
            TENTATIVE, DRAFT, CANCELLED, and travel legs are forced off the public site even if this box is checked.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="block text-sm">
            <span className="text-xs font-semibold uppercase tracking-wider text-kelly-muted">Status</span>
            <select name="status" defaultValue={event.status} className="mt-1 w-full rounded-md border border-kelly-text/15 bg-white px-3 py-2 text-sm">
              {Object.values(CampaignEventStatus).map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </label>
        </div>
        <label className="block text-sm">
          <span className="text-xs font-semibold uppercase tracking-wider text-kelly-muted">Notes (internal)</span>
          <textarea name="notes" rows={2} defaultValue={event.notes ?? ""} className="mt-1 w-full rounded-md border border-kelly-text/15 bg-white px-3 py-2 text-sm" />
        </label>
        <button type="submit" className="rounded-btn bg-kelly-navy px-5 py-2.5 text-sm font-bold text-kelly-page">
          Save changes
        </button>
      </form>

      <section className="mt-10 rounded-card border border-kelly-text/10 bg-kelly-page p-6">
        <h2 className="font-heading text-lg font-bold text-kelly-text">Tasks for this event</h2>
        <ul className="mt-3 space-y-2 text-sm">
          {event.tasks.length === 0 ? (
            <li className="text-kelly-muted">No tasks yet (workflows create them on create/signup).</li>
          ) : (
            event.tasks.map((t) => (
              <li key={t.id} className="rounded-md border border-kelly-text/10 bg-white/70 px-3 py-2">
                <span className="font-medium">{t.title}</span>
                <span className="ml-2 text-xs text-kelly-muted">
                  {t.status} {t.dueAt ? `· due ${t.dueAt.toLocaleString()}` : ""}
                </span>
              </li>
            ))
          )}
        </ul>
      </section>

      <section className="mt-8 rounded-card border border-kelly-text/10 bg-kelly-page p-6">
        <h2 className="font-heading text-lg font-bold text-kelly-text">Workflow history</h2>
        <ul className="mt-3 space-y-2 text-sm">
          {workflowRuns.length === 0 ? (
            <li className="text-kelly-muted">No workflow runs linked yet.</li>
          ) : (
            workflowRuns.map((r) => (
              <li key={r.id} className="font-mono text-xs">
                {r.workflowTemplate.key} · {r.triggerType} · {r.status} · {r.startedAt.toLocaleString()}
              </li>
            ))
          )}
        </ul>
      </section>

      <section className="mt-8 rounded-card border border-kelly-text/10 bg-kelly-page p-6">
        <h2 className="font-heading text-lg font-bold text-kelly-text">Signups</h2>
        <ul className="mt-3 space-y-2 text-sm">
          {event.signups.map((s) => (
            <li key={s.id} className="rounded-md border border-kelly-text/10 bg-white/70 px-3 py-2">
              {s.firstName} {s.lastName} · {s.email} · {s.status}
            </li>
          ))}
        </ul>

        <form action={createEventSignupAction} className="mt-6 space-y-3 border-t border-kelly-text/10 pt-6">
          <input type="hidden" name="eventId" value={event.id} />
          <h3 className="font-heading text-base font-bold text-kelly-text">Add signup</h3>
          <div className="grid gap-3 md:grid-cols-2">
            <input name="firstName" required placeholder="First name" className="rounded-md border border-kelly-text/15 bg-white px-3 py-2 text-sm" />
            <input name="lastName" required placeholder="Last name" className="rounded-md border border-kelly-text/15 bg-white px-3 py-2 text-sm" />
          </div>
          <input name="email" type="email" required placeholder="Email" className="w-full rounded-md border border-kelly-text/15 bg-white px-3 py-2 text-sm" />
          <input name="mobilePhone" placeholder="Mobile (optional)" className="w-full rounded-md border border-kelly-text/15 bg-white px-3 py-2 text-sm" />
          <button type="submit" className="rounded-btn border border-kelly-text/20 bg-white px-4 py-2 text-sm font-semibold text-kelly-text">
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
