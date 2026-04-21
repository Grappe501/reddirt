import Link from "next/link";
import { CommunicationThreadStatus } from "@prisma/client";
import { getWorkbenchData, getCountiesForOpsFilter } from "@/lib/ops/workbench-queries";
import { formatRoleLabel } from "@/lib/ops/roles";
import {
  getCommsWorkbenchData,
  getThreadForWorkbench,
  listRecentThreads,
  formatQueueItemLabel,
} from "@/lib/comms/workbench-data";
import {
  createCommunicationThreadAction,
  markThreadReadAction,
  updateCommunicationThreadAction,
  createScheduledSmsReminderAction,
} from "@/app/admin/workbench-comms-actions";
import { WorkbenchMessageComposer } from "@/components/admin/workbench/WorkbenchMessageComposer";

type Props = {
  searchParams: Promise<{ county?: string; thread?: string; error?: string }>;
};

const card =
  "rounded-md border border-deep-soil/10 bg-cream-canvas px-2 py-1.5 shadow-sm min-w-0";
const h2 = "font-heading text-[10px] font-bold uppercase tracking-wider text-deep-soil/55";
const breakOut = "-mx-6 -mt-10 -mb-10 w-[calc(100%+3rem)] max-w-[calc(100vw-280px-3rem)] min-w-0 px-0 pt-0 pb-6 lg:-mx-12 lg:mt-0 lg:mb-0 lg:w-[calc(100%+6rem)] lg:max-w-none";

