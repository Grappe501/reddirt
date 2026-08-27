import Link from "next/link";
import { listEventPmPortfolio } from "@/lib/campaign-ops/event-pm-command-center";

export const dynamic = "force-dynamic";

function fmt(value: Date) {
  return new Intl.DateTimeFormat("en-US", { timeZone: "America/Chicago", month: "short", day: "numeric", weekday: "short" }).format(value);
}

export default async function EventPmPortfolioPage() {
  const events = await listEventPmPortfolio(150);
  const totals = events.reduce((acc, event) => {
    acc.overdue += event.overdue;
    acc.unclaimed += event.unclaimed;
    acc.blocked += event.blocked;
    acc.submitted += event.submitted;
    acc.missingInformation += event.missingInformation;
    return acc;
  }, { overdue: 0, unclaimed: 0, blocked: 0, submitted: 0, missingInformation: 0 });

  return (
    <main className="mx-auto max-w-7xl space-y-8 p-6">
      <header className="space-y-2">
        <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">Campaign Operations · P0-S4</p>
        <h1 className="text-3xl font-bold">Event Project Manager Command Center</h1>
        <p className="max-w-4xl text-slate-600">One cockpit for every launched event. This page answers the campaign manager's question: where are we in danger right now?</p>
        <div className="flex flex-wrap gap-4 text-sm"><Link className="underline" href="/admin/campaign-ops/launch-operations">Launch Operations</Link><Link className="underline" href="/admin/campaign-ops/task-packages">Task Packages</Link><Link className="underline" href="/admin/events">Canonical Events</Link></div>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Card label="Overdue" value={totals.overdue} />
        <Card label="Unclaimed" value={totals.unclaimed} />
        <Card label="Blocked" value={totals.blocked} />
        <Card label="Waiting review" value={totals.submitted} />
        <Card label="Missing info" value={totals.missingInformation} />
      </section>

      <section className="overflow-x-auto rounded-xl border">
        <table className="w-full min-w-[980px] text-left text-sm">
          <thead className="bg-slate-50"><tr><th className="p-3">Event</th><th className="p-3">PM</th><th className="p-3">Readiness</th><th className="p-3">Missing info</th><th className="p-3">Unclaimed</th><th className="p-3">Overdue</th><th className="p-3">Blocked</th><th className="p-3">Review</th></tr></thead>
          <tbody>
            {events.map((event) => (
              <tr key={event.id} className="border-t align-top">
                <td className="p-3"><Link className="font-semibold underline" href={`/admin/campaign-ops/events/${event.id}`}>{event.title}</Link><div className="text-xs text-slate-500">{fmt(event.startAt)}{event.city ? ` · ${event.city}` : ""}</div></td>
                <td className="p-3">{event.pm || <span className="font-semibold text-amber-700">Unassigned</span>}</td>
                <td className="p-3"><div className="font-semibold">{event.percent}%</div><div className="h-2 w-28 overflow-hidden rounded bg-slate-200"><div className="h-full bg-slate-800" style={{ width: `${event.percent}%` }} /></div><div className="mt-1 text-xs text-slate-500">{event.done}/{event.total} verified</div></td>
                <td className="p-3">{event.missingInformation}</td><td className="p-3">{event.unclaimed}</td><td className="p-3">{event.overdue}</td><td className="p-3">{event.blocked}</td><td className="p-3">{event.submitted}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {events.length === 0 ? <p className="p-6 text-sm text-slate-500">No launched event operations yet. Use Launch Operations first.</p> : null}
      </section>
    </main>
  );
}

function Card({ label, value }: { label: string; value: number }) {
  return <div className="rounded-xl border p-4"><div className="text-3xl font-bold">{value}</div><div className="text-sm text-slate-600">{label}</div></div>;
}
