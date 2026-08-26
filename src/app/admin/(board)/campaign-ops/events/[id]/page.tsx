import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { getEventPmCommandCenter } from "@/lib/campaign-ops/event-pm-command-center";
import { assignEventProjectManagerAction } from "../actions";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

function fmt(value: Date | null) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("en-US", { timeZone: "America/Chicago", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }).format(value);
}

export default async function EventPmDetailPage({ params }: Props) {
  const { id } = await params;
  const [center, users] = await Promise.all([
    getEventPmCommandCenter(id),
    prisma.user.findMany({ orderBy: [{ name: "asc" }, { email: "asc" }], select: { id: true, name: true, email: true }, take: 300 }),
  ]);
  if (!center) notFound();
  const { event, summary, informationGate, workstreams, tasks } = center;

  return (
    <main className="mx-auto max-w-7xl space-y-8 p-6">
      <header className="space-y-2">
        <p className="text-sm"><Link className="underline" href="/admin/campaign-ops/events">← Event PM Command Center</Link></p>
        <h1 className="text-3xl font-bold">{event.title}</h1>
        <p className="text-slate-600">{fmt(event.startAt)} · {[event.locationName, event.city, event.county?.displayName].filter(Boolean).join(" · ")}</p>
        <div className="flex flex-wrap gap-4 text-sm"><Link className="underline" href={`/admin/events/${event.id}`}>Edit canonical event</Link><Link className="underline" href="/admin/campaign-ops/task-packages">Task Package console</Link></div>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
        <Metric label="Readiness" value={`${summary.percent}%`} />
        <Metric label="Missing info" value={summary.missingInformation} />
        <Metric label="Unclaimed" value={summary.unclaimed} />
        <Metric label="Overdue" value={summary.overdue} />
        <Metric label="Blocked" value={summary.blocked} />
        <Metric label="Waiting review" value={summary.submitted} />
      </section>

      <section className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
        <div className="rounded-xl border p-5">
          <h2 className="text-xl font-semibold">Event Project Manager</h2>
          <p className="mt-1 text-sm text-slate-600">Beta uses the canonical CampaignEvent owner as the Event PM.</p>
          <form action={assignEventProjectManagerAction} className="mt-4 flex gap-2">
            <input type="hidden" name="eventId" value={event.id}/>
            <select className="min-w-0 flex-1 rounded border px-3 py-2 text-sm" name="ownerUserId" defaultValue={event.ownerUserId ?? ""}>
              <option value="">Unassigned</option>
              {users.map((user) => <option key={user.id} value={user.id}>{user.name || user.email}</option>)}
            </select>
            <button className="rounded bg-slate-900 px-4 py-2 text-sm font-semibold text-white" type="submit">Assign</button>
          </form>
          <div className="mt-3 text-sm"><strong>Current:</strong> {event.ownerUser?.name || event.ownerUser?.email || "Unassigned"}</div>
        </div>

        <div className="rounded-xl border p-5">
          <div className="flex items-center justify-between gap-4"><h2 className="text-xl font-semibold">Information Gate</h2><span className="text-sm text-slate-500">{informationGate.filter((item) => item.complete).length}/{informationGate.length} complete</span></div>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">{informationGate.map((item) => <div key={item.key} className={`rounded border p-3 text-sm ${item.complete ? "bg-emerald-50" : "bg-amber-50"}`}><div className="font-semibold">{item.complete ? "✓" : "!"} {item.label}</div>{item.detail ? <div className="mt-1 text-xs text-slate-500">{item.detail}</div> : null}</div>)}</div>
          <p className="mt-4 text-sm"><Link className="underline" href={`/admin/events/${event.id}`}>Fill or correct the canonical event record →</Link></p>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {workstreams.map((stream) => <div className="rounded-xl border p-5" key={stream.workstream}><div className="text-sm font-semibold uppercase tracking-wide text-slate-500">{stream.workstream.replaceAll("_", " ")}</div><div className="mt-2 text-3xl font-bold">{stream.percent}%</div><div className="mt-2 h-2 overflow-hidden rounded bg-slate-200"><div className="h-full bg-slate-800" style={{ width: `${stream.percent}%` }}/></div><div className="mt-2 text-sm text-slate-600">{stream.done}/{stream.total} verified · {stream.blockers} readiness blocker{stream.blockers === 1 ? "" : "s"}</div></div>)}
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Operational task board</h2>
        {(["PROJECT_MANAGEMENT", "COMMUNICATIONS", "EVENT_OPERATIONS"] as const).map((workstream) => {
          const rows = tasks.filter((task) => task.workstream === workstream);
          return <div key={workstream} className="overflow-x-auto rounded-xl border"><div className="border-b bg-slate-50 px-4 py-3 font-semibold">{workstream.replaceAll("_", " ")}</div><table className="w-full min-w-[1000px] text-left text-sm"><thead><tr><th className="p-3">Task</th><th className="p-3">Due</th><th className="p-3">Owner</th><th className="p-3">Package</th><th className="p-3">Dependencies</th><th className="p-3">Flags</th><th className="p-3">Action</th></tr></thead><tbody>{rows.map((task) => <tr className="border-t align-top" key={task.id}><td className="p-3"><div className="font-medium">{task.title}</div><div className="text-xs text-slate-500">{task.assignedRole || "No role"} · {task.priority}</div></td><td className="p-3">{fmt(task.dueAt)}</td><td className="p-3">{task.assignedUserLabel || <span className="text-amber-700">Unclaimed</span>}</td><td className="p-3"><span className="font-semibold">{task.packageState}</span><div className="text-xs text-slate-500">Task: {task.status}</div></td><td className="p-3">{task.dependencyBlockers ? <span className="font-semibold text-amber-700">{task.dependencyBlockers} blocking</span> : task.dependencyTaskIds.length ? "Clear" : "None"}</td><td className="p-3"><div className="flex flex-wrap gap-1">{task.overdue ? <Flag text="OVERDUE"/> : null}{task.unclaimed ? <Flag text="UNCLAIMED"/> : null}{task.submittedForReview ? <Flag text="REVIEW"/> : null}{task.blocksReadiness && task.status !== "DONE" ? <Flag text="READINESS"/> : null}</div></td><td className="p-3"><Link className="underline" href={`/admin/campaign-ops/task-packages/${task.id}`}>Open package</Link></td></tr>)}</tbody></table></div>;
        })}
      </section>

      <section className="rounded-xl border bg-slate-50 p-5 text-sm text-slate-600">
        <strong>PM operating rule:</strong> submitted work is not complete. The readiness score only improves when Task Packages are verified and the canonical CampaignTask reaches DONE.
      </section>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: string | number }) { return <div className="rounded-xl border p-4"><div className="text-3xl font-bold">{value}</div><div className="text-sm text-slate-600">{label}</div></div>; }
function Flag({ text }: { text: string }) { return <span className="rounded bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-900">{text}</span>; }
