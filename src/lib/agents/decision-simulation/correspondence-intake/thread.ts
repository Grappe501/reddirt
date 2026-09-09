import { clipEvidenceText } from "../evidence-provenance/clip";

export const CORRESPONDENCE_THREAD_VERSION = "correspondence-thread-1.0" as const;
export const THREAD_PRIOR_MAX = 6;
export const THREAD_EXCERPT_MAX = 160;

export type CorrespondenceThreadTurn = {
  speaker: string | null;
  body: string;
};

export type CorrespondenceThread = {
  version: typeof CORRESPONDENCE_THREAD_VERSION;
  priorCount: number;
  latestIsOpening: true;
  priorTurns: CorrespondenceThreadTurn[];
  quotesStripped: boolean;
  connectorsEnabled: false;
};

const ON_WROTE = /^On .+ wrote:\s*$/i;
const ORIGINAL_MESSAGE = /^-{2,}\s*Original Message\s*-{2,}\s*$/i;
const FORWARDED = /^Begin forwarded message:\s*$/i;
const QUOTE_LINE = /^>+\s?/;
const SIGNATURE = /\n-- \n[\s\S]*$/;
const SENT_FROM = /\nSent from my [^\n]+$/i;

function isSplitMarker(line: string): boolean {
  const trimmed = line.trim();
  return ON_WROTE.test(trimmed) || ORIGINAL_MESSAGE.test(trimmed) || FORWARDED.test(trimmed);
}

function speakerFromMarker(line: string): string | null {
  const match = line.trim().match(/^On (.+) wrote:\s*$/i);
  const raw = match?.[1]?.trim();
  return raw || null;
}

function stripSignature(text: string): string {
  return text.replace(SIGNATURE, "").replace(SENT_FROM, "").trim();
}

function stripLeadingQuotes(text: string): { text: string; stripped: boolean } {
  const lines = text.split("\n");
  const kept = lines.filter((line) => !QUOTE_LINE.test(line));
  return { text: kept.join("\n").trim(), stripped: kept.length !== lines.length };
}

export function splitCorrespondenceThread(raw: string): {
  latest: string;
  thread: CorrespondenceThread;
} {
  const text = raw.replace(/\r\n/g, "\n").trim();
  if (!text) {
    return {
      latest: "",
      thread: {
        version: CORRESPONDENCE_THREAD_VERSION,
        priorCount: 0,
        latestIsOpening: true,
        priorTurns: [],
        quotesStripped: false,
        connectorsEnabled: false,
      },
    };
  }

  const lines = text.split("\n");
  const blocks: Array<{ speaker: string | null; lines: string[] }> = [{ speaker: null, lines: [] }];
  for (const line of lines) {
    if (isSplitMarker(line) && blocks[0].lines.some((item) => item.trim())) {
      blocks.push({ speaker: speakerFromMarker(line), lines: [] });
      continue;
    }
    blocks[blocks.length - 1].lines.push(line);
  }

  const turns = blocks
    .map((block) => ({ speaker: block.speaker, body: stripSignature(block.lines.join("\n")) }))
    .filter((turn) => turn.body);
  const first = turns[0] ?? { speaker: null, body: text };
  const quoted = stripLeadingQuotes(first.body);
  const latest = stripSignature(quoted.text) || first.body;
  const priorTurns = turns.slice(1).slice(0, THREAD_PRIOR_MAX);

  return {
    latest,
    thread: {
      version: CORRESPONDENCE_THREAD_VERSION,
      priorCount: priorTurns.length,
      latestIsOpening: true,
      priorTurns,
      quotesStripped: quoted.stripped,
      connectorsEnabled: false,
    },
  };
}

export function formatThreadIntakeLines(thread?: CorrespondenceThread | null): string[] {
  if (!thread || thread.priorCount < 1) return [];
  const first = thread.priorTurns[0];
  const who = first?.speaker ?? "unknown speaker";
  const excerpt = first?.body ? clipEvidenceText(first.body, THREAD_EXCERPT_MAX) : "unknown";
  return [
    `Thread: ${thread.priorCount} earlier pasted turn(s). Latest is the opening move. Not a mailbox fetch.`,
    `Earlier turn (${who}): ${excerpt}`,
  ];
}
