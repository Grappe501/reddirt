"use client";

import { useActionState } from "react";
import { analyzeSiteTrafficAction, type SiteAnalyticsActionState } from "@/app/admin/site-analytics-actions";

const initial: SiteAnalyticsActionState = {};

export function SiteAnalyticsAiPanel({ days, openaiReady }: { days: 7 | 30; openaiReady: boolean }) {
  const [state, action, pending] = useActionState(analyzeSiteTrafficAction, initial);

  return (
    <section className="rounded-card border border-kelly-navy/15 bg-white p-6 shadow-sm">
      <h2 className="font-heading text-xl font-bold text-kelly-ink">OpenAI brief</h2>
      <p className="mt-2 font-body text-sm leading-relaxed text-kelly-slate">
        Sends counts only — pages, sessions, and paths. No names, emails, or IP addresses.
      </p>
      <form action={action} className="mt-4">
        <input type="hidden" name="days" value={days} />
        <button
          type="submit"
          disabled={!openaiReady || pending}
          className="rounded-btn bg-kelly-navy px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
        >
          {pending ? "Reading the numbers…" : "Ask OpenAI what to improve"}
        </button>
      </form>
      {!openaiReady ? (
        <p className="mt-3 font-body text-sm text-amber-800">OpenAI is not configured on this server.</p>
      ) : null}
      {state.error ? <p className="mt-3 font-body text-sm text-red-800">{state.error}</p> : null}
      {state.summary ? (
        <div className="mt-5 space-y-3">
          <p className="font-body text-base leading-relaxed text-kelly-ink">{state.summary}</p>
          {state.moves?.length ? (
            <ol className="list-decimal space-y-2 pl-5 font-body text-sm leading-relaxed text-kelly-slate">
              {state.moves.map((move) => (
                <li key={move}>{move}</li>
              ))}
            </ol>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
