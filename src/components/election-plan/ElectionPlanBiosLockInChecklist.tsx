"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import { EP_OPPONENT_BIOS_HREF, epOpponentBioHref } from "@/lib/election-plan/debate-prep-links";

const STORAGE_KEY = "kelly-day6-bios-lock-v1";

export type BiosMemoryLine = {
  opponentId: string;
  displayName: string;
  lines: Array<{ label: string; text: string }>;
};

function loadChecked(): Record<string, boolean> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Record<string, boolean>) : {};
  } catch {
    return {};
  }
}

function saveChecked(map: Record<string, boolean>) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  } catch {
    /* ignore */
  }
}

export function ElectionPlanBiosLockInChecklist({ opponents }: { opponents: BiosMemoryLine[] }) {
  const [checked, setChecked] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setChecked(loadChecked());
  }, []);

  const toggle = useCallback((key: string) => {
    setChecked((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      saveChecked(next);
      return next;
    });
  }, []);

  const totalLines = opponents.reduce((n, o) => n + o.lines.length, 0);
  const doneLines = opponents.reduce(
    (n, o) => n + o.lines.filter((line) => checked[`${o.opponentId}:${line.label}`]).length,
    0,
  );

  return (
    <section className="mb-6 space-y-4">
      <p className="text-xs font-bold uppercase text-violet-900">Memory lines lock-in · speak twice each</p>
      <p className="text-xs text-[var(--ep-navy-muted)]">
        Third read only — memory lines + command mode. Full dossier stays closed tonight.
      </p>

      {opponents.map((opp) => (
        <article key={opp.opponentId} className="ep-card border-violet-200 bg-violet-50/20 p-5 text-sm">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="font-heading text-lg font-bold text-[var(--ep-navy)]">{opp.displayName}</p>
            <Link href={epOpponentBioHref(opp.opponentId)} className="text-xs font-bold text-violet-900 underline">
              Bio →
            </Link>
          </div>
          <ul className="mt-4 space-y-3">
            {opp.lines.map((line) => {
              const key = `${opp.opponentId}:${line.label}`;
              const isDone = !!checked[key];
              return (
                <li key={key}>
                  <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-[var(--ep-border)] bg-white p-3">
                    <input type="checkbox" checked={isDone} onChange={() => toggle(key)} className="mt-1" />
                    <div>
                      <p className="text-[10px] font-bold uppercase text-violet-800">{line.label}</p>
                      <p className="mt-1 text-[var(--ep-navy)]">{line.text}</p>
                    </div>
                  </label>
                </li>
              );
            })}
          </ul>
        </article>
      ))}

      <p className="text-xs font-bold text-emerald-900">
        {doneLines}/{totalLines} memory lines spoken aloud twice
      </p>
      <Link href={EP_OPPONENT_BIOS_HREF} className="inline-block text-xs font-bold text-[var(--ep-navy)] underline">
        Opponent bios hub →
      </Link>
    </section>
  );
}
