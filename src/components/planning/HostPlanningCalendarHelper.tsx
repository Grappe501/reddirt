"use client";

import { useCallback, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/forms/Textarea";
import { FormLabel } from "@/components/forms/FormLabel";

type AvailabilityPayload = {
  ok: true;
  timezone: string;
  homeBase: { label: string; note: string };
  proposedYmd: string;
  proposed: {
    ymd: string;
    weekdayLabel: string;
    availability: "open" | "busy";
    summary: string;
    events: Array<{ title: string; locationLine: string; href: string }>;
  };
  dayBefore: {
    ymd: string;
    weekdayLabel: string;
    summary: string;
    anchor: string;
    events: Array<{ title: string; locationLine: string; href: string }>;
  };
  dayAfter: {
    ymd: string;
    weekdayLabel: string;
    summary: string;
    anchor: string;
    events: Array<{ title: string; locationLine: string; href: string }>;
  };
};

export function HostPlanningCalendarHelper({
  countyFieldId = "hg-county",
}: {
  /** Optional: read county hint for the planning helper from this input id */
  countyFieldId?: string;
}) {
  const [date, setDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<AvailabilityPayload | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const [aiNotes, setAiNotes] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState<{
    suggestions: Array<{ date: string; reason: string }>;
    caveat: string;
  } | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);

  const loadAvailability = useCallback(async () => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      setFetchError("Choose a full date (year-month-day).");
      setData(null);
      return;
    }
    setFetchError(null);
    setLoading(true);
    try {
      const res = await fetch(`/api/planning/calendar-availability?date=${encodeURIComponent(date)}`);
      const json = (await res.json()) as AvailabilityPayload & { ok?: boolean; error?: string; message?: string };
      if (!res.ok || !json.ok) {
        setData(null);
        setFetchError((json as { message?: string }).message ?? "Could not load calendar.");
        return;
      }
      setData(json as AvailabilityPayload);
    } catch {
      setData(null);
      setFetchError("Network error loading calendar.");
    } finally {
      setLoading(false);
    }
  }, [date]);

  const runAi = useCallback(async () => {
    const notes = aiNotes.trim();
    if (!notes) {
      setAiError("Add a short note (timing, county, audience) so we can suggest dates.");
      return;
    }
    setAiError(null);
    setAiLoading(true);
    setAiResult(null);
    try {
      let countyHint: string | undefined;
      if (typeof document !== "undefined") {
        const el = document.getElementById(countyFieldId) as HTMLInputElement | null;
        const v = el?.value?.trim();
        if (v) countyHint = v;
      }
      const res = await fetch("/api/planning/suggest-dates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes, countyHint }),
      });
      const json = (await res.json()) as {
        ok?: boolean;
        suggestions?: Array<{ date: string; reason: string }>;
        caveat?: string;
        error?: string;
        message?: string;
      };
      if (!res.ok || !json.ok) {
        setAiError(json.message ?? json.error ?? "Could not complete that request.");
        return;
      }
      setAiResult({
        suggestions: json.suggestions ?? [],
        caveat: json.caveat ?? "",
      });
    } catch {
      setAiError("Network error.");
    } finally {
      setAiLoading(false);
    }
  }, [aiNotes, countyFieldId]);

  return (
    <div className="rounded-card border border-kelly-text/12 bg-kelly-text/[0.03] p-5 shadow-[var(--shadow-soft)]">
      <h3 className="font-heading text-lg font-bold text-kelly-text">Plan with the live calendar</h3>
      <p className="mt-2 font-body text-sm leading-relaxed text-kelly-text/75">
        We merge the <strong>public campaign calendar</strong> and on-site movement events (Central Time). If a day has
        no published stops, we treat travel baseline as <strong>Rose Bud, Arkansas</strong>—same as the farm home base on
        the site.
      </p>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="min-w-0 flex-1">
          <FormLabel htmlFor="host-plan-date">Date you have in mind</FormLabel>
          <input
            id="host-plan-date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="mt-1 w-full max-w-xs rounded-btn border border-kelly-text/15 bg-kelly-page px-3 py-2.5 font-body text-sm text-kelly-text shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-kelly-navy"
          />
        </div>
        <Button type="button" variant="outline" onClick={() => void loadAvailability()} disabled={loading || !date}>
          {loading ? "Checking…" : "Check this date"}
        </Button>
      </div>
      {fetchError ? <p className="mt-2 text-sm text-kelly-navy">{fetchError}</p> : null}

      {data ? (
        <div className="mt-5 space-y-4 font-body text-sm text-kelly-text/85">
          <div
            className={
              data.proposed.availability === "open"
                ? "rounded-lg border border-kelly-success/35 bg-kelly-success/10 px-3 py-2"
                : "rounded-lg border border-amber-500/35 bg-amber-50/90 px-3 py-2"
            }
          >
            <p className="font-heading text-sm font-bold text-kelly-text">
              {data.proposed.weekdayLabel} ({data.proposed.ymd}) —{" "}
              {data.proposed.availability === "open" ? "Looks open" : "Busy on public calendar"}
            </p>
            <p className="mt-1 text-kelly-text/80">{data.proposed.summary}</p>
            {data.proposed.events.length > 0 ? (
              <ul className="mt-2 list-inside list-disc text-kelly-text/75">
                {data.proposed.events.map((e) => (
                  <li key={`${e.href}-${e.title}`}>
                    <a href={e.href} className="font-semibold text-kelly-navy underline">
                      {e.title}
                    </a>{" "}
                    — {e.locationLine}
                  </li>
                ))}
              </ul>
            ) : null}
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg border border-kelly-text/10 bg-white/80 px-3 py-2">
              <p className="text-[10px] font-bold uppercase tracking-wider text-kelly-slate/90">Day before</p>
              <p className="mt-1 font-semibold text-kelly-text">
                {data.dayBefore.weekdayLabel} · {data.dayBefore.ymd}
              </p>
              <p className="mt-1 text-kelly-text/75">{data.dayBefore.summary}</p>
            </div>
            <div className="rounded-lg border border-kelly-text/10 bg-white/80 px-3 py-2">
              <p className="text-[10px] font-bold uppercase tracking-wider text-kelly-slate/90">Day after</p>
              <p className="mt-1 font-semibold text-kelly-text">
                {data.dayAfter.weekdayLabel} · {data.dayAfter.ymd}
              </p>
              <p className="mt-1 text-kelly-text/75">{data.dayAfter.summary}</p>
            </div>
          </div>
          <p className="text-xs text-kelly-text/60">
            Time zone: {data.timezone}. This is a planning aid only—staff still confirms against the full schedule.
          </p>
        </div>
      ) : null}

      <div className="mt-8 border-t border-kelly-text/10 pt-6">
        <p className="font-heading text-base font-bold text-kelly-text">Optional: Organizing insights — date ideas</p>
        <p className="mt-1 font-body text-sm text-kelly-text/70">
          Describe what you need (e.g. “weeknight in Garland County in June, 15–25 people”). We send your note plus the
          next ~90 days of busy/open digest to our planning helper—no guarantee, always confirm with the team.
        </p>
        <Textarea
          id="host-plan-helper-notes"
          className="mt-3"
          rows={3}
          value={aiNotes}
          onChange={(e) => setAiNotes(e.target.value)}
          placeholder="e.g. Early June weeknight, Cleburne County, church basement, ~20 guests"
        />
        <Button type="button" variant="outline" className="mt-3" onClick={() => void runAi()} disabled={aiLoading}>
          {aiLoading ? "Thinking…" : "Suggest dates"}
        </Button>
        {aiError ? <p className="mt-2 text-sm text-kelly-navy">{aiError}</p> : null}
        {aiResult ? (
          <div className="mt-4 rounded-lg border border-kelly-text/10 bg-white/90 px-3 py-3">
            {aiResult.suggestions.length === 0 ? (
              <p className="text-sm text-kelly-text/75">No structured suggestions returned—try again or use “Check this date.”</p>
            ) : (
              <ol className="list-decimal space-y-2 pl-5 text-sm text-kelly-text/85">
                {aiResult.suggestions.map((s) => (
                  <li key={s.date}>
                    <span className="font-semibold tabular-nums">{s.date}</span> — {s.reason}
                  </li>
                ))}
              </ol>
            )}
            {aiResult.caveat ? <p className="mt-3 text-xs text-kelly-text/65">{aiResult.caveat}</p> : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}
