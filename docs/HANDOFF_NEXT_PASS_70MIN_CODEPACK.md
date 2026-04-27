# Next pass (≈70 min) — Ask Kelly onboarding + context for Kelly → site updates

**Lane:** `RedDirt/` only. **Do not** merge `ask-kelly-beta-public-copy.ts` with `CountyDataGapsPanel.tsx` — they are **different files** (verified on disk).

---

## 1. Merge / paste accident check (ground truth)

| Path | Purpose | Lines (approx) |
|------|---------|----------------|
| `src/content/ask-kelly-beta-public-copy.ts` | Ask Kelly beta public strings (banner, onboarding, fallback layers) | 40 |
| `src/components/county/dashboard/CountyDataGapsPanel.tsx` | County dashboard “data gaps” UI (unrelated to Ask Kelly) | 35 |

If chat ever showed both in one paste, that was **clipboard** only — the repo keeps them **separate**.

---

## 2. “Kelly double approval → database update” — what exists today

**There is no implemented “double Kelly approval” gate in code** for website edits. Today:

- **Admin page hero editor:** `src/app/admin/(board)/pages/[pageKey]/page.tsx` → server action `savePageHeroAction` in `src/app/admin/actions.ts`.
- **Persistence:** `prisma.adminContentBlock.upsert` with composite key `(pageKey, blockKey)`; `blockKey: "hero"`, `payload` JSON (`eyebrow`, `title`, `subtitle`).
- **Read path:** `src/lib/content/page-blocks.ts` — `getPageBlockPayload`, `PAGE_KEYS` (only four page keys: `what-we-believe`, `resources`, `direct-democracy`, `priorities`).
- **Auth:** `requireAdminAction()` on save — **not** a candidate-only or Kelly-two-step flow.
- **Homepage:** `HomepageConfig` model + `/admin/homepage` (separate from per-page hero list).
- **Story/editorial visibility:** `ContentItemOverride` (hidden, featured, teaser overrides) — not the same as “Kelly approved copy to live site” workflow.
- **Ask Kelly beta feedback** (current slice): `POST /api/forms` → `Submission` + `WorkflowIntake` with `source: "ask_kelly_beta"` — **queue / triage**, **not** wired to auto-apply edits to `AdminContentBlock` or publish.

**Implication for the next build:** “Packet → LQA → publish” and “Kelly double approval” live in **manual doctrine** (`CANDIDATE_TO_ADMIN_...`, `WEBSITE_EDIT_...`, `playbooks/APPROVAL_AUTHORITY_MATRIX.md`). Engineering must **add** workflow (e.g. draft rows, `WorkflowIntake` status transitions, or new tables) — **not** assumed to exist.

**Relevant Prisma names (content / site):** `AdminContentBlock`, `HomepageConfig`, `ContentItemOverride`, `InboundContentItem`, `SyncedPost`, `SiteSettings`, `WorkflowIntake`, `WorkflowAction`, `Submission`.

---

## 3. Manual files for the “next build” (absolute paths under this repo)

Read these from `H:\SOSWebsite\RedDirt\`:

| Relative path |
|---------------|
| `campaign-system-manual/ASK_KELLY_PRODUCTION_GRADE_AGENT_FOUNDATION_CHECKLIST.md` |
| `campaign-system-manual/ASK_KELLY_BETA_FEEDBACK_TO_APPROVAL_FEED_WORKFLOW.md` |
| `campaign-system-manual/CANDIDATE_TO_ADMIN_UPDATE_PACKET_SYSTEM.md` |
| `campaign-system-manual/CANDIDATE_WEBSITE_REVIEW_WIZARD_AND_APPROVAL_WORKFLOW.md` |
| `campaign-system-manual/WEBSITE_EDIT_IMPACT_ANALYSIS_AND_DOWNSTREAM_DEPENDENCY_RULES.md` |
| `campaign-system-manual/playbooks/APPROVAL_AUTHORITY_MATRIX.md` |

*(Note: `STEP_6` references `playbooks/APPROVAL_AUTHORITY_MATRIX.md` at repo root in some docs; in this tree the file is under `campaign-system-manual/playbooks/`.)*

---

## 4. Admin routes touching “page” / content (quick map)

| Route | Role |
|-------|------|
| `/admin/content` | Overview / links |
| `/admin/pages` | Hub for page copy (hero only) |
| `/admin/pages/[pageKey]` | Edit hero for one of `PAGE_KEYS` |
| `/admin/homepage` | Homepage composition |
| `/admin/stories`, `/admin/editorial`, `/admin/explainers` | Overrides atop static TS content |
| `/admin/orchestrator` | Inbound / distribution (orchestrator group) |
| `/admin/workbench/ask-kelly-beta` | Ask Kelly **beta feedback** triage (`WorkflowIntake.source = ask_kelly_beta`) |

---

## 5. Full file contents (snapshot for upload / new thread)

Below: **six** files exactly as in the repo at handoff time.

---

### `src/components/campaign-guide/CampaignGuideDock.tsx`

```tsx
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
import { normalizeHistory } from "@/lib/assistant/conversation";
import { ASSISTANT_API_VERSION } from "@/lib/assistant/version";
import { consumeAssistantSse } from "@/lib/campaign-guide/assistant-sse";
import { cn } from "@/lib/utils";

