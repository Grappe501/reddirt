import Link from "next/link";
import { RegionActionPanel } from "./RegionActionPanel";
import { RegionComparisonTable } from "./RegionComparisonTable";
import { RegionCountyGrid } from "./RegionCountyGrid";
import { RegionDashboardShell } from "./RegionDashboardShell";
import { RegionKpiStrip } from "./RegionKpiStrip";
import { RegionMapPanel } from "./RegionMapPanel";
import { RegionNextCountiesToBuildPanel } from "./RegionNextCountiesToBuildPanel";
import { RegionOrganizingGatewayBand } from "./RegionOrganizingGatewayBand";
import { RegionPowerOf5Panel } from "./RegionPowerOf5Panel";
import { RegionPrimaryComparisonCards } from "./RegionPrimaryComparisonCards";
import { RegionRiskPanel } from "./RegionRiskPanel";
import { RegionStrategyPanel } from "./RegionStrategyPanel";
import type { RegionDashboard } from "@/lib/campaign-engine/regions/types";
import { CountySourceBadge } from "@/components/county/dashboard";
import { MessageIntelligencePanel } from "@/components/message-engine/MessageIntelligencePanel";
import { PowerOf5RelationalCharts } from "@/components/power-of-5";
import { cn, focusRing, tapMinSmCompact } from "@/lib/utils";

type Props = {
  data: RegionDashboard;
  /** E.g. River Valley — show anchor CTA to Pope v2. */
  showPopeAnchorCta?: boolean;
};

const popeV2 = "/county-briefings/pope/v2";

export function RegionDashboardView({ data, showPopeAnchorCta }: Props) {
  return (
    <RegionDashboardShell>
      <p className="text-sm text-kelly-text/65">
        <Link className={cn(focusRing, "rounded-sm font-semibold text-kelly-navy underline")} href="/organizing-intelligence">
          ← State organizing intelligence
        </Link>
      </p>
      <p className="mt-2 text-xs font-bold uppercase tracking-widest text-kelly-slate/80">Command region</p>
      <h1 className="font-heading mt-1 text-3xl font-bold text-kelly-navy md:text-4xl">{data.displayName}</h1>
      <p className="mt-1 text-sm text-kelly-text/75">{data.dataDisclaimer}</p>
      {data.taxonomyNote ? (
        <p className="mt-3 rounded-lg border border-kelly-text/10 bg-kelly-page/90 p-3 text-sm text-kelly-text/75">
          <span className="font-bold text-kelly-navy/90">Taxonomy note. </span>
          {data.taxonomyNote}
        </p>
      ) : null}

      {showPopeAnchorCta ? (
        <div
          className={cn(
            "mt-4 flex flex-col gap-3 rounded-2xl border-2 border-kelly-navy/20 bg-gradient-to-r from-kelly-navy/8 to-kelly-page/95 p-4 sm:flex-row sm:items-center sm:justify-between",
          )}
        >
          <div>
            <p className="text-xs font-extrabold uppercase tracking-widest text-kelly-navy/80">Anchor county — Pope</p>
            <p className="mt-1 text-sm text-kelly-text/85">
              Drill into the full county intelligence v2: Power of 5, city drilldowns, strategy, and honest data gaps.
            </p>
          </div>
          <Link
            href={popeV2}
            className={cn(
              focusRing,
              tapMinSmCompact,
              "inline-flex w-full shrink-0 justify-center rounded-xl bg-kelly-navy px-5 py-2.5 text-sm font-extrabold text-white shadow-sm hover:bg-kelly-navy/90 sm:w-auto",
            )}
          >
            Open Pope v2 →
          </Link>
        </div>
      ) : null}

      <RegionOrganizingGatewayBand className="mt-6" gateway={data.gateway} />

      <div className="mt-3 flex flex-wrap items-baseline gap-2 text-xs text-kelly-text/60">
        <span>Counties in payload:</span>
        <span className="font-mono font-bold text-kelly-navy/90">{data.countyCount.value}</span>
        <CountySourceBadge source={data.countyCount.source} note={data.countyCount.note} />
        {data.countyCount.note ? <span className="w-full sm:w-auto">{data.countyCount.note}</span> : null}
      </div>

      {data.primaryComparisonRow ? (
        <RegionPrimaryComparisonCards
          className="mt-8"
          overline={data.primaryComparisonRow.overline}
          title={data.primaryComparisonRow.title}
          description={data.primaryComparisonRow.description}
          cards={data.primaryComparisonRow.cards}
        />
      ) : null}

      <RegionCountyGrid
        className="mt-10"
        overline="Counties in this region"
        title="County grid & drills"
        description={
          data.countyGridDescription ??
          (data.campaignRegionSlug === "northwest-arkansas"
            ? "Registry northwest bucket: Benton and Washington = primary; Carroll and Madison = nearby. Each tile links to county command, the OIS county placeholder, and (when live) the published dashboard. Team/coverage stay demo/seed until each county v2 is built."
            : data.campaignRegionSlug === "river-valley"
              ? "Pope = anchor (FIPS 05115 override). Other tiles are planning scaffolds with demo team/coverage until the region FIPS map expands."
              : "75-county registry rows in this campaign bucket. Per-county team/coverage are demo/seed until each county v2 is built. Path: county command + OIS placeholder → published county intel when it exists.")
        }
        counties={data.counties}
      />

      {data.nextCountiesToBuild ? (
        <RegionNextCountiesToBuildPanel
          className="mt-10"
          overline={data.nextCountiesToBuild.overline}
          title={data.nextCountiesToBuild.title}
          description={data.nextCountiesToBuild.description}
          items={data.nextCountiesToBuild.items}
        />
      ) : null}

      <div className="mt-10 grid min-w-0 gap-8 lg:grid-cols-3">
        <div className="min-w-0 space-y-8 lg:col-span-2">
          <RegionKpiStrip
            overline="Regional snapshot"
            title="Command strip (demo / seed KPIs)"
            description="Illustrative roll-up until multi-county field sync. Power of 5 headlines (invites, activations, activation rate) match the relational charts below — all labeled demo or derived from demo inputs."
            items={data.kpiItems}
            compact
          />
          <PowerOf5RelationalCharts data={data.relationalCharts} />
        </div>
        <div className="min-w-0">
          <RegionMapPanel
            overline="Geography"
            title={`${data.displayName} (placeholder)`}
            caption={data.mapCaption}
            regionLabelOnMap={data.displayName}
          />
        </div>
      </div>

      <RegionPowerOf5Panel className="mt-10" block={data.powerOf5} compact pipelineVariant="full" />

      <MessageIntelligencePanel className="mt-10" scope={{ level: "region", regionDisplayName: data.displayName }} />

      <RegionStrategyPanel className="mt-10" strategy={data.strategy} />

      <RegionComparisonTable className="mt-10" model={data.comparison} />

      <RegionActionPanel
        className="mt-10"
        overline="Top organizing priorities"
        title="Regional next moves (demo queue)"
        description="Example priorities for staff and captains — not live task assignments on the web. County execution stays in workbench and published county v2."
        actions={data.nextActions}
      />

      <RegionRiskPanel
        className="mt-10"
        description="No voter microdata; mitigations are process and posture, not a threat score."
        risks={data.risks}
      />
    </RegionDashboardShell>
  );
}
