import type { DecisionSimulationChannel } from "../contracts";
import {
  CHANNEL_INTAKE_FIELDS,
  CORRESPONDENCE_INTAKE_VERSION,
  type CorrespondenceIntake,
  type IntakeFieldKey,
} from "./contracts";
import { splitCorrespondenceThread } from "./thread";

const HEADER_LINE = /^([A-Za-z][A-Za-z0-9 /_-]{0,40})\s*:\s*(.*)$/;

function normalizeAlias(value: string): string {
  return value.trim().toLowerCase().replace(/[_/]+/g, " ");
}

export function parseCorrespondencePaste(raw: string, channel: DecisionSimulationChannel): CorrespondenceIntake {
  const text = raw.replace(/\r\n/g, "\n");
  const defs = CHANNEL_INTAKE_FIELDS[channel];
  const aliasToKey = new Map<string, IntakeFieldKey>();
  for (const def of defs) {
    for (const alias of [def.key, ...def.headerAliases]) {
      aliasToKey.set(normalizeAlias(alias), def.key);
    }
  }

  const fields: Partial<Record<IntakeFieldKey, string>> = {};
  const lines = text.split("\n");
  let cursor = 0;
  let sawHeader = false;
  while (cursor < lines.length) {
    const line = lines[cursor];
    if (!line.trim()) {
      if (sawHeader) {
        cursor += 1;
        break;
      }
      cursor += 1;
      continue;
    }
    const match = line.match(HEADER_LINE);
    if (!match) break;
    const key = aliasToKey.get(normalizeAlias(match[1]));
    if (!key) break;
    fields[key] = match[2].trim();
    sawHeader = true;
    cursor += 1;
  }

  const rawBody = lines.slice(cursor).join("\n").trim();
  const fallback = rawBody || (!sawHeader ? text.trim() : "");
  const { latest, thread } = splitCorrespondenceThread(fallback);
  const unknown: string[] = [];
  for (const def of defs) {
    if (!fields[def.key]) unknown.push(def.key);
  }

  return {
    version: CORRESPONDENCE_INTAKE_VERSION,
    channel,
    body: latest || fallback,
    fields,
    parsedFromPaste: sawHeader || thread.priorCount > 0 || thread.quotesStripped,
    connectorsEnabled: false,
    unknown,
    thread,
  };
}

export function mergeIntakeFields(
  intake: CorrespondenceIntake,
  overrides: Partial<Record<IntakeFieldKey, string>>,
): CorrespondenceIntake {
  const fields = { ...intake.fields };
  for (const [key, value] of Object.entries(overrides) as Array<[IntakeFieldKey, string]>) {
    const trimmed = value.trim();
    if (trimmed) fields[key] = trimmed;
    else delete fields[key];
  }
  const unknown = CHANNEL_INTAKE_FIELDS[intake.channel]
    .map((def) => def.key)
    .filter((key) => !fields[key]);
  return { ...intake, fields, unknown };
}
