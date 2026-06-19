/** Curated civic seeds — override scaffolds where public names are well-known. */

export const HIGH_SCHOOL_BY_SLUG: Record<string, { name: string; district?: string; note?: string }> = {
  "little-rock": { name: "Little Rock Central High School", district: "Little Rock School District" },
  "north-little-rock": { name: "North Little Rock High School", district: "North Little Rock School District" },
  sherwood: { name: "Sherwood High School", district: "Pulaski County Special School District" },
  jacksonville: { name: "Jacksonville High School", district: "Jacksonville North Pulaski School District" },
  fayetteville: { name: "Fayetteville High School", district: "Fayetteville Public Schools" },
  springdale: { name: "Springdale High School", district: "Springdale School District" },
  rogers: { name: "Rogers High School", district: "Rogers Public Schools" },
  bentonville: { name: "Bentonville High School", district: "Bentonville School District" },
  "fort-smith": { name: "Northside High School", district: "Fort Smith Public Schools", note: "Largest HS in Fort Smith metro" },
  conway: { name: "Conway High School", district: "Conway Public Schools" },
  jonesboro: { name: "Jonesboro High School", district: "Jonesboro Public Schools" },
  "pine-bluff": { name: "Pine Bluff High School", district: "Pine Bluff School District" },
  "hot-springs": { name: "Hot Springs High School", district: "Hot Springs School District" },
  texarkana: { name: "Texas High School", district: "Texarkana Arkansas School District", note: "Arkansas side anchor campus" },
  "west-memphis": { name: "West Memphis High School", district: "West Memphis School District" },
  russellville: { name: "Russellville High School", district: "Russellville School District" },
  harrison: { name: "Harrison High School", district: "Harrison School District" },
  batesville: { name: "Batesville High School", district: "Batesville School District" },
  eldorado: { name: "El Dorado High School", district: "El Dorado School District" },
  "el-dorado": { name: "El Dorado High School", district: "El Dorado School District" },
  paragould: { name: "Paragould High School", district: "Paragould School District" },
  "siloam-springs": { name: "Siloam Springs High School", district: "Siloam Springs School District" },
  searcy: { name: "Searcy High School", district: "Searcy School District" },
  magnolia: { name: "Magnolia High School", district: "Magnolia School District" },
  camden: { name: "Camden Fairview High School", district: "Camden Fairview School District" },
  blytheville: { name: "Blytheville High School", district: "Blytheville School District" },
  "helena-west-helena": { name: "Helena-West Helena High School", district: "Helena-West Helena School District" },
  monticello: { name: "Monticello High School", district: "Monticello School District" },
  "forrest-city": { name: "Forrest City High School", district: "Forrest City School District" },
  malvern: { name: "Malvern High School", district: "Malvern School District" },
  arkadelphia: { name: "Arkadelphia High School", district: "Arkadelphia School District" },
  bryant: { name: "Bryant High School", district: "Bryant School District" },
  cabot: { name: "Cabot High School", district: "Cabot School District" },
  maumelle: { name: "Maumelle High School", district: "Pulaski County Special School District" },
};

export const CHAMBER_BY_SLUG: Record<string, { name: string; url?: string }> = {
  "little-rock": { name: "Little Rock Regional Chamber", url: "https://www.littlerock.com" },
  fayetteville: { name: "Fayetteville Chamber of Commerce", url: "https://www.fayettevillechamber.com" },
  springdale: { name: "Springdale Area Chamber of Commerce", url: "https://www.springdale.com" },
  rogers: { name: "Rogers-Lowell Area Chamber of Commerce", url: "https://www.rogerslowell.com" },
  bentonville: { name: "Bentonville/Bella Vista Area Chamber of Commerce", url: "https://www.bentonvillechamber.com" },
  "fort-smith": { name: "Fort Smith Regional Chamber of Commerce", url: "https://www.fortsmithchamber.com" },
  jonesboro: { name: "Jonesboro Regional Chamber of Commerce", url: "https://www.jonesborochamber.com" },
  conway: { name: "Conway Area Chamber of Commerce", url: "https://www.conwaychamber.org" },
  "hot-springs": { name: "Hot Springs Metro Partnership", url: "https://www.hotspringsmetro.com" },
  texarkana: { name: "Texarkana USA Chamber of Commerce", url: "https://www.texarkana.org" },
  sherwood: { name: "Sherwood Chamber of Commerce" },
  bryant: { name: "Bryant Chamber of Commerce" },
  cabot: { name: "Cabot Chamber of Commerce" },
};

export const MEDIA_MARKET_BY_SLUG: Record<string, string> = {
  "little-rock": "Little Rock DMA (#64) — statewide news hub",
  "north-little-rock": "Little Rock DMA — capital metro",
  sherwood: "Little Rock DMA — Pulaski suburb",
  fayetteville: "Fort Smith-Fayetteville-Springdale-Rogers DMA (#100)",
  springdale: "NWA DMA — bilingual community media + regional TV",
  rogers: "NWA DMA — business corridor media",
  bentonville: "NWA DMA — corporate / business press",
  "fort-smith": "Fort Smith-Fayetteville DMA — River Valley anchor",
  jonesboro: "Jonesboro DMA (#181) — northeast regional hub",
  conway: "Little Rock DMA — Faulkner County commuter media",
  "pine-bluff": "Little Rock DMA — Delta southeast reach",
  texarkana: "Shreveport-Texarkana DMA — bi-state media",
  "west-memphis": "Memphis DMA — Crittenden / Delta crossover",
};

export function defaultHighSchool(slug: string, name: string): { name: string; district: string } {
  const seed = HIGH_SCHOOL_BY_SLUG[slug];
  if (seed) return { name: seed.name, district: seed.district ?? `${name} School District (verify)` };
  return {
    name: `${name} High School`,
    district: `${name} area school district (verify with ADE)`,
  };
}

export function defaultChamber(slug: string, name: string): { name: string; url?: string } {
  return CHAMBER_BY_SLUG[slug] ?? { name: `${name} Area Chamber of Commerce` };
}

export function defaultRotary(name: string): string {
  return `Rotary Club of ${name}`;
}

export function defaultMediaMarket(slug: string, name: string, county: string): string {
  return MEDIA_MARKET_BY_SLUG[slug] ?? `${name} · ${county} County — local paper + county-seat radio (verify)`;
}

export function fieldValidatorTargets(
  influenceTags: string[],
  influenceCategory: string,
): string {
  const parts: string[] = [];
  if (influenceTags.includes("chambers") || influenceTags.includes("business_leaders")) {
    parts.push("Chamber board member or small-business owner willing to host a civic conversation");
  }
  if (influenceTags.includes("democratic_recovery")) {
    parts.push("Pastor or faith coalition leader who can validate nonpartisan election-service framing");
  }
  if (influenceTags.includes("students")) {
    parts.push("Campus civic engagement lead or principal-designee for registration partnership");
  }
  if (influenceTags.includes("moderate_republicans") || influenceTags.includes("persuasion")) {
    parts.push("Veteran, Rotarian, or civic club officer for relationship persuasion");
  }
  if (influenceTags.includes("volunteers")) {
    parts.push("Neighborhood captain who can run a Power of Five circle");
  }
  if (parts.length === 0) {
    parts.push(`County-party vice chair, deputy registrar partner, or ${influenceCategory.toLowerCase()} connector`);
  }
  return parts.slice(0, 4).join(" · ");
}
