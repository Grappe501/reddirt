"use client";

import { useFormState, useFormStatus } from "react-dom";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { savePageHeroFormAction } from "@/app/admin/actions";
import {
  heroFieldHelp,
  heroImpactBlurb,
  KELLY_ASK_KELLY_NOT_LINKED,
  KELLY_EDITOR_EXPLANATION_INTRO,
  KELLY_EDITOR_EXPLANATION_VISIT_KEY,
  KELLY_HERO_EMPTY_DB,
  KELLY_HERO_WELCOME,
  KELLY_HERO_WELCOME_COMPACT,
  KELLY_HERO_WHY_DOUBLE_CONFIRM,
} from "@/content/admin-kelly-page-hero-copy";
import {
  pageHeroDraftDiffersFromInitial,
  pageHeroDraftStorageKey,
  parsePageHeroLocalDraft,
  type PageHeroLocalDraftV1,
} from "@/lib/browser/kelly-local-drafts";
import type { HeroBlockPayload, PageKey } from "@/lib/content/page-blocks";
import { cn } from "@/lib/utils";

const LS_COMPACT = "kelly-hero-compact";
const EARLY_EXPLANATION_MAX_VISITS = 3;

type Step = "edit" | "review" | "final";

type Props = {
  pageKey: PageKey;
  initial: HeroBlockPayload | null;
  showSaved: boolean;
};

function displayField(v: string | undefined): string {
  const t = (v ?? "").trim();
  return t.length > 0 ? t : "— (empty)";
}

function FinalSubmitButton({ disabled, label, pendingLabel }: { disabled: boolean; label: string; pendingLabel: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={disabled || pending}
      className="rounded-btn bg-kelly-navy px-5 py-2.5 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
    >
      {pending ? pendingLabel : label}
    </button>
  );
}

type FieldKey = "eyebrow" | "title" | "subtitle";

type FieldHelpMode = "early" | "late";

type FieldOpen = "none" | "why" | "affects";