type ChatMessage = { role: "user" | "assistant"; text: string };
type Suggestion = { label: string; href: string };

const ASSISTANT_UNAVAILABLE_COPY = [
  ASK_KELLY_ASSISTANT_FALLBACK_LAYERS.primary,
  ASK_KELLY_ASSISTANT_FALLBACK_LAYERS.secondary,
  ASK_KELLY_ASSISTANT_FALLBACK_LAYERS.tertiary,
].join("\n\n");

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

      setLastSuggestions(json.suggestions ?? []);
      setMessages((m) => [...m, { role: "assistant", text: json.reply ?? "No reply returned." }]);
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

                {panelTab === "chat" && messages.length === 1 && !loading ? (
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
                      <p className="font-body text-sm italic text-kelly-text/50">Digging through what the campaign taught me…</p>
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
                ) : (
                  <div className="flex-1 space-y-4 overflow-y-auto px-4 py-4">
                    <p className="rounded-lg border border-kelly-gold/35 bg-amber-50/80 px-3 py-2 font-body text-xs font-semibold text-kelly-navy">
                      {ASK_KELLY_BETA_INVITE_BANNER}
                    </p>
                    <p className="font-body text-sm leading-relaxed text-kelly-text">{ASK_KELLY_BETA_ONBOARDING}</p>
                    <AskKellyBetaFeedbackForm key={pathname} defaultPagePath={pathname} />
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
                      className="mt-2 w-full rounded-lg bg-kelly-navy py-2.5 font-body text-sm font-bold uppercase tracking-wider text-kelly-mist disabled:opacity-50"
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
```

---

### `src/components/campaign-guide/AskKellyBetaFeedbackForm.tsx`

```tsx
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
```

---

### `src/app/admin/(board)/workbench/ask-kelly-beta/page.tsx`

```tsx
import Link from "next/link";
import { WorkflowIntakeStatus } from "@prisma/client";
import { prisma } from "@/lib/db";
import { ASK_KELLY_CATEGORY_LABELS } from "@/content/ask-kelly-beta-public-copy";
import type { AskKellyBetaCategory } from "@/lib/forms/ask-kelly-beta-types";
import { askKellyBetaCategoryValues } from "@/lib/forms/schemas";

export const dynamic = "force-dynamic";

const isRecord = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null && !Array.isArray(v);

const statusLabel: Record<WorkflowIntakeStatus, string> = {
  PENDING: "Pending",
  IN_REVIEW: "In review",
  AWAITING_INFO: "Awaiting info",
  READY_FOR_CALENDAR: "Ready for calendar",
  CONVERTED: "Converted",
  DECLINED: "Declined",
  ARCHIVED: "Archived",
};

function categoryLabel(raw: unknown): string {
  if (typeof raw !== "string") return "—";
  if ((askKellyBetaCategoryValues as readonly string[]).includes(raw)) {
    return ASK_KELLY_CATEGORY_LABELS[raw as AskKellyBetaCategory];
  }
  return raw;
}

export default async function AdminAskKellyBetaTriagePage() {
  const rows = await prisma.workflowIntake.findMany({
    where: { source: "ask_kelly_beta" },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return (
    <div className="min-w-0 p-4 md:p-6">
      <div className="mb-6 max-w-3xl">
        <Link href="/admin/workbench" className="text-sm font-semibold text-kelly-slate hover:underline">
          ← Campaign workbench
        </Link>
        <h1 className="mt-2 font-heading text-2xl font-bold text-kelly-text">Ask Kelly — beta feedback triage</h1>
        <p className="mt-1 font-body text-sm leading-relaxed text-kelly-text/80">
          Invite-only beta submissions about the public site, volunteering, and message/content. Staff can
          surface and sort these—owner and <strong>final say</strong> is listed as <strong>Kelly</strong> (not a staff approval gate). No voter
          file, donor, or treasury fields appear here.
        </p>
      </div>

      {rows.length === 0 ? (
        <p className="font-body text-sm text-kelly-slate">No rows yet. New beta feedback appears here after someone submits from Ask Kelly on the
          public site.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-kelly-text/10 bg-kelly-page">
          <table className="w-full min-w-[600px] border-collapse text-left font-body text-sm">
            <thead>
              <tr className="border-b border-kelly-text/10 bg-kelly-fog/60">
                <th className="p-2.5 text-[10px] font-bold uppercase tracking-wider text-kelly-text/50">Title</th>
                <th className="p-2.5 text-[10px] font-bold uppercase tracking-wider text-kelly-text/50">Category</th>
                <th className="p-2.5 text-[10px] font-bold uppercase tracking-wider text-kelly-text/50">Status</th>
                <th className="p-2.5 text-[10px] font-bold uppercase tracking-wider text-kelly-text/50">Submitted</th>
                <th className="p-2.5 text-[10px] font-bold uppercase tracking-wider text-kelly-text/50">Page</th>
                <th className="p-2.5 text-[10px] font-bold uppercase tracking-wider text-kelly-text/50">Owner / authority</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const meta = isRecord(r.metadata) ? r.metadata : {};
                return (
                  <tr key={r.id} className="border-b border-kelly-text/5">
                    <td className="p-2.5 font-semibold text-kelly-text">
                      {r.title ?? "Ask Kelly beta feedback"}
                    </td>
                    <td className="p-2.5 text-kelly-slate">{categoryLabel(meta.category)}</td>
                    <td className="p-2.5 text-kelly-slate">{statusLabel[r.status]}</td>
                    <td className="p-2.5 whitespace-nowrap text-kelly-slate text-xs">
                      {r.createdAt.toLocaleString("en-US", { dateStyle: "short", timeStyle: "short" })}
                    </td>
                    <td className="p-2.5 text-xs text-kelly-slate break-all">
                      {typeof meta.pagePath === "string" && meta.pagePath ? meta.pagePath : "—"}
                    </td>
                    <td className="p-2.5 text-xs text-kelly-slate">
                      Owner: <span className="font-semibold text-kelly-text">Kelly</span>
                      <br />
                      Final authority: <span className="font-semibold text-kelly-text">Kelly</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
```

---

### `src/lib/forms/schemas.ts`, `src/lib/forms/handlers.ts`, `src/app/api/assistant/route.ts`

These are **long**; this codepack inlines **CampaignGuideDock**, **AskKellyBetaFeedbackForm**, and **ask-kelly-beta page** in full. For `schemas`, `handlers`, and `assistant` **use the repository as source of truth** (or attach those three paths alongside this doc in the new thread). Summary:

- **schemas:** `askKellyBetaCategoryValues` + `askKellyBetaFeedbackSchema` on `formSubmissionSchema` discriminated union.
- **handlers:** `persistAskKellyBeta` → `Submission` + `WorkflowIntake` (`source: "ask_kelly_beta"`), `buildAskKellyBetaMetadata`, no `classifyIntake` on that branch.
- **assistant:** 3 req/min, `not_configured` 503, `search_failed` 503, SSE stream path, `openai_chat_failed` 502.

---

## 6. Smallest “next 70 min” upload set for a new thread

1. This file: `docs/HANDOFF_NEXT_PASS_70MIN_CODEPACK.md`  
2. `src/components/campaign-guide/CampaignGuideDock.tsx`  
3. `src/app/admin/(board)/workbench/ask-kelly-beta/page.tsx`  
4. `src/app/admin/(board)/pages/[pageKey]/page.tsx` + `src/lib/content/page-blocks.ts` + `savePageHeroAction` in `src/app/admin/actions.ts` (proves how hero DB updates work today)

---

*End of codepack. Prefer reading the canonical paths from the repo; this document may be slightly behind after edits.*
