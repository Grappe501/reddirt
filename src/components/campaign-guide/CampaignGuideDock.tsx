"use client";

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { createPortal } from "react-dom";
import { useJourney } from "@/components/journey/journey-context";
import { beatById } from "@/content/home/journey";
import { cn } from "@/lib/utils";

type ChatMessage = { role: "user" | "assistant"; text: string };
type Suggestion = { label: string; href: string };

export function CampaignGuideDock() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const panelId = useId();
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [open, setOpen] = useState(false);
  const [dockVisible, setDockVisible] = useState(!isHome);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      text: "I’m the campaign guide—grounded in the site’s content when it’s indexed. Ask about the office, ballot access, volunteering, or where to read more. Where should we start?",
    },
  ]);
  const [lastSuggestions, setLastSuggestions] = useState<Suggestion[]>([]);
  const { activeBeatId } = useJourney();

  useEffect(() => {
    if (!isHome) {
      setDockVisible(true);
      return;
    }
    setDockVisible(false);
    const threshold = () => Math.min(window.innerHeight * 0.72, 640);
    const onScroll = () => {
      if (window.scrollY >= threshold()) setDockVisible(true);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [isHome]);

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
    setMessages((m) => [...m, { role: "user", text }]);
    setLoading(true);
    setLastSuggestions([]);

    try {
      const beat = activeBeatId ? beatById(activeBeatId) : undefined;
      const res = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          journeyBeatId: activeBeatId ?? undefined,
          journeyBeatLabel: beat?.navLabel,
          journeyBeatDescription: beat?.description,
          pathname: typeof window !== "undefined" ? window.location.pathname : "/",
        }),
      });

      const raw = await res.text();
      let json: {
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
              ? "Couldn’t load or embed site content. Confirm DATABASE_URL, migrations, and OPENAI_API_KEY."
              : json.error === "openai_chat_failed"
                ? "The AI model request failed (quota, model name, or key)."
                : json.error === "assistant_failed"
                  ? "Something went wrong in the guide service. Check server logs."
                  : json.error || "The guide couldn’t answer that right now.");
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
      {dockVisible ? (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          "fixed z-[45] flex items-center gap-2 rounded-full border border-civic-mist/35 bg-civic-midnight/95 px-3.5 py-2.5 font-body text-sm font-semibold tracking-wide text-civic-mist shadow-lg backdrop-blur-sm transition hover:border-civic-gold/50 hover:bg-civic-deep",
          "bottom-[4.5rem] right-4 sm:bottom-6 sm:right-6 lg:bottom-8 lg:right-8",
        )}
        aria-expanded={open}
        aria-controls={panelId}
      >
        <span className="hidden sm:inline">Ask the guide</span>
        <span className="sm:hidden">Guide</span>
      </button>
      ) : null}

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
                aria-label="Campaign guide"
                className="flex h-[min(100dvh,640px)] w-full max-w-lg flex-col rounded-t-2xl border border-civic-ink/15 bg-cream-canvas shadow-2xl sm:h-[min(92vh,720px)] sm:rounded-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between border-b border-deep-soil/10 px-4 py-3">
                  <div>
                    <p className="font-body text-[10px] font-bold uppercase tracking-[0.2em] text-red-dirt">Campaign guide</p>
                    <p className="font-body text-xs text-deep-soil/60">RAG + OpenAI · grows with your content</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="rounded-lg px-3 py-1.5 font-body text-sm font-semibold text-deep-soil hover:bg-deep-soil/5"
                  >
                    Close
                  </button>
                </div>

                {activeBeatId && beatById(activeBeatId) ? (
                  <p className="border-b border-deep-soil/8 bg-civic-fog/50 px-4 py-2 font-body text-xs text-civic-slate">
                    <span className="font-semibold text-civic-ink">You’re in:</span> {beatById(activeBeatId)?.navLabel} —{" "}
                    {beatById(activeBeatId)?.description}
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
                    <p className="font-body text-sm italic text-deep-soil/50">Thinking with site context…</p>
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
                    placeholder="Ask about the office, ballot access, or how to help…"
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
