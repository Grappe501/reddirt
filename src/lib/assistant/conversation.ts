export type ChatTurn = { role: "user" | "assistant"; text: string };

const MAX_TURNS = 14;
const MAX_TOTAL_CHARS = 3600;

/**
 * Shapes prior turns for the model (most recent first, then truncated from the start).
 * Omits empty text. Does not include the current user message (sent separately as `message`).
 */
export function normalizeHistory(raw: ChatTurn[] | undefined): ChatTurn[] {
  if (!raw?.length) return [];
  const out: ChatTurn[] = [];
  for (const t of raw) {
    if (t.role !== "user" && t.role !== "assistant") continue;
    const text = typeof t.text === "string" ? t.text.trim() : "";
    if (!text) continue;
    out.push({ role: t.role, text: text.slice(0, 6000) });
  }
  return out.slice(-MAX_TURNS);
}

/** Prefix block for the user message so the model can resolve follow-ups. */
export function formatConversationForPrompt(turns: ChatTurn[]): string {
  if (!turns.length) return "";
  const lines: string[] = [];
  let used = 0;
  for (let i = turns.length - 1; i >= 0; i--) {
    const t = turns[i];
    const label = t.role === "user" ? "Visitor" : "Guide";
    const line = `${label}: ${t.text}`;
    if (used + line.length + 1 > MAX_TOTAL_CHARS) break;
    lines.unshift(line);
    used += line.length + 1;
  }
  if (!lines.length) return "";
  return [
    "CONVERSATION SO FAR (follow-up context only—facts must still come from CONTEXT and tools):",
    ...lines,
    "",
  ].join("\n");
}

/** Expand lexical/semantic search query with recent user utterances (v2 retrieval). */
export function searchQueryFromTurns(currentMessage: string, turns: ChatTurn[]): string {
  const users = turns.filter((t) => t.role === "user").slice(-3);
  const parts = [...users.map((t) => t.text), currentMessage].map((s) => s.trim()).filter(Boolean);
  const merged = [...new Set(parts)].join("\n").replace(/\s+/g, " ").trim();
  return merged.slice(0, 900) || currentMessage.trim();
}
