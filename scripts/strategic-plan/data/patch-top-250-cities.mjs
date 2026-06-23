import { readFileSync, writeFileSync } from "node:fs";

const NEW = [
  ["hampton", "Hampton", "Calhoun", 1145, ["democratic_recovery", "turnout_growth", "volunteers"], "Calhoun County hub — Delta south base mobilization and county relationships."],
  ["caraway", "Caraway", "Craighead", 1104, ["turnout_growth", "volunteers", "regional_media"], "Craighead County east — Jonesboro metro fringe registration."],
  ["yellville", "Yellville", "Marion", 1095, ["chambers", "persuasion", "volunteers"], "Marion County seat — Bull Shoals Lake county-seat hub."],
  ["waldo", "Waldo", "Columbia", 1100, ["chambers", "persuasion", "volunteers"], "Columbia County seat — southwest Arkansas county-seat relationships."],
  ["london", "London", "Pope", 1061, ["volunteers", "turnout_growth", "persuasion"], "Pope County south — Russellville adjacency and I-40 corridor organizing."],
  ["highland", "Highland", "Sharp", 1060, ["persuasion", "chambers", "volunteers"], "Sharp County north — Ozarks county-seat adjacency and Hardy corridor."],
  ["mansfield", "Mansfield", "Scott", 1066, ["chambers", "persuasion", "volunteers"], "Scott County seat — Ouachita foothills county-seat hub."],
  ["kibler", "Kibler", "Crawford", 1029, ["turnout_growth", "volunteers", "persuasion"], "Crawford County east — Van Buren metro fringe registration."],
  ["mineral-springs", "Mineral Springs", "Howard", 1036, ["chambers", "persuasion", "volunteers"], "Howard County hub — southwest Arkansas county relationships."],
  ["mount-ida", "Mount Ida", "Montgomery", 1005, ["chambers", "persuasion", "volunteers"], "Montgomery County seat — Ouachita National Forest county-seat hub."],
  ["higginson", "Higginson", "White", 945, ["turnout_growth", "volunteers", "persuasion"], "White County south — Searcy metro adjacency and registration drives."],
  ["cotter", "Cotter", "Baxter", 946, ["persuasion", "volunteers", "chambers"], "Baxter County White River — trout tourism and Mountain Home adjacency."],
  ["hughes", "Hughes", "St. Francis", 976, ["democratic_recovery", "turnout_growth", "volunteers"], "St. Francis County hub — Delta base mobilization and Memphis spillover."],
  ["mammoth-spring", "Mammoth Spring", "Fulton", 941, ["chambers", "persuasion", "volunteers"], "Fulton County north — Spring River tourism and Missouri border adjacency."],
  ["foreman", "Foreman", "Little River", 951, ["chambers", "persuasion", "volunteers"], "Little River County seat — southwest corner county-seat relationships."],
  ["ola", "Ola", "Yell", 921, ["chambers", "persuasion", "volunteers"], "Yell County hub — River Valley west county relationships."],
  ["rison", "Rison", "Cleveland", 917, ["democratic_recovery", "chambers", "turnout_growth"], "Cleveland County seat — southeast Arkansas county-seat and base turnout."],
  ["horatio", "Horatio", "Sevier", 907, ["chambers", "persuasion", "volunteers"], "Sevier County seat — southwest Arkansas county-seat hub."],
  ["diamond-city", "Diamond City", "Boone", 861, ["persuasion", "turnout_growth", "volunteers"], "Boone County lake community — Bull Shoals Lake retiree persuasion."],
  ["dierks", "Dierks", "Howard", 879, ["chambers", "persuasion", "volunteers"], "Howard County north — timber community and Nashville adjacency."],
  ["hackett", "Hackett", "Sebastian", 857, ["volunteers", "turnout_growth", "persuasion"], "Sebastian County south — Fort Smith metro fringe organizing."],
  ["greers-ferry", "Greers Ferry", "Cleburne", 831, ["persuasion", "turnout_growth", "volunteers"], "Cleburne County lake hub — Greers Ferry Lake community relationships."],
  ["luxora", "Luxora", "Mississippi", 855, ["democratic_recovery", "turnout_growth", "volunteers"], "Mississippi County north — Delta base mobilization and Blytheville adjacency."],
  ["lewisville", "Lewisville", "Lafayette", 845, ["democratic_recovery", "chambers", "turnout_growth"], "Lafayette County seat — southwest Delta county-seat relationships."],
  ["coal-hill", "Coal Hill", "Johnson", 822, ["chambers", "persuasion", "volunteers"], "Johnson County north — Ozark foothills county relationships."],
  ["bauxite", "Bauxite", "Saline", 811, ["turnout_growth", "volunteers", "persuasion"], "Saline County south — Benton metro adjacency and commuter registration."],
  ["dyer", "Dyer", "Crawford", 807, ["volunteers", "turnout_growth", "persuasion"], "Crawford County north — Fort Smith metro spillover organizing."],
  ["fouke", "Fouke", "Miller", 810, ["chambers", "persuasion", "volunteers"], "Miller County south — Texarkana adjacency and county relationships."],
  ["guy", "Guy", "Faulkner", 798, ["turnout_growth", "volunteers", "persuasion"], "Faulkner County east — Conway metro fringe registration."],
  ["hardy", "Hardy", "Sharp", 780, ["persuasion", "chambers", "volunteers"], "Sharp County tourism anchor — Spring River arts community and festival circuit."],
  ["lakeview", "Lakeview", "Baxter", 783, ["persuasion", "turnout_growth", "volunteers"], "Baxter County Bull Shoals — lake community persuasion and event presence."],
  ["oppelo", "Oppelo", "Conway", 766, ["turnout_growth", "volunteers", "persuasion"], "Conway County south — Morrilton adjacency and River Valley organizing."],
  ["magazine", "Magazine", "Logan", 758, ["chambers", "persuasion", "volunteers"], "Logan County hub — Mount Magazine region county relationships."],
  ["parkin", "Parkin", "Cross", 766, ["democratic_recovery", "turnout_growth", "volunteers"], "Cross County east — St. Francis River Delta base mobilization."],
  ["cammack-village", "Cammack Village", "Pulaski", 757, ["democratic_recovery", "turnout_growth", "volunteers"], "Pulaski County enclave — Little Rock metro fringe base turnout."],
  ["east-camden", "East Camden", "Ouachita", 758, ["democratic_recovery", "chambers", "turnout_growth"], "Ouachita County east — Camden adjacency and county relationships."],
  ["stephens", "Stephens", "Ouachita", 749, ["chambers", "persuasion", "volunteers"], "Ouachita County hub — southwest Arkansas county-seat adjacency."],
  ["plumerville", "Plumerville", "Conway", 738, ["turnout_growth", "volunteers", "chambers"], "Conway County hub — Morrilton adjacency and county fair presence."],
  ["bearden", "Bearden", "Ouachita", 738, ["democratic_recovery", "chambers", "turnout_growth"], "Ouachita County north — timber community and county relationships."],
  ["tyronza", "Tyronza", "Poinsett", 721, ["democratic_recovery", "turnout_growth", "volunteers"], "Poinsett County hub — Delta northeast recovery organizing."],
  ["rockport", "Rockport", "Hot Spring", 709, ["chambers", "persuasion", "volunteers"], "Hot Spring County south — Malvern adjacency and county relationships."],
  ["norphlet", "Norphlet", "Union", 717, ["chambers", "persuasion", "volunteers"], "Union County north — El Dorado metro adjacency organizing."],
  ["black-rock", "Black Rock", "Lawrence", 697, ["turnout_growth", "volunteers", "persuasion"], "Lawrence County south — Walnut Ridge adjacency and registration."],
  ["swifton", "Swifton", "Jackson", 709, ["democratic_recovery", "turnout_growth", "volunteers"], "Jackson County hub — northeast Delta county relationships."],
  ["madison", "Madison", "St. Francis", 713, ["democratic_recovery", "turnout_growth", "volunteers"], "St. Francis County south — Delta base mobilization."],
  ["marvell", "Marvell", "Phillips", 717, ["democratic_recovery", "chambers", "turnout_growth"], "Phillips County hub — Delta east county-seat relationships."],
  ["wilson", "Wilson", "Mississippi", 702, ["democratic_recovery", "turnout_growth", "volunteers"], "Mississippi County hub — Delta northeast base turnout."],
  ["altus", "Altus", "Franklin", 681, ["chambers", "persuasion", "volunteers"], "Franklin County wine country — Altus valley chamber and tourism relationships."],
  ["bradford", "Bradford", "White", 684, ["turnout_growth", "volunteers", "chambers"], "White County east — Searcy adjacency and county fair circuit."],
  ["keiser", "Keiser", "Mississippi", 693, ["democratic_recovery", "turnout_growth", "volunteers"], "Mississippi County west — Osceola adjacency and Delta organizing."],
  ["amity", "Amity", "Clark", 674, ["chambers", "persuasion", "volunteers"], "Clark County north — Gurdon adjacency and county relationships."],
  ["knoxville", "Knoxville", "Johnson", 662, ["chambers", "persuasion", "volunteers"], "Johnson County hub — Clarksville adjacency organizing."],
  ["wickes", "Wickes", "Polk", 655, ["chambers", "persuasion", "volunteers"], "Polk County hub — Mena adjacency and Ouachita foothills relationships."],
  ["sulphur-rock", "Sulphur Rock", "Independence", 655, ["turnout_growth", "volunteers", "chambers"], "Independence County hub — Batesville adjacency registration."],
  ["garfield", "Garfield", "Benton", 631, ["moderate_republicans", "volunteers", "turnout_growth"], "Benton County east — Rogers adjacency and NWA growth organizing."],
  ["altheimer", "Altheimer", "Jefferson", 642, ["democratic_recovery", "turnout_growth", "volunteers"], "Jefferson County east — Pine Bluff adjacency and Delta base mobilization."],
  ["gillett", "Gillett", "Arkansas", 619, ["democratic_recovery", "chambers", "turnout_growth"], "Arkansas County south — Delta county relationships and base turnout."],
  ["imboden", "Imboden", "Lawrence", 627, ["turnout_growth", "volunteers", "persuasion"], "Lawrence County north — Walnut Ridge adjacency organizing."],
  ["oxford", "Oxford", "Izard", 615, ["chambers", "persuasion", "volunteers"], "Izard County hub — Batesville adjacency and Ozarks organizing."],
  ["mcrae", "McRae", "White", 617, ["turnout_growth", "volunteers", "persuasion"], "White County hub — Searcy adjacency and registration drives."],
  ["gould", "Gould", "Lincoln", 621, ["democratic_recovery", "chambers", "turnout_growth"], "Lincoln County south — Delta county relationships and base turnout."],
  ["bonanza", "Bonanza", "Sebastian", 603, ["volunteers", "turnout_growth", "persuasion"], "Sebastian County south — Fort Smith metro fringe organizing."],
  ["holland", "Holland", "Faulkner", 602, ["turnout_growth", "volunteers", "persuasion"], "Faulkner County south — Conway metro commuter registration."],
  ["weiner", "Weiner", "Poinsett", 613, ["democratic_recovery", "turnout_growth", "volunteers"], "Poinsett County south — Delta recovery and county relationships."],
  ["lockesburg", "Lockesburg", "Sevier", 596, ["chambers", "persuasion", "volunteers"], "Sevier County seat — southwest Arkansas county-seat hub."],
  ["cherry-valley", "Cherry Valley", "Cross", 589, ["democratic_recovery", "turnout_growth", "volunteers"], "Cross County hub — Wynne adjacency and Delta organizing."],
  ["caddo-valley", "Caddo Valley", "Clark", 588, ["chambers", "persuasion", "volunteers"], "Clark County south — Arkadelphia adjacency and county relationships."],
  ["mountain-pine", "Mountain Pine", "Garland", 586, ["persuasion", "turnout_growth", "volunteers"], "Garland County south — Hot Springs adjacency and lake community organizing."],
  ["taylor", "Taylor", "Columbia", 560, ["chambers", "persuasion", "volunteers"], "Columbia County south — Magnolia adjacency and county relationships."],
  ["avoca", "Avoca", "Benton", 545, ["volunteers", "turnout_growth", "moderate_republicans"], "Benton County northeast — Rogers adjacency and rural NWA organizing."],
  ["mountainburg", "Mountainburg", "Crawford", 535, ["chambers", "persuasion", "volunteers"], "Crawford County north — Ozark foothills county relationships."],
  ["traskwood", "Traskwood", "Saline", 528, ["turnout_growth", "volunteers", "persuasion"], "Saline County east — Benton adjacency and commuter registration."],
  ["salesville", "Salesville", "Baxter", 524, ["persuasion", "volunteers", "chambers"], "Baxter County east — Norfork Lake adjacency organizing."],
  ["portia", "Portia", "Lawrence", 515, ["turnout_growth", "volunteers", "persuasion"], "Lawrence County hub — Walnut Ridge adjacency registration."],
  ["summit", "Summit", "Marion", 526, ["persuasion", "turnout_growth", "volunteers"], "Marion County south — Yellville adjacency and Ozarks organizing."],
];

