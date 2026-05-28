import Link from "next/link";
import {
  loadLlmDraftReviewQueue,
  loadLlmPromptTemplateRegistry,
  summarizeDraftReviewQueue,
} from "@/lib/intelligence/llmDraftGateway";
import { LlmDraftReviewPanel } from "./LlmDraftReviewPanel";

export const dynamic = "force-dynamic";

export default async function LlmReviewQueuePage() {
  const summary = summarizeDraftReviewQueue();
  const queue = loadLlmDraftReviewQueue();
  const templates = loadLlmPromptTemplateRegistry();

  return (
    <div className="mx-auto max-w-7xl text-kelly-text">
      <header className="mb-6 border-b border-kelly-text/10 pb-4">
        <p className="font-body text-[10px] font-bold uppercase tracking-[0.22em] text-kelly-subtle">
          NSI-12 · LLM Draft Review Queue
        </p>
        <h1 className="font-heading text-2xl font-bold">Governed LLM Draft Review</h1>
        <p className="mt-2 max-w-4xl text-sm text-kelly-muted">
          All LLM and deterministic synthesis outputs route here. INTERNAL_DRAFT · NON_PUBLISHABLE ·
          HUMAN_REVIEW_REQUIRED. No export or publish controls — human promotion only.
        </p>
        <div className="mt-3 flex flex-wrap gap-2 text-xs">
          <Link href="/admin/intelligence/ai-tools" className="rounded border px-2 py-1 font-semibold text-kelly-navy">
            AI tools dashboard
          </Link>
          <Link href="/admin/intelligence/kim-hammer/audit-log" className="rounded border px-2 py-1 font-semibold text-kelly-navy">
            Audit log
          </Link>
          <Link href="/admin/intelligence/morning-brief" className="rounded border px-2 py-1 font-semibold text-kelly-navy">
            Morning brief
          </Link>
        </div>
      </header>

      <section className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-kelly-text/10 bg-white p-4">
          <p className="text-[10px] font-bold uppercase tracking-wider text-kelly-subtle">Pending review</p>
          <p className="mt-1 text-2xl font-bold text-kelly-navy">{summary.pendingCount}</p>
        </div>
        <div className="rounded-xl border border-rose-200/50 bg-rose-50/40 p-4">
          <p className="text-[10px] font-bold uppercase tracking-wider text-rose-900">High-risk drafts</p>
          <p className="mt-1 text-2xl font-bold text-rose-950">{summary.highRiskCount}</p>
        </div>
        <div className="rounded-xl border border-amber-200/50 bg-amber-50/40 p-4">
          <p className="text-[10px] font-bold uppercase tracking-wider text-amber-900">Needs citations</p>
          <p className="mt-1 text-2xl font-bold text-amber-950">{summary.needsCitationCount}</p>
        </div>
        <div className="rounded-xl border border-violet-200/50 bg-violet-50/40 p-4">
          <p className="text-[10px] font-bold uppercase tracking-wider text-violet-900">Hallucination warnings</p>
          <p className="mt-1 text-2xl font-bold text-violet-950">{summary.hallucinationWarningCount}</p>
        </div>
      </section>

      <section className="mb-6 rounded-xl border border-amber-300/50 bg-amber-50 p-4 text-xs text-amber-950">
        <h2 className="font-bold uppercase tracking-wider">Safety rules</h2>
        <ul className="mt-2 list-inside list-disc">
          <li>No draft becomes a claim, citation, task, briefing export, or social post without human review.</li>
          <li>Promotion creates workflow candidates only — not governed records.</li>
          <li>Deterministic fallback when no API key — no hard failures.</li>
          <li>{templates.templates.length} governed prompt templates registered.</li>
        </ul>
      </section>

      <section className="mb-6 grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-kelly-text/10 bg-white p-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-kelly-navy">Review queue priorities</h2>
          <ul className="mt-2 list-inside list-disc text-xs text-kelly-muted">
            {summary.reviewQueuePriorities.length > 0 ? summary.reviewQueuePriorities.map((line) => <li key={line}>{line}</li>) : <li>Queue empty.</li>}
          </ul>
        </div>
        <div className="rounded-xl border border-rose-200/50 bg-rose-50/40 p-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-rose-950">Unsafe draft warnings</h2>
          <ul className="mt-2 list-inside list-disc text-xs text-rose-900">
            {summary.unsafeDraftWarnings.length > 0 ? summary.unsafeDraftWarnings.map((line) => <li key={line}>{line}</li>) : <li>None flagged.</li>}
          </ul>
        </div>
      </section>

      <LlmDraftReviewPanel drafts={queue.drafts.filter((row) => !row.archived).slice(0, 20)} />
    </div>
  );
}
