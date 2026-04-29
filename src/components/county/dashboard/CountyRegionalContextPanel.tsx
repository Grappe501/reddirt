import Link from "next/link";
import { countyDashboardCardClass } from "./countyDashboardClassNames";
import { CountySectionHeader } from "./CountySectionHeader";
import { cn, focusRing } from "@/lib/utils";

type Props = {
  overline?: string;
  title?: string;
  description?: string;
  riverValleyNarrative: string;
  /** Stakeholder campaign name from `arkansas-campaign-regions` (e.g. River Valley for Pope). */
  regionLabel: string;
  /** Optional: long label from `regionLabelForId` when the command registry id differs from campaign story. */
  registryCommandRegionLabel?: string;
  /** Link to `/organizing-intelligence` (state rollup). */
  stateOrganizingIntelligenceHref?: string;
  /** e.g. `/organizing-intelligence/regions/river-valley` — campaign region drill that receives this county’s aggregate when wired. */
  regionOrganizingIntelligenceHref?: string;
  /** Public county briefings: prefer statewide priorities + county index instead of field dashboards. */
  stateCampaignHref?: string;
  allCountiesHref?: string;
  className?: string;
};

/**
 * County roll-up to region + state, peer-table model, and drilldown feed-up copy.
 */
export function CountyRegionalContextPanel({
  overline = "Roll-up",
  title = "Region & state ladder",
  description = "How this county connects without bespoke one-off pages.",
  riverValleyNarrative,
  regionLabel,
  registryCommandRegionLabel,
  stateOrganizingIntelligenceHref,
  regionOrganizingIntelligenceHref,
  stateCampaignHref,
  allCountiesHref = "/counties",
  className,
}: Props) {
  const publicMode = Boolean(stateCampaignHref);
  return (
    <section className={className}>
      <CountySectionHeader overline={overline} title={title} description={description} />
      <div className={cn(countyDashboardCardClass, "mt-2 text-sm leading-relaxed")}>
        <p>{riverValleyNarrative}</p>
        <p className="mt-2">
          <strong>Campaign region:</strong> {regionLabel}
          {registryCommandRegionLabel ? (
            <>
              {" "}
              · <strong>Registry grouping:</strong> {registryCommandRegionLabel}
            </>
          ) : null}
          .
          {publicMode
            ? " This page stays county-scoped; statewide policy context lives on the priorities hub."
            : " NWA / River Valley peer tables stay standard rows when region dashboards ship."}
        </p>
        {!publicMode ? (
          <p className="mt-2">
            City and precinct drilldowns (when live) <strong>feed up</strong> to this county view; this county view feeds the
            region. Numbers roll up; tactics sharpen down.
          </p>
        ) : (
          <p className="mt-2 text-kelly-text/80">
            When verified drilldowns exist, geography still anchors to the same Secretary of State duties—fair process, clear
            rules, and services that reach every community.
          </p>
        )}
        {publicMode && stateCampaignHref ? (
          <p className="mt-3 text-sm text-kelly-text/85">
            <span className="font-bold text-kelly-navy">Statewide priorities: </span>
            <Link className={cn(focusRing, "rounded-sm font-semibold text-kelly-navy underline")} href={stateCampaignHref}>
              Kelly&apos;s platform for the office
            </Link>
            .
          </p>
        ) : null}
        {publicMode ? (
          <p className="mt-2 text-sm text-kelly-text/85">
            <span className="font-bold text-kelly-navy">All counties: </span>
            <Link className={cn(focusRing, "rounded-sm font-semibold text-kelly-navy underline")} href={allCountiesHref}>
              Arkansas county index
            </Link>
            .
          </p>
        ) : null}
        {!publicMode && regionOrganizingIntelligenceHref ? (
          <p className="mt-3 text-sm text-kelly-text/85">
            <span className="font-bold text-kelly-navy">Open region: </span>
            <Link
              className={cn(focusRing, "rounded-sm font-semibold text-kelly-navy underline")}
              href={regionOrganizingIntelligenceHref}
            >
              {regionLabel} — organizing intelligence
            </Link>{" "}
            (aggregate roll-up target for this campaign lens; numbers here stay county-scoped).
          </p>
        ) : null}
        {!publicMode && stateOrganizingIntelligenceHref ? (
          <p className="mt-2 text-sm text-kelly-text/85">
            <span className="font-bold text-kelly-navy">State ladder: </span>
            <Link className={cn(focusRing, "rounded-sm font-semibold text-kelly-navy underline")} href={stateOrganizingIntelligenceHref}>
              Arkansas — state organizing intelligence
            </Link>{" "}
            (all eight regions, demo/seed where labeled).
          </p>
        ) : null}
      </div>
    </section>
  );
}
