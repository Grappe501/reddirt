import { countyDashboardCardClass } from "@/components/county/dashboard/countyDashboardClassNames";
import { CountySectionHeader } from "@/components/county/dashboard/CountySectionHeader";
import { CountySourceBadge } from "@/components/county/dashboard/countyDashboardFormat";
import type {
  MessageIntelligenceFieldMessage,
  MessageIntelligenceFollowUpRow,
  MessageIntelligenceNarrativeGap,
} from "@/lib/message-engine/message-intelligence-dashboard";
import { cn } from "@/lib/utils";

type Props = {
  className?: string;
  windowLabel: string;
  narrativeGaps: MessageIntelligenceNarrativeGap[];
  fieldMessageOfWeek: MessageIntelligenceFieldMessage;
  followUpNeeds: MessageIntelligenceFollowUpRow[];
};

function priorityStyles(p: MessageIntelligenceNarrativeGap["priority"]) {
  switch (p) {
    case "high":
      return "border-l-kelly-navy bg-kelly-navy/[0.06]";
    case "medium":
      return "border-l-amber-500/80 bg-amber-50/50";
    default:
      return "border-l-kelly-slate/40 bg-kelly-page/80";
  }
}

/**
 * Narrative gaps, suggested field script, and follow-up queue depth — all aggregate / coaching level.
 */
export function NarrativeGapPanel({ className, windowLabel, narrativeGaps, fieldMessageOfWeek, followUpNeeds }: Props) {
  return (
    <section className={cn(countyDashboardCardClass, "space-y-4", className)}>
      <CountySectionHeader
        overline="Narrative intelligence"
        title="Gaps, field script, follow-ups"
        description={
          <span className="flex flex-wrap items-center gap-2">
            <span>{windowLabel}</span>
            <CountySourceBadge source="demo" note="Coaching view — no private conversation text on public dashboards." />
          </span>
        }
      />

      <div>
        <h3 className="text-xs font-bold uppercase tracking-widest text-kelly-slate/70">Narrative gaps</h3>
        <p className="mt-1 text-[11px] text-kelly-text/60">Where organizers report thin or inconsistent messaging — staff can turn these into approved scripts.</p>
        <ul className="mt-3 space-y-2">
          {narrativeGaps.map((g) => (
            <li
              key={g.title}
              className={cn("rounded-r-xl border border-kelly-text/10 border-l-4 py-2.5 pl-3 pr-3", priorityStyles(g.priority))}
            >
              <p className="flex flex-wrap items-center gap-2 text-sm font-semibold text-kelly-navy/95">
                {g.title}
                <span className="rounded-full border border-kelly-text/15 bg-kelly-page/90 px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wide text-kelly-text/65">
                  {g.priority} priority
                </span>
              </p>
              <p className="mt-1 text-xs leading-relaxed text-kelly-text/75">{g.detail}</p>
            </li>
          ))}
        </ul>
      </div>

      <div className="rounded-xl border border-kelly-gold/35 bg-gradient-to-br from-kelly-gold/10 to-kelly-page/90 p-4">
        <h3 className="text-xs font-bold uppercase tracking-widest text-kelly-navy/80">Suggested field message of the week</h3>
        <p className="mt-1 text-[11px] text-kelly-text/65">
          Category: <strong className="text-kelly-text/80">{fieldMessageOfWeek.categoryLabel}</strong> — practice aloud; adapt slots to your turf.
        </p>
        <p className="mt-2 font-heading text-base font-bold text-kelly-navy">{fieldMessageOfWeek.headline}</p>
        <blockquote className="mt-2 border-l-2 border-kelly-navy/25 pl-3 text-sm italic leading-relaxed text-kelly-text/85">
          {fieldMessageOfWeek.script}
        </blockquote>
      </div>

      <div>
        <h3 className="text-xs font-bold uppercase tracking-widest text-kelly-slate/70">Follow-up needs</h3>
        <p className="mt-1 text-[11px] text-kelly-text/60">Open follow-up obligations in the preview ledger — totals only on this surface.</p>
        <div className="mt-2 overflow-x-auto rounded-xl border border-kelly-text/10">
          <table className="w-full min-w-[480px] text-left text-sm">
            <thead className="bg-kelly-navy/8 text-[10px] font-bold uppercase tracking-wide text-kelly-text/70">
              <tr>
                <th className="px-3 py-2">Theme</th>
                <th className="px-3 py-2">Open (preview)</th>
                <th className="px-3 py-2">Notes</th>
              </tr>
            </thead>
            <tbody>
              {followUpNeeds.map((row) => (
                <tr key={row.theme} className="border-t border-kelly-text/5 odd:bg-kelly-page/50">
                  <td className="px-3 py-2 font-medium text-kelly-text/90">{row.theme}</td>
                  <td className="px-3 py-2 font-mono tabular-nums text-kelly-navy/90">{row.openCount}</td>
                  <td className="px-3 py-2 text-xs text-kelly-text/65">{row.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
