"use client";

import { useId, useState } from "react";
import { ASK_KELLY_MISSED_FEEDBACK_PROMPT } from "@/content/ask-kelly-chat-recovery";
import { ASK_KELLY_FEEDBACK_SUCCESS } from "@/content/ask-kelly-beta-public-copy";
import { cn } from "@/lib/utils";

type Props = {
  pagePath: string;
  visible: boolean;
  /** Public-safe user question text only — no assistant payload. */
  question: string | null;
};

/**
 * Optional intake for-guide-improvement (same schema as Ask Kelly beta feedback).
 * Submits only on explicit button click via /api/forms.
 */
export function AskKellyMissedFeedbackCapture({ pagePath, visible, question }: Props) {
  const baseId = useId();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "done">("idle");
  const [error, setError] = useState<string | null>(null);

  if (!visible || !question?.trim()) return null;

  const submit = async () => {
    setError(null);
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    if (!trimmedName || !trimmedEmail) {
      setError("Add your name and email so we can associate this note.");
      return;
    }

    const safePath = pagePath.startsWith("/") ? pagePath : `/${pagePath}`;
    const bodyText = [
      "Ask Kelly couldn’t answer this well—I’d like the guide improved for similar questions.",
      `My question: ${question.trim()}`,
      "(No automation; I chose to send this from the dock.)",
    ].join("\n");

    setStatus("submitting");
    try {
      const res = await fetch("/api/forms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          formType: "ask_kelly_beta_feedback",
          name: trimmedName,
          email: trimmedEmail,
          category: "message_content_feedback",
          pagePath: safePath.slice(0, 500),
          feedback: bodyText.slice(0, 8000),
          website: "",
        }),
      });
      const json: unknown = await res.json().catch(() => ({}));
      const obj = json && typeof json === "object" ? (json as Record<string, unknown>) : {};
      if (res.status === 200 && obj.ok === true) {
        setStatus("done");
        return;
      }
      setStatus("idle");
      if (res.status === 400 && obj.fields && typeof obj.fields === "object") {
        const fields = obj.fields as Record<string, string>;
        setError(Object.values(fields)[0] ?? "Check the fields and try again.");
      } else if (res.status === 429) {
        setError("Too many submissions—wait a minute and try again.");
      } else if (res.status === 503) {
        setError("The site can’t take feedback right now. Try again later.");
      } else {
        setError("Couldn’t send that. Try again or email kelly@kellygrappe.com.");
      }
    } catch {
      setStatus("idle");
      setError("Network error—nothing was saved. Try again when you’re online.");
    }
  };

  if (status === "done") {
    return (
      <div className="mr-4 rounded-lg border border-kelly-gold/40 bg-kelly-fog/70 px-3 py-2.5 font-body text-xs leading-snug text-kelly-text">
        {ASK_KELLY_FEEDBACK_SUCCESS}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "mr-4 space-y-2 rounded-lg border border-kelly-navy/15 bg-[var(--color-surface-elevated)] px-3 py-3 shadow-sm",
      )}
    >
      <p className="font-body text-xs leading-relaxed text-kelly-text/90">{ASK_KELLY_MISSED_FEEDBACK_PROMPT}</p>
      <div className="grid gap-2 sm:grid-cols-2">
        <div>
          <label className="sr-only" htmlFor={`${baseId}-name`}>
            Name
          </label>
          <input
            id={`${baseId}-name`}
            type="text"
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            className="w-full rounded-md border border-kelly-text/15 bg-white px-2 py-1.5 font-body text-xs text-kelly-text"
          />
        </div>
        <div>
          <label className="sr-only" htmlFor={`${baseId}-email`}>
            Email
          </label>
          <input
            id={`${baseId}-email`}
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="w-full rounded-md border border-kelly-text/15 bg-white px-2 py-1.5 font-body text-xs text-kelly-text"
          />
        </div>
      </div>
      <button
        type="button"
        disabled={status === "submitting"}
        onClick={() => void submit()}
        className="w-full rounded-lg border-2 border-kelly-gold/50 bg-white py-2 font-body text-xs font-bold uppercase tracking-wide text-kelly-navy transition hover:bg-kelly-fog disabled:opacity-50"
      >
        {status === "submitting" ? "Sending…" : "Send this as feedback"}
      </button>
      {error ? (
        <p className="font-body text-[11px] text-red-800" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
