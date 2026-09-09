"use client";

import { useMemo, useState } from "react";

type RunPreset = 1 | 10 | 100 | 1000;

type Move = {
  moveNumber: number;
  side: "OPERATOR" | "COUNTERPARTY";
  kind: string;
  message: string;
  predictedFrame?: string;
  rationaleSummary?: string;
  risks?: string[];
  opportunities?: string[];
  assumptions?: string[];
  confidence?: { label?: string; estimatedProbability?: number; explanation?: string };
};

type EnsembleResult = {
  plan?: {
    requestedRuns: number;
    executionMode: string;
    maxConcurrency: number;
    chunkSize: number;
    chunkCount: number;
    retainIndividualRuns: boolean;
  };
  aggregate?: {
    completedRuns: number;
    failedRuns: number;
    confidenceMean?: number;
    probabilityMean?: number;
    dominantMove1Frames?: Array<{ frame: string; count: number; share: number }>;
    dominantFinalRecommendations?: Array<{ recommendation: string; count: number; share: number }>;
  };
  representativeRuns?: Array<{
    label: string;
    runOrdinal: number;
    result: {
      run: { moves: Move[] };
      executiveSummary?: string;
      strongestRisk?: string;
      strongestOpportunity?: string;
    };
  }>;
  totalUsage?: { inputTokens?: number; outputTokens?: number; totalTokens?: number };
};

type ApiResponse = {
  ok: boolean;
  execution?: "PLANNED" | "COMPLETE";
  message?: string;
  error?: string;
  plan?: EnsembleResult["plan"];
  result?: EnsembleResult;
};

const PRESETS: RunPreset[] = [1, 10, 100, 1000];

