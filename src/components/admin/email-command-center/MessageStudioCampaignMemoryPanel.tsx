import Link from "next/link";
import type { CampaignMemoryReadinessSnapshot } from "@/lib/email-command-center/ai-campaign-memory-readiness";
import {
  buildRecommendedIngestionPlan,
  listAvailableKnowledgeSources,
  listCatalogGapsFromRegistry,
} from "@/lib/email-command-center/ai-campaign-memory-readiness";

const tierLabel: Record<CampaignMemoryReadinessSnapshot["memoryTier"], string> = {
  no_index: "No / empty DB index",
  keyword_index: "Keyword index only (sparse or no embeddings)",
  semantic_partial: "Semantic partial (some embeddings)",
  semantic_strong: "Semantic index looks populated",
};

function tierClass(t: CampaignMemoryReadinessSnapshot["memoryTier"]): string {
  switch (t) {
    case "semantic_strong":
      return "border-emerald-300/80 bg-emerald-50/90 text-emerald-950";
    case "semantic_partial":
      return "border-amber-300/80 bg-amber-50/90 text-amber-950";
    case "keyword_index":
      return "border-sky-300/70 bg-sky-50/90 text-sky-950";
    default:
      return "border-rose-200/80 bg-rose-50/90 text-rose-950";
  }
}

type Props = {
  snapshot: CampaignMemoryReadinessSnapshot;
  /** When false, omit the long “operator paste” list (readiness page shows shorter variant). */
  showFullOperatorPasteList?: boolean;
};

