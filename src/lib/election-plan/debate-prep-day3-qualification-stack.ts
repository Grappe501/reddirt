/** Day 3 qualification stack worksheet — local-only Kelly fields (no server persistence). */

export const DAY3_QUALIFICATION_STACK_STORAGE_KEY = "kelly-day3-qualification-stack-v1";

export type QualificationNotecardFields = {
  job: string;
  whoDepended: string;
  clerkBeat: string;
  ready: boolean;
};

export type QualificationStackState = {
  cards: [QualificationNotecardFields, QualificationNotecardFields, QualificationNotecardFields];
};

export const QUALIFICATION_NOTECARD_LABELS = [
  { index: 0, pillar: "Pillar 1 · SOS desk", hint: "Nonprofit admin, budget, people under deadline" },
  { index: 1, pillar: "Pillar 2 · Clerk partnership", hint: "Direct democracy organizing with clerks in the room" },
  { index: 2, pillar: "Pillar 3 · Platform implementation", hint: "What clerks need on the record Monday morning" },
] as const;

export function emptyQualificationStackState(): QualificationStackState {
  return {
    cards: [
      { job: "", whoDepended: "", clerkBeat: "", ready: false },
      { job: "", whoDepended: "", clerkBeat: "", ready: false },
      { job: "", whoDepended: "", clerkBeat: "", ready: false },
    ],
  };
}

export function isQualificationNotecardFilled(card: QualificationNotecardFields): boolean {
  return card.job.trim().length > 0 && card.whoDepended.trim().length > 0 && card.clerkBeat.trim().length > 0;
}

export function countFilledQualificationNotecards(state: QualificationStackState): number {
  return state.cards.filter(isQualificationNotecardFilled).length;
}

export function countReadyQualificationNotecards(state: QualificationStackState): number {
  return state.cards.filter((card) => isQualificationNotecardFilled(card) && card.ready).length;
}
