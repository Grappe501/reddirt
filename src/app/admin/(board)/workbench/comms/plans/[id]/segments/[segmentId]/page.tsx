import Link from "next/link";
import { notFound } from "next/navigation";
import { CommsPlanSegmentDetailView } from "@/components/admin/comms-workbench/CommsPlanSegmentDetailView";
import { CommsWorkbenchSubnav } from "@/components/admin/comms-workbench/CommsWorkbenchSubnav";
import { getCommunicationPlanDetail } from "@/lib/comms-workbench/queries";
import { getCommsPlanAudienceSegmentDetail } from "@/lib/contact-engagement/queries";
import { COMMS_APP_PATHS, commsPlanPath, COMMS_PLAN_SECTION } from "@/lib/comms-workbench/comms-nav";

type Props = { params: Promise<{ id: string; segmentId: string }> };

export default async function CommsPlanSegmentDetailPage({ params }: Props) {
  const { id, segmentId } = await params;
  const [plan, segment] = await Promise.all([
    getCommunicationPlanDetail(id),
    getCommsPlanAudienceSegmentDetail(id, segmentId),
  ]);
  if (!plan || !segment) notFound();

  return (
    <div className="min-w-0 p-1">
      <CommsWorkbenchSubnav />
      <div className="mt-2 border-b border-deep-soil/10 pb-2 text-[11px] text-deep-soil/55">
        <Link className="font-semibold text-civic-slate" href={commsPlanPath(id, COMMS_PLAN_SECTION.segments)}>
          Message plan: {plan.title}
        </Link>{" "}
        ·{" "}
        <Link className="font-semibold text-civic-slate" href={COMMS_APP_PATHS.plans}>
          All message plans
        </Link>
      </div>
      <div className="mt-3">
        <CommsPlanSegmentDetailView communicationPlanId={id} planTitle={plan.title} segment={segment} />
      </div>
    </div>
  );
}
