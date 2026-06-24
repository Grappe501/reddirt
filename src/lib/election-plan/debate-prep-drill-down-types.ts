/**
 * Client-safe drill-down types — no debatePrepDayDrillDown import graph.
 */
export type DrillDownLink = { href: string; label: string };

export type DayConceptDrillDown = {
  id: string;
  label: string;
  summary: string;
  sections: Array<{ title: string; body: string }>;
  practiceSteps: string[];
  relatedLinks: DrillDownLink[];
};

export type DayBlockDrillDown = {
  blockId: string;
  title: string;
  minutes: number;
  activity: string;
  why: string;
  sections: Array<{ title: string; body: string }>;
  practiceSteps: string[];
  relatedLinks: DrillDownLink[];
};

export type DayExampleDrillDown = {
  id: string;
  opponent: string;
  theirMove: string;
  kellyResponse: string;
  whyItWorks: string;
  sourceNote: string;
  sections: Array<{ title: string; body: string }>;
  alternateLines: string[];
  practiceSteps: string[];
  relatedLinks: DrillDownLink[];
};

export type DayRehearsalDrillDown = {
  id: string;
  label: string;
  durationLabel: string;
  script: string;
  presenceNotes: string[];
  successCheck: string[];
  relatedLinks: DrillDownLink[];
};

export type DayMicroLessonDrillDown = {
  id: string;
  title: string;
  readMinutes: number;
  body: string;
  practiceSteps: string[];
  relatedLinks: DrillDownLink[];
};

export type DayCommandDrillDown = {
  id: string;
  ifTheySay: string;
  youSay: string;
  thenScan: string;
  claimsNote?: string;
  practiceSteps: string[];
  relatedLinks: DrillDownLink[];
};
