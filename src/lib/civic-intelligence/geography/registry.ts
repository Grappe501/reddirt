export type GeographyRef = {
  geographyId: string;
  geographyType: string;
  name: string;
  stateCode?: string;
  fips?: string;
  geoid?: string;
};

const REGISTRY: Record<string, GeographyRef> = {
  nation: {
    geographyId: "geo:us",
    geographyType: "nation",
    name: "United States",
    fips: "00",
    geoid: "0100000US",
  },
  "state:05": {
    geographyId: "geo:us-ar",
    geographyType: "state",
    name: "Arkansas",
    stateCode: "05",
    fips: "05",
    geoid: "04000US05",
  },
  // Designated Arkansas research geographies for county NASS farm-structure pass
  "county:05001": {
    geographyId: "geo:us-ar-05001",
    geographyType: "county",
    name: "Arkansas County, AR",
    stateCode: "05",
    fips: "05001",
    geoid: "05000US05001",
  },
  "county:05141": {
    geographyId: "geo:us-ar-05141",
    geographyType: "county",
    name: "Van Buren County, AR",
    stateCode: "05",
    fips: "05141",
    geoid: "05000US05141",
  },
  "county:05129": {
    geographyId: "geo:us-ar-05129",
    geographyType: "county",
    name: "Searcy County, AR",
    stateCode: "05",
    fips: "05129",
    geoid: "05000US05129",
  },
  "county:05093": {
    geographyId: "geo:us-ar-05093",
    geographyType: "county",
    name: "Mississippi County, AR",
    stateCode: "05",
    fips: "05093",
    geoid: "05000US05093",
  },
  "county:05073": {
    geographyId: "geo:us-ar-05073",
    geographyType: "county",
    name: "Lafayette County, AR",
    stateCode: "05",
    fips: "05073",
    geoid: "05000US05073",
  },
  "county:05107": {
    geographyId: "geo:us-ar-05107",
    geographyType: "county",
    name: "Phillips County, AR",
    stateCode: "05",
    fips: "05107",
    geoid: "05000US05107",
  },
  "county:05145": {
    geographyId: "geo:us-ar-05145",
    geographyType: "county",
    name: "White County, AR",
    stateCode: "05",
    fips: "05145",
    geoid: "05000US05145",
  },
};

export function resolveGeography(code: string): GeographyRef {
  const hit = REGISTRY[code];
  if (!hit) {
    throw new Error(`Unsupported geography in Phase 1 manifest: ${code}`);
  }
  return hit;
}

export function listPhase1Geographies(): GeographyRef[] {
  return Object.values(REGISTRY);
}
