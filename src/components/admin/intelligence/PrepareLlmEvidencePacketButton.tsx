"use client";

import { useState } from "react";
import Link from "next/link";

type PrepareResult = {
  ok: boolean;
  draftId?: string;
  message?: string;
  error?: string;
  reviewStatus?: string;
  liveLlmUsed?: boolean;
};

export function PrepareLlmEvidencePacketButton({
  briefId,
  label = "Prepare LLM Evidence Packet",
  className = "",
}: {
  briefId: string;
  label?: string;
  className?: string;
}) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PrepareResult | null>(null);

  async function handlePrepare(attemptLiveLlm: boolean) {
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/admin/intelligence/governed-llm-brief", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          briefId,
          operatorTriggered: true,
          attemptLiveLlm,
        }),
      });
      const data = (await res.json()) as PrepareResult;
      setResult(data);
    } catch {
      setResult({ ok: false, error: "Request failed" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={`rounded-lg border border-amber-300/50 bg-amber-50/40 p-3 ${className}`}>
      <p className="text-[10px] font-bold uppercase tracking-wider text-amber-950">
        INTERNAL_DRAFT · NON_PUBLISHABLE · HUMAN_REVIEW_REQUIRED
      </p>
      <p className="mt-1 text-xs text-kelly-muted">
        Operator-triggered only. Output routes to review queue — never auto-publishes or sends.
      </p>
      <div className="mt-2 flex flex-wrap gap-2">
        <button
          type="button"
          disabled={loading}
          onClick={() => handlePrepare(false)}
          className="rounded border border-kelly-navy/30 bg-kelly-navy px-3 py-1 text-xs font-bold text-white disabled:opacity-50"
        >
          {loading ? "Preparing…" : label}
        </button>
        <button
          type="button"
          disabled={loading}
          onClick={() => handlePrepare(true)}
          className="rounded border border-violet-700/30 bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-950 disabled:opacity-50"
        >
          Generate Internal LLM Draft for Review
        </button>
      </div>
      {result ? (
        <div className={`mt-2 text-xs ${result.ok ? "text-emerald-900" : "text-rose-900"}`}>
          {result.ok ? (
            <>
              <p>{result.message}</p>
              {result.draftId ? (
                <p className="mt-1">
                  Draft: {result.draftId} · Status: {result.reviewStatus}
                  {result.liveLlmUsed ? " · LLM assisted" : ""}
                </p>
              ) : null}
              <Link
                href="/admin/intelligence/llm-review-queue"
                className="mt-1 inline-block font-semibold text-kelly-navy underline"
              >
                Open review queue →
              </Link>
            </>
          ) : (
            <p>{result.error ?? "Failed"}</p>
          )}
        </div>
      ) : null}
    </div>
  );
}
