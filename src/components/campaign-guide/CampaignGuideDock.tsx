"use client";

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { createPortal } from "react-dom";
import { usePathname } from "next/navigation";
import { useJourney } from "@/components/journey/journey-context";
import { beatById } from "@/content/home/journey";
import { CAMPAIGN_GUIDE_QUICK_PROMPTS } from "@/content/campaign-guide-quick-prompts";
import { AskKellyBetaFeedbackForm } from "@/components/campaign-guide/AskKellyBetaFeedbackForm";
import {
  ASK_KELLY_ASSISTANT_FALLBACK_LAYERS,
  ASK_KELLY_BETA_INVITE_BANNER,
  ASK_KELLY_BETA_ONBOARDING,
} from "@/content/ask-kelly-beta-public-copy";
import { CAMPAIGN_GUIDE_OPENING } from "@/content/tone-nuggets";
import { ASK_KELLY_NO_MATCH_REPLY, ASK_KELLY_RECOVERY_PROMPT_BUTTONS } from "@/content/ask-kelly-chat-recovery";
import { normalizeHistory } from "@/lib/assistant/conversation";
import { ASSISTANT_API_VERSION } from "@/lib/assistant/version";
import { consumeAssistantSse } from "@/lib/campaign-guide/assistant-sse";
import { AskKellyMissedFeedbackCapture } from "@/components/campaign-guide/AskKellyMissedFeedbackCapture";
import { OPEN_CAMPAIGN_GUIDE_EVENT } from "@/lib/campaign-guide/open";
import { cn } from "@/lib/utils";

function isWeakAssistantPayload(accumulatedReply: string, playbook: string): boolean {
  if (playbook === "system_guide") return false;
  const t = accumulatedReply.trim();
  if (t.length === 0) return true;
  return /notebook is blank|blank on this server/i.test(t);
}

type ChatMessage = { role: "user" | "assistant"; text: string };
type Suggestion = { label: string; href: string };

const ASSISTANT_UNAVAILABLE_COPY = [
  ASK_KELLY_ASSISTANT_FALLBACK_LAYERS.primary,
  ASK_KELLY_ASSISTANT_FALLBACK_LAYERS.secondary,
  ASK_KELLY_ASSISTANT_FALLBACK_LAYERS.tertiary,
].join("\n\n");

function displayAssistantMessage(text: string): string {
  const t = text.trim();
  if (t.length > 0) return text;
  return ASSISTANT_UNAVAILABLE_COPY;
}

