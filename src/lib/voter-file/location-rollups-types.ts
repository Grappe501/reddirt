/** Aggregate-only SOS voter file rollups — no individual voter rows or PII. */

export type PartyRegistrationCounts = {
  democrat: number;
  republican: number;
  other: number;
  blank: number;
};

export type RegistrationRollup = {
  total: number;
  active: number;
  inactive: number;
  party: PartyRegistrationCounts;
};

export type ParticipationRollup = {
  /** Normalized key, e.g. `2024_PRIMARY` */
  contestKey: string;
  /** Human label from SOS file header */
  label: string;
  participated: number;
  /** Primary contests only — ballot taken (D/R/other). */
  demPrimaryBallot?: number;
  repPrimaryBallot?: number;
  otherPrimaryBallot?: number;
};

export type VoterFileLocationRollup = {
  registration: RegistrationRollup;
  participation: ParticipationRollup[];
};

export type VoterFileCityRollup = VoterFileLocationRollup & {
  citySlug: string | null;
  cityName: string;
  isPriorityCity: boolean;
};

export type VoterFileCountyRollup = VoterFileLocationRollup & {
  countySlug: string;
  countyName: string;
  fips: string;
  cities: VoterFileCityRollup[];
  unmappedCityCount: number;
};

export type VoterFileLocationRollupsFile = {
  builtAt: string;
  sourceFiles: {
    vrPath: string;
    vhPath: string;
    vrRowCount: number;
    vhRowCount: number;
    votersMatchedInHistory: number;
  };
  featuredContests: string[];
  counties: Record<string, VoterFileCountyRollup>;
  cities: Record<string, VoterFileCityRollup>;
};