function pct(value?: number) {
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

  const executionPreview = useMemo(() => {
    const count = Math.max(1, Math.min(1_000_000, Math.floor(runs)));
    if (count <= 10) return { mode: "INLINE", chunk: count, chunks: 1 };
    if (count <= 1000) return { mode: "QUEUED", chunk: Math.min(100, count), chunks: Math.ceil(count / 100) };
    return { mode: "DISTRIBUTED", chunk: Math.min(1000, count), chunks: Math.ceil(count / 1000) };
  }, [runs]);

  async function runSimulation() {
    setLoading(true);
    setResponse(null);
    try {
      const res = await fetch("/api/admin/decision-simulator/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requestedRuns: runs,
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
      const json = (await res.json()) as ApiResponse;
      setResponse(json);
    } catch (error) {
      setResponse({ ok: false, error: error instanceof Error ? error.message : "Request failed." });
    } finally {
      setLoading(false);
    }
  }

  const aggregate = response?.result?.aggregate;
  const representatives = response?.result?.representativeRuns ?? [];

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">RedDirt Intelligence Lab</p>
            <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950 md:text-5xl">Decision Simulator</h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600 md:text-base">
              Test a message before you send it. Run one strategic forecast or an ensemble of alternate futures, then inspect the response frames and six-move paths that appear most often.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="rounded-2xl bg-slate-950 px-4 py-3 text-white"><div className="font-bold">{runs.toLocaleString()}</div><div className="opacity-70">runs</div></div>
            <div className="rounded-2xl bg-slate-100 px-4 py-3 text-slate-700"><div className="font-bold">{executionPreview.mode}</div><div className="text-slate-500">mode</div></div>
            <div className="rounded-2xl bg-slate-100 px-4 py-3 text-slate-700"><div className="font-bold">{executionPreview.chunks}</div><div className="text-slate-500">chunks</div></div>
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <section className="space-y-5 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
          <div>
            <h2 className="text-lg font-bold text-slate-950">1. Define the opening move</h2>
            <p className="mt-1 text-sm text-slate-500">Nothing is sent. This is advisory simulation only.</p>
          </div>

          <label className="block text-sm font-semibold text-slate-700">Opening correspondence
            <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={8} placeholder="Paste the email, post, statement, text, debate line, memo, or strategic move you are considering…" className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-900" />
          </label>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="text-sm font-semibold text-slate-700">Your side
              <input value={operatorName} onChange={(e) => setOperatorName(e.target.value)} className="mt-2 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm" />
            </label>
            <label className="text-sm font-semibold text-slate-700">Counterparty
              <input value={counterpartyName} onChange={(e) => setCounterpartyName(e.target.value)} className="mt-2 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm" />
            </label>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="text-sm font-semibold text-slate-700">Channel
              <select value={channel} onChange={(e) => setChannel(e.target.value)} className="mt-2 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm">
                {['EMAIL','SOCIAL','SMS','PRESS_STATEMENT','PUBLIC_STATEMENT','FUNDRAISING','DEBATE','SPEECH','MEMO','STRATEGIC_DECISION','CUSTOM'].map((item) => <option key={item}>{item}</option>)}
              </select>
            </label>
            <label className="text-sm font-semibold text-slate-700">Objective
              <input value={objective} onChange={(e) => setObjective(e.target.value)} placeholder="What are you trying to accomplish?" className="mt-2 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm" />
            </label>
          </div>

          <label className="block text-sm font-semibold text-slate-700">Additional context
            <textarea value={context} onChange={(e) => setContext(e.target.value)} rows={4} placeholder="Known facts, constraints, recent exchanges, public context, or assumptions…" className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm" />
          </label>

          <div>
            <h2 className="text-lg font-bold text-slate-950">2. Choose simulation depth</h2>
            <div className="mt-3 grid grid-cols-4 gap-2">
              {PRESETS.map((preset) => (
                <button key={preset} type="button" onClick={() => setRuns(preset)} className={`rounded-xl border px-3 py-3 text-sm font-bold ${runs === preset ? "border-slate-950 bg-slate-950 text-white" : "border-slate-300 bg-white text-slate-700"}`}>{preset.toLocaleString()}</button>
              ))}
            </div>
            <div className="mt-3 flex gap-2">
              <input value={customRuns} onChange={(e) => setCustomRuns(e.target.value)} inputMode="numeric" className="min-w-0 flex-1 rounded-xl border border-slate-300 px-3 py-2 text-sm" />
              <button type="button" onClick={() => { const value = Math.max(1, Math.min(1_000_000, Number(customRuns) || 1)); setRuns(Math.floor(value)); }} className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold">Use custom</button>
            </div>
            <p className="mt-2 text-xs text-slate-500">Architecture ceiling: 1,000,000 runs. Preview executes up to 10 live runs per web request; larger jobs show their production queue plan.</p>
          </div>

          <button disabled={loading || !message.trim()} onClick={runSimulation} className="w-full rounded-2xl bg-slate-950 px-5 py-4 text-base font-black text-white disabled:cursor-not-allowed disabled:opacity-40">
            {loading ? "Running simulation…" : runs <= 10 ? `Run ${runs.toLocaleString()} simulation${runs === 1 ? "" : "s"}` : `Plan ${runs.toLocaleString()}-run ensemble`}
          </button>
        </section>

        <section className="space-y-5">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
            <h2 className="text-lg font-bold text-slate-950">3. Decision picture</h2>
            {!response && <div className="mt-6 rounded-2xl border border-dashed border-slate-300 p-10 text-center text-sm text-slate-500">Run a simulation to populate the intelligence picture.</div>}
            {response && !response.ok && <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">{response.error}</div>}
            {response?.ok && response.execution === "PLANNED" && (
              <div className="mt-4 space-y-4">
                <div className="rounded-2xl bg-amber-50 p-4 text-sm text-amber-900">{response.message}</div>
                <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                  <Stat label="Runs" value={response.plan?.requestedRuns?.toLocaleString() ?? "—"} />
                  <Stat label="Execution" value={response.plan?.executionMode ?? "—"} />
                  <Stat label="Chunk size" value={response.plan?.chunkSize?.toLocaleString() ?? "—"} />
                  <Stat label="Chunks" value={response.plan?.chunkCount?.toLocaleString() ?? "—"} />
                </div>
              </div>
            )}
            {aggregate && (
              <div className="mt-4 space-y-4">
                <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                  <Stat label="Completed" value={aggregate.completedRuns.toLocaleString()} />
                  <Stat label="Failed" value={aggregate.failedRuns.toLocaleString()} />
                  <Stat label="Mean confidence" value={pct(aggregate.confidenceMean)} />
                  <Stat label="Mean probability" value={pct(aggregate.probabilityMean)} />
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <TopList title="Dominant first-response frames" items={(aggregate.dominantMove1Frames ?? []).map((x) => `${Math.round(x.share * 100)}% · ${x.frame}`)} />
                  <TopList title="Dominant final recommendations" items={(aggregate.dominantFinalRecommendations ?? []).map((x) => `${Math.round(x.share * 100)}% · ${x.recommendation}`)} />
                </div>
              </div>
            )}
          </div>

          {representatives.map((representative) => (
            <div key={`${representative.label}-${representative.runOrdinal}`} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Representative path</p>
                  <h3 className="text-xl font-black text-slate-950">{representative.label}</h3>
                </div>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">Run #{representative.runOrdinal}</span>
              </div>
              {representative.result.executiveSummary && <p className="mt-4 rounded-2xl bg-slate-50 p-4 text-sm leading-6 text-slate-700">{representative.result.executiveSummary}</p>}
              <div className="mt-5 space-y-3">
                {representative.result.run.moves.map((move) => (
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
          ))}
        </section>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return <div className="rounded-2xl bg-slate-50 p-4"><div className="text-xl font-black text-slate-950">{value}</div><div className="mt-1 text-xs font-medium text-slate-500">{label}</div></div>;
}

function TopList({ title, items }: { title: string; items: string[] }) {
  return <div className="rounded-2xl border border-slate-200 p-4"><h4 className="text-sm font-bold text-slate-900">{title}</h4><div className="mt-3 space-y-2">{items.length ? items.slice(0, 5).map((item) => <div key={item} className="rounded-xl bg-slate-50 px-3 py-2 text-xs text-slate-700">{item}</div>) : <p className="text-xs text-slate-400">No aggregate yet.</p>}</div></div>;
}
