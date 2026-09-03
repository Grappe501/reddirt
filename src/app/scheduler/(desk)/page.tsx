import Link from "next/link";
import { loadSchedulerQueue, type SchedulerQueueTab } from "@/lib/scheduler/load-queue";

function tabFromQuery(raw: string | undefined): SchedulerQueueTab {
  if (raw === "live" || raw === "needs_info") return raw;
  return "needs_publish";
}

export default async function SchedulerQueuePage({
  searchParams,
}: {
  searchParams?: Promise<{ tab?: string }>;
}) {
  const sp = (await searchParams) ?? {};
  const tab = tabFromQuery(sp.tab);
  const rows = await loadSchedulerQueue(tab);

  return (
    <section className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-kelly-text">Event queue</h1>
        <p className="mt-2 max-w-2xl font-body text-sm text-kelly-text/75">
          Edit fields, then publish. OSCAR prefills from email or a flyer — nothing goes live until you publish.
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        {(
          [
            ["needs_publish", "Needs publish"],
            ["live", "Live"],
            ["needs_info", "Needs more info"],
          ] as const
        ).map(([id, label]) => (
          <Link
            key={id}
            href={id === "needs_publish" ? "/scheduler" : `/scheduler?tab=${id}`}
            className={`rounded-full border px-3 py-1.5 font-body text-sm font-semibold ${
              tab === id ? "border-kelly-navy bg-kelly-navy text-white" : "border-kelly-navy/20 bg-white"
            }`}
          >
            {label}
          </Link>
        ))}
      </div>
      {rows.length === 0 ? (
        <p className="rounded-card border border-dashed border-kelly-text/20 px-4 py-6 font-body text-sm text-kelly-text/70">
          Nothing in this queue. Open the OSCAR inbox to add a stop from an email or flyer.
        </p>
      ) : (
        <ul className="space-y-3">
          {rows.map((row) => (
            <li key={row.id}>
              <Link
                href={`/scheduler/events/${row.id}`}
                className="block rounded-card border border-kelly-navy/15 bg-white px-4 py-4 hover:border-kelly-navy/40"
              >
                <p className="font-heading font-bold text-kelly-text">{row.title}</p>
                <p className="mt-1 font-body text-sm text-kelly-text/70">
                  {row.startAt.toISOString().slice(0, 10)}
                  {row.locationName ? ` · ${row.locationName}` : ""}
                  {row.countyName ? ` · ${row.countyName}` : ""}
                  {row.isLive ? " · Live" : " · Draft"}
                  {row.publishedBy ? ` · ${row.publishedBy}` : ""}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
