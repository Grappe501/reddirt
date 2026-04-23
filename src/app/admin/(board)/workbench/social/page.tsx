import Link from "next/link";
import { CreateSocialItemForm } from "@/components/admin/workbench/CreateSocialItemForm";
import { SocialWorkbenchCommandUI } from "@/components/admin/social/SocialWorkbenchCommandUI";
import {
  getSocialWorkbenchSummary,
  listRecentSocialContentItems,
  listSocialAccountsActive,
  socialListRowToWorkbenchItem,
} from "@/lib/social/social-workbench-queries";
import {
  getConversationMonitoringSummary,
  listConversationItems,
  listConversationClusters,
  listConversationOpportunities,
} from "@/lib/conversation-monitoring/conversation-monitoring-queries";
import { prisma } from "@/lib/db";

const h2 = "font-heading text-[10px] font-bold uppercase tracking-wider text-deep-soil/55";

export default async function WorkbenchSocialPage() {
  const [summary, items, accounts, convSummary, convItems, convClusters, convOpps, countyOptions] = await Promise.all([
    getSocialWorkbenchSummary(),
    listRecentSocialContentItems(60),
    listSocialAccountsActive(),
    getConversationMonitoringSummary(),
    listConversationItems(40),
    listConversationClusters(20),
    listConversationOpportunities(20),
    prisma.county.findMany({ orderBy: { displayName: "asc" }, select: { id: true, displayName: true }, take: 200 }),
  ]);

  const initialQueue = items.map(socialListRowToWorkbenchItem);

  return (
    <div className="min-w-0">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2 border-b border-deep-soil/10 bg-cream-canvas/90 px-1 py-1.5">
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/admin/workbench"
            className="rounded border border-deep-soil/15 bg-white px-2 py-0.5 text-xs font-semibold text-civic-slate"
          >
            ← Workbench
          </Link>
          <Link
            href="/admin/tasks"
            className="rounded border border-washed-denim/20 bg-cream-canvas px-2 py-0.5 text-xs font-semibold text-civic-slate"
          >
            All tasks
          </Link>
        </div>
        <p className="font-body text-[10px] text-deep-soil/55">
          DB snapshot: {summary.inPipeline} in pipeline · {summary.inReview} in review · {summary.published} published
        </p>
      </div>

      <div className="-mx-6 -mt-0 mb-0 w-[calc(100%+3rem)] max-w-[calc(100vw-280px-3rem)] min-w-0 px-0 lg:-mx-12 lg:w-[calc(100%+6rem)] lg:max-w-[calc(100vw-280px-6rem)]">
        <SocialWorkbenchCommandUI
          initialQueue={initialQueue}
          socialAccounts={accounts}
            conversation={{
            summary: convSummary,
            initialItems: convItems,
            clusters: convClusters,
            opportunities: convOpps,
            countyOptions,
          }}
        />
      </div>

      <div className="mt-4 border-t border-deep-soil/10 pt-3" id="social-create-form">
        <h2 className="font-heading text-sm font-bold text-deep-soil">Add another work item</h2>
        <p className="mt-0.5 font-body text-xs text-deep-soil/60">
          New rows appear in the workbench after save (use queue refresh in the app or re-open the page). The command view above is the primary editor
          for <code className="rounded bg-deep-soil/5 px-0.5">SocialContentItem</code>, variants, and linked tasks.
        </p>
        <div className="mt-3 grid grid-cols-1 gap-4 lg:grid-cols-2">
          <section>
            <h3 className={h2 + " mb-1"}>Quick create (database)</h3>
            <CreateSocialItemForm />
          </section>
          <section>
            <h3 className={h2 + " mb-1"}>Conventions</h3>
            <ul className="list-inside list-disc space-y-0.5 font-body text-xs text-deep-soil/75">
              <li>Event promos, recaps, and clips: link a calendar event when editing in the main campaign tools.</li>
              <li>Rapid response: connect to a <code className="text-[10px]">WorkflowIntake</code> from the main workbench.</li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
