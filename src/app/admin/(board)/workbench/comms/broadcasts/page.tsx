import Link from "next/link";
import { listRecentCampaigns } from "@/lib/comms/broadcast-queries";
import { CommunicationCampaignAutomationStatus, CommunicationCampaignStatus } from "@prisma/client";

const h2 = "font-heading text-[10px] font-bold uppercase tracking-wider text-deep-soil/55";
const cell = "border-b border-deep-soil/10 px-1 py-0.5 text-[10px]";

function stColor(s: CommunicationCampaignStatus) {
  if (s === "COMPLETE") return "text-civic-slate";
  if (s === "FAILED" || s === "CANCELED") return "text-red-800";
  if (s === "SENDING" || s === "QUEUED") return "text-red-dirt";
  return "text-deep-soil";
}

export default async function BroadcastsListPage() {
  const list = await listRecentCampaigns(40);
  return (
    <div className="mx-auto max-w-5xl p-2">
      <div className="flex flex-wrap items-baseline justify-between gap-1">
        <h1 className="font-heading text-lg font-bold text-deep-soil">Broadcasts</h1>
        <Link
          href="/admin/workbench/comms/broadcasts/new"
          className="rounded border border-red-dirt/30 bg-red-dirt px-2 py-0.5 text-[10px] font-bold text-cream-canvas"
        >
          New campaign
        </Link>
      </div>
      <p className="mt-0.5 font-body text-xs text-deep-soil/65">
        Tier 2: audience resolution, opt-in / suppression, queue worker (`GET /api/cron/comms-broadcasts?key=…`), same Twilio + SendGrid rails as 1:1
        workbench.
      </p>
      <div className="mt-2 overflow-x-auto border border-deep-soil/10 bg-cream-canvas/50">
        <table className="w-full min-w-[640px] border-collapse text-left">
          <thead>
            <tr className="bg-cream-canvas">
              <th className={h2 + " " + cell}>Name</th>
              <th className={h2 + " " + cell}>Auto</th>
              <th className={h2 + " " + cell}>Status</th>
              <th className={h2 + " " + cell}>Type</th>
              <th className={h2 + " " + cell}>Recipients</th>
              <th className={h2 + " " + cell}>Sent / del. / fail</th>
              <th className={h2 + " " + cell}>Updated</th>
            </tr>
          </thead>
          <tbody>
            {list.length === 0 ? (
              <tr>
                <td colSpan={7} className={cell + " text-deep-soil/50"}>
                  No campaigns yet.{" "}
                  <Link className="text-civic-slate" href="/admin/workbench/comms/broadcasts/new">
                    Create one
                  </Link>
                  .
                </td>
              </tr>
            ) : (
              list.map((c) => (
                <tr key={c.id} className="hover:bg-white/50">
                  <td className={cell}>
                    <Link href={`/admin/workbench/comms/broadcasts/${c.id}`} className="font-semibold text-civic-slate">
                      {c.name}
                    </Link>
                  </td>
                  <td className={cell + " text-[9px] text-deep-soil/70"}>
                    {c.automationStatus === CommunicationCampaignAutomationStatus.SHELL ? "shell" : "—"}
                  </td>
                  <td className={cell + " " + stColor(c.status)}>{c.status}</td>
                  <td className={cell + " text-deep-soil/70"}>{c.campaignType}</td>
                  <td className={cell + " font-mono"}>{c.totalRecipients}</td>
                  <td className={cell + " font-mono"}>
                    {c.sentCount} / {c.deliveredCount} / {c.failedCount}
                  </td>
                  <td className={cell + " text-deep-soil/55"}>{c.updatedAt.toLocaleString()}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-[9px] text-deep-soil/45">
        Cron: set <code className="font-mono">COMMS_BROADCAST_CRON_SECRET</code> and poll every minute in production.
      </p>
    </div>
  );
}

