import type { KellyWinTargetScenarioFile } from "@/lib/election-targets/win-target-types";

export function WinTargetHud({ scenario }: { scenario: KellyWinTargetScenarioFile | null }) {
  if (!scenario) {
    return (
      <div className="rounded-xl border border-amber-800/40 bg-amber-950/20 px-4 py-3 font-body text-xs text-amber-100">
        <p className="font-heading text-[10px] font-bold uppercase tracking-[0.2em] text-amber-200/80">Win target model</p>
        <p className="mt-1 text-amber-50/90">
          Scenario file not found. From <code className="rounded bg-black/30 px-1">RedDirt/</code> run{" "}
          <code className="rounded bg-black/30 px-1">npm run election:targets:build</code> to generate{" "}
          <code className="rounded bg-black/30 px-1">data/election/kelly-win-target-scenario-v1.json</code>.
        </p>
      </div>
    );
  }

  const { statewide } = scenario;
  const pctToward = statewide.projectedStatewideVotes
    ? Math.min(100, Math.round((statewide.statewideBaselineVotes / statewide.projectedStatewideVotes) * 100))
    : 0;
  const cushionPctLabel = `${(scenario.config.cushionPct * 100).toFixed(2)}%`;

  return (
    <div className="rounded-xl border border-emerald-500/25 bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950 px-4 py-3 text-zinc-50 shadow-lg shadow-black/30">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="font-heading text-[10px] font-bold uppercase tracking-[0.24em] text-emerald-300/80">Statewide vote target</p>
          <p className="mt-1 font-mono text-[11px] text-zinc-400">
            Projected turnout Σ counties · scenario only · cushion {cushionPctLabel} · midterm factor{" "}
            {scenario.config.midtermDropoffFactor}
          </p>
        </div>
        <div className="flex flex-wrap gap-4 font-mono text-xs tabular-nums">
          <div>
            <p className="text-[9px] font-bold uppercase tracking-wide text-zinc-500">Proj. votes</p>
            <p className="text-base font-bold text-white">{statewide.projectedStatewideVotes.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-[9px] font-bold uppercase tracking-wide text-zinc-500">50% + 1</p>
            <p className="text-base font-bold text-emerald-300">{statewide.legalTarget50Plus1.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-[9px] font-bold uppercase tracking-wide text-zinc-500">Working + cushion</p>
            <p className="text-base font-bold text-sky-200">{statewide.workingTargetWithCushion.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-[9px] font-bold uppercase tracking-wide text-zinc-500">Baseline Dem Σ</p>
            <p className="text-base font-bold text-zinc-200">{statewide.statewideBaselineVotes.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-[9px] font-bold uppercase tracking-wide text-zinc-500">Gap</p>
            <p className={`text-base font-bold ${statewide.statewideVoteGap > 0 ? "text-amber-300" : "text-emerald-200"}`}>
              {statewide.statewideVoteGap > 0 ? "+" : ""}
              {statewide.statewideVoteGap.toLocaleString()}
            </p>
          </div>
        </div>
      </div>
      <div className="mt-3">
        <div className="flex items-center justify-between text-[9px] uppercase tracking-wide text-zinc-500">
          <span>Baseline share of projected turnout</span>
          <span>{pctToward}%</span>
        </div>
        <div className="mt-1 h-2 overflow-hidden rounded-full bg-zinc-800">
          <div
            className="h-full rounded-full bg-gradient-to-r from-emerald-600 to-sky-500"
            style={{ width: `${Math.min(100, pctToward)}%` }}
          />
        </div>
      </div>
    </div>
  );
}

export function WinTargetCountyCards({
  scenario,
  priorities,
}: {
  scenario: KellyWinTargetScenarioFile | null;
  priorities: { county: string; pastTouchesSinceNov1: number; nextScheduledAnchor?: string }[];
}) {
  if (!scenario) return null;
  const pri = new Map(priorities.map((p) => [p.county, p]));
  const top = [...scenario.counties].sort((a, b) => b.targetVoteGain - a.targetVoteGain).slice(0, 8);
  return (
    <div className="rounded-lg border border-kelly-text/12 bg-white/95 px-3 py-3 shadow-sm">
      <p className="font-heading text-[10px] font-bold uppercase tracking-wide text-kelly-text/45">County targets (top gain)</p>
      <ul className="mt-2 divide-y divide-kelly-text/10">
        {top.map((c) => {
          const p = pri.get(c.county);
          return (
            <li key={c.county} className="flex flex-wrap items-start justify-between gap-2 py-2 font-body text-[11px] text-kelly-text/85">
              <div>
                <p className="font-bold text-kelly-text">{c.county}</p>
                <p className="text-kelly-text/60">
                  Gain {c.targetVoteGain.toLocaleString()} · cap {c.countyCapacityScore.toFixed(2)} · {c.confidence}{" "}
                  {c.missingData.length ? `· flags ${c.missingData.length}` : ""}
                </p>
                <p className="mt-0.5 text-[10px] text-kelly-text/55">
                  Touches Nov 1→ {p?.pastTouchesSinceNov1 ?? "—"} · Next {p?.nextScheduledAnchor ? p.nextScheduledAnchor.slice(0, 42) : "—"}
                </p>
              </div>
              <span className="rounded-full border border-kelly-text/15 bg-kelly-wash px-2 py-0.5 text-[9px] font-bold uppercase text-kelly-text/70">
                {c.dashboardLabel.replace(/_/g, " ")}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
