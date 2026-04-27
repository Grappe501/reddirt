import type { MyFiveMember } from "@/lib/power-of-5/personal-dashboard-demo";
import { CountySectionHeader } from "@/components/county/dashboard/CountySectionHeader";
import { countyDashboardCardClass } from "@/components/county/dashboard/countyDashboardClassNames";
import { CountySourceBadge } from "@/components/county/dashboard/countyDashboardFormat";
import { cn } from "@/lib/utils";

const STATUS_LABEL: Record<MyFiveMember["status"], string> = {
  open: "Open",
  mapped: "Mapped",
  contacted: "Contacted",
  invited: "Invited",
  committed: "Committed",
};

function statusStyles(status: MyFiveMember["status"]) {
  switch (status) {
    case "committed":
      return "border-l-kelly-success/80 bg-kelly-success/5";
    case "invited":
    case "contacted":
      return "border-l-kelly-slate/50 bg-kelly-slate/[0.04]";
    case "mapped":
      return "border-l-kelly-gold/70 bg-kelly-gold/[0.06]";
    default:
      return "border-l-kelly-text/15 bg-kelly-page/80";
  }
}

type Props = {
  members: MyFiveMember[];
  className?: string;
};

/**
 * Personal Power of 5 — who is in your intentional circle and where each relationship stands.
 */
export function MyFivePanel({ members, className }: Props) {
  const filled = members.filter((m) => m.status !== "open").length;
  const denom = 5;
  const pct = Math.round((filled / denom) * 100);

  return (
    <section className={className}>
      <CountySectionHeader
        overline="Power of 5"
        title="My five"
        description={
          <>
            Your core circle — <strong className="text-kelly-navy">{filled}</strong> of {denom} slots active in this demo.{" "}
            <CountySourceBadge source="demo" note="Synthetic roster for UI preview" />
          </>
        }
      />
      <div className="mt-4 flex flex-wrap items-end gap-4">
        <div
          className={cn(countyDashboardCardClass, "flex min-w-[140px] flex-1 items-center gap-3 border-l-4 border-l-kelly-navy/40")}
          role="status"
          aria-label={`Circle progress ${pct} percent`}
        >
          <div
            className="relative grid h-16 w-16 shrink-0 place-items-center rounded-full border-4 border-kelly-navy/15 bg-kelly-page"
            style={{
              background: `conic-gradient(var(--color-kelly-navy, #1a2b4a) ${pct * 3.6}deg, rgba(26,43,74,0.08) 0)`,
            }}
          >
            <span className="absolute inset-1 grid place-items-center rounded-full bg-kelly-page font-heading text-lg font-bold text-kelly-navy">
              {filled}/{denom}
            </span>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-kelly-text/55">Circle fill</p>
            <p className="font-heading text-xl font-bold text-kelly-navy">{pct}%</p>
            <p className="text-xs text-kelly-text/65">Cooperative goal, not a race</p>
          </div>
        </div>
      </div>
      <ul className="mt-4 space-y-2">
        {members.map((m) => (
          <li
            key={m.id}
            className={cn(
              countyDashboardCardClass,
              "border-l-4 py-3 pl-3 pr-3 sm:pl-4",
              statusStyles(m.status),
            )}
          >
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <p className="font-heading text-base font-bold text-kelly-navy">{m.displayName}</p>
              <span className="rounded-full border border-kelly-text/10 bg-kelly-page/90 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-kelly-text/70">
                {STATUS_LABEL[m.status]}
              </span>
            </div>
            <p className="mt-0.5 text-xs text-kelly-text/60">{m.category}</p>
            <p className="mt-2 text-sm text-kelly-text/80">{m.lastTouchLabel}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
