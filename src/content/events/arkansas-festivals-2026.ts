import type { EventItem } from "@/content/types";
import { getMovementRegionForCountySlug } from "@/content/arkansas-movement-regions";
import { getArkansasCityCenter } from "@/lib/maps/arkansas-city-centers";
import type { FestRow } from "@/content/events/fest-row";
import { GUIDE_FESTIVAL_ADDITIONS, GUIDE_FESTIVAL_ADDITIONS_OFFICIAL } from "@/content/events/arkansas-festival-guide-additions-2026";

/** Primary reference the campaign cross-checks; dates/vendors change — confirm before travel. */
export const FESTIVAL_INFO_SOURCE = "https://festivalguidesandreviews.com/arkansas-festivals/";

/** Organizer, venue, or guide-curated listing — not an endorsement. */
const OFFICIAL_LISTING_HREF_BASE: Partial<Record<string, string>> = {
  "el-dorado-tri-state-food-truck-2026": "https://www.facebook.com/eldofoodfest",
  "arkansas-cherry-blossom-hotsprings-2026": "https://hotspringssistercity.org/arkansas-cherry-blossom-festival-2/",
  "scorched-mountain-flow-sidney-2026": "https://www.facebook.com/events/1478774379851282",
  "hogskin-holidays-hampton-2026": "https://www.hogskin-holidays.com/",
  "vintage-market-nwa-spring-2026": "https://vintagemarketdays.com/market/nw-arkansas/",
  "arkansas-roots-music-dyess-2026":
    "https://secure.touchnet.net/C20019_ustores/web/product_detail.jsp?PRODUCTID=1533",
  "festival-on-rails-mcneil-2026": "https://www.facebook.com/events/4275391496073289",
  "crawfish-festival-wilson-2026":
    "https://www.eventbrite.com/e/11th-annual-wilson-crawfish-festival-tickets-1978294590374",
  "cabot-strawberry-2026": "https://www.facebook.com/Strawberryfestivalcabot/",
  "lanterns-wildwood-lr-2026": "https://www.wildwoodlanterns.org/",
  "ar-times-craft-beer-2026": "https://www.facebook.com/events/1553365289379510/",
  "mountain-view-folk-2026": "https://mountainviewarkansas.com/arkansasfolkfest",
  "byrdfest-ozark-2026": "https://www.byrdfest.com/",
  "booneville-jazz-2026":
    "https://www.facebook.com/photo?fbid=10164519351686948&set=gm.1493926935489861&idorvanity=1303863214496235",
  "third-street-fair-fort-smith-2026": "https://www.facebook.com/events/3291382587710040",
  "arkansas-bee-day-2026":
    "https://www.facebook.com/events/13516-asher-road-little-rock-ar-united-states-arkansas-72206/bee-day-2026/898522883151252/",
  "blazin-bbq-manila-2026": "https://www.blazinbbqfestival.com/",
  "texarkana-catfish-mudbug-2026": "https://www.frontstreettxk.org/",
  "armadillo-festival-hamburg-2026": "https://www.facebook.com/hamburgareachamberofcommerce",
  "ar-times-spring-margarita-2026": "https://www.facebook.com/events/1263964655587008",
  "heart-ozarks-pickin-fayetteville-2026": "https://www.heartoftheozarkscraftfair.com/",
  "immaculate-conception-spring-fort-smith-2026": "https://www.facebook.com/ICSpringFest/",
  "steel-horse-rally-2026": "https://www.thesteelhorserally.com/",
  "mountain-view-iris-2026": "https://mountainviewirisfest.com/",
  "toad-suck-daze-2026": "https://www.toadsuck.org/",
  "arkansas-pottery-fest-2026":
    "https://communitycreativecenter.org/about-us/arkansas-pottery-festival/",
  "hotsprings-gem-mineral-2026": "https://www.facebook.com/hotspringsgemshow",
  "hotsprings-jeep-fest-2026": "https://hotspringsjeepfest.com/",
  "strawberry-jam-bald-knob-2026": "https://www.facebook.com/profile.php?id=100063765753249",
  "bentonville-whiskey-2026":
    "https://www.eventbrite.com/e/2026-bentonville-whiskey-festival-tickets-1977765591123",
  "cotter-trout-2026": "https://www.facebook.com/CotterGassvilleChamber",
  "fiesta-fest-de-queen-2026": "https://www.fiestafest.org/",
  "mayhaw-festival-el-dorado-2026": "https://www.mayhawfestival.com/",
  "brew-pig-sooie-2026":
    "https://arkansasrazorbacks.evenue.net/cgi-bin/ncommerce3/SEGetPackageInfo?packageCode=GS:IBM::BPS2:&linkID=arkansas",
  "peach-blossom-nashville-2026":
    "https://www.nashvillearcoc.com/event-details-registration/2026-peach-blossom-festival",
  "cinco-de-mayo-springdale-2026": "https://www.hwoa.org/cinco-de-mayo.html",
  "fiesta-fairfield-bay-2026": "https://visitfairfieldbay.com/events/fiesta-fest/",
  "bark-in-park-little-rock-2026": "https://www.facebook.com/downtownlr",
  "loose-caboose-paragould-2026": "https://www.loosecaboose.org/",
  "atkins-picklefest-2026": "https://www.facebook.com/peopleforabetteratkins",
  "magnolia-blossom-2026": "https://www.blossomfestival.org/",
  "osceola-heritage-music-2026": "https://www.osceolaheritagemusicfestival.com/",
  "pioneer-days-norfork-2026": "https://cityofnorfork.org/pioneer-days/",
  "fayetteville-strawberry-2026": "https://www.downtownfay.org/strawberry-festival",
  "old-fort-days-rodeo-2026": "https://www.oldfortdaysrodeo.com/",
  "mosquito-fest-mccrory-2026": "https://www.facebook.com/mosquitofestival/",
  "wynne-farmfest-2026": "https://www.facebook.com/wynnefarmfest/",
  "eureka-blues-party-2026": "https://eurekaspringsbluesparty.com/",
  "greers-ferry-lake-fest-2026": "https://www.greersferrylakefest.com/",
  "river-valley-food-truck-russellville-2026": "https://www.facebook.com/profile.php?id=61555597877500",
  "xi-flux-campout-2026": "https://www.facebook.com/events/1152864516580248",
  "bentonville-bbq-2026": "https://www.bentonvillebbqfestival.com/",
  "carpenters-country-ozark-2026": "https://www.facebook.com/carpenterscountryfest/",
  "petit-jean-lake-bailey-canoe-race-2026": "https://www.arkansasstateparks.com/events/annual-lake-bailey-canoe-race",
  "yellville-turkey-trot-2026": "https://yellvilleturkeytrot.com/",
};

