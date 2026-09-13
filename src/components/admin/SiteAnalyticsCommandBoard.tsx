"use client";

import { useState } from "react";
import { useActionState } from "react";
import {
  analyzeSiteTrafficAction,
  type SiteAnalyticsActionState,
} from "@/app/admin/site-analytics-actions";
import type { SiteTrafficIntelligence } from "@/lib/analytics/site-traffic-intelligence";
import { TRAFFIC_ANALYSIS_MODES, type TrafficAnalysisMode } from "@/lib/analytics/traffic-analysis-modes";

const initial: SiteAnalyticsActionState = {};

const moodLabel = {
  strong: "Strong",
  steady: "Steady",
  leaking: "Leaking",
  quiet: "Quiet",
} as const;

function formatWhen(iso: string | undefined): string {
  if (!iso) return "";
  return new Date(iso).toLocaleString("en-US", {
    timeZone: "America/Chicago",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function SiteAnalyticsCommandBoard({
  days,
  openaiReady,
  intel,
}: {
  days: 1 | 7 | 30 | 90;
  openaiReady: boolean;
  intel: SiteTrafficIntelligence;
}) {
  const [mode, setMode] = useState<TrafficAnalysisMode>("command");
  const [state, action, pending] = useActionState(analyzeSiteTrafficAction, initial);
  const command = state.command;
  const mood = command?.mood ?? intel.mood;

  return (
    <section className="overflow-hidden rounded-card border border-kelly-navy/20 bg-gradient-to-b from-kelly-navy to-[#13263c] text-white shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4 px-6 pt-6">
        <div>
          <p className="font-body text-[11px] font-bold uppercase tracking-[0.22em] text-kelly-gold">
            Intelligence studio
          </p>
          <h2 className="mt-2 font-heading text-2xl font-bold">Pick a lens. Run the analysis.</h2>
          <p className="mt-2 max-w-3xl font-body text-sm leading-relaxed text-white/80">
            Machine score is always on. OpenAI only runs when you hit the button — choose the question first.
          </p>
        </div>
        <div className="rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-center">
          <p className="font-body text-[10px] font-bold uppercase tracking-wider text-white/60">Site health</p>
          <p className="font-heading text-4xl font-bold text-kelly-gold">{intel.healthScore}</p>
          <p className="font-body text-xs text-white/70">{moodLabel[mood]}</p>
        </div>
      </div>

      <div className="mt-5 grid gap-3 px-6 sm:grid-cols-3">
        <Read label="Trend" value={intel.trendPct == null ? "No prior window" : `${intel.trendPct > 0 ? "+" : ""}${Math.round(intel.trendPct)}%`} />
        <Read
          label="Form finish rate"
          value={intel.formConversionRate == null ? "—" : `${Math.round(intel.formConversionRate * 100)}% of sessions`}
        />
        <Read label="Peak hour" value={intel.peakHourLabel ?? "Waiting on hits"} />
      </div>

      <div className="mt-5 grid gap-3 px-6 sm:grid-cols-2 lg:grid-cols-3">
        {TRAFFIC_ANALYSIS_MODES.map((row) => {
          const selected = mode === row.id;
          return (
            <button
              key={row.id}
              type="button"
              onClick={() => setMode(row.id)}
              className={
                selected
                  ? "rounded-xl border border-kelly-gold bg-white/10 px-4 py-3 text-left"
                  : "rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-left hover:border-white/40"
              }
            >
              <p className="font-heading text-sm font-bold">{row.title}</p>
              <p className="mt-1 font-body text-xs leading-relaxed text-white/70">{row.blurb}</p>
            </button>
          );
        })}
      </div>

      <form action={action} className="mt-5 flex flex-wrap items-center gap-3 px-6">
        <input type="hidden" name="days" value={days} />
        <input type="hidden" name="refresh" value="1" />
        <input type="hidden" name="mode" value={mode} />
        <button
          type="submit"
          disabled={!openaiReady || pending}
          className="rounded-btn bg-kelly-gold px-5 py-2.5 text-sm font-semibold text-kelly-navy disabled:opacity-50"
        >
          {pending ? "Running analysis…" : `Run ${TRAFFIC_ANALYSIS_MODES.find((row) => row.id === mode)?.title ?? "analysis"}`}
        </button>
        <p className="font-body text-xs text-white/60">
          Counts only — no names, emails, or IPs.
          {state.mode ? ` Last run: ${TRAFFIC_ANALYSIS_MODES.find((row) => row.id === state.mode)?.title}.` : " Nothing run yet this session."}
          {state.cached ? " Cached." : ""}
          {state.generatedAt ? ` ${formatWhen(state.generatedAt)} Arkansas time.` : ""}
        </p>
      </form>
      {!openaiReady ? (
        <p className="mt-3 px-6 font-body text-sm text-amber-200">OpenAI is not configured on this server.</p>
      ) : null}
      {state.error ? <p className="mt-3 px-6 font-body text-sm text-red-200">{state.error}</p> : null}

      {command ? (
        <>
          <div className="mt-6 px-6">
            <h3 className="font-heading text-2xl font-bold">{command.headline}</h3>
            <p className="mt-2 max-w-4xl font-body text-sm leading-relaxed text-white/80">{command.situation}</p>
          </div>
          <div className="mt-5 grid gap-px bg-white/10 md:grid-cols-2">
            <BriefBlock title="What is working" rows={command.wins} />
            <BriefBlock
              title="Leaks to fix"
              rows={command.leaks.map((row) => `${row.page} — ${row.problem} Fix: ${row.fix}`)}
            />
            <BriefBlock title="Who is showing up" rows={command.audienceReads} />
            <BriefBlock title="What to share" rows={command.sharePlan} />
            <BriefBlock title="Copy you can paste" rows={command.copyLines} />
            <BriefBlock title="Watch next" rows={command.watchNext} />
          </div>
          {command.tonightMoves.length ? (
            <div className="px-6 py-6">
              <h3 className="font-heading text-lg font-bold">Moves</h3>
              <ol className="mt-3 list-decimal space-y-2 pl-5 font-body text-sm leading-relaxed text-white/85">
                {command.tonightMoves.map((move) => (
                  <li key={move}>{move}</li>
                ))}
              </ol>
            </div>
          ) : null}
        </>
      ) : (
        <p className="px-6 py-6 font-body text-sm text-white/65">
          Machine reads are below. Hit the gold button when you want OpenAI on a specific lens.
        </p>
      )}
    </section>
  );
}

function Read({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/5 px-3 py-2">
      <p className="font-body text-[10px] font-bold uppercase tracking-wider text-white/55">{label}</p>
      <p className="mt-1 font-body text-sm font-semibold text-white">{value}</p>
    </div>
  );
}

function BriefBlock({ title, rows }: { title: string; rows: string[] }) {
  return (
    <div className="bg-[#102033] px-6 py-5">
      <h3 className="font-heading text-base font-bold text-kelly-gold">{title}</h3>
      {rows.length === 0 ? (
        <p className="mt-2 font-body text-sm text-white/55">This lens did not fill this box.</p>
      ) : (
        <ul className="mt-2 space-y-2 font-body text-sm leading-relaxed text-white/85">
          {rows.map((row) => (
            <li key={row}>{row}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
