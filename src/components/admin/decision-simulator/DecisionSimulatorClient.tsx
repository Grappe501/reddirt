"use client";

import { useEffect, useMemo, useState } from "react";
import { depthLabel } from "@/lib/agents/decision-simulation/queue-config";
import { estimateDecisionSimulationCost, formatUsd } from "@/lib/agents/decision-simulation/cost-estimate";

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
  result?: {
    run: { moves: Move[] };
    executiveSummary?: string;
    strongestRisk?: string;
    strongestOpportunity?: string;
  };
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
  estimatedCostUsd: number | null;
  error: string | null;
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
    representative: {
      expected: Member | null;
      highConfidence: Member | null;
      hostileOutlier: Member | null;
      opportunity: Member | null;
      unusual: Member | null;
    };
    uncertainty: string[];
  } | null;
};
type EnsembleResult = {
  completedRuns: number;
  failedRuns: number;
  members: Member[];
  dominantMove1Frames: Array<{ frame: string; count: number; share: number }>;
  dominantFinalRecommendations: Array<{ recommendation: string; count: number; share: number }>;
  averageConfidence?: number;
  averageScenarioProbability?: number;
  tokenUsage: { inputTokens: number; outputTokens: number; totalTokens: number };
  representativeRuns: Array<{ ordinal: number; reason: string }>;
};
type CostEstimate = {
  approximateCalls: number;
  approximateGeneratedMoves: number;
  tokenRange: { min: number; max: number };
  costRangeUsd: { min: number; max: number };
  exact: false;
};
type ApiResponse = {
  ok: boolean;
  execution?: "COMPLETE" | "QUEUED" | "ARCHITECTURE";
  error?: string;
  estimate?: CostEstimate;
  needsConfirm?: boolean;
  needsSecondConfirm?: boolean;
  job?: JobView;
  result?: EnsembleResult;
};
type SavedActor = {
  id: string;
  name: string;
  version: string | null;
  effectiveAt: string | null;
  evidenceQuality: string;
  uncertaintyLevel: string;
};

const PRESETS: RunPreset[] = [1, 10, 100, 1000];
const CHANNELS = ["EMAIL","SOCIAL","SMS","PRESS_STATEMENT","PUBLIC_STATEMENT","FUNDRAISING","DEBATE","SPEECH","MEMO","STRATEGIC_DECISION","CUSTOM"];
const DEPTH_META: Record<RunPreset, { title: string; hint: string }> = {
  1: { title: "Quick look", hint: "Immediate" },
  10: { title: "Scenario set", hint: "Immediate" },
  100: { title: "Ensemble", hint: "Queued analysis" },
  1000: { title: "Deep ensemble", hint: "Deep ensemble" },
};

function pct(value?: number | null) {
  return typeof value === "number" ? `${Math.round(value * 100)}%` : "—";
}
function moveLabel(move: Move) {
  if (move.moveNumber === 0) return "Your opening move";
  return move.side === "COUNTERPARTY" ? `Their response · Move ${move.moveNumber}` : `Your response · Move ${move.moveNumber}`;
}

