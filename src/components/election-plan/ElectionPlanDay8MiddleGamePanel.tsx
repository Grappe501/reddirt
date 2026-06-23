"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import { ElectionPlanPracticeCountdown } from "@/components/election-plan/ElectionPlanPracticeCountdown";
import { DAY8_DOMAIN_DEEP_STUDY_LINKS } from "@/lib/election-plan/debate-prep-day8-deep-study-links";
import type { Day8SosDomainCard } from "@/lib/election-plan/debate-prep-day8-sos-three-domains";
import type { Day5WhenXSayYRow } from "@/lib/election-plan/load-day5-capitalize-surface";
import { EP_TRAP_LANES_HREF, epDebatePrepDayBlockHref } from "@/lib/election-plan/debate-prep-links";

const STORAGE_KEY = "kelly-day8-middle-game-v1";

type MiddleGameTab = "trap" | Day8SosDomainCard["id"];

type MiddleGameLog = {
  completedSosDomains: string[];
  trapPairsDone: number[];
};

function loadLog(): MiddleGameLog {
  if (typeof window === "undefined") return { completedSosDomains: [], trapPairsDone: [] };
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as MiddleGameLog) : { completedSosDomains: [], trapPairsDone: [] };
  } catch {
    return { completedSosDomains: [], trapPairsDone: [] };
  }
}

function saveLog(log: MiddleGameLog) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(log));
  } catch {
    /* ignore */
  }
}

export function ElectionPlanDay8MiddleGamePanel({
  domains,
  trapPairs,
}: {
  domains: readonly Day8SosDomainCard[];
  trapPairs: readonly Day5WhenXSayYRow[];
}) {
  const [tab, setTab] = useState<MiddleGameTab>("trap");
  const [log, setLog] = useState<MiddleGameLog>({ completedSosDomains: [], trapPairsDone: [] });

  useEffect(() => {
    setLog(loadLog());
  }, []);

  const verifiedPairs = trapPairs.filter((p) => !p.isPlaceholder && p.kellyLine.trim()).slice(0, 4);
  const activeDomain = domains.find((d) => d.id === tab);

  const markSosDone = useCallback((domainId: string) => {
    setLog((prev) => {
      const completedSosDomains = prev.completedSosDomains.includes(domainId)
        ? prev.completedSosDomains
        : [...prev.completedSosDomains, domainId];
      const next = { ...prev, completedSosDomains };
      saveLog(next);
      return next;
    });
  }, []);

  const markTrapDone = useCallback((pairIndex: number) => {
    setLog((prev) => {
      const trapPairsDone = prev.trapPairsDone.includes(pairIndex)
        ? prev.trapPairsDone
        : [...prev.trapPairsDone, pairIndex];
      const next = { ...prev, trapPairsDone };
      saveLog(next);
      return next;
    });
  }, []);

  return (
    <section className="mb-6 space-y-4">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setTab("trap")}
          className={`rounded-full px-3 py-1.5 text-xs font-bold ${
            tab === "trap" ? "bg-indigo-800 text-white" : "border border-[var(--ep-border)] bg-white"
          }`}
        >
          Trap pivots
        </button>
        {domains.map((d) => (
          <button
            key={d.id}
            type="button"
            onClick={() => setTab(d.id)}
            className={`rounded-full px-3 py-1.5 text-xs font-bold ${
              tab === d.id ? "bg-emerald-800 text-white" : "border border-[var(--ep-border)] bg-white"
            }`}
          >
            SOS · {d.shortLabel}
            {log.completedSosDomains.includes(d.id) ? " ✓" : ""}
          </button>
        ))}
      </div>

      {tab === "trap" ? (
        <article className="ep-card border-indigo-200 bg-indigo-50/25 p-5 text-sm">
          <p className="text-xs font-bold uppercase text-indigo-900">Trap + when-X-say-Y · 60s each</p>
          <p className="mt-2 text-xs text-[var(--ep-navy-muted)]">
            {log.trapPairsDone.length} of {verifiedPairs.length || "—"} pairs signed off · claims-green only
          </p>
          {verifiedPairs.length === 0 ? (
            <p className="mt-3 text-[var(--ep-navy-muted)]">
              Import pairs from Day 5 capitalize sheet — or run trap lanes cold.
            </p>
          ) : (
            <ol className="mt-4 space-y-3">
              {verifiedPairs.map((pair) => (
                <li key={pair.pairIndex} className="rounded-lg border border-[var(--ep-border)] bg-white p-3">
                  <p className="text-[10px] font-bold uppercase text-indigo-800">When {pair.triggerLabel}</p>
                  <p className="mt-1 text-sm text-[var(--ep-navy)]">{pair.kellyLine}</p>
                  <div className="mt-3">
                    <ElectionPlanPracticeCountdown
                      seconds={60}
                      label="Pivot aloud · 60s"
                      onComplete={() => markTrapDone(pair.pairIndex)}
                    />
                  </div>
                </li>
              ))}
            </ol>
          )}
          <Link href={epDebatePrepDayBlockHref("day-5-anticipate-and-capitalize", "b5-lab-review")} className="mt-2 mr-3 inline-block text-xs font-bold text-indigo-900 underline">
            Day 5 · when-X-say-Y sheet →
          </Link>
          <Link href={epDebatePrepDayBlockHref("day-2-read-the-table", "b2-trap1")} className="mt-2 inline-block text-xs font-bold text-indigo-900 underline">
            Day 2 · trap drills →
          </Link>
          <Link href={EP_TRAP_LANES_HREF} className="mt-4 inline-block text-xs font-bold text-indigo-900 underline">
            Trap lanes hub →
          </Link>
        </article>
      ) : activeDomain ? (
        <article className="ep-card border-emerald-200 bg-emerald-50/25 p-5 text-sm">
          <p className="text-xs font-bold uppercase text-emerald-900">
            SOS · {activeDomain.shortLabel} · 90s timed answer
          </p>
          <p className="mt-2 font-semibold text-[var(--ep-navy)]">{activeDomain.moderatorTheme}</p>
          <p className="mt-2 text-[var(--ep-navy-muted)]">{activeDomain.answerSpine}</p>
          <p className="mt-2 text-xs text-[var(--ep-navy-muted)]">Picture {activeDomain.personaSpeakTo}</p>
          <div className="mt-4">
            <ElectionPlanPracticeCountdown
              seconds={90}
              label={`${activeDomain.shortLabel} SOS · 90s hard stop`}
              onComplete={() => markSosDone(activeDomain.id)}
            />
          </div>
          <Link href={activeDomain.href} className="mt-3 inline-block text-xs font-bold text-emerald-900 underline">
            Deep study · {activeDomain.weekImport} →
          </Link>
          <div className="mt-2 flex flex-wrap gap-2">
            {DAY8_DOMAIN_DEEP_STUDY_LINKS[activeDomain.id].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="inline-block rounded border border-emerald-200 bg-white px-2 py-0.5 text-[10px] font-semibold text-emerald-900 hover:bg-emerald-50"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </article>
      ) : null}

      <p className="text-xs text-[var(--ep-navy-muted)]">
        Middle-game exit: all three SOS domains timed ({log.completedSosDomains.length}/3 complete).
      </p>
    </section>
  );
}
