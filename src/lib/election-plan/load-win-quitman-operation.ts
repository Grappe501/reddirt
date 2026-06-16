import source from "../../../data/campaign-brain/win-quitman-operation.json";

export type QuitmanPathStep = {
  step: number;
  title: string;
  detail: string;
};

export type QuitmanBonusPlan = {
  version: number;
  citySlug: string;
  rank: number;
  headline: string;
  isolationNote: string;
  countyLead: string;
  countyLeadContact?: {
    name: string;
    phone: string;
    email: string;
    role: string;
  };
  countySlug: string;
  fundraising: { goal: number; current: number; label: string; unit: string };
  houseParties: {
    goal: number;
    current: number;
    label: string;
    events: Array<{
      id: string;
      label: string;
      date: string;
      hostName: string;
      hostPhone?: string;
      hostNameNote?: string;
      countyLead: string;
      countyLeadPhone?: string;
      countyLeadEmail?: string;
      status: string;
    }>;
  };
  conversations: { goal: number; current: number; label: string };
  votePlan: {
    baseline2022SosVotes: number;
    baselineSource: string;
    chapterTargetVotes: number;
    chapterVoteGain: number;
    stretchIncreasePct: number;
    stretchTargetSosVotes: number;
    stretchNote: string;
  };
  pathToGoal: QuitmanPathStep[];
  tonightEvent: { slug: string; label: string; captureHref: string };
};

const plan = source as QuitmanBonusPlan;

export function getQuitmanBonusPlan(): QuitmanBonusPlan {
  return plan;
}

export function getQuitmanTonightEvent() {
  return plan.tonightEvent;
}