export function CampaignGuideDock() {
  const pathname = usePathname();
  const panelId = useId();
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [open, setOpen] = useState(false);
  const [panelTab, setPanelTab] = useState<"chat" | "feedback">("chat");
  const [journeyBeatOnPage, setJourneyBeatOnPage] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: "assistant", text: displayAssistantMessage(CAMPAIGN_GUIDE_OPENING) },
  ]);
  const [lastSuggestions, setLastSuggestions] = useState<Suggestion[]>([]);
  /** Set when the server returns a structured “next step” (e.g. system guide). */
  const [lastNextStep, setLastNextStep] = useState<string | null>(null);
  /** System guide boundary note — shown outside the streamed reply when present. */
  const [lastSafetyNote, setLastSafetyNote] = useState<string | null>(null);
  /** True when the server reply was treated as low-signal—show stronger recovery prompts. */
  const [recoveryActive, setRecoveryActive] = useState(false);
  /** Last user utterance paired with recovery (never assistant body). */
  const [missedQuestion, setMissedQuestion] = useState<string | null>(null);
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
    const onOpen = () => {
      setOpen(true);
      setPanelTab("chat");
    };
    window.addEventListener(OPEN_CAMPAIGN_GUIDE_EVENT, onOpen);
    return () => window.removeEventListener(OPEN_CAMPAIGN_GUIDE_EVENT, onOpen);
  }, []);

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
    setLastNextStep(null);
    setLastSafetyNote(null);
    setRecoveryActive(false);
    setMissedQuestion(null);

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
          pathname: pathname && pathname.length > 0 ? pathname : "/",
        }),
      });

      const contentType = res.headers.get("content-type") ?? "";

      if (res.ok && contentType.includes("text/event-stream")) {
        let firstDelta = true;
        let streamPlaybook = "";
        let streamed = "";
        await consumeAssistantSse(res, {
          onMeta: (pb) => {
            streamPlaybook = pb;
          },
          onDelta: (d) => {
            streamed += d;
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
          onDone: (suggestions, _tools, nextStep, safetyNote) => {
            const weak = isWeakAssistantPayload(streamed, streamPlaybook);
            if (weak) {
              setMissedQuestion(text);
              setRecoveryActive(true);
              setLastSuggestions([]);
              setLastNextStep(null);
              setLastSafetyNote(null);
              setMessages((m) => {
                const x = [...m];
                const last = x[x.length - 1];
                if (last?.role === "assistant") {
                  x[x.length - 1] = { role: "assistant", text: ASK_KELLY_NO_MATCH_REPLY };
                }
                return x;
              });
              return;
            }
            setRecoveryActive(false);
            setMissedQuestion(null);
            setLastSuggestions(suggestions);
            setLastNextStep(nextStep?.trim() ? nextStep.trim() : null);
            setLastSafetyNote(safetyNote?.trim() ? safetyNote.trim() : null);
          },
          onError: () => {
            setError("Guided help is unavailable; see below to send feedback for review.");
            setMessages((m) => {
              const x = [...m];
              const last = x[x.length - 1];
              if (last?.role === "assistant") {
                x[x.length - 1] = { ...last, text: `${last.text}\n\n${ASSISTANT_UNAVAILABLE_COPY}` };
                return x;
              }
              return [...m, { role: "assistant", text: ASSISTANT_UNAVAILABLE_COPY }];
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
        nextStep?: string;
        safetyNote?: string;
        error?: string;
        message?: string;
      } = {};
      try {
        json = raw ? (JSON.parse(raw) as typeof json) : {};
      } catch {
        setError("The server returned an unexpected response.");
        setMessages((m) => [...m, { role: "assistant", text: ASSISTANT_UNAVAILABLE_COPY }]);
        return;
      }

      if (!res.ok) {
        setError("Guided help is unavailable; you can still send feedback for review on the other tab.");
        setMessages((m) => [...m, { role: "assistant", text: ASSISTANT_UNAVAILABLE_COPY }]);
        return;
      }

      const playbookJson = typeof json.playbook === "string" ? json.playbook : "";
      const rawReply = typeof json.reply === "string" ? json.reply : "";
      const weakJson = isWeakAssistantPayload(rawReply, playbookJson);
      if (weakJson) {
        setMissedQuestion(text);
        setRecoveryActive(true);
        setLastSuggestions([]);
        setLastNextStep(null);
        setLastSafetyNote(null);
        setMessages((m) => [...m, { role: "assistant", text: ASK_KELLY_NO_MATCH_REPLY }]);
        return;
      }
      setRecoveryActive(false);
      setMissedQuestion(null);
      setLastSuggestions(json.suggestions ?? []);
      setLastNextStep(typeof json.nextStep === "string" && json.nextStep.trim() ? json.nextStep.trim() : null);
      setLastSafetyNote(
        typeof json.safetyNote === "string" && json.safetyNote.trim() ? json.safetyNote.trim() : null,
      );
      setMessages((m) => [...m, { role: "assistant", text: displayAssistantMessage(rawReply) }]);
    } catch {
      setError("Network error. Feedback tab still works for sending a note.");
      setMessages((m) => [...m, { role: "assistant", text: ASSISTANT_UNAVAILABLE_COPY }]);
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
          className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-kelly-navy text-[10px] font-bold text-white shadow-inner"
          aria-hidden
        >
          KG
        </span>
        <span className="pr-0.5">Ask Kelly</span>
        <span className="hidden rounded-full bg-kelly-gold/25 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-kelly-navy sm:inline">
          Open panel
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
                      Command center · route-aware · v{ASSISTANT_API_VERSION} · streaming · {responseStyle} · 3/min ·
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

                <div
                  className="flex border-b border-kelly-text/10 bg-kelly-page/90 px-2 py-1.5"
                  role="tablist"
                  aria-label="Ask Kelly panel"
                >
                  {(
                    [
                      { id: "chat" as const, label: "Guidance" },
                      { id: "feedback" as const, label: "Send feedback" },
                    ] as const
                  ).map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      role="tab"
                      aria-selected={panelTab === t.id}
                      onClick={() => setPanelTab(t.id)}
                      className={cn(
                        "flex-1 rounded-lg px-2 py-2 font-body text-xs font-bold uppercase tracking-wide",
                        panelTab === t.id
                          ? "bg-kelly-navy/15 text-kelly-navy ring-1 ring-kelly-navy/25"
                          : "text-kelly-text/55 hover:bg-kelly-text/5",
                      )}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>

                {journeyBeatOnPage && beatById(journeyBeatOnPage) && panelTab === "chat" ? (
                  <p className="border-b border-kelly-text/8 bg-kelly-fog/50 px-4 py-2 font-body text-xs text-kelly-slate">
                    <span className="font-semibold text-kelly-ink">You’re in:</span> {beatById(journeyBeatOnPage)?.navLabel} —{" "}
                    {beatById(journeyBeatOnPage)?.description}
                  </p>
                ) : null}

                {panelTab === "chat" && messages.length === 1 && !loading && !recoveryActive ? (
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
                    <p className="mt-2 px-1 font-body text-[10px] text-kelly-text/50">
                      Invited to the beta? Use <span className="font-semibold text-kelly-navy/80">Send feedback</span> for structured notes to the
                      candidate.
                    </p>
                  </div>
                ) : null}

                {panelTab === "chat" ? (
                  <div className="flex min-h-[6rem] flex-1 flex-col space-y-3 overflow-y-auto px-4 py-4">
                    {messages.map((msg, i) => (
                      <div
                        key={`${msg.role}-${i}`}
                        className={cn(
                          "rounded-xl px-3 py-2.5 font-body text-sm leading-relaxed",
                          msg.role === "user"
                            ? "ml-6 bg-kelly-navy/12 text-kelly-text"
                            : "mr-4 border border-kelly-text/10 bg-[var(--color-surface-elevated)] text-kelly-text shadow-sm",
                        )}
                      >
                        {msg.role === "assistant" ? displayAssistantMessage(msg.text) : msg.text}
                      </div>
                    ))}
                    {loading ? (
                      <p className="font-body text-sm italic text-kelly-text/60" role="status" aria-live="polite">
                        Checking your question against the route map…
                      </p>
                    ) : null}
                    {error ? (
                      <p className="rounded-md border border-red-200/60 bg-red-50/80 px-2 py-1.5 text-sm text-red-800" role="alert">
                        {error}
                      </p>
                    ) : null}
                    {lastNextStep ? (
                      <div className="mr-4 rounded-lg border border-kelly-forest/25 bg-kelly-fog/60 px-3 py-2.5 font-body text-xs leading-snug text-kelly-text/90">
                        <span className="font-bold text-kelly-navy">Here’s what happens next: </span>
                        {lastNextStep}
                      </div>
                    ) : null}
                    {lastSafetyNote ? (
                      <div
                        className="mr-4 rounded-lg border border-amber-300/70 bg-amber-50/95 px-3 py-2 font-body text-xs leading-snug text-kelly-text"
                        role="note"
                      >
                        <span className="font-bold uppercase tracking-wide text-kelly-navy">Safety note · </span>
                        {lastSafetyNote}
                      </div>
                    ) : null}
                    {lastSuggestions.length > 0 ? (
                      <div
                        className={cn(
                          "mr-4 flex pt-1",
                          lastSuggestions.length > 1 ? "flex-col gap-2 sm:flex-row sm:flex-wrap" : "flex-wrap gap-2",
                        )}
                      >
                        {lastSuggestions.map((s) => (
                          <Link
                            key={s.href}
                            href={s.href}
                            className={cn(
                              "inline-flex min-h-[44px] items-center justify-center rounded-lg border-2 border-kelly-navy/20 bg-white px-4 py-2.5 text-center font-body text-xs font-semibold leading-tight text-kelly-navy shadow-sm transition",
                              "hover:border-kelly-gold/60 hover:bg-kelly-fog/80 hover:shadow",
                              lastSuggestions.length > 1 && "sm:min-w-[10rem]",
                            )}
                            onClick={() => setOpen(false)}
                          >
                            {s.label}
                          </Link>
                        ))}
                      </div>
                    ) : null}
                    {recoveryActive ? (
                      <div className="mr-4 space-y-3 border-t border-kelly-text/10 pt-3">
                        <p className="font-body text-[10px] font-bold uppercase tracking-wider text-kelly-text/45">Suggested prompts</p>
                        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                          {ASK_KELLY_RECOVERY_PROMPT_BUTTONS.map((promptText) => (
                            <button
                              key={promptText}
                              type="button"
                              onClick={() => {
                                setInput(promptText);
                                inputRef.current?.focus();
                              }}
                              className="rounded-lg border border-kelly-navy/15 bg-white px-3 py-2 text-left font-body text-[11px] font-semibold text-kelly-navy/95 transition hover:border-kelly-gold/50 hover:bg-kelly-fog/80"
                            >
                              {promptText}
                            </button>
                          ))}
                        </div>
                        <AskKellyMissedFeedbackCapture
                          pagePath={pathname && pathname.length > 0 ? pathname : "/"}
                          visible={recoveryActive}
                          question={missedQuestion}
                        />
                      </div>
                    ) : null}
                  </div>
                ) : (
                  <div className="flex min-h-[8rem] flex-1 flex-col space-y-4 overflow-y-auto px-4 py-4">
                    <p className="rounded-lg border border-kelly-gold/35 bg-amber-50/80 px-3 py-2 font-body text-xs font-semibold text-kelly-navy">
                      {ASK_KELLY_BETA_INVITE_BANNER}
                    </p>
                    <p className="font-body text-sm leading-relaxed text-kelly-text">{ASK_KELLY_BETA_ONBOARDING}</p>
                    <div className="pt-0.5">
                      <AskKellyBetaFeedbackForm key={pathname} defaultPagePath={pathname} />
                    </div>
                  </div>
                )}

                {panelTab === "chat" ? (
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
                      className="mt-2 w-full rounded-lg bg-kelly-navy py-2.5 font-body text-sm font-bold uppercase tracking-wider text-white disabled:opacity-50"
                    >
                      Send
                    </button>
                  </div>
                ) : null}
              </div>
            </div>,
            document.body,
          )
        : null}
    </>
  );

  return dock;
}
