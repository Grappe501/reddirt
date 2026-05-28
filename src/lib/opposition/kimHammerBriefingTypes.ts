export type KimHammerBriefingLink = {
  href: string;
  label: string;
  description?: string;
};

export type KimHammerStrategicBriefingSections = {
  howToMessage?: string[];
  debateImpact?: string[];
  whenToUse?: string[];
  whenNotToUse?: string[];
  oppositionSetup?: string[];
  kellyMessageHelp?: string[];
  campaignAlignment?: {
    alignsWithKelly?: string[];
    conflictsWithKelly?: string[];
    neutralOrContextual?: string[];
  };
};

export type KimHammerModuleBriefing = {
  id: string;
  domainId: string;
  layer: string;
  title: string;
  eyebrow: string;
  href: string;
  parentHref?: string;
  parentTitle?: string;
  paragraphs: string[];
  narrativeArc?: string[];
  operatorTakeaway?: string;
  strategicBriefing?: KimHammerStrategicBriefingSections;
  drillDownLinks: KimHammerBriefingLink[];
  relatedLinks?: KimHammerBriefingLink[];
  evidenceNote?: string;
  governanceStatus?: string;
};

export type KimHammerBriefingDomain = {
  id: string;
  layer: string;
  title: string;
  eyebrow: string;
  description: string;
  moduleIds: string[];
};

export type KimHammerBriefingHub = {
  generatedAt: string;
  rootHref: string;
  domains: KimHammerBriefingDomain[];
  moduleBriefings: Record<string, KimHammerModuleBriefing>;
  domainRollups: Record<
    string,
    {
      paragraphs: string[];
      evidenceNote?: string;
    }
  >;
};
