import Link from "next/link";
import { FestivalIngestReviewTable } from "@/components/admin/festivals/FestivalIngestReviewTable";
import { listFestivalIngestsForAdmin, type FestivalIngestListChannel } from "@/lib/festivals/admin-queries";

type Props = {
  searchParams: Promise<{ filter?: string; channel?: string; ok?: string; error?: string }>;
};

export default async function WorkbenchFestivalsPage({ searchParams }: Props) {
  const sp = await searchParams;
  const raw = sp.filter?.trim() ?? "pending";
  const filter =
    raw === "all" || raw === "approved" || raw === "rejected" || raw === "pending" ? raw : "pending";
  const ch = sp.channel?.trim() ?? "all";
  const channel: FestivalIngestListChannel =
    ch === "ingest" || ch === "public_form" || ch === "all" ? ch : "all";
  const rows = await listFestivalIngestsForAdmin({ status: filter, channel, limit: 400 });

  const link = (f: string, c: FestivalIngestListChannel) => {
    const u = new URLSearchParams();
    if (f !== "pending") u.set("filter", f);
    if (c !== "all") u.set("channel", c);
    const q = u.toString();
    return q ? `/admin/workbench/festivals?${q}` : "/admin/workbench/festivals";
  };

  return (
    <div className="min-w-0 p-2 md:p-4">
      <div className="border-b border-deep-soil/10 pb-3">
        <h1 className="font-heading text-lg font-bold text-deep-soil md:text-xl">Community events (ingest review)</h1>
        <p className="mt-1 font-body text-[11px] text-deep-soil/70">
          Approve rows you trust: sets <code className="rounded bg-deep-soil/5 px-1">reviewStatus = APPROVED</code> and{" "}
          <code className="rounded bg-deep-soil/5 px-1">isVisibleOnSite = true</code> for the public feed on the campaign
          trail and suggested events. Use <strong>Public form</strong> to see submissions from the Movement /events page.
        </p>
        <p className="mt-2 flex flex-wrap gap-2 text-[10px]">
          <Link href="/admin/workbench" className="font-semibold text-civic-slate hover:underline">
            ← Workbench
          </Link>
          <span className="text-deep-soil/35">|</span>
          <Link href="/admin/events/community-suggestions" className="font-semibold text-civic-slate hover:underline">
            Public form queue
          </Link>
          <span className="text-deep-soil/35">|</span>
          <a href="/campaign-trail" className="font-semibold text-red-dirt hover:underline" target="_blank" rel="noreferrer">
            View public feed →
          </a>
        </p>
      </div>

      {sp.error === "id" ? (
        <p className="mt-2 rounded border border-amber-200 bg-amber-50 px-2 py-1 font-body text-xs text-amber-950">Missing row id.</p>
      ) : null}
      {sp.ok === "approved" ? (
        <p className="mt-2 font-body text-xs text-emerald-800">Row approved and shown on site.</p>
      ) : null}
      {sp.ok === "hidden" ? (
        <p className="mt-2 font-body text-xs text-deep-soil/80">Removed from public feed (still approved in DB).</p>
      ) : null}
      {sp.ok === "visible" ? (
        <p className="mt-2 font-body text-xs text-emerald-800">Shown on public feed.</p>
      ) : null}
      {sp.ok === "rejected" ? (
        <p className="mt-2 font-body text-xs text-deep-soil/80">Row rejected.</p>
      ) : null}
      {sp.ok === "reset" ? (
        <p className="mt-2 font-body text-xs text-deep-soil/80">Reset to pending review.</p>
      ) : null}

      <div className="mt-4 flex flex-wrap gap-1">
        {(
          [
            ["pending", "Pending review"],
            ["approved", "Approved"],
            ["rejected", "Rejected"],
            ["all", "All"],
          ] as const
        ).map(([f, label]) => (
          <Link
            key={f}
            href={link(f, channel)}
            className={`rounded border px-2 py-0.5 text-[10px] font-semibold ${
              filter === f ? "border-deep-soil bg-deep-soil text-cream-canvas" : "border-deep-soil/20 bg-white text-deep-soil"
            }`}
          >
            {label}
          </Link>
        ))}
      </div>

      <p className="mt-2 font-body text-[10px] text-deep-soil/55">Source</p>
      <div className="mt-1 flex flex-wrap gap-1">
        {(
          [
            ["all", "All sources"],
            ["ingest", "Ingest / feeds"],
            ["public_form", "Public form"],
          ] as const
        ).map(([c, label]) => (
          <Link
            key={c}
            href={link(filter, c)}
            className={`rounded border px-2 py-0.5 text-[10px] font-semibold ${
              channel === c ? "border-civic-slate bg-civic-slate text-cream-canvas" : "border-deep-soil/20 bg-white text-deep-soil"
            }`}
          >
            {label}
          </Link>
        ))}
      </div>

      <FestivalIngestReviewTable rows={rows} formRedirectBase="/admin/workbench/festivals" />
    </div>
  );
}
