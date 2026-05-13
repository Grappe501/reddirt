/**
 * Assign one of nine statewide route clusters by county (Kelly fair routing V2).
 */
const NEA = new Set([
  "Craighead",
  "Greene",
  "Clay",
  "Lawrence",
  "Mississippi",
  "Poinsett",
  "Randolph",
  "Sharp",
  "Jackson",
  "Independence",
  "Izard",
  "Fulton",
]);

const DELTA = new Set([
  "Crittenden",
  "Mississippi",
  "Poinsett",
  "Cross",
  "St. Francis",
  "Lee",
  "Phillips",
  "Monroe",
  "Arkansas",
  "Desha",
  "Chicot",
  "Jefferson",
  "Lonoke",
  "Prairie",
  "Woodruff",
]);

const SOUTH = new Set([
  "Union",
  "Columbia",
  "Ouachita",
  "Calhoun",
  "Bradley",
  "Drew",
  "Ashley",
  "Lincoln",
  "Miller",
  "Hempstead",
  "Nevada",
  "Little River",
]);

const SOUTHWEST = new Set([
  "Sevier",
  "Howard",
  "Pike",
  "Polk",
  "Montgomery",
  "Garland",
  "Hot Spring",
  "Clark",
  "Lafayette",
]);

const RIVER_VALLEY = new Set([
  "Sebastian",
  "Crawford",
  "Franklin",
  "Johnson",
  "Logan",
  "Yell",
  "Pope",
  "Conway",
  "Perry",
  "Faulkner",
  "Van Buren",
  "Newton",
  "Carroll",
  "Madison",
  "Washington",
  "Benton",
]);

const NORTHWEST = new Set(["Washington", "Benton", "Madison", "Carroll", "Boone", "Marion", "Baxter", "Newton"]);

const NORTH_CENTRAL = new Set([
  "Baxter",
  "Marion",
  "Boone",
  "Searcy",
  "Stone",
  "Fulton",
  "Izard",
  "Sharp",
  "Independence",
  "Cleburne",
  "White",
  "Jackson",
  "Woodruff",
]);

const CENTRAL = new Set(["Pulaski", "Saline", "Lonoke", "Faulkner", "Perry", "White", "Grant"]);

const SOUTHEAST = new Set([
  "Jefferson",
  "Arkansas",
  "Desha",
  "Lincoln",
  "Cleveland",
  "Drew",
  "Bradley",
  "Ashley",
  "Chicot",
  "Dallas",
  "Calhoun",
  "Ouachita",
]);

const LABELS = {
  NEA: "NEA / Jonesboro-Paragould-Blytheville",
  DELTA: "Delta / Helena-West Memphis-Marianna",
  SOUTH: "South Arkansas / Magnolia-El Dorado-Camden",
  SOUTHWEST: "Southwest / Hope-Texarkana-Ashdown",
  RIVER_VALLEY: "River Valley / Fort Smith-Russellville-Ozark",
  NORTHWEST: "Northwest / Fayetteville-Bentonville-Huntsville",
  NORTH_CENTRAL: "North Central / Mountain Home-Batesville-Heber Springs",
  CENTRAL: "Central / Pulaski-Saline-Faulkner-Lonoke-White",
  SOUTHEAST: "Southeast / Pine Bluff-Monticello-Dumas",
} as const;

export function assignRouteClusterForCounty(county: string): string {
  const c = county.trim();
  if (CENTRAL.has(c)) return LABELS.CENTRAL;
  if (NORTHWEST.has(c)) return LABELS.NORTHWEST;
  if (NEA.has(c)) return LABELS.NEA;
  if (DELTA.has(c)) return LABELS.DELTA;
  if (SOUTHEAST.has(c)) return LABELS.SOUTHEAST;
  if (SOUTH.has(c)) return LABELS.SOUTH;
  if (SOUTHWEST.has(c)) return LABELS.SOUTHWEST;
  if (RIVER_VALLEY.has(c)) return LABELS.RIVER_VALLEY;
  if (NORTH_CENTRAL.has(c)) return LABELS.NORTH_CENTRAL;
  return LABELS.NORTH_CENTRAL;
}
