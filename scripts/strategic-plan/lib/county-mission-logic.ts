/** Victory Contribution Index and county mission assignment logic. */

export type CountyMission = {
  role: string;
  primaryMission: string;
  secondaryMission: string;
  tertiaryMission: string;
};

export type CountyMissionInput = {
  tier: "A" | "B" | "C" | "D";
  hopeIndex: number;
  dropOffRecovery50: number;
  registrationGoal: number;
  republicanConversionPotential: number;
  cityInfluenceVotes: number;
  baselineDemShare: number;
};

export function computeVictoryContributionIndex(input: CountyMissionInput): number {
  return (
    input.dropOffRecovery50 +
    input.registrationGoal +
    input.republicanConversionPotential +
    Math.round(input.cityInfluenceVotes)
  );
}

export function deriveCountyMission(c: CountyMissionInput): CountyMission {
  const repHeavy =
    c.republicanConversionPotential >= 4000 &&
    (c.republicanConversionPotential > c.dropOffRecovery50 * 0.8 || c.baselineDemShare < 0.42);
  const metroMax =
    c.tier === "A" &&
    c.baselineDemShare >= 0.42 &&
    (c.cityInfluenceVotes >= 15_000 || (c.dropOffRecovery50 >= 8000 && c.cityInfluenceVotes >= 5000));
  const recoveryCounty = c.dropOffRecovery50 >= 1500 || c.hopeIndex >= 40;
  const youthReg = c.registrationGoal >= 1200 && c.cityInfluenceVotes >= 3000 && !repHeavy;

  if (repHeavy && !metroMax) {
    return {
      role: "Republican Conversion County",
      primaryMission: "Moderate Republican Outreach",
      secondaryMission: "New Voter Registration",
      tertiaryMission: "Business Community Engagement",
    };
  }

  if (metroMax) {
    return {
      role: "Statewide Vote Maximization County",
      primaryMission: "Lane 2 Recovery",
      secondaryMission: "Volunteer Production",
      tertiaryMission: "Fundraising",
    };
  }

  if (repHeavy) {
    return {
      role: "Republican Conversion County",
      primaryMission: "Moderate Republican Outreach",
      secondaryMission: "New Voter Registration",
      tertiaryMission: "Business Community Engagement",
    };
  }

  if (youthReg) {
    return {
      role: "Youth Registration County",
      primaryMission: "New Voter Registration",
      secondaryMission: "Lane 2 Recovery",
      tertiaryMission: "Campus & School Outreach",
    };
  }

  if (recoveryCounty && c.baselineDemShare >= 0.35) {
    return {
      role: "Democratic Recovery County",
      primaryMission: "Lane 2 Reactivation",
      secondaryMission: "Registration Drives",
      tertiaryMission: "Community Relationship Building",
    };
  }

  if (c.tier === "D") {
    return {
      role: "Coalition Maintenance County",
      primaryMission: "Democratic Retention (Lane 1)",
      secondaryMission: "Power of 5 Organizing",
      tertiaryMission: "County Fair & Community Presence",
    };
  }

  return {
    role: "Relationship-Building County",
    primaryMission: "Power of 5 Organizing",
    secondaryMission: "Registration Where Possible",
    tertiaryMission: "Lane 4 Persuasion",
  };
}

export function vciTier(rank: number, total: number): "Priority 1" | "Priority 2" | "Priority 3" | "Priority 4" {
  const pct = rank / total;
  if (pct <= 0.16) return "Priority 1";
  if (pct <= 0.4) return "Priority 2";
  if (pct <= 0.8) return "Priority 3";
  return "Priority 4";
}

export function powerOf5Goal(recovery50: number, registrationGoal: number): number {
  return Math.max(25, Math.ceil((recovery50 + registrationGoal) / 150));
}

export function volunteerTarget(registrationGoal: number, tier: string): number {
  const mult = tier === "A" ? 12 : tier === "B" ? 8 : tier === "C" ? 5 : 3;
  return Math.max(5, Math.ceil(registrationGoal / mult));
}
