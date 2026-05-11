"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import type { TeamGovernanceChecklistItem } from "@/types/dashboard";

type Props = {
  teamSlug: string;
  weeklyTitle: string;
  monthlyTitle: string;
  weeklyItems: TeamGovernanceChecklistItem[];
  monthlyItems: TeamGovernanceChecklistItem[];
  /** Uses separate localStorage namespace for downstream training checklist. */
  variant?: "default" | "downstream";
};

export function TeamGovernanceChecklistsClient({
  teamSlug,
  weeklyTitle,
  monthlyTitle,
  weeklyItems,
  monthlyItems,
  variant = "default",
}: Props) {
  const storageKey = useMemo(
    () => `vos-field-checks-${variant}-${teamSlug}`,
    [teamSlug, variant],
  );
  const [checked, setChecked] = useState<Record<string, boolean>>({});

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) setChecked(JSON.parse(raw) as Record<string, boolean>);
    } catch {
      setChecked({});
    }
  }, [storageKey]);

  const persist = useCallback(
    (next: Record<string, boolean>) => {
      setChecked(next);
      try {
        localStorage.setItem(storageKey, JSON.stringify(next));
      } catch {
        /* ignore quota */
      }
    },
    [storageKey],
  );

  const toggle = (id: string) => {
    persist({ ...checked, [id]: !checked[id] });
  };

  return (
    <section className="rounded-2xl border border-kelly-text/10 bg-white p-6 shadow-[var(--shadow-soft)] md:p-8">
      <p className="font-body text-[10px] font-bold uppercase tracking-[0.22em] text-kelly-text/50">
        {variant === "downstream" ? "Downstream training" : "Team governance"}
      </p>
      <h2 className="mt-2 font-heading text-lg font-bold text-kelly-navy">{weeklyTitle}</h2>
      <ul className="mt-4 space-y-2">
        {weeklyItems.map((item) => (
          <li key={item.id}>
            <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-kelly-text/10 bg-kelly-page/80 px-3 py-2 font-body text-sm text-kelly-text/85 hover:bg-kelly-fog/60">
              <input type="checkbox" className="mt-1" checked={Boolean(checked[item.id])} onChange={() => toggle(item.id)} />
              <span>{item.label}</span>
            </label>
          </li>
        ))}
      </ul>

      {monthlyItems.length > 0 ? (
        <>
          <h3 className="mt-8 font-heading text-base font-bold text-kelly-navy">{monthlyTitle}</h3>
          <ul className="mt-4 space-y-2">
            {monthlyItems.map((item) => (
              <li key={item.id}>
                <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-kelly-text/10 bg-kelly-page/80 px-3 py-2 font-body text-sm text-kelly-text/85 hover:bg-kelly-fog/60">
                  <input type="checkbox" className="mt-1" checked={Boolean(checked[item.id])} onChange={() => toggle(item.id)} />
                  <span>{item.label}</span>
                </label>
              </li>
            ))}
          </ul>
        </>
      ) : null}

      <p className="mt-4 font-body text-[11px] text-kelly-text/55">Saved on this device only — resets if you clear browser storage.</p>
    </section>
  );
}
