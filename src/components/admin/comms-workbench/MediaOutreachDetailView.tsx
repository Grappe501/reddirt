import Link from "next/link";
import { commsPlanPath } from "@/lib/comms-workbench/comms-nav";
import type { MediaOutreachDetail } from "@/lib/comms-workbench/dto";
import { getMediaOutreachStatusDisplay, commsStatusBadgeClass } from "@/lib/comms-workbench/status-display";
import { formatCommsFieldLabel } from "@/lib/comms-workbench/ui-labels";

const h2 = "font-heading text-[10px] font-bold uppercase tracking-wider text-deep-soil/55";
const card = "rounded-md border border-deep-soil/10 bg-white p-3";

export function MediaOutreachDetailView({ item }: { item: MediaOutreachDetail }) {
  const st = getMediaOutreachStatusDisplay(item.status);
  return (
    <div className="min-w-0 space-y-4">
      <header>
        <p className={h2}>Media outreach</p>
        <h1 className="font-heading text-2xl font-bold text-deep-soil">{item.title}</h1>
        <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
          <span className="rounded border border-deep-soil/12 bg-cream-canvas px-2 py-0.5">{formatCommsFieldLabel(item.type)}</span>
          <span className={commsStatusBadgeClass(st.tone)}>{st.label}</span>
          {item.urgency ? (
            <span className="rounded border border-deep-soil/12 bg-cream-canvas px-2 py-0.5">{formatCommsFieldLabel(item.urgency)}</span>
          ) : null}
        </div>
        <p className="mt-2 text-sm text-deep-soil/80">
          {item.contactName ? <>Contact: {item.contactName} · </> : null}
          {item.outletName ? <>Outlet: {item.outletName}</> : null}
        </p>
      </header>

      {item.notes ? (
        <section className={card}>
          <h2 className={h2}>Notes</h2>
          <p className="mt-1 whitespace-pre-wrap text-sm text-deep-soil/85">{item.notes}</p>
        </section>
      ) : null}

      <section className={card}>
        <h2 className={h2}>Links</h2>
        <ul className="mt-1 space-y-2 text-sm">
          <li>
            <span className="font-semibold">Plan: </span>
            {item.linkedCommunicationPlan ? (
              <Link
                className="text-civic-slate hover:underline"
                href={commsPlanPath(item.linkedCommunicationPlan.id)}
              >
                {item.linkedCommunicationPlan.title}
              </Link>
            ) : (
              "—"
            )}
          </li>
          <li>
            <span className="font-semibold">Workflow intake: </span>
            {item.linkedWorkflowIntake ? (
              <span>
                {item.linkedWorkflowIntake.title ?? "Intake"}{" "}
                <span className="text-xs text-deep-soil/55">({formatCommsFieldLabel(item.linkedWorkflowIntake.status)})</span>
              </span>
            ) : (
              "—"
            )}
          </li>
          <li>
            <span className="font-semibold">Conversation opportunity: </span>
            {item.linkedConversationOpportunity ? item.linkedConversationOpportunity.title : "—"}
          </li>
        </ul>
      </section>
    </div>
  );
}
