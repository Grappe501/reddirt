export type ArkansasCityAlias = {
  city: string;
  state: "AR";
  county: string;
  aliases: string[];
  confidence?: "high" | "medium" | "low";
  notes?: string;
};

export const ARKANSAS_CITY_ALIASES: ArkansasCityAlias[] = [
  {
    city: "Little Rock",
    state: "AR",
    county: "Pulaski",
    aliases: ["Little Rock", "Pulaski County Democrats", "Pulaski Dems", "Pulaski County Dems"],
    confidence: "medium",
    notes: "County-party alias maps to county seat / common campaign meeting hub.",
  },
  { city: "Prescott", state: "AR", county: "Nevada", aliases: ["Prescott", "Prescott Rotary", "Elaine Williams"] },
  { city: "Paragould", state: "AR", county: "Greene", aliases: ["Paragould", "Greene County Democrats", "Greene County Dems"] },
  { city: "Arkadelphia", state: "AR", county: "Clark", aliases: ["Arkadelphia", "Clark County", "Clark immersion", "house parties in Arkadelphia"] },
  { city: "Fayetteville", state: "AR", county: "Washington", aliases: ["Fayetteville", "Washington County"] },
  { city: "Jonesboro", state: "AR", county: "Craighead", aliases: ["Jonesboro", "Craighead County"] },
  { city: "Benton", state: "AR", county: "Saline", aliases: ["Benton", "Saline County", "Saline County Democrats"] },
  { city: "Conway", state: "AR", county: "Faulkner", aliases: ["Conway", "Faulkner County", "Faulkner County Meeting"] },
  { city: "Searcy", state: "AR", county: "White", aliases: ["Searcy", "White County"] },
  { city: "North Little Rock", state: "AR", county: "Pulaski", aliases: ["North Little Rock", "NLR"] },
  { city: "Sherwood", state: "AR", county: "Pulaski", aliases: ["Sherwood"] },
  { city: "Cabot", state: "AR", county: "Lonoke", aliases: ["Cabot"] },
  { city: "Hot Springs", state: "AR", county: "Garland", aliases: ["Hot Springs", "Garland County"] },
  { city: "Pine Bluff", state: "AR", county: "Jefferson", aliases: ["Pine Bluff", "Jefferson County"] },
  { city: "Fort Smith", state: "AR", county: "Sebastian", aliases: ["Fort Smith", "Sebastian County"] },
  { city: "Texarkana", state: "AR", county: "Miller", aliases: ["Texarkana", "Miller County"] },
  { city: "Hope", state: "AR", county: "Hempstead", aliases: ["Hope", "Hempstead County"] },
  { city: "Magnolia", state: "AR", county: "Columbia", aliases: ["Magnolia", "Columbia County"] },
  { city: "El Dorado", state: "AR", county: "Union", aliases: ["El Dorado", "Union County"] },
  { city: "Camden", state: "AR", county: "Ouachita", aliases: ["Camden", "Ouachita County"] },
  { city: "Russellville", state: "AR", county: "Pope", aliases: ["Russellville", "Pope County"] },
  { city: "Harrison", state: "AR", county: "Boone", aliases: ["Harrison", "Boone County"] },
  { city: "Mountain Home", state: "AR", county: "Baxter", aliases: ["Mountain Home", "Baxter County"] },
  { city: "Batesville", state: "AR", county: "Independence", aliases: ["Batesville", "Independence County"] },
  { city: "West Memphis", state: "AR", county: "Crittenden", aliases: ["West Memphis", "Crittenden County"] },
];

