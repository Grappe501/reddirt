"use client";

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { createPortal } from "react-dom";
import { usePathname } from "next/navigation";
import { useJourney } from "@/components/journey/journey-context";
import { beatById } from "@/content/home/journey";
import { CAMPAIGN_GUIDE_OPENING } from "@/content/tone-nuggets";
import { normalizeHistory } from "@/lib/assistant/conversation";
import { ASSISTANT_API_VERSION } from "@/lib/assistant/version";
import { consumeAssistantSse } from "@/lib/campaign-guide/assistant-sse";
import { cn } from "@/lib/utils";

type ChatMessage = { role: "user" | "assistant"; text: string };
type Suggestion = { label: string; href: string };

export function CampaignGuideDock() {
  const pathname = usePathname();
  const panelId = useId();
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [open, setOpen] = useState(false);
  const [journeyBeatOnPage, setJourneyBeatOnPage] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: "assistant", text: CAMPAIGN_GUIDE_OPENING },
  ]);
  const [lastSuggestions, setLastSuggestions] = useState<Suggestion[]>([]);
  const [responseStyle, setResponseStyle] = useState<"concise" | "normal" | "detailed">("concise");
  const { activeBeatId } = useJourney();

  useEffect(() => {
    if (!activeBeatId) {
      setJourneyBeatOnPage(null);
      return;
    }
    const el = document.querySelector<HTMLElement>(`[data-journey-beat="${activeBeatId}"]`);
    setJourneyBeatOnPage(el ? activeBeatId : null);
  }, [activeBeatId, pathname, open]);

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    const t = window.setTimeout(() => inputRef.current?.focus(), 80);
    return () => {
      window.clearTimeout(t);
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput("");
    setError(null);

    const historySource =
      messages.length > 1 && messages[0]?.role === "assistant"
        ? messages.slice(1)
        : [...messages];
    const history = normalizeHistory(historySource.map((m) => ({ role: m.role, text: m.text })));

    setMessages((m) => [...m, { role: "user", text }]);
    setLoading(true);
    setLastSuggestions([]);

    try {
      const beat = activeBeatId ? beatById(activeBeatId) : undefined;
      const res = await fetch("/api/assistant", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Assistant-Version": ASSISTANT_API_VERSION,
        },
        body: JSON.stringify({
          message: text,
          history,
          version: ASSISTANT_API_VERSION,
          stream: true,
          responseStyle,
          journeyBeatId: activeBeatId ?? undefined,
          journeyBeatLabel: beat?.navLabel,
          journeyBeatDescription: beat?.description,
          pathname: typeof window !== "undefined" ? window.location.pathname : "/",
        }),
      });

      const contentType = res.headers.get("content-type") ?? "";

      if (res.ok && contentType.includes("text/event-stream")) {
        let firstDelta = true;
        await consumeAssistantSse(res, {
          onDelta: (d) => {
            if (firstDelta) {
              firstDelta = false;
              setMessages((m) => [...m, { role: "assistant", text: d }]);
            } else {
              setMessages((m) => {
                const x = [...m];
                const last = x[x.length - 1];
                if (last?.role === "assistant") {
                  x[x.length - 1] = { ...last, text: last.text + d };
                }
                return x;
              });
            }
          },
          onDone: (suggestions) => setLastSuggestions(suggestions),
          onError: (msg) => {
            setError(msg);
            setMessages((m) => {
              const x = [...m];
              const last = x[x.length - 1];
              if (last?.role === "assistant") {
                x[x.length - 1] = { ...last, text: `${last.text}\n\n— ${msg}` };
                return x;
              }
              return [...m, { role: "assistant", text: msg }];
            });
          },
        });
        return;
      }

      const raw = await res.text();
      let json: {
        version?: string;
        playbook?: string;
        toolsUsed?: string[];
        reply?: string;
        suggestions?: Suggestion[];
        error?: string;
        message?: string;
      } = {};
      try {
        json = raw ? (JSON.parse(raw) as typeof json) : {};
      } catch {
        setError("The server returned an unexpected response.");
        setMessages((m) => [
          ...m,
          {
            role: "assistant",
            text:
              "The guide service didn’t return JSON—often a deploy or proxy issue. Try again, or check the browser Network tab for /api/assistant.",
          },
        ]);
        return;
      }

      if (!res.ok) {
        const assistantText =
          json.message ||
          (json.error === "not_configured"
            ? "OpenAI isn’t configured on the server. Add OPENAI_API_KEY to .env and restart."
            : json.error === "search_failed"
              ? "Couldn’t reach the site’s knowledge base—try browsing the menu, or email kelly@kellygrappe.com with what you needed."
              : json.error === "openai_chat_failed"
                ? "The AI model request failed (quota, model name, or key). If it keeps happening, email kelly@kellygrappe.com."
                : json.error === "assistant_failed"
                  ? "Something went wrong on our end. Try again—or email kelly@kellygrappe.com if it persists."
                  : json.error || "The guide couldn’t answer that right now. Email kelly@kellygrappe.com if you need a human.");
        setError(assistantText);
        setMessages((m) => [...m, { role: "assistant", text: assistantText }]);
        return;
      }

      setLastSuggestions(json.suggestions ?? []);
      setMessages((m) => [...m, { role: "assistant", text: json.reply ?? "No reply returned." }]);
    } catch {
      setError("Network error.");
      setMessages((m) => [...m, { role: "assistant", text: "Network error. Check your connection and try again." }]);
    } finally {
      setLoading(false);
    }
  };

  const dock = (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          "fixed z-[45] flex max-w-[calc(100vw-1.5rem)] items-center gap-1.5 rounded-full border border-deep-soil/12 bg-cream-canvas/95 px-3 py-2 font-body text-xs font-semibold text-deep-soil shadow-md backdrop-blur-md transition",
          "hover:border-red-dirt/35 hover:bg-white hover:shadow-lg",
          "bottom-[max(1rem,env(safe-area-inset-bottom,0px))] right-[max(1rem,env(safe-area-inset-right,0px))] sm:bottom-6 sm:right-6",
        )}
        aria-expanded={open}
        aria-controls={panelId}
        aria-label="Ask Kelly — open the site guide chat"
      >
        <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-red-dirt/15 text-[11px] font-bold text-red-dirt" aria-hidden>
          KG
        </span>
        <span className="pr-0.5 tracking-wide">Ask Kelly</span>
      </button>

      {open
        ? createPortal(
            <div
              className="fixed inset-0 z-[60] flex items-end justify-end bg-civic-midnight/40 p-0 sm:items-stretch sm:justify-stretch sm:p-4"
              role="presentation"
              onClick={() => setOpen(false)}
            >
              <div
                id={panelId}
                role="dialog"
                aria-modal="true"
                aria-label="Ask Kelly — campaign guide"
                className="flex h-[min(100dvh,640px)] w-full max-w-lg flex-col rounded-t-2xl border border-civic-ink/15 bg-cream-canvas shadow-2xl sm:h-[min(92vh,720px)] sm:rounded-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between border-b border-deep-soil/10 px-4 py-3">
                  <div>
                    <p className="font-body text-[10px] font-bold uppercase tracking-[0.2em] text-red-dirt">Ask Kelly</p>
                    <p className="font-body text-xs text-deep-soil/60">
                      Guide v{ASSISTANT_API_VERSION} · streaming · citations · {responseStyle} answers · 3/min ·
                      kelly@kellygrappe.com if I’m stumped
                    </p>
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                      {(["concise", "normal", "detailed"] as const).map((s) => (
                        <button
                          key={s}
                          type="button"
                          disabled={loading}
                          onClick={() => setResponseStyle(s)}
                          className={cn(
                            "rounded-full px-2.5 py-0.5 font-body text-[10px] font-semibold uppercase tracking-wide",
                            responseStyle === s
                              ? "bg-red-dirt/20 text-red-dirt ring-1 ring-red-dirt/35"
                              : "bg-deep-soil/5 text-deep-soil/65 hover:bg-deep-soil/10",
                          )}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="rounded-lg px-3 py-1.5 font-body text-sm font-semibold text-deep-soil hover:bg-deep-soil/5"
                  >
                    Close
                  </button>
                </div>

                {journeyBeatOnPage && beatById(journeyBeatOnPage) ? (
                  <p className="border-b border-deep-soil/8 bg-civic-fog/50 px-4 py-2 font-body text-xs text-civic-slate">
                    <span className="font-semibold text-civic-ink">You’re in:</span> {beatById(journeyBeatOnPage)?.navLabel} —{" "}
                    {beatById(journeyBeatOnPage)?.description}
                  </p>
                ) : null}

                <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
                  {messages.map((msg, i) => (
                    <div
                      key={`${msg.role}-${i}`}
                      className={cn(
                        "rounded-xl px-3 py-2.5 font-body text-sm leading-relaxed",
                        msg.role === "user" ? "ml-6 bg-red-dirt/12 text-deep-soil" : "mr-4 bg-white text-deep-soil shadow-sm",
                      )}
                    >
                      {msg.text}
                    </div>
                  ))}
                  {loading ? (
                    <p className="font-body text-sm italic text-deep-soil/50">
                      Digging through what the campaign taught me…
                    </p>
                  ) : null}
                  {error ? <p className="text-sm text-red-700">{error}</p> : null}
                  {lastSuggestions.length > 0 ? (
                    <div className="flex flex-wrap gap-2 pt-1">
                      {lastSuggestions.map((s) => (
                        <Link
                          key={s.href}
                          href={s.href}
                          className="rounded-full border border-civic-blue/25 bg-civic-fog/80 px-3 py-1.5 font-body text-xs font-semibold text-civic-blue hover:border-civic-gold"
                          onClick={() => setOpen(false)}
                        >
                          {s.label}
                        </Link>
                      ))}
                    </div>
                  ) : null}
                </div>

                <div className="border-t border-deep-soil/10 p-3">
                  <textarea
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        void send();
                      }
                    }}
                    rows={2}
                    placeholder="Ask anything on this site—or something specific about Kelly…"
                    className="w-full resize-none rounded-lg border border-deep-soil/15 bg-white px-3 py-2 font-body text-sm text-deep-soil outline-none focus:ring-2 focus:ring-red-dirt/30"
                  />
                  <button
                    type="button"
                    onClick={() => void send()}
                    disabled={loading || !input.trim()}
                    className="mt-2 w-full rounded-lg bg-civic-midnight py-2.5 font-body text-sm font-bold uppercase tracking-wider text-civic-mist disabled:opacity-50"
                  >
                    Send
                  </button>
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}
    </>
  );

  return dock;
}
