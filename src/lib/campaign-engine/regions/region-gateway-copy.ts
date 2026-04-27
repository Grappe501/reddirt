/**
 * Volunteer-facing region intros for public OIS gateway pages (Pass 7).
 * Pair with `dataDisclaimer` / badges for demo vs derived county lists.
 */
import type { ArkansasCampaignRegionSlug } from "./arkansas-campaign-regions";

export type RegionGatewayCopy = {
  headline: string;
  body: string;
};

const GATEWAY: Record<ArkansasCampaignRegionSlug, RegionGatewayCopy> = {
  "northwest-arkansas": {
    headline: "Northwest Arkansas — commuter, campus, and growth basins",
    body: "This gateway shows every county in the NWA command bucket, where Benton and Washington carry the heaviest organizing load, and how demo Power of 5 rollups look when counties stack. Use county command for ground truth; numbers here stay aggregate and labeled until field pipelines land.",
  },
  "central-arkansas": {
    headline: "Central Arkansas — capital belt and folded west-central corridor",
    body: "Central on this site merges registry **central** and **west_central** rows into one stakeholder region (Little Rock–adjacent basins through the Ouachita / Hot Springs / Fort Smith field story). Scan the county grid, then open command pages for each county. Pope is **not** listed here — it maps to River Valley under CANON-REGION-1.",
  },
  "river-valley": {
    headline: "River Valley — I-40 / corridor story with Pope as anchor",
    body: "River Valley is a **campaign** lens: Pope County (FIPS 05115) is the live anchor with a full public v2 shell. Neighboring registry counties appear as **planning scaffolds** until stakeholders extend the FIPS map — treat their team/coverage tiles as layout demos, not file facts.",
  },
  "north-central-ozarks": {
    headline: "North Central / Ozarks — ridge, river, and gateway counties",
    body: "This strip covers the **north_central** registry bucket for public rollups. It is the right place to assign captains county-by-county, see demo relational KPIs, and line up the next county dashboards — without implying voter-level coverage on the open web.",
  },
  "northeast-arkansas": {
    headline: "Northeast Arkansas — Upper Delta and ridge communities",
    body: "Jonesboro and surrounding counties anchor relational work here. The grid lists every in-bucket county from the 75-row map; use it to brief volunteers on **where** we organize next, then send them to Power of 5 onboarding and the Conversations hub for **how** to talk.",
  },
  "delta-eastern-arkansas": {
    headline: "Delta / Eastern Arkansas — eastern registry bucket, Delta-leaning story",
    body: "Stakeholder language may say “Delta” or “east”; the slug `delta-eastern-arkansas` is the OIS key (default from registry **southeast**). Counties below are the public command anchors — scroll for demo Power of 5 status, priorities, and the roadmap for deeper county pages.",
  },
  "southeast-arkansas": {
    headline: "Southeast Arkansas — southern tier counties",
    body: "This region maps registry **south** into a single campaign strip for volunteers and staff. County tiles link to command; when a county earns a v2-style intel page, it will surface the same way Pope does in River Valley. Until then, treat rollups as **demo / preview**.",
  },
  "southwest-arkansas": {
    headline: "Southwest Arkansas — timber, hills, and cross-border economics",
    body: "Texarkana-adjacent and hill-country counties roll up here for planning. Use the priorities and action cards as **examples** of how a regional desk thinks — not as automated task assignments. Relational depth still starts in onboarding and county teams.",
  },
};

export function getRegionGatewayCopy(slug: ArkansasCampaignRegionSlug): RegionGatewayCopy {
  return GATEWAY[slug];
}
