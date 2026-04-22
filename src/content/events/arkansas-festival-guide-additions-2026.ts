import type { FestRow } from "@/content/events/fest-row";

/**
 * Additional 2026 listings parsed from the public guide
 * https://festivalguidesandreviews.com/arkansas-festivals/ (same source as main list).
 * Skip entries marked DISCONTINUED on the guide.
 */
export const GUIDE_FESTIVAL_ADDITIONS_OFFICIAL: Partial<Record<string, string>> = {
  "eureka-spring-fling-rally-2026": "https://springflingrally.com/",
  "sheridan-timberland-bluegrass-2026": "https://www.facebook.com/profile.php?id=61557876851889",
  "eureka-carving-in-the-ozarks-2026": "https://www.facebook.com/carvingintheozarks",
  "fordyce-cotton-belt-2026": "https://www.facebook.com/cottonbeltfestival/",
  "fouke-monster-festival-2026": "https://www.facebook.com/FoukeMonsterFest/",
  "washington-bowie-heritage-2026": "https://www.bowieknifefest.com/",
  "siloam-dogwood-2026": "https://siloamchamber.com/dogwood-festival",
  "cherokee-village-pie-2026": "https://www.arkansaspiefestival.com/",
  "elkins-elkfest-2026": "https://www.facebook.com/profile.php?id=61556674973001",
  "hot-springs-savvy-golden-dream-2026":
    "https://www.facebook.com/events/2102537050511235/?acontext=%7B%22event_action_history%22%3A[%7B%22surface%22%3A%22external_search_engine%22%7D%2C%7B%22mechanism%22%3A%22attachment%22%2C%22surface%22%3A%22newsfeed%22%7D]%2C%22ref_notif_type%22%3Anull%7D",
  "jonesboro-oasis-arts-2026": "https://www.facebook.com/OasisArtsandEatsFest/",
  "morrilton-mountain-top-frolic-2026":
    "https://www.facebook.com/events/1874041263999150/?acontext=%7B%22mechanism%22%3A%22surface%22%2C%22surface%22%3A%22groups_highlight_units%22%7D]%2C%22ref_notif_type%22%3Anull%7D",
  "hot-springs-art-springs-2026": "https://hotspringsarts.org/",
  "mena-lum-abner-2026": "https://www.facebook.com/LumandAbnerFestival",
  "newport-delta-arts-2026": "https://www.facebook.com/DeltaArtsFestival",
  "harrisburg-festival-ridge-2026": "https://www.facebook.com/harrisburgchamber/",
  "lavaca-berry-2026": "https://www.facebook.com/profile.php?id=100064542645758",
  "waldron-turkey-track-2026": "https://www.facebook.com/profile.php?id=100064559324590",
  "benton-amplify-2026": "https://www.facebook.com/amplifyfest",
  "berryville-ice-cream-2026":
    "https://www.berryvillechamber.com/events/details/40th-annual-berryville-ice-cream-social-948",
  "jasper-buffalo-elk-2026": "https://www.facebook.com/buffaloriverelkfestival/",
  "west-memphis-freedom-2026": "https://www.facebook.com/thecityofwestmemphis",
  "greenwood-river-crawfish-2026": "https://www.sebastiancountyfair.com/about-5",
  "rose-bud-summerfest-2026":
    "https://events.ticketleap.com/tickets/summerfestrb/rose-bud-summerfest-2026",
};