export function PageHeroEditor({ pageKey, initial, showSaved }: Props) {
  const publicPath = `/${pageKey}`;
  const [state, formAction] = useFormState(savePageHeroFormAction, null);
  const [step, setStep] = useState<Step>("edit");
  const [eyebrow, setEyebrow] = useState(initial?.eyebrow ?? "");
  const [title, setTitle] = useState(initial?.title ?? "");
  const [subtitle, setSubtitle] = useState(initial?.subtitle ?? "");
  const [compact, setCompact] = useState(false);
  const [explanationMode, setExplanationMode] = useState<FieldHelpMode | null>(null);
  const [fieldOpen, setFieldOpen] = useState<Record<FieldKey, FieldOpen>>({
    eyebrow: "none",
    title: "none",
    subtitle: "none",
  });
  const [heroLocalDraftRead, setHeroLocalDraftRead] = useState(false);
  const [heroRecovery, setHeroRecovery] = useState<{
    status: "pending" | "ready";
    draft: PageHeroLocalDraftV1 | null;
  }>({ status: "ready", draft: null });

  const currentEyebrow = initial?.eyebrow ?? "";
  const currentTitle = initial?.title ?? "";
  const currentSubtitle = initial?.subtitle ?? "";

  useEffect(() => {
    if (typeof window === "undefined") return;
    setCompact(() => localStorage.getItem(LS_COMPACT) === "1");
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = localStorage.getItem(KELLY_EDITOR_EXPLANATION_VISIT_KEY);
    const n = (Number.parseInt(String(raw || "0"), 10) || 0) + 1;
    localStorage.setItem(KELLY_EDITOR_EXPLANATION_VISIT_KEY, String(n));
    const early = n <= EARLY_EXPLANATION_MAX_VISITS;
    setExplanationMode(early ? "early" : "late");
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setHeroLocalDraftRead(false);
    if (showSaved) {
      try {
        localStorage.removeItem(pageHeroDraftStorageKey(pageKey));
      } catch {
        /* ignore */
      }
      setHeroRecovery({ status: "ready", draft: null });
      setHeroLocalDraftRead(true);
      return;
    }
    const key = pageHeroDraftStorageKey(pageKey);
    let raw: string | null = null;
    try {
      raw = localStorage.getItem(key);
    } catch {
      setHeroRecovery({ status: "ready", draft: null });
      setHeroLocalDraftRead(true);
      return;
    }
    const draft = parsePageHeroLocalDraft(raw);
    if (!draft) {
      setHeroRecovery({ status: "ready", draft: null });
      setHeroLocalDraftRead(true);
      return;
    }
    if (!pageHeroDraftDiffersFromInitial(draft, initial)) {
      try {
        localStorage.removeItem(key);
      } catch {
        /* ignore */
      }
      setHeroRecovery({ status: "ready", draft: null });
      setHeroLocalDraftRead(true);
      return;
    }
    setHeroRecovery({ status: "pending", draft });
    setHeroLocalDraftRead(true);
  }, [pageKey, initial, showSaved]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!heroLocalDraftRead) return;
    if (showSaved) return;
    if (heroRecovery.status === "pending") return;
    const key = pageHeroDraftStorageKey(pageKey);
    const body: PageHeroLocalDraftV1 = {
      v: 1,
      eyebrow,
      title,
      subtitle,
      savedAt: new Date().toISOString(),
    };
    if (!pageHeroDraftDiffersFromInitial(body, initial)) {
      try {
        localStorage.removeItem(key);
      } catch {
        /* ignore */
      }
      return;
    }
    try {
      localStorage.setItem(key, JSON.stringify(body));
    } catch {
      /* ignore quota / private mode */
    }
  }, [eyebrow, title, subtitle, pageKey, initial, showSaved, heroLocalDraftRead, heroRecovery.status]);

  const setFieldOpenFor = (key: FieldKey, next: FieldOpen) => {
    setFieldOpen((prev) => {
      const cur = prev[key];
      const toggled = cur === next ? "none" : next;
      return { ...prev, [key]: toggled };
    });
  };

  const setCompactAndPersist = useCallback((value: boolean) => {
    setCompact(value);
    if (typeof window !== "undefined") {
      if (value) localStorage.setItem(LS_COMPACT, "1");
      else localStorage.removeItem(LS_COMPACT);
    }
  }, []);

  const onFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    if (step !== "final") {
      e.preventDefault();
    }
  };

  const hasNoSavedRow = !initial;
  const helpMode: FieldHelpMode = explanationMode === null ? "late" : explanationMode;

  return (
    <div className="space-y-6">
      {showSaved ? (
        <p
          className="rounded-lg border border-kelly-success/35 bg-kelly-success/10 px-3 py-2 text-sm text-kelly-text"
          role="status"
        >
          Update saved. The site has been refreshed. The public hero for {publicPath} was written to the database and the page cache
          was updated.
        </p>
      ) : null}

      {heroRecovery.status === "pending" && heroRecovery.draft ? (
        <div
          className="rounded-lg border border-kelly-navy/25 bg-kelly-fog/80 px-4 py-3 text-sm text-kelly-text"
          role="status"
        >
          <p className="font-semibold text-kelly-navy">Recovered an unsaved draft from this browser.</p>
          <p className="mt-1 text-xs text-kelly-text/75">This is only on your device. Review it, then save from step 3 when you are online.</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => {
                const d = heroRecovery.draft;
                if (!d) return;
                setEyebrow(d.eyebrow);
                setTitle(d.title);
                setSubtitle(d.subtitle);
                setStep("edit");
                setHeroRecovery({ status: "ready", draft: null });
              }}
              className="rounded-md bg-kelly-navy px-3 py-1.5 text-xs font-bold text-white"
            >
              Restore draft
            </button>
            <button
              type="button"
              onClick={() => {
                const k = pageHeroDraftStorageKey(pageKey);
                try {
                  localStorage.removeItem(k);
                } catch {
                  /* ignore */
                }
                setEyebrow(initial?.eyebrow ?? "");
                setTitle(initial?.title ?? "");
                setSubtitle(initial?.subtitle ?? "");
                setStep("edit");
                setHeroRecovery({ status: "ready", draft: null });
              }}
              className="rounded-md border border-kelly-text/20 bg-white px-3 py-1.5 text-xs font-semibold text-kelly-text"
            >
              Discard draft
            </button>
          </div>
        </div>
      ) : null}

      {state?.error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-900" role="alert">
          <p>{state.error}</p>
          <p className="mt-2 text-xs text-red-900/90">Nothing was lost. Your draft is still saved in this browser.</p>
        </div>
      ) : null}

      {hasNoSavedRow ? (
        <div className="rounded-lg border border-kelly-text/15 bg-amber-50/90 px-4 py-3 text-sm text-kelly-text">
          <p className="font-heading font-semibold text-kelly-navy">{KELLY_HERO_EMPTY_DB.title}</p>
          <p className="mt-1 text-kelly-text/90">{KELLY_HERO_EMPTY_DB.body}</p>
        </div>
      ) : null}

      <div className="rounded-lg border border-kelly-forest/20 bg-kelly-fog/50 px-4 py-3 text-sm text-kelly-text/90">
        <p className="font-body text-xs font-semibold uppercase tracking-wide text-kelly-navy/90">How this screen behaves</p>
        <p className="mt-1.5 font-body leading-relaxed text-kelly-text/95">{KELLY_EDITOR_EXPLANATION_INTRO}</p>
      </div>

      <div className="rounded-lg border border-kelly-gold/30 bg-kelly-fog/50 px-4 py-3 text-sm text-kelly-text/90">
        <p className="font-body leading-relaxed">{compact ? KELLY_HERO_WELCOME_COMPACT : KELLY_HERO_WELCOME}</p>
        <p className="mt-2 text-xs text-kelly-text/70">{KELLY_ASK_KELLY_NOT_LINKED}</p>
        <div className="mt-2 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setCompactAndPersist(!compact)}
            className="rounded-md border border-kelly-text/20 bg-white px-2 py-1 text-xs font-semibold text-kelly-navy hover:bg-kelly-fog"
          >
            {compact ? "Show more guidance" : "I’m familiar — show less coaching"}
          </button>
        </div>
        <details className="mt-3 text-xs text-kelly-text/75">
          <summary className="cursor-pointer font-semibold text-kelly-navy/90">Why is this screen here?</summary>
          <p className="mt-1 pl-0.5">
            {heroImpactBlurb(pageKey, publicPath)} {KELLY_HERO_WHY_DOUBLE_CONFIRM}
          </p>
        </details>
      </div>

      <p className="font-body text-xs text-kelly-text/55">
        Step {step === "edit" ? "1" : step === "review" ? "2" : "3"} of 3:{" "}
        {step === "edit" ? "Edit" : step === "review" ? "Review summary" : "Final confirmation"}
      </p>

      <form action={formAction} onSubmit={onFormSubmit} className="space-y-4">
        <input type="hidden" name="pageKey" value={pageKey} />

        <div
          className={cn(
            "rounded-card border border-kelly-text/10 bg-kelly-page p-6 shadow-[var(--shadow-soft)]",
            step !== "edit" && "hidden",
          )}
        >
          {(["eyebrow", "title", "subtitle"] as const).map((key) => {
            const h = heroFieldHelp[key];
            const open = fieldOpen[key];
            const isEarly = helpMode === "early";
            return (
              <div key={key} className="mb-6 last:mb-0">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-kelly-text/55">{h.shortLabel}</span>
                </div>
                {isEarly ? (
                  <div className="mt-2 rounded-md border border-kelly-text/10 bg-kelly-fog/40 px-3 py-2 text-xs leading-relaxed text-kelly-text/90">
                    <p>
                      <span className="font-semibold text-kelly-ink/90">Why: </span>
                      {h.whyHere}
                    </p>
                    <p className="mt-1.5">
                      <span className="font-semibold text-kelly-ink/90">What it affects: </span>
                      {h.whatItAffects}
                    </p>
                  </div>
                ) : (
                  <div className="mt-2 space-y-2">
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => setFieldOpenFor(key, "why")}
                        className={cn(
                          "rounded-md border px-2 py-1 text-xs font-semibold",
                          open === "why"
                            ? "border-kelly-navy/40 bg-kelly-navy/5 text-kelly-navy"
                            : "border-kelly-text/20 bg-white text-kelly-navy hover:bg-kelly-fog",
                        )}
                      >
                        Why is this here?
                      </button>
                      <button
                        type="button"
                        onClick={() => setFieldOpenFor(key, "affects")}
                        className={cn(
                          "rounded-md border px-2 py-1 text-xs font-semibold",
                          open === "affects"
                            ? "border-kelly-navy/40 bg-kelly-navy/5 text-kelly-navy"
                            : "border-kelly-text/20 bg-white text-kelly-navy hover:bg-kelly-fog",
                        )}
                      >
                        What does this affect?
                      </button>
                    </div>
                    {open === "why" ? (
                      <p className="rounded-md border border-kelly-text/10 bg-white px-3 py-2 text-xs text-kelly-text/90">{h.whyHere}</p>
                    ) : null}
                    {open === "affects" ? (
                      <p className="rounded-md border border-kelly-text/10 bg-white px-3 py-2 text-xs text-kelly-text/90">
                        {h.whatItAffects}
                      </p>
                    ) : null}
                  </div>
                )}
                {key === "eyebrow" || key === "title" ? (
                  <input
                    value={key === "eyebrow" ? eyebrow : title}
                    onChange={(e) => (key === "eyebrow" ? setEyebrow(e.target.value) : setTitle(e.target.value))}
                    className="mt-2 w-full rounded-md border border-kelly-text/15 bg-white px-3 py-2 text-sm"
                    autoComplete="off"
                    name={key === "eyebrow" ? "eyebrow-input" : "title-input"}
                    id={key === "eyebrow" ? "eyebrow-input" : "title-input"}
                  />
                ) : (
                  <textarea
                    value={subtitle}
                    onChange={(e) => setSubtitle(e.target.value)}
                    rows={4}
                    className="mt-2 w-full rounded-md border border-kelly-text/15 bg-white px-3 py-2 text-sm"
                    name="subtitle-input"
                    id="subtitle-input"
                  />
                )}
              </div>
            );
          })}

          <div className="mt-2 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setStep("review");
              }}
              disabled={heroRecovery.status === "pending"}
              className="rounded-btn bg-kelly-navy px-5 py-2.5 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              Review change
            </button>
            <span className="text-xs text-kelly-text/50">
              {heroRecovery.status === "pending"
                ? "Use Restore or Discard on the draft banner above first."
                : "Next you’ll see current vs. new, then a final check before any save."}
            </span>
          </div>
        </div>

        {step === "review" || step === "final" ? (
          <div className="rounded-card border border-kelly-navy/20 bg-white p-6">
            {step === "review" ? (
              <>
                <h2 className="font-heading text-lg font-bold text-kelly-navy">Review summary</h2>
                <p className="mt-1 text-sm text-kelly-text/80">
                  Page: <span className="font-mono font-semibold text-kelly-text">/{pageKey}</span> · {heroImpactBlurb(pageKey, publicPath)}{" "}
                  <span className="font-medium">Nothing is saved until step 3.</span>
                </p>
                <p className="mt-2 text-xs font-medium uppercase tracking-wide text-kelly-text/50">Hero text — current → new</p>
                <dl className="mt-3 space-y-3 text-sm">
                  <div className="rounded-md border border-kelly-text/10 bg-kelly-fog/30 px-3 py-2">
                    <dt className="text-xs font-semibold uppercase text-kelly-text/50">Eyebrow</dt>
                    <dd className="mt-1 text-kelly-text/80">
                      <span className="text-kelly-text/55">Current: </span>
                      {displayField(currentEyebrow)}
                    </dd>
                    <dd className="mt-0.5 text-kelly-text">
                      <span className="text-kelly-text/55">New: </span>
                      {displayField(eyebrow)}
                    </dd>
                  </div>
                  <div className="rounded-md border border-kelly-text/10 bg-kelly-fog/30 px-3 py-2">
                    <dt className="text-xs font-semibold uppercase text-kelly-text/50">Title</dt>
                    <dd className="mt-1 text-kelly-text/80">
                      <span className="text-kelly-text/55">Current: </span>
                      {displayField(currentTitle)}
                    </dd>
                    <dd className="mt-0.5 text-kelly-text">
                      <span className="text-kelly-text/55">New: </span>
                      {displayField(title)}
                    </dd>
                  </div>
                  <div className="rounded-md border border-kelly-text/10 bg-kelly-fog/30 px-3 py-2">
                    <dt className="text-xs font-semibold uppercase text-kelly-text/50">Subtitle</dt>
                    <dd className="mt-1 whitespace-pre-wrap text-kelly-text/80">
                      <span className="text-kelly-text/55">Current: </span>
                      {displayField(currentSubtitle)}
                    </dd>
                    <dd className="mt-0.5 whitespace-pre-wrap text-kelly-text">
                      <span className="text-kelly-text/55">New: </span>
                      {displayField(subtitle)}
                    </dd>
                  </div>
                </dl>
                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setStep("edit")}
                    className="rounded-md border border-kelly-text/20 px-4 py-2 text-sm font-semibold text-kelly-text"
                  >
                    Back to editing
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep("final")}
                    className="rounded-btn bg-kelly-navy px-5 py-2.5 text-sm font-bold text-white"
                  >
                    Confirm update
                  </button>
                </div>
              </>
            ) : (
              <>
                <h2 className="font-heading text-lg font-bold text-kelly-navy">Final confirmation</h2>
                <p className="mt-1 font-mono text-xs text-kelly-text/70">
                  Page key: <span className="font-semibold text-kelly-text">/{pageKey}</span>
                </p>
                <p className="mt-3 text-sm text-kelly-text/85">{KELLY_HERO_WHY_DOUBLE_CONFIRM}</p>
                <p className="mt-2 text-sm font-medium text-kelly-navy">This is the only step that writes to the database and updates the public hero.</p>
                <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-kelly-text/50">Review summary</p>
                <ul className="mt-1 space-y-2 text-sm text-kelly-text/90">
                  <li>
                    <span className="text-kelly-text/55">Eyebrow: </span>
                    {displayField(currentEyebrow)} <span className="text-kelly-text/40">→</span> {displayField(eyebrow)}
                  </li>
                  <li>
                    <span className="text-kelly-text/55">Title: </span>
                    {displayField(currentTitle)} <span className="text-kelly-text/40">→</span> {displayField(title)}
                  </li>
                  <li className="whitespace-pre-wrap">
                    <span className="text-kelly-text/55">Subtitle: </span>
                    {displayField(currentSubtitle)} <span className="text-kelly-text/40">→</span> {displayField(subtitle)}
                  </li>
                </ul>
                <p className="mt-4 rounded-md border border-amber-200/80 bg-amber-50/90 px-3 py-2 text-sm text-amber-950">
                  This will update the live site after saving to the database. If you are not ready, go back.
                </p>
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <input type="hidden" name="eyebrow" value={eyebrow} />
                  <input type="hidden" name="title" value={title} />
                  <input type="hidden" name="subtitle" value={subtitle} />
                  <button
                    type="button"
                    onClick={() => setStep("review")}
                    className="rounded-md border border-kelly-text/20 px-4 py-2 text-sm font-semibold text-kelly-text"
                  >
                    Back to review
                  </button>
                  <FinalSubmitButton
                    disabled={false}
                    label="Send update to site"
                    pendingLabel="Sending update…"
                  />
                </div>
              </>
            )}
          </div>
        ) : null}
      </form>

      {step === "edit" && (
        <p className="text-center text-xs text-kelly-text/50">
          <Link href="/admin/pages" className="font-semibold text-kelly-slate hover:underline">
            ← All page copy
          </Link>
          {" · "}
          <Link href="/admin/content" className="font-semibold text-kelly-slate hover:underline">
            Content overview
          </Link>
          {" · "}
          <Link href="/admin/workbench/ask-kelly-beta" className="font-semibold text-kelly-slate hover:underline">
            Campaign feedback (Ask Kelly)
          </Link>
        </p>
      )}
    </div>
  );
}
