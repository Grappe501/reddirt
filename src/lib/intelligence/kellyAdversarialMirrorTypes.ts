export const KELLY_ADVERSARIAL_MIRROR_REL = "data/intelligence/kelly-adversarial-mirror.json";

/** Default hidden-pathway trigger when JSON is not loaded (matches mirror file fallback). */
export const KELLY_MIRROR_DEFAULT_TRIGGER_WORD = "quorum";

export type KellyMirrorGovernance = {
  classification: string;
  publicationSafety: string;
  humanReviewRequired: boolean;
  purpose: string;
  simulationDisclaimer: string;
};

export type KellyResearchFinding = {
  id: string;
  category: string;
  title: string;
  verificationStatus: string;
  whatOpponentsWillSearch: string[];
  knownInRepo: string;
  attackPotential: string;
  kellyRule: string;
};

export type KellyAttackVector = {
  vectorId: string;
  label: string;
  likelyLines: string[];
  trapSetup: string;
  personalOrProfessional: string;
};

export type KellyOpponentSimulation = {
  simulationId: string;
  strategicObjective: string;
  offensiveDebatePlan: string[];
  defensiveDebatePlan: string[];
  attackVectors: KellyAttackVector[];
  rebuttalToKelly: string[];
  hardCoreTakedownSequence: string[];
};

export type KellyCounterResponse = {
  attackId: string;
  kellyAcknowledge: string;
  kellyContrast: string;
  kellyBridge: string;
  claimsGate: string;
  doNotSay: string[];
};

export type KellyAdversarialMirrorFile = {
  version: number;
  generatedAt: string;
  governance: KellyMirrorGovernance;
  hiddenPathway: { triggerWord: string; triggerContextHint: string; gateHref: string };
  researchDossier: {
    summary: string;
    verificationLegend: Record<string, string>;
    findings: KellyResearchFinding[];
  };
  hammerRedTeam: KellyOpponentSimulation;
  packoRedTeam: KellyOpponentSimulation;
  counterPlaybook: { summary: string; responses: KellyCounterResponse[] };
  buildPlan: {
    title: string;
    phases: Array<{ phase: number; label: string; tasks: string[]; owner: string }>;
    passwordPolicy: string;
    staffExclusion: string;
  };
};
