import type { DecisionSimulationChannel } from "../contracts";
import type { IntakeFieldKey } from "./contracts";

export const CHANNEL_NATIVE_PASTE_VERSION = "channel-native-paste-1.0" as const;

const PHONE =
  /^\+?1?[\s.-]?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/;
const HANDLE_LINE = /^@([A-Za-z0-9_]{2,30})$/;
const HANDLE_PAREN = /^.{0,40}\(@([A-Za-z0-9_]{2,30})\)$/;
const EMAIL_ANGLE = /^([^<\n]{1,80})\s+<([A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,})>$/i;
const DEBATE_Q = /^(?:Q\.|Q:)\s+(.+)$/i;
const DATELINE = /^([A-Z][A-Z .'-]{2,40}),\s+([A-Za-z.]{2,20})\s+\(([A-Z]{2,6})\)\s+[—–-]\s+/;
const ASK_AMOUNT = /\$[\d,]+(?:\.\d{2})?/;
const REMARKS_AT = /^Remarks at (.+)$/i;

function firstNonemptyLine(text: string): string {
  return text.split("\n").map((line) => line.trim()).find((line) => line) ?? "";
}

function restAfterFirstLine(text: string): string {
  const lines = text.replace(/\r\n/g, "\n").split("\n");
  const idx = lines.findIndex((line) => line.trim());
  if (idx < 0) return "";
  return lines.slice(idx + 1).join("\n").replace(/^\n+/, "").trim();
}

function takeIfEmpty(
  fields: Partial<Record<IntakeFieldKey, string>>,
  inferred: IntakeFieldKey[],
  key: IntakeFieldKey,
  value: string | null | undefined,
): void {
  const trimmed = value?.trim();
  if (!trimmed || fields[key]) return;
  fields[key] = trimmed;
  inferred.push(key);
}

function platformFromUrls(text: string): string | null {
  if (/x\.com\/|twitter\.com\//i.test(text)) return "X";
  if (/facebook\.com\//i.test(text)) return "Facebook";
  if (/instagram\.com\//i.test(text)) return "Instagram";
  if (/threads\.net\//i.test(text)) return "Threads";
  return null;
}

export function inferNativeIntakeFields(
  channel: DecisionSimulationChannel,
  body: string,
  existing: Partial<Record<IntakeFieldKey, string>>,
): { fields: Partial<Record<IntakeFieldKey, string>>; body: string; inferred: IntakeFieldKey[] } {
  const fields = { ...existing };
  const inferred: IntakeFieldKey[] = [];
  let nextBody = body.trim();
  const first = firstNonemptyLine(nextBody);

  if (channel === "EMAIL") {
    const angle = first.match(EMAIL_ANGLE);
    if (angle) {
      takeIfEmpty(fields, inferred, "from", `${angle[1].trim()} <${angle[2]}>`);
      nextBody = restAfterFirstLine(nextBody);
    }
  }

  if (channel === "SOCIAL") {
    const handle = first.match(HANDLE_LINE)?.[1] ?? first.match(HANDLE_PAREN)?.[1];
    if (handle) {
      takeIfEmpty(fields, inferred, "handle", `@${handle}`);
      nextBody = restAfterFirstLine(nextBody);
    }
    takeIfEmpty(fields, inferred, "platform", platformFromUrls(body));
  }

  if (channel === "SMS" && PHONE.test(first)) {
    takeIfEmpty(fields, inferred, "from", first);
    nextBody = restAfterFirstLine(nextBody);
  }

  if (channel === "PRESS_STATEMENT" || channel === "PUBLIC_STATEMENT") {
    const dateline = nextBody.match(DATELINE);
    if (dateline) {
      if (channel === "PUBLIC_STATEMENT") {
        takeIfEmpty(fields, inferred, "venue", `${dateline[1].trim()}, ${dateline[2].trim()}`);
      }
      if (channel === "PRESS_STATEMENT") {
        takeIfEmpty(fields, inferred, "outlet", dateline[3]);
      }
    }
    const lines = nextBody.split("\n");
    if (
      !fields.headline &&
      lines[0]?.trim() &&
      !DATELINE.test(lines[0]) &&
      lines[0].trim().length >= 12 &&
      lines[0].trim().length <= 110 &&
      lines[1] === "" &&
      lines.slice(2).some((line) => line.trim())
    ) {
      takeIfEmpty(fields, inferred, "headline", lines[0].trim());
    }
    if (channel === "PRESS_STATEMENT") {
      const embargoLine = nextBody.split("\n").slice(0, 5).find((line) => /embargo/i.test(line));
      if (embargoLine) takeIfEmpty(fields, inferred, "embargo", embargoLine.trim());
    }
  }

  if (channel === "DEBATE") {
    const asked = first.match(DEBATE_Q);
    if (asked) {
      takeIfEmpty(fields, inferred, "question", asked[1].trim());
      nextBody = restAfterFirstLine(nextBody);
    }
  }

  if (channel === "FUNDRAISING") {
    const askLine = nextBody.split("\n").slice(0, 3).find((line) => ASK_AMOUNT.test(line));
    const amount = askLine?.match(ASK_AMOUNT)?.[0];
    takeIfEmpty(fields, inferred, "ask", amount);
  }

  if (channel === "SPEECH") {
    const remarks = first.match(REMARKS_AT);
    if (remarks) {
      takeIfEmpty(fields, inferred, "venue", remarks[1].trim());
      nextBody = restAfterFirstLine(nextBody);
    }
  }

  return { fields, body: nextBody.trim() || body.trim(), inferred };
}
