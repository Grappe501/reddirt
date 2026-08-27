import Link from "next/link";
import { prisma } from "@/lib/db";
import { launchEventOperationsAction } from "./actions";
import { launchOperationsBlueprintSummary, listLaunchableEvents } from "@/lib/campaign-ops/launch-operations";

export const dynamic = "force-dynamic";

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("en-US", { timeZone: "America/Chicago", weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }).format(value);
}

export default async function LaunchOperationsPage() {
  const [events, blueprint, users] = await Promise.all([
    listLaunchableEvents(150),
    Promise.resolve(launchOperationsBlueprintSummary()),
    prisma.user.findMany({ orderBy: [{ name: "asc" }, { email: "asc" }], select: { id: true, name: true, email: true }, take: 200 }),
  ]);
  const launched = events.filter((event) => event.operationsLaunched).length;
  const complete = events.filter((event) => event.operationsComplete).length;

  return (
    <main className="mx-auto max-w-7xl space-y-8 p-6">
      <header className="space-y-2">
        <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">Campaign Operations · P0-S3</p>
        <h1 className="text-3xl font-bold">Launch Operations</h1>
        <p className="max-w-4xl text-slate-600">Promote an existing canonical CampaignEvent into the volunteer operating system. Launching creates fresh, claimable Task Packages for Project Management, Communications and Event Operations. Running it again is safe: existing blueprint tasks are not duplicated.</p>
        <div className="flex flex-wrap gap-4 text-sm"><Link className="underline" href="/admin/campaign-ops/events">Event PM Command Center</Link><Link className="underline" href="/admin/campaign-ops/task-packages">Task Package console</Link><Link className="underline" href="/admin/tasks">All campaign tasks</Link></div>
      </header>

      <section className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border p-4"><div className="text-3xl font-bold">{events.length}</div><div className="text-sm text-slate-600">Upcoming campaign events</div></div>
        <div className="rounded-xl border p-4"><div className="text-3xl font-bold">{launched}</div><div className="text-sm text-slate-600">Operations started</div></div>
        <div className="rounded-xl border p-4"><div className="text-3xl font-bold">{complete}</div><div className="text-sm text-slate-600">Full beta package generated</div></div>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Upcoming events</h2>
        <div className="overflow-x-auto rounded-xl border">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50"><tr><th className="p-3">Event</th><th className="p-3">When</th><th className="p-3">Place</th><th className="p-3">Operations</th><th className="p-3">Action</th></tr></thead>
            <tbody>
              {events.map((event) => (
                <tr className="border-t align-top" key={event.id}>
                  <td className="p-3 font-medium">{event.operationsLaunched ? <Link className="underline" href={`/admin/campaign-ops/events/${event.id}`}>{event.title}</Link> : event.title}</td>
                  <td className="p-3 whitespace-nowrap">{formatDate(event.startAt)}</td>
                  <td className="p-3">{[event.locationName, event.city].filter(Boolean).join(" · ") || "—"}</td>
                  <td className="p-3"><div className="font-semibold">{event.operationsTaskCount}/{event.expectedOperationsTaskCount} tasks</div><div className="text-xs text-slate-500">{event.operationsComplete ? "Package ready" : event.operationsLaunched ? "Partial — launch again to fill missing tasks" : "Not launched"}</div></td>
                  <td className="p-3">
                    {!event.operationsComplete ? <form action={launchEventOperationsAction}><input type="hidden" name="eventId" value={event.id}/><button className="rounded bg-slate-900 px-3 py-2 font-semibold text-white" type="submit">{event.operationsLaunched ? "Fill missing tasks" : "Launch operations"}</button></form> : <Link className="font-semibold text-emerald-700 underline" href={`/admin/campaign-ops/events/${event.id}`}>Open cockpit</Link>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Beta package generated for every event</h2>
        <p className="text-sm text-slate-600">This is intentionally dense. Beta usage will tell us what to deepen, combine or retire.</p>
        <div className="grid gap-4 lg:grid-cols-3">
          {(["PROJECT_MANAGEMENT", "COMMUNICATIONS", "EVENT_OPERATIONS"] as const).map((workstream) => (
            <div className="rounded-xl border p-4" key={workstream}>
              <h3 className="mb-3 font-bold">{workstream.replaceAll("_", " ")}</h3>
              <ol className="space-y-2 text-sm">{blueprint.filter((item) => item.workstream === workstream).map((item) => <li key={item.key}><div className="font-medium">{item.title}</div><div className="text-xs text-slate-500">{item.assignedRole} · {item.daysBefore >= 0 ? `T-${item.daysBefore}` : `T+${Math.abs(item.daysBefore)}`}{item.blocksReadiness ? " · readiness blocker" : ""}</div></li>)}</ol>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-xl border bg-slate-50 p-4 text-sm text-slate-600">
        <strong>Safety:</strong> Launch Operations creates internal CampaignTask/Task Package records only. It does not publish the event, send email or SMS, post to social media, spend advertising dollars, or change the public events page. Existing campaign approval/send rails remain authoritative.
        <span className="sr-only">{users.length} campaign users available for downstream assignment.</span>
      </section>
    </main>
  );
}
