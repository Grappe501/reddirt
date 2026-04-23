import Link from "next/link";
import { commsMediaPath } from "@/lib/comms-workbench/comms-nav";
import type { MediaOutreachListItem } from "@/lib/comms-workbench/dto";
import { getMediaOutreachStatusDisplay, commsStatusBadgeClass } from "@/lib/comms-workbench/status-display";
import { formatCommsFieldLabel } from "@/lib/comms-workbench/ui-labels";

const th = "border-b border-deep-soil/10 px-2 py-1.5 text-left font-heading text-[10px] font-bold uppercase tracking-wider text-deep-soil/55";
const td = "border-b border-deep-soil/5 px-2 py-2 text-sm";

export function MediaOutreachListTable({ items }: { items: MediaOutreachListItem[] }) {
  if (items.length === 0) {
    return (
      <p className="rounded border border-dashed border-deep-soil/20 bg-cream-canvas/50 px-4 py-8 text-center font-body text-sm text-deep-soil/65">
        No media outreach items yet. PR tracking will appear here when rows exist in the workbench graph.
      </p>
    );
  }
  return (
    <div className="overflow-x-auto rounded border border-deep-soil/10 bg-white">
      <table className="w-full min-w-[640px] border-collapse">
        <thead>
          <tr>
            <th className={th}>Title</th>
            <th className={th}>Type</th>
            <th className={th}>Status</th>
            <th className={th}>Urgency</th>
            <th className={th}>Outlet / contact</th>
            <th className={th}>Linked</th>
            <th className={th}>Updated</th>
          </tr>
        </thead>
        <tbody>
          {items.map((m) => {
            const st = getMediaOutreachStatusDisplay(m.status);
            return (
            <tr key={m.id} className="hover:bg-cream-canvas/30">
              <td className={td}>
                <Link href={commsMediaPath(m.id)} className="font-semibold text-civic-slate hover:underline">
                  {m.title}
                </Link>
              </td>
              <td className={td}>{formatCommsFieldLabel(m.type)}</td>
              <td className={td}>
                <span className={commsStatusBadgeClass(st.tone)}>{st.label}</span>
              </td>
              <td className={td}>{m.urgency ? formatCommsFieldLabel(m.urgency) : "—"}</td>
              <td className={`${td} text-xs`}>
                {m.outletName ?? "—"}
                {m.contactName ? <span className="block text-deep-soil/55">{m.contactName}</span> : null}
              </td>
              <td className={`${td} text-xs`}>
                {m.linkedPlanTitle ? <span>Plan: {m.linkedPlanTitle}</span> : null}
                {m.linkedIntakeTitle ? <span className="mt-0.5 block">Intake: {m.linkedIntakeTitle}</span> : null}
                {!m.linkedPlanTitle && !m.linkedIntakeTitle ? "—" : null}
              </td>
              <td className={`${td} text-[10px] text-deep-soil/60`}>
                <time dateTime={m.updatedAt}>{new Date(m.updatedAt).toLocaleString()}</time>
              </td>
            </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
