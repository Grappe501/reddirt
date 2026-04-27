import Link from "next/link";
import { CommsWorkbenchDashboardView } from "@/components/admin/comms-workbench/CommsWorkbenchDashboardView";
import { CommsWorkbenchSubnav } from "@/components/admin/comms-workbench/CommsWorkbenchSubnav";
import { getCommsWorkbenchDashboardData } from "@/lib/comms-workbench/queries";

const card =
  "rounded-md border border-kelly-text/10 bg-kelly-page px-2 py-1.5 shadow-sm min-w-0";
const h2 = "font-heading text-[10px] font-bold uppercase tracking-wider text-kelly-text/55";

/**
 * Comms workbench: message plans & ops (read-only, Packet 1–2 graph). Legacy 1:1 + broadcast entry points below.
 */
export default async function CommsWorkbenchPage() {
  const dashboard = await getCommsWorkbenchDashboardData();
  return (
    <div className="min-w-0 p-1">
      <CommsWorkbenchSubnav />
      <div className="mt-2">
        <CommsWorkbenchDashboardView data={dashboard} />
      </div>

      <div className="mt-8 border-t border-kelly-text/10 pt-4">
        <h2 className="font-heading text-sm font-bold text-kelly-text">Legacy comms & adjacent tools</h2>
        <p className="mt-1 max-w-2xl font-body text-xs text-kelly-text/60">
          Tier 1–2 message rails (threads, broadcast engine, event shells) are unchanged. Use the cards below to reach those systems.
        </p>
        <ul className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
          <li className={card}>
            <p className={h2}>Inbox · threads</p>
            <Link href="/admin/workbench" className="mt-0.5 inline-block text-sm font-semibold text-kelly-slate">
              Open campaign workbench
            </Link>
            <p className="mt-0.5 text-[10px] text-kelly-text/50">
              <Link href="/admin/workbench?lane=orchestration" className="font-semibold text-kelly-slate">
                Automations lane
              </Link>{" "}
              (event-driven shells)
            </p>
          </li>
          <li className={card}>
            <p className={h2}>Broadcasts · audiences</p>
            <Link href="/admin/workbench/comms/broadcasts" className="mt-0.5 inline-block text-sm font-semibold text-kelly-slate">
              Open broadcast hub
            </Link>
          </li>
          <li className={card}>
            <p className={h2}>Social workbench</p>
            <Link href="/admin/workbench/social" className="mt-0.5 inline-block text-sm font-semibold text-kelly-slate">
              Post sets and platform variants
            </Link>
            <p className="mt-0.5 text-[10px] text-kelly-text/50">Publishes social; not a replacement for comms threads.</p>
          </li>
        </ul>
      </div>
    </div>
  );
}
