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
