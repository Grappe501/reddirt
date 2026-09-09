import type { DecisionSimulationChannel, DecisionSimulationOpeningInput } from "../contracts";
import { CHANNEL_INTAKE_FIELDS, type CorrespondenceIntake, type IntakeFieldKey } from "./contracts";
import { mergeIntakeFields, parseCorrespondencePaste } from "./parse";
import { formatThreadIntakeLines } from "./thread";

export function composeCorrespondenceOpening(input: {
  channel: DecisionSimulationChannel;
  paste: string;
  fieldOverrides?: Partial<Record<IntakeFieldKey, string>>;
  objective?: string;
  operatorContext?: string;
  stakes?: DecisionSimulationOpeningInput["stakes"];
  urgency?: DecisionSimulationOpeningInput["urgency"];
}): {
  intake: CorrespondenceIntake;
  message: string;
  intakePacket: string;
} {
  const parsed = mergeIntakeFields(parseCorrespondencePaste(input.paste, input.channel), input.fieldOverrides ?? {});
  const message = parsed.body.trim();
  const lines = [
    `CORRESPONDENCE INTAKE (${parsed.version})`,
    `Channel: ${parsed.channel}. Connectors=DISABLED. This is a pasted artifact, not a mailbox fetch.`,
    ...CHANNEL_INTAKE_FIELDS[parsed.channel].map((def) => `${def.label}: ${parsed.fields[def.key] ?? "unknown"}`),
    parsed.unknown.length ? `Unknown structured fields: ${parsed.unknown.join(", ")}.` : "All structured fields for this channel were supplied.",
    ...((parsed.inferred ?? []).length
      ? [`Inferred from unlabeled paste: ${parsed.inferred.join(", ")}. Nothing was invented.`]
      : []),
    ...formatThreadIntakeLines(parsed.thread),
    "Do not invent recipients, venues, questions, or headers that were not supplied.",
    "Do not send, schedule, or post this correspondence.",
  ];
  return { intake: parsed, message, intakePacket: lines.join("\n") };
}

export function formatCorrespondenceIntakePacket(intake?: CorrespondenceIntake | null): string {
  if (!intake) return "";
  return [
    `CORRESPONDENCE INTAKE (${intake.version})`,
    `Channel: ${intake.channel}. Connectors=DISABLED. This is a pasted artifact, not a mailbox fetch.`,
    ...CHANNEL_INTAKE_FIELDS[intake.channel].map((def) => `${def.label}: ${intake.fields[def.key] ?? "unknown"}`),
    intake.unknown.length
      ? `Unknown structured fields: ${intake.unknown.join(", ")}.`
      : "All structured fields for this channel were supplied.",
    ...((intake.inferred ?? []).length
      ? [`Inferred from unlabeled paste: ${intake.inferred.join(", ")}. Nothing was invented.`]
      : []),
    ...formatThreadIntakeLines(intake.thread),
    "Do not invent recipients, venues, questions, or headers that were not supplied.",
    "Do not send, schedule, or post this correspondence.",
  ].join("\n");
}
