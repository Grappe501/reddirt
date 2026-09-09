"use client";

import { useEffect, useMemo, useState } from "react";
import { depthLabel } from "@/lib/agents/decision-simulation/queue-config";
import { estimateDecisionSimulationCost, formatUsd } from "@/lib/agents/decision-simulation/cost-estimate";
import {
  BUILT_IN_PERSONALITIES,
  type CatalogPersonality,
  genericPersonality,
  mergePersonalityCatalog,
  personalityToOpeningActor,
} from "@/lib/agents/decision-simulation/personality-catalog";
import type { DecisionSimulationChannel } from "@/lib/agents/decision-simulation/contracts";
import {
  CHANNEL_INTAKE_FIELDS,
  composeCorrespondenceOpening,
  parseCorrespondencePaste,
  type IntakeFieldKey,
} from "@/lib/agents/decision-simulation/correspondence-intake";
import {
  PRIOR_CORRESPONDENCE_LIBRARY_KEY,
  attachPriorCorrespondence,
  type PriorCorrespondenceAttachment,
} from "@/lib/agents/decision-simulation/evidence-provenance";
import { PersonalityIntelligence } from "./PersonalityIntelligence";
import { DecisionIntelligence } from "./DecisionIntelligence";
import type { DashboardIntelligencePayload, SavedScenario } from "@/lib/agents/decision-simulation/dashboard-intelligence";
import "./mission-lab.css";

type RunPreset = 1 | 10 | 100 | 1000;
type Move = {
  moveNumber: number;
  side: "OPERATOR" | "COUNTERPARTY" | string;
  message: string;
  predictedFrame?: string;
  rationaleSummary?: string;
  confidence?: { estimatedProbability?: number };
};
type Member = {
  ordinal: number;
  frame?: string;
  final?: string;
  confidence?: number | null;
  executiveSummary?: string;
  error?: string;
  moves?: Move[];
  result?: { run: { moves: Move[] }; executiveSummary?: string };
};
type JobView = {
  id: string;
  status: string;
  requested: number;
  completed: number;
  failed: number;
  percentComplete: number;
  currentChunk: number;
  chunkCount: number;
  tokenUsage: { inputTokens: number; outputTokens: number; totalTokens: number };
  architectureOnly?: boolean;
  commandCenter?: {
    simulations: number;
    dominantResponseFrame: string | null;
    dominantResponseShare: number | null;
    strongestRecommendedCounter: string | null;
    strongestRecommendedShare: number | null;
    modelConfidence: number | null;
    outlierRate: number | null;
    frameDistribution: Array<{ frame: string; count: number; share?: number }>;
    moveConsensus: Array<{ moveNumber: number; topPredicted: string[]; topCounters: string[] }>;
    robustness?: {
      futuresWithRuns: number;
      requiredFutures: number;
      coverage: number;
      robustnessScore: number | null;
      crossFutureFrameAgreement: number | null;
      methodology: string;
      lanes: Array<{
        futureId: string;
        label: string;
        runCount: number;
        modalFrame: string | null;
        modalShare?: number | null;
        representativeIsModal?: boolean;
      }>;
    };
    representative: {
      expected: Member | null;
      highConfidence: Member | null;
      hostileOutlier: Member | null;
      opportunity: Member | null;
      escalation?: Member | null;
      unusual: Member | null;
      silence?: Member | null;
    };
    uncertainty: string[];
  } | null;
  members?: Member[];
  opening?: string;
  dashboard?: DashboardIntelligencePayload | null;
};
type EnsembleResult = {
  completedRuns: number;
  failedRuns: number;
  members: Member[];
  dominantMove1Frames: Array<{ frame: string; count: number; share: number }>;
  dominantFinalRecommendations: Array<{ recommendation: string; count: number; share: number }>;
  averageConfidence?: number;
  tokenUsage: { inputTokens: number; outputTokens: number; totalTokens: number };
  representativeRuns: Array<{ ordinal: number; reason: string }>;
};
type ApiResponse = {
  ok: boolean;
  error?: string;
  job?: JobView;
  result?: EnsembleResult;
};

