import Link from "next/link";
import { CampaignEventStatus, CampaignEventType, CampaignEventVisibility } from "@prisma/client";
import { createCampaignEventAction } from "@/app/admin/ops-actions";
import { countPendingPublicFormFestivalIngests } from "@/lib/festivals/admin-queries";
import { prisma } from "@/lib/db";
import { CAMPAIGN_ROLE_KEYS, formatRoleLabel } from "@/lib/ops/roles";

export default async function AdminEventsPage() {
  const [events, counties, publicSuggestPending] = await Promise.all([
    prisma.campaignEvent.findMany({
      orderBy: { startAt: "asc" },
      take: 80,
      include: { county: { select: { displayName: true, slug: true } } },
    }),
    prisma.county.findMany({ orderBy: { sortOrder: "asc" }, select: { id: true, displayName: true } }),
    countPendingPublicFormFestivalIngests().catch(() => 0),
  ]);

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="font-heading text-3xl font-bold text-kelly-text">Events</h1>
      <p className="mt-2 font-body text-sm text-kelly-text/75">
        Create campaign events. Saving runs workflow templates (appearance prep, etc.) for matching types.
      </p>

      {publicSuggestPending > 0 ? (
        <div className="mt-5 rounded-md border border-amber-200 bg-amber-50/80 px-4 py-3 font-body text-sm text-amber-950">
          <p className="font-semibold">
            {publicSuggestPending} public event suggestion{publicSuggestPending === 1 ? "" : "s"} to review
          </p>
          <p className="mt-1 text-amber-900/90">
            From the Movement /events “Suggest a fair or festival” form. Approve to show on the site-wide community feed
            and campaign trail.
          </p>
          <p className="mt-2">
            <Link href="/admin/events/community-suggestions" className="font-bold text-red-900 underline">
              Open public suggestions queue →
            </Link>
          </p>
        </div>
      ) : (
        <p className="mt-4 text-xs text-kelly-text/50">
          <Link href="/admin/events/community-suggestions" className="text-kelly-slate underline">
            Public event suggestions
          </Link>{" "}
          (Movement /events form)
        </p>
      )}

      <form
        action={createCampaignEventAction}
        className="mt-8 space-y-4 rounded-card border border-kelly-text/10 bg-kelly-page p-6 shadow-[var(--shadow-soft)]"
      >
        <h2 className="font-heading text-lg font-bold text-kelly-text">New event</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="block text-sm">
            <span className="text-xs font-semibold uppercase tracking-wider text-kelly-text/55">Title</span>
            <input name="title" required className="mt-1 w-full rounded-md border border-kelly-text/15 bg-white px-3 py-2 text-sm" />
          </label>
          <label className="block text-sm">
            <span className="text-xs font-semibold uppercase tracking-wider text-kelly-text/55">Type</span>
            <select name="eventType" className="mt-1 w-full rounded-md border border-kelly-text/15 bg-white px-3 py-2 text-sm">
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
            <span className="text-xs font-semibold uppercase tracking-wider text-kelly-text/55">Start (local)</span>
            <input name="startAt" type="datetime-local" required className="mt-1 w-full rounded-md border border-kelly-text/15 bg-white px-3 py-2 text-sm" />
          </label>
          <label className="block text-sm">
            <span className="text-xs font-semibold uppercase tracking-wider text-kelly-text/55">End (local)</span>
            <input name="endAt" type="datetime-local" required className="mt-1 w-full rounded-md border border-kelly-text/15 bg-white px-3 py-2 text-sm" />
          </label>
        </div>
        <label className="block text-sm">
          <span className="text-xs font-semibold uppercase tracking-wider text-kelly-text/55">Description</span>
          <textarea name="description" rows={3} className="mt-1 w-full rounded-md border border-kelly-text/15 bg-white px-3 py-2 text-sm" />
        </label>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="block text-sm">
            <span className="text-xs font-semibold uppercase tracking-wider text-kelly-text/55">County (optional)</span>
            <select name="countyId" className="mt-1 w-full rounded-md border border-kelly-text/15 bg-white px-3 py-2 text-sm">
              <option value="">—</option>
              {counties.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.displayName}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm">
            <span className="text-xs font-semibold uppercase tracking-wider text-kelly-text/55">Location name</span>
            <input name="locationName" className="mt-1 w-full rounded-md border border-kelly-text/15 bg-white px-3 py-2 text-sm" />
          </label>
        </div>
        <label className="block text-sm">
          <span className="text-xs font-semibold uppercase tracking-wider text-kelly-text/55">Address</span>
          <input name="address" className="mt-1 w-full rounded-md border border-kelly-text/15 bg-white px-3 py-2 text-sm" />
        </label>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="block text-sm">
            <span className="text-xs font-semibold uppercase tracking-wider text-kelly-text/55">Visibility</span>
            <select name="visibility" className="mt-1 w-full rounded-md border border-kelly-text/15 bg-white px-3 py-2 text-sm">
              {Object.values(CampaignEventVisibility).map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm">
            <span className="text-xs font-semibold uppercase tracking-wider text-kelly-text/55">Status</span>
            <select name="status" className="mt-1 w-full rounded-md border border-kelly-text/15 bg-white px-3 py-2 text-sm">
              {Object.values(CampaignEventStatus).map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </label>
        </div>
        <p className="text-xs text-kelly-text/50">
          Role keys for templates: {CAMPAIGN_ROLE_KEYS.map((k) => formatRoleLabel(k)).join(" · ")}
        </p>
        <button type="submit" className="rounded-btn bg-kelly-navy px-5 py-2.5 text-sm font-bold text-kelly-page">
          Create event
        </button>
      </form>

      <div className="mt-10">
        <h2 className="font-heading text-xl font-bold text-kelly-text">Upcoming & recent ({events.length})</h2>
        <ul className="mt-4 space-y-2">
          {events.map((e) => (
            <li key={e.id} className="rounded-lg border border-kelly-text/10 bg-white/80 px-4 py-3">
              <Link href={`/admin/events/${e.id}`} className="font-heading text-base font-semibold text-kelly-slate hover:underline">
                {e.title}
              </Link>
              <p className="mt-1 text-xs text-kelly-text/60">
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