export function MessageStudioCampaignMemoryPanel({ snapshot, showFullOperatorPasteList = true }: Props) {
  const available = listAvailableKnowledgeSources();
  const registryGaps = listCatalogGapsFromRegistry();
  const plan = buildRecommendedIngestionPlan();
  const sc = snapshot.searchChunk;

  return (
    <section className="rounded-lg border border-indigo-200/80 bg-indigo-50/90 p-3 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h2 className="font-heading text-xs font-bold uppercase tracking-wide text-indigo-950/90">
            Campaign Memory Readiness
          </h2>
          <p className="mt-1 max-w-3xl font-body text-[10px] leading-snug text-indigo-950/90">
            EMAIL-AI-CAMPAIGN-MEMORY-READINESS-1.0 — inventory of{" "}
            <span className="font-semibold">SearchChunk</span>, embeddings, and Message Studio source posture. Counts come
            from the live database when reachable; nothing here runs ingestion or claims corpus completeness.
          </p>
        </div>
        <div className={`rounded border px-2 py-1 text-center text-[9px] font-bold ${tierClass(snapshot.memoryTier)}`}>
          <div className="text-[8px] font-semibold uppercase tracking-wide opacity-80">Index tier</div>
          {tierLabel[snapshot.memoryTier]}
        </div>
      </div>

      <ul className="mt-2 flex flex-wrap gap-2 font-body text-[9px] text-indigo-950/85">
        <li className="rounded bg-white/80 px-2 py-0.5">
          DB:{" "}
          <span className="font-bold">{snapshot.databaseConfigured ? "configured" : "not configured"}</span>
        </li>
        <li className="rounded bg-white/80 px-2 py-0.5">
          OpenAI: <span className="font-bold">{snapshot.openAiConfigured ? "key present" : "no key"}</span>
        </li>
        <li className="rounded bg-white/80 px-2 py-0.5">
          SearchChunk rows: <span className="font-mono font-bold">{sc.totalChunks}</span>
        </li>
        <li className="rounded bg-white/80 px-2 py-0.5">
          With embeddings:{" "}
          <span className="font-mono font-bold">
            {sc.chunksWithNonEmptyEmbedding} ({(sc.embeddingCoverageRatio * 100).toFixed(1)}%)
          </span>
        </li>
      </ul>

      {sc.indexError ? (
        <p className="mt-2 rounded border border-rose-300/70 bg-rose-50 px-2 py-1 text-[9px] font-semibold text-rose-900">
          {sc.indexError}
        </p>
      ) : null}

      <div className="mt-3 grid gap-3 lg:grid-cols-2">
        <div className="rounded border border-indigo-200/60 bg-white/90 p-2">
          <h3 className="font-heading text-[10px] font-bold uppercase text-indigo-900/75">Indexed (Postgres)</h3>
          {sc.buckets.length ? (
            <ul className="mt-1 list-inside list-disc text-[9px] text-indigo-950/90">
              {sc.buckets.map((b) => (
                <li key={b.bucket}>
                  <span className="font-semibold">{b.bucket}</span> — {b.chunkCount} chunk(s)
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-1 text-[9px] text-indigo-900/80">No buckets (empty index or DB unreachable).</p>
          )}
        </div>

        <div className="rounded border border-indigo-200/60 bg-white/90 p-2">
          <h3 className="font-heading text-[10px] font-bold uppercase text-indigo-900/75">How AI uses sources today</h3>
          <p className="mt-1 text-[9px] leading-snug text-indigo-950/90">{snapshot.messageStudioSourceExplanation}</p>
          <p className="mt-2 text-[9px] font-bold text-indigo-900/80">Surfaces that query SearchChunk</p>
          <ul className="mt-0.5 list-inside list-disc text-[9px] text-indigo-950/85">
            {snapshot.searchChunkConsumers.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
          <p className="mt-2 text-[9px] text-indigo-900/75">
            Message Studio OpenAI:{" "}
            <span className="font-bold">{snapshot.messageStudioUsesSearchChunkRag ? "uses RAG" : "does not query SearchChunk"}</span>
            .
          </p>
        </div>
      </div>

      <div className="mt-3 grid gap-3 lg:grid-cols-2">
        <div className="rounded border border-indigo-200/60 bg-white/90 p-2">
          <h3 className="font-heading text-[10px] font-bold uppercase text-indigo-900/75">Available (repo registry)</h3>
          <ul className="mt-1 max-h-48 space-y-1 overflow-y-auto text-[9px] text-indigo-950/90">
            {available.map((s) => (
              <li key={s.id} className="rounded border border-indigo-100/80 bg-indigo-50/40 px-1.5 py-1">
                <span className="font-semibold">{s.title}</span>
                <div className="font-mono text-[8px] text-indigo-800/85">{s.location}</div>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded border border-indigo-200/60 bg-white/90 p-2">
          <h3 className="font-heading text-[10px] font-bold uppercase text-indigo-900/75">Not static / ingest / paste</h3>
          <ul className="mt-1 max-h-48 space-y-1 overflow-y-auto text-[9px] text-indigo-950/90">
            {registryGaps.map((s) => (
              <li key={s.id} className="rounded border border-amber-100/80 bg-amber-50/50 px-1.5 py-1">
                <span className="font-semibold">{s.title}</span>{" "}
                <span className="rounded bg-white/90 px-1 text-[8px] font-mono uppercase">{s.readiness}</span>
                <p className="mt-0.5 text-[8px] leading-snug text-indigo-900/85">{s.notes}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-3 rounded border border-indigo-200/60 bg-white/90 p-2">
        <h3 className="font-heading text-[10px] font-bold uppercase text-indigo-900/75">Missing / gap signals (computed)</h3>
        <ul className="mt-1 max-h-40 space-y-1 overflow-y-auto text-[9px] text-indigo-950/90">
          {snapshot.missingKnowledgeItems.map((m) => (
            <li
              key={m.id}
              className={
                m.severity === "warning"
                  ? "rounded border border-rose-200/80 bg-rose-50/80 px-1.5 py-1"
                  : "rounded border border-indigo-100/80 bg-indigo-50/50 px-1.5 py-1"
              }
            >
              <span className="font-semibold uppercase text-[8px] text-indigo-800/90">{m.severity}</span> {m.message}
              {m.remediation ? (
                <div className="mt-0.5 text-[8px] leading-snug text-indigo-900/85">→ {m.remediation}</div>
              ) : null}
            </li>
          ))}
        </ul>
      </div>

      {showFullOperatorPasteList ? (
        <div className="mt-3 rounded border border-indigo-200/60 bg-white/90 p-2">
          <h3 className="font-heading text-[10px] font-bold uppercase text-indigo-900/75">What operators must paste manually</h3>
          <ul className="mt-1 list-inside list-disc text-[9px] text-indigo-950/90">
            {snapshot.operatorMustPasteManually.map((line, i) => (
              <li key={i}>{line}</li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="mt-3 rounded border border-indigo-200/60 bg-white/90 p-2">
        <h3 className="font-heading text-[10px] font-bold uppercase text-indigo-900/75">Recommended ingestion plan (docs only)</h3>
        <ol className="mt-1 list-inside list-decimal space-y-1 text-[9px] text-indigo-950/90">
          {plan.map((p) => (
            <li key={p.step}>
              <span className="font-semibold">{p.title}</span> — <span className="font-mono text-[8px]">{p.action}</span>
              <div className="text-[8px] leading-snug text-indigo-900/85">{p.notes}</div>
            </li>
          ))}
        </ol>
        <p className="mt-2 text-[8px] text-indigo-900/75">
          ECC readiness:{" "}
          <Link href="/admin/workbench/email-command-center/readiness" className="font-bold underline">
            /readiness
          </Link>
          . Operator doc (repo): <code className="rounded bg-indigo-100/80 px-0.5">docs/email-ai-campaign-memory-readiness.md</code>
        </p>
      </div>
    </section>
  );
}
