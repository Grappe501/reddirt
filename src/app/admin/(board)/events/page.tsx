import Link from "next/link";
import { CampaignEventStatus, CampaignEventType, CampaignEventVisibility } from "@prisma/client";
import { createCampaignEventAction } from "@/app/admin/ops-actions";
import { prisma } from "@/lib/db";
import { CAMPAIGN_ROLE_KEYS, formatRoleLabel } from "@/lib/ops/roles";

export default async function AdminEventsPage() {
  const [events, counties] = await Promise.all([
    prisma.campaignEvent.findMany({
      orderBy: { startAt: "asc" },
      take: 80,
      include: { county: { select: { displayName: true, slug: true } } },
    }),
    prisma.county.findMany({ orderBy: { sortOrder: "asc" }, select: { id: true, displayName: true } }),
  ]);

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="font-heading text-3xl font-bold text-deep-soil">Events</h1>
      <p className="mt-2 font-body text-sm text-deep-soil/75">
        Create campaign events. Saving runs workflow templates (appearance prep, etc.) for matching types.
      </p>

      <form
        action={createCampaignEventAction}
        className="mt-8 space-y-4 rounded-card border border-deep-soil/10 bg-cream-canvas p-6 shadow-[var(--shadow-soft)]"
      >
        <h2 className="font-heading text-lg font-bold text-deep-soil">New event</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="block text-sm">
            <span className="text-xs font-semibold uppercase tracking-wider text-deep-soil/55">Title</span>
            <input name="title" required className="mt-1 w-full rounded-md border border-deep-soil/15 bg-white px-3 py-2 text-sm" />
          </label>
          <label className="block text-sm">
            <span className="text-xs font-semibold uppercase tracking-wider text-deep-soil/55">Type</span>
            <select name="eventType" className="mt-1 w-full rounded-md border border-deep-soil/15 bg-white px-3 py-2 text-sm">
              {Object.values(CampaignEventType).map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="block text-sm">
            <span className="text-xs font-semibold uppercase tracking-wider text-deep-soil/55">Start (local)</span>
            <input name="startAt" type="datetime-local" required className="mt-1 w-full rounded-md border border-deep-soil/15 bg-white px-3 py-2 text-sm" />
          </label>
          <label className="block text-sm">
            <span className="text-xs font-semibold uppercase tracking-wider text-deep-soil/55">End (local)</span>
            <input name="endAt" type="datetime-local" required className="mt-1 w-full rounded-md border border-deep-soil/15 bg-white px-3 py-2 text-sm" />
          </label>
        </div>
        <label className="block text-sm">
          <span className="text-xs font-semibold uppercase tracking-wider text-deep-soil/55">Description</span>
          <textarea name="description" rows={3} className="mt-1 w-full rounded-md border border-deep-soil/15 bg-white px-3 py-2 text-sm" />
        </label>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="block text-sm">
            <span className="text-xs font-semibold uppercase tracking-wider text-deep-soil/55">County (optional)</span>
            <select name="countyId" className="mt-1 w-full rounded-md border border-deep-soil/15 bg-white px-3 py-2 text-sm">
              <option value="">—</option>
              {counties.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.displayName}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm">
            <span className="text-xs font-semibold uppercase tracking-wider text-deep-soil/55">Location name</span>
            <input name="locationName" className="mt-1 w-full rounded-md border border-deep-soil/15 bg-white px-3 py-2 text-sm" />
          </label>
        </div>
        <label className="block text-sm">
          <span className="text-xs font-semibold uppercase tracking-wider text-deep-soil/55">Address</span>
          <input name="address" className="mt-1 w-full rounded-md border border-deep-soil/15 bg-white px-3 py-2 text-sm" />
        </label>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="block text-sm">
            <span className="text-xs font-semibold uppercase tracking-wider text-deep-soil/55">Visibility</span>
            <select name="visibility" className="mt-1 w-full rounded-md border border-deep-soil/15 bg-white px-3 py-2 text-sm">
              {Object.values(CampaignEventVisibility).map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm">
            <span className="text-xs font-semibold uppercase tracking-wider text-deep-soil/55">Status</span>
            <select name="status" className="mt-1 w-full rounded-md border border-deep-soil/15 bg-white px-3 py-2 text-sm">
              {Object.values(CampaignEventStatus).map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </label>
        </div>
        <p className="text-xs text-deep-soil/50">
          Role keys for templates: {CAMPAIGN_ROLE_KEYS.map((k) => formatRoleLabel(k)).join(" · ")}
        </p>
        <button type="submit" className="rounded-btn bg-red-dirt px-5 py-2.5 text-sm font-bold text-cream-canvas">
          Create event
        </button>
      </form>

      <div className="mt-10">
        <h2 className="font-heading text-xl font-bold text-deep-soil">Upcoming & recent ({events.length})</h2>
        <ul className="mt-4 space-y-2">
          {events.map((e) => (
            <li key={e.id} className="rounded-lg border border-deep-soil/10 bg-white/80 px-4 py-3">
              <Link href={`/admin/events/${e.id}`} className="font-heading text-base font-semibold text-civic-slate hover:underline">
                {e.title}
              </Link>
              <p className="mt-1 text-xs text-deep-soil/60">
                {e.eventType} · {e.status} · {e.startAt.toLocaleString()}
                {e.county ? ` · ${e.county.displayName}` : ""}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

