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
  className,
}: Props) {
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
              · <strong>Command registry (id unchanged, ARK list):</strong> {registryCommandRegionLabel}
            </>
          ) : null}
          . NWA / River Valley peer tables stay <strong>standard</strong> rows, not one-off page CSS, when region dashboards
          ship (Packet 12–13).
        </p>
        <p className="mt-2">
          City and precinct drilldowns (when live) <strong>feed up</strong> to this county view; this county view feeds the
          region. Numbers roll up; tactics sharpen down.
        </p>
        {regionOrganizingIntelligenceHref ? (
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
        {stateOrganizingIntelligenceHref ? (
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
