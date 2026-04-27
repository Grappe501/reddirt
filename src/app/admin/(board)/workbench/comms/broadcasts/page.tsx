import Link from "next/link";
import { listRecentCampaigns } from "@/lib/comms/broadcast-queries";
import { CommunicationCampaignAutomationStatus, CommunicationCampaignStatus } from "@prisma/client";

const h2 = "font-heading text-[10px] font-bold uppercase tracking-wider text-kelly-text/55";
const cell = "border-b border-kelly-text/10 px-1 py-0.5 text-[10px]";

function stColor(s: CommunicationCampaignStatus) {
  if (s === "COMPLETE") return "text-kelly-slate";
  if (s === "FAILED" || s === "CANCELED") return "text-red-800";
  if (s === "SENDING" || s === "QUEUED") return "text-kelly-navy";
  return "text-kelly-text";
}

export default async function BroadcastsListPage() {
  const list = await listRecentCampaigns(40);
  return (
    <div className="mx-auto max-w-5xl p-2">
      <div className="flex flex-wrap items-baseline justify-between gap-1">
        <h1 className="font-heading text-lg font-bold text-kelly-text">Broadcasts</h1>
        <Link
          href="/admin/workbench/comms/broadcasts/new"
          className="rounded border border-kelly-navy/30 bg-kelly-navy px-2 py-0.5 text-[10px] font-bold text-kelly-page"
        >
          New campaign
        </Link>
      </div>
      <p className="mt-0.5 font-body text-xs text-kelly-text/65">
        Tier 2: audience resolution, opt-in / suppression, queue worker (`GET /api/cron/comms-broadcasts?key=…`), same Twilio + SendGrid rails as 1:1
        workbench.
      </p>
      <div className="mt-2 overflow-x-auto border border-kelly-text/10 bg-kelly-page/50">
        <table className="w-full min-w-[640px] border-collapse text-left">
          <thead>
            <tr className="bg-kelly-page">
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
                <td colSpan={7} className={cell + " text-kelly-text/50"}>
                  No campaigns yet.{" "}
                  <Link className="text-kelly-slate" href="/admin/workbench/comms/broadcasts/new">
                    Create one
                  </Link>
                  .
                </td>
              </tr>
            ) : (
              list.map((c) => (
                <tr key={c.id} className="hover:bg-white/50">
                  <td className={cell}>
                    <Link href={`/admin/workbench/comms/broadcasts/${c.id}`} className="font-semibold text-kelly-slate">
                      {c.name}
                    </Link>
                  </td>
                  <td className={cell + " text-[9px] text-kelly-text/70"}>
                    {c.automationStatus === CommunicationCampaignAutomationStatus.SHELL ? "shell" : "—"}
                  </td>
                  <td className={cell + " " + stColor(c.status)}>{c.status}</td>
                  <td className={cell + " text-kelly-text/70"}>{c.campaignType}</td>
                  <td className={cell + " font-mono"}>{c.totalRecipients}</td>
                  <td className={cell + " font-mono"}>
                    {c.sentCount} / {c.deliveredCount} / {c.failedCount}
                  </td>
                  <td className={cell + " text-kelly-text/55"}>{c.updatedAt.toLocaleString()}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-[9px] text-kelly-text/45">
        Cron: set <code className="font-mono">COMMS_BROADCAST_CRON_SECRET</code> and poll every minute in production.
      </p>
    </div>
  );
}

