"use client";

import { useEffect, useMemo, useState } from "react";
import { ALTERNATIVE_FUTURES } from "@/lib/agents/decision-simulation/alternative-futures/contracts";
import {
  OUTCOME_LIBRARY_KEY,
  SCENARIO_LIBRARY_KEY,
  duplicateScenario,
  upsertOutcome,
  upsertScenario,
  type ObservedOutcome,
  type SavedScenario,
} from "@/lib/agents/decision-simulation/dashboard-intelligence";
import type { DashboardIntelligencePayload } from "@/lib/agents/decision-simulation/dashboard-intelligence";

type Props = {
  jobId?: string;
  opening: string;
  channel: string;
  objective: string;
  context: string;
  operatorId: string;
  counterpartyId: string;
  dashboard: DashboardIntelligencePayload | null;
  onApplyOpening: (text: string) => void;
  onLoadScenario: (scenario: SavedScenario) => void;
};

function loadJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function pct(value?: number | null) {
  return typeof value === "number" ? `${Math.round(value * 100)}%` : "—";
}

function futureLabel(id: string) {
  return ALTERNATIVE_FUTURES.find((item) => item.id === id)?.label ?? id;
}

export function DecisionIntelligence({
  jobId,
  opening,
  channel,
  objective,
  context,
  operatorId,
  counterpartyId,
  dashboard,
  onApplyOpening,
  onLoadScenario,
}: Props) {
  const [scenarios, setScenarios] = useState<SavedScenario[]>([]);
  const [outcomes, setOutcomes] = useState<ObservedOutcome[]>([]);
  const [branchId, setBranchId] = useState("EXPECTED");
  const [compareA, setCompareA] = useState("");
  const [compareB, setCompareB] = useState("");
  const [actualResponse, setActualResponse] = useState("");
  const [closestFuture, setClosestFuture] = useState("EXPECTED");
  const [outcomeNotes, setOutcomeNotes] = useState("");
  const [scenarioTitle, setScenarioTitle] = useState("");

  useEffect(() => {
    setScenarios(loadJson<SavedScenario[]>(SCENARIO_LIBRARY_KEY, []));
    setOutcomes(loadJson<ObservedOutcome[]>(OUTCOME_LIBRARY_KEY, []));
  }, []);

  useEffect(() => {
    if (dashboard?.branches.some((lane) => lane.futureId === "EXPECTED" && lane.moves.length)) {
      setBranchId("EXPECTED");
    }
  }, [dashboard]);

  const selectedBranch = dashboard?.branches.find((lane) => lane.futureId === branchId);
  const selectedFuture = ALTERNATIVE_FUTURES.find((item) => item.id === branchId);
  const outcome = outcomes.find((item) => item.jobId === jobId);
  const left = scenarios.find((item) => item.id === compareA);
  const right = scenarios.find((item) => item.id === compareB);

  const evidence = useMemo(
    () => [
      "Personality sources stay on the left dossier. This drawer does not invent votes or private statements.",
      "Hill legislative vote corpus is MISSING unless a first-party tracker is later attached.",
      "Unknown headers, venues, and recipients stay unknown.",
      "A generated six-move sequence is not evidence about a real person.",
    ],
    [],
  );

  function persistScenarios(next: SavedScenario[]) {
    setScenarios(next);
    window.localStorage.setItem(SCENARIO_LIBRARY_KEY, JSON.stringify(next));
  }

  function persistOutcomes(next: ObservedOutcome[]) {
    setOutcomes(next);
    window.localStorage.setItem(OUTCOME_LIBRARY_KEY, JSON.stringify(next));
  }

  function saveScenario() {
    const title = scenarioTitle.trim() || `${channel} opening ${new Date().toISOString().slice(0, 16)}`;
    persistScenarios(
      upsertScenario(scenarios, {
        id: `scenario-${Date.now()}`,
        title,
        savedAt: new Date().toISOString(),
        opening,
        channel,
        objective,
        context,
        operatorId,
        counterpartyId,
        jobId,
        dominantFrame: dashboard?.dominantFrame ?? null,
        robustnessScore: dashboard?.scorecard?.scores.find((score) => score.id === "ROBUSTNESS")?.value ?? null,
      }),
    );
    setScenarioTitle("");
  }

  function saveOutcome() {
    if (!jobId) return;
    persistOutcomes(
      upsertOutcome(outcomes, {
        jobId,
        recordedAt: new Date().toISOString(),
        actualResponse: actualResponse.trim(),
        closestFuture,
        notes: outcomeNotes.trim(),
        predictedFrame: dashboard?.branches.find((lane) => lane.futureId === closestFuture)?.frame ?? null,
      }),
    );
  }

  return (
    <div>
      <h2 className="ml-h">05 Dashboard intelligence</h2>
      <p className="ml-copy">
        Capability started. Advisory only. Recommended language is a HYPOTHESIS draft. Nothing is sent. Outcome notes do not rewrite actor models.
      </p>

      {dashboard?.scorecard && (
        <div className="ml-sec">
          <h3>E. Scorecard</h3>
          <div className="ml-stats">
            {dashboard.scorecard.scores.map((score) => (
              <div key={score.id} className="ml-stat">
                <b>{pct(score.value)}</b>
                <span>{score.label}</span>
                <p className="ml-copy" style={{ marginTop: 8 }}>{score.methodology}</p>
              </div>
            ))}
          </div>
          <p className="ml-copy">{dashboard.scorecard.whyPreferred}</p>
          <ul className="ml-sources">
            {dashboard.scorecard.uncertainty.map((item) => <li key={item}>{item}</li>)}
          </ul>
        </div>
      )}

      <div className="ml-sec">
        <h3>F. Six-move sequence</h3>
        <p className="ml-copy">EXPECTED lane when present. Opening is move 0. Generated moves stay labeled generated.</p>
        <div className="ml-ply">
          {(dashboard?.sequence ?? []).map((move) => (
            <article key={`${move.moveNumber}-${move.side}`} className={`ml-ply-item ${move.side === "OPERATOR" ? "operator" : "counter"}`}>
              <header>
                <b>{move.moveNumber === 0 ? "Move 0 · Opening" : `Move ${move.moveNumber}`}</b>
                <span>{move.side}{move.predictedFrame ? ` · ${move.predictedFrame}` : ""}</span>
              </header>
              <p>{move.message || "—"}</p>
            </article>
          ))}
          {!dashboard?.sequence.length && <div className="ml-empty">No sequence yet. A completed run with moves is required.</div>}
        </div>
      </div>

      <div className="ml-sec">
        <h3>G. Branch explorer</h3>
        <div className="ml-branches">
          {ALTERNATIVE_FUTURES.map((future) => {
            const lane = dashboard?.branches.find((item) => item.futureId === future.id);
            return (
              <button
                key={future.id}
                type="button"
                className={`ml-branch${branchId === future.id ? " on" : ""}`}
                onClick={() => setBranchId(future.id)}
              >
                <b>{future.label}</b>
                <small>{lane?.frame ?? "No run yet"}</small>
              </button>
            );
          })}
        </div>
        {selectedFuture && (
          <div className="ml-actor">
            <b>Assumptions · {selectedFuture.label}</b>
            <ul className="ml-sources">
              {selectedFuture.assumptions.map((item) => <li key={item}>{item}</li>)}
            </ul>
            <p>{selectedFuture.operatorNote}</p>
            {selectedBranch?.moves.length ? (
              <p>Run #{selectedBranch.ordinal} · first response {selectedBranch.frame ?? "Unspecified"}</p>
            ) : (
              <p>This future has no completed run in the current job.</p>
            )}
          </div>
        )}
      </div>

      <div className="ml-sec">
        <h3>H. Evidence drawer</h3>
        <ul className="ml-sources">
          {evidence.map((item) => <li key={item}>{item}</li>)}
        </ul>
      </div>

      {dashboard?.revision && (
        <div className="ml-sec">
          <h3>I. Recommended opening revision</h3>
          <span className="ml-badge">{dashboard.revision.sourceState}</span>
          <p className="ml-copy">{dashboard.revision.rationale}</p>
          <pre className="ml-revision">{dashboard.revision.text}</pre>
          <button type="button" className="ml-ghost" onClick={() => onApplyOpening(dashboard.revision.text)}>
            Apply draft to opening
          </button>
        </div>
      )}

      <div className="ml-sec">
        <h3>J. Save / duplicate / rerun</h3>
        <label className="ml-label">Scenario title
          <input className="ml-input" value={scenarioTitle} onChange={(e) => setScenarioTitle(e.target.value)} placeholder="Housing email A" />
        </label>
        <div className="ml-row" style={{ marginTop: 10 }}>
          <button type="button" className="ml-ghost" onClick={saveScenario}>Save opening</button>
          <button type="button" className="ml-ghost" disabled={!scenarios[0]} onClick={() => persistScenarios(upsertScenario(scenarios, duplicateScenario(scenarios[0])))}>
            Duplicate latest
          </button>
        </div>
        <div className="ml-list">
          {scenarios.map((scenario) => (
            <div key={scenario.id}>
              <span>{scenario.title}</span>
              <button type="button" className="ml-ghost" onClick={() => onLoadScenario(scenario)}>Load to rerun</button>
            </div>
          ))}
        </div>
      </div>

      <div className="ml-sec">
        <h3>K. Compare saved openings</h3>
        <p className="ml-copy">Side-by-side scorecards only. Ranking three openings is filed as V2, not this slice.</p>
        <div className="ml-row">
          <label className="ml-label">Scenario A
            <select className="ml-select" value={compareA} onChange={(e) => setCompareA(e.target.value)}>
              <option value="">Select</option>
              {scenarios.map((scenario) => <option key={scenario.id} value={scenario.id}>{scenario.title}</option>)}
            </select>
          </label>
          <label className="ml-label">Scenario B
            <select className="ml-select" value={compareB} onChange={(e) => setCompareB(e.target.value)}>
              <option value="">Select</option>
              {scenarios.map((scenario) => <option key={scenario.id} value={scenario.id}>{scenario.title}</option>)}
            </select>
          </label>
        </div>
        {left && right && (
          <div className="ml-stats">
            <div className="ml-stat"><b>{left.title}</b><span>Robustness {pct(left.robustnessScore)}</span></div>
            <div className="ml-stat"><b>{right.title}</b><span>Robustness {pct(right.robustnessScore)}</span></div>
          </div>
        )}
      </div>

      <div className="ml-sec">
        <h3>L. Actual outcome</h3>
        <p className="ml-copy">
          Attach what actually happened. This does not update actor models and does not write back into prompts. Phase 10 learning is a later slice.
        </p>
        <label className="ml-label">Observed public response
          <textarea className="ml-area" style={{ minHeight: 90 }} value={actualResponse} onChange={(e) => setActualResponse(e.target.value)} placeholder="Paste the real reply or public statement. No private data." />
        </label>
        <label className="ml-label">Closest future
          <select className="ml-select" value={closestFuture} onChange={(e) => setClosestFuture(e.target.value)}>
            {ALTERNATIVE_FUTURES.map((future) => <option key={future.id} value={future.id}>{future.label}</option>)}
          </select>
        </label>
        <label className="ml-label">Notes
          <textarea className="ml-area" style={{ minHeight: 70 }} value={outcomeNotes} onChange={(e) => setOutcomeNotes(e.target.value)} />
        </label>
        <button type="button" className="ml-ghost" disabled={!jobId} onClick={saveOutcome}>Attach outcome to this job</button>
        {outcome && (
          <p className="ml-copy">Attached {outcome.recordedAt.slice(0, 16)} · closest {futureLabel(outcome.closestFuture)} · actor models unchanged</p>
        )}
      </div>
    </div>
  );
}
