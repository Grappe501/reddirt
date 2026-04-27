import Link from "next/link";
import { countyDashboardCardClass } from "@/components/county/dashboard/countyDashboardClassNames";
import { CountyKpiStrip, CountySourceBadge } from "@/components/county/dashboard";
import { NarrativeDistributionSummaryPanel } from "@/components/integrations/NarrativeDistributionSummaryPanel";
import { MessageIntelligencePanel } from "@/components/message-engine/MessageIntelligencePanel";
import { PowerOf5DashboardPanel, PowerOf5RelationalCharts } from "@/components/power-of-5";
import { GlossaryTerm } from "@/components/teaching/GlossaryTerm";
import type { StateOrganizingIntelligencePayload } from "@/lib/campaign-engine/state-organizing-intelligence/build-state-oi-dashboard";
import { cn, focusRing } from "@/lib/utils";

const STATE_P5_IMPACT =
  "Power of 5 metrics roll up from county relational work into this statewide ladder. All figures on this page remain demo/seed or registry-derived until live pipelines connect — no voter microdata in public OIS.";

function StateMapPlaceholder() {
  return (
    <div
      className="flex min-h-[200px] items-center justify-center rounded-2xl border border-dashed border-kelly-slate/35 bg-gradient-to-br from-kelly-navy/5 to-kelly-page/90 p-4"
      role="img"
      aria-label="Arkansas state map placeholder"
    >
      <svg viewBox="0 0 360 200" className="h-full max-h-[220px] w-full text-kelly-navy/20" aria-hidden>
        <rect width="360" height="200" className="fill-kelly-slate/5" />
        <text x="120" y="100" className="fill-kelly-navy/40 text-sm font-bold">
          Arkansas outline
        </text>
        <text x="80" y="128" className="fill-kelly-text/40 text-xs">
          Map tiles plug in when GeoJSON + public aggregates are available — no PII, no dep.
        </text>
      </svg>
    </div>
  );
}