const OFFICIAL_LISTING_HREF: Partial<Record<string, string>> = {
  ...OFFICIAL_LISTING_HREF_BASE,
  ...GUIDE_FESTIVAL_ADDITIONS_OFFICIAL,
};

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function iso(ymd: { y: number; m: number; d: number; h?: number; min?: number }) {
  return `${ymd.y}-${pad(ymd.m)}-${pad(ymd.d)}T${pad(ymd.h ?? 12)}:${pad(ymd.min ?? 0)}:00`;
}

function toEvent(r: FestRow): EventItem {
  const y = 2026;
  const officialHref = OFFICIAL_LISTING_HREF[r.slug];
  const region = getMovementRegionForCountySlug(r.countySlug) ?? "Central Arkansas";
  const end = r.e ?? r.s;
  const startsAt = iso({ y, m: r.s.m, d: r.s.d, h: 10, min: 0 });
  const endsAt = iso({ y, m: end.m, d: end.d, h: 21, min: 0 });
  const whenLabel =
    r.s.m === end.m && r.s.d === end.d
      ? `${r.s.m}/${r.s.d}/${y}`
      : `${r.s.m}/${r.s.d}–${end.m}/${end.d}/${y}`;
  const baseSum = `Festival in ${r.city} (${whenLabel}) — a community draw worth knowing for field planning and local visibility.`;
  const defaultVerify =
    "Sourced from public festival roundups; verify hours, fees, and road closures on the official site or chamber feed.";
  const noteBlock = r.note
    ? ` ${r.note} ${defaultVerify}`
    : ` ${defaultVerify}`;
  const mapCoordinates = getArkansasCityCenter(r.city) ?? undefined;
  return {
    slug: r.slug,
    title: r.title,
    type: "Fairs and Festivals",
    region,
    countySlug: r.countySlug,
    status: "upcoming",
    startsAt,
    endsAt,
    timezone: "America/Chicago",
    locationLabel: `${r.city}, Arkansas — venue TBA (check local listings)`,
    addressLine: `${r.city}, AR`,
    summary: baseSum,
    description: `${r.title} in ${r.city} during spring ${y}. Public festivals are third-party events—not campaign stops unless the team schedules a formal appearance.${noteBlock} See the Arkansas festivals guide and confirm details with organizers.`,
    whatToExpect: [
      "Dates and lineups that can shift (especially outdoor events)",
      "Parking and small-town road patterns worth scouting early",
      "Good neighbor etiquette: don’t repurpose private vendor photos without permission",
    ],
    whoItsFor: "Arkansans, volunteers scouting culture calendars, and visitors planning honest county-by-county time.",
    organizerNote: "Not hosted by the campaign. Field teams: double-check the official event page or city before listing travel on public schedules.",
    audienceTags: ["Families", "Youth", "All ages"],
    relatedEventSlugs: [],
    relatedResourceHrefs: [
      { label: "Festival directory (Arkansas)", href: FESTIVAL_INFO_SOURCE },
      ...(officialHref
        ? [{ label: "Primary listing (organizer / guide link)", href: officialHref }]
        : []),
      { label: "Campaign trail community feed", href: "/campaign-trail" },
    ],
    mapCoordinates,
    fieldAttendance:
      r.fieldAttendance === "tentative" || r.fieldAttendance === "confirmed" ? r.fieldAttendance : "unscheduled",
  };
}

