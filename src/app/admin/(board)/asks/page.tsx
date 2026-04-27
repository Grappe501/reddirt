import { VolunteerAskStatus, VolunteerAskType } from "@prisma/client";
import { createVolunteerAskAction, updateVolunteerAskStatusAction } from "@/app/admin/ops-actions";
import { prisma } from "@/lib/db";

export default async function AdminAsksPage() {
  const [asks, events, counties] = await Promise.all([
    prisma.volunteerAsk.findMany({
      orderBy: { updatedAt: "desc" },
      take: 80,
    }),
    prisma.campaignEvent.findMany({
      orderBy: { startAt: "desc" },
      take: 40,
      select: { id: true, title: true },
    }),
    prisma.county.findMany({ orderBy: { sortOrder: "asc" }, select: { id: true, displayName: true } }),
  ]);

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="font-heading text-3xl font-bold text-kelly-text">Volunteer asks</h1>
      <p className="mt-2 font-body text-sm text-kelly-text/75">Outward-facing or volunteer program asks. Track status here.</p>

      <form
        action={createVolunteerAskAction}
        className="mt-8 space-y-3 rounded-card border border-kelly-text/10 bg-kelly-page p-6 shadow-[var(--shadow-soft)]"
      >
        <h2 className="font-heading text-lg font-bold text-kelly-text">New ask</h2>
        <input name="title" required placeholder="Title" className="w-full rounded-md border border-kelly-text/15 bg-white px-3 py-2 text-sm" />
        <textarea name="description" rows={2} placeholder="Description" className="w-full rounded-md border border-kelly-text/15 bg-white px-3 py-2 text-sm" />
        <div className="grid gap-3 md:grid-cols-2">
          <label className="block text-sm">
            <span className="text-xs font-semibold text-kelly-text/55">Type</span>
            <select name="askType" className="mt-1 w-full rounded-md border border-kelly-text/15 bg-white px-3 py-2 text-sm">
              {Object.values(VolunteerAskType).map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm">
            <span className="text-xs font-semibold text-kelly-text/55">Status</span>
            <select name="status" className="mt-1 w-full rounded-md border border-kelly-text/15 bg-white px-3 py-2 text-sm">
              {Object.values(VolunteerAskStatus).map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </label>
        </div>
        <label className="block text-sm">
          <span className="text-xs font-semibold text-kelly-text/55">Event (optional)</span>
          <select name="eventId" className="mt-1 w-full rounded-md border border-kelly-text/15 bg-white px-3 py-2 text-sm">
            <option value="">—</option>
            {events.map((e) => (
              <option key={e.id} value={e.id}>
                {e.title}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm">
          <span className="text-xs font-semibold text-kelly-text/55">County (optional)</span>
          <select name="countyId" className="mt-1 w-full rounded-md border border-kelly-text/15 bg-white px-3 py-2 text-sm">
            <option value="">—</option>
            {counties.map((c) => (
              <option key={c.id} value={c.id}>
                {c.displayName}
              </option>
            ))}
          </select>
        </label>
        <input name="actionUrl" placeholder="Action URL (optional)" className="w-full rounded-md border border-kelly-text/15 bg-white px-3 py-2 text-sm" />
        <button type="submit" className="rounded-btn bg-kelly-navy px-5 py-2.5 text-sm font-bold text-kelly-page">
          Create ask
        </button>
      </form>

      <ul className="mt-10 space-y-3">
        {asks.map((a) => (
          <li key={a.id} className="rounded-lg border border-kelly-text/10 bg-white/80 px-4 py-3">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-heading text-base font-semibold text-kelly-text">{a.title}</p>
                <p className="text-xs text-kelly-text/55">
                  {a.askType} · priority {a.priority}
                </p>
              </div>
              <form action={updateVolunteerAskStatusAction} className="flex items-center gap-2">
                <input type="hidden" name="id" value={a.id} />
                <select name="status" defaultValue={a.status} className="rounded-md border border-kelly-text/15 bg-white px-2 py-1 text-xs">
                  {Object.values(VolunteerAskStatus).map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
                <button type="submit" className="rounded-md bg-kelly-text px-2 py-1 text-xs font-semibold text-kelly-page">
                  Save
                </button>
              </form>
            </div>
          </li>
        ))}
      </ul>
      {asks.length === 0 ? <p className="mt-4 text-sm text-kelly-text/55">No asks yet.</p> : null}
    </div>
  );
}
