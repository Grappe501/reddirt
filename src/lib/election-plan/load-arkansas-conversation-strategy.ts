import strategySource from "../../../data/campaign-brain/movement-infrastructure/arkansas-conversation-strategy.source.json";

export type ConversationLadderStep = {
  level: number;
  name: string;
  description: string;
};

export type ArkansasConversationStrategyModel = {
  title: string;
  subtitle: string;
  executiveBookChapter: string;
  underTenMinutes: boolean;
  corePrinciple: string;
  notThis: string;
  visibilityVsVotes: { visibility: string; votes: string; doctrine: string };
  successQuestion: string;
  notSuccessQuestion: string;
  conversationLadder: ConversationLadderStep[];
  powerOf5Engine: {
    firstAsk: string;
    secondAsk: string;
    metricLabel: string;
    notMetricLabel: string;
    networkGoal: number;
    hciGoal: number;
  };
  eyeballToEyeballVenues: string[];
  trustNotArgument: string;
  crossPartyTrust: {
    message: string;
    sosFrame: string;
    goal: string;
    priorityCounties: string[];
    ruralGopTemplate: string[];
    href: string;
  };
  directDemocracyPlank: {
    tier: string;
    notPartisan: boolean;
    citizenPower: boolean;
    doctrine: string;
    sosRole: string;
    href: string;
  };
  systemConnections: Array<{ system: string; href: string }>;
  stopCommandCenterPrompt: string;
};

export function getArkansasConversationStrategy(): ArkansasConversationStrategyModel {
  return strategySource as ArkansasConversationStrategyModel;
}

export function conversationStrategyHref(): string {
  return "/election-plan/conversation-strategy";
}
