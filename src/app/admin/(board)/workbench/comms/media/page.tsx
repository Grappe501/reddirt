import Link from "next/link";
import { MediaOutreachListTable } from "@/components/admin/comms-workbench/MediaOutreachListTable";
import { CommsWorkbenchSubnav } from "@/components/admin/comms-workbench/CommsWorkbenchSubnav";
import { listMediaOutreachItems } from "@/lib/comms-workbench/queries";

export default async function CommsWorkbenchMediaListPage() {
  const items = await listMediaOutreachItems({ take: 100, orderByField: "updatedAt", orderDirection: "desc" });
  return (
    <div className="min-w-0 p-1">
      <CommsWorkbenchSubnav />
      <div className="mt-2 flex flex-wrap items-start justify-between gap-2 border-b border-deep-soil/10 pb-2">
        <h1 className="font-heading text-xl font-bold text-deep-soil">Media outreach</h1>
        <Link
          href="/admin/workbench/comms"
          className="rounded border border-deep-soil/15 bg-white px-2 py-0.5 text-xs font-semibold text-civic-slate"
        >
          ← Comms operations
        </Link>
      </div>
      <p className="mt-1 max-w-2xl font-body text-sm text-deep-soil/70">
        Read-only PR / media tracking rows from the Comms Workbench graph.
      </p>
      <div className="mt-3">
        <MediaOutreachListTable items={items} />
      </div>
    </div>
  );
}
