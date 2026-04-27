"use client";

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { createPortal } from "react-dom";
import { usePathname } from "next/navigation";
import { useJourney } from "@/components/journey/journey-context";
import { beatById } from "@/content/home/journey";
import { CAMPAIGN_GUIDE_QUICK_PROMPTS } from "@/content/campaign-guide-quick-prompts";
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
            ? "The conversation tool isn’t available on this site build yet—browse the menu or email kelly@kellygrappe.com."
            : json.error === "search_failed"
              ? "Couldn’t reach the site’s knowledge base—try browsing the menu, or email kelly@kellygrappe.com with what you needed."
              : json.error === "openai_chat_failed"
                ? "The guide couldn’t finish that request (service limit or site configuration). If it keeps happening, email kelly@kellygrappe.com."
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
          "fixed z-[45] flex max-w-[calc(100vw-1.5rem)] items-center gap-2 rounded-full border-2 border-kelly-gold/50 bg-gradient-to-r from-kelly-page via-white to-[var(--kelly-mist)]/90 px-3.5 py-2.5 font-body text-xs font-bold tracking-wide text-kelly-text shadow-lg shadow-kelly-navy/15 backdrop-blur-md transition",
          "hover:border-kelly-gold hover:shadow-xl hover:shadow-kelly-gold/20",
          "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-kelly-gold",
          "bottom-[max(1rem,env(safe-area-inset-bottom,0px))] right-[max(1rem,env(safe-area-inset-right,0px))] sm:bottom-6 sm:right-6",
        )}
        aria-expanded={open}
        aria-controls={panelId}
        aria-label="Ask Kelly — open the site guide chat"
      >
        <span
          className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-kelly-navy text-[10px] font-bold text-kelly-mist shadow-inner"
          aria-hidden
        >
          KG
        </span>
        <span className="pr-0.5">Ask Kelly</span>
        <span className="hidden rounded-full bg-kelly-gold/25 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-kelly-navy sm:inline">
          Message support
        </span>
      </button>

      {open
        ? createPortal(
            <div
              className="fixed inset-0 z-[60] flex items-end justify-end bg-kelly-navy/40 p-0 sm:items-stretch sm:justify-stretch sm:p-4"
              role="presentation"
              onClick={() => setOpen(false)}
            >
              <div
                id={panelId}
                role="dialog"
                aria-modal="true"
                aria-label="Ask Kelly — campaign guide"
                className="flex h-[min(100dvh,640px)] w-full max-w-lg flex-col rounded-t-2xl border border-kelly-ink/15 bg-kelly-page shadow-2xl sm:h-[min(92vh,720px)] sm:rounded-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between border-b border-kelly-text/10 bg-gradient-to-r from-kelly-fog/80 via-white to-[var(--kelly-mist)]/40 px-4 py-3">
                  <div>
                    <p className="font-body text-[10px] font-bold uppercase tracking-[0.2em] text-kelly-navy">Ask Kelly</p>
                    <p className="font-body text-xs text-kelly-text/60">
                      Site-aware guide · v{ASSISTANT_API_VERSION} · streaming · {responseStyle} · 3/min ·
                      kelly@kellygrappe.com
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
                              ? "bg-kelly-navy/20 text-kelly-navy ring-1 ring-kelly-navy/35"
                              : "bg-kelly-text/5 text-kelly-text/65 hover:bg-kelly-text/10",
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
                    className="rounded-lg px-3 py-1.5 font-body text-sm font-semibold text-kelly-text hover:bg-kelly-text/5"
                  >
                    Close
                  </button>
                </div>

                {journeyBeatOnPage && beatById(journeyBeatOnPage) ? (
                  <p className="border-b border-kelly-text/8 bg-kelly-fog/50 px-4 py-2 font-body text-xs text-kelly-slate">
                    <span className="font-semibold text-kelly-ink">You’re in:</span> {beatById(journeyBeatOnPage)?.navLabel} —{" "}
                    {beatById(journeyBeatOnPage)?.description}
                  </p>
                ) : null}

                {messages.length === 1 && !loading ? (
                  <div className="border-b border-kelly-text/8 bg-kelly-page px-3 py-2">
                    <p className="px-1 font-body text-[10px] font-bold uppercase tracking-wider text-kelly-text/45">
                      Try asking
                    </p>
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                      {CAMPAIGN_GUIDE_QUICK_PROMPTS.map((q) => (
                        <button
                          key={q.label}
                          type="button"
                          onClick={() => {
                            setInput(q.message);
                            inputRef.current?.focus();
                          }}
                          className="rounded-full border border-kelly-navy/15 bg-white px-2.5 py-1 text-left font-body text-[11px] font-semibold text-kelly-navy/90 transition hover:border-kelly-gold/50 hover:bg-kelly-fog/80"
                        >
                          {q.label}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : null}

                <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
                  {messages.map((msg, i) => (
                    <div
                      key={`${msg.role}-${i}`}
                      className={cn(
                        "rounded-xl px-3 py-2.5 font-body text-sm leading-relaxed",
                        msg.role === "user" ? "ml-6 bg-kelly-navy/12 text-kelly-text" : "mr-4 bg-white text-kelly-text shadow-sm",
                      )}
                    >
                      {msg.text}
                    </div>
                  ))}
                  {loading ? (
                    <p className="font-body text-sm italic text-kelly-text/50">
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
                          className="rounded-full border border-kelly-blue/25 bg-kelly-fog/80 px-3 py-1.5 font-body text-xs font-semibold text-kelly-blue hover:border-kelly-gold"
                          onClick={() => setOpen(false)}
                        >
                          {s.label}
                        </Link>
                      ))}
                    </div>
                  ) : null}
                </div>

                <div className="border-t border-kelly-text/10 p-3">
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
                    className="w-full resize-none rounded-lg border border-kelly-text/15 bg-white px-3 py-2 font-body text-sm text-kelly-text outline-none focus:ring-2 focus:ring-kelly-navy/30"
                  />
                  <button
                    type="button"
                    onClick={() => void send()}
                    disabled={loading || !input.trim()}
                    className="mt-2 w-full rounded-lg bg-kelly-navy py-2.5 font-body text-sm font-bold uppercase tracking-wider text-kelly-mist disabled:opacity-50"
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