function fmtEntry([slug, name, county, pop, tags, role]) {
  const tagsStr = tags.map((t) => `"${t}"`).join(", ");
  return `  {
    slug: "${slug}",
    name: "${name}",
    county: "${county}",
    population2020: ${pop},
    influenceTags: [${tagsStr}],
    strategicRole: "${role}",
    visitFrequency: "quarterly",
    isTop10: false,
  },`;
}

const path = new URL("./arkansas-top-40-cities.ts", import.meta.url);
let src = readFileSync(path, "utf8");
src = src.replace("Top 175 Arkansas priority cities and towns", "Top 250 Arkansas priority cities and towns");
src = src.replace("export const ARKANSAS_TOP_175_CITIES", "export const ARKANSAS_TOP_250_CITIES");
const appendBlock = NEW.map(fmtEntry).join("\n");
src = src.replace(
  /(\s+\{\s+slug: "ash-flat"[\s\S]*?\},\n)(\] as const satisfies readonly ArkansasTop40City\[\];)/,
  `$1${appendBlock}\n$2`,
);
src = src.replace(
  /\/\*\* @deprecated Use \{@link ARKANSAS_TOP_175_CITIES\}[\s\S]*?export const ARKANSAS_TOP_40_CITIES = ARKANSAS_TOP_175_CITIES\.slice\(0, 40\);/,
  `/** @deprecated Use {@link ARKANSAS_TOP_250_CITIES} — kept for scripts that imported the 175-city symbol. */
export const ARKANSAS_TOP_175_CITIES = ARKANSAS_TOP_250_CITIES;

/** @deprecated Use {@link ARKANSAS_TOP_250_CITIES} — kept for scripts that imported the 125-city symbol. */
export const ARKANSAS_TOP_125_CITIES = ARKANSAS_TOP_250_CITIES;

/** @deprecated Use {@link ARKANSAS_TOP_250_CITIES} — kept for scripts that imported the 100-city symbol. */
export const ARKANSAS_TOP_100_CITIES = ARKANSAS_TOP_250_CITIES;

/** @deprecated Use {@link ARKANSAS_TOP_250_CITIES} — kept for scripts that imported the 75-city symbol. */
export const ARKANSAS_TOP_75_CITIES = ARKANSAS_TOP_250_CITIES;

/** @deprecated First 40 strategic seed — use {@link ARKANSAS_TOP_250_CITIES} for full registry. */
export const ARKANSAS_TOP_40_CITIES = ARKANSAS_TOP_250_CITIES.slice(0, 40);`,
);
writeFileSync(path, src);
console.log(`Patched ${path.pathname}: added ${NEW.length} cities`);
