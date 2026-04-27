"use client";

import { useId, useState } from "react";
import {
  ASK_KELLY_CATEGORY_LABELS,
  ASK_KELLY_FEEDBACK_FORM_INTRO,
  ASK_KELLY_FEEDBACK_SUCCESS,
} from "@/content/ask-kelly-beta-public-copy";
import { askKellyBetaCategoryValues } from "@/lib/forms/schemas";
import { cn } from "@/lib/utils";

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

  const resetPagePath = () => setPagePath(defaultPagePath);

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
      setResult({ ok: false, message: "Network hiccup. Check your connection and try again." });
      setStatus("idle");
    }
  };

  if (status === "done" && result?.ok) {
    return (
      <div className={cn("rounded-xl border border-kelly-gold/30 bg-kelly-fog/50 px-3 py-3", className)}>
        <p className="font-body text-sm leading-relaxed text-kelly-text">{result.message}</p>
      </div>
    );
  }

  return (
    <form
      className={cn("space-y-3", className)}
      onSubmit={(e) => {
        e.preventDefault();
        void submit();
      }}
    >
      <p className="font-body text-xs leading-relaxed text-kelly-text/80">{ASK_KELLY_FEEDBACK_FORM_INTRO}</p>
      {result && !result.ok ? (
        <p id={errId} className="font-body text-sm text-red-800" role="alert">
          {result.message}
        </p>
      ) : null}
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
        disabled={status === "submitting"}
        className="w-full rounded-lg bg-kelly-navy py-2.5 font-body text-sm font-bold uppercase tracking-wider text-kelly-mist disabled:opacity-50"
      >
        {status === "submitting" ? "Sending…" : "Send feedback"}
      </button>
    </form>
  );
}
