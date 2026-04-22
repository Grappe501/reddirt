import Link from "next/link";
import { FestivalIngestReviewTable } from "@/components/admin/festivals/FestivalIngestReviewTable";
import { listFestivalIngestsForAdmin } from "@/lib/festivals/admin-queries";

type Props = {
  searchParams: Promise<{ filter?: string; ok?: string; error?: string }>;
};

/**
 * Suggestions from the public Movement /events “Suggest an event” form (`FestivalSourceChannel.PUBLIC_FORM`).
 * Approval sets the same public feed as automated ingest: campaign trail + community strip on /events.
 */
export default async function AdminCommunityEventSuggestionsPage({ searchParams }: Props) {
  const sp = await searchParams;
  const raw = sp.filter?.trim() ?? "pending";
  const filter =
    raw === "all" || raw === "approved" || raw === "rejected" || raw === "pending" ? raw : "pending";
  const rows = await listFestivalIngestsForAdmin({ status: filter, channel: "public_form", limit: 400 });

  const link = (f: string) => {
    if (f === "pending") return "/admin/events/community-suggestions";
    return `/admin/events/community-suggestions?filter=${f}`;
  };

  return (
    <div className="mx-auto max-w-6xl p-2 md:p-4">
      <h1 className="font-heading text-2xl font-bold text-deep-soil">Public event suggestions</h1>
      <p className="mt-2 max-w-2xl font-body text-sm text-deep-soil/75">
        Neighbors use the form on the Movement <Link href="/events#suggest" className="text-red-dirt underline">/events</Link> page.
        Approve to show the listing on the campaign trail and the community events strip—same as automated ingest. Submitter
        contact stays internal; never displayed on the public site.
      </p>
      <p className="mt-2 text-xs">
        <Link href="/admin/events" className="font-semibold text-civic-slate hover:underline">← Admin events</Link>
        <span className="text-deep-soil/35"> · </span>
        <Link href="/admin/workbench/festivals" className="font-semibold text-civic-slate hover:underline">All community feed rows</Link>
      </p>

      {sp.error === "id" ? (
        <p className="mt-2 rounded border border-amber-200 bg-amber-50 px-2 py-1 font-body text-xs text-amber-950">Missing row id.</p>
      ) : null}
      {sp.ok === "approved" ? <p className="mt-2 text-xs text-emerald-800">Approved and on public feed.</p> : null}
      {sp.ok === "hidden" ? <p className="mt-2 text-xs text-deep-soil/80">Hidden from public feed.</p> : null}
      {sp.ok === "visible" ? <p className="mt-2 text-xs text-emerald-800">Shown on public feed.</p> : null}
      {sp.ok === "rejected" ? <p className="mt-2 text-xs text-deep-soil/80">Rejected.</p> : null}
      {sp.ok === "reset" ? <p className="mt-2 text-xs text-deep-soil/80">Reset to pending review.</p> : null}

      <div className="mt-6 flex flex-wrap gap-1">
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
            href={link(f)}
            className={`rounded border px-2 py-0.5 text-xs font-semibold ${
              filter === f ? "border-deep-soil bg-deep-soil text-cream-canvas" : "border-deep-soil/20 bg-white text-deep-soil"
            }`}
          >
            {label}
          </Link>
        ))}
      </div>

      <FestivalIngestReviewTable rows={rows} formRedirectBase="/admin/events/community-suggestions" />
    </div>
  );
}