export const GUIDE_FESTIVAL_ADDITIONS: FestRow[] = [
  { slug: "eureka-spring-fling-rally-2026", title: "Eureka Springs Spring Fling Rally", s: { m: 4, d: 22 }, e: { m: 4, d: 26 }, city: "Eureka Springs", countySlug: "carroll-county" },
  { slug: "sheridan-timberland-bluegrass-2026", title: "Timberland Bluegrass Revival", s: { m: 4, d: 23 }, e: { m: 4, d: 25 }, city: "Sheridan", countySlug: "grant-county" },
  { slug: "eureka-carving-in-the-ozarks-2026", title: "Carving in the Ozarks", s: { m: 4, d: 24 }, e: { m: 4, d: 25 }, city: "Eureka Springs", countySlug: "carroll-county" },
  { slug: "fordyce-cotton-belt-2026", title: "Fordyce on the Cotton Belt", s: { m: 4, d: 24 }, e: { m: 4, d: 25 }, city: "Fordyce", countySlug: "dallas-county" },
  { slug: "fouke-monster-festival-2026", title: "Fouke Monster Festival", s: { m: 4, d: 24 }, e: { m: 4, d: 25 }, city: "Fouke", countySlug: "miller-county" },
  { slug: "washington-bowie-heritage-2026", title: "James Black’s Bowie Heritage Festival", s: { m: 4, d: 24 }, e: { m: 4, d: 25 }, city: "Washington", countySlug: "hempstead-county" },
  { slug: "siloam-dogwood-2026", title: "Dogwood Festival", s: { m: 4, d: 24 }, e: { m: 4, d: 26 }, city: "Siloam Springs", countySlug: "benton-county" },
  { slug: "cherokee-village-pie-2026", title: "Arkansas Pie Festival", s: { m: 4, d: 25 }, city: "Cherokee Village", countySlug: "sharp-county" },
  { slug: "elkins-elkfest-2026", title: "Elkins Elkfest", s: { m: 4, d: 25 }, city: "Elkins", countySlug: "washington-county" },
  { slug: "hot-springs-savvy-golden-dream-2026", title: "Savvy’s Golden Dream Festival", s: { m: 4, d: 25 }, city: "Hot Springs", countySlug: "garland-county" },
  { slug: "jonesboro-oasis-arts-2026", title: "Oasis Arts & Eats Fest", s: { m: 4, d: 25 }, city: "Jonesboro", countySlug: "craighead-county" },
  { slug: "morrilton-mountain-top-frolic-2026", title: "Mountain Top Spring Frolic", s: { m: 4, d: 25 }, city: "Morrilton", countySlug: "conway-county" },
  { slug: "hot-springs-art-springs-2026", title: "Art Springs (Arts and The Park)", s: { m: 4, d: 25 }, e: { m: 4, d: 26 }, city: "Hot Springs", countySlug: "garland-county" },
  { slug: "mena-lum-abner-2026", title: "Lum and Abner Music and Arts Festival", s: { m: 6, d: 5 }, e: { m: 6, d: 6 }, city: "Mena", countySlug: "polk-county" },
  { slug: "newport-delta-arts-2026", title: "Delta Arts Festival", s: { m: 6, d: 5 }, e: { m: 6, d: 6 }, city: "Newport", countySlug: "jackson-county" },
  { slug: "harrisburg-festival-ridge-2026", title: "Festival on the Ridge", s: { m: 6, d: 6 }, city: "Harrisburg", countySlug: "poinsett-county" },
  { slug: "lavaca-berry-2026", title: "Lavaca Berry Festival", s: { m: 6, d: 6 }, city: "Lavaca", countySlug: "sebastian-county" },
  { slug: "waldron-turkey-track-2026", title: "Turkey Track Bluegrass Festival I", s: { m: 6, d: 11 }, e: { m: 6, d: 13 }, city: "Waldron", countySlug: "scott-county" },
  { slug: "benton-amplify-2026", title: "Amplify Festival", s: { m: 6, d: 12 }, e: { m: 6, d: 13 }, city: "Benton", countySlug: "saline-county" },
  { slug: "berryville-ice-cream-2026", title: "Berryville Ice Cream Social", s: { m: 6, d: 12 }, e: { m: 6, d: 13 }, city: "Berryville", countySlug: "carroll-county" },
  { slug: "jasper-buffalo-elk-2026", title: "Buffalo River Elk Festival", s: { m: 6, d: 26 }, e: { m: 6, d: 27 }, city: "Jasper", countySlug: "newton-county" },
  { slug: "west-memphis-freedom-2026", title: "West Memphis Freedom Fest", s: { m: 6, d: 26 }, city: "West Memphis", countySlug: "crittenden-county" },
  { slug: "greenwood-river-crawfish-2026", title: "River Valley Crawfish Festival", s: { m: 6, d: 18 }, e: { m: 6, d: 20 }, city: "Greenwood", countySlug: "sebastian-county" },
  { slug: "rose-bud-summerfest-2026", title: "Rose Bud Summerfest", s: { m: 6, d: 18 }, e: { m: 6, d: 20 }, city: "Rose Bud", countySlug: "white-county" },
];
