import Link from "next/link";
import {
  CommunicationPlanListTable,
  CommunicationPlanListToolbar,
  flattenSearchParams,
} from "@/components/admin/comms-workbench/CommunicationPlanListSection";
import { PlanListSearchForm } from "@/components/admin/comms-workbench/PlanListSearchForm";
import { CommsWorkbenchSubnav } from "@/components/admin/comms-workbench/CommsWorkbenchSubnav";
import { communicationPlanListQueryFromSearchParams } from "@/lib/comms-workbench/plan-list-params";
import { COMMS_APP_PATHS } from "@/lib/comms-workbench/comms-nav";
import { listCommunicationPlans } from "@/lib/comms-workbench/queries";

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function CommsWorkbenchPlansListPage({ searchParams }: Props) {
  const sp = await searchParams;
  const flat = flattenSearchParams(sp);
  const queryOpts = communicationPlanListQueryFromSearchParams(sp);
  const items = await listCommunicationPlans(queryOpts);

  return (
    <div className="min-w-0 p-1">
      <CommsWorkbenchSubnav />
      <div className="mt-2 flex flex-wrap items-center justify-between gap-2 border-b border-deep-soil/10 pb-2">
        <h1 className="font-heading text-xl font-bold text-deep-soil">Message plans</h1>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href={COMMS_APP_PATHS.plansNew}
            className="rounded border border-civic-slate/30 bg-civic-slate/10 px-2 py-0.5 text-xs font-bold text-civic-slate"
          >
            New message plan
          </Link>
          <Link
            href={COMMS_APP_PATHS.dashboard}
            className="rounded border border-deep-soil/15 bg-white px-2 py-0.5 text-xs font-semibold text-civic-slate"
          >
            ← Comms operations
          </Link>
        </div>
      </div>
      <p className="mt-1 max-w-2xl font-body text-sm text-deep-soil/70">
        Communication plans in the new workbench graph. Open a row for drafts, sends, and provenance.
      </p>

      <div className="mt-3">
        <PlanListSearchForm baseQuery={flat} />
        <CommunicationPlanListToolbar baseQuery={flat} />
        <CommunicationPlanListTable items={items} />
      </div>
    </div>
  );
}
