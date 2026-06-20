"use client";

import { useCallback, useEffect, useState } from "react";

import { AccaForumYoutubeEmbed } from "@/components/election-plan/AccaForumYoutubeEmbed";

const STORAGE_KEY = "kelly-day2-film-tell-worksheet-v1";

const HAMMER_TELLS = [
  { id: "hammer-voice", label: "Voice speed increase — slow down when he speeds up" },
  { id: "hammer-rank", label: "Heritage / integrity ranking cite" },
  { id: "hammer-jaw", label: "Jaw tension or bill-number list acceleration" },
] as const;

const PAKKO_TELL = {
  id: "pakko-respect",
  label: "Pakko respect line — one sentence, under 15 seconds",
} as const;

type WorksheetState = Record<string, boolean>;

function loadWorksheet(): WorksheetState {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as WorksheetState;
  } catch {
    return {};
  }
}

function saveWorksheet(state: WorksheetState) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* ignore quota */
  }
}

export function ElectionPlanFilmTellWorksheetPanel() {
  const [checks, setChecks] = useState<WorksheetState>({});

  useEffect(() => {
    setChecks(loadWorksheet());
  }, []);

  const toggle = useCallback((id: string) => {
    setChecks((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      saveWorksheet(next);
      return next;
    });
  }, []);

  const hammerDone = HAMMER_TELLS.filter((t) => checks[t.id]).length;
  const pakkoDone = checks[PAKKO_TELL.id] ? 1 : 0;

  return (
    <section className="ep-card border-2 border-indigo-200 bg-indigo-50/20 p-5 text-sm">
      <p className="text-xs font-bold uppercase text-indigo-900">Film tells worksheet</p>
      <p className="mt-2 text-[var(--ep-navy-muted)]">
        Watch the ACCA panel clip below on election-plan — no admin film-room login. Check each tell when you can name
        it and speak one pivot line.
      </p>

      <AccaForumYoutubeEmbed compact />

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <div>
          <h3 className="text-xs font-bold uppercase text-[var(--ep-navy)]">Hammer tells ({hammerDone}/3)</h3>
          <ul className="mt-3 space-y-2">
            {HAMMER_TELLS.map((tell) => (
              <li key={tell.id}>
                <label className="flex cursor-pointer items-start gap-2 rounded-lg border border-[var(--ep-border)] bg-white p-3">
                  <input
                    type="checkbox"
                    checked={Boolean(checks[tell.id])}
                    onChange={() => toggle(tell.id)}
                    className="mt-1"
                  />
                  <span className="text-[var(--ep-navy-muted)]">{tell.label}</span>
                </label>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="text-xs font-bold uppercase text-[var(--ep-navy)]">Pakko tell ({pakkoDone}/1)</h3>
          <label className="mt-3 flex cursor-pointer items-start gap-2 rounded-lg border border-[var(--ep-border)] bg-white p-3">
            <input
              type="checkbox"
              checked={Boolean(checks[PAKKO_TELL.id])}
              onChange={() => toggle(PAKKO_TELL.id)}
              className="mt-1"
            />
            <span className="text-[var(--ep-navy-muted)]">{PAKKO_TELL.label}</span>
          </label>
          <p className="mt-4 text-xs text-[var(--ep-navy-muted)]">
            Pivot column (optional notes): clerk phone · author vs administrator · clerks forward not relitigate.
          </p>
        </div>
      </div>

      <p className="mt-4 text-xs font-semibold text-emerald-900">
        {hammerDone >= 3 && pakkoDone >= 1
          ? "Worksheet gate met — continue to trap lanes when ready."
          : "Minimum tonight: three Hammer tells + one Pakko line on paper before trap lane reps."}
      </p>
    </section>
  );
}