export function StateOrganizingIntelligenceView({ data }: { data: StateOrganizingIntelligencePayload }) {
  return (
    <div className="mx-auto max-w-6xl px-[var(--gutter-x)] py-6 sm:py-8 text-kelly-text">
      <p className="text-xs font-bold uppercase tracking-widest text-kelly-slate/80">State dashboard · OIS-1</p>
      <h1 className="font-heading mt-1 text-3xl font-bold text-kelly-navy md:text-4xl">{data.title}</h1>
      <p className="mt-2 max-w-3xl text-sm leading-relaxed text-kelly-text/80">
        Top of the drill-down ladder. Numbers roll <strong>up</strong> from place-based organizing; you steer from here and
        execute in <strong>county and region</strong> tools. This hub is the campaign&apos;s public{" "}
        <GlossaryTerm term="organizingIntelligence">organizing intelligence</GlossaryTerm> view—designed as a{" "}
        <strong>self-teaching</strong> map (hover dotted terms anywhere on the site for plain definitions).
      </p>
      <p className="mt-3 rounded-lg border border-amber-200/80 bg-amber-50/90 px-3 py-2 text-sm text-amber-950 dark:border-amber-500/35 dark:bg-amber-950/50 dark:text-amber-100">
        <strong>Data policy.</strong> {data.dataDisclaimer}{" "}
        <span className="font-medium">
          <GlossaryTerm term="demoSeed">Demo / seed</GlossaryTerm>
        </span>{" "}
        is the site&apos;s shorthand for &quot;illustration only&quot;—hover or focus the dotted term anytime.
      </p>
      <p className="mt-3 text-sm text-kelly-text/75">
        Gold-standard county example:{" "}
        <Link className={cn(focusRing, "rounded-sm font-semibold text-kelly-navy underline")} href="/county-briefings/pope/v2">
          Pope County — dashboard v2
        </Link>{" "}
        (dense command layout, Power of 5, labeled demo/seed). County command:{" "}
        <Link className={cn(focusRing, "rounded-sm text-kelly-navy underline")} href="/counties/pope-county">
          /counties/pope-county
        </Link>
        .
      </p>
      <p className="mt-2 text-sm text-kelly-text/75">
        Volunteer views (demo tiles, no login yet):{" "}
        <Link className={cn(focusRing, "rounded-sm font-semibold text-kelly-navy underline")} href="/dashboard">
          My dashboard
        </Link>
        {" · "}
        <Link className={cn(focusRing, "rounded-sm font-semibold text-kelly-navy underline")} href="/dashboard/leader">
          Leader dashboard
        </Link>
        . Operators:{" "}
        <Link className={cn(focusRing, "rounded-sm font-semibold text-kelly-navy underline")} href="/admin/organizing-intelligence">
          Admin organizing intelligence
        </Link>{" "}
        (cookie session).
      </p>

      <CountyKpiStrip
        className="mt-10"
        overline="Statewide"
        title="KPI command strip — executive + Power of 5"
        description="Read left to right: scale → teams → coverage → relational depth (invites, activations, KPI engine). Demo fields are labeled."
        items={data.kpiStripItems}
        compact
      />

      <PowerOf5RelationalCharts className="mt-10" data={data.relationalCharts} />

      <MessageIntelligencePanel className="mt-10" scope={{ level: "state" }} />

      <NarrativeDistributionSummaryPanel className="mt-10" />

      <section className="mt-10">
        <h2 className="border-b border-kelly-navy/15 pb-2 font-heading text-xl font-bold text-kelly-navy">State map (placeholder)</h2>
        <p className="mt-1 text-xs text-kelly-text/60">Choropleth and dot-density connect later; aggregate-only in public v1 per DATA-1.</p>
        <div className="mt-3">
          <StateMapPlaceholder />
        </div>
      </section>

      <section className="mt-10">
        <h2 className="border-b border-kelly-navy/15 pb-2 font-heading text-xl font-bold text-kelly-navy">Arkansas region grid</h2>
        <p className="mt-1 text-sm text-kelly-text/70">
          Eight <GlossaryTerm term="campaignRegion">campaign regions</GlossaryTerm> (CANON-REGION-1).{" "}
          <strong>County count</strong> in each card is <strong>derived</strong> from the 75-county registry + FIPS display
          overrides. Rollup and team numbers are <strong>demo/seed</strong>.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {data.regionRollups.map((r) => (
            <Link
              key={r.slug}
              href={r.href}
              className={cn(
                focusRing,
                "group block rounded-2xl border border-kelly-text/10 bg-kelly-page/95 p-4 shadow-sm transition hover:border-kelly-navy/35 hover:shadow-elevated",
              )}
            >
              <p className="text-[10px] font-bold uppercase tracking-widest text-kelly-slate/70">Region</p>
              <p className="mt-0.5 font-heading text-base font-bold text-kelly-navy group-hover:underline">{r.displayName}</p>
              <ul className="mt-2 space-y-1 text-xs text-kelly-text/80">
                <li>
                  Counties in bucket: <strong>{r.countyCount.value}</strong> <CountySourceBadge source="derived" />
                </li>
                <li>
                  Rollup readiness: <strong>{r.rollupReadiness.value}/100</strong>{" "}
                  <CountySourceBadge source="demo" note={r.rollupReadiness.note} />
                </li>
                <li>
                  Power Teams (demo): <strong>{r.powerTeamsPlanned.value}</strong>{" "}
                  <CountySourceBadge source="demo" />
                </li>
              </ul>
              {r.taxonomyNote ? <p className="mt-2 line-clamp-2 text-[10px] text-kelly-text/50">{r.taxonomyNote}</p> : null}
              <p className="mt-2 text-[10px] font-bold text-kelly-slate/80">Open region view →</p>
            </Link>
          ))}
        </div>
      </section>

      <PowerOf5DashboardPanel
        className="mt-10"
        overline="Power of 5"
        title="Organizing pipeline — statewide"
        impactExplanation={STATE_P5_IMPACT}
        intro="Six stages mirror `lib/power-of-5/pipelines.ts`. Detailed counts live in the KPI strip above; this block is the shared ladder every dashboard level uses."
        items={[]}
        pipelineVariant="full"
      />

      <section className="mt-10">
        <h2 className="border-b border-kelly-navy/15 pb-2 font-heading text-xl font-bold text-kelly-navy">County readiness — sample (demo)</h2>
        <p className="mt-1 text-xs text-kelly-text/60">
          Illustrative scores only. <strong>County and region names</strong> are public; readiness is <strong>not</strong> a voter
          or persuasion model.
        </p>
        <p className="mt-2 text-xs text-kelly-text/65 sm:hidden">Swipe horizontally to see all columns.</p>
        <div className="mt-2 touch-pan-x overflow-x-auto overscroll-x-contain rounded-2xl border border-kelly-text/10">
          <table className="w-full min-w-[640px] text-left text-sm">
            <caption className="sr-only">Sample county readiness scores, demonstration data only</caption>
            <thead className="bg-kelly-navy/8 text-xs font-bold uppercase tracking-wide text-kelly-text/75">
              <tr>
                <th scope="col" className="px-3 py-3 text-left">
                  County
                </th>
                <th scope="col" className="px-3 py-3 text-left">
                  Campaign region
                </th>
                <th scope="col" className="px-3 py-3 text-left">
                  Readiness (demo)
                </th>
                <th scope="col" className="px-3 py-3 text-left">
                  Notes
                </th>
              </tr>
            </thead>
            <tbody>
              {data.countyReadinessSample.map((row) => (
                <tr key={row.countySlug} className="border-t border-kelly-text/5 odd:bg-kelly-page/50">
                  <td className="px-3 py-3 align-top">
                    <div className="space-y-1">
                      {row.countySlug === "pope-county" ? (
                        <Link className={cn(focusRing, "rounded-sm font-semibold text-kelly-navy underline")} href="/county-briefings/pope/v2">
                          {row.countyName}
                        </Link>
                      ) : (
                        <Link
                          className={cn(focusRing, "rounded-sm font-medium text-kelly-navy underline decoration-kelly-navy/40")}
                          href={`/counties/${row.countySlug}`}
                        >
                          {row.countyName}
                        </Link>
                      )}
                      <div>
                        <Link
                          className={cn(focusRing, "text-[11px] font-semibold text-kelly-slate underline")}
                          href={`/organizing-intelligence/counties/${row.countySlug}`}
                        >
                          OIS county (placeholder) →
                        </Link>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-3 align-top text-kelly-text/85">{row.regionDisplay}</td>
                  <td className="px-3 py-3 align-top font-mono text-kelly-navy/90">
                    {row.readiness.value} <CountySourceBadge source="demo" />
                  </td>
                  <td className="px-3 py-3 align-top text-xs text-kelly-text/70">{row.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-10">
        <h2 className="border-b border-kelly-navy/15 pb-2 font-heading text-xl font-bold text-kelly-navy">What this means / what to do next</h2>
        <div className={cn(countyDashboardCardClass, "mt-3 max-w-3xl space-y-3")}>
          <p className="text-sm leading-relaxed text-kelly-text/85">
            <span className="font-bold text-kelly-navy">What this means: </span>
            {data.strategy.whatThisMeans}
          </p>
          <p className="text-sm leading-relaxed text-kelly-text/85">
            <span className="font-bold text-kelly-navy">What to do next: </span>
            {data.strategy.whatToDoNext}
          </p>
        </div>
      </section>
    </div>
  );
}
