/**
 * Server-sent events for POST /api/assistant when `stream: true`.
 * One JSON object per `data:` line (easy to parse in the browser).
 */

export type AssistantStreamMeta = {
  type: "meta";
  version: string;
  playbook: string;
};

export type AssistantStreamDelta = { type: "delta"; text: string };

export type AssistantStreamDone = {
  type: "done";
  suggestions: Array<{ label: string; href: string }>;
  toolsUsed: string[];
  /** Present when playbook is `system_guide` — practical follow-up line for the dock. */
  nextStep?: string;
  /** Present when playbook is `system_guide` and the guide included a boundary note. */
  safetyNote?: string;
};

export type AssistantStreamError = { type: "error"; message: string };

export type AssistantStreamEvent =
  | AssistantStreamMeta
  | AssistantStreamDelta
  | AssistantStreamDone
  | AssistantStreamError;

const enc = new TextEncoder();

export function sseEncode(obj: AssistantStreamEvent): Uint8Array {
  return enc.encode(`data: ${JSON.stringify(obj)}\n\n`);
}

/** Slice reply into small UTF-16-safe chunks for incremental UI (no extra model calls). */
export function* replyChunks(reply: string, size = 72): Generator<string> {
  for (let i = 0; i < reply.length; i += size) {
    yield reply.slice(i, i + size);
  }
}
