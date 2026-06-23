"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState, type FormEvent } from "react";

import { cityLocationBriefHref } from "@/lib/election-plan/location-links";
import {
  filterPriorityCitySuggestions,
  matchPriorityCities,
  type PriorityCitySearchRow,
} from "@/lib/election-plan/match-priority-city";

type Props = {
  cities: PriorityCitySearchRow[];
};

type FeedbackState =
  | { status: "idle" }
  | { status: "asking"; query: string }
  | { status: "submitting"; query: string; wantSpecialKpiProfile: boolean }
  | { status: "sent"; query: string; wantSpecialKpiProfile: boolean }
  | { status: "error"; query: string; message: string };

export function PriorityCitySearchBar({ cities }: Props) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [choices, setChoices] = useState<PriorityCitySearchRow[] | null>(null);
  const [feedback, setFeedback] = useState<FeedbackState>({ status: "idle" });

  const suggestions = useMemo(
    () => filterPriorityCitySuggestions(query, cities, 6),
    [cities, query],
  );

  const goToCity = useCallback(
    (city: PriorityCitySearchRow) => {
      setChoices(null);
      setFeedback({ status: "idle" });
      router.push(cityLocationBriefHref(city.slug));
    },
    [router],
  );

  const resolveQuery = useCallback(
    (raw: string) => {
      const outcome = matchPriorityCities(raw, cities);
      if (outcome.kind === "empty") {
        setChoices(null);
        setFeedback({ status: "idle" });
        return;
      }
      if (outcome.kind === "exact") {
        goToCity(outcome.city);
        return;
      }
      if (outcome.kind === "choices") {
        setChoices(outcome.matches.map((row) => row.city));
        setFeedback({ status: "idle" });
        return;
      }
      setChoices(null);
      setFeedback({ status: "asking", query: outcome.query });
    },
    [cities, goToCity],
  );

  const onSubmit = useCallback(
    (e: FormEvent) => {
      e.preventDefault();
      resolveQuery(query);
    },
    [query, resolveQuery],
  );

  async function submitProfileRequest(wantSpecialKpiProfile: boolean, note?: string) {
    if (feedback.status !== "asking") return;
    const cityName = feedback.query;
    setFeedback({ status: "submitting", query: cityName, wantSpecialKpiProfile });
    try {
      const res = await fetch("/api/election-plan/city-profile-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cityName,
          wantSpecialKpiProfile,
          note: note?.trim() || undefined,
        }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !data.ok) {
        throw new Error(data.error ?? "Could not send request");
      }
      setFeedback({ status: "sent", query: cityName, wantSpecialKpiProfile });
      setQuery("");
    } catch (err) {
      setFeedback({
        status: "error",
        query: cityName,
        message: err instanceof Error ? err.message : "Could not send request",
      });
    }
  }

  return (
    <section className="ep-card mb-8 border-l-4 border-[var(--ep-gold)]">
      <h2 className="font-heading text-lg font-bold text-[var(--ep-navy)]">Jump to a city</h2>
      <p className="mt-1 text-sm text-[var(--ep-navy-muted)]">
        Type a town name to open its location brief. All 175 priority cities are here
        {cities.some((c) => c.isBonusCity) ? " — plus bonus cushion towns" : ""}
        when we already have a profile.
      </p>

      <form onSubmit={onSubmit} className="mt-4" role="search">
        <label htmlFor="priority-city-search" className="sr-only">
          What city?
        </label>
        <p className="mb-2 text-xs font-bold uppercase tracking-wide text-[var(--ep-navy-muted)]">What city?</p>
        <div className="flex overflow-hidden rounded-lg border border-[var(--ep-border)] bg-white shadow-sm ring-1 ring-[var(--ep-gold)]/25">
          <input
            id="priority-city-search"
            type="search"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setChoices(null);
              if (feedback.status !== "idle" && feedback.status !== "asking") {
                setFeedback({ status: "idle" });
              }
            }}
            placeholder="e.g. Little Rock, Fayetteville, Quitman…"
            className="min-w-0 flex-1 px-4 py-3.5 text-base text-[var(--ep-navy)] placeholder:text-[var(--ep-navy-muted)] focus:outline-none"
            autoComplete="off"
          />
          <button
            type="submit"
            className="shrink-0 bg-[var(--ep-navy)] px-6 py-3.5 text-sm font-bold uppercase tracking-wide text-white hover:bg-[var(--ep-navy)]/90"
          >
            Go
          </button>
        </div>
      </form>

      {suggestions.length > 0 && !choices ? (
        <ul className="mt-3 divide-y divide-[var(--ep-border)] rounded-lg border border-[var(--ep-border)] bg-white">
          {suggestions.map(({ city }) => (
            <li key={city.slug}>
              <button
                type="button"
                onClick={() => goToCity(city)}
                className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-sm hover:bg-[var(--ep-cream)]"
              >
                <span>
                  <span className="font-semibold text-[var(--ep-navy)]">{city.name}</span>
                  <span className="text-[var(--ep-navy-muted)]"> · {city.county} County</span>
                  {city.isBonusCity ? (
                    <span className="ml-2 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold uppercase text-emerald-900">
                      Bonus
                    </span>
                  ) : null}
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wide text-[var(--ep-gold)]">Open brief →</span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      {choices && choices.length > 0 ? (
        <div className="mt-4 rounded-lg border border-[var(--ep-border)] bg-[var(--ep-cream)]/60 p-4">
          <p className="text-sm font-semibold text-[var(--ep-navy)]">Which city did you mean?</p>
          <ul className="mt-3 space-y-2">
            {choices.map((city) => (
              <li key={city.slug}>
                <button
                  type="button"
                  onClick={() => goToCity(city)}
                  className="ep-card block w-full px-4 py-3 text-left text-sm transition hover:ring-2 hover:ring-[var(--ep-gold-soft)]"
                >
                  <span className="font-semibold text-[var(--ep-navy)]">{city.name}</span>
                  <span className="text-[var(--ep-navy-muted)]"> · {city.county} County</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {feedback.status === "asking" ? (
        <CityProfileRequestPanel
          cityName={feedback.query}
          onYes={(note) => void submitProfileRequest(true, note)}
          onNotNow={() => void submitProfileRequest(false)}
          onDismiss={() => setFeedback({ status: "idle" })}
        />
      ) : null}

      {feedback.status === "submitting" ? (
        <p className="mt-4 text-sm text-[var(--ep-navy-muted)]">Sending your note to the field team…</p>
      ) : null}

      {feedback.status === "sent" ? (
        <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-950">
          {feedback.wantSpecialKpiProfile ? (
            <p>
              Thanks — we logged <strong>{feedback.query}</strong> for a possible Special KPI town profile. Field
              staff will review and follow up.
            </p>
          ) : (
            <p>Got it — we noted that {feedback.query} is not a priority right now.</p>
          )}
        </div>
      ) : null}

      {feedback.status === "error" ? (
        <div className="mt-4 rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-950">
          <p>{feedback.message}</p>
          <button
            type="button"
            onClick={() => setFeedback({ status: "asking", query: feedback.query })}
            className="mt-2 font-semibold underline"
          >
            Try again
          </button>
        </div>
      ) : null}
    </section>
  );
}

function CityProfileRequestPanel({
  cityName,
  onYes,
  onNotNow,
  onDismiss,
}: {
  cityName: string;
  onYes: (note?: string) => void;
  onNotNow: () => void;
  onDismiss: () => void;
}) {
  const [note, setNote] = useState("");

  return (
    <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-4">
      <p className="text-sm font-semibold text-amber-950">
        We don&apos;t have <strong>{cityName}</strong> in the Top 175 priority cities yet.
      </p>
      <p className="mt-2 text-sm leading-relaxed text-amber-950/90">
        Should we build a profile for this town under{" "}
        <Link href="/election-plan/cities/quitman" className="font-semibold underline">
          Special KPI
        </Link>
        ? That flags it for field staff — same track as bonus towns like Quitman when Kelly wants extra lift.
      </p>
      <label className="mt-3 block text-xs font-bold uppercase tracking-wide text-amber-900">
        Optional context for staff
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={2}
          maxLength={500}
          placeholder="Why this town matters — event, family ties, local ask…"
          className="mt-1 w-full rounded-md border border-amber-200 bg-white px-3 py-2 text-sm font-normal normal-case text-[var(--ep-navy)] placeholder:text-[var(--ep-navy-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--ep-gold)]/40"
        />
      </label>
      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => onYes(note)}
          className="rounded-md bg-[var(--ep-navy)] px-4 py-2 text-xs font-bold uppercase tracking-wide text-white hover:bg-[var(--ep-navy)]/90"
        >
          Yes — build Special KPI profile
        </button>
        <button
          type="button"
          onClick={onNotNow}
          className="rounded-md border border-amber-300 bg-white px-4 py-2 text-xs font-bold uppercase tracking-wide text-amber-950 hover:bg-amber-100"
        >
          Not right now
        </button>
        <button type="button" onClick={onDismiss} className="px-2 py-2 text-xs font-semibold text-amber-900 underline">
          Keep browsing list
        </button>
      </div>
    </div>
  );
}
