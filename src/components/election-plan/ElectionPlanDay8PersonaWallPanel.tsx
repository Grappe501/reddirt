"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import { DAY8_ARKANSAS_PEOPLE_FRAME } from "@/lib/election-plan/debate-prep-day8-crash-copy";
import type { Day8SosDomainCard } from "@/lib/election-plan/debate-prep-day8-sos-three-domains";
import { epVoterAudienceProfileHref } from "@/lib/election-plan/debate-prep-links";

const STORAGE_KEY = "kelly-day8-persona-wall-v1";

type PersonaWallState = {
  primaryPersona: string;
  domainPersona: Record<string, string>;
};

function defaultState(domains: readonly Day8SosDomainCard[]): PersonaWallState {
  return {
    primaryPersona: "Marcia T.",
    domainPersona: Object.fromEntries(
      domains.map((d) => [d.id, d.personaSpeakTo.split(" · ")[0] ?? d.personaSpeakTo]),
    ),
  };
}

function loadState(domains: readonly Day8SosDomainCard[]): PersonaWallState {
  if (typeof window === "undefined") return defaultState(domains);
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? { ...defaultState(domains), ...(JSON.parse(raw) as PersonaWallState) } : defaultState(domains);
  } catch {
    return defaultState(domains);
  }
}

function saveState(state: PersonaWallState) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* ignore */
  }
}

export function ElectionPlanDay8PersonaWallPanel({ domains }: { domains: readonly Day8SosDomainCard[] }) {
  const [state, setState] = useState<PersonaWallState>(() => defaultState(domains));

  useEffect(() => {
    setState(loadState(domains));
  }, [domains]);

  const setPrimary = useCallback((name: string) => {
    setState((prev) => {
      const next = { ...prev, primaryPersona: name };
      saveState(next);
      return next;
    });
  }, []);

  const setDomainPersona = useCallback((domainId: string, name: string) => {
    setState((prev) => {
      const next = {
        ...prev,
        domainPersona: { ...prev.domainPersona, [domainId]: name },
      };
      saveState(next);
      return next;
    });
  }, []);

  return (
    <section className="mb-6 space-y-4">
      <p className="rounded-lg border border-emerald-300/60 bg-emerald-50/40 px-3 py-2 text-xs text-emerald-950">
        {DAY8_ARKANSAS_PEOPLE_FRAME}
      </p>

      <article className="ep-card border-emerald-200 bg-emerald-50/25 p-5 text-sm">
        <p className="text-xs font-bold uppercase text-emerald-900">Primary speak-to · opening beat C + closing</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {["Marcia T.", "Carol W.", "Rev. James H."].map((name) => (
            <button
              key={name}
              type="button"
              onClick={() => setPrimary(name)}
              className={`rounded-full px-3 py-1.5 text-xs font-bold ${
                state.primaryPersona === name
                  ? "bg-emerald-800 text-white"
                  : "border border-[var(--ep-border)] bg-white text-[var(--ep-navy-muted)]"
              }`}
            >
              {name}
            </button>
          ))}
        </div>
        <p className="mt-3 text-xs text-[var(--ep-navy-muted)]">
          Locked: picture <strong className="text-[var(--ep-navy)]">{state.primaryPersona}</strong> for Arkansas promise
          and closing invoke.
        </p>
      </article>

      <div className="grid gap-3 sm:grid-cols-3">
        {domains.map((domain) => {
          const options = domain.personaSpeakTo.split(" · ");
          const active = state.domainPersona[domain.id] ?? options[0];
          return (
            <article key={domain.id} className="ep-card border-[var(--ep-border)] p-4 text-sm">
              <p className="text-[10px] font-bold uppercase text-emerald-900">SOS · {domain.shortLabel}</p>
              <p className="mt-2 text-xs text-[var(--ep-navy-muted)]">{domain.voterQuestion}</p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {options.map((name) => (
                  <button
                    key={name}
                    type="button"
                    onClick={() => setDomainPersona(domain.id, name)}
                    className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${
                      active === name
                        ? "bg-emerald-700 text-white"
                        : "border border-[var(--ep-border)] bg-white text-[var(--ep-navy-muted)]"
                    }`}
                  >
                    {name}
                  </button>
                ))}
              </div>
              <p className="mt-3 text-xs font-semibold text-[var(--ep-navy)]">Translation drill</p>
              <p className="mt-1 text-xs text-[var(--ep-navy-muted)]">{domain.answerSpine.slice(0, 120)}…</p>
            </article>
          );
        })}
      </div>

      <Link
        href={epVoterAudienceProfileHref("county-champion")}
        className="inline-block text-xs font-bold text-[var(--ep-gold)] hover:underline"
      >
        Voter audiences hub →
      </Link>
    </section>
  );
}
