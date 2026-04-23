import Link from "next/link";
import { notFound } from "next/navigation";
import { MediaOutreachDetailView } from "@/components/admin/comms-workbench/MediaOutreachDetailView";
import { CommsWorkbenchSubnav } from "@/components/admin/comms-workbench/CommsWorkbenchSubnav";
import { getMediaOutreachItemDetail } from "@/lib/comms-workbench/queries";

type Props = { params: Promise<{ id: string }> };

export default async function CommsWorkbenchMediaDetailPage({ params }: Props) {
  const { id } = await params;
  const item = await getMediaOutreachItemDetail(id);
  if (!item) notFound();

  return (
    <div className="min-w-0 p-1">
      <CommsWorkbenchSubnav />
      <div className="mt-2 flex flex-wrap items-center gap-2 border-b border-deep-soil/10 pb-2">
        <Link
          href="/admin/workbench/comms"
          className="rounded border border-deep-soil/15 bg-white px-2 py-0.5 text-xs font-semibold text-civic-slate"
        >
          Comms
        </Link>
        <Link
          href="/admin/workbench/comms/media"
          className="rounded border border-deep-soil/15 bg-cream-canvas px-2 py-0.5 text-xs font-semibold text-civic-slate"
        >
          All media
        </Link>
      </div>
      <div className="mt-3">
        <MediaOutreachDetailView item={item} />
      </div>
    </div>
  );
}
