export type AssistantSseSuggestion = { label: string; href: string };

/**
 * Parse `text/event-stream` body from POST /api/assistant (`stream: true`).
 * Each event is one `data: {json}\n\n` line.
 */
export async function consumeAssistantSse(
  response: Response,
  handlers: {
    onMeta?: (playbook: string) => void;
    onDelta: (text: string) => void;
    onDone: (suggestions: AssistantSseSuggestion[], toolsUsed: string[]) => void;
    onError: (message: string) => void;
  },
): Promise<void> {
  const reader = response.body?.getReader();
  if (!reader) {
    handlers.onError("No response body");
    return;
  }

  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const parts = buffer.split("\n\n");
    buffer = parts.pop() ?? "";

    for (const part of parts) {
      const line = part
        .split("\n")
        .map((l) => l.trim())
        .find((l) => l.startsWith("data:"));
      if (!line) continue;

      const raw = line.replace(/^data:\s?/, "").trim();
      let ev: unknown;
      try {
        ev = JSON.parse(raw);
      } catch {
        continue;
      }
      if (typeof ev !== "object" || ev === null || !("type" in ev)) continue;
      const o = ev as { type: string; playbook?: unknown; text?: unknown; suggestions?: unknown; toolsUsed?: unknown; message?: unknown };

      if (o.type === "meta" && typeof o.playbook === "string") {
        handlers.onMeta?.(o.playbook);
      }
      if (o.type === "delta" && typeof o.text === "string") {
        handlers.onDelta(o.text);
      }
      if (o.type === "done") {
        const suggestions = Array.isArray(o.suggestions) ? (o.suggestions as AssistantSseSuggestion[]) : [];
        const toolsUsed = Array.isArray(o.toolsUsed) ? (o.toolsUsed as string[]).filter((x) => typeof x === "string") : [];
        handlers.onDone(suggestions, toolsUsed);
      }
      if (o.type === "error" && typeof o.message === "string") {
        handlers.onError(o.message);
      }
    }
  }
}
