import Link from "next/link";
import { commsPlanPath, COMMS_PLAN_SECTION } from "@/lib/comms-workbench/comms-nav";

const linkCls =
  "rounded border border-deep-soil/10 bg-cream-canvas/50 px-2 py-0.5 text-[11px] font-semibold text-civic-slate hover:border-civic-slate/30";

const items: { id: (typeof COMMS_PLAN_SECTION)[keyof typeof COMMS_PLAN_SECTION]; label: string }[] = [
  { id: COMMS_PLAN_SECTION.attention, label: "Attention" },
  { id: COMMS_PLAN_SECTION.source, label: "Source" },
  { id: COMMS_PLAN_SECTION.review, label: "Review" },
  { id: COMMS_PLAN_SECTION.sendSummary, label: "Sends" },
  { id: COMMS_PLAN_SECTION.execution, label: "Execution" },
  { id: COMMS_PLAN_SECTION.drafts, label: "Drafts" },
  { id: COMMS_PLAN_SECTION.variants, label: "Variants" },
  { id: COMMS_PLAN_SECTION.sends, label: "Planned sends" },
  { id: COMMS_PLAN_SECTION.segments, label: "Audience segments" },
  { id: COMMS_PLAN_SECTION.media, label: "Media" },
];

export function PlanDetailInPageNav({ planId }: { planId: string }) {
  return (
    <nav
      className="flex flex-wrap gap-1.5 border-b border-deep-soil/8 pb-2"
      aria-label="On this plan"
    >
      <span className="w-full text-[10px] font-bold uppercase tracking-wider text-deep-soil/50">On this page</span>
      {items.map((it) => (
        <Link key={it.id} href={commsPlanPath(planId, it.id)} className={linkCls} prefetch={false}>
          {it.label}
        </Link>
      ))}
    </nav>
  );
}
