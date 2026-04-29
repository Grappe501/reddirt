import { CountySectionHeader } from "./CountySectionHeader";
import { formatCountyDashboardNumber } from "./countyDashboardFormat";
import { countyDashboardCardClass } from "./countyDashboardClassNames";
import { cn } from "@/lib/utils";

export type BriefingCityAnchor = {
  name: string;
  /** Short status line — placeholders must stay honest ("Data integration in progress"). */
  status: string;
};

type Props = {
  className?: string;
  eyebrow: string;
  countyDisplayName: string;
  executiveSummary: string;
  /** Top-level narrative block heading (fixed campaign-wide). */
  whyMattersTitle?: string;
  whyMattersBody: string;
  populationDisplay: number | null;
  majorCitiesLine: string;
  growthPatternsNote: string;
  politicalLandscape: string;
  priorityWhyCountyMatters: string;
  /** Qualitative framing only — never numeric targets here. */
  whatWinningLooksLike: string;
  cityAnchors: BriefingCityAnchor[];
};

/**
 * Presentation layer for public county briefings: executive summary + geography + qualitative priorities.
 * Figures come from ingest only (population); everything else stays clearly labeled placeholder when incomplete.
 */
export function CountyBriefingDemoIntro({
  className,
  eyebrow,
  countyDisplayName,
  executiveSummary,
  whyMattersTitle = "Why this county matters in this campaign",
  whyMattersBody,
  populationDisplay,
  majorCitiesLine,
  growthPatternsNote,
  politicalLandscape,
  priorityWhyCountyMatters,
  whatWinningLooksLike,
  cityAnchors,
}: Props) {
  const popHuman = formatCountyDashboardNumber(populationDisplay);

  return (
    <div className={cn("space-y-8", className)}>
      <div
        className={cn(countyDashboardCardClass, "border-l-4 border-l-kelly-navy/55 bg-gradient-to-br from-white to-kelly-page/90 shadow-sm")}
      >
        <p className="text-[10px] font-extrabold uppercase tracking-[0.26em] text-kelly-slate/70">{eyebrow}</p>
        <h2 className="font-heading mt-2 text-lg font-bold text-kelly-navy">Executive summary</h2>
        <p className="mt-2 text-sm leading-relaxed text-kelly-text/85">{executiveSummary}</p>
      </div>

      <section aria-labelledby="county-briefing-why-matters-heading">
        <CountySectionHeader
          overline="Campaign framing"
          title={whyMattersTitle}
          description="Election administration affects every ballot returned in this county—this page explains scale and geography in plain language, not turnout targets."
        />
        <div className={cn(countyDashboardCardClass, "mt-3 text-sm leading-relaxed text-kelly-text/85")}>
          <p id="county-briefing-why-matters-heading" className="sr-only">
            {whyMattersTitle}
          </p>
          <p>{whyMattersBody}</p>
        </div>
      </section>

      <section aria-labelledby="county-overview-heading">
        <CountySectionHeader
          overline="County overview"
          title="Population, anchors, momentum"
          description="Federal demographic snapshots where available — otherwise explicit placeholder language."
        />
        <div className={cn(countyDashboardCardClass, "mt-3 grid gap-4 text-sm text-kelly-text/85 sm:grid-cols-3")}>
          <div className="sm:col-span-1">
            <p className="text-[11px] font-bold uppercase tracking-wide text-kelly-slate/70">Estimated population</p>
            <p id="county-overview-heading" className="font-heading mt-1 text-2xl font-bold text-kelly-navy">
              {populationDisplay != null ? popHuman : "—"}
            </p>
            <p className="mt-2 text-xs text-kelly-text/65">
              {populationDisplay != null ? "ACS / pooled public estimates when ingest supplies a number." : "Population row not on this ingest path — pending integration."}
            </p>
          </div>
          <div className="sm:col-span-2 space-y-3">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wide text-kelly-slate/70">Major population centers</p>
              <p className="mt-1.5 leading-relaxed">{majorCitiesLine}</p>
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wide text-kelly-slate/70">Growth & economy</p>
              <p className="mt-1.5 leading-relaxed">{growthPatternsNote}</p>
            </div>
          </div>
        </div>
      </section>

      <section aria-labelledby="political-landscape-heading">
        <CountySectionHeader overline="Political landscape" title="High-level context" description="Narrative only — verify certified canvass splits before quoting vote history externally." />
        <div className={cn(countyDashboardCardClass, "mt-3 text-sm leading-relaxed text-kelly-text/85")}>
          <p id="political-landscape-heading" className="sr-only">
            Political landscape
          </p>
          <p>{politicalLandscape}</p>
        </div>
      </section>

      <section aria-labelledby="priority-framing-heading">
        <CountySectionHeader overline={`${countyDisplayName} · priorities`} title="Attention, not quotas" description="Qualitative benchmarks only — precinct-level turnout modeling is labeled below when layered." />
        <div className={cn(countyDashboardCardClass, "mt-3 space-y-4 text-sm leading-relaxed text-kelly-text/85")}>
          <p id="priority-framing-heading" className="sr-only">
            County priority framing for {countyDisplayName}
          </p>
          <p>
            <span className="font-bold text-kelly-navy">Why this geography commands attention:</span> {priorityWhyCountyMatters}
          </p>
          <p>
            <span className="font-bold text-kelly-navy">What &quot;strong performance&quot; can mean:</span> {whatWinningLooksLike}{" "}
            <span className="text-kelly-text/70">(Interpretation—not a turnout or registration target.)</span>
          </p>
          <p className="rounded-md border border-kelly-blue/25 bg-kelly-blue/[0.05] px-3 py-2 text-xs text-kelly-text/75">
            <strong>Precinct-level breakdown</strong> and <strong>turnout modeling</strong> layers ship only when sourced tabulations are wired — until then consider them pending integration.
          </p>
        </div>
      </section>

      <section aria-labelledby="city-anchors-heading">
        <CountySectionHeader overline="Cities & communities" title="Named anchors — data where verified" description="Listed cities are anchors people recognize; KPI cards wait on verified ingest." />
        <ul className={cn(countyDashboardCardClass, "mt-3 divide-y divide-kelly-text/[0.08] text-sm leading-relaxed")}>
          <li id="city-anchors-heading" className="sr-only">
            Listed communities in {countyDisplayName}
          </li>
          {cityAnchors.map((c) => (
            <li key={c.name} className="flex flex-col gap-0.5 py-3 first:pt-0 last:pb-0 sm:flex-row sm:justify-between">
              <span className="font-heading font-bold text-kelly-navy">{c.name}</span>
              <span className="text-kelly-text/75">{c.status}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
