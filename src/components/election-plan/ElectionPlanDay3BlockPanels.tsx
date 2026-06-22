"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import {
  epDebatePrepDayExampleHref,
  epHammerBillHref,
  epLegislativeIntel2021Href,
  EP_LEGISLATIVE_INTEL_HREF,
} from "@/lib/election-plan/debate-prep-links";
import { DAY3_ID } from "@/lib/election-plan/debatePrepDayDrillDown";

const STORAGE_KEY = "kelly-day3-funding-research-v1";

type ResearchState = {
  questions: [string, string, string];
  noInventedAmounts: boolean;
};

function emptyState(): ResearchState {
  return { questions: ["", "", ""], noInventedAmounts: false };
}

function loadState(): ResearchState {
  if (typeof window === "undefined") return emptyState();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyState();
    const parsed = JSON.parse(raw) as ResearchState;
    if (!Array.isArray(parsed.questions) || parsed.questions.length !== 3) return emptyState();
    return parsed;
  } catch {
    return emptyState();
  }
}

function saveState(state: ResearchState) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* ignore */
  }
}

export function ElectionPlanFundingResearchFramePanel() {
  const [state, setState] = useState<ResearchState>(emptyState);

  useEffect(() => {
    setState(loadState());
  }, []);

  const patch = useCallback((patch: Partial<ResearchState> | ((prev: ResearchState) => ResearchState)) => {
    setState((prev) => {
      const next = typeof patch === "function" ? patch(prev) : { ...prev, ...patch };
      saveState(next);
      return next;
    });
  }, []);

  const filled = state.questions.filter((q) => q.trim().length > 0).length;

  return (
    <section className="ep-card border-2 border-sky-200 bg-sky-50/20 p-5 text-sm">
      <p className="text-xs font-bold uppercase text-sky-900">Clerk funding · research question frame</p>
      <p className="mt-2 text-[var(--ep-navy-muted)]">
        Write three research questions only — not answers with dollar amounts. CVSGF/HAVA totals stay in claims
        ledger until staff verifies.
      </p>

      <div className="mt-4 space-y-3">
        {([0, 1, 2] as const).map((index) => (
          <label key={index} className="block">
            <span className="text-xs font-bold uppercase text-[var(--ep-navy)]">Research question {index + 1}</span>
            <textarea
              value={state.questions[index]}
              onChange={(e) =>
                patch((prev) => {
                  const questions = [...prev.questions] as ResearchState["questions"];
                  questions[index] = e.target.value;
                  return { ...prev, questions };
                })
              }
              rows={2}
              placeholder="Where did implementation dollars land for clerk mandates?"
              className="mt-1 w-full rounded-lg border border-[var(--ep-border)] p-2 text-sm text-[var(--ep-navy)]"
            />
          </label>
        ))}
      </div>

      <label className="mt-4 flex cursor-pointer items-start gap-2 text-xs font-semibold text-amber-950">
        <input
          type="checkbox"
          checked={state.noInventedAmounts}
          onChange={(e) => patch({ noInventedAmounts: e.target.checked })}
          className="mt-0.5"
        />
        I will not stage CVSGF, HAVA, or grant totals from memory — research frame only unless claims-green.
      </label>

      <p className="mt-4 text-xs font-semibold text-sky-950">
        {filled >= 3 && state.noInventedAmounts
          ? "Funding frame ready — rehearse 60s clerk funding answer next."
          : `${filled}/3 research questions drafted — no invented stats in rehearsal.`}
      </p>
    </section>
  );
}

export function ElectionPlanHammerEnrolledContrastPanel() {
  return (
    <section className="ep-card border-2 border-rose-200 bg-rose-50/20 p-5 text-sm">
      <p className="text-xs font-bold uppercase text-rose-900">Hammer enrolled sections · implementation contrast</p>
      <p className="mt-2 text-[var(--ep-navy-muted)]">
        Contrast sponsor credit with county execution burden — research frame unless claims-verified. Open enrolled act
        text in election-plan legislative intel, not Arkleg mid-debate.
      </p>
      <ul className="mt-4 flex flex-wrap gap-2 text-xs font-bold">
        <li>
          <Link href={epHammerBillHref("SB486")} className="rounded-full border border-rose-300 bg-white px-3 py-1.5 text-rose-950">
            SB486 enrolled sections →
          </Link>
        </li>
        <li>
          <Link href={epLegislativeIntel2021Href()} className="rounded-full border border-rose-300 bg-white px-3 py-1.5 text-rose-950">
            2021 integrity package →
          </Link>
        </li>
        <li>
          <Link href={EP_LEGISLATIVE_INTEL_HREF} className="rounded-full border border-rose-300 bg-white px-3 py-1.5 text-rose-950">
            Legislative intel hub →
          </Link>
        </li>
        <li>
          <Link
            href={epDebatePrepDayExampleHref(DAY3_ID, "ex3-hammer-admin")}
            className="rounded-full border border-rose-300 bg-white px-3 py-1.5 text-rose-950"
          >
            Hammer admin example →
          </Link>
        </li>
      </ul>
    </section>
  );
}