export function DecisionSimulatorClient() {
  const [message, setMessage] = useState("");
  const [objective, setObjective] = useState("");
  const [context, setContext] = useState("");
  const [operatorName, setOperatorName] = useState("Campaign");
  const [counterpartyName, setCounterpartyName] = useState("Counterparty");
  const [channel, setChannel] = useState("EMAIL");
  const [runs, setRuns] = useState<number>(10);
  const [customRuns, setCustomRuns] = useState("1000");
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<ApiResponse | null>(null);
  const [job, setJob] = useState<JobView | null>(null);
  const [confirmExpensive, setConfirmExpensive] = useState(false);
  const [confirmThousand, setConfirmThousand] = useState(false);
  const [actorMode, setActorMode] = useState<"generic" | "saved">("generic");
  const [savedActors, setSavedActors] = useState<SavedActor[]>([]);
  const [actorModelId, setActorModelId] = useState("generic");

  useEffect(() => {
    void fetch("/api/admin/decision-simulator/actors")
      .then((res) => res.json())
      .then((data: { ok?: boolean; actors?: SavedActor[] }) => {
        if (data.ok) setSavedActors(data.actors ?? []);
      })
      .catch(() => {});
  }, []);

  const depth = depthLabel(runs);
  const estimate = useMemo(() => estimateDecisionSimulationCost(runs, 2), [runs]);
  const queued = runs > 10 && runs <= 1000;
  const architectureOnly = runs > 1000;
  const activeJob = job && ["QUEUED", "RUNNING", "PARTIAL"].includes(job.status);

  useEffect(() => {
    if (!job?.id || !["QUEUED", "RUNNING", "PARTIAL"].includes(job.status)) return undefined;
    let cancelled = false;
    const tick = async () => {
      try {
        void fetch(`/api/admin/decision-simulator/jobs/${job.id}/work`, { method: "POST" });
        const res = await fetch(`/api/admin/decision-simulator/jobs/${job.id}`);
        const data = (await res.json()) as { ok?: boolean; job?: JobView };
        if (!cancelled && data.job) {
          setJob(data.job);
          setResponse((prev) => ({ ...(prev ?? { ok: true }), ok: true, job: data.job }));
        }
      } catch {
        /* keep last known job */
      }
    };
    const timer = window.setInterval(() => void tick(), 2500);
    void tick();
    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [job?.id, job?.status]);

  function resetConfirms(nextRuns: number) {
    setRuns(nextRuns);
    setConfirmExpensive(false);
    setConfirmThousand(false);
  }

  async function cancelJob() {
    if (!job?.id) return;
    const res = await fetch(`/api/admin/decision-simulator/jobs/${job.id}/cancel`, { method: "POST" });
    const data = (await res.json()) as { job?: JobView };
    if (data.job) setJob(data.job);
  }

  async function launchJob(next = { confirmExpensive, confirmThousand }) {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/decision-simulator/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requestedRuns: runs,
          actorModelId: actorMode === "saved" ? actorModelId : "generic",
          confirmExpensive: next.confirmExpensive,
          confirmThousand: next.confirmThousand,
          openingInput: {
            message,
            channel,
            objective: objective || undefined,
            context: context || undefined,
            operatorActor: { name: operatorName || "Operator", actorType: "CAMPAIGN" },
            counterpartyActor: { name: counterpartyName || "Counterparty", actorType: "CAMPAIGN" },
            stakes: "HIGH",
            urgency: "MEDIUM",
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

  const result = response?.result;
  const command = job?.commandCenter;
  const representativeMembers = (result?.representativeRuns ?? []).map((rep) => ({
    ...rep,
    member: result?.members.find((member) => member.ordinal === rep.ordinal),
  })).filter((item) => item.member?.result);

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Decision Simulator</p>
            <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950 md:text-5xl">Decision Simulator</h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600 md:text-base">
              Model the next six moves before you act.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <Metric value={runs.toLocaleString()} label="runs" dark />
            <Metric value={depth.mode} label={depth.label} />
            <Metric value={queued ? "Queued" : architectureOnly ? "Architecture" : "Immediate"} label="posture" />
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <section className="space-y-5 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
          <div>
            <h2 className="text-lg font-bold text-slate-950">1. Opening Move</h2>
            <p className="mt-1 text-sm text-slate-500">Nothing is sent. This is advisory simulation only.</p>
          </div>
          <label className="block text-sm font-semibold text-slate-700">Opening correspondence<textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={8} placeholder="Paste the email, post, statement, text, debate line, memo, or strategic move…" className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-900" /></label>

          <div>
            <h2 className="text-lg font-bold text-slate-950">2. Counterparty</h2>
            <div className="mt-3 grid gap-2 md:grid-cols-2">
              <button type="button" onClick={() => { setActorMode("generic"); setActorModelId("generic"); }} className={`rounded-xl border px-3 py-3 text-left text-sm ${actorMode === "generic" ? "border-slate-950 bg-slate-950 text-white" : "border-slate-300"}`}>
                Generic model
                <div className={`mt-1 text-xs ${actorMode === "generic" ? "text-amber-200" : "text-amber-800"}`}>HYPOTHESIS MODEL</div>
              </button>
              <button type="button" onClick={() => setActorMode("saved")} className={`rounded-xl border px-3 py-3 text-left text-sm ${actorMode === "saved" ? "border-slate-950 bg-slate-950 text-white" : "border-slate-300"}`}>
                Saved actor model
                <div className="mt-1 text-xs opacity-70">{savedActors.length ? `${savedActors.length} available` : "None stored yet"}</div>
              </button>
            </div>
            {actorMode === "saved" && savedActors.length > 0 && (
              <select value={actorModelId} onChange={(e) => setActorModelId(e.target.value)} className="mt-3 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm">
                {savedActors.map((actor) => (
                  <option key={actor.id} value={actor.id}>
                    {actor.name} · {actor.version ?? "unversioned"} · {actor.uncertaintyLevel}
                  </option>
                ))}
              </select>
            )}
            {actorMode === "saved" && actorModelId !== "generic" && (
              <p className="mt-2 text-xs text-slate-500">
                {savedActors.find((actor) => actor.id === actorModelId)?.name} · evidence {savedActors.find((actor) => actor.id === actorModelId)?.evidenceQuality ?? "UNKNOWN"} · uncertainty {savedActors.find((actor) => actor.id === actorModelId)?.uncertaintyLevel ?? "HYPOTHESIS"}
              </p>
            )}
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <Field label="Your side" value={operatorName} setValue={setOperatorName} />
              <Field label="Counterparty" value={counterpartyName} setValue={setCounterpartyName} />
            </div>
          </div>

          <div>
            <h2 className="text-lg font-bold text-slate-950">3. Context</h2>
            <div className="mt-3 grid gap-4 md:grid-cols-2">
              <label className="text-sm font-semibold text-slate-700">Channel<select value={channel} onChange={(e) => setChannel(e.target.value)} className="mt-2 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm">{CHANNELS.map((item) => <option key={item}>{item}</option>)}</select></label>
              <Field label="Objective" value={objective} setValue={setObjective} placeholder="What are you trying to accomplish?" />
            </div>
            <label className="mt-4 block text-sm font-semibold text-slate-700">Additional context<textarea value={context} onChange={(e) => setContext(e.target.value)} rows={4} placeholder="Known facts, constraints, recent exchanges, public context, or assumptions…" className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm" /></label>
          </div>

          <div>
            <h2 className="text-lg font-bold text-slate-950">4. Simulation Depth</h2>
            <div className="mt-3 grid grid-cols-2 gap-2 md:grid-cols-4">
              {PRESETS.map((preset) => (
                <button key={preset} type="button" onClick={() => resetConfirms(preset)} className={`rounded-xl border px-3 py-3 text-left ${runs === preset ? "border-slate-950 bg-slate-950 text-white" : "border-slate-300 bg-white text-slate-700"}`}>
                  <div className="text-lg font-black">{preset.toLocaleString()}</div>
                  <div className="text-[10px] font-bold uppercase tracking-wider opacity-70">{DEPTH_META[preset].title}</div>
                  <div className="text-[10px] opacity-70">{DEPTH_META[preset].hint}</div>
                </button>
              ))}
            </div>
            <div className="mt-3 flex gap-2">
              <input value={customRuns} onChange={(e) => setCustomRuns(e.target.value)} inputMode="numeric" className="min-w-0 flex-1 rounded-xl border border-slate-300 px-3 py-2 text-sm" />
              <button type="button" onClick={() => resetConfirms(Math.floor(Math.max(1, Math.min(1_000_000, Number(customRuns) || 1))))} className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold">CUSTOM</button>
            </div>
            <p className="mt-2 text-xs text-slate-500">1 and 10 run immediately. 100 and 1,000 become real queued jobs. Custom above 1,000 is accepted as architecture only, up to 1,000,000.</p>
          </div>

          {runs >= 100 && (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
              <p className="font-bold">{runs.toLocaleString()} simulations</p>
              <p className="mt-2">Estimated workload:</p>
              <ul className="mt-1 list-disc pl-5 text-xs leading-5">
                <li>{estimate.approximateCalls.toLocaleString()} model calls</li>
                <li>~{estimate.approximateGeneratedMoves.toLocaleString()} generated moves</li>
                <li>Estimated token range: {estimate.tokenRange.min.toLocaleString()}–{estimate.tokenRange.max.toLocaleString()}</li>
                <li>Estimated cost range: {formatUsd(estimate.costRangeUsd.min)}–{formatUsd(estimate.costRangeUsd.max)}</li>
              </ul>
              <p className="mt-2 text-xs">This estimate is approximate, not a billing quote.</p>
              <label className="mt-3 flex items-center gap-2 text-xs font-semibold">
                <input type="checkbox" checked={confirmExpensive} onChange={(e) => setConfirmExpensive(e.target.checked)} />
                I understand this is a queued paid analysis.
              </label>
              {runs >= 1000 && (
                <label className="mt-2 flex items-center gap-2 text-xs font-semibold">
                  <input type="checkbox" checked={confirmThousand} onChange={(e) => setConfirmThousand(e.target.checked)} />
                  Second confirmation for a 1,000-run spend.
                </label>
              )}
            </div>
          )}

          <button
            disabled={loading || !message.trim() || Boolean(activeJob) || (runs >= 100 && !confirmExpensive) || (runs >= 1000 && !confirmThousand)}
            onClick={() => void launchJob()}
            className="w-full rounded-2xl bg-slate-950 px-5 py-4 text-base font-black text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            {loading ? "Working…" : depth.runVerb}
          </button>
        </section>

        <section className="space-y-5">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
            <h2 className="text-lg font-bold text-slate-950">5. Run</h2>
            {!response && !job && <div className="mt-6 rounded-2xl border border-dashed border-slate-300 p-10 text-center text-sm text-slate-500">Run a simulation to populate the intelligence picture.</div>}
            {response && !response.ok && <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">{response.error}</div>}

            {job && ["QUEUED", "RUNNING", "PARTIAL"].includes(job.status) && (
              <div className="mt-4 space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-black uppercase tracking-wider text-emerald-700">{job.status}</p>
                  <button type="button" onClick={() => void cancelJob()} className="rounded-xl border border-red-300 px-3 py-1 text-xs font-bold text-red-700">Cancel Job</button>
                </div>
                <p className="text-2xl font-black text-slate-950">{job.completed.toLocaleString()} / {job.requested.toLocaleString()} simulations complete</p>
                <p className="text-sm text-slate-500">{job.percentComplete}%</p>
                <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full bg-slate-950" style={{ width: `${Math.min(100, job.percentComplete)}%` }} />
                </div>
                <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                  <Stat label="Current" value={`Chunk ${job.currentChunk} of ${job.chunkCount}`} />
                  <Stat label="Completed" value={job.completed.toLocaleString()} />
                  <Stat label="Failed" value={job.failed.toLocaleString()} />
                  <Stat label="Tokens" value={job.tokenUsage.totalTokens.toLocaleString()} />
                </div>
              </div>
            )}

            {job?.status === "CANCELLED" && (
              <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">Job cancelled after {job.completed.toLocaleString()} completed runs.</div>
            )}

            {job?.architectureOnly && (
              <div className="mt-4 rounded-2xl bg-slate-50 p-4 text-sm text-slate-700">Accepted as a distributed-study plan only. A million-run ceiling is architectural; this pass will not execute that volume.</div>
            )}

            {command && job?.status === "COMPLETE" && (
              <div className="mt-4 space-y-4">
                <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
                  <Stat label="Simulations" value={command.simulations.toLocaleString()} />
                  <Stat label="Dominant response frame" value={command.dominantResponseFrame ?? "—"} hint={pct(command.dominantResponseShare)} />
                  <Stat label="Strongest recommended counter" value={truncate(command.strongestRecommendedCounter)} hint={pct(command.strongestRecommendedShare)} />
                  <Stat label="Model confidence" value={pct(command.modelConfidence)} />
                  <Stat label="Outlier rate" value={pct(command.outlierRate)} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">A. Response frame distribution</h3>
                  <div className="mt-2 space-y-2">
                    {command.frameDistribution.map((row) => (
                      <div key={row.frame} className="flex justify-between rounded-xl bg-slate-50 px-3 py-2 text-xs">
                        <span>{row.frame}</span>
                        <span>{row.count} · {pct(row.share)}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">B. Move-by-move consensus</h3>
                  <div className="mt-2 space-y-2">
                    {command.moveConsensus.map((row) => (
                      <div key={row.moveNumber} className="rounded-xl border border-slate-200 p-3 text-xs">
                        <p className="font-bold">Move {row.moveNumber}</p>
                        <p className="mt-1 text-slate-600">Top predicted responses: {row.topPredicted.join(" · ") || "—"}</p>
                        <p className="text-slate-600">Top recommended counters: {row.topCounters.join(" · ") || "—"}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">C. Representative futures</h3>
                  <div className="mt-2 grid gap-2 md:grid-cols-2">
                    <RepCard title="Expected / median" member={command.representative.expected} />
                    <RepCard title="High-confidence" member={command.representative.highConfidence} />
                    <RepCard title="Hostile / outlier" member={command.representative.hostileOutlier} />
                    <RepCard title="Opportunity path" member={command.representative.opportunity} />
                    <RepCard title="Unusual but plausible" member={command.representative.unusual} />
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">D. Uncertainty</h3>
                  <ul className="mt-2 list-disc pl-5 text-xs text-slate-600">
                    {command.uncertainty.map((item) => <li key={item}>{item}</li>)}
                  </ul>
                </div>
              </div>
            )}

            {result && !command && (
              <div className="mt-4 space-y-4">
                <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                  <Stat label="Completed" value={result.completedRuns.toLocaleString()} />
                  <Stat label="Failed" value={result.failedRuns.toLocaleString()} />
                  <Stat label="Mean confidence" value={pct(result.averageConfidence)} />
                  <Stat label="Mean probability" value={pct(result.averageScenarioProbability)} />
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <TopList title="Dominant first-response frames" items={result.dominantMove1Frames.map((x) => `${Math.round(x.share * 100)}% · ${x.frame}`)} />
                  <TopList title="Dominant final recommendations" items={result.dominantFinalRecommendations.map((x) => `${Math.round(x.share * 100)}% · ${x.recommendation}`)} />
                </div>
                <p className="text-xs text-slate-500">Token usage: {result.tokenUsage.totalTokens.toLocaleString()} total · {result.tokenUsage.inputTokens.toLocaleString()} input · {result.tokenUsage.outputTokens.toLocaleString()} output</p>
              </div>
            )}
          </div>

          {representativeMembers.map(({ ordinal, reason, member }) => {
            const run = member!.result!;
            return (
              <div key={`${reason}-${ordinal}`} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Representative path</p>
                    <h3 className="text-xl font-black text-slate-950">{reason}</h3>
                  </div>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">Run #{ordinal}</span>
                </div>
                {run.executiveSummary && <p className="mt-4 rounded-2xl bg-slate-50 p-4 text-sm leading-6 text-slate-700">{run.executiveSummary}</p>}
                <div className="mt-5 space-y-3">
                  {run.run.moves.map((move) => (
                    <div key={move.moveNumber} className={`rounded-2xl border p-4 ${move.side === "OPERATOR" ? "border-slate-200 bg-white" : "border-amber-200 bg-amber-50/60"}`}>
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">{moveLabel(move)}</p>
                          {move.predictedFrame && <p className="mt-1 text-xs font-semibold text-amber-800">Frame: {move.predictedFrame}</p>}
                        </div>
                        <span className="text-xs font-semibold text-slate-500">{pct(move.confidence?.estimatedProbability)}</span>
                      </div>
                      <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-800">{move.message}</p>
                      {move.rationaleSummary && <p className="mt-3 text-xs leading-5 text-slate-500">Why: {move.rationaleSummary}</p>}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </section>
      </div>
    </div>
  );
}

function truncate(value?: string | null) {
  if (!value) return "—";
  return value.length > 42 ? `${value.slice(0, 39)}…` : value;
}
function Metric({ value, label, dark = false }: { value: string; label: string; dark?: boolean }) {
  return <div className={`rounded-2xl px-4 py-3 ${dark ? "bg-slate-950 text-white" : "bg-slate-100 text-slate-700"}`}><div className="font-bold">{value}</div><div className={dark ? "opacity-70" : "text-slate-500"}>{label}</div></div>;
}
function Field({ label, value, setValue, placeholder }: { label: string; value: string; setValue: (value: string) => void; placeholder?: string }) {
  return <label className="text-sm font-semibold text-slate-700">{label}<input value={value} onChange={(e) => setValue(e.target.value)} placeholder={placeholder} className="mt-2 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm" /></label>;
}
function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return <div className="rounded-2xl bg-slate-50 p-4"><div className="text-xl font-black text-slate-950">{value}</div>{hint && <div className="text-xs font-semibold text-slate-700">{hint}</div>}<div className="mt-1 text-xs font-medium text-slate-500">{label}</div></div>;
}
function TopList({ title, items }: { title: string; items: string[] }) {
  return <div className="rounded-2xl border border-slate-200 p-4"><h4 className="text-sm font-bold text-slate-900">{title}</h4><div className="mt-3 space-y-2">{items.length ? items.slice(0, 5).map((item) => <div key={item} className="rounded-xl bg-slate-50 px-3 py-2 text-xs text-slate-700">{item}</div>) : <p className="text-xs text-slate-400">No aggregate yet.</p>}</div></div>;
}
function RepCard({ title, member }: { title: string; member: Member | null }) {
  return (
    <div className="rounded-xl bg-slate-50 p-3 text-xs">
      <p className="font-bold text-slate-900">{title}</p>
      {member ? <p className="mt-1 text-slate-600">Run #{member.ordinal} · {member.frame ?? "Unspecified"}</p> : <p className="mt-1 text-slate-400">No representative yet.</p>}
    </div>
  );
}
