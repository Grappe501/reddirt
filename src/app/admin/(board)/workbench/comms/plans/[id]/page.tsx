import Link from "next/link";
import { notFound } from "next/navigation";
import { CommunicationPlanDetailView } from "@/components/admin/comms-workbench/CommunicationPlanDetailView";
import { CommsPlanScrollToHash } from "@/components/admin/comms-workbench/CommsPlanScrollToHash";
import { CommsWorkbenchSubnav } from "@/components/admin/comms-workbench/CommsWorkbenchSubnav";
import { COMMS_APP_PATHS, commsPlanPath, COMMS_PLAN_SECTION } from "@/lib/comms-workbench/comms-nav";
import { getCommunicationPlanDetail } from "@/lib/comms-workbench/queries";

type Props = { params: Promise<{ id: string }> };

export default async function CommsWorkbenchPlanDetailPage({ params }: Props) {
  const { id } = await params;
  const plan = await getCommunicationPlanDetail(id);
  if (!plan) notFound();

  return (
    <div className="min-w-0 p-1">
      <CommsPlanScrollToHash />
      <CommsWorkbenchSubnav />
      <div className="mt-2 space-y-1.5 border-b border-kelly-text/10 pb-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href={COMMS_APP_PATHS.dashboard}
              className="rounded border border-kelly-text/15 bg-white px-2 py-0.5 text-xs font-semibold text-kelly-slate"
            >
              Comms operations
            </Link>
            <Link
              href={COMMS_APP_PATHS.plans}
              className="rounded border border-kelly-text/15 bg-kelly-page px-2 py-0.5 text-xs font-semibold text-kelly-slate"
            >
              All message plans
            </Link>
          </div>
        </div>
        <p className="text-[11px] text-kelly-text/55">
          <Link className="font-semibold text-kelly-slate" href={commsPlanPath(id, COMMS_PLAN_SECTION.execution)}>
            Jump to execution
          </Link>{" "}
          ·{" "}
          <Link className="font-semibold text-kelly-slate" href={commsPlanPath(id, COMMS_PLAN_SECTION.sends)}>
            Jump to planned sends
          </Link>
        </p>
      </div>
      <div className="mt-3">
        <CommunicationPlanDetailView plan={plan} />
      </div>
    </div>
  );
}
