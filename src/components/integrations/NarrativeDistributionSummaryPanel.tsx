import Link from "next/link";
import { CountySectionHeader } from "@/components/county/dashboard/CountySectionHeader";
import { CountySourceBadge } from "@/components/county/dashboard/countyDashboardFormat";
import { countyDashboardCardClass } from "@/components/county/dashboard/countyDashboardClassNames";
import { buildPublicMemberHubModel } from "@/lib/narrative-distribution/public-member-hub";
import { cn } from "@/lib/utils";

type Props = {
  className?: string;
};

/**
 * Slim narrative distribution slice for the state OIS page — reuses the public hub demo model (read-only).
 */
export function NarrativeDistributionSummaryPanel({ className }: Props) {
  const model = buildPublicMemberHubModel();
  const { messageOfWeek, volunteerSharePackets } = model;
  const volunteerSharePacket = volunteerSharePackets[0] ?? {
    title: "Share packet",
    intro: "",
    checklist: [] as string[],
    copyBlock: "",
  };

  return (
    <section className={cn("space-y-4", className)}>
      <CountySectionHeader
        overline="Narrative distribution"
        title="State message shelf (summary)"
        description={
          <span className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
            <span>
              Weekly line and share packets mirror the public{" "}
              <Link href="/messages" className="font-semibold text-kelly-slate underline">
                message hub
              </Link>{" "}
              — same demo registry, no separate telemetry on this strip.
            </span>
            <CountySourceBadge source="demo" note="Static packet registry — not a publish action." />
          </span>
        }
      />
      <div className={cn(countyDashboardCardClass, "space-y-3 p-4 sm:p-5")}>
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-kelly-text/50">{messageOfWeek.weekLabel}</p>
          <p className="font-heading mt-1 text-base font-bold text-kelly-navy">{messageOfWeek.title}</p>
          <p className="mt-2 text-sm text-kelly-text/80">{messageOfWeek.dek}</p>
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-kelly-text/50">{volunteerSharePacket.title}</p>
          <p className="mt-1 text-sm text-kelly-text/75">{volunteerSharePacket.intro}</p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-kelly-text/80">
            {volunteerSharePacket.checklist.slice(0, 3).map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </div>
        <p>
          <Link href="/messages" className="font-semibold text-kelly-slate underline">
            Full hub: county cards, Power of 5 prompts, packets →
          </Link>
        </p>
      </div>
    </section>
  );
}
