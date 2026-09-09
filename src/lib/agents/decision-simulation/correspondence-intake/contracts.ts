import type { DecisionSimulationChannel } from "../contracts";
import type { CorrespondenceThread } from "./thread";

export const CORRESPONDENCE_INTAKE_VERSION = "correspondence-intake-1.0" as const;

export type IntakeFieldKey =
  | "from"
  | "to"
  | "cc"
  | "subject"
  | "date"
  | "re"
  | "platform"
  | "handle"
  | "audience"
  | "outlet"
  | "headline"
  | "embargo"
  | "venue"
  | "ask"
  | "occasion"
  | "opponent"
  | "question"
  | "title";

export type IntakeFieldDef = {
  key: IntakeFieldKey;
  label: string;
  headerAliases: string[];
};

export const CHANNEL_INTAKE_FIELDS: Record<DecisionSimulationChannel, IntakeFieldDef[]> = {
  EMAIL: [
    { key: "from", label: "From", headerAliases: ["from", "sender"] },
    { key: "to", label: "To", headerAliases: ["to", "recipient"] },
    { key: "cc", label: "Cc", headerAliases: ["cc"] },
    { key: "subject", label: "Subject", headerAliases: ["subject", "subj"] },
    { key: "date", label: "Date", headerAliases: ["date", "sent"] },
  ],
  SOCIAL: [
    { key: "platform", label: "Platform", headerAliases: ["platform", "network"] },
    { key: "handle", label: "Handle", headerAliases: ["handle", "account"] },
    { key: "audience", label: "Audience", headerAliases: ["audience"] },
  ],
  SMS: [
    { key: "from", label: "From", headerAliases: ["from", "sender"] },
    { key: "to", label: "To", headerAliases: ["to", "recipient"] },
  ],
  PRESS_STATEMENT: [
    { key: "outlet", label: "Outlet", headerAliases: ["outlet", "publication"] },
    { key: "headline", label: "Headline", headerAliases: ["headline", "hed"] },
    { key: "embargo", label: "Embargo", headerAliases: ["embargo"] },
  ],
  PUBLIC_STATEMENT: [
    { key: "venue", label: "Venue", headerAliases: ["venue", "location"] },
    { key: "headline", label: "Headline", headerAliases: ["headline"] },
  ],
  FUNDRAISING: [
    { key: "audience", label: "Audience", headerAliases: ["audience"] },
    { key: "ask", label: "Ask", headerAliases: ["ask", "ask amount"] },
  ],
  DEBATE: [
    { key: "occasion", label: "Occasion", headerAliases: ["occasion", "event", "forum"] },
    { key: "opponent", label: "Opponent / interlocutor", headerAliases: ["opponent", "interlocutor"] },
    { key: "question", label: "Question", headerAliases: ["question", "prompt"] },
  ],
  SPEECH: [
    { key: "venue", label: "Venue", headerAliases: ["venue", "location"] },
    { key: "date", label: "Date", headerAliases: ["date"] },
    { key: "audience", label: "Audience", headerAliases: ["audience"] },
  ],
  MEMO: [
    { key: "from", label: "From", headerAliases: ["from"] },
    { key: "to", label: "To", headerAliases: ["to"] },
    { key: "re", label: "Re", headerAliases: ["re", "regarding", "subject"] },
    { key: "date", label: "Date", headerAliases: ["date"] },
  ],
  STRATEGIC_DECISION: [{ key: "title", label: "Decision title", headerAliases: ["title", "decision"] }],
  CUSTOM: [{ key: "title", label: "Title", headerAliases: ["title"] }],
};

export type CorrespondenceIntake = {
  version: typeof CORRESPONDENCE_INTAKE_VERSION;
  channel: DecisionSimulationChannel;
  body: string;
  fields: Partial<Record<IntakeFieldKey, string>>;
  parsedFromPaste: boolean;
  connectorsEnabled: false;
  unknown: string[];
  inferred: IntakeFieldKey[];
  thread?: CorrespondenceThread;
};