const PRESETS: RunPreset[] = [1, 10, 100, 1000];
const CHANNELS: DecisionSimulationChannel[] = [
  "EMAIL",
  "SOCIAL",
  "SMS",
  "PRESS_STATEMENT",
  "PUBLIC_STATEMENT",
  "FUNDRAISING",
  "DEBATE",
  "SPEECH",
  "MEMO",
  "STRATEGIC_DECISION",
  "CUSTOM",
];
const CUSTOM_KEY = "dec-sim-custom-personalities-v1";
const DEPTH_META: Record<RunPreset, { title: string; hint: string }> = {
  1: { title: "Quick look", hint: "Immediate" },
  10: { title: "Six futures", hint: "Immediate" },
  100: { title: "Ensemble", hint: "Queued analysis" },
  1000: { title: "Deep ensemble", hint: "Deep ensemble" },
};

function pct(value?: number | null) {
  return typeof value === "number" ? `${Math.round(value * 100)}%` : "—";
}

function loadCustom(): CatalogPersonality[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(CUSTOM_KEY);
    return raw ? (JSON.parse(raw) as CatalogPersonality[]) : [];
  } catch {
    return [];
  }
}

export function DecisionSimulatorClient() {
  const [custom, setCustom] = useState<CatalogPersonality[]>([]);
  const [message, setMessage] = useState("");
  const [objective, setObjective] = useState("");
  const [context, setContext] = useState("");
  const [channel, setChannel] = useState<DecisionSimulationChannel>("EMAIL");
  const [intakeFields, setIntakeFields] = useState<Partial<Record<IntakeFieldKey, string>>>({});
  const [stakes, setStakes] = useState<"LOW" | "MEDIUM" | "HIGH" | "CRITICAL">("HIGH");
  const [urgency, setUrgency] = useState<"LOW" | "MEDIUM" | "HIGH">("MEDIUM");
  const [runs, setRuns] = useState<number>(10);
  const [customRuns, setCustomRuns] = useState("1000");
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<ApiResponse | null>(null);
  const [job, setJob] = useState<JobView | null>(null);
  const [confirmExpensive, setConfirmExpensive] = useState(false);
  const [confirmThousand, setConfirmThousand] = useState(false);
  const [operatorId, setOperatorId] = useState("chris-jones-ar02");
  const [counterpartyId, setCounterpartyId] = useState("french-hill-ar02");
  const [adding, setAdding] = useState(false);
  const [draftName, setDraftName] = useState("");
  const [draftOffice, setDraftOffice] = useState("");
  const [draftNotes, setDraftNotes] = useState("");
  const [draftSource, setDraftSource] = useState("");
  const [priorCorrespondence, setPriorCorrespondence] = useState<PriorCorrespondenceAttachment[]>([]);
  const [priorDraft, setPriorDraft] = useState("");
  const [priorTitle, setPriorTitle] = useState("");

  useEffect(() => setCustom(loadCustom()), []);
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(PRIOR_CORRESPONDENCE_LIBRARY_KEY);
      if (raw) setPriorCorrespondence(JSON.parse(raw) as PriorCorrespondenceAttachment[]);
    } catch {
      /* keep empty */
    }
  }, []);

  const catalog = useMemo(() => mergePersonalityCatalog(custom), [custom]);
  const operator = catalog.find((item) => item.id === operatorId) ?? genericPersonality;
  const counterparty = catalog.find((item) => item.id === counterpartyId) ?? genericPersonality;
  const depth = depthLabel(runs);
  const estimate = useMemo(() => estimateDecisionSimulationCost(runs, 2), [runs]);
  const activeJob = job && ["QUEUED", "RUNNING", "PARTIAL"].includes(job.status);

  useEffect(() => {
    if (!job?.id || !["QUEUED", "RUNNING", "PARTIAL"].includes(job.status)) return undefined;
    let cancelled = false;
    const tick = async () => {
      try {
        const res = await fetch(`/api/admin/decision-simulator/jobs/${job.id}`);
        const data = (await res.json()) as { job?: JobView };
        if (!cancelled && data.job) {
          setJob(data.job);
          setResponse((prev) => ({ ...(prev ?? { ok: true }), ok: true, job: data.job }));
        }
      } catch {
        /* keep last known */
      }
    };
    const timer = window.setInterval(() => void tick(), 2500);
    void tick();
    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [job?.id, job?.status]);

  function persistCustom(next: CatalogPersonality[]) {
    setCustom(next);
    window.localStorage.setItem(CUSTOM_KEY, JSON.stringify(next));
  }

  function addPersonality() {
    const name = draftName.trim();
    if (!name) return;
    const id = `custom-${Date.now()}`;
    const entry: CatalogPersonality = {
      ...genericPersonality,
      id,
      name,
      shortName: name,
      office: draftOffice.trim() || "Operator-added personality",
      custom: true,
      badge: "CUSTOM MODEL",
      evidenceQuality: "HYPOTHESIS",
      uncertaintyLevel: "HIGH",
      version: "custom-1.0",
      summary: draftNotes.trim() || "Custom personality. Treat as HYPOTHESIS until sourced observations are attached.",
      facts: draftNotes.trim() ? [draftNotes.trim()] : ["Operator-authored. No researched dossier yet."],
      sources: draftSource.trim() ? [{ label: "Operator source", url: draftSource.trim(), accessed: new Date().toISOString().slice(0, 10) }] : [],
      learningNote: "Attach observed outcomes from real public exchanges before raising evidence quality.",
      observations: draftNotes.trim()
        ? [{ at: new Date().toISOString(), note: draftNotes.trim(), sourceState: "HYPOTHESIS" }]
        : [],
      model: {
        ...genericPersonality.model,
        actorName: name,
        description: draftNotes.trim() || "Custom hypothesis model.",
      },
    };
    persistCustom([...custom, entry]);
    setCounterpartyId(id);
    setDraftName("");
    setDraftOffice("");
    setDraftNotes("");
    setDraftSource("");
    setAdding(false);
  }

  async function launchJob() {
    setLoading(true);
    try {
      const operatorActor = personalityToOpeningActor(operator);
      const counterpartyActor = personalityToOpeningActor(counterparty);
      const composed = composeCorrespondenceOpening({
        channel,
        paste: message,
        fieldOverrides: intakeFields,
      });
      const dossier = [
        composed.intakePacket,
        `OPERATOR PERSONALITY: ${operator.name} (${operator.version}, ${operator.badge}).`,
        operator.summary,
        `COUNTERPARTY PERSONALITY: ${counterparty.name} (${counterparty.version}, ${counterparty.badge}).`,
        counterparty.summary,
        context,
      ].filter(Boolean).join("\n\n");
      const res = await fetch("/api/admin/decision-simulator/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requestedRuns: runs,
          actorModelId: counterparty.id,
          actorModel: {
            ...counterparty.model,
            actorId: counterparty.id,
            actorName: counterparty.name,
          },
          operatorPersonalityId: operator.id,
          counterpartyPersonalityId: counterparty.id,
          confirmExpensive,
          confirmThousand,
          openingInput: {
            message: composed.message || message,
            channel,
            objective: objective || undefined,
            context: dossier,
            operatorActor,
            counterpartyActor,
            stakes,
            urgency,
            intake: composed.intake,
            priorCorrespondence,
          },
        }),
      });
      const data = (await res.json()) as ApiResponse;
      setResponse(data);
      if (data.job) setJob(data.job);
    } catch (error) {
      setResponse({ ok: false, error: error instanceof Error ? error.message : "Request failed." });
    } finally {
      setLoading(false);
    }
  }

  async function cancelJob() {
    if (!job?.id) return;
    const res = await fetch(`/api/admin/decision-simulator/jobs/${job.id}/cancel`, { method: "POST" });
    const data = (await res.json()) as { job?: JobView };
    if (data.job) setJob(data.job);
  }

  const result = response?.result;
  const command = job?.commandCenter;
  const dashboard = job?.dashboard ?? null;
  const now = new Date().toISOString().replace(".000Z", "Z");

  function loadScenario(scenario: SavedScenario) {
    setMessage(scenario.opening);
    setChannel((CHANNELS.includes(scenario.channel as DecisionSimulationChannel) ? scenario.channel : channel) as DecisionSimulationChannel);
    setObjective(scenario.objective);
    setContext(scenario.context);
    setOperatorId(scenario.operatorId);
    setCounterpartyId(scenario.counterpartyId);
  }

  return (
    <div className="ml-root">
      <div className="ml-shell">
        <header className="ml-topbar">
          <div>
            <div className="ml-kicker">Decision Simulator · Mission lab</div>
            <h1 className="ml-title">Decision Simulator</h1>
            <p className="ml-sub">Model the next six moves before you act. Advisory only. No send. No post. Every actor weight is classified.</p>
          </div>
          <div className="ml-telemetry">
            <div className="ml-tel"><b>{runs.toLocaleString()}</b><span>Depth</span></div>
            <div className="ml-tel"><b>{depth.mode}</b><span>{depth.label}</span></div>
            <div className="ml-tel"><b>{operator.shortName}</b><span>Party</span></div>
            <div className="ml-tel"><b>{counterparty.shortName}</b><span>Counterparty</span></div>
          </div>
        </header>
        <p className="ml-copy" style={{ marginTop: 0, fontFamily: "var(--ml-mono)", fontSize: 11 }}>
          SYS {now} · catalog {BUILT_IN_PERSONALITIES.length}+{custom.length} · learning = operator-attached observations only
        </p>
        <p className="ml-copy">
          Alternative Futures rotate by run: expected, hostile, opportunity, escalation, surprise, silence/non-response.
          The product question is robustness across those futures, not likelihood inside one conversation. Vote history, when loaded, is evidence for Hill plausibility only.
        </p>

        <div className="ml-grid">
          <section className="ml-panel">
            <h2 className="ml-h">01 Opening move</h2>
            <p className="ml-copy">Paste-first intake. Nothing is sent. No mailbox connector. Unknown headers stay unknown.</p>
            <div className="ml-row">
              <label className="ml-label">Channel
                <select
                  className="ml-select"
                  value={channel}
                  onChange={(e) => {
                    const next = e.target.value as DecisionSimulationChannel;
                    setChannel(next);
                    const parsed = parseCorrespondencePaste(message, next);
                    setIntakeFields(parsed.fields);
                  }}
                >
                  {CHANNELS.map((item) => <option key={item}>{item}</option>)}
                </select>
              </label>
              <label className="ml-label">Objective
                <input className="ml-input" value={objective} onChange={(e) => setObjective(e.target.value)} placeholder="Decision to test" />
              </label>
            </div>
            <label className="ml-label">Paste correspondence
              <textarea
                className="ml-area"
                value={message}
                onChange={(e) => {
                  const next = e.target.value;
                  setMessage(next);
                  const parsed = parseCorrespondencePaste(next, channel);
                  setIntakeFields((prev) => ({ ...prev, ...parsed.fields }));
                }}
                placeholder={channel === "EMAIL" ? "From:\nTo:\nSubject:\n\nPaste the letter…" : "Paste the statement, debate line, speech excerpt, or memo…"}
              />
            </label>
            <div className="ml-row">
              {CHANNEL_INTAKE_FIELDS[channel].map((field) => (
                <label key={field.key} className="ml-label">{field.label}
                  <input
                    className="ml-input"
                    value={intakeFields[field.key] ?? ""}
                    onChange={(e) => setIntakeFields((prev) => ({ ...prev, [field.key]: e.target.value }))}
                    placeholder="unknown unless pasted or typed"
                  />
                </label>
              ))}
            </div>
            <div className="ml-row">
              <label className="ml-label">Stakes
                <select className="ml-select" value={stakes} onChange={(e) => setStakes(e.target.value as typeof stakes)}>
                  {["LOW", "MEDIUM", "HIGH", "CRITICAL"].map((item) => <option key={item}>{item}</option>)}
                </select>
              </label>
              <label className="ml-label">Urgency
                <select className="ml-select" value={urgency} onChange={(e) => setUrgency(e.target.value as typeof urgency)}>
                  {["LOW", "MEDIUM", "HIGH"].map((item) => <option key={item}>{item}</option>)}
                </select>
              </label>
            </div>
            <label className="ml-label">Context
              <textarea className="ml-area" style={{ minHeight: 90 }} value={context} onChange={(e) => setContext(e.target.value)} placeholder="Known public facts, constraints, recent exchanges. No private data." />
            </label>
            <label className="ml-label">Attach prior correspondence as evidence
              <textarea
                className="ml-area"
                style={{ minHeight: 90 }}
                value={priorDraft}
                onChange={(e) => setPriorDraft(e.target.value)}
                placeholder="Paste an earlier letter, debate line, or memo. Short excerpt only. Not sent. Not a mailbox fetch."
              />
            </label>
            <div className="ml-row">
              <label className="ml-label">Attachment title
                <input className="ml-input" value={priorTitle} onChange={(e) => setPriorTitle(e.target.value)} placeholder="optional" />
              </label>
              <label className="ml-label">
                <span>&nbsp;</span>
                <button
                  type="button"
                  className="ml-btn"
                  onClick={() => {
                    const next = attachPriorCorrespondence({
                      paste: priorDraft,
                      channel,
                      title: priorTitle || undefined,
                    });
                    if (!next) return;
                    const library = [next, ...priorCorrespondence].slice(0, 12);
                    setPriorCorrespondence(library);
                    window.localStorage.setItem(PRIOR_CORRESPONDENCE_LIBRARY_KEY, JSON.stringify(library));
                    setPriorDraft("");
                    setPriorTitle("");
                  }}
                >
                  Attach excerpt
                </button>
              </label>
            </div>
            {priorCorrespondence.length > 0 && (
              <ul className="ml-sources">
                {priorCorrespondence.map((item) => (
                  <li key={item.id}>
                    <b>{item.channel} [{item.provenance}]</b> — {item.title}: {item.bodyExcerpt}{" "}
                    <button
                      type="button"
                      className="ml-btn"
                      onClick={() => {
                        const library = priorCorrespondence.filter((row) => row.id !== item.id);
                        setPriorCorrespondence(library);
                        window.localStorage.setItem(PRIOR_CORRESPONDENCE_LIBRARY_KEY, JSON.stringify(library));
                      }}
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            )}

            <h2 className="ml-h" style={{ marginTop: 22 }}>02 Party / counterparty</h2>
            <p className="ml-copy">Defaults: Dr. Chris Jones vs Rep. French Hill. Catalog is open. Custom personalities start as HYPOTHESIS MODEL until sourced.</p>
            <div className="ml-row">
              <PersonalityPicker label="Party" value={operatorId} onChange={setOperatorId} catalog={catalog} />
              <PersonalityPicker label="Counterparty" value={counterpartyId} onChange={setCounterpartyId} catalog={catalog} />
            </div>
            <Dossier personality={operator} side="Party" />
            <Dossier personality={counterparty} side="Counterparty" />
            <PersonalityIntelligence operator={operator} counterparty={counterparty} />

            <button type="button" className="ml-ghost" style={{ marginTop: 12 }} onClick={() => setAdding((v) => !v)}>
              {adding ? "Close add personality" : "Add personality"}
            </button>
            {adding && (
              <div className="ml-actor">
                <label className="ml-label">Name<input className="ml-input" value={draftName} onChange={(e) => setDraftName(e.target.value)} /></label>
                <label className="ml-label">Office / role<input className="ml-input" value={draftOffice} onChange={(e) => setDraftOffice(e.target.value)} /></label>
                <label className="ml-label">Source URL (optional)<input className="ml-input" value={draftSource} onChange={(e) => setDraftSource(e.target.value)} /></label>
                <label className="ml-label">Notes / first observation<textarea className="ml-area" style={{ minHeight: 80 }} value={draftNotes} onChange={(e) => setDraftNotes(e.target.value)} /></label>
                <button type="button" className="ml-btn" onClick={addPersonality}>Commit personality to local catalog</button>
              </div>
            )}

            <h2 className="ml-h" style={{ marginTop: 22 }}>03 Simulation depth</h2>
            <div className="ml-depths">
              {PRESETS.map((preset) => (
                <button key={preset} type="button" className={`ml-depth${runs === preset ? " on" : ""}`} onClick={() => { setRuns(preset); setConfirmExpensive(false); setConfirmThousand(false); }}>
                  <b>{preset.toLocaleString()}</b>
                  <small>{DEPTH_META[preset].title}</small>
                  <small>{DEPTH_META[preset].hint}</small>
                </button>
              ))}
            </div>
            <div className="ml-row" style={{ marginTop: 10 }}>
              <input className="ml-input" value={customRuns} onChange={(e) => setCustomRuns(e.target.value)} inputMode="numeric" />
              <button type="button" className="ml-ghost" onClick={() => setRuns(Math.floor(Math.max(1, Math.min(1_000_000, Number(customRuns) || 1))))}>CUSTOM</button>
            </div>
            <p className="ml-copy">1 and 10 execute live. 100 and 1,000 are queued jobs. Ceiling 1,000,000 is architecture only. Queued jobs keep moving after this tab closes. Stale chunks are reclaimed after two minutes.</p>

            {runs >= 100 && (
              <div className="ml-warn">
                <b>{runs.toLocaleString()} simulations — estimated workload</b>
                <div>{estimate.approximateCalls.toLocaleString()} model calls · ~{estimate.approximateGeneratedMoves.toLocaleString()} generated moves</div>
                <div>Token range {estimate.tokenRange.min.toLocaleString()}–{estimate.tokenRange.max.toLocaleString()}</div>
                <div>Cost range {formatUsd(estimate.costRangeUsd.min)}–{formatUsd(estimate.costRangeUsd.max)} (approximate)</div>
                <label className="ml-label"><input type="checkbox" checked={confirmExpensive} onChange={(e) => setConfirmExpensive(e.target.checked)} /> Confirm queued paid analysis</label>
                {runs >= 1000 && (
                  <label className="ml-label"><input type="checkbox" checked={confirmThousand} onChange={(e) => setConfirmThousand(e.target.checked)} /> Second confirmation for a 1,000-run spend</label>
                )}
              </div>
            )}

            <button
              className="ml-btn"
              disabled={loading || !message.trim() || Boolean(activeJob) || (runs >= 100 && !confirmExpensive) || (runs >= 1000 && !confirmThousand)}
              onClick={() => void launchJob()}
            >
              {loading ? "Working…" : depth.runVerb}
            </button>
          </section>

          <section className="ml-panel">
            <h2 className="ml-h">04 Run / intelligence</h2>
            {!response && !job && <div className="ml-empty">Awaiting a run. Results privilege aggregate structure over anecdote.</div>}
            {response && !response.ok && <div className="ml-error">{response.error}</div>}

            {job && ["QUEUED", "RUNNING", "PARTIAL"].includes(job.status) && (
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span className="ml-badge research">{job.status}</span>
                  <button type="button" className="ml-ghost danger" onClick={() => void cancelJob()}>Cancel Job</button>
                </div>
                <p style={{ fontSize: 28, margin: "12px 0 0", letterSpacing: "-0.03em" }}>
                  {job.completed.toLocaleString()} / {job.requested.toLocaleString()} simulations complete
                </p>
                <p className="ml-copy">{job.percentComplete}%</p>
                <div className="ml-bar"><i style={{ width: `${Math.min(100, job.percentComplete)}%` }} /></div>
                <div className="ml-stats">
                  <div className="ml-stat"><b>Chunk {job.currentChunk} of {job.chunkCount}</b><span>Current</span></div>
                  <div className="ml-stat"><b>{job.completed.toLocaleString()}</b><span>Completed</span></div>
                  <div className="ml-stat"><b>{job.failed.toLocaleString()}</b><span>Failed</span></div>
                  <div className="ml-stat"><b>{job.tokenUsage.totalTokens.toLocaleString()}</b><span>Tokens</span></div>
                </div>
              </div>
            )}

            {job?.architectureOnly && <div className="ml-warn">Accepted as a distributed-study plan only. A million-run ceiling will not execute in this runtime.</div>}

            {command && job?.status === "COMPLETE" && (
              <div>
                <div className="ml-stats five">
                  <div className="ml-stat"><b>{command.simulations.toLocaleString()}</b><span>Simulations</span></div>
                  <div className="ml-stat"><b>{command.dominantResponseFrame ?? "—"}</b><span>Dominant response frame {pct(command.dominantResponseShare)}</span></div>
                  <div className="ml-stat"><b>{truncate(command.strongestRecommendedCounter)}</b><span>Strongest recommended counter {pct(command.strongestRecommendedShare)}</span></div>
                  <div className="ml-stat"><b>{pct(command.modelConfidence)}</b><span>Model confidence</span></div>
                  <div className="ml-stat"><b>{pct(command.outlierRate)}</b><span>Outlier rate</span></div>
                </div>
                <div className="ml-sec">
                  <h3>A. Response frame distribution</h3>
                  <div className="ml-list">
                    {command.frameDistribution.map((row) => (
                      <div key={row.frame}><span>{row.frame}</span><span>{row.count} · {pct(row.share)}</span></div>
                    ))}
                  </div>
                </div>
                <div className="ml-sec">
                  <h3>B. Move-by-move consensus</h3>
                  {command.moveConsensus.map((row) => (
                    <div key={row.moveNumber} className="ml-actor">
                      <b>Move {row.moveNumber}</b>
                      <p>Predicted: {row.topPredicted.join(" · ") || "—"}</p>
                      <p>Counters: {row.topCounters.join(" · ") || "—"}</p>
                    </div>
                  ))}
                </div>
                <div className="ml-sec">
                  <h3>C. Alternative futures</h3>
                  {command.robustness && (
                    <div className="ml-stats">
                      <div className="ml-stat"><b>{command.robustness.futuresWithRuns}/{command.robustness.requiredFutures}</b><span>Futures with runs</span></div>
                      <div className="ml-stat"><b>{pct(command.robustness.coverage)}</b><span>Future coverage</span></div>
                      <div className="ml-stat"><b>{pct(command.robustness.robustnessScore)}</b><span>Cross-future frame stability</span></div>
                    </div>
                  )}
                  <p className="ml-copy">{command.robustness?.methodology}</p>
                  {command.robustness?.lanes.some((lane) => lane.runCount > 0) && (
                    <ul className="ml-sources">
                      {command.robustness.lanes.filter((lane) => lane.runCount > 0).map((lane) => (
                        <li key={lane.futureId}>
                          {lane.label}: n={lane.runCount}
                          {lane.modalShare != null ? ` · modal ${Math.round(lane.modalShare * 100)}% ${lane.modalFrame ?? ""}` : ""}
                          {lane.representativeIsModal === false ? " · displayed sample is atypical" : ""}
                        </li>
                      ))}
                    </ul>
                  )}
                  <div className="ml-stats">
                    <Rep title="Expected / median" member={command.representative.expected} />
                    <Rep title="Hostile" member={command.representative.hostileOutlier} />
                    <Rep title="Opportunity" member={command.representative.opportunity} />
                    <Rep title="Escalation" member={command.representative.escalation ?? null} />
                    <Rep title="Surprise" member={command.representative.unusual} />
                    <Rep title="Silence / non-response" member={command.representative.silence ?? null} />
                  </div>
                </div>
                <div className="ml-sec">
                  <h3>D. Uncertainty</h3>
                  <ul className="ml-sources">{command.uncertainty.map((item) => <li key={item}>{item}</li>)}</ul>
                </div>
              </div>
            )}

            {result && !command && (
              <div className="ml-stats">
                <div className="ml-stat"><b>{result.completedRuns}</b><span>Completed</span></div>
                <div className="ml-stat"><b>{result.failedRuns}</b><span>Failed</span></div>
                <div className="ml-stat"><b>{pct(result.averageConfidence)}</b><span>Mean confidence</span></div>
                <div className="ml-stat"><b>{result.tokenUsage.totalTokens.toLocaleString()}</b><span>Tokens</span></div>
              </div>
            )}

            <DecisionIntelligence
              jobId={job?.id}
              opening={job?.opening || message}
              channel={channel}
              objective={objective}
              context={context}
              operatorId={operatorId}
              counterpartyId={counterpartyId}
              dashboard={dashboard}
              priorCorrespondence={priorCorrespondence}
              onApplyOpening={(text) => setMessage(text)}
              onLoadScenario={loadScenario}
            />
          </section>
        </div>
      </div>
    </div>
  );
}

function PersonalityPicker({
  label,
  value,
  onChange,
  catalog,
}: {
  label: string;
  value: string;
  onChange: (id: string) => void;
  catalog: CatalogPersonality[];
}) {
  return (
    <label className="ml-label">{label}
      <select className="ml-select" value={value} onChange={(e) => onChange(e.target.value)}>
        {catalog.map((item) => (
          <option key={item.id} value={item.id}>
            {item.name} · {item.badge}
          </option>
        ))}
      </select>
    </label>
  );
}

function Dossier({ personality, side }: { personality: CatalogPersonality; side: string }) {
  const badgeClass = personality.badge === "RESEARCH MODEL" ? "research" : personality.badge === "CUSTOM MODEL" ? "custom" : "";
  return (
    <div className="ml-actor">
      <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
        <b>{side}: {personality.name}</b>
        <span className={`ml-badge ${badgeClass}`}>{personality.badge}</span>
      </div>
      <p>{personality.office}</p>
      <p>Evidence {personality.evidenceQuality} · Uncertainty {personality.uncertaintyLevel} · {personality.version}</p>
      <p>{personality.summary}</p>
      {personality.facts.length > 0 && (
        <ul className="ml-sources">
          {personality.facts.map((fact) => <li key={fact}>{fact}</li>)}
        </ul>
      )}
      {personality.sources.length > 0 && (
        <ul className="ml-sources">
          {personality.sources.map((source) => (
            <li key={source.url}><a href={source.url} target="_blank" rel="noreferrer">{source.label}</a> · {source.accessed}</li>
          ))}
        </ul>
      )}
      <p>{personality.learningNote}</p>
    </div>
  );
}

function Rep({ title, member }: { title: string; member: Member | null }) {
  return (
    <div className="ml-stat">
      <b>{title}</b>
      <span>{member ? `Run #${member.ordinal} · ${member.frame ?? "Unspecified"}` : "None yet"}</span>
    </div>
  );
}

function truncate(value?: string | null) {
  if (!value) return "—";
  return value.length > 42 ? `${value.slice(0, 39)}…` : value;
}