export default async function AdminWorkbenchPage({ searchParams }: Props) {
  const sp = await searchParams;
  const countyId = sp.county?.trim() || null;
  const activeThreadId = sp.thread?.trim() || null;
  const err = sp.error;

  const counties = await getCountiesForOpsFilter();
  const [data, comms, activeThread, recentForRail] = await Promise.all([
    getWorkbenchData({ countyId }),
    getCommsWorkbenchData({ countyId }),
    activeThreadId ? getThreadForWorkbench(activeThreadId) : Promise.resolve(null),
    listRecentThreads(countyId, 20),
  ]);

  const seenThread = new Set<string>();
  const combinedRail: {
    id: string;
    label: string;
    sub: string;
    href: string;
    urgent?: boolean;
    selectThreadId: string | null;
  }[] = [];
  for (const q of comms.priorityQueue) {
    const selectThreadId = q.threadId ?? null;
    combinedRail.push({
      id: `q-${q.id}`,
      label: formatQueueItemLabel({
        actionType: q.actionType,
        thread: q.thread
          ? { primaryPhone: q.thread.primaryPhone, primaryEmail: q.thread.primaryEmail }
          : null,
      }),
      sub: String(q.actionType).replaceAll("_", " "),
      href: selectThreadId
        ? `/admin/workbench?thread=${encodeURIComponent(selectThreadId)}${countyId ? `&county=${encodeURIComponent(countyId)}` : ""}`
        : "/admin/workbench",
      urgent: true,
      selectThreadId,
    });
    if (selectThreadId) seenThread.add(selectThreadId);
  }
  for (const t of comms.unreadThreads) {
    if (seenThread.has(t.id)) continue;
    seenThread.add(t.id);
    combinedRail.push({
      id: t.id,
      label: t.primaryPhone ?? t.primaryEmail ?? "Thread",
      sub: t.threadStatus,
      href: `/admin/workbench?thread=${encodeURIComponent(t.id)}${countyId ? `&county=${encodeURIComponent(countyId)}` : ""}`,
      urgent: t.unreadCount > 0,
      selectThreadId: t.id,
    });
  }
  for (const t of recentForRail) {
    if (seenThread.has(t.id)) continue;
    seenThread.add(t.id);
    combinedRail.push({
      id: t.id,
      label: t.primaryPhone ?? t.primaryEmail ?? t.id.slice(0, 8),
      sub: t.threadStatus,
      href: `/admin/workbench?thread=${encodeURIComponent(t.id)}${countyId ? `&county=${encodeURIComponent(countyId)}` : ""}`,
      selectThreadId: t.id,
    });
  }

  const active =
    activeThread && (!countyId || !activeThread.countyId || activeThread.countyId === countyId) ? activeThread : null;
  const canSms = Boolean(active?.primaryPhone);
  const canEmail = Boolean(active?.primaryEmail);
  const defaultMode = canSms ? "SMS" : "EMAIL";

  return (
    <div className={breakOut}>
      <div className="border-b border-deep-soil/10 bg-washed-canvas px-2 py-1.5 md:px-3">
        <div className="flex flex-col gap-1.5 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="font-heading text-lg font-bold text-deep-soil md:text-xl">Campaign workbench</h1>
            <p className="font-body text-[11px] text-deep-soil/65">
              Communications · {new Date().toLocaleString()}. Dense layout for full HD; side rails stack on small screens.
            </p>
          </div>
          <div className="flex flex-wrap gap-0.5">
            <Link
              href="/admin/workbench"
              className={`rounded px-1.5 py-0.5 text-[10px] font-semibold ${!countyId ? "bg-deep-soil text-cream-canvas" : "border border-deep-soil/20 bg-white"}`}
            >
              All
            </Link>
            {counties.map((c) => (
              <Link
                key={c.id}
                href={`/admin/workbench?county=${encodeURIComponent(c.id)}`}
                className={`rounded px-1.5 py-0.5 text-[10px] font-semibold ${
                  countyId === c.id ? "bg-deep-soil text-cream-canvas" : "border border-deep-soil/20 bg-white"
                }`}
              >
                {c.displayName}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {err ? (
        <p className="px-2 py-1 font-body text-xs text-red-800 md:px-3">
          {err === "contact" ? "Add a phone or email to open a new thread." : null}
          {err === "phone" ? "Could not parse phone; use 10 digits or E.164." : null}
        </p>
      ) : null}

      <div className="grid grid-cols-2 gap-1 border-b border-deep-soil/10 bg-cream-canvas/80 px-1 py-1 md:grid-cols-4 lg:grid-cols-8">
        <div className={card}>
          <p className={h2}>Needs reply</p>
          <p className="font-heading text-lg font-bold text-red-dirt">{data.commsSummary.needsReplyCount}</p>
        </div>
        <div className={card}>
          <p className={h2}>Unread threads</p>
          <p className="font-heading text-lg font-bold text-deep-soil">{data.commsSummary.unreadThreadCount}</p>
        </div>
        <div className={card}>
          <p className={h2}>Queue pending</p>
          <p className="font-heading text-lg font-bold text-deep-soil">{data.commsSummary.pendingQueueCount}</p>
        </div>
        <div className={card}>
          <p className={h2}>Msg volume today</p>
          <p className="font-heading text-lg font-bold text-deep-soil">{data.commsSummary.messagesTodayCount}</p>
        </div>
        <div className={card}>
          <p className={h2}>Open tasks</p>
          <p className="font-heading text-lg font-bold text-red-dirt">{data.openTaskCount}</p>
          <Link href="/admin/tasks" className="text-[10px] font-semibold text-washed-denim">
            →
          </Link>
        </div>
        <div className={card}>
          <p className={h2}>Due today</p>
          <p className="font-heading text-lg font-bold text-deep-soil">{data.tasksDueToday.length}</p>
        </div>
        <div className={card}>
          <p className={h2}>Overdue</p>
          <p className="font-heading text-lg font-bold text-red-800">{data.tasksOverdue.length}</p>
        </div>
        <div className={card}>
          <p className={h2}>Media review</p>
          <p className="font-heading text-lg font-bold text-deep-soil">{data.pendingMediaReview.length}</p>
          <Link href="/admin/owned-media?status=PENDING_REVIEW" className="text-[10px] font-semibold text-washed-denim">
            →
          </Link>
        </div>
      </div>

      <div className="grid min-h-[520px] grid-cols-1 divide-y divide-deep-soil/10 border-b border-deep-soil/10 xl:min-h-[calc(100vh-220px)] xl:grid-cols-[minmax(260px,360px)_1fr_minmax(260px,360px)] xl:divide-x xl:divide-y-0">
        <aside className="flex max-h-[50vh] flex-col overflow-hidden bg-cream-canvas/50 xl:max-h-none">
          <div className="border-b border-deep-soil/10 px-2 py-1">
            <p className={h2}>Priority queue + threads</p>
            <p className="mt-0.5 font-body text-[10px] text-deep-soil/55">Queue first, then unread, then recency.</p>
          </div>
          <ul className="min-h-0 flex-1 overflow-y-auto p-1 text-[11px]">
            {combinedRail.length === 0 ? (
              <li className="px-1 text-deep-soil/55">No items yet. Create a thread below.</li>
            ) : (
              combinedRail.map((row) => (
                <li key={row.id}>
                  <Link
                    href={row.href}
                    className={`block rounded border border-transparent px-1 py-0.5 hover:border-deep-soil/15 hover:bg-white/80 ${
                      row.selectThreadId && activeThreadId && row.selectThreadId === activeThreadId
                        ? "border-deep-soil/20 bg-white/90"
                        : ""
                    }`}
                  >
                    <span className={`block truncate font-medium ${row.urgent ? "text-red-dirt" : "text-deep-soil"}`}>
                      {row.label}
                    </span>
                    <span className="text-[9px] text-deep-soil/50">{row.sub}</span>
                  </Link>
                </li>
              ))
            )}
          </ul>
          <div className="border-t border-deep-soil/10 p-1">
            <p className={`${h2} mb-0.5`}>New thread</p>
            <form action={createCommunicationThreadAction} className="grid gap-0.5">
              <input type="hidden" name="countyId" value={countyId ?? ""} />
              <input
                name="primaryPhone"
                placeholder="Phone"
                className="w-full border border-deep-soil/15 bg-white px-1 font-mono text-[10px]"
              />
              <input
                name="primaryEmail"
                type="email"
                placeholder="Email"
                className="w-full border border-deep-soil/15 bg-white px-1 font-mono text-[10px]"
              />
              <select
                name="preferredChannel"
                className="w-full border border-deep-soil/15 bg-white px-0.5 text-[10px]"
                defaultValue="SMS"
              >
                <option value="SMS">SMS</option>
                <option value="EMAIL">Email</option>
              </select>
              <button
                type="submit"
                className="rounded border border-deep-soil/20 bg-deep-soil/90 px-1 py-0.5 text-[10px] font-bold text-cream-canvas"
              >
                Open thread
              </button>
            </form>
          </div>
        </aside>

        <section className="flex min-h-0 min-w-0 flex-col bg-white/40">
          {active ? (
            <>
              <div className="flex flex-wrap items-baseline justify-between gap-1 border-b border-deep-soil/10 px-2 py-1">
                <div>
                  <h2 className="font-heading text-sm font-bold text-deep-soil">Active thread</h2>
                  <p className="font-mono text-[10px] text-deep-soil/70">
                    {active.primaryPhone ?? "—"} · {active.primaryEmail ?? "—"} · {active.id.slice(0, 12)}…
                  </p>
                </div>
                <form action={markThreadReadAction} className="m-0">
                  <input type="hidden" name="threadId" value={active.id} />
                  <button
                    type="submit"
                    className="rounded border border-deep-soil/15 bg-cream-canvas px-1.5 py-0.5 text-[10px] font-semibold"
                  >
                    Mark read
                  </button>
                </form>
              </div>
              <ul className="min-h-0 max-h-[min(50vh,420px)] flex-1 overflow-y-auto border-b border-deep-soil/10 p-1 font-mono text-[10px] leading-relaxed md:max-h-[min(45vh,520px)]">
                {active.messages.map((m) => (
                  <li
                    key={m.id}
                    className={`mb-1 max-w-full whitespace-pre-wrap break-words border-l-2 pl-1 ${
                      m.direction === "INBOUND" ? "border-washed-denim bg-cream-canvas/30" : "border-red-dirt/30 bg-white/50"
                    }`}
                  >
                    <span className="text-deep-soil/45">
                      {m.channel} {m.direction} {m.deliveryStatus}{" "}
                      {m.createdAt.toLocaleString()}
                    </span>
                    {m.subject ? <span className="block font-semibold text-deep-soil/80">Subj: {m.subject}</span> : null}
                    {m.bodyText}
                  </li>
                ))}
              </ul>
              <WorkbenchMessageComposer
                threadId={active.id}
                canSms={canSms}
                canEmail={canEmail}
                defaultMode={defaultMode}
                initialSubject="Following up from the campaign"
              />
            </>
          ) : (
            <div className="p-3 font-body text-xs text-deep-soil/60">
              Select a thread in the left rail, or open a new one. Webhooks:{" "}
              <code className="rounded bg-cream-canvas px-0.5">/api/webhooks/twilio</code>,{" "}
              <code className="rounded bg-cream-canvas px-0.5">/api/webhooks/sendgrid</code>.
            </div>
          )}
        </section>

        <aside className="flex flex-col border-t border-deep-soil/10 bg-cream-canvas/40 xl:border-t-0">
          {active ? (
            <>
              <div className="border-b border-deep-soil/10 px-2 py-1">
                <h3 className="font-heading text-xs font-bold text-deep-soil">Supporter / volunteer context</h3>
              </div>
              <div className="min-h-0 flex-1 space-y-1 overflow-y-auto p-1.5 text-[11px]">
                <p>
                  <span className="text-deep-soil/45">Status:</span> {active.threadStatus} · u/{active.unreadCount} · p/
                  {active.priorityScore}
                </p>
                {active.assignedRoleKey ? (
                  <p>
                    <span className="text-deep-soil/45">Target role:</span> {formatRoleLabel(active.assignedRoleKey)}
                  </p>
                ) : null}
                {active.user ? (
                  <p>
                    <span className="text-deep-soil/45">User:</span> {active.user.name ?? active.user.email}
                  </p>
                ) : null}
                {active.volunteerProfile ? (
                  <p>
                    <span className="text-deep-soil/45">Volunteer:</span>{" "}
                    {active.volunteerProfile.user.name ?? active.volunteerProfile.user.email}
                  </p>
                ) : null}
                {active.county ? (
                  <p>
                    <span className="text-deep-soil/45">County:</span> {active.county.displayName}
                  </p>
                ) : null}
                {active.tagAssignments.length ? (
                  <ul className="mt-0.5 flex flex-wrap gap-0.5">
                    {active.tagAssignments.map((a) => (
                      <li
                        key={a.tagId}
                        className="rounded border border-deep-soil/15 bg-white/80 px-1 py-0.5 text-[9px] font-mono"
                      >
                        {a.tag.label}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-[10px] text-deep-soil/50">No tags (seed CommunicationTag + assign later).</p>
                )}
                <form action={updateCommunicationThreadAction} className="mt-1 space-y-0.5 border-t border-deep-soil/10 pt-1">
                  <input type="hidden" name="threadId" value={active.id} />
                  <label className="block text-[9px] text-deep-soil/45">Thread status</label>
                  <select
                    name="threadStatus"
                    defaultValue={active.threadStatus}
                    className="w-full border border-deep-soil/15 bg-white px-0.5 text-[10px]"
                  >
                    {Object.values(CommunicationThreadStatus).map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                  <label className="mt-0.5 block text-[9px] text-deep-soil/45">Assign role (text key)</label>
                  <input
                    name="assignedRoleKey"
                    defaultValue={active.assignedRoleKey ?? ""}
                    placeholder="e.g. volunteer_coordinator"
                    className="w-full border border-deep-soil/15 bg-white px-0.5 text-[10px]"
                  />
                  <label className="mt-0.5 block text-[9px] text-deep-soil/45">Notes</label>
                  <textarea
                    name="notes"
                    rows={3}
                    defaultValue={active.notes ?? ""}
                    className="w-full border border-deep-soil/15 bg-white p-0.5 text-[10px]"
                  />
                  <button
                    type="submit"
                    className="mt-0.5 rounded border border-deep-soil/20 bg-white px-1 py-0.5 text-[10px] font-bold"
                  >
                    Save
                  </button>
                </form>
                <form action={createScheduledSmsReminderAction} className="mt-1 border-t border-deep-soil/10 pt-1">
                  <p className="text-[9px] font-bold uppercase text-deep-soil/45">Schedule reminder (queue row)</p>
                  <input type="hidden" name="threadId" value={active.id} />
                  <input
                    name="scheduledAt"
                    type="datetime-local"
                    className="mt-0.5 w-full border border-deep-soil/15 bg-white text-[10px]"
                  />
                  <button
                    type="submit"
                    className="mt-0.5 rounded border border-deep-soil/15 bg-cream-canvas px-1 py-0.5 text-[10px] font-semibold"
                  >
                    Add to queue
                  </button>
                </form>
                <div className="border-t border-deep-soil/10 pt-1 text-[9px] text-deep-soil/45">
                  <p className="font-bold uppercase">Ops snapshot (read-only here)</p>
                  <p>Upcoming: {data.upcomingEvents[0]?.title ?? "—"}</p>
                </div>
              </div>
            </>
          ) : (
            <div className="p-2 font-body text-[11px] text-deep-soil/55">Select a thread to see supporter context and notes.</div>
          )}
        </aside>
      </div>

      <div className="mt-0 grid grid-cols-1 gap-1 border-b border-deep-soil/10 bg-cream-canvas/60 px-1 py-1 md:grid-cols-2 lg:grid-cols-3">
        <div className={card}>
          <h2 className="font-heading text-xs font-bold text-deep-soil">Tasks due today</h2>
          <ul className="mt-0.5 max-h-28 overflow-y-auto text-[10px]">
            {data.tasksDueToday.length === 0 ? (
              <li className="text-deep-soil/55">None</li>
            ) : (
              data.tasksDueToday.map((t) => (
                <li key={t.id} className="truncate border-b border-deep-soil/5 py-0.5">
                  {t.title}
                </li>
              ))
            )}
          </ul>
        </div>
        <div className={card}>
          <h2 className="font-heading text-xs font-bold text-deep-soil">Upcoming events</h2>
          <ul className="mt-0.5 max-h-28 overflow-y-auto text-[10px]">
            {data.upcomingEvents.length === 0 ? (
              <li className="text-deep-soil/55">None</li>
            ) : (
              data.upcomingEvents.map((e) => (
                <li key={e.id} className="truncate">
                  <Link href={`/admin/events/${e.id}`} className="text-washed-denim">
                    {e.title}
                  </Link>
                </li>
              ))
            )}
          </ul>
        </div>
        <div className={card}>
          <h2 className="font-heading text-xs font-bold text-deep-soil">Signup intake / media</h2>
          <p className="mt-0.5 text-[10px]">
            Pending rows: {data.pendingSignupIntakeRows} · Media inbox: {data.pendingMediaReview.length}
          </p>
          <div className="mt-0.5 flex flex-wrap gap-1 text-[10px]">
            <Link className="text-washed-denim" href="/admin/volunteers/intake">
              Intake
            </Link>
            <Link className="text-washed-denim" href="/admin/owned-media/batches">
              Batches
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
