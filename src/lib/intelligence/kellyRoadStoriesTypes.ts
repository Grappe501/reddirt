/** Client-safe Kelly road stories types — no node:fs. */

export type KellyRoadStory = {
  id: string;
  title: string;
  county: string;
  story: string;
  whenToUse: string;
  claimsStatus: string;
};

export type KellyRoadStoriesFile = {
  version: number;
  generatedAt: string;
  instructions: string;
  storySlots: KellyRoadStory[];
  candidateAddPrompt: string;
};
