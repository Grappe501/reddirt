import Link from "next/link";
import { MediaApprovalQueue } from "@/components/admin/campaign-events/hot-wash/MediaApprovalQueue";
import { listPendingMedia } from "@/lib/campaign-events/media/media-index";
import { CampaignEventsNav, CampaignEventsPageHeader } from "@/app/admin/(board)/campaign-events/components";

export const dynamic = "force-dynamic";

export default async function CampaignEventMediaApprovalPage() {
  const pending = await listPendingMedia();

  return (
    <div className="mx-auto flex max-w-[1200px] flex-col gap-6 pb-12">
      <CampaignEventsPageHeader
        eyebrow="Campaign operating system · Hot Wash"
        title="Media approval queue"
        description="Campaign manager reviews pending Hot Wash uploads before they move from uploader pending folders into the official county/date/event archive. Rejects update metadata and may move files to rejected/ — nothing is deleted."
        actions={
          <Link href="/admin/campaign-events/workbench" className="rounded-full border border-kelly-navy/30 px-4 py-2 font-body text-sm font-bold text-kelly-navy">
            Workbench
          </Link>
        }
      />
      <CampaignEventsNav />
      <p className="font-body text-sm text-kelly-muted">
        <strong>{pending.length}</strong> item(s) awaiting decision.
      </p>
      <MediaApprovalQueue items={pending} />
    </div>
  );
}