const ROWS: FestRow[] = [
  { slug: "el-dorado-tri-state-food-truck-2026", title: "El Dorado Tri-State Food Truck Festival", s: { m: 4, d: 4 }, city: "El Dorado", countySlug: "union-county" },
  { slug: "arkansas-cherry-blossom-hotsprings-2026", title: "Arkansas Cherry Blossom Festival", s: { m: 4, d: 4 }, city: "Hot Springs", countySlug: "garland-county" },
  { slug: "scorched-mountain-flow-sidney-2026", title: "Scorched Mountain Music and Flow Fest", s: { m: 4, d: 9 }, e: { m: 4, d: 12 }, city: "Sidney", countySlug: "sharp-county" },
  { slug: "hogskin-holidays-hampton-2026", title: "Hogskin Holidays Festival", s: { m: 4, d: 10 }, e: { m: 4, d: 11 }, city: "Hampton", countySlug: "calhoun-county" },
  { slug: "vintage-market-nwa-spring-2026", title: "Vintage Market Days of NW Arkansas: Spring", s: { m: 4, d: 10 }, e: { m: 4, d: 12 }, city: "Bentonville", countySlug: "benton-county" },
  { slug: "arkansas-roots-music-dyess-2026", title: "Arkansas Roots Music Festival", s: { m: 4, d: 11 }, city: "Dyess", countySlug: "mississippi-county" },
  { slug: "festival-on-rails-mcneil-2026", title: "Festival on the Rails", s: { m: 4, d: 11 }, city: "McNeil", countySlug: "columbia-county" },
  { slug: "crawfish-festival-wilson-2026", title: "Crawfish Festival", s: { m: 4, d: 11 }, city: "Wilson", countySlug: "mississippi-county" },
  { slug: "cabot-strawberry-2026", title: "Cabot Strawberry Festival", s: { m: 4, d: 16 }, e: { m: 4, d: 18 }, city: "Cabot", countySlug: "lonoke-county" },
  { slug: "lanterns-wildwood-lr-2026", title: "Lanterns Festival at Wildwood Park", s: { m: 4, d: 16 }, e: { m: 4, d: 19 }, city: "Little Rock", countySlug: "pulaski-county" },
  { slug: "ar-times-craft-beer-2026", title: "Arkansas Times Craft Beer Festival", s: { m: 4, d: 17 }, city: "Little Rock", countySlug: "pulaski-county" },
  { slug: "mountain-view-folk-2026", title: "Mountain View Folk Festival", s: { m: 4, d: 17 }, e: { m: 4, d: 18 }, city: "Mountain View", countySlug: "stone-county" },
  { slug: "byrdfest-ozark-2026", title: "ByrdFest Music Festival", s: { m: 4, d: 17 }, e: { m: 4, d: 18 }, city: "Ozark", countySlug: "franklin-county" },
  { slug: "booneville-jazz-2026", title: "Booneville Jazz Fest", s: { m: 4, d: 18 }, city: "Booneville", countySlug: "logan-county" },
  { slug: "third-street-fair-fort-smith-2026", title: "3rd Street Fair", s: { m: 4, d: 18 }, city: "Fort Smith", countySlug: "sebastian-county" },
  { slug: "arkansas-bee-day-2026", title: "Arkansas Bee Day", s: { m: 4, d: 18 }, city: "Little Rock", countySlug: "pulaski-county" },
  { slug: "blazin-bbq-manila-2026", title: "Blazin' BBQ Festival", s: { m: 4, d: 18 }, city: "Manila", countySlug: "mississippi-county" },
  {
    slug: "texarkana-catfish-mudbug-2026",
    title: "Texarkana Catfish and Mudbug Music Festival",
    s: { m: 4, d: 18 },
    city: "Texarkana",
    countySlug: "miller-county",
    note:
      "Listings often place this downtown near Front Street Festival Plaza; confirm the footprint and any road closures for 2026.",
  },
  { slug: "armadillo-festival-hamburg-2026", title: "Armadillo Festival", s: { m: 4, d: 29 }, e: { m: 5, d: 2 }, city: "Hamburg", countySlug: "ashley-county" },
  { slug: "ar-times-spring-margarita-2026", title: "Arkansas Times Spring Margarita Festival", s: { m: 4, d: 30 }, city: "Little Rock", countySlug: "pulaski-county" },
  { slug: "heart-ozarks-pickin-fayetteville-2026", title: "Heart of the Ozarks Spring Pickin' Days", s: { m: 5, d: 1 }, e: { m: 5, d: 2 }, city: "Fayetteville", countySlug: "washington-county" },
  { slug: "immaculate-conception-spring-fort-smith-2026", title: "Immaculate Conception Spring Festival", s: { m: 5, d: 1 }, e: { m: 5, d: 2 }, city: "Fort Smith", countySlug: "sebastian-county" },
  { slug: "steel-horse-rally-2026", title: "The Steel Horse Rally", s: { m: 5, d: 1 }, e: { m: 5, d: 2 }, city: "Fort Smith", countySlug: "sebastian-county" },
  { slug: "mountain-view-iris-2026", title: "Mountain View Iris Festival", s: { m: 5, d: 1 }, e: { m: 5, d: 2 }, city: "Mountain View", countySlug: "stone-county" },
  { slug: "toad-suck-daze-2026", title: "Toad Suck Daze", s: { m: 5, d: 1 }, e: { m: 5, d: 3 }, city: "Conway", countySlug: "faulkner-county" },
  { slug: "arkansas-pottery-fest-2026", title: "Arkansas Pottery Festival", s: { m: 5, d: 1 }, e: { m: 5, d: 3 }, city: "Fayetteville", countySlug: "washington-county" },
  { slug: "hotsprings-gem-mineral-2026", title: "Hot Springs Gem and Mineral Show", s: { m: 5, d: 1 }, e: { m: 5, d: 3 }, city: "Hot Springs", countySlug: "garland-county" },
  { slug: "hotsprings-jeep-fest-2026", title: "Hot Springs Jeep Fest", s: { m: 5, d: 1 }, e: { m: 5, d: 3 }, city: "Hot Springs", countySlug: "garland-county" },
  { slug: "strawberry-jam-bald-knob-2026", title: "Strawberry Jam", s: { m: 5, d: 2 }, city: "Bald Knob", countySlug: "white-county" },
  { slug: "bentonville-whiskey-2026", title: "Bentonville Whiskey Festival", s: { m: 5, d: 2 }, city: "Bentonville", countySlug: "benton-county" },
  { slug: "cotter-trout-2026", title: "Cotter Trout Festival", s: { m: 5, d: 2 }, city: "Cotter", countySlug: "baxter-county" },
  { slug: "fiesta-fest-de-queen-2026", title: "Fiesta Fest (De Queen)", s: { m: 5, d: 2 }, city: "De Queen", countySlug: "sevier-county" },
  { slug: "mayhaw-festival-el-dorado-2026", title: "Mayhaw Festival", s: { m: 5, d: 2 }, city: "El Dorado", countySlug: "union-county" },
  { slug: "brew-pig-sooie-2026", title: "Brew Pig Sooie: Outdoor Beer Festival", s: { m: 5, d: 2 }, city: "Fayetteville", countySlug: "washington-county" },
  { slug: "peach-blossom-nashville-2026", title: "Peach Blossom Festival", s: { m: 5, d: 2 }, city: "Nashville", countySlug: "howard-county" },
  { slug: "cinco-de-mayo-springdale-2026", title: "Cinco de Mayo Festival", s: { m: 5, d: 2 }, city: "Springdale", countySlug: "washington-county" },
  { slug: "fiesta-fairfield-bay-2026", title: "Fairfield Bay Fiesta Fest", s: { m: 5, d: 3 }, city: "Fairfield Bay", countySlug: "van-buren-county" },
  { slug: "bark-in-park-little-rock-2026", title: "Bark in the Park (formerly Barkus on Main)", s: { m: 5, d: 3 }, city: "Little Rock", countySlug: "pulaski-county" },
  { slug: "loose-caboose-paragould-2026", title: "Loose Caboose Festival", s: { m: 5, d: 14 }, e: { m: 5, d: 16 }, city: "Paragould", countySlug: "greene-county" },
  { slug: "atkins-picklefest-2026", title: "Atkins Picklefest", s: { m: 5, d: 15 }, e: { m: 5, d: 16 }, city: "Atkins", countySlug: "pope-county" },
  { slug: "magnolia-blossom-2026", title: "Magnolia Blossom Festival", s: { m: 5, d: 15 }, e: { m: 5, d: 16 }, city: "Magnolia", countySlug: "columbia-county" },
  { slug: "osceola-heritage-music-2026", title: "Osceola Heritage Music Festival", s: { m: 5, d: 15 }, e: { m: 5, d: 16 }, city: "Osceola", countySlug: "mississippi-county" },
  { slug: "pioneer-days-norfork-2026", title: "Pioneer Days", s: { m: 5, d: 16 }, city: "Norfork", countySlug: "baxter-county" },
  { slug: "fayetteville-strawberry-2026", title: "Fayetteville Strawberry Festival", s: { m: 5, d: 17 }, city: "Fayetteville", countySlug: "washington-county" },
  { slug: "old-fort-days-rodeo-2026", title: "Old Fort Days Futurity and Rodeo", s: { m: 5, d: 25 }, e: { m: 5, d: 30 }, city: "Fort Smith", countySlug: "sebastian-county" },
  { slug: "mosquito-fest-mccrory-2026", title: "Mosquito Fest", s: { m: 5, d: 28 }, e: { m: 5, d: 30 }, city: "McCrory", countySlug: "woodruff-county" },
  { slug: "wynne-farmfest-2026", title: "Wynne FarmFest", s: { m: 5, d: 28 }, e: { m: 5, d: 30 }, city: "Wynne", countySlug: "cross-county" },
  { slug: "eureka-blues-party-2026", title: "Eureka Springs Blues Party", s: { m: 5, d: 28 }, e: { m: 5, d: 31 }, city: "Eureka Springs", countySlug: "carroll-county" },
  { slug: "greers-ferry-lake-fest-2026", title: "Greers Ferry Lake Fest", s: { m: 5, d: 29 }, e: { m: 5, d: 30 }, city: "Greers Ferry", countySlug: "cleburne-county" },
  { slug: "river-valley-food-truck-russellville-2026", title: "River Valley Food Truck Festival", s: { m: 5, d: 29 }, e: { m: 5, d: 30 }, city: "Russellville", countySlug: "pope-county" },
  { slug: "xi-flux-campout-2026", title: "XI Flux Campout", s: { m: 5, d: 29 }, e: { m: 5, d: 31 }, city: "Hartman", countySlug: "johnson-county" },
  { slug: "bentonville-bbq-2026", title: "Bentonville BBQ Festival", s: { m: 5, d: 30 }, city: "Bentonville", countySlug: "benton-county" },
  { slug: "carpenters-country-ozark-2026", title: "Carpenter’s Country Fest", s: { m: 5, d: 30 }, city: "Ozark", countySlug: "franklin-county" },
  {
    slug: "petit-jean-lake-bailey-canoe-race-2026",
    title: "Lake Bailey Canoe Race (Petit Jean Mountain)",
    s: { m: 8, d: 29 },
    city: "Morrilton",
    countySlug: "conway-county",
    note:
      "Petit Jean Extension Homemakers Club (EH) annual signature event with Arkansas State Parks at Lake Bailey, Petit Jean State Park. Per PJMEHC correspondence (Sonya Wiggins, VP, Apr 2026): Saturday, Aug 29, 2026. Verify heat times and any registration fees on the park event page; dress for sun and water safety.",
  },
  {
    slug: "yellville-turkey-trot-2026",
    title: "Yellville Turkey Trot Festival",
    s: { m: 10, d: 9 },
    e: { m: 10, d: 10 },
    city: "Yellville",
    countySlug: "marion-county",
    note:
      "80th annual per yellvilleturkeytrot.com (Oct 9–10, 2026). Includes the well-known turkey drop—confirm times and downtown footprint. A personal invite may show only “Turkey drop Yellville” on Saturday Oct 10.",
  },
  ...GUIDE_FESTIVAL_ADDITIONS,
];

export const ARKANSAS_FESTIVAL_EVENTS_2026: EventItem[] = ROWS.map(toEvent);
