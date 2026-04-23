import Link from "next/link";

const card =
  "rounded-md border border-deep-soil/10 bg-cream-canvas px-2 py-1.5 shadow-sm min-w-0";
const h2 = "font-heading text-[10px] font-bold uppercase tracking-wider text-deep-soil/55";

/**
 * Comms workbench hub (Tier 1: links into main thread workbench; Tier 2+ will add broadcast routes here).
 */
export default function CommsWorkbenchHubPage() {
  return (
    <div className="mx-auto max-w-3xl p-2">
      <h1 className="font-heading text-xl font-bold text-deep-soil">Communications</h1>
        <p className="mt-1 font-body text-sm text-deep-soil/70">
        1:1 threads, contact compliance, and AI triage. Broadcasts: Twilio + SendGrid, audience filters, cron. Tier 3B: calendar
        events can spawn non-sending campaign shells (workbench <span className="font-semibold">Automations</span> lane) for review.
      </p>
      <ul className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
        <li className={card}>
          <p className={h2}>Inbox · threads</p>
          <Link href="/admin/workbench" className="mt-0.5 inline-block text-sm font-semibold text-civic-slate">
            Open campaign workbench
          </Link>
          <p className="mt-0.5 text-[10px] text-deep-soil/50">
            <Link href="/admin/workbench?lane=orchestration" className="font-semibold text-civic-slate">
              Automations lane
            </Link>{" "}
            (event-driven shells)
          </p>
        </li>
        <li className={card}>
          <p className={h2}>Broadcasts · audiences</p>
          <Link href="/admin/workbench/comms/broadcasts" className="mt-0.5 inline-block text-sm font-semibold text-civic-slate">
            Open broadcast hub
          </Link>
        </li>
        <li className={card}>
          <p className={h2}>Social workbench</p>
          <Link href="/admin/workbench/social" className="mt-0.5 inline-block text-sm font-semibold text-civic-slate">
            Post sets and platform variants
          </Link>
          <p className="mt-0.5 text-[10px] text-deep-soil/50">Same campaign spine as tasks; not a replacement for comms threads.</p>
        </li>
      </ul>
    </div>
  );
}

