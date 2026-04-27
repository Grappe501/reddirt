import { countyDashboardCardClass } from "@/components/county/dashboard/countyDashboardClassNames";
import { CountySectionHeader } from "@/components/county/dashboard/CountySectionHeader";
import { CountySourceBadge } from "@/components/county/dashboard/countyDashboardFormat";
import type {
  MessageIntelligenceCategoryRow,
  MessageIntelligencePipelineMove,
  MessageIntelligenceThemeRow,
} from "@/lib/message-engine/message-intelligence-dashboard";
import { cn } from "@/lib/utils";

type Props = {
  className?: string;
  windowLabel: string;
  themes: MessageIntelligenceThemeRow[];
  categoriesInUse: MessageIntelligenceCategoryRow[];
  pipelineMovement: MessageIntelligencePipelineMove[];
};

function ThemeBar({ label, sharePercent, note }: MessageIntelligenceThemeRow) {
  return (
    <div>
      <div className="flex items-baseline justify-between gap-2 text-xs">
        <span className="font-medium text-kelly-text/90">{label}</span>
        <span className="shrink-0 font-mono tabular-nums text-kelly-navy/90">{sharePercent}%</span>
      </div>
      <div className="mt-1 h-2 overflow-hidden rounded-full bg-kelly-slate/10">
        <div
          className="h-full rounded-full bg-kelly-navy/55"
          style={{ width: `${Math.min(100, Math.max(0, sharePercent))}%` }}
        />
      </div>
      {note ? <p className="mt-0.5 text-[10px] text-kelly-text/55">{note}</p> : null}
    </div>
  );
}

/**
 * Aggregate-only snapshot: conversation themes, category mix, pipeline movement.
 * Pair with demo/seed labeling at the parent — no individual-level data.
 */
export function MessagePerformancePreview({ className, windowLabel, themes, categoriesInUse, pipelineMovement }: Props) {
  return (
    <section className={cn(countyDashboardCardClass, "space-y-4", className)}>
      <CountySectionHeader
        overline="Message performance"
        title="Themes, categories, pipeline"
        description={
          <span className="flex flex-wrap items-center gap-2">
            <span>{windowLabel}</span>
            <CountySourceBadge source="demo" note="Illustrative shares until logged conversation aggregates connect." />
          </span>
        }
      />
      <div className="mt-4 grid gap-6 lg:grid-cols-2">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-widest text-kelly-slate/70">Top conversation themes</h3>
          <p className="mt-1 text-[11px] text-kelly-text/60">Themed buckets from organizer logs — counts rolled up, no quotes attributed to individuals here.</p>
          <ul className="mt-3 space-y-3">
            {themes.map((t) => (
              <li key={t.label}>
                <ThemeBar {...t} />
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="text-xs font-bold uppercase tracking-widest text-kelly-slate/70">Message categories in use</h3>
          <p className="mt-1 text-[11px] text-kelly-text/60">Template taxonomy from the message workbench — share of tagged uses in the preview window.</p>
          <ul className="mt-3 flex flex-wrap gap-2">
            {categoriesInUse.map((c) => (
              <li
                key={c.label}
                className="rounded-lg border border-kelly-text/10 bg-kelly-page px-2.5 py-1.5 text-xs text-kelly-text/85"
              >
                <span className="font-semibold text-kelly-navy/90">{c.useSharePercent}%</span>{" "}
                <span className="text-kelly-text/75">{c.label}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div>
        <h3 className="text-xs font-bold uppercase tracking-widest text-kelly-slate/70">Pipeline movement from conversations</h3>
        <p className="mt-1 text-[11px] text-kelly-text/60">Stage-to-stage deltas — positive means more conversations advanced vs the prior window.</p>
        <ul className="mt-3 space-y-2">
          {pipelineMovement.map((p) => (
            <li
              key={`${p.fromLabel}-${p.toLabel}`}
              className="flex flex-col gap-0.5 rounded-xl border border-kelly-text/8 bg-kelly-navy/[0.03] px-3 py-2 text-sm sm:flex-row sm:items-center sm:justify-between"
            >
              <span className="text-kelly-text/85">
                <span className="font-medium text-kelly-navy/90">{p.fromLabel}</span>
                <span className="text-kelly-text/50"> → </span>
                <span className="font-medium text-kelly-navy/90">{p.toLabel}</span>
              </span>
              <span className="font-mono text-xs text-kelly-text/75">
                +{p.deltaPercentPoints} pts · +{p.conversationDelta} conv.{" "}
                <span className="text-kelly-text/55">({p.windowNote})</span>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
