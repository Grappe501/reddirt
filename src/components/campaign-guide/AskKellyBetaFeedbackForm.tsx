"use client";

import { useId, useEffect, useState } from "react";
import {
  ASK_KELLY_CATEGORY_LABELS,
  ASK_KELLY_FEEDBACK_FORM_INTRO,
  ASK_KELLY_FEEDBACK_SUCCESS,
} from "@/content/ask-kelly-beta-public-copy";
import {
  ASK_KELLY_BETA_FEEDBACK_DRAFT_KEY,
  askKellyDraftDiffersFromDefaults,
  parseAskKellyBetaLocalDraft,
  type AskKellyBetaLocalDraftV1,
} from "@/lib/browser/kelly-local-drafts";
import { askKellyBetaCategoryValues } from "@/lib/forms/schemas";
import { cn } from "@/lib/utils";

const DRAFT_REASSURANCE = "Nothing was lost. Your draft is still saved in this browser.";

type Result = { ok: true; message: string } | { ok: false; message: string; fields?: Record<string, string> };

const initialCategory = askKellyBetaCategoryValues[0];

type Props = {
  /** Suggested public path when the form opens (e.g. current page), no query strings with PII. */
  defaultPagePath?: string;
  className?: string;
};

export function AskKellyBetaFeedbackForm({ defaultPagePath = "", className }: Props) {
  const errId = useId();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [category, setCategory] = useState<string>(initialCategory);
  const [pagePath, setPagePath] = useState(defaultPagePath);
  const [feedback, setFeedback] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "done">("idle");
  const [result, setResult] = useState<Result | null>(null);
  const [localDraftRead, setLocalDraftRead] = useState(false);
  const [recoveryOpen, setRecoveryOpen] = useState(false);
  const [recoveryDraft, setRecoveryDraft] = useState<AskKellyBetaLocalDraftV1 | null>(null);

  const resetPagePath = () => setPagePath(defaultPagePath);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setLocalDraftRead(false);
    let raw: string | null = null;
    try {
      raw = localStorage.getItem(ASK_KELLY_BETA_FEEDBACK_DRAFT_KEY);
    } catch {
      setLocalDraftRead(true);
      return;
    }
    const draft = parseAskKellyBetaLocalDraft(raw);
    if (!draft) {
      setRecoveryOpen(false);
      setRecoveryDraft(null);
      setLocalDraftRead(true);
      return;
    }
    if (!askKellyDraftDiffersFromDefaults(draft, defaultPagePath, initialCategory)) {
      try {
        localStorage.removeItem(ASK_KELLY_BETA_FEEDBACK_DRAFT_KEY);
      } catch {
        /* ignore */
      }
      setRecoveryOpen(false);
      setRecoveryDraft(null);
      setLocalDraftRead(true);
      return;
    }
    setRecoveryDraft(draft);
    setRecoveryOpen(true);
    setLocalDraftRead(true);
  }, [defaultPagePath]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!localDraftRead) return;
    if (recoveryOpen) return;
    const now = {
      v: 1 as const,
      name,
      email,
      phone,
      category,
      pagePath,
      feedback,
      savedAt: new Date().toISOString(),
    };
    if (!askKellyDraftDiffersFromDefaults(now, defaultPagePath, initialCategory)) {
      try {
        localStorage.removeItem(ASK_KELLY_BETA_FEEDBACK_DRAFT_KEY);
      } catch {
        /* ignore */
      }
      return;
    }
    try {
      localStorage.setItem(ASK_KELLY_BETA_FEEDBACK_DRAFT_KEY, JSON.stringify(now));
    } catch {
      /* ignore */
    }
  }, [name, email, phone, category, pagePath, feedback, localDraftRead, recoveryOpen, defaultPagePath]);

  const submit = async () => {
    setResult(null);
    setStatus("submitting");
    try {
      const res = await fetch("/api/forms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          formType: "ask_kelly_beta_feedback",
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim() || undefined,
          category,
          pagePath: pagePath.trim() || undefined,
          feedback: feedback.trim(),
          website: "",
        }),
      });
      const json: unknown = await res.json().catch(() => ({}));
      const obj = json && typeof json === "object" ? (json as Record<string, unknown>) : {};
      if (res.status === 200 && obj.ok === true) {
        try {
          localStorage.removeItem(ASK_KELLY_BETA_FEEDBACK_DRAFT_KEY);
        } catch {
          /* ignore */
        }
        setResult({ ok: true, message: ASK_KELLY_FEEDBACK_SUCCESS });
        setStatus("done");
        return;
      }
      if (res.status === 400 && obj.fields && typeof obj.fields === "object") {
        const fields = obj.fields as Record<string, string>;
        const first = Object.values(fields)[0];
        setResult({ ok: false, message: first ?? "Check the fields and try again.", fields });
        setStatus("idle");
        return;
      }
      if (res.status === 429) {
        setResult({ ok: false, message: "Too many requests—wait a minute and try again." });
        setStatus("idle");
        return;
      }
      if (res.status === 503) {
        setResult({ ok: false, message: "The site can’t take feedback right now. Try again in a few minutes." });
        setStatus("idle");
        return;
      }
      setResult({ ok: false, message: "Couldn’t send that just now. Try again, or email kelly@kellygrappe.com if it keeps happening." });
      setStatus("idle");
    } catch {
      setResult({
        ok: false,
        message: "We couldn’t send that right now. Check your connection and try again—nothing was saved on our side for this try.",
      });
      setStatus("idle");
    }
  };

  if (status === "done" && result?.ok) {
    return (
      <div className={cn("rounded-xl border border-kelly-gold/30 bg-kelly-fog/50 px-3 py-3", className)}>
        <p className="font-body text-sm leading-relaxed text-kelly-text">{result.message.trim() || "Thanks. Your note was received."}</p>
      </div>
    );
  }

  return (
    <form
      className={cn("space-y-4", className)}
      aria-busy={status === "submitting"}
      onSubmit={(e) => {
        e.preventDefault();
        void submit();
      }}
    >
      <p className="font-body text-xs leading-relaxed text-kelly-text/80">{ASK_KELLY_FEEDBACK_FORM_INTRO}</p>
      <p className="font-body text-xs font-medium text-kelly-navy/90">
        Start with your email—this onboarding step is keyed to reach you reliably.
      </p>
      {recoveryOpen && recoveryDraft ? (
        <div className="rounded-lg border border-kelly-navy/25 bg-kelly-fog/80 px-3 py-2.5 text-sm text-kelly-text" role="status">
          <p className="font-semibold text-kelly-navy">Recovered an unsaved draft from this browser.</p>
          <p className="mt-1 text-xs text-kelly-text/75">Your answers were not sent automatically. Choose below.</p>
          <div className="mt-2 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => {
                const d = recoveryDraft;
                setName(d.name);
                setEmail(d.email);
                setPhone(d.phone);
                setCategory(d.category);
                setPagePath(d.pagePath);
                setFeedback(d.feedback);
                setRecoveryOpen(false);
                setRecoveryDraft(null);
              }}
              className="rounded-md bg-kelly-navy px-2.5 py-1.5 text-xs font-bold text-white"
            >
              Restore draft
            </button>
            <button
              type="button"
              onClick={() => {
                try {
                  localStorage.removeItem(ASK_KELLY_BETA_FEEDBACK_DRAFT_KEY);
                } catch {
                  /* ignore */
                }
                setName("");
                setEmail("");
                setPhone("");
                setCategory(initialCategory);
                setPagePath(defaultPagePath);
                setFeedback("");
                setRecoveryOpen(false);
                setRecoveryDraft(null);
              }}
              className="rounded-md border border-kelly-text/20 bg-white px-2.5 py-1.5 text-xs font-semibold text-kelly-text"
            >
              Discard draft
            </button>
          </div>
        </div>
      ) : null}
      {result && !result.ok ? (
        <p
          id={errId}
          className="rounded-md border border-red-200/80 bg-red-50/90 px-3 py-2 font-body text-sm text-red-900"
          role="alert"
        >
          <span>{result.message}</span>
          <span className="mt-2 block text-xs text-red-900/90">{DRAFT_REASSURANCE}</span>
        </p>
      ) : null}
      {status === "submitting" ? (
        <p className="font-body text-sm text-kelly-slate" role="status" aria-live="polite">
          Sending your feedback…
        </p>
      ) : null}
      <div className="space-y-1.5">
        <label className="block font-body text-[10px] font-bold uppercase tracking-wider text-kelly-text/50">Email</label>
        <input
          type="email"
          className="w-full rounded-lg border border-kelly-text/15 bg-white px-2.5 py-1.5 font-body text-sm"
          name="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <div className="space-y-1.5">
        <label className="block font-body text-[10px] font-bold uppercase tracking-wider text-kelly-text/50">Name</label>
        <input
          className="w-full rounded-lg border border-kelly-text/15 bg-white px-2.5 py-1.5 font-body text-sm"
          name="name"
          autoComplete="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          minLength={1}
          maxLength={120}
        />
      </div>
      <div className="space-y-1.5">
        <label className="block font-body text-[10px] font-bold uppercase tracking-wider text-kelly-text/50">Phone (optional)</label>
        <input
          type="tel"
          className="w-full rounded-lg border border-kelly-text/15 bg-white px-2.5 py-1.5 font-body text-sm"
          name="phone"
          autoComplete="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
      </div>
      <div className="space-y-1.5">
        <label className="block font-body text-[10px] font-bold uppercase tracking-wider text-kelly-text/50">Category</label>
        <select
          className="w-full rounded-lg border border-kelly-text/15 bg-white px-2 py-1.5 font-body text-sm"
          name="category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          {askKellyBetaCategoryValues.map((c) => (
            <option key={c} value={c}>
              {ASK_KELLY_CATEGORY_LABELS[c]}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-1.5">
        <div className="flex items-center justify-between gap-2">
          <label className="block font-body text-[10px] font-bold uppercase tracking-wider text-kelly-text/50">Page (optional)</label>
          {defaultPagePath ? (
            <button
              type="button"
              onClick={resetPagePath}
              className="text-[10px] font-semibold text-kelly-navy/80 hover:underline"
            >
              Use current page
            </button>
          ) : null}
        </div>
        <input
          className="w-full rounded-lg border border-kelly-text/15 bg-white px-2.5 py-1.5 font-body text-sm"
          name="pagePath"
          value={pagePath}
          onChange={(e) => setPagePath(e.target.value)}
          placeholder="/priorities, /get-involved, etc."
          maxLength={500}
        />
        <p className="text-[10px] text-kelly-text/45">Path only. Don’t paste private links with tokens.</p>
      </div>
      <div className="space-y-1.5">
        <label className="block font-body text-[10px] font-bold uppercase tracking-wider text-kelly-text/50">Feedback / suggestion</label>
        <textarea
          className="min-h-[100px] w-full resize-y rounded-lg border border-kelly-text/15 bg-white px-2.5 py-1.5 font-body text-sm"
          name="feedback"
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          required
          minLength={10}
          maxLength={8000}
        />
      </div>
      <button
        type="submit"
        disabled={status === "submitting" || (recoveryOpen && Boolean(recoveryDraft))}
        className="w-full rounded-lg bg-kelly-navy py-2.5 font-body text-sm font-bold uppercase tracking-wider text-white disabled:opacity-50"
      >
        {status === "submitting" ? "Sending…" : "Send feedback"}
      </button>
      {recoveryOpen && recoveryDraft ? (
        <p className="text-center text-[10px] text-kelly-text/60">Choose Restore or Discard before you can send.</p>
      ) : null}
    </form>
  );
}
