"use client";

import { useCallback, useEffect, useState } from "react";

import {
  countFilledQualificationNotecards,
  countReadyQualificationNotecards,
  DAY3_QUALIFICATION_STACK_STORAGE_KEY,
  emptyQualificationStackState,
  QUALIFICATION_NOTECARD_LABELS,
  type QualificationNotecardFields,
  type QualificationStackState,
} from "@/lib/election-plan/debate-prep-day3-qualification-stack";

function loadStack(): QualificationStackState {
  if (typeof window === "undefined") return emptyQualificationStackState();
  try {
    const raw = window.localStorage.getItem(DAY3_QUALIFICATION_STACK_STORAGE_KEY);
    if (!raw) return emptyQualificationStackState();
    const parsed = JSON.parse(raw) as QualificationStackState;
    if (!Array.isArray(parsed.cards) || parsed.cards.length !== 3) {
      return emptyQualificationStackState();
    }
    return parsed;
  } catch {
    return emptyQualificationStackState();
  }
}

function saveStack(state: QualificationStackState) {
  try {
    window.localStorage.setItem(DAY3_QUALIFICATION_STACK_STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* ignore quota */
  }
}

function updateCard(
  state: QualificationStackState,
  index: number,
  patch: Partial<QualificationNotecardFields>,
): QualificationStackState {
  const cards = [...state.cards] as QualificationStackState["cards"];
  cards[index] = { ...cards[index]!, ...patch };
  return { cards };
}

export function ElectionPlanQualificationStackPanel() {
  const [stack, setStack] = useState<QualificationStackState>(emptyQualificationStackState);

  useEffect(() => {
    setStack(loadStack());
  }, []);

  const patchCard = useCallback((index: number, patch: Partial<QualificationNotecardFields>) => {
    setStack((prev) => {
      const next = updateCard(prev, index, patch);
      saveStack(next);
      return next;
    });
  }, []);

  const filled = countFilledQualificationNotecards(stack);
  const ready = countReadyQualificationNotecards(stack);

  return (
    <section className="ep-card border-2 border-emerald-200 bg-emerald-50/20 p-5 text-sm">
      <p className="text-xs font-bold uppercase text-emerald-900">Qualification stack worksheet</p>
      <p className="mt-2 text-[var(--ep-navy-muted)]">
        Three notecards only — job, who depended on you, clerk-relevant beat. Saved on this device only (no upload).
        Stop at three beats; slower and specific beats fast and abstract.
      </p>

      <div className="mt-6 space-y-5">
        {QUALIFICATION_NOTECARD_LABELS.map(({ index, pillar, hint }) => {
          const card = stack.cards[index]!;
          return (
            <article key={pillar} className="rounded-xl border border-[var(--ep-border)] bg-white p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <h3 className="text-xs font-bold uppercase text-[var(--ep-navy)]">{pillar}</h3>
                  <p className="mt-1 text-xs text-[var(--ep-navy-muted)]">{hint}</p>
                </div>
                <label className="flex cursor-pointer items-center gap-2 text-xs font-semibold text-emerald-900">
                  <input
                    type="checkbox"
                    checked={card.ready}
                    onChange={(e) => patchCard(index, { ready: e.target.checked })}
                    className="mt-0.5"
                  />
                  Ready for 90s stack
                </label>
              </div>

              <div className="mt-4 grid gap-3 md:grid-cols-3">
                <label className="block">
                  <span className="text-xs font-bold uppercase text-[var(--ep-navy)]">Job</span>
                  <textarea
                    value={card.job}
                    onChange={(e) => patchCard(index, { job: e.target.value })}
                    rows={3}
                    placeholder="Operational role — no bill numbers"
                    className="mt-1 w-full rounded-lg border border-[var(--ep-border)] p-2 text-sm text-[var(--ep-navy)]"
                  />
                </label>
                <label className="block">
                  <span className="text-xs font-bold uppercase text-[var(--ep-navy)]">Who depended on you</span>
                  <textarea
                    value={card.whoDepended}
                    onChange={(e) => patchCard(index, { whoDepended: e.target.value })}
                    rows={3}
                    placeholder="County clerks, nonprofits, voters under deadline…"
                    className="mt-1 w-full rounded-lg border border-[var(--ep-border)] p-2 text-sm text-[var(--ep-navy)]"
                  />
                </label>
                <label className="block">
                  <span className="text-xs font-bold uppercase text-[var(--ep-navy)]">Clerk-relevant beat</span>
                  <textarea
                    value={card.clerkBeat}
                    onChange={(e) => patchCard(index, { clerkBeat: e.target.value })}
                    rows={3}
                    placeholder="One line a county clerk would nod at"
                    className="mt-1 w-full rounded-lg border border-[var(--ep-border)] p-2 text-sm text-[var(--ep-navy)]"
                  />
                </label>
              </div>
            </article>
          );
        })}
      </div>

      <p className="mt-4 text-xs font-semibold text-emerald-900">
        {ready >= 3
          ? "Stack gate met — recite all three from memory without bill numbers, then open claims gate."
          : filled >= 3
            ? `Three beats drafted (${ready}/3 marked ready) — rehearse 90s aloud, then check each beat in claims gate.`
            : `${filled}/3 notecards filled — pick three Kelly jobs from the executive book, one card per pillar.`}
      </p>
    </section>
  );
}
